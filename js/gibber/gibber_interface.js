( function() {
   
  $script( 'external/autogui' , function() {
    Gibber.interfaceIsReady()
  } )

  var mappingProperties = {
    value: {
      min: 0, max: 1,
      output: Gibber.LINEAR,
      wrap: false,       
      timescale: 'interface',
    },
  },
  remoteCount = 0
  
  var I = Gibber.Environment.Interface = {
    mode : 'local',
    client: 0,
    panel : null,
    socket : null,
    callbacks : {},
    
    newPanel : function( column ) {
      console.log("NEW INTERFACE PANEL", column )
      if( typeof column === 'undefined' ) {
        if( Gibber.isInstrument ) {
          column = {
            bodyElement: $('body')
          }
        }else{
          column = Layout.addColumn({ type:'interface' }) 
        }
      }else{
        $( column.bodyElement ).empty()
      }
      
      var panel = new Interface.Panel({ container: column.bodyElement, useRelativeSizesAndPositions:true, font:'normal 16px Helvetica' })
      
      $( panel.canvas ).css({
        position: 'relative',
        width: $( column.bodyElement ).width(),
        height: $( column.bodyElement ).height()
      })
      
      this.panel = panel
      this.panel.column = column
      
      column.onresize = this.onresize.bind( panel )
      
      I.autogui.reset()
      
      column.onclose = function() { I.panel = null }
      
      $.subscribe( '/gibber/clear', function() { column.close() } )
      
      return panel
    },
    
    onresize: function( newWidth ) {
      $( this.canvas ).css({
        position: 'relative',
        width: $( this.column.bodyElement ).width(),
        height: $( this.column.bodyElement ).height()
      })
      this.redoBoundaries()
    },
    
    initializers : {
      Accelerometer : function( widget, props ) {
        var mappingProperties = {
          x : { min:0, max:1, output:Gibber.LINEAR, wrap:false, timescale:'interface' },
          y : { min:0, max:1, output:Gibber.LINEAR, wrap:false, timescale:'interface' },
          z : { min:0, max:1, output:Gibber.LINEAR, wrap:false, timescale:'interface' }
        }
        
        var x = .5, y = .5, z = .5;
        
        delete widget.x; delete widget.y; delete widget.z;
        
        Gibber.createProxyProperties( widget, mappingProperties, false )
        
        widget.onvaluechange = function( _x, _y, _z ) {
          console.log( _x, _y, _z)
          widget.x( _x )
          widget.y( _y )
          widget.z( _z )
        }
        
        widget.start()
        
        return widget
      },
      Orientation : function( widget, props ) {
        var mappingProperties = {
          x : { min:0, max:1, output:Gibber.LINEAR, wrap:false, timescale:'interface' },
          y : { min:0, max:1, output:Gibber.LINEAR, wrap:false, timescale:'interface' },
          z : { min:0, max:1, output:Gibber.LINEAR, wrap:false, timescale:'interface' }
        }

        delete widget.x; delete widget.y; delete widget.z;
        
        Gibber.createProxyProperties( widget, mappingProperties, false )
        
        widget.onvaluechange = function( _x, _y, _z ) {
          widget.x( _x )
          widget.y( _y )
          widget.z( _z )
        }

        widget.start()
        
        return widget
      },
      
      XY : function( widget, props ) {
        var mappingProperties = {
          x : { min:0, max:1, output:Gibber.LINEAR, wrap:false, timescale:'interface' },
          y : { min:0, max:1, output:Gibber.LINEAR, wrap:false, timescale:'interface' },
        }
        for( var i = 0; i < widget.values.length; i++ ) {
          ( function() { 
            var num = i,
                child = widget.values[ num ],
                x = 0, y = 0
            
            Object.defineProperties( child, {
              x: {
                configurable:true,
                get: function() { return x },
                set: function(v) { x = v; }
              },
              y : {
                configurable:true,
                get: function() { return y },
                set: function(v) { y = v; }
              }
            })

            Gibber.createProxyProperties( child, mappingProperties, false )
            widget[ num ] = child
          })()
        }
      },
      HBox : function( widget, props ) {
        for( var i = 0; i < widget.children.length; i++ ) {
          !function() { 
            var num = i,
                child = widget.children[ i ]
                
            child.kill()
            child.panel = widget.proxyPanel
            
            Object.defineProperty( widget, i, {
              configurable:true,
              get: function() { return child },
              set: function(v) {}
            })
          }()
        }
        
        var _old = widget.add
        widget.add = function() {
          var args = Array.prototype.slice.call( arguments, 0 )
          
          args = args.map( function( elem ) { return elem.kill() })
          
          var start = widget.children.length
          for( var i = 0; i < args.length; i++ ) {
            !function() { 
              var num = i,
                  child = args[ i ]
            
              Object.defineProperty( widget, start++, {
                configurable:true,
                get: function() { return child },
                set: function(v) {}
              })
            }()
          }
          
          return _old.apply( widget, args )
        }
        
        widget.layout()
        widget.draw()
      },
      
      VBox : function( widget, props ) {
        for( var i = 0; i < widget.children.length; i++ ) {
          !function() { 
            var num = i,
                child = widget.children[ i ]
            
            child.kill()
            child.panel = widget.proxyPanel
            
            Object.defineProperty( widget, i, {
              configurable:true,
              get: function() { return child },
              set: function(v) {}
            })
          }()
        }
        
        var _old = widget.add
        widget.add = function() {
          var args = Array.prototype.slice.call( arguments, 0 )
          
          args = args.map( function( elem ) { return elem.kill() })
          
          return _old.apply( widget, args )
        }
        
        widget.layout()
        widget.draw()
      },
      
      MultiSlider : function( widget, props ) {
        var mappingProperties = {
          value : { min:0, max:1, output:Gibber.LINEAR, wrap:false, timescale:'interface' },
        }
                
        widget.children = []
        
        for( var i = 0; i < widget.count; i++ ) {
          !function() { 
            var num = i,
                child = {},
                _value = widget.values[ i ]
            
            Object.defineProperties( child, {
              value: {
                configurable:true,
                get: function() { return _value },
                set: function(v) { _value = v; }
              }
            })

            Gibber.createProxyProperties( child, mappingProperties, false )
            widget[ num ] = child
            widget.children.push( child )
            
            child.valueOf = function() { return this.value() }
            child.index = num
          }()
        }
        
        // var _maxSet = widget.__lookupSetter__('max'),
        //     _maxGet = widget.__lookupGetter__('max')
        // 
        // //console.log( "SLIDER MAX DESC", propDesc )
        // 
        // Object.defineProperty( widget, 'max', {
        //   configurable:true,
        //   get: _maxGet,
        //   set: function( v ) {
        //     _maxSet( v )
        //   
        //     widget.resetValues()
        //     //this.min + (this.max - this.min) * _value;
        //   }
        // })
        
        widget.length = widget.count
        
        widget.onvaluechange = function( sliderNum, __value ) {
          widget[ sliderNum ].value = __value
        }
      },
      Patchbay: function( widget, props ) {
        widget.onconnection = function( start,end ) {
          end.object[ end.name ] = start.object[ start.Name ]
        }
        
        widget.ondisconnection = function( start, end ) {
          end.object[ end.Name ].mapping.remove()
        }
        
        widget._createConnection = widget.createConnection
        widget.createConnection = function( connection ) {
          var start = this.points[ connection[0] ],
              end   = this.points[ connection[1] ]
              
          if( end.Name === 'Out' ) {
            console.log( 'You can\'t feed input to an Out patch point' )
            return
          }
          
          widget._createConnection( connection )
        }
      },
      Paint : function( widget, props ) {
        var mappingProperties = {
          x : { min:0, max:1, output:Gibber.LINEAR, wrap:false, timescale:'interface' },
          y : { min:0, max:1, output:Gibber.LINEAR, wrap:false, timescale:'interface' }
        }
        
        var num = i,
            child = widget.value,
            x = 0, y = 0
        
        Object.defineProperties( child, {
          x: {
            get: function() { return x },
            set: function(v) { x = v; }
          },
          y : {
            get: function() { return y },
            set: function(v) { y = v; }
          }
        })

        Gibber.createProxyProperties( child, mappingProperties, false )
      },
      
      Piano : function( widget, props ) {
        var target = widget.target
        Object.defineProperty( widget, 'target', {
          get: function() { return target },
          set: function(v) { 
            target = v
            for( var i = 0; i < widget.children.length; i++ ) {
              widget.children[ i ].target = target
              widget.children[ i ].key = typeof target.note !== 'undefined' ? 'note' : 'frequency'
              
              widget.children[ i ].sendTargetMessage = function() {
                if( this.target && this.target.note ) {
                  this.target.note( this.frequency, this.value )
                }
              }
            }
          
          }
        })
        
        widget.onboundschange = function() { 
          if( this._initialized) this.placeKeys()
          this.target = this.target // triggers reassignment of key
        }
      },
    },
    defaults: {
      XY : {
        //detectsCollision:false,
        childWidth:40,
        //friction:0,
        fill:'rgba(255,255,255,.1)',
        stroke:'#aaa',
        numChildren:2,
        usePhysics:false
      },
      Piano: {
         startletter : "C",
         startoctave : 3,
         endletter : "C",
         endoctave : 4,
         //bounds:[0,0,1,.25],
         background:'white',
         fill: 'black'
      }
    },
    nonGraphical: [ 'Accelerometer', 'Orientation' ],
    widget: function( props, name ) {
      var isNonGraphical = I.nonGraphical.indexOf( name ) !== -1
      
      if( this.mode === 'local' ) {
        if( I.panel === null && !isNonGraphical ) {
          I.newPanel()
        }
      
        if( typeof props === 'undefined' ) {
          props = {
            mode:'toggle'
          }
        }
        
        if( I.defaults[ name ] ) props = $.extend( I.defaults[ name ], props )
        
        var w = new Interface[ name ]( props )
        w.type = 'mapping'
        
        
        if( typeof w.bounds[0] === 'undefined' ) {
          if( !isNonGraphical ) {
            I.autogui.placeWidget( w, false )
            w.useAutogui = true
          }
        }
        
        if( !isNonGraphical ) Gibber.Environment.Interface.panel.add( w )

        if( I.initializers[ name ] ){
          I.initializers[ name ]( w, props )
        }else{
          var prop = 'value',
              property = mappingProperties[ prop ],
              mapping = $.extend( {}, property, {
                Name  : prop.charAt(0).toUpperCase() + prop.slice(1),
                name  : prop,
                type  : 'mapping',
                value : 1,
                object: w,
                targets:[],
              })
              //oldSetter = b.__lookupSetter__( prop )
      
          Object.defineProperty( mapping.object, mapping.Name, {
            get: function() { return mapping },
            set: function(v) {
              if( typeof v === 'object' && v.type === 'mapping' ) {
                Gibber.createMappingObject( mapping, v )
              }
            }
          })
      
          w.mappingObjects = [ mapping ]
          w.mappingProperties = mappingProperties
      
          w.replaceWith = function( replacement ) {
            if( w.target ) replacement.target = w.target
            if( w.key )    replacement.key    = w.key
        
            I.panel.remove( w )
            I.panel.add( replacement )
        
            replacement.setValue( w.value )
        
            for( var i = 0; i < this.mappingObjects.length; i++ ) {
              var mapping = this.mappingObjects[ i ]
          
              if( mapping.targets.length > 0 ) {
                for( var j = 0; j < mapping.targets.length; j++ ) {
                  var _mapping = mapping.targets[ j ]
            
                  if( replacement.mappingProperties[ mapping.name ] ) {
                    _mapping[ 0 ].mapping.replace( replacement, mapping.name, mapping.Name )
                  }else{ // replacement object does not have property that was assigned to mapping
                    _mapping[ 0 ].mapping.remove()
                  }
                }
              }
            }
          }
        }
        
        if( typeof w.value === 'number' ) w.valueOf = function() { return w.value }
        
        w.mappings = []
        
        w.kill = w.remove = function() {
          for( var i = 0; i < w.mappings.length; i++ ) {
            w.mappings[ i ].remove() 
          }
  
          if( w.clearMarks ) // check required for modulators
            w.clearMarks()
          
          if( !isNonGraphical ) {
            if( w.useAutogui ) {
              I.autogui.removeWidget( w )
              w.panel.remove( w )
            }else{        
              w.panel.remove( w )
            }
          }
          
          return w
        }
      
        Object.defineProperty( w, '_', {
          get: function() { 
            // currently there is no sequencer for interface objects
            //if( w.seq.isRunning ) w.seq.disconnect()  

            return w.kill()
          },
          set: function() {}
        })

        return w
      }else{
        props = props || {}
        
        var w = { 
          value: 0,
          type: 'mapping',
          min:0, max:1,
          client: this.client,
          remoteID: '/' + ( props.name || remoteCount++ ),
          mappings:[],
          setValue: function( val ) {
            this.value = val
            var msg = {
              address: '/clients/' + this.client + this.remoteID,
              parameters:[ val ] 
            }
            I.socket.send( JSON.stringify( msg ) )
          },
          kill: function() { 
            var msg = {
              address: '/clients/' + this.client + '/interface/removeWidget',
              parameters:[ w.remoteID ] ,
            }
            I.socket.send( JSON.stringify( msg ) )
            
            for( var i = 0; i < w.mappings.length; i++ ) {
              w.mappings[ i ].remove() 
            }
  
            if( w.clearMarks ) // check required for modulators
              w.clearMarks()
            
            if( w.useAutogui ) {
              I.autogui.removeWidget( w )
            }
            
          },
          replaceWith: function() {
            this.kill()
          }
        }
        
        Object.defineProperty( w, '_', {
          get: function() { 
            // currently there is no sequencer for interface objects
            //if( w.seq.isRunning ) w.seq.disconnect()  
            
            w.kill()
          },
          set: function() {}
        })
      
        var prop = 'value',
            property = mappingProperties[ prop ],
            mapping = $.extend( {}, property );
            
            $.extend( mapping, {
              Name  : prop.charAt(0).toUpperCase() + prop.slice(1),
              name  : prop,
              type  : 'mapping',
              value : 1,
              object: w,
              targets:[],
            })
            
        Object.defineProperty( mapping.object, mapping.Name, {
          get: function() { return mapping },
          set: function(v) {
            if( typeof v === 'object' && v.type === 'mapping' ) {
              Gibber.createMappingObject( mapping, v )
            }
          }
        })
        
        var label = ''
        Object.defineProperty( w, 'label', {
          get: function() { return label },
          set: function(v) {
            label = v
            var msg = {
              address: '/clients/' + this.client + '/interface/setLabel',
              parameters:[ w.remoteID, label ] ,
            }
            I.socket.send( JSON.stringify( msg ) )
          }
        })
        
        w.mappingObjects = [ mapping ]
        w.mappingProperties = mappingProperties
        
        this.callbacks[ w.remoteID ] = function( data ) {
          w.value = data.parameters[0]
          if( w.onvaluechange )
            w.onvaluechange()
        }
        
        var msg = {
          address: '/clients/' + this.client + '/interface/addWidget',
          parameters:[
          {
            type:name,
            target:'OSC', key: w.remoteID, 
            name: w.remoteID,
          }] 
        }
        //console.log( "sending widget", msg ) 
        this.socket.send( JSON.stringify( msg ) )
        
        return w
      }
    },
    use : function( mode, client ) {
      if( mode === 'remote' ) {
        if( I.socket === null || I.socket.readyState === 3 ) {
          var msg = JSON.stringify({ address:'/createLivecodeServer', parameters:[] }),
              _socket = I.socket = new WebSocket( 'ws://127.0.0.1:10001' )
          
          I.socket.onopen = function() {
            _socket.send( msg )
          }
          I.socket.onmessage = function(msg) {
            var data
            try{
              data = JSON.parse( msg.data )
            }catch( error ) {
              console.error( "ERROR on parsing JSON", error )
              return
            }
            if( I.callbacks[ data.address ] ) {
              I.callbacks[ data.address ]( data )
            }
          }
          window.OSC = Gibber.Environment.Interface.socket
          window.OSC.callbacks = Gibber.Environment.Interface.callbacks
          
        }
        I.mode = 'remote'
        I.client = client
      }else{
        I.mode = 'local'
      }
    },
    
    clear : function( num ) {
      var addr = isNaN( num ) ? I.client : num
      
      if( num === '*') addr = '*'
      
      if( I.mode === 'remote' ) {
        var msg = {
          address: '/clients/' + addr + '/interface/clear',
          parameters:[] 
        }
        
        I.socket.send( JSON.stringify( msg ) )
      }
    },
    button: function( props )      { return I.widget( props, 'Button' ) },
    slider: function( props )      { return I.widget( props, 'Slider' ) },
    multislider: function( props ) { return I.widget( props, 'MultiSlider' ) },
    knob: function( props )        { return I.widget( props, 'Knob' ) },
    xy: function( props )          { return I.widget( props, 'XY' ) },     
    piano: function( props )       { return I.widget( props, 'Piano' ) },
    paint: function( props )       { return I.widget( props, 'Paint' ) },
    patchbay: function( props )    { return I.widget( props, 'Patchbay' ) },
    crossfader: function( props )  { return I.widget( props, 'Crossfader' ) },
    accelerometer: function( props )  { return I.widget( props, 'Accelerometer' ) },
    orientation: function( props )  { return I.widget( props, 'Orientation' ) },    
    
    patchbay : function( props ) {
      if( arguments.length > 1 || props.name ) {
        var _props = {
          points: Array.prototype.slice.call( arguments, 0 )
        }
        props = _props
      }
      return I.widget( props, 'Patchbay') 
    },
    
    hbox : function( props ) {
      if( arguments.length > 1 || props.name ) {
        var _props = {
          children: Array.prototype.slice.call( arguments, 0 )
        }
        props = _props
      }
      return I.widget( props, 'HBox') 
    },
    vbox : function( props ) { 
      if( arguments.length > 1 || props.name ) {
        var _props = {
          children: Array.prototype.slice.call( arguments, 0 )
        }
        props = _props
      }
      return I.widget( props, 'VBox') 
    },
  }
  
  Interface.use = Gibber.Environment.Interface.use
  Interface.clear = Gibber.Environment.Interface.clear

  window.Button   = Gibber.Environment.Interface.button
  window.Slider   = Gibber.Environment.Interface.slider
  window.MultiSlider = Gibber.Environment.Interface.multislider  
  window.Knob     = Gibber.Environment.Interface.knob
  window.XY       = Gibber.Environment.Interface.xy
  window.Keyboard = Gibber.Environment.Interface.piano
  window.Paint    = Gibber.Environment.Interface.paint
  window.Panel    = I.newPanel.bind( I )
  window.Patchbay = Gibber.Environment.Interface.patchbay
  window.HBox     = Gibber.Environment.Interface.hbox
  window.VBox     = Gibber.Environment.Interface.vbox
  window.Crossfader = Gibber.Environment.Interface.crossfader
  window.Accelerometer = Gibber.Environment.Interface.accelerometer
  window.Orientation = Gibber.Environment.Interface.orientation  
  
  var OSC = Gibber.OSC = {
    callbacks : {},
    init : function( port ) {
      var _port = port || 10080,
          _socket = OSC.socket = new WebSocket( 'ws://127.0.0.1:' + _port )
      
      OSC.socket.onopen = function() { console.log( "OSC SOCKET OPENED" ) }
      OSC.socket.onmessage = OSC.onmessage;
    },
    onmessage : function(msg) {
      var data
      try{
        data = JSON.parse( msg.data )
      }catch( error ) {
        console.error( "ERROR on parsing JSON", error )
        return
      }
      if( OSC.callbacks[ data.path ] ) {
        OSC.callbacks[ data.path ]( data.params )
      }else{
        if( OSC.callbacks[ '*' ] ) {
          data.params.address = data.path 
          OSC.callbacks[ '*' ]( data.params )
        }
      }
    },
    
    send : function( address, typetags, params ) {
      var msg = {
        'address':address,
        'typetags':typetags,
        'params':params
      }
      OSC.socket.send( JSON.stringify( msg ) )
    },
  }
  window.OSC = OSC
})()
