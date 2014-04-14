( function() {
  var codeObjects = [ 'Sampler', 'Model' ],
      makeMove = function( x, value, incr, min, max, mark, cm, newObject, propertyName ) {
        move = function( e ) {
          var isMouseDown = true

          if( e.which !== 1 ) {
            isMouseDown = false
            $( window ).off( 'mousemove', move )
            //cm.setOption( 'readOnly', false )
          }
    
          if( isMouseDown ) {
            var subValue = e.clientX - x
            if( e.shiftKey ) { 
              subValue *= 5
            }else if( e.altKey ) {
              subValue *= .1
            }
  
            x = e.clientX
            value = value + subValue * incr
  
            if( value < min ) {
              value = min
            }else if( value > max ) {
              value = max
            }
  
            var pos = mark.find()
    
            var newText = value % 1 === 0 ? value : value.toFixed( 3 )
    
            cm.replaceRange( ''+newText, pos.from, pos.to )
            //mark = cm.markText( _start, _end, { 'className': className } )
      
            newObject[ propertyName ] = newText
  
            e.preventDefault()
          }
        }
        
        move.mousedown = function( e ) { x = e.clientX }
        
        return move
      }
      
  // text objects and mappings
  G.scriptCallbacks.push( function( obj, cm, pos, start, end, src ) {
    if( obj.type === 'ExpressionStatement' && obj.expression.type === 'AssignmentExpression' ) {
      var left = obj.expression.left, right = obj.expression.right, newObjectName = left.name, newObject = window[ newObjectName ]
      
      if( ! newObject || ! newObject.gibber ) return // only process Gibber objects
      
      if( right.callee ) {
        var constructorName = right.callee.name,
            className = constructorName + '_' + newObjectName + '_' + cm.column.id
        
        var mark = cm.markText( start, end, { 'className': className } );

        newObject.text = new String( src )
        newObject.text.mark = mark
        newObject.text.class = '.' + className
        newObject.text.mappingProperties = $.extend( {}, Gibber.Environment.Notation.properties )
        newObject.text.mappingObjects = []
        
        newObject.tree = obj
        
        for( var _key in newObject.text.mappingProperties ) {
          ( function() {
            var key = _key,
                property = newObject.text.mappingProperties[ key ],
                set = property.set
        
            newObject.text[ '___' + key + '___' ] = property.value
            
            Object.defineProperty( newObject.text, key, {
              configurable: true,
              get: function() { return newObject.text[ '___' + key + '___' ] },
              set: function( v ) {
                set.call( newObject.text, v )
              }
            })
        
            Gibber.createProxyProperty( newObject.text, key, false, false, property )
          })()
        }
      }
    }
  })
  
  // drag and drop
  G.scriptCallbacks.push( function( obj, cm, pos, start, end, src ) {
    if( obj.type === 'ExpressionStatement' && obj.expression.type === 'AssignmentExpression' ) {
      var left = obj.expression.left, 
          right = obj.expression.right, 
          newObjectName = left.name,
          newObject = window[ newObjectName ]
      
      if( ! newObject || ! newObject.gibber ) return // only process Gibber objects
      
      if( right.callee ) {
        var constructorName = right.callee.name,
            className = constructorName + '_' + newObjectName
            
        if( codeObjects.indexOf( constructorName ) > -1 ){    
          if( left ) {
            // console.log( 'MAKING A DROP', className, newObjectName )
            // apparently cm.markText isn't synchronous
            future( function() {
              $( '.' + className ).on( 'drop', function( e ) { 
                // console.log( 'GOT A DROP ', className, newObjectName )
                // console.log( e )
                window[ newObjectName ].ondrop( e.originalEvent.dataTransfer.items )
                $( '.' + className ).css({ textDecoration:'none' })
              })
            
              $( '.' + className ).on( 'dragenter', function( e ) { 
                // console.log( 'DRAGOVER', className, newObjectName )
                $( '.' + className ).css({ textDecoration:'underline' })
              })
            
              $( '.' + className ).on( 'dragleave', function( e ) { 
                // console.log( 'DRAGLEAVE', className, newObjectName )
                $( '.' + className ).css({ textDecoration:'none' })
              })
            
            }, 1/4)
          }
        }
      }
    }
  })
  
  // sequencers 
  // processSeq : function( seq, _name, cm, pos ) {
  G.scriptCallbacks.push( function( obj, cm, pos, start, end, src, evalStart ) {
    if( obj.type === 'ExpressionStatement' && obj.expression.type === 'AssignmentExpression' ) {
      var left = obj.expression.left, 
          right = obj.expression.right, 
          newObjectName = left.name, 
          newObject = window[ newObjectName ],
          seq, props
      
      if( typeof right.callee === 'undefined' ) return
      
      if( right.callee.name === 'Seq' ) {
        seq = newObject
        console.log( seq.tree )
        props = seq.tree.expression.right.arguments[0].properties;
      }else{
        return
      }
      
      if( props ) {
        for( var i = 0; i < right.arguments.length; i++ ) {
          seq.locations = {}
          //for(var key in seq) {
          var props = seq.tree.expression.right.arguments[0].properties;
  
          if( props ) {
            for(var i = 0; i < props.length; i++) {
              var prop = props[i];
              //console.log("PROP:", prop)
              var name = prop.key.name;

              if( typeof seq.properties[ name ] === 'undefined' || name === 'durations') {
                seq.locations[name] = [];
      	
                var values = prop.value.elements; 
                if(!values) {
                  if(prop.value.callee) { // if it is an array with a random or weight method attached..
                    if(prop.value.callee.object)
                      values = prop.value.callee.object.elements; // use the array that is calling the method
                  }
                } 
                var lastChose = {};
          
                if(values) {
                  for(var j = 0; j < values.length; j++) {
                    var value = values[j],
                     		__name = newObjectName + "_" + name + "_" + j,
      									start, end;
						
      							if( value.type === 'BinaryExpression' ) { // checking for durations such as 1/4, 1/8 etc.
                      start = {
                        line : value.left.loc.start.line + ( pos.start ? pos.start.line - 1 : pos.line - 1),
                        ch : value.left.loc.start.column
                      }
                      end = {
                        line : value.right.loc.end.line + ( pos.start ? pos.start.line - 1 : pos.line - 1),
                        ch : value.right.loc.end.column
                      }
      							}else{
                      start = {
                        line : value.loc.start.line + ( pos.start ? pos.start.line - 1 : pos.line - 1),
                        ch : value.loc.start.column
                      }
                      end = {
                        line : value.loc.end.line + ( pos.start ? pos.start.line - 1 : pos.line - 1),
                        ch : value.loc.end.column
                      }
      							}
						
                    cm.markText( start, end, { className:__name });
            
                    seq.locations[name].push( __name )
                  }              
                }	else {
                  //if( name !== 'durations' ) console.log(prop)
                  var __name = newObjectName + "_" + name + "_0"
        
                  var loc = prop.value.loc;
                  var start = {
                    line : loc.start.line + ( pos.start ? pos.start.line - 1 : pos.line - 1),
                    ch : loc.start.column
                  }
                  var end = {
                    line : loc.end.line + ( pos.start ? pos.start.line - 1 : pos.line - 1 ),
                    ch : loc.end.column
                  }
          
                  cm.markText(start, end, { className: __name });
        
                  seq.locations[name].push( __name )
                }
              }
            }
            
            seq.chose = function( key, index ) { 
              if( seq.locations[ key ] ) {
                var __name = '.' + seq.locations[ key ][ index ];
						
                if( typeof lastChose[ key ] === 'undefined') lastChose[ key ] = []
            
                $( __name ).css({ backgroundColor:'rgba(200,200,200,1)' });
            
                setTimeout( function() {
                  $( __name ).css({ 
                    backgroundColor: 'rgba(0,0,0,0)',
                  });
                }, 100 )
              }
            }
          }
        }
      }
    }
  })
  // reactive literals
  /* Some ideas:
    - drag on note names to change name, ie 'c4' to 'c#4'
    - drag on individual characters in drum sequnce to change between different possibilities
    - drag on values found in sequence arrays (and also use note name dragging as appropriate)
    - per Matt, drag on particular positions in number (such as the tens digit) to only change that value
       - maybe this could be a modal drag, such as with the shift key held?
  */
  
  G.scriptCallbacks.push( function( obj, cm, pos, start, end, src, evalStart ) {
    if( obj.type === 'ExpressionStatement' && obj.expression.type === 'AssignmentExpression' ) {
      var left = obj.expression.left, right = obj.expression.right, newObjectName = left.name, newObject = window[ newObjectName ]
      if( right.arguments && right.arguments.length > 0 ) {
        for( var i = 0; i < right.arguments.length; i++ ) {
          ( function() {
            var arg = right.arguments[ i ]
            if( arg.type === 'Literal' ) {
              //console.log( "FOUND LITERAL", prop.range[0], prop.range[1], start )
              var prop = arg, 
                  _start = {line: start.line, ch:prop.loc.start.column },
                  _end = {line: start.line, ch:prop.loc.end.column },
                  widget, x, y, isMouseDown,
                  mappingObject = newObject.mappingObjects[ i ],
                  propertyName = mappingObject.name,
                  min = mappingObject.min, max = mappingObject.max,
                  range = max - min,
                  pixelRange = 300,
                  incr =  1 / pixelRange * range,
                  mark,
                  className = newObjectName + '_' + propertyName + '_' + cm.column.id
              
              value = prop.value
              
              mark = cm.markText( _start, _end, { 'className': className, inclusiveLeft:true, inclusiveRight:true } )
              $.subscribe('/gibber/clear', function() { mark.clear() } )
              
              var x, _move
              
              cm.listeners[ className ] = function( e ) {
                var isMouseDown = true;
                
                $( '.' + className ).css({ cursor:'ew-resize', outline:'none', userSelect:'none' })
                
                var x = e.clientX // closure variable
                
                _move = makeMove( x, value, incr, min, max, mark, cm, newObject, propertyName )
                
                $( window ).on( 'mousemove', _move )                
              }
            
            }else if( arg.type === 'ObjectExpression' ) {
              console.log( "ARG", arg )
              for( var j = 0; j < arg.properties.length; j++ ) {
                ( function() { 
                  var prop = arg.properties[ j ],
                      propertyName  = prop.key.name,
                      mappingObject = newObject.mappingProperties[ propertyName ],
                      min = mappingObject.min, max = mappingObject.max,
                      range = max - min,
                      pixelRange = 300,
                      incr =  1 / pixelRange * range,
                      value = prop.value.value,
                      _start = {line: evalStart + prop.value.loc.start.line - 1, ch:prop.value.loc.start.column },
                      _end = {line: evalStart + prop.value.loc.end.line - 1, ch:prop.value.loc.end.column },
                      className = newObjectName + '_' + propertyName + '_' + cm.column.id,
                      mark, x, _move
                  
                  if( prop.value.type !== 'Literal' ) return
                  
                  mark = cm.markText( _start, _end, { 'className': className, inclusiveLeft:true, inclusiveRight:true } )
                  
                  $.subscribe('/gibber/clear', function() { mark.clear() } )

                  cm.listeners[ className ] = function( e ) {
                    var isMouseDown = true;
                    $( '.' + className ).css({ cursor:'ew-resize', outline:'none', userSelect:'none' })
                    
                    x = e.clientX // closure variable
                
                    _move = makeMove( x, value, incr, min, max, mark, cm, newObject, propertyName )
                
                    $( window ).on( 'mousemove', _move )                
                  }
                })()
              }
            }
          })()
        }
      }
    }
  })

})()