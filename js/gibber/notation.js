module.exports = function( Gibber, Environment) {
  // TODO: some effects need to use entire lines... for example, transfrom
  // can't apply to inline elements
  
  var GEN = {
    isRunning: false,
    notations: [],
    fps: 20,
    clear: null,
    filterString: [],
    
    features:{ 'seq':true, 'reactive':true },
    
    enabled: {},
    
    on: function() {
      console.log( "NOTATIONS ON" )
      for( var i = 0; i < arguments.length; i++ ) {
        var name = arguments[ i ]
        
        if( this.features[ name ] && ! this.enabled[ name ] ) {
          var func = this.features[ name ]
          if( typeof func === 'function' ) {
            if( Gibber.scriptCallbacks.indexOf( func ) === -1 ) {
              Gibber.scriptCallbacks.push( func )
              this.enabled[ name ] = func
            }
          } else {
            this.enabled[ name ] = true
          }
        }
      }
    },
    
    off: function( name ) {
      if( this.enabled[ name ] ) {
        var val = this.enabled[ name ],
            idx = Gibber.scriptCallbacks.indexOf( this.enabled[ name ] )
        
        if( typeof val === 'function' ) {    
          Gibber.scriptCallbacks.splice( idx, 1 )
        }
        
        delete this.enabled[ name ]
      }
    },
    
    add: function( obj ) {
      this.notations.push( obj )
      console.log( this.notations, this, obj, GEN === Gibber.Environment.Notation )
      if( !this.isRunning ) {
        this.init()
      }
    },
    remove: function( obj ) {
      console.log("CALLING REMOVE")
      //this.notations.splice( this.notations.indexOf( obj ), 1 )
    },
    init: function() {
      var func = function() {
        //  console.log(" RUNNING NOTATION UPDATE ", GEN.notations )
        var filtered = []
        for( var i = 0; i < GEN.notations.length; i++ ) {
          var notation = GEN.notations[ i ]
              
          notation.update()
          
          if( notation.text.filterString && notation.text.filterString.length > 0 ) {
            if( filtered.indexOf( notation.text ) === -1 ) {
              filtered.push( notation.text )
            }
          }
        }
                
        for( var j = 0; j < filtered.length; j++ ) {
          var filter = filtered[ j ]
          $( filter.class ).css( '-webkit-filter', filter.filterString.join(' ') )
          filter.filterString.length = 0
        }

        GEN.clear = future( func, ms( 1000 / GEN.fps ) )
      }
      func()
      
      this.isRunning = true
      
      $.subscribe( '/gibber/clear', function( e ) {
        GEN.isRunning = false
      })
    },
    
    properties: {
      background: {
        min:0, max:255, value:0, timescale:'notation',
        set: function(v) {
          this.___background___  = Math.round( v )
          var backgroundString = 'rgb(' + this.___background___ +',' + this.___background___ +',' + this.___background___ + ')'
        
          $( this.class ).css( 'background', backgroundString )
        },
      },
      fontSize: {
        min:.5, max:3, value:1, timescale:'notation',
        set: function(v) {
          this.___fontSize___  = v
          var outputString = v + 'em'
        
          $( this.class ).css( 'font-size', outputString )
        },
      },
      scale : { 
        min:.5, max:5, value:1, timescale:'notation',
        set: function(v) {
          this.___scale___  = v
          var outputString = 'scale(' + v + ')'
          //transform: scale(0.5);
          //console.log( outputString )

          $( this.class ).css( 'transform', outputString )
        },
      },
      color: {
        min:0, max:255, value:0, timescale:'notation',
        set: function(v) {
          this.___color___  = Math.round( v ) 
          var outputString = 'rgb(' + this.___color___ +',' + this.___color___ +',' + this.___color___ + ')'
        
          $( this.class ).css( 'color', outputString )
        },
      },
      borderColor: { // TODO: NEED TO MARK LINES INSTEAD OF TOKENS
        min:0, max:255, value:0, timescale:'notation',
        set: function(v) {
          this.___borderColor___  = Math.round( v )
          var outputString = 'rgb(' + this.___borderColor__ +',' + this.___borderColor__ +',' + this.___borderColor__ + ')'
        
          $( this.class ).css({ 'borderColor': outputString, borderWidth:'2px' })
        },
      },
      opacity: {
        min:0, max:1, value:0, timescale:'notation',
        set: function(v) {
          this.___opacity___  = v
        
          $( this.class ).css( 'opacity', this.___opacity___ )
        },
      },
      fontWeight: {
        min:100, max:900, value:500, timescale:'notation',
        set: function(v) {
          this.___fontWeight___  = Math.round( v )
        
          $( this.class ).css( 'font-weight', this.___fontWeight___  )
        },
      },
      left: {
        min:0, max:5, value:0, timescale:'notation',
        set: function(v) {
          this.___left___  = v + 'em'
        
          $( this.class ).css( 'padding-left', this.___left___  )
        },
      },
      letterSpacing: {
        min:0, max:2, value:0, timescale:'notation',
        set: function(v) {
          this.___letterSpacing___  = v + 'em'
        
          $( this.class ).css( 'letter-spacing', this.___letterSpacing___  )
        },
      },
      // filters
      blur: {
        min:0, max:20, value:0, timescale:'notation',
        set: function(v) {
          this.___blur___  = Math.round( v ) 
          var outputString = 'blur(' + v + 'px)'
          
          if( !this.filterString ) this.filterString = []
          this.filterString.push( outputString )
        },
      },
      hue: {
        min:0, max:360, value:0, timescale:'notation',
        set: function(v) {
          this.___blur___  = Math.round( v ) 
          var outputString = 'hue-rotate(' + v + 'deg)'
          
          if( !this.filterString ) this.filterString = []
          this.filterString.push( outputString )
        },
      },
      invert: {
        min:0, max:100, value:0, timescale:'notation',
        set: function(v) {
          this.___invert___  = Math.round( v ) 
          var outputString = 'invert(' + v + '%)'

          if( !this.filterString ) this.filterString = []
          this.filterString.push( outputString )
        },
      },
      saturate: {
        min:0, max:300, value:0, timescale:'notation',
        set: function(v) {
          this.___saturate___  = Math.round( v ) 
          var outputString = 'saturate(' + v + '%)'

          if( !this.filterString ) this.filterString = []
          this.filterString.push( outputString )
        },
      },
      brightness: {
        min:0, max:300, value:0, timescale:'notation',
        set: function(v) {
          this.___brightness___  = Math.round( v ) 
          var outputString = 'brightness(' + v + '%)'

          if( !this.filterString ) this.filterString = []
          this.filterString.push( outputString )
        },
      },
    }
  }
  
  return GEN
}