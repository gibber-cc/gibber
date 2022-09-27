const __Storage = {
  values : null,
  savedText: null,
  init : function() {
    Storage.prototype.setObject = function( key, value ) { 
      this.setItem( key, JSON.stringify( value ) )
    }
    Storage.prototype.getObject = function( key ) { 
      var value = this.getItem( key ); return value && JSON.parse( value )
    }

    this.values = localStorage.getObject( 'gibber2' )

    if ( !this.values ) {
      this.values = {
        onload:null,
        savedText:null
      }
      this.save()
    }      
  },

  save : function() {
    localStorage.setObject( "gibber2", this.values )
  },

  runUserSetup: function() {
    if( this.values.savedText ) {
      try{
        eval( this.values.savedText )
      }catch(e) {
        console.log( 'There was an error running your preload code:\n' + __Storage.values.savedText )
      }
    }
  }
}

module.exports = __Storage
