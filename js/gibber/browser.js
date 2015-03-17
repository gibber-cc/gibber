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
          
          btn.state = num === 1
          if( btn.state ) $( btn ).css({ backgroundColor:'#666' })
          
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
    column: null,
    userfiles: null,
    currentBrowserSection: null,
    isLoaded: false,
    open: function() {
      GE = Gibber.Environment
      
      this.column = GE.Layout.addColumn({ header:'Browse Giblets' })

      $.ajax({
        url: GE.SERVER_URL + "/browser",
        dataType:'html'
      })
      .done( Browser.onLoad )
      
      $.subscribe( '/account/login', function( _name ) {
        $.ajax({
          type:'POST',
          url: GE.SERVER_URL + "/userfiles",
          data:{},
          dataType:'json',
        })
        .done( GE.Browser.showUserFiles )
      })
      
      $.subscribe( '/account/logout', function( _name ) {
        $( '#browser_userfiles' ).find( 'li' ).remove()
        GE.Browser.files.userfiles.length = 0
      })
    },
    
    _onload : null, 
    onLoad: function( data ) {
      var browserHTML = $( data )
      
      Browser.createLayout( browserHTML )

      GE.Browser.setupSearchGUI()
      
      Browser.isLoaded = true
      
      if( Browser._onload !== null ) {
        Browser._onload()
        Browser._onload = null
      }
    },
    
    createLayout : function( browserHTML ) {      
      $( Browser.column.bodyElement ).append( browserHTML[0] )
      $( 'head' ).append( browserHTML[1] )
      $( '#search_button' ).on( 'click', Browser.search )
      GE.Layout.setColumnBodyHeight( Browser.column )
      
      $( '#browser_tutorials_button' ).on( 'click', Browser.openBrowserSection.bind( Browser, 'tutorials' ) )
      $( '#browser_demos_button' ).on(     'click', Browser.openBrowserSection.bind( Browser, 'demos' ) )
      $( '#browser_search_button' ).on(    'click', Browser.openBrowserSection.bind( Browser, 'search' ) )
      $( '#browser_recent_button' ).on(    'click', Browser.openBrowserSection.bind( Browser, 'recent' ) )
      $( '#browser_user_button' ).on(      'click', Browser.openBrowserSection.bind( Browser, 'user' ) )
      
      Browser.currentBrowserSection = $('#browser_demos')
      Browser.createLinks()
    },
    
    createLinks : function() {
      var linksDivs = $( '.browserLinks' ),
          types = [ 'demosAudio', 'demosVisual', 'demosAudiovisual','audio', '_2d', '_3d', 'misc', 'recent' ],
          prev
          
      for( var i = 0; i < linksDivs.length; i++ ) {
        (function() {
          var cell = linksDivs[ i ]
          
          var links = $( cell ).find( 'li' )
          
            for( var j = 0; j < links.length; j++ ) {
            (function() {
              // TODO: could this be any hackier???
              var num = j, type = types[ i ], link = links[j], demoTypeName = type.slice(5).toLowerCase()
              var pubCategory = Browser.files[ type ] || Browser.files.demos[ demoTypeName ]
              
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
    },
    
    showUserFiles: function( data ) {
      if( !Browser.isLoaded ) {
        Browser._onload = Browser.showUserFiles.bind( Browser, data )
        return
      }
      
      var userdiv = $( '#browser_userfiles' ),      
          list = $( '<ul>' ),
          prev
      
      userdiv.empty()
      // var edit = $('<button>edit files</button>')
      //   .css({ right:0, marginLeft:'4em', position:'relative' })
      //   .on('click', function() { Browser.showFileEditingButtons() })
      //   
      // $('#browser_user .browserHeader h2').append( edit )
      
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
    },
    
    showFileEditingButtons: function() {
      var list = $( '#browser_userfiles ul li')
      
      for( var i = 1; i < list.length; i++ ) {
        !function() {
          var listData = Browser.files.userfiles[ i ],
              li = list[ i ]
            
          $(li).append( $( '<button>e</button>' ).css({ float:'right', marginLeft:'.5em', position:'relative', height:$( li ).height() }) )
          var deleteBtn = $( '<button>x</button>' )
            .css({ float:'right', height:$( li ).height() })
            .on( 'click', function( e ) {
              e.stopPropagation()
              var msgtxt = "Are you sure you want to delete " + listData.id.split('/')[2] + "? This operation cannot be undone."
              
              GE.Message.confirm( msgtxt, 'cancel', 'delete' )
                .done( function( shouldDelete ) {
                  if( shouldDelete ) {
                    $.ajax({
                      type:'POST',
                      url: GE.SERVER_URL + "/deleteUserFile",
                      data:listData,
                      dataType:'json',
                    })
                    .then( function( data ) {
                      console.log( "DELETED?", data )
                      li.remove()
                    },
                    function(e) { 
                      console.log("SOME TYPE OF ERROR", e )
                    })
                  }
                })
            })
          
          $(li).append( deleteBtn )
        }()
      }
    },
    
    openBrowserSection: function( section ) {
      GE.Browser.currentBrowserSection.hide()
      GE.Browser.currentBrowserSection = $( '#browser_' + section )
      GE.Browser.currentBrowserSection.show()
    },

    // publication name : author : rating : code fragment?
    search : function(e) {
      var btns = $( '.searchOption' ),
          btnText = [ 'tags','code','author' ],
          queryFilter = 'code', query = null
      
      query = $( '.browser .search input' ).val()
      
      if( query === '' ) {
        GE.Message.post( 'You must type in a search query.' )
        return
      }
      
      for( var i = 0; i < btns.length; i++ ) {
        if( btns[ i ].state ){
          queryFilter = btnText[ i ]
          break;
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
    openDemo : function( addr, hasGraphics ) {
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
          
          if( data.language && col.mode !== data.language ) {
            col.mode === GE.modes.nameMappings[ data.language ] || data.language
            col.editor.setOption( 'mode', GE.modes.nameMappings[ col.mode ] )
            col.setLanguageSelect( data.language )
          }else if ( typeof data.language === 'undefined' && col.mode !== 'javascript' ) {
            col.editor.setOption( 'mode', 'javascript' )
            col.setLanguageSelect( 'javascript ')
          }

          Browser.demoColumn = col
          
          if( hasGraphics ) {
            GE.Layout.textBGOpacity( .6 )
          }else{
            GE.Layout.textBGOpacity( 0 )
          }
          
          Gibber.clear()
          
          if( Gibber.Environment.Welcome.div !== null ) {
            GE.Welcome.close()
          }
          
          //run: function( column, script, pos, cm, shouldDelay ) {
          GE.modes.javascript.run( 
            col, 
            data.text, 
            { 
              start:{ line:0, ch:0 },
              end:{ line:col.editor.lastLine(), ch:0 }
            }, 
            col.editor, 
            true 
          )
          
          //if( d.author === 'gibber' && d.name.indexOf('*') > -1 ) d.name = d.name.split( '*' )[0] // for demo files with names like Rhythm*audio*
          return false
        }
      )
    },
  }
  
  return Browser
}