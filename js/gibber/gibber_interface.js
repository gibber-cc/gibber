( function() {
  $script( 'external/interface', function() {
    $script( 'external/autogui' , function() {} )
  })
  
  var mappingProperties = {
    value: {
      min: 0, max: 1,
      output: Gibber.LINEAR,
      wrap: false,       
      timescale: 'interface',
    },
  }
  
  var I = Gibber.Environment.Interface = {
    panel : null,
    newPanel : function( column ) {
      console.log(" NEW PANEL ")
      if( typeof column === 'undefined' ) {
        column = Gibber.Environment.Layout.addColumn({ type:'code' })
      }
      
      $( column.editorElement ).find( '.CodeMirror' ).remove()
      
      var panel = new Interface.Panel({ container: column.editorElement })
      $( panel.canvas ).css({
        position: 'relative',
        width: $( column.editorElement ).width(),
        height: $( column.editorElement ).height()
      })
      
      this.panel = panel
      
      return panel
    },
    
    widget: function( props, name ) {
      if( I.panel === null) {
        I.newPanel()
      }
      
      if( typeof props === 'undefined' ) {
        props = {
          mode:'toggle'
        }
      }
      
      var w = new Interface[ name ]( props )
      w.type = 'mapping'
      Gibber.Environment.Interface.panel.add( w )
      
      prop = 'value'
      var property = mappingProperties[ prop ],
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
          
          console.log( "TARGETS", mapping.targets )
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
      
      w.kill = w.remove = function() {
        w.panel.remove( w )
      }
      
      Object.defineProperty( w, '_', {
        get: function() { w.kill() },
        set: function(v) { }
      })
      
      I.autogui.placeWidget( w, false )
      
      return w
    },
    
    button: function( props ) { return I.widget( props, 'Button' ) },
    slider: function( props ) { return I.widget( props, 'Slider' ) },
    knob: function( props )   { return I.widget( props, 'Knob' ) },    
  }
  
  window.Button = Gibber.Environment.Interface.button
  window.Slider = Gibber.Environment.Interface.slider
  window.Knob = Gibber.Environment.Interface.knob  
  
})()