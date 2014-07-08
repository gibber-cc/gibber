!function() {
  var GE = Gibber.Environment
  
  var Browser = {
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
      
      btns[0].click()
      
      $( '.search input').on( 'keypress', function(e) { if( e.keyCode === 13 ) { $('.browserSearch').click() }})
      
      $( '.browserSearch' ).on( 'click', GE.Browser.search )
    },
    open: function() {
      var col = GE.Layout.addColumn({ header:'Browse Giblets' })
      
      //col.element.addClass( 'browser' )
      
      col.bodyElement.remove()
      
      $.ajax({
        url: GE.SERVER_URL + "/browser",
        dataType:'html'
      })
      .done( function( data ) {
        var browser = $( data ), cells
        
        $( col.element ).append( browser[0] );
        $('head').append( browser[1] )
        $( '#search_button' ).on( 'click', GE.Browser.search )
        col.bodyElement = browser;
        GE.Layout.setColumnBodyHeight( col )
        
        cells = browser.find('td')
        
        var types = [ 'searchHEADER','search','tutorialsHEADER','audio', '_2d', '_3d', 'misc', 'userHEADER','recent', 'userfiles' ], prev
        for( var i = 0; i < cells.length; i++ ) {
          (function() {
            var cell = cells[ i ]
            if( $(cell).hasClass('browserHeader') ) return;
            
            $(cell).find('h3').on('click', function() { 
              var div = $(cell).find('div')
              div.toggle()
              if( div.is(':visible') ) {
                $(this).find('#browser_updown').html('&#9652;') 
              }else{
                $(this).find('#browser_updown').html('&#9662;') 
              }
            })
            
            var links = $(cell).find('li')
            for( var j = 0; j < links.length; j++ ) {
              (function() {
                var num = j, type = types[ i ], link = links[j]
                if( typeof Gibber.Environment.Browser.files[ type ] !== 'undefined' ) {
                  var pub = Gibber.Environment.Browser.files[ type ][ num ], obj, id
                  
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
      
      console.log( data )
      
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
          //console.log( d )
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
  }
  
  GE.Browser = Browser
}()
