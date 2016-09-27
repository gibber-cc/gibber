// TODO: CREATE ARRAY .arrayMark for values in expression call.

// push update function to Notation.priority so it can be called after applying
// all other notations... this will make it visible.

var uid = 0

var sides = ['Top','Right','Bottom','Left']

var arrayReplacementFunc = function( pattern, cm, object, start, end ) {
  var patternString = '[', commentedPatternString
 
  for( var x = 0; x < pattern.values.length; x++ ) {
    var val = pattern.values[ x ]
    if( $.isNumeric(val) ) {
      var mod = 1 / val
      if( mod % 1 === 0 ) {
        patternString += '1/' + mod
      }else{
        patternString += val
      }
    }else{
      patternString += val
    }

    if( x <= pattern.values.length - 2 ) patternString += ','
  }
 
  patternString += ']'
  commentedPatternString = '/* ' + patternString + ' */'
  end.ch += 1
  cm.replaceRange( commentedPatternString, end, end )
  
  start.ch = end.ch
  end.ch += commentedPatternString.length
  isFunc = false

  var tree = Gibber.Environment.Esprima.parse( patternString, { loc:true, range:true } ),
      expr = tree.body[0],
      loc = { 'start':start, 'end':end }

  values = expr.expression.elements
  for( var z = 0; z < values.length; z++ ) {
    var value = values[z]
    value.loc.start.column += start.ch + 3
    value.loc.end.column += start.ch + 3
    if( value.left ) {
      value.left.loc.start.column += start.ch + 3
      value.left.loc.end.column += start.ch + 3
      value.right.loc.start.column += start.ch + 3
      value.right.loc.end.column += start.ch + 3
    }
  }

  //markArray( values, object, newObject, newObjectName, patternName, loc, cm )
  pattern.arrayText = commentedPatternString
  Notation.PatternWatcher.changed.push( pattern )
  return values
}

var phaseIndicators = {
  border: function( info ) {
    if( info.lastSpan  ) { 
      var noChange = info.span.selector === info.lastSpan.selector
      if( !noChange ) {
        info.lastSpan.css({ borderColor:'rgba(0,0,0,0)', borderWidth:0, padding:1 })
      }else{
        if( parseInt( info.lastSpan.css( 'border-width' ) ) !== 1 ) { // this actually returns 1 for '1px 0px 1px 1px' etc
          noChange = false
        }
      }
    }

    if( !noChange ) {
      if( info.span.length === 1 ) {
        info.span.css({ borderColor:info.color, borderWidth:1, paddingLeft:0, paddingRight:0 })
      }else{
        info.span.css({ borderWidth:0, borderTopWidth:1, borderBottomWidth:1, borderTopColor:info.color, borderBottomColor:info.color })
        $( info.span[0] ).css({ borderLeftColor:info.color, borderLeftWidth:1, paddingLeft:0})
        $( info.span[ info.span.length - 1 ] ).css({ borderRightColor: info.color, borderRightWidth:1, paddingRight:0 })
      }
    }
  },
  underscore: function( info ) {
    /*if( info.lastSpan ) { 
      info.lastSpan.css({ borderColor:'rgba(0,0,0,0)', borderBottomWidth:0, paddingBottom:1 })
      var noChange = info.span.selector === info.lastSpan.selector
      if( noChange ) {
        if( parseInt( info.lastSpan.css( 'border-bottom-width' ) ) !== 1 ) { // this actually returns 1 for '1px 0px 1px 1px' etc
          noChange = false
        } 
      }
    }

    if( !noChange ) {
      if( info.span.length === 1 ) {
        info.span.css({ borderColor:info.color, borderBottomWidth:1, paddingBottom:0 })
      }else{
        info.span.css({ borderWidth:0, borderBottomWidth:1, borderBottomColor:info.color })
      }
    }else{
      setTimeout( function() { 
        info.span.css({ borderColor:info.color })
      }, 100 )
    }*/
    if( info.lastSpan ) { 
      if( info.lastType === 'border' ) { 
        info.lastSpan.css({ borderColor:'rgba(0,0,0,0)' })
      }else{
        info.lastSpan.css({ borderTopColor:'rgba(0,0,0,0)', borderBottomColor:'rgba(0,0,0,0)' })
      }
    }

    info.span.css({ borderBottomColor:info.color })
  },
  flash: function( info ) {
    if( info.lastSpan && ( info.lastType === 'border' ||  info.lastType === 'borderTopBottom' )) { 
      info.lastSpan.css({ borderColor:'rgba(0,0,0,0)' })
    }
    
    info.span.css({ backgroundColor:info.color });
    
    setTimeout( function() {
      info.span.css({ 
        backgroundColor: 'rgba(0,0,0,0)',
      });
    }, 75 )
  },
  flashBorderOld: function( info ) {
    if( info.lastSpan  ) { 
      var noChange = info.span.selector === info.lastSpan.selector
      if( !noChange ) {
        info.lastSpan.css({ borderColor:'rgba(0,0,0,0)', borderWidth:0, padding:1 })
      }else{
        if( parseInt( info.lastSpan.css( 'border-width' ) ) !== 1 ) { // this actually returns 1 for '1px 0px 1px 1px' etc
          noChange = false
        }
      }
    }

    if( !noChange ) {
      if( info.span.length === 1 ) {
        info.span.css({ borderColor:info.color, borderWidth:1, paddingLeft:0, paddingRight:0 })
      }else{
        info.span.css({ borderWidth:0, borderTopWidth:1, borderBottomWidth:1, borderTopColor:info.color, borderBottomColor:info.color })
        $( info.span[0] ).css({ borderLeftColor:info.color, borderLeftWidth:1, paddingLeft:0})
        $( info.span[ info.span.length - 1 ] ).css({ borderRightColor: info.color, borderRightWidth:1, paddingRight:0 })
      }
    }
    
    var mute = 'rgba(255,255,255,.25)'
    
    setTimeout( function() {
      info.span.css({ 
        borderColor: mute
      });
    }, 75 )
  },
  flashBorder: function( info ) {
    var mute = info.muteColor
    
    if( info.lastSpan  ) { 
      var noChange = info.span.selector === info.lastSpan.selector
      if( !noChange ) {
        info.lastSpan.css({ borderColor:'rgba(0,0,0,0)' })
      }else{
        if( parseInt( info.lastSpan.css( 'border-width' ) ) !== 1 ) { // this actually returns 1 for '1px 0px 1px 1px' etc
          noChange = false
          info.borderSide = 0
        }else{
          info.borderSide++
        }
      }
    }
    
    if( info.span.length === 1 ) {
      info.span.css({ borderWidth:1, padding:0 })
    }else{
      // info.span.css({ padding:0, borderTopWidth:1, borderBottomWidth:1, borderLeftWidth:0, borderRightWidth:0 })
      // $( info.span[ info.span.length - 1 ] ).css({ borderRightWidth:1 })
      // $( info.span[0] ).css({ borderLeftWidth:1 })
    }
    
    if( !noChange ) {
      if( info.span.length === 1 ) {
        info.span.css({ borderColor:info.color })
      }else{
        // info.span.css({ borderColor:'transparent', borderTopColor:info.color, borderBottomColor:info.color })
        // $( info.span[0] ).css({ borderColor:'transparent', borderLeftColor:info.color })
        // $( info.span[ info.span.length - 1 ] ).css({ borderColor:'transparent', borderRightColor: info.color })
        info.span.css({ borderTopColor:info.color, borderBottomColor: info.color })
        $( info.span[ info.span.length - 1 ] ).css({ borderRightColor: info.color })
        $( info.span[0] ).css({ borderLeftColor:info.color })
      }
      
      setTimeout( function() {
        info.span.css({ 
          borderColor: mute
        });
      }, 75 )
      
    }else{
      var side = sides[ info.borderSide % sides.length ]
      
      if( info.span.length === 1 ) {
        info.span.css({ borderColor:mute })
        info.span.css( 'border'+side+'Color', info.color )
      }else{
        info.span.css({ borderColor:'transparent' })

        info.span.css({ borderTopColor:side === 'Top' ? info.color : mute, borderBottomColor: side === 'Bottom' ? info.color : mute })
        $( info.span[ info.span.length - 1 ] ).css({ borderRightColor: side === 'Right' ? info.color : mute })
        $( info.span[0] ).css({ borderLeftColor:side === 'Left' ? info.color : mute })
      }
    }
    
    
    // setTimeout( function() {
    //   info.span.css({ 
    //     borderColor: mute
    //   });
    // }, 75 )
  },
  borderTopBottom: function( info ) { //lastSpan, span, color, lastType ) {
    if( info.lastSpan ) { 
      if( info.lastType === 'border' ) { 
        info.lastSpan.css({ borderColor:'rgba(0,0,0,0)' })
      }else{
        info.lastSpan.css({ borderTopColor:'rgba(0,0,0,0)', borderBottomColor:'rgba(0,0,0,0)' })
      }
    }

    info.span.css({ borderTopColor:info.color, borderBottomColor:info.color })
  }
}

var createUpdateFunction = function( obj, name, color, muteColor, isFunc ) {
  var lastChose = {},
      updateFunction, lastSpan,
      Notation = Gibber.Environment.Notation,
      color = color || Notation.phaseIndicatorColor,
      muteColor = muteColor || Notation.phaseIndicatorColorMute,
      lastType = null,//Notation.phaseIndicatorStyle,
      info = { borderSide:0 }
  
  //console.log("UPDATE", name, isFunc )
  
  color = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + Notation.phaseIndicatorAlpha + ')'
  muteColor = 'rgba(' + muteColor[0] + ',' + muteColor[1] + ',' + muteColor[2] + ',' + Notation.phaseIndicatorAlpha + ')'
  
  if( isFunc ) {
    updateFunction = createRndUpdateFunction( obj, name )
    updateFunction.clear = updateFunction.restoreOriginalText
  }else{
    updateFunction = function() {
      if( obj.locations[ name ] && updateFunction.shouldTrigger ) {
        var spanName = '.' + obj.locations[ name ][ updateFunction.index ],
            span = $( spanName )

        if( typeof lastChose[ name ] === 'undefined') lastChose[ name ] = []
        
        var noChange = false
        
        info.lastSpan = lastSpan
        info.span = span
        info.color = color
        info.muteColor = muteColor
        info.lastType = lastType
        
        for( var i = 0; i < Notation.phaseIndicatorStyles.length; i++ ) {
          phaseIndicators[ Notation.phaseIndicatorStyles[ i ] ]( info )
        }

        lastType = Notation.phaseIndicatorStyle
        lastSpan = span
        updateFunction.shouldTrigger = false
      }
    }
    
    updateFunction.index = null
    updateFunction.shouldTrigger = false

    /*updateFunction.clear = function() {
      switch( Notation.phaseIndicatorStyle ) {
        case 'border' :
          lastSpan.css({ borderColor:'rgba(0,0,0,0)', borderWidth:0, padding:0 })
          break;
        case 'underscore' :
          lastSpan.css({ borderColor:'rgba(0,0,0,0)', borderBottomWidth:0, paddingBottom:0 })
          break;
        default:
          break
      }
    }*/
  }

  //window.myupdate = updateFunction


  return updateFunction
}

var parseHTMLEntities = function(str) {
    return str.replace(/&#([0-9]{1,4});/gi, function(match, numStr) {
        var num = parseInt(numStr, 10); // read num as normal number
        return String.fromCharCode(num);
    });
}

var createRndUpdateFunction = function( obj, name ) {
  var update = function() {
    if( !obj || ! obj.marks || !obj.marks[ name ] ) return
    
    if( obj.marks[ name ][ update.index ] && update.shouldTrigger ) {
      var pos = obj.marks[ name ][0].find(),
          pattern = update.pattern,
          cm = pattern.cm
      
      if( typeof update.value !== 'string' ) update.value += ''

            
      if( update.value.indexOf( ',' ) > -1 ) { // should be an array
        update.value = '[' + update.value + ']'
      }else{
        if( update.value.length > Gibber.Environment.Notation.floatLengthLimit ) {
          update.value = update.value.slice( 0,Gibber.Environment.Notation.floatLengthLimit )
        }
      }
      // console.log('UPDATE', update.value, update.pattern, update.pattern.originalArrayText )     
      switch( Gibber.Environment.Notation.functionOutputIndicatorStyle ) {
        case 'comment':
          update.pattern.cm.replaceRange( update.pattern.originalArrayText + '/* ' + update.value + ' */', pos.from, pos.to )
          pos.from.ch = pos.to.ch + update.value.length + update.pattern.originalArrayText.length + 6
          update.pattern.arrayText = update.pattern.originalArrayText + update.value // need to update for check in restoreOriginalText method
          break;
        case 'replace':
          update.pattern.cm.replaceRange( update.value, pos.from, pos.to )
          pos.from.ch = pos.to.ch + update.value.length
          update.pattern.arrayText = update.value // need to update for check in restoreOriginalText method
          break;
      }

      update.pattern.arrayMark = obj.marks[name][0]

      update.shouldTrigger = false

      if( Gibber.Environment.Notation.PatternWatcher.changed.indexOf( update.pattern ) === -1 ) {
        Gibber.Environment.Notation.PatternWatcher.changed.push( update.pattern )
      }
      
      // TODO: Only works with last element in call to seq...
      // if( Notation.functionOutputShouldFlash ) {
      //   var spanName = '.' + obj.marks[ name ][ update.index ].className,
      //       span = $( spanName ),
      //       color = Notation.phaseIndicatorColor
      //   
      //       console.log("SETUP FLASH FOR", spanName )
      //   color = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + Notation.phaseIndicatorAlpha + ')'
      //   
      //   span.css({ backgroundColor:'green' });
      //   
      //   setTimeout( function() {
      //     span.css({ 
      //       backgroundColor: 'rgba(255,0,0,1)',
      //     });
      //   }, 75 )
      // }
      update.init = 1
    }
  }
  update.lastLength = 0
  update.value = 0
  update.index = 0
  update.init = 0
  
  return update
}

//pattern.onchange = createOnChange( newObject, newObjectName, valuesOrDurations, 'note_values' )
// createOnChange( newObject, newObjectName, patternName, cm, '' )
var createOnChange = function( obj, objName, patternName, cm, join, seqNumber ) {
  join = join || ''
  var joinLength = join.length
  
  // console.log("ON CHANGE", patternName, seqNumber, obj  )
  return function() { // "this" is the pattern object, as function is assigned to pattern.onchange
   //console.log( "CHANGE", this )
    var newPatternText = this.values.join( join ),
        arrayPos = this.arrayMark.find(),
        charCount = 0, start, end;
    
    if( typeof arrayPos !== 'object' ) {
      //console.log( 'BAD ARRAY POS VALUE', arrayPos, this.arrayMark )
      return
    }

    var diff =this.arrayText.length - newPatternText.length

    start = {
      line : arrayPos.from.line,
      ch :   arrayPos.from.ch + charCount
    }
    end = {
      line : arrayPos.to.line,
      ch :   arrayPos.from.ch + charCount
    }
    

    obj.marks[ patternName ].length = 0
    obj.locations[ patternName ].length = 0
    
    //arrayPos.to.ch += diff
    if( arrayPos.from.line > arrayPos.to.line ) arrayPos.from.line = arrayPos.to.line
    arrayPos.to.line = arrayPos.from.line
    // console.log( arrayPos.from.ch, arrayPos.to.ch, arrayPos.from.line, arrayPos.to.line )
    cm.replaceRange( newPatternText, arrayPos.from, arrayPos.to )

    for( var i = 0; i < this.values.length; i++ ) {
      var value = this.values[ i ],
           __name = objName + '_' + patternName +'_' + i,
          length = ( value + '' ).length

      start.ch = arrayPos.from.ch + charCount
      end.ch   = start.ch + length

      charCount += i !== this.values.length - 1 ? length + joinLength : length

      obj.marks[ patternName ].push( 
        cm.markText( start, end, { 
          className:__name, inclusiveLeft:true, inclusiveRight:true,
          //css:"border-width:0; border-color:transparent; border-style:solid"
          css:'padding:0; border-width:0; border-top-width:1px; border-bottom-width:1px; display:inline-block; border-color:transparent; border-style:solid; box-sizing:border-box;',
          startStyle:'leftBorder',
          endStyle:  'rightBorder'
        }) 
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
        if( key !== 'global' ) { // IMPORTANT: MUST OCCUR BEFORE CLEARING MARKS TO RESTORE ORIGINAL TEXT
          var propName = key.split('_')[0], propIndex, prop, hasIndex = false

          if( $.isNumeric( propName[ propName.length - 1 ] ) ) {
            var idx = parseInt( propName[ propName.length - 1 ] )
            propName = propName.slice( 0,-1 )
            prop = obj[ propName ][ idx ]
          }else{
            prop = obj[ propName ]
          }

          if( typeof prop  === 'undefined' || prop  === null ) { /* console.log("CONTINUING", key ); */ continue; }

          propIndex = Gibber.Environment.Notation.priority.indexOf( prop.values )

          if( propIndex > -1 && $.isPlainObject( prop.values ) ) {
            if( typeof prop.values.restoreOriginalText === 'function' ) {
              prop.values.restoreOriginalText()
              if( typeof prop.durations.restoreOriginalText === 'function' ){
                prop.durations.restoreOriginalText()
              }
              Gibber.Environment.Notation.priority.splice( propIndex, 2 )
            }
          }
        }
        
        var marks = this.marks[ key ]
        for( var i = 0; i < marks.length; i++ ) {        
          if( marks[ i ].height ) { // in case this is a line handle
            var cm = marks[i].parent.parent.cm
            cm.removeLineClass( marks[i].lineNo(), marks[i].wrapClass )
          }else{
            marks[ i ].clear()
          }
        }
        //console.log("KEY", key, key.split('_')[0] )
      }

      this.marks = {}
      this.locations = {}
    }
  }
  
  
  obj.marks.global = [ mark ]
  
  return mark
}

var markArray = function( values, treeNode, object, objectName, patternName, pos, cm, location, src ) {
  var pattern,
      //hasSeqNumber = patternName.indexOf('[') > -1,
      split = patternName.split( '_' ), 
      lastChar = split[0][ split[0].length - 1 ],
      hasSeqNumber = !isNaN( lastChar ),
      seqNumber

  if( hasSeqNumber ) {
    seqNumber = parseInt( lastChar )
    var propName = split[0].substring( 0, split[0].length - 1 ) 
    pattern = object[ propName ][ seqNumber ][ split[1] ]
  }else{
    pattern = object[ split[0] ][ split[1] ]    
  }

  pattern.column = cm.column
  pattern.object = object

  if( typeof src === 'undefined' ) src = location
  
  if( src && !pattern.arrayText ) {
    if( values.length !== 1 ) {
      pattern.arrayText = src.substring( treeNode.range[0], treeNode.range[1] );
      pattern.originalArrayText = pattern.arrayText.slice(0)
      pattern.arrayMark = cm.markText( 
        { line: pos.start ? pos.start.line : pos.line - 1, ch: pos.start ? pos.start.column : treeNode.range[0] }, 
        { line:pos.end ? pos.end.line : pos.line - 1, ch:pos.end ? pos.end.ch : treeNode.range[1] } 
      )
    }else{
      var loc = values[0].loc
      pattern.arrayText = src.substring( loc.start.column, loc.end.column );
      pattern.originalArrayText = pattern.arrayText.slice(0)
      pattern.arrayMark = cm.markText( 
        { line: pos.start.line + loc.start.line - 1, ch: loc.start.column }, 
        { line: pos.end.line + loc.end.line - 1, ch:loc.end.column } 
      )
    }
  }
  
  for( var i = 0; i < values.length; i++ ) {
    var value = values[ i ],
     		__name = objectName.replace('.','') + '_' + patternName + '_' + i,
        index = i,
				start, end
    
    if( value === null ) { // whitespace, used for rests in sequences
      var startColumn, endColumn,
          prevValue = i > 0 ? values[ i - 1 ] : null,
          nextValue = i < values.length - 1 ? values[ i + 1 ] : null,
          lineNumber = pos.start.line - 1 //+ loc.start.line - 1
      
      if( prevValue ) {
        startColumn = prevValue.loc.end + 1
      }else{
        startColumn = pos.start.column + 1
      }
       
      if( nextValue ) {
        endColumn = nextValue.loc.start - 1
      }else{
        endColumn = pos.end.column - 1
      }
      
      value = {
        loc: {
          start:{ column: startColumn, line: lineNumber },
          end:{ column: endColumn, line: lineNumber }
        }
      }
    }
    
    if( typeof location !== 'object' ) { // Drums and EDrums pass location, otherwise src code as string
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

    var mark = cm.markText( start, end, { 
      className:__name, inclusiveLeft:true, inclusiveRight:true, 
      css:'padding:0; border-width:0; border-top-width:1px; border-bottom-width:1px; display:inline-block; border-color:transparent; border-style:solid; box-sizing:border-box;',
      startStyle:'leftBorder',
      endStyle:  'rightBorder'
    });

    
    object.marks[ patternName ].push( mark )
    object.locations[ patternName ].push( __name )
  }
}

var getConstructorName = function( callee ) {
  return callee.name ? callee.name : callee.object.object ? callee.object.object.callee.name : callee.object.callee.name
}

module.exports = function( Gibber, Notation ) {

  Notation.replacementFunctions = {
    Euclid: arrayReplacementFunc,
    E: arrayReplacementFunc
  }

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
    
    // if ctrl+enter to execute line, instead of block or selection
    if( !pos.start ) {
      pos = {
        start:{line:pos.line, ch:0 }, 
        end:{line:pos.line, ch:src.length }
      }
    }
    
    if( obj.type === 'ExpressionStatement' && obj.expression.type === 'AssignmentExpression' ) {
      var left = obj.expression.left, right = obj.expression.right, newObjectName = left.name, newObject = null
 
      if( left.type === 'MemberExpression' && obj.expression.operator === '=' ) { // not *=, /=, -= etc.
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
            //if( !Gibber.Environment.Notation.features.seq ) continue;
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
              
              if( !Gibber.Environment.Notation.selected[ 'seq'] ) return
              markArray( values[0].value, object, newObject, newObjectName, patternName, pos, cm, location, src )
              
              pattern.update = createUpdateFunction( newObject, patternName, [255,0,0], [127,0,0] )
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
              var hasSeqNumber = prevObject.arguments.length > 2,
                  isAutofire   = prevObject.arguments.length === 1,
                  loopLength   = isAutofire ? 1 : 2,
                  seqNumber = hasSeqNumber ? prevObject.arguments[2].value : null

              for( var i = 0; i < loopLength; i++ ) { // 2 is values + duration but not seqNumber
                !function() {
                  var values = prevObject.arguments[i].elements,
                      valuesOrDurations = i === 0 ? 'values' : 'durations',
                      propName = object.object.property.name,
                      patternName = hasSeqNumber ? propName + seqNumber + '_' + valuesOrDurations : propName + '_' + valuesOrDurations,
                      isFunc = false
                  
                  newObject.marks[ patternName ] = []
                  newObject.locations[ patternName ] = []
                  
                  if( !Gibber.Environment.Notation.selected[ 'seq'] ) return
                  
                  var isArray = true
                  if( !values ) {
                    if( prevObject.arguments[i].callee ) { // if it is an array with a random or weight method attached..
                      if( prevObject.arguments[i].callee.object && prevObject.arguments[i].callee.object.elements ) {
                        values = prevObject.arguments[i].callee.object.elements; // use the array that is calling the method
                      }else{
                        isFunc = typeof newObject[ propName ][ valuesOrDurations ].values[0] === 'function'
                        values = [ prevObject.arguments[i] ] // Rndf or Rndi or any anonymous function. TODO: single literal values
                        isArray = false
                        var replacementFunction = Gibber.Environment.Notation.replacementFunctions[ values[0].callee.name ]

                        //if( replacementFunction ) 
                        //  values[0].replacementFunction = replacementFunction// Gibber.Environment.isEuclid = true
                        //  var isEuclid = true
                        //}
                      }
                    }else{
                      if( typeof newObject[ propName ][ valuesOrDurations ].values[0] === 'function' ) {
                        isFunc = true
                      }
                       
                      values = [ prevObject.arguments[i] ]
                      isArray = false   
                    }
                  }
                  
                  
                  var seq = newObject,
                      _name_ = object.object.property.name, 
                      pattern = hasSeqNumber ? seq[ _name_ ][ seqNumber ][ valuesOrDurations ] : seq[ _name_ ][ valuesOrDurations ]
                  
                  pattern.cm = cm
                  
                  if( seq[ _name_ ] && pattern.filters ) {
                      var start, end, 
                          valuesStart = isArray ? prevObject.arguments[i].range[0] + 1 : prevObject.arguments[i].range[0], 
                          valuesEnd   = isArray ? prevObject.arguments[i].range[1] - 1 : prevObject.arguments[i].range[1]
                    
                    // TODO: if code is executed in a large block, valuesStart and valuesEnd gives position in the entire
                    // block. HOWEVER, src only represnets the current individual expression being exectued. So this only
                    // works the expression is executed individually.
                    
                    pattern.arrayText = src.substring( valuesStart, valuesEnd );
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

                    if( replacementFunction ) {
                      values = replacementFunction( pattern, cm, object, start, end )
                    }

                    pattern.arrayMark = cm.markText( start, end );
                  }

                  markArray( values, object, newObject, newObjectName, patternName, pos, cm )

                  pattern.update = createUpdateFunction( newObject, patternName, Gibber.Environment.Notation.phaseIndicatorColor, Gibber.Environment.Notation.phaseIndicatorColorMute, isFunc )
                  pattern.update.pattern = pattern
                  
                  pattern.restoreOriginalText = function() {
                    if( this.arrayText === this.originalArrayText ) return
                    this.arrayText = this.originalArrayText

                    var mark = !this.arrayMark ? this.values[0].arrayMark.find() : this.arrayMark.find()

                    if( replacementFunction ) { 
                      this.cm.replaceRange( '', mark.from, mark.to )
                    }else{
                      this.cm.replaceRange( this.arrayText, mark.from, mark.to )
                    }
                  }

                  if( isFunc ) pattern.update.clear = pattern.restoreOriginalText.bind( pattern )

                  Notation.add( pattern, true )

                  pattern.filters.push( function() {
                    pattern.update.shouldTrigger = true
                    pattern.update.index = arguments[0][2]

                    return arguments[0]
                  })

                  pattern.onchange = createOnChange( newObject, newObjectName, patternName, cm, ',', seqNumber )
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
        
        // $.subscribe( '/gibber/clear', function() {
        //   if( newObject.clearMarks )
        //     newObject.clearMarks()
        // })
    
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

        if( constructorName === 'Seq' && Gibber.Environment.Notation.selected[ 'seq' ] ) {
          makeSequence( newObject, cm, pos, right, newObjectName )
        } else if( right.arguments && right.arguments.length > 0 && Gibber.Environment.Notation.enabled[ 'reactive' ] ) {
          var propertyKeys = Object.keys( newObject.mappingProperties )

          //console.log('FOUND NOT SEQ  REACTIVE ASSIGNMENT')
          for( var ii = 0; ii < right.arguments.length; ii++ ) {
            ( function() {
              var arg = right.arguments[ ii ]
              if( arg.type === 'Literal' ) {
                var literal = arg, 
                    _start = {line: start.line, ch:literal.loc.start.column },
                    _end = {line: start.line, ch:literal.loc.end.column },
                    key = propertyKeys[ ii ],
                    mappingObject = newObject.mappingProperties[ key ]
                
                var __move = makeReactive( literal, cm, _start, _end, newObject, newObjectName, key, mappingObject )

                __move.onchange = function( v ) {
                  newObject[ key ] = v
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
    else if( obj.type === 'ExpressionStatement' && obj.expression.type === 'CallExpression' ) { // e.g. drums.note.values.rotate.seq( 1,1 )
      if( src.indexOf( 'seq' ) > -1 && src.indexOf( 'Notation.on' ) === -1 ) {
        var args = obj.expression.arguments,
            nextObject = obj.expression.callee,
            object = null,
            caller = null, prevObject = null, pattern = null, path = [], property = null, hasSeqNumber = typeof args[2] !== 'undefined', seqNumber
        
        var count = 0    
        while( typeof nextObject !== 'undefined' ) {
          object = nextObject
          if( count++ !== 0 && nextObject.property ) {
            if( nextObject.property.type === 'Literal' ) { // array index, a.note[0].values etc.
              path.push( nextObject.property.value  )
            }else{
              path.push( nextObject.property.name )
            }
          }/*else if( nextObject.type === 'Identifier' ) {
            path.push( nextObject.name )
          }*/
          
          nextObject = nextObject.object
        }
        path.reverse()
        
        var propertyName = ''
        
        //console.log( "PATH LENGTH", path.length, path, object.name   )
        
        if( hasSeqNumber ) {
          seqNumber = args[2].raw
        }
        
        switch( path.length ) {
          case 1: //a.note.seq
            if( hasSeqNumber ) {
              caller = window[ object.name ]//[ seqNumber ]
              propertyName = path[0] + seqNumber
            }else{
              caller = window[ object.name ]
              propertyName = path[0]
            }

            break;
          case 2: //a.position.x.seq or a.note[0].seq? what about Gibber.scale.root?            
            if( hasSeqNumber ) {
              caller = window[ object.name ][ path[0] ]
              propertyName = object.name + '.' + path[ 1 ] + seqNumber
            }else{
              caller = window[ object.name ][ path[0] ]
              propertyName = path[1] // object.name + '.' + path[0] + '.' + path[ 1 ]  
            }
            
            break;
          case 3:
            // a.note.values.rotate.seq
            // console.log( "OBJ NAME", object.name, path[0], path[1], path[2] )
            caller = window[ object.name ][ path[0] ][ path[1] ]
            propertyName = path[2]
            break;
          case 4: // a.note[0].values.rotate.seq  for example...
            caller = window[ object.name ][ path[0] ][ path[1] ][ path[2] ]
            propertyName = object.name  + '.' + path[0] + '[' + path[1] + ']' + '.' + path[2] + '.' + path[3]//+ '.' + path.join('.')
            break;
        }
                
        
        // console.log( path, propertyName, path.length, caller, path[0], path[1], path[2] )
        if( path.length === 1 ) {
          property = caller[ path[0] ]
        }else if( path.length === 2 ) {
          // property = caller[ path[0] ][ path[1] ]
          property = caller[ path[1] ]//[ path[1] ]
        }else if( path.length === 3 ) {
          property = caller[ path[2] ]
        }else if( path.length === 4 ) {
          property = caller[ path[2] ][ path[3] ]
        }else{
          property = caller[ path[0] ]
        }
        
        if( !caller.marks ) {
          caller.marks = {}
          caller.locations = {}
          // caller.clearMarks = function() {
          //   for( var key in this.marks ) {
          //     var marks = this.marks[ key ]
          //     for( var i = 0; i < marks.length; i++ ) {        
          //       if( marks[ i ].height ) { // in case this is a line handle
          //         var cm = marks[i].parent.parent.cm
          //         cm.removeLineClass( marks[i].lineNo(), marks[i].wrapClass )
          //       }else{
          //         marks[ i ].clear()
          //       }
          //     }
          //   }
          //       
          //   this.marks = {}
          //   this.locations = {}
          // }
        }
        
        for( var _j = 0; _j < args.length; _j++ ) { // 2 is values & durations but not seqNumber
          !function( j ) {
            if( typeof args[j] === 'undefined' ) return
            
            var values = args[ j ].elements,
                valuesOrDurations = j === 0 ? 'values' : 'durations',
                //propertyName = obj.expression.callee.object.property.name,
                isArray = true, isFunc = false
            
            if( !values ) {
              //console.log( args[j] )
              if( args[j].callee ) { // if it is an array with a random or weight method attached..
                if( args[j].callee.object && args[j].callee.object.elements ) {
                  values = args[j].callee.object.elements; // use the array that is calling the method
                }else{
                  // Rndf or Rndi or any anonymous function. TODO: single literal values
                  values = [ args[j] ]
                  isFunc = true
                  isArray = false
                  var replacementFunction = Gibber.Environment.Notation.replacementFunctions[ args[j].callee.name ]
                }
              }else{
                values = [ args[j] ]
                isArray = false 
              }
            }
            //console.log( valuesOrDurations, propertyName, property )
            var seq = caller,
                _name_ = propertyName,
                patternName = propertyName + '_' + valuesOrDurations,
                pattern = property[ valuesOrDurations ]

            pattern.originalArrayText = '' // values.toString()           
            caller.marks[ patternName ]     = []
            caller.locations[ patternName ] = []
            
            if( !Gibber.Environment.Notation.selected[ 'seq'] ) return
            //console.log( patternName, caller )
            // XXX
            if( replacementFunction ) { 
              values = replacementFunction( pattern, cm, object, start, end )
            }
            markArray( values, object, caller, object.name, patternName, pos, cm, src )
            
            pattern.cm = cm

            pattern.filters.push( function() {
              pattern.update.shouldTrigger = true
              pattern.update.index = arguments[0][2]
              pattern.update.value = arguments[0][0]
              
              return arguments[0]
            })
                        
            pattern.onchange = createOnChange( caller, object.name, patternName, cm, ',', seqNumber )

            pattern.update = createUpdateFunction( caller, patternName, Gibber.Environment.Notation.phaseIndicatorColor, Gibber.Environment.Notation.phaseIndicatorColorMute, isFunc )
            pattern.update.pattern = pattern
            
            pattern.restoreOriginalText = function() {
              if( this.arrayText === this.originalArrayText ) return
              this.arrayText = this.originalArrayText
        
              var mark = !this.arrayMark ? this.values[0].arrayMark.find() : this.arrayMark.find()

              this.cm.replaceRange( this.arrayText, mark.from, mark.to )
            }
            
            Notation.add( pattern, false )           
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
          
          newObject.marks.draganddrop = mark //newObject.marks.push( mark )
        
          if( left ) {
            // console.log( 'MAKING A DROP', className, newObjectName )
            // apparently cm.markText isn't synchronous
            future( function() {
              $( '.' + className ).on( 'drop', function( e ) { 
                //console.log( 'GOT A DROP ', className, newObjectName )
                //console.log( "DROP", e )
                window[ newObjectName ].ondrop( e.originalEvent.dataTransfer.items || e.originalEvent.dataTransfer.files )
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
                      //console.log( 'VALUE', name ) 
                      if( value.type !== 'BinaryExpression' ) {
                        if( !mappingObject && (name !== 'note' && name !== 'frequency') ) return
                        // only change inside quotes if string literal

                        if( Gibber.Environment.Notation.enabled.reactive ) {
                          if( isNaN( value.value ) ) {
                            start.ch += 1
                            end.ch -=1
                          }
                          //console.log( 'REACTIVE NOTE SEQ' ) 
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
                      seq.marks.global.push( mark )
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
                  seq.marks.global.push( mark )
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
    
    if( !obj.marks.properties ) obj.marks.properties = {}
    
    obj.marks.properties[ propertyName ] =  mark
        
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
        if( typeof this.changed[i].restoreOriginalText === 'function' ) {
          this.changed[i].restoreOriginalText()
        }
      }
      this.changed.length = 0
      this.dirty.length = 0 
    },
    fps: 30,
    check: function() {
      for( var i = 0; i < this.dirty.length; i++ ) {
        var dirty = this.dirty[ i ]
        if( this.changed.indexOf( dirty ) === -1 ) this.changed.push( dirty )
        if( typeof dirty.onchange === 'function' ) {
          dirty.onchange()
        }
        if( Array.isArray( dirty.updateFunctions ) ) {
          for( var j = 0; j < dirty.updateFunctions.length; j++ ) {
            dirty.updateFunctions[ j ]()
          }
        }
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
