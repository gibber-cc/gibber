( function() {

"use strict"

var shapes = {
      Square: { x:0, y:0, size: 200, fill:'gray', stroke:null },
      Circle: { x:0, y:0, size: 200, fill:'gray', stroke:null },
      Polygon: { x:0, y:0, size: 200, sides:5, fill:'gray', stroke:null },
    },
    mappingProperties = {
      x: {
        min: 0, max:500,
        output: Gibber.LINEAR,
        wrap: true,       
        timescale: 'graphics',
      },
      y: {
        min: 0, max:500,
        output: Gibber.LINEAR,
        wrap: true,       
        timescale: 'graphics',
      },
      size: {
        min: 0, max:500,
        output: Gibber.LINEAR,
        wrap: true,       
        timescale: 'graphics',
      },
    },
    processArgs = function( args, type, shape ) {
      var _args = Gibber.processArguments( args, type ),
         out
  
      if( typeof args[0] === 'object' ) {
        out = []
        for( var argsKey in shape ) {
          var pushValue = typeof args[0][ argsKey ] !== 'undefined' ? args[0][ argsKey ] : shape[ argsKey ]
          out.push( pushValue )
        }s 
      }else if( Array.isArray( args )){
        out = args
      }else{
        out = []
        for( var argsKey in shape ) {
          out.push( shape[ argsKey ] )
        }
      }
  
      return out
    }


var Shapes = Gibber.Graphics.Shapes2D = {},
    cnvs = null,
    SHAPE = {
      test: 1,
      remove: function() {
        this.canvas.graph.splice( this.canvas.graph.indexOf( this ), 1 )
      },
      clear: function() {
        if( this.stroke !== null ) {
          var _x, _y, _w, _h;

          _x = this.x - this.size / 2 - this.lineWidth
          _y = this.y - this.size / 2 - this.lineWidth
          _w = this.size + this.lineWidth * 2
          _h = this.size + this.lineWidth * 2
          this.canvas.clearRect( _x, _y, _w, _h ); 
          
        }else{
          console.log( 'regular clear' )
          this.canvas.clearRect( this.x - this.size / 2, this.y - this.size / 2, this.size, this.size )
        }
      },
      changeZ : function( v ) {
        z  = v
      }
    }

for( var key in shapes ) {
  
  (function() {
    var type = key,
        shape = shapes[ type ],
    
    constructor = function() {
      if( !Gibber.Graphics.canvas2d ) { 
        cnvs = Canvas() 
      }else{
        cnvs = Gibber.Graphics.canvas2d
      }

      var args = processArgs( arguments, type, shape ) 

      this.name = type
      this.canvas = cnvs

      var x = 200, y = 200, size = 200,
          z = this.canvas.graph.length;

      Object.defineProperties( this, {
        x: {
          configurable:true, 
          get: function() { return x },
          set: function(v) {
            this.clear()
            x = v;
          }
        },
        y: { 
          configurable:true, 
          get: function() { return y },
          set: function(v) { this.clear(); y = v; }
        },
        size: { 
          configurable:true, 
          get: function() { return size },
          set: function(v) { this.clear(); size = v; }
        },
        z: { 
          configurable:true, 
          get: function() { return z },
          set: function(v) { 
            this.canvas.reorderGraph() 
            this.canvas.graph.splice( this.canvas.graph.indexOf( this ),1 )
            this.canvas.graph.splice( v, 0, this )
            z = v
          }
        },
      })

      for( var prop in mappingProperties ) {
        ( function( obj ) {
          var property = mappingProperties[ prop ],
              mapping = $.extend( {}, property, {
                Name  : prop.charAt(0).toUpperCase() + prop.slice(1),
                name  : prop,
                type  : 'mapping',
                value : obj[ prop ], 
                object: obj,
                targets:[],
              }),
              oldSetter = obj.__lookupSetter__( prop ),
              oldGetter = obj.__lookupGetter__( prop )

          Object.defineProperty( obj, prop, {
            get: function() { return oldGetter.call( obj ) },
            set: function(v) {
              if( typeof v === 'object' && v.type === 'mapping' ) {
                Gibber.createMappingObject( mapping, v )
              }else{
                if(mapping.mapping) mapping.mapping.remove()

                mapping.value = v
                
                oldSetter.call( obj, mapping.value )
              }
            }
          })
        })( this )
      }
      this.draw = Shapes.Draw[ type ]
      this.fill = 'gray'
      this.stroke = null 
      this.lineWidth = 1
      this._update = function() {}
      this.canvas.graph.push( this )
    }

    constructor.prototype = SHAPE

    Shapes[ type ] = function() { // wrap so no new keyword is required
      return Gibber.construct( constructor, arguments )
    }
    
  })()

}

Shapes.Draw = {
  Square:  function() {
    this.canvas.square( this.x - this.size / 2, this.y - this.size / 2, this.size )
    if( this.fill ) this.canvas.fill( this.fill )
    if( this.stroke ) this.canvas.stroke( this.stroke )
  },
  Circle: function() {
    this.canvas.beginPath()
    this.canvas.arc( this.x, this.y, this.size / 2, 0, 360)
    this.canvas.closePath()
    if( this.fill ) this.canvas.fill( this.fill )
    if( this.stroke ) this.canvas.stroke( this.stroke )
  }
}

$.extend( window, Shapes )
})()
