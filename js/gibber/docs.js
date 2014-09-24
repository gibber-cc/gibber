module.exports = function( Gibber ) {
  var GE = Gibber.Environment
  
  var Docs = {
    files: {},
    open : function() {
      this.col = GE.Layout.addColumn({ header:'Reference' })

      this.col.bodyElement.remove()
    
      this.getIndex()
    },
    showTOC : function( section, btn ) {
      if( typeof btn.isShowing === 'undefined' ) {
        btn.isShowing = 0
      }
    
      btn.isShowing = !btn.isShowing
    
      var sec = $( '#'+section ).find( '.docsBody' ).toggle()
    
      $( btn ).text( btn.isShowing ? 'hide' : 'show' )
    },
    getIndex : function() {
      $( '#docs' ).empty()
      $.ajax({
        url: GE.SERVER_URL + "/documentation",
        dataType:'html'
      })
      .done( function( data ) {
        var docs = $( data )
        $( GE.Docs.col.element ).append( docs )
        GE.Docs.col.bodyElement = docs
        GE.Layout.setColumnBodyHeight( GE.Docs.col )
      }) 
    },
    openFile : function( group, name ) {
      console.log( "OPENING", group, name )
      $.ajax({
        url:'docs/?group=' + group + '&file='+name,
        dataType:'html'
      })
      .done( function( data ) {
        var docs = $( data )
        $( '#docs' ).empty()
        $( '#docs' ).append( $('<button>').text('Back To Table of Contents')
                            .on('click', function() { $('#docs').remove(); GE.Docs.getIndex() } ) ) 
        $( '#docs' ).append( docs )
        GE.Docs.bodyElement = docs
        GE.Layout.setColumnBodyHeight( GE.Docs.col )
      }) 
    },
  } 
  
  return Docs
}

