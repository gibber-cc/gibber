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
        shiftX : {
          min:0, max:1,
          timescale:'interface',
          output: Gibber.LINEAR
        },
        shiftY : {
          min:0, max:1,
          timescale:'interface',
          output: Gibber.LINEAR
        },
        ctrlX : {
          min:0, max:1,
          timescale:'interface',
          output: Gibber.LINEAR
        },
        ctrlY : {
          min:0, max:1,
          timescale:'interface',
          output: Gibber.LINEAR
        },
        button : {
          min:0, max:1,
          timescale:'interface',
          output: Gibber.LINEAR
        },
      }

  window.Mouse = Gibber.Environment.Mouse = ( function() {
    if( _m !== null ) return _m

    _m = {} 
    
    var storeX = 0, storeY = 0
    
    $.extend( _m, {
      x:0, y:0, prevX:0, prevY:0, shiftX:0, shiftY:0, prevShiftX:0, prevShiftY:0, button:0,
      isOn : false,
      name: 'Mouse',
      _onmousemove : function( e ) {
        // console.log( e )
        var prefix = '', upper = ''
        if( e.shiftKey ) prefix = 'shift'
        if( e.ctrlKey ) prefix = 'ctrl'
        
        upper = prefix === '' ? '' :  prefix.charAt(0).toUpperCase() + prefix.slice(1),
        // console.log( prefix, upper )
        _m[ 'prev' + upper + 'X' ] = storeX//_m[ prefix + ( prefix === ''  ? 'x' : 'X' )]  
        _m[ 'prev' + upper + 'Y' ] = storeY//_m[ prefix + ( prefix === ''  ? 'y' : 'Y' )]  
        storeX = _m[ prefix  + ( prefix === '' ? 'x' : 'X' ) ] = e.pageX / _m.ww 
        storeY = _m[ prefix  + ( prefix === '' ? 'y' : 'Y' ) ] = e.pageY / _m.wh 

        if( typeof _m.onvaluechange === 'function' ) {
          _m.onvaluechange()
        }
      },
      _onmousedown : function() { 
        _m[ 'button' ] = 1 
        if( typeof _m.onvaluechange === 'function' ) {
          _m.onvaluechange()
        }
      },
      _onmouseup : function() { 
        _m[ 'button' ] = 0 
        if( typeof _m.onvaluechange === 'function' ) {
          _m.onvaluechange()
        }
      },
      on: function() {
        if( ! _m.isOn ) {
          _m.ww = $( window ).width()
          _m.wh = $( window ).height()
          $( window ).on( 'mousemove', _m._onmousemove )
          _m.isOn = true
        }
      },
      off: function() {
        if( _m.isOn ) {
          $( window ).off( 'mousemove', _m._onmousemove  )
          _m.isOn = false
        }
      },
      toggle : function() {
        if( _m.isOn ) {
          _m.off()
        }else{
          _m.on()
        }
      },
    })
    
    // create getter layer that turns mouse event handlers on as needed
    for( var prop in mappingProperties ) {
      !function() {
        var name = prop,
            Name = prop.charAt(0).toUpperCase() + prop.slice(1)
        
        Object.defineProperty( _m, Name, {
          configurable:true,
          get: function() {
            if( Name !== "Button" ) {
              _m.on();
            }
          },
          set: function(v) {}
        })
      }()
    }
    
    $( window ).on( 'mousedown', _m._onmousedown )
    $( window ).on( 'mouseup',   _m._onmouseup   )
    
    Gibber.createProxyProperties( _m, mappingProperties, true )

    return _m
  })() 
})()
