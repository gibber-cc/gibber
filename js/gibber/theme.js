module.exports = function( Gibber ) {
  var GE, Color = require( 'color' )
  
  var Theme = {
    init : function() {
      GE = Gibber.Environment
      
      this.default = {
          comment:    Color( '#888' ),
          number:     Color( '#69d' ),
          string:     Color( '#d44' ),
          variable:   Color( '#ccc' ),
          bracket:    Color( '#f8f8f2' ),
          keyword:    Color( '#ccc' ),
          property:   Color( '#ccc' ),
          attribute:  Color( '#ccc' ),
          atom:       Color( '#00aa00' ),
          //cursor:     { 'border-left':'1px solid #f00' },
          highlight : { background: '#c00' },
          'variable-2': Color( '#ccc' ),          
      }
    
      this.applyTheme( this.default )
    
      window.theme = this.changeThemeProperty
    },   
  
    nontext : [ 'cursor', 'selected', 'matchingbracket', 'lines', 'highlight' ],
  
    applyTheme : function( theme ) {
      var obj = {}
      for( var key in theme ) {
        var prop = theme[ key ],
            prefix = this.nontext.indexOf( key ) === -1 ? '.cm-s-gibber span.cm-' : '.CodeMirror-'
          
        if( prop.opaquer ) { // only way to test if typeof Color object...
          obj[ '' + prefix + key ] = {
            color : prop.rgbaString()
          }
        } else if( typeof prop === 'object') {
          var obj2 = {}
          for( var key2 in prop ) {
            var prop2 = prop[ key2 ]
            obj2[ key2 ] = typeof prop2.rgbaString === 'function' ? prop2.rgbaString() : prop2; // Color object or other property / string value...
          }
          obj[ '' + prefix + key ] = obj2
        }else{
          obj[ '' + prefix + key ] = { color: prop }
        }
      }
    
      $.injectCSS( obj )
    },
  
    changeThemeProperty : function( property, newValue ) {
      var obj = {}
      obj[ property ] = newValue
    
      GE.Theme.applyTheme( obj )
    },
  }
  
  return Theme
}