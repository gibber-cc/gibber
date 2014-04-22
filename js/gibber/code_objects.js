/*
a = Synth({
  attack:44100,
  decay: 44100
})

b = Seq({
  note: ['bb4','eb5','gb3'].rnd(),
  durations:[ 1/4, 1/8, 1 ].rnd(),
  pan: Rndf(-1,1),
  target:a
})
*/

( function() {
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
      var left = obj.expression.left, right = obj.expression.right, newObjectName = left.name, newObject = window[ newObjectName ]
      
      if( ! newObject || ! newObject.gibber ) return // only process Gibber objects
      
      if( right.callee ) {
        var constructorName = right.callee.name,
            className = constructorName + '_' + newObjectName + '_' + cm.column.id + '_global'
        
        var mark = cm.markText( start, end, { 'className': className } );
        newObject.marks.push( mark )
        
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
        } else if( right.arguments && right.arguments.length > 0 && Gibber.Environment.Notation.enabled[ 'reactive' ] ) {
          for( var i = 0; i < right.arguments.length; i++ ) {
            ( function() {
              var arg = right.arguments[ i ]
              if( arg.type === 'Literal' ) {
                var literal = arg, 
                    _start = {line: start.line, ch:literal.loc.start.column },
                    _end = {line: start.line, ch:literal.loc.end.column },
                    mappingObject = newObject.mappingObjects[ i ]
                                    
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
  
    if( props ) {
      for( var i = 0; i < right.arguments.length; i++ ) {
        seq.locations = {}
        //for(var key in seq) {
        var props = seq.tree.expression.right.arguments[0].properties;

        if( props ) {
          for(var i = 0; i < props.length; i++) {
            ( function() {
              var prop = props[i],
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
                  for( var j = 0; j < values.length; j++ ) {
                    ( function() {
                      var value = values[ j ],
                       		__name = newObjectName + '_' + name + '_' + j + '_sequence',
                          index = j,
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
              }
            })()
          }
          
          var lastChose = {};
          
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
  Gibber.Environment.Notation.on( 'global' )
})()