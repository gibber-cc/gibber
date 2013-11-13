( function() {
  "use strict"
  
  var _m = null,
      mappingProperties = {
        x : {
          min:0, max:1,
          timescale:'interface',
          output: Gibber.LINEAR
        },
        y : {
          min:0, max:1,
          timescale:'interface',
          output: Gibber.LINEAR
        },
      }


  window.Mouse = Gibber.Environment.Mouse = (function() {
    
    if( _m !== null ) return _m

    _m = {} 

    $.extend( _m, {
      x:0, y:0, prevX:0, prevY:0,
      _onmousemove : function( e ) {
        _m.prevX = _m.x
        _m.prevY = _m.y
        _m.x = e.pageX / _m.ww
        _m.y = e.pageY / _m.wh

        if( typeof _m.onvaluechange === 'function' ) {
          _m.onvaluechange()
        }
      },
       
      on: function() {
        _m.ww = $( window ).width()
        _m.wh = $( window ).height()
        $( window ).on( 'mousemove', _m._onmousemove )
      },
      off: function() { $( window ).off( 'mousemove', _m._onmousemove  ) },

    })

    for( var prop in mappingProperties ) {
      ( function( obj ) {
        var _prop = prop,
            property = mappingProperties[ _prop ],
            mapping = $.extend( {}, property, {
              Name  : _prop.charAt(0).toUpperCase() + _prop.slice(1),
              name  : _prop,
              type  : 'mapping',
              value : obj[ _prop ], 
              object: obj,
              targets:[],
            }),
            oldSetter = obj.__lookupSetter__( _prop )
            // oldGetter = obj.__lookupGetter__( prop )

        Object.defineProperty( obj, _prop, {
          get: function() { return mapping.value },
          set: function(v) {
            if( typeof v === 'object' && v.type === 'mapping' ) {
              Gibber.createMappingObject( mapping, v )
            }else{
              if(mapping.mapping) mapping.mapping.remove()

              mapping.value = v
              
              // oldSetter.call( obj, mapping.value )
            }
          }
        })
        Object.defineProperty( obj, mapping.Name, {
          get: function() { this.on(); return mapping },
          set: function(v) {
            if( typeof v === 'object' && v.type === 'mapping' ) {
              Gibber.createMappingObject( mapping, v )
            }
          }
        })
      })( _m )
    }
    return _m
  })() 
})()
