( function() {
  var codeObjects = [ 'Sampler', 'Model' ]

  G.scriptCallbacks.push( function( obj, cm, pos, start, end, src ) {
    if( obj.type === 'ExpressionStatement' && obj.expression.type === 'AssignmentExpression' ) {
      var left = obj.expression.left, right = obj.expression.right, newObjectName = left.name, newObject = window[ newObjectName ]
      
      if( right.callee ) {
        var constructorName = right.callee.name,
            className = constructorName + '_' + newObjectName
        
        var mark = cm.markText( start, end, { 'className': className } );

        newObject.text = new String( src )
        newObject.text.mark = mark
        newObject.text.class = '.' + className
        newObject.text.mappingProperties = $.extend( {}, Gibber.notationProperties )
        newObject.text.mappingObjects = []
        
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
        
        // future( function() {
        //   window[ newObjectName ].text = $( '.' + className )
        // }, 1/4 )
      }
      
      if( codeObjects.indexOf( constructorName ) > -1 ){
            
        if( left ) {
          // console.log( 'MAKING A DROP', className, newObjectName )
          
          // apparently this isn't synchronous? 
          
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
      
      /*if( right.arguments.length > 0 ) {
        for( var i = 0; i < right.arguments.length; i++ ) {
          ( function() {
            var arg = right.arguments[ i ]
            if( arg.type === 'Literal' ) {
              //console.log( "FOUND LITERAL", prop.range[0], prop.range[1], start )
              var prop = arg, 
                  _start = {line: start.line, ch:prop.loc.start.column },
                  _end = {line: start.line, ch:prop.loc.end.column },
                  widget, value = prop.value, x, y, isMouseDown,
                  mappingObject = newObject.mappingObjects[ i ],
                  propertyName = mappingObject.name,
                  min = mappingObject.min, max = mappingObject.max,
                  range = max - min,
                  pixelRange = 300,
                  incr =  1 / pixelRange * range,
                  mark
            
              widget = $( '<span>' )
                .text( value )
                .on( 'mousedown', function( e ) {
                  x = e.clientX
                  isMouseDown = true;
                
                  var move = function( e ) {
                    if( e.which !== 1 ) {
                      isMouseDown = false
                      $( window ).off( 'mousemove', move )
                      // mark.clear()
                      // cm.replaceRange( ''+value, pos.from, pos.to )
                      // console.log(" CLEARED AND REPLACED WITH ", value)
                      // widget.focus()
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
                    
                      widget.text( value % 1 === 0 ? value : value.toFixed(5) )
                      
                      //console.log( mark )
                      pos = mark.find()
                      
                      //cm.replaceRange( ''+value, pos.from, pos.to )
                      
                      newObject[ propertyName ] = value
                    
                      e.preventDefault()
                    }
                  }
                
                  $( window ).on( 'mousemove', move )
                })
                //.attr( 'contenteditable', true )
                .css({ cursor:'ew-resize', outline:'none' })
                .addClass( 'cm-number' )
                .on( 'input', function() { console.log( "INPUT") } ) 
              
              mark = cm.markText( _start, _end, { className: 'TESTING',  replacedWith:widget[0], handleMouseEvents:false } )
              
              // future( function() { 
              //   $('.TESTING').on('mousedown', function(e) { e.preventDefault(); console.log(' ARARHAHRHAR ' ) } )
              // }, 1/4)
            
            }else if( arg.type === 'ObjectExpression' ) {
            
            }
        })()
        }
      }*/
    }
  })

})()