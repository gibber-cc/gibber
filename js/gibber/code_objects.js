/*
Gibber.Environment.Notation.on('seq')

a = Pluck()
	.pan.seq( Rndf(-1,1), [1/8,1/4,1/2] )


a = Pluck()
	.note.seq( [0,1,2,3], [1/2,1/4] )
	.pan.seq( Rndf(-1,1), [1/8,1/4,1/2] )
	.damping.seq( [.5,.6,.2,.1].rnd(), [1/4] )

a = Pluck()
b = Seq({
  note:[0,1,2,4,7,12,13].rnd(),
  durations:[1/4,1/8,1/16].rnd(1/16,2),
  target:a
})

a.text.opacity = a.Out
*/


// push update function to Notation.priority so it can be called after applying
// all other notations... this will make it visible.

var uid = 0

var createUpdateFunction = function( obj, name, color ) {
  var lastChose = {},
      color = color || 'rgba(255,255,255,1)'
  
  var updateFunction = function() {
    // if( name.indexOf('reverse_values') > -1 ) { 
    //   console.log( "FIRING" , obj.locations[ name ], updateFunction.shouldTrigger ) 
    // }
    
    if( obj.locations[ name ] && updateFunction.shouldTrigger ) {
      var spanName = '.' + obj.locations[ name ][ updateFunction.index ],
          span = $( spanName )
      
      if( typeof lastChose[ name ] === 'undefined') lastChose[ name ] = []
  
      span.css({ backgroundColor:color });
    
      setTimeout( function() {
        span.css({ 
          backgroundColor: 'rgba(0,0,0,0)',
        });
      
      }, 100 )
      updateFunction.shouldTrigger = false
    }
  }
  updateFunction.index = null
  updateFunction.shouldTrigger = false
  
  return updateFunction
}

//pattern.onchange = createOnChange( newObject, newObjectName, valuesOrDurations, 'note_values' )

var createOnChange = function( obj, objName, patternName, cm, join ) {
  join = join || ''
  var joinLength = join.length

  return function() {
    var newPatternText = this.values.join( join ),
        arrayPos = this.arrayMark.find(),
        charCount = 0,
        start = {
          line : arrayPos.from.line,
          ch :   arrayPos.from.ch + charCount
        },
        end = {
          line : arrayPos.to.line,
          ch :   arrayPos.from.ch + charCount + 1
        }
    
    obj.marks[ patternName ].length = 0
    obj.locations[ patternName ].length = 0
    
    cm.replaceRange( newPatternText, arrayPos.from, arrayPos.to )
     
    for( var i = 0; i < this.values.length; i++ ) {
      var value = this.values[ i ],
           __name = objName + '_' + patternName +'_' + i,
          length = ( value + '' ).length
          
      start.ch = arrayPos.from.ch + charCount
      end.ch   = start.ch + length
      
      charCount += i !== this.values.length - 1 ? length + joinLength : length
      
      obj.marks[ patternName ].push( 
        cm.markText( start, end, { className:__name, inclusiveLeft:true, inclusiveRight:true }) 
      )
      obj.locations[ patternName ].push( __name )
    }
    
    arrayPos.to.ch = arrayPos.from.ch + charCount
    this.arrayMark = cm.markText( arrayPos.from, arrayPos.to )
    this.arrayText = newPatternText
  }
}

var initializeMarks = function( obj, className, start, end, cm ) {
  var mark = cm.markText( start, end, { 'className': className } );
  
  if( !obj.marks ) {
    obj.marks = {}
    obj.locations = {}
    
    obj.clearMarks = function() {
      
      for( var key in this.marks ) {
        var marks = this.marks[ key ]
        for( var i = 0; i < marks.length; i++ ) {        
          if( marks[ i ].height ) { // in case this is a line handle
            var cm = marks[i].parent.parent.cm
            cm.removeLineClass( marks[i].lineNo(), marks[i].wrapClass )
          }else{
            marks[ i ].clear()
          }
        }
      }

      this.marks = {}
      this.locations = {}
    }
  }
  
  obj.marks.global = [ mark ]
  
  return mark
}

var markArray = function( values, object, objectName, patternName, pos, cm, location ) {
  for( var i = 0; i < values.length; i++ ) {
    var value = values[ i ],
     		__name = objectName.replace('.','') + '_' + patternName + '_' + i,
        index = i,
				start, end;
    
    if( !location ) { // Drums and EDrums pass location
      start = {
        line : ( pos.start ? pos.start.line - 1 : pos.line - 1),
        ch : value.type === 'BinaryExpression' ? value.left.loc.start.column : value.loc.start.column
      }
      end = {
        line : ( pos.start ? pos.start.line - 1 : pos.line - 1),
        ch : value.type === 'BinaryExpression' ? value.right.loc.end.column : value.loc.end.column
      }
      
      start.line += value.type === 'BinaryExpression' ? value.left.loc.start.line : value.loc.start.line
      end.line   += value.type === 'BinaryExpression' ? value.right.loc.end.line  : value.loc.end.line
    }else{
      start = {
        line : pos.start.line + location.start.line - 1,
        ch : location.start.column + 1 + i
      }
      end = {
        line : pos.start.line + location.start.line - 1,
        ch : location.start.column + 2 + i
      }
    }

    var mark = cm.markText( start, end, { className:__name, inclusiveLeft:true, inclusiveRight:true });
    object.marks[ patternName ].push( mark )
    object.locations[ patternName ].push( __name )
  }
}

var getConstructorName = function( callee ) {
  return callee.name ? callee.name : callee.object.object ? callee.object.object.callee.name : callee.object.callee.name
}

module.exports = function( Gibber, Notation ) {
  var codeObjects = [ 'Sampler', 'Model' ],
      notes = [ 'c','db','d','eb','e','f','gb','g','ab','a','bb','b' ],
      makeMove = function( x, value, incr, min, max, mark, cm, newObject, propertyName, className ) {
        var text = value, count = 0;

        move = function( e ) {
          var isMouseDown = true

          if( e.which !== 1 ) {
            isMouseDown = false
            $( window ).off( 'mousemove', move )
            if( count > 0 ) {
              move.onend()
            }
            return
            //cm.setOption( 'readOnly', false )
          }
          
          // wait until mouse is actually moving (as opposed to just pressed down)
          if( ++count === 1 ) move.startMove()
    
          if( isMouseDown ) {
            var subValue = e.clientX - x
            if( e.shiftKey ) { 
              subValue *= 5
            }else if( e.altKey ) {
              subValue *= .1
            }
  
            x = e.clientX            

            if( move.changeValue ) {
              text = move.changeValue( subValue )
            }else{
              value = value + subValue * incr
            
              if( value < min ) {
                value = min
              }else if( value > max ) {
                value = max
              }
            
              text = value % 1 === 0 ? value : value.toFixed( 3 )
            }
  
            var pos = mark.find()  
            cm.replaceRange( '' + text, pos.from, pos.to )

            if( className ) { 
              var newEnd = { line: pos.to.line, ch: pos.from.ch + ( new String( text ).length ) }
              // mark.clear()
              // newObject.marks.splice( newObject.marks.indexOf( mark ), 1 )
              // 
              // mark = cm.markText( pos.from, newEnd, { 'className': className, inclusiveLeft:true, inclusiveRight:true } ) 
              // newObject.marks.push( mark )
            }
            
            if( move.onchange )
              move.onchange( text )
  
            e.preventDefault()
          }
        }
        
        move.mousedown = function( e ) { x = e.clientX }
        move.getValue = function() { return text }
        
        return move
      }
      
  // text objects and mappings
  //G.scriptCallbacks.push( function( obj, cm, pos, start, end, src, evalStart ) {
  Gibber.Environment.Notation.features[ 'global' ] = function( obj, cm, pos, start, end, src, evalStart ) {
    if( obj.type === 'ExpressionStatement' && obj.expression.type === 'AssignmentExpression' ) {
      var left = obj.expression.left, right = obj.expression.right, newObjectName = left.name, newObject = null
      
      if( left.type === 'MemberExpression' ) {
        console.log( "LEFT NAME", left )
        newObjectName = src.split( '=' )[0].trim()
        eval( "newObject = " + newObjectName )
      }else{
        newObject = window[ newObjectName ]
      }

      if( ! newObject || ! newObject.gibber ) return // only process Gibber objects
      
      if( right.callee ) {        
        var constructorName = getConstructorName( right.callee ), 
            className = constructorName + '_' + newObjectName + '_' + cm.column.id + '_global'
            mark = initializeMarks( newObject, className, start, end, cm ),
            object = right.callee,
            prevObject = right, counting = 0
        
        while( typeof object !== 'undefined' ) {
          if( object.name === 'Drums' || object.name === 'EDrums' ) {
            var values = right.arguments, patternName = 'note_values'
            
            if( values[0] && typeof values[0].value === 'undefined' ) {
              values = prevObject.arguments // needed in case drums properties are also sequenced
            }
            if( values[0] ) {
              var location = values[0].loc,
                  pattern = newObject.note.values
                  
              pattern.arrayText = values[0].value
              pattern.originalArrayText = pattern.arrayText.slice( 0 )
              
              pattern.arrayMark = cm.markText( 
                {line:pos.start.line + location.start.line - 1, ch:location.start.column + 1 }, 
                {line:pos.start.line + location.start.line - 1, ch:location.end.column - 1 }
              )
              
              pattern.cm = cm
                  
              newObject.marks[ patternName ] = []
              newObject.locations[ patternName ] = []
              
              markArray( values[0].value, newObject, newObjectName, patternName, pos, cm, location )
              
              pattern.update = createUpdateFunction( newObject, patternName, 'rgba(255,0,0,1)' )
              Notation.add( pattern, true )
              
              pattern.filters.push( function() {
                //if( arguments[0][2] !== pattern.update.index ) {
                  pattern.update.shouldTrigger = true
                  pattern.update.index = arguments[0][2]
                //}
                
                return arguments[0]
              } )
              
              pattern.onchange = createOnChange( newObject, newObjectName, patternName, cm, '' )
                            
            }
          } else if( object.property ) { 
            if( object.property.name === 'seq' ) {
              for( var i = 0; i < prevObject.arguments.length; i++ ) {
                !function() {
                  var values = prevObject.arguments[i].elements,
                      valuesOrDurations = i === 0 ? 'values' : 'durations',
                      patternName = object.object.property.name + '_' + valuesOrDurations;
                  
                  newObject.marks[ patternName ] = []
                  newObject.locations[ patternName ] = []
                  
                  console.log( object.object.property.name )
                  
                  var isArray = true
                  if( !values ) {
                    if( prevObject.arguments[i].callee ) { // if it is an array with a random or weight method attached..
                      if( prevObject.arguments[i].callee.object && prevObject.arguments[i].callee.object.elements ) {
                        values = prevObject.arguments[i].callee.object.elements; // use the array that is calling the method
                      }else{
                        values = [ prevObject.arguments[i] ] // Rndf or Rndi or any anonymous function. TODO: single literal values
                        isArray = false
                      }
                    }else{
                      values = [ prevObject.arguments[i] ]
                      isArray = false 
                    }
                  } 
                  
                  if( values ) {
                    markArray( values, newObject, newObjectName, patternName, pos, cm )
                    
                    var seq = newObject,
                        _name_ = object.object.property.name, 
                        pattern = seq[ _name_ ][ valuesOrDurations ]
                    
                    pattern.cm = cm
                    
                    if( seq[ _name_ ] && pattern.filters ) {
                      var lastChose = {}
                      
                      if( isArray ) { 
                        var start, end
                        
                        pattern.arrayText = src.substring( prevObject.arguments[i].range[0], prevObject.arguments[i].range[1] - 2 );
                        pattern.originalArrayText = pattern.arrayText.slice( 0 )
                        
                        start = {
                          line : ( pos.start ? pos.start.line - 1 : pos.line - 1),
                          ch : prevObject.arguments[i].loc.start.column + 1 // plus one to remove array bracket
                        }
                        end = {
                          line : ( pos.start ? pos.start.line - 1 : pos.line - 1),
                          ch : prevObject.arguments[i].loc.end.column - 1   // minus one to remove array bracket
                        }
                
                        start.line += prevObject.arguments[i].loc.start.line
                        end.line   += prevObject.arguments[i].loc.end.line
                    
                        pattern.arrayMark = cm.markText( start, end );
                        
                      }
                      
                      pattern.update = createUpdateFunction( newObject, patternName )
              
                      Notation.add( pattern, true )
              
                      pattern.filters.push( function() {
                        //if( arguments[0][2] !== pattern.update.index ) {
                          pattern.update.shouldTrigger = true
                          pattern.update.index = arguments[0][2]
                          //}
                                      
                        return arguments[0]
                      } )
                      
                      
                      pattern.onchange = createOnChange( newObject, newObjectName, patternName, cm, ',' )
                    }
                  }
                }()
              }
            }
          }
          
          prevObject = object
          //console.log("OBJECT 1", object )
          object = object.object || object.callee
          //console.log("OBJECT 2", object )
        }
        // for( var i = evalStart + 1; i <= evalStart + ( end.line - start.line ); i++ ) {
        //           mark = cm.addLineClass( i, 'wrap', className )
        //           newObject.marks.push( mark )
        //         }
        
        $.subscribe( '/gibber/clear', function() {
          if( newObject.clearMarks )
            newObject.clearMarks()
        })
 
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

        if( constructorName === 'Seq' && Gibber.Environment.Notation.enabled[ 'seq' ] ) {
          makeSequence( newObject, cm, pos, right, newObjectName )
        } /*else if( right.arguments && right.arguments.length > 0 && Gibber.Environment.Notation.enabled[ 'reactive' ] ) {
          for( var ii = 0; ii < right.arguments.length; ii++ ) {
            ( function() {
              var arg = right.arguments[ ii ]
              if( arg.type === 'Literal' ) {
                var literal = arg, 
                    _start = {line: start.line, ch:literal.loc.start.column },
                    _end = {line: start.line, ch:literal.loc.end.column },
                    mappingObject = newObject.mappingObjects[ ii ]
                                    
                var __move = makeReactive( literal, cm, _start, _end, newObject, newObjectName, mappingObject.name, mappingObject )
                
                __move.onchange = function( v ) {
                  newObject[ mappingObject.name ] = v
                }
              }else if( arg.type === 'ObjectExpression' ) {
                for( var j = 0; j < arg.properties.length; j++ ) {
                  ( function() { 
                    var literal = arg.properties[ j ],
                        mappingObject = newObject.mappingProperties[ literal.key.name ],
                        _start = { line: evalStart + literal.value.loc.start.line - 1, ch:literal.value.loc.start.column },
                        _end = { line: evalStart + literal.value.loc.end.line - 1, ch:literal.value.loc.end.column }
                                            
                    var __move = makeReactive( literal, cm, _start, _end, newObject, newObjectName, literal.key.name, mappingObject )
                    
                    __move.onchange = function( v ) {
                      newObject[ literal.key.name ] = v
                    }
                  })()
                }
              }
            })()
          }
        }*/
      }
    }
    else if( obj.type === 'ExpressionStatement' && obj.expression.type === 'CallExpression' ) { // e.g. drums.note.values.rotate.seq( 1,1 )
      if( src.indexOf( 'seq' ) > -1 ) {
        var args = obj.expression.arguments,
            nextObject = obj.expression.callee,
            object = null,
            caller = null, prevObject = null, pattern = null, path = [], property = null
                    
        var count = 0    
        while( typeof nextObject !== 'undefined' ) {
          object = nextObject
          if( count++ !== 0 && object.property ) path.push( object.property.name )
          nextObject = object.object
        }
        
        caller = window[ object.name ]
        
        eval( 'property = ' + object.name + '.' + path.reverse().join( '.' ) )
        
        if( !caller.marks ) {
          caller.marks = {}
          caller.locations = {}
          caller.clearMarks = function() {
            for( var key in this.marks ) {
              var marks = this.marks[ key ]
              for( var i = 0; i < marks.length; i++ ) {        
                if( marks[ i ].height ) { // in case this is a line handle
                  var cm = marks[i].parent.parent.cm
                  cm.removeLineClass( marks[i].lineNo(), marks[i].wrapClass )
                }else{
                  marks[ i ].clear()
                }
              }
            }
      
            this.marks = {}
            this.locations = {}
          }
        }
        
        for( var _j = 0; _j < args.length; _j++ ) {
          !function( j ) {
            var values = args[ j ].elements,
                valuesOrDurations = j === 0 ? 'values' : 'durations',
                propertyName = obj.expression.callee.object.property.name,
                isArray = true, isRnd = false
            
            console.log("PROPERTY NAME", propertyName, "VD", valuesOrDurations )
            if( !values ) {
              //console.log( args[j] )
              if( args[j].callee ) { // if it is an array with a random or weight method attached..
                if( args[j].callee.object && args[j].callee.object.elements ) {
                  values = args[j].callee.object.elements; // use the array that is calling the method
                }else{
                  // Rndf or Rndi or any anonymous function. TODO: single literal values
                  values = [ args[j] ]
                  isRnd = true
                  isArray = false
                }
              }else{
                values = [ args[j] ]
                isArray = false 
              }
            }

            var seq = caller,
                _name_ = propertyName,
                patternName = propertyName + '_' + valuesOrDurations,
                pattern = property[ valuesOrDurations ]
            
            caller.marks[ patternName ]     = []
            caller.locations[ patternName ] = []
            
            markArray( values, caller, object.name, patternName, pos, cm )
            
            pattern.cm = cm
            pattern.update = createUpdateFunction( caller, patternName, 'rgba(255,255,255,1)' )
            
            Notation.add( pattern, false )
            
            pattern.filters.push( function() {
              //console.log("REVERSE FILTER", pattern.update.shouldTrigger, arguments[0], pattern.update.index )
              //if( arguments[0][2] !== pattern.update.index ) {
                pattern.update.shouldTrigger = true
                pattern.update.index = arguments[0][2]
                //}
              
              return arguments[0]
            } )
            
            pattern.onchange = createOnChange( caller, object.name, patternName, cm, ',' )
          
          //   var lastChose = {}
          //   pattern.filters.push( function() {
          //     // console.log(" FILTER CALLED ", _name_ + valuesOrDurations )
          //     if( seq.locations[ _name_ + valuesOrDurations ] ) {
          //       var __name = '.' + seq.locations[ _name_ + valuesOrDurations ][ arguments[0][2] ];
          //   
          //       if( typeof lastChose[ _name_ ] === 'undefined') lastChose[ _name_ ] = []
          //   
          //       $( __name ).css({ backgroundColor:'rgba(200,200,200,1)' });
          //     
          //       if( _name_ === 'pan' && valuesOrDurations === 'values' ) {
          //         // console.log("PAN FLASH", __name, arguments[0][2], _name_, valuesOrDurations )
          //       }
          //     
          //       setTimeout( function() {
          //         $( __name ).css({ 
          //           backgroundColor: 'rgba(0,0,0,0)',
          //         });
          //       }, 100 )
          //     }
          //     return arguments[0]
          //   }) 
          //             
          //   caller.marks[ propertyName + valuesOrDurations ] = []
          //   caller.locations[ propertyName + valuesOrDurations ] = []
          //   var propNameStart = ( object.name.replace('.','_') ) + '_' + path.join( '_' ) + '_' + valuesOrDurations + '_'
          //   
          //   for( var jj = 0; jj < values.length; jj++ ) {
          //     ( function() {
          //       var value = values[ jj ],
          //            __name = propNameStart + jj,
          //           index = jj,
          //                       start, end;
          //           // console.log( "PROP", propertyName, __name )
          //   
          //       start = {
          //         line : ( pos.start ? pos.start.line - 1 : pos.line - 1),
          //         ch : value.type === 'BinaryExpression' ? value.left.loc.start.column : value.loc.start.column
          //       }
          //       end = {
          //         line : ( pos.start ? pos.start.line - 1 : pos.line - 1),
          //         ch : value.type === 'BinaryExpression' ? value.right.loc.end.column : value.loc.end.column
          //       }
          //       
          //       start.line += value.type === 'BinaryExpression' ? value.left.loc.start.line : value.loc.start.line
          //       end.line   += value.type === 'BinaryExpression' ? value.right.loc.end.line  : value.loc.end.line
          //           
          //       var mark = cm.markText( start, end, { className:__name, inclusiveLeft:true, inclusiveRight:true });
          //       caller.marks[ propertyName + valuesOrDurations ].push( mark )
          //       caller.locations[ propertyName + valuesOrDurations ].push( __name )
          //     })()
          //   }
          }(_j)
        }
      }
    }
  }
  
  // drag and drop
  //G.scriptCallbacks.push( function( obj, cm, pos, start, end, src, evalStart ) {
  Gibber.Environment.Notation.features[ 'draganddrop' ] = function( obj, cm, pos, start, end, src, evalStart ) {    
    if( obj.type === 'ExpressionStatement' && obj.expression.type === 'AssignmentExpression' ) {
      
      var left = obj.expression.left, 
          right = obj.expression.right, 
          newObjectName = left.name,
          newObject = window[ newObjectName ]
      
      if( ! newObject || ! newObject.gibber ) return // only process Gibber objects
            
      if( right.callee ) {
        var constructorName = right.callee.name || src.split('\n')[0].split('=')[1].trim().split('(')[0],
            className = constructorName + '_' + newObjectName + '_' + cm.column.id + '_dragdrop'
        
        if( codeObjects.indexOf( constructorName ) > -1 ){
          // have to mark again due to cascading calls...
          var mark = cm.markText( start, end, { 'className': className } );
          newObject.marks.push( mark )
        
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
  }
  
  // sequencers 
  // processSeq : function( seq, _name, cm, pos ) {
  var makeSequence = function( seq, cm, pos, right, newObjectName ) {
    var props = seq.tree.expression.right.arguments[0].properties,
        targetName = typeof seq.target !== 'undefined' ? seq.target.text.split(' ')[0] : 'undefined',
        target = window[ targetName ]
    
    //console.log( "MAKING SEQUENCE NOTATION" )
    if( props ) {
      for( var ii = 0; ii < right.arguments.length; ii++ ) {
        seq.locations = {}
        //for(var key in seq) {
        var props = seq.tree.expression.right.arguments[0].properties;

        if( props ) {
          for(var ii = 0; ii < props.length; ii++) {
            ( function() {
              var prop = props[ii],
                  name = prop.key.name,            
                  mappingObject = target.mappingProperties[ name ]

              if( typeof seq.properties[ name ] === 'undefined' || name === 'durations') {
                seq.locations[ name ] = [];
    	
                var values = prop.value.elements; 
                if( !values ) {
                  if( prop.value.callee ) { // if it is an array with a random or weight method attached..
                    if( prop.value.callee.object )
                      values = prop.value.callee.object.elements; // use the array that is calling the method
                  }
                } 
        
                if( values ) {
                  for( var jj = 0; jj < values.length; jj++ ) {
                    ( function() {
                      var value = values[ jj ],
                       		__name = newObjectName + '_' + name + '_' + jj + '_sequence',
                          index = jj,
        									start, end;

                      start = {
                        line : ( pos.start ? pos.start.line - 1 : pos.line - 1),
                        ch : value.type === 'BinaryExpression' ? value.left.loc.start.column : value.loc.start.column
                      }
                      end = {
                        line : ( pos.start ? pos.start.line - 1 : pos.line - 1),
                        ch : value.type === 'BinaryExpression' ? value.right.loc.end.column : value.loc.end.column
                      }
                  
                      start.line += value.type === 'BinaryExpression' ? value.left.loc.start.line : value.loc.start.line
                      end.line   += value.type === 'BinaryExpression' ? value.right.loc.end.line  : value.loc.end.line
                      
                      if( value.type !== 'BinaryExpression' ) {
                        if( !mappingObject && (name !== 'note' && name !== 'frequency') ) return
                        // only change inside quotes if string literal

                        if( Gibber.Environment.Notation.enabled.reactive ) {
                          if( isNaN( value.value ) ) {
                            start.ch += 1
                            end.ch -=1
                          }
                        
                          var _move = makeReactive( value, cm, start, end, seq, newObjectName, __name, mappingObject, __name, true )
                          _move.onchange = function( v ) { 
                            seq[ name ][ index ] = isNaN(v) ? v : parseFloat( v )
                          }
                        
                          if( isNaN( value.value ) && name === 'note' ) {  // string, for now we assume a note string
                            _move.changeValue = function( amt ) {
                              var currentValue = _move.getValue(), noteName, noteNumber, nameArray
                            
                              noteName = ''
                              nameArray = currentValue.split('')
                            
                              var _i = 0
                              while( isNaN( nameArray[ _i  ] ) ) {
                                noteName += nameArray[ _i ]
                                _i++
                              }
                            
                              noteNumber = nameArray[ _i ] 
                            
                              var index = notes.indexOf( noteName )
                              if( amt > 0 ) {
                                index += 1
                                if( index >= notes.length ) {
                                  index = index % notes.length
                                  noteNumber = parseInt( noteNumber ) + 1
                                  if( noteNumber > 8 ) noteNumber = 8
                                }
                              }else{
                                if( index === 0 ) {
                                  index = notes.length -1
                                  noteNumber = parseInt( noteNumber ) - 1
                                  if( noteNumber < 0 ) noteNumber = 0 
                                }else{
                                  index -= 1
                                }
                              }
                            
                              noteName = notes[ ( index  )  % notes.length ]
                              return noteName + noteNumber
                            }
                          }
                          // highlight whole literal for second mark, quotes included
                          start.ch -=1
                          end.ch += 1
                        }
                      }
                      
                      var mark = cm.markText( start, end, { className:__name });
                      seq.marks.push( mark )
                      seq.locations[ name ].push( __name )
                    })()
                  }              
                }	else {
                  //if( name !== 'durations' ) console.log(prop)
                  var __name = newObjectName + '_' + name + '_0_sequence'
      
                  var loc = prop.value.loc;
                  var start = {
                    line : loc.start.line + ( pos.start ? pos.start.line - 1 : pos.line - 1),
                    ch : loc.start.column
                  }
                  var end = {
                    line : loc.end.line + ( pos.start ? pos.start.line - 1 : pos.line - 1 ),
                    ch : loc.end.column
                  }
        
                  var mark = cm.markText(start, end, { className: __name });
                  seq.marks.push( mark )
                  seq.locations[ name ].push( __name )
                }
                
                var lastChose = {};
                
                if( seq[ name ] && seq[ name ].filters ) {
                  var _name_ = name
                  seq[ _name_ ].filters.push( function() { 
                    if( seq.locations[ _name_ ] ) {
                      var __name = '.' + seq.locations[ _name_ ][ arguments[0][2] ];
		
                      if( typeof lastChose[ _name_ ] === 'undefined') lastChose[ _name_ ] = []
    
                      $( __name ).css({ backgroundColor:'rgba(200,200,200,1)' });
    
                      setTimeout( function() {
                        $( __name ).css({ 
                          backgroundColor: 'rgba(0,0,0,0)',
                        });
                      }, 100 )
                    }
                    return arguments[0]
                  })
                }
              }
            })()
          }
        }
      }
    }
  }
  
  // reactive literals
  /* Some ideas:
    - drag on note names to change name, ie 'c4' to 'c#4'
    - drag on individual characters in drum sequnce to change between different possibilities
    - drag on values found in sequence arrays (and also use note name dragging as appropriate)
    - per Matt, drag on particular positions in number (such as the tens digit) to only change that value
       - maybe this could be a modal drag, such as with the shift key held?
  */
  
  var disableSelection = function( cm, obj ) {
    for( var i = 0; i < obj.ranges.length; i++ ) {
      var selection = obj.ranges[ i ]
      selection.anchor = selection.head
    }
  }
  
  
  var makeReactive = function( literal, cm, start, end, obj, newObjectName, propertyName, mappingObject, extraClassName, isString ) {
    var min = mappingObject.min, max = mappingObject.max,
        range = max - min,
        pixelRange = 300,
        incr =  1 / pixelRange * range,
        className = newObjectName + '_' + propertyName + '_' + cm.column.id + '_reactive',
        mark, value, x, _move, cb = {}, initCursorPos
    
    value = typeof literal.value.value !== 'undefined' ? literal.value.value : literal.value

    mark = cm.markText( start, end, { 'className': className, inclusiveLeft:true, inclusiveRight:true } )
    obj.marks.push( mark )
        
    $.subscribe('/gibber/clear', function() { mark.clear() } )
    
    cm.listeners[ className ] = function( e ) {
      var isMouseDown = true;
      
      initCursorPos = cm.getCursor();

      if( _move ) { 
        value = isString ? _move.getValue() : new Number( _move.getValue() ) // don't reset variable value to initial val
      }

      var x = e.clientX // closure variable

      _move = makeMove( x, value, incr, min, max, mark, cm, obj, propertyName, extraClassName )
      
      var moving = false

      _move.startMove = function() {
        moving = true
        $( '.CodeMirror-cursors' ).css({ display:'none'} )
        cm.on( 'beforeSelectionChange', disableSelection )
        cm.addLineClass( start.line, 'wrap', 'ew-resize' )
        cm.setOption( 'matchBrackets', false )
      }
      
      _move.onend = function() {
        cm.setCursor( initCursorPos )
        $( '.CodeMirror-cursors').css({ display:'block' })
        cm.removeLineClass( start.line, 'wrap', 'ew-resize' )
        cm.off( 'beforeSelectionChange', disableSelection )
        cm.setOption( 'matchBrackets', true )
      }

      if( cb.onchange ) _move.onchange = cb.onchange
      if( cb.changeValue ) _move.changeValue = cb.changeValue
      
      var end = function() {
        $( window ).off( 'mouseup', end )
        if( moving ) _move.onend() 
      }
      
      $( window ).on( 'mousemove', _move )
      $( window ).on( 'mouseup', end )                
    }
    
    cb.getValue = function() {
      return _move.getValue()
    }
    
    return cb    
  }
  //Gibber.Environment.Notation.on( 'global' )
  
  var PW = Gibber.Environment.Notation.PatternWatcher = {
    dirty: [],
    changed:[],
    clear: function() { 
      for( var i = 0; i < this.changed.length; i++ ) {
        this.changed[i].arrayText = this.changed[i].originalArrayText
        var mark = this.changed[i].arrayMark.find()
        this.changed[i].cm.replaceRange( this.changed[i].arrayText, mark.from, mark.to )
      }
      this.changed.length = 0
      this.dirty.length = 0 
    },
    fps: 30,
    check: function() {
      for( var i = 0; i < this.dirty.length; i++ ) {
        if( this.changed.indexOf( this.dirty[ i ] ) === -1 ) this.changed.push( this.dirty[ i ] )
        this.dirty[ i ].onchange()
      }
      this.dirty.length = 0
    },
    interval: null,
    start: function() {
      this.interval = setInterval( this.check.bind( PW ), 1000 / this.fps )
    },
    stop: function() {
      clearInterval( this.interval )
    }
  }
  
  $.subscribe( '/gibber/clear', PW.clear.bind( PW ) )
  
  Gibber.Pattern.prototype._onchange = function() {
    if( PW.dirty.indexOf( this ) === -1 ) {
      PW.dirty.push( this )
    }
  }
  
  //PW.start()
}