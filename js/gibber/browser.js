module.exports = function( Gibber ) {
  var GE,
      $ = require( './dollar' )
      
  var Browser = {
    demoColumn: null,
    userFilesLoaded: false,
    setupSearchGUI : function() {
      var btns = $( '.searchOption' )

      for( var i = 0; i < btns.length; i++ ) {
        !function() {
          var num = i, btn = btns[ num ]
          
          btn.state = 0
          
          $( btn ).on( 'click', function() {
            for( var j = 0; j < btns.length; j++ ) {
              var bgColor
              
              btns[ j ].state = btns[ j ] === btn
              
              bgColor = btns[ j ].state ? '#666' : '#000'
              
              $( btns[ j ] ).css({ backgroundColor:bgColor })
            }
          })
          
        }()
      }
      
      //btns[0].click()
      
      $( '.search input').on( 'keypress', function(e) { if( e.keyCode === 13 ) { $('.browserSearch').click() }})
      
      $( '.browserSearch' ).on( 'click', GE.Browser.search )
    },
    
    currentBrowserSection: null,
    openBrowserSection: function( section ) {
      GE.Browser.currentBrowserSection.hide()
      
      GE.Browser.currentBrowserSection = $( '#browser_' + section )
      
      GE.Browser.currentBrowserSection.show()
    },
    
    open: function() {
      GE = Gibber.Environment
      
      var col = GE.Layout.addColumn({ header:'Browse Giblets' })
      
      //col.element.addClass( 'browser' )
      
      //col.bodyElement.remove()
      
      $.ajax({
        url: GE.SERVER_URL + "/browser",
        dataType:'html'
      })
      .done( function( data ) {
        var browser = $( data ), cells, lastDiv
        
        $( col.bodyElement ).append( browser[0] )
        $( 'head' ).append( browser[1] )
        $( '#search_button' ).on( 'click', GE.Browser.search )
        GE.Layout.setColumnBodyHeight( col )
        
        linksDivs = $( '.browserLinks' )
        headers = $( '.browserHeading' )
        
        GE.Browser.currentBrowserSection = $('#browser_demos')
        
        $('#browser_tutorials_button').on( 'click', GE.Browser.openBrowserSection.bind( GE.Browser, 'tutorials') )
        $('#browser_demos_button').on( 'click', GE.Browser.openBrowserSection.bind( GE.Browser, 'demos') )
        $('#browser_search_button').on( 'click', GE.Browser.openBrowserSection.bind( GE.Browser, 'search') )
        $('#browser_recent_button').on( 'click', GE.Browser.openBrowserSection.bind( GE.Browser, 'recent') )
        $('#browser_user_button').on( 'click', function() { GE.Browser.openBrowserSection('user') })
        
        var types = [ 'demosAudio', 'demosVisual', 'demosAudiovisual','audio', '_2d', '_3d', 'misc', 'recent' ], prev
        for( var i = 0; i < linksDivs.length; i++ ) {
          (function() {
            var cell = linksDivs[ i ]
            
            var links = $( cell ).find( 'li' )
            
              for( var j = 0; j < links.length; j++ ) {
              (function() {
                // TODO: could this be any hackier???
                var num = j, type = types[ i ], link = links[j], demoTypeName = type.slice(5).toLowerCase()
                var pubCategory = Gibber.Environment.Browser.files[ type ] || Gibber.Environment.Browser.files.demos[ demoTypeName ]
                
                //console.log( "category", type, pubCategory )
                if( typeof pubCategory !== 'undefined' ) {
                  var pub = pubCategory[ num ], obj, id
                  
                  if( typeof pub === 'undefined' ) {
                    console.log( 'UNDEFINED', type, num )
                    return;
                  }
                  
                  obj = pub.value || pub, // recently added has slightly different format
                  id = pub.id || obj._id  // see above
                      
                  $( link ).on( 'mouseover', function() {
                    $( link ).css({ background:'#444' })
                    if( prev ) {
                      $( prev ).css({ background:'transparent' })
                    }
                    prev = link
                    $( '#browser_title' ).text( id.split('/')[2].split('*')[0] )//$( link ).text() )
                    $( '#browser_notes' ).text( obj.notes )
                    $( '#browser_tags' ).text( obj.tags ? obj.tags.toString() : 'none' )
                    $( '#browser_author' ).text( id.split('/')[0] )
                  })
                }
              })()
            }
          })()
        }
        //$('#browser_audio_header').on('click', GE.Browser.updown)
        
        $.subscribe( '/account/login', function( _name ) {
          $.ajax({
            type:'POST',
            url: GE.SERVER_URL + "/userfiles",
            data:{},
            dataType:'json',
          })
          .done( function( data ) {
            var userdiv = $( '#browser_userfiles' )
            console.log( userdiv )
            userdiv.empty()
            
            var list = $( '<ul>' ), prev
            
            for( var j = 0; j < data.files.length; j++ ) {
              !function() {
                var num = j,
                    file = data.files[ num ],
                    obj = file.value,
                    id = file.id,
                    link
                
                GE.Browser.files.userfiles.push( file )
                
                link = $('<li>')
                  .text( id.split('/')[2] )
                  .on( 'click', function() {
                    Gibber.Environment.Browser.openCode( id )
                  })
                
                $( link ).on( 'mouseover', function() {
                  $( link ).css({ background:'#444' })
                  if( prev ) {
                    $( prev ).css({ background:'transparent' })
                  }
                  prev = link
                  $( '#browser_title' ).text( id.split('/')[2].split('*')[0] )//$( link ).text() )
                  $( '#browser_notes' ).text( obj.notes )
                  $( '#browser_tags' ).text( obj.tags ? obj.tags.toString() : 'none' )
                  $( '#browser_author' ).text( id.split('/')[0] )
                })
                
                list.append( link )
              }()
            }
            userdiv.append( list )
          })
        })
        
        $.subscribe( '/account/logout', function( _name ) {
          $( '#browser_userfiles' ).find( 'li' ).remove()
          GE.Browser.files.userfiles.length = 0
        })
        
        GE.Browser.setupSearchGUI()
      })
    },

    // publication name : author : rating : code fragment?
    search : function(e) {
      var btns = $( '.searchOption' ),
          btnText = [ 'tags','code','author' ],
          queryFilter = '', query = null
      
      query = $( '.browser .search input' ).val()
      
      if( query === '' ) {
        GE.Message.post( 'You must type in a search query.' )
        return
      }
      
      for( var i = 0; i < btns.length; i++ ) {
        if( btns[ i ].state ){
          queryFilter = btnText[ i ]
        }
      }
      
      var data = {
        'query': query,
        filter:  queryFilter 
      }
      
      $( '.searchResults' ).remove()
      
      // var sr = $('<div class="searchResults">').css({ width:'5em', height:'5em', display:'block', position:'relative', 'box-sizing': 'content-box !important' }) 
      // var spinner = GE.Spinner.spin( sr )
      
      $( '.browser .search td' ).append( $('<p class="searchResults">Getting search results...</p>'))
      
      
      //var data = { query:$( '#search_field' ).val() }
      $.post(
        GE.SERVER_URL + '/search',
        data,
        function ( data ) {
          
          $('.searchResults').remove()
          
          var results = $( '<ul class="searchResults">' ), 
              count = 0
              
          //console.log( data )
          if( data.error ) {
            console.error( data.error )
            return  
          }
          for( var i = 0; i < data.rows.length; i++ ) {
            count++
            if( data.rows[i] === null ) continue; // sometimes things go missing...
            
            (function() {
              var d = JSON.parse( data.rows[ i ] ),
                  pubname = d._id,
                  li = $( '<li>' )
              
              $('.searchResults').remove()
                  
              li.html( pubname )
                .on( 'click', function() { 
                  GE.Browser.openCode( pubname ) 
                })
                .hover( function() { 
                  li.css({ backgroundColor:'#444'})
                  GE.Browser.displayFileMetadata( d )
                }, 
                  function() { li.css({ backgroundColor:'rgba(0,0,0,0)' })
                })
                .css({ cursor: 'pointer' })
                
              results.append( li )
            })()
          }
          
          var h4 = $('<h4 class="searchResults">Results</h4>').css({ display:'inline-block', width:'10em', marginBottom:0 }),
              clearBtn = $('<button class="searchResults">clear results</button>').on('click', function() { 
                $('.searchResults').remove()
                clearBtn.remove()
                h4.remove()
              })
              
          $( '.browser .search td' ).append( h4, clearBtn )
          
          if( data.rows.length === 0 ) {
            $( '.browser .search td' ).append( $('<p class="searchResults">No results were found for your search</p>') )
          }
          
          $( '.browser .search td' ).append( results )
        },
        'json'
      )
      
    },
    
    displayFileMetadata: function( obj ) {
      $( '#browser_title' ).text( obj._id.split('/')[2].split('*')[0] )//$( link ).text() )
      $( '#browser_notes' ).text( obj.notes )
      $( '#browser_tags' ).text( obj.tags ? obj.tags.toString() : 'none' )
      $( '#browser_author' ).text( obj._id.split('/')[0] )
    },
    
    openCode : function( addr ) {
      // console.log( "ADDR", addr )
      $.post(
        GE.SERVER_URL + '/retrieve',
        { address:addr },
        function( d ) {
          var data = JSON.parse( d ),
              col = GE.Layout.addColumn({ fullScreen:false, type:'code' })
              
          col.editor.setValue( data.text )
          col.fileInfo = data
          col.revision = d // retain compressed version to potentially use as attachement revision if publication is updated
          
          //if( d.author === 'gibber' && d.name.indexOf('*') > -1 ) d.name = d.name.split( '*' )[0] // for demo files with names like Rhythm*audio*
          return false
        }
      )
    },
    openDemo : function( addr ) {
      // console.log( "ADDR", addr )
      $.post(
        GE.SERVER_URL + '/retrieve',
        { address:addr },
        function( d ) {
          //console.log( d )
          var data = JSON.parse( d ),
              col = Browser.demoColumn === null || Browser.demoColumn.isClosed ? GE.Layout.addColumn({ fullScreen:false, type:'code' }) : Browser.demoColumn
              
          col.editor.setValue( data.text )
          col.fileInfo = data
          col.revision = d // retain compressed version to potentially use as attachement revision if publication is updated

          Browser.demoColumn = col
          
          Gibber.clear()
          
          GE.modes.javascript.run( col, data.text, { start:{ line:0, ch:0 }, end:{ line:col.editor.lastLine(), ch:0 }}, col.editor, true )
          
          //if( d.author === 'gibber' && d.name.indexOf('*') > -1 ) d.name = d.name.split( '*' )[0] // for demo files with names like Rhythm*audio*
          return false
        }
      )
    },
  }
  
  return Browser
}