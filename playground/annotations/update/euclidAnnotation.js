const Utility = require( '../utilities.js' )
const $ = Utility.create

module.exports = ( patternObject, marker, className, cm, track, patternNode, Marker ) => {
  
  let out
  if( window.Environment.useComments === true ) {
    let val ='/* ' + patternObject.values.join('')  + ' */',
        pos = marker.find(),
        end = Object.assign( {}, pos.to ),
        annotationStartCh = pos.from.ch + 3,
        annotationEndCh   = annotationStartCh + 1,
        memberAnnotationStart   = Object.assign( {}, pos.from ),
        memberAnnotationEnd     = Object.assign( {}, pos.to ),
        initialized = false,
        markStart = null,
        cssName = className,
        start = pos.from,
        commentMarker,
        currentMarker, chEnd

    patternObject.__delayAnnotations = false
    end.ch = pos.from.ch + val.length

    pos.to.ch -= 1
    cm.replaceRange( val, pos.from, pos.to )
    
    patternObject.markers = []
    patternObject.__isEditing = false

    patternObject.commentMarker = cm.markText( pos.from, end, { className:className + ' gibber_comment', atomic:false })
    //patternObject.__onclick = e => {
    //  if( e.altKey == true ) {
    //    console.log( 'click', e.shiftKey )
    //    if( e.shiftKey === true ) {
    //      patternObject.reset()
    //    }else{
    //      patternObject.__frozen = !patternObject.__frozen
    //    }
    //  }
    //}

    let value = cm.getRange( start , end )
    const intervalCheck = ()=> {
      const pos = arrayMarker.find()
      const current = cm.getRange( pos.from, pos.to )
      if( current !== value ) {
        value = current
        const stripped = value.slice(3,-3) 

        // create a binary number with results and see if it is valid
        // if so we know we have all zeros and ones in the comment annotation
        const numString = `0b${stripped}`
        const num = eval( numString )
        let valid = !isNaN( num )
        //console.log( value, numString, num, valid )

        if( valid ) { 
          let arr
          try{
            // remove 0b from start of number and convert characters to ints
            arr = numString.slice(2).split('').map( v => parseInt(v) )
          } catch( e ) {
            const els = Array.from( document.querySelectorAll( '.' + cssName ) )
            els.forEach( (el,i) => { 
              el.classList.remove('patternEdit')
              el.classList.add( 'patternEditError' )
            })   
          }

          if( Array.isArray( arr ) ) {
            const tmp = Gibber.shouldDelay
            Gibber.shouldDelay = Gibber.Audio.shouldDelay = false 
            patternObject.set( arr )
            Gibber.shouldDelay = tmp

            pos.start = pos.from
            pos.end = pos.to
            pos.horizontalOffset = pos.from.ch

            // XXX using markText would be better clearly, but
            // for some reason I can't get it to work? marking
            // the individual spans does work though

            //patternObject.__editMark = cm.markText( 
            //  pos.from, pos.to, 
            //  { 
            //    className:'patternEdit'
            //  }
            //)

            const els = Array.from( document.querySelectorAll( '.' + cssName ) )
            els.forEach( (el,i) => { 
              el.classList.add( 'patternEdit' )
              el.classList.remove( 'patternEditError' )
            }) 
          }
        }else{
          const els = Array.from( document.querySelectorAll( '.' + cssName ) )
          els.forEach( (el,i) => { 
            el.classList.remove( 'patternEdit' )
            el.classList.add( 'patternEditError' )
          })  
        }
      }
    }

    patternObject.__onclick = e => {
      if( e.altKey == true ) {
      //  if( e.shiftKey === true ) {
      //    patternObject.reset()
      //  }else{
      //    patternObject.__frozen = !patternObject.__frozen
      //  }
      //}else{

        if( !patternObject.__isEditing ) {
          annotationsAreFrozen = true
          const pos = arrayMarker.find()
          patternObject.__editMark = cm.markText( 
            pos.from, pos.to, 
            { 
              className:'patternEdit'
            }
          )
          patternObject.markers.push( patternObject.__editMark )
          patternObject.__interval = setInterval( intervalCheck, 100 )
        }else{
          patternObject.__editMark.clear()
          clearInterval( patternObject.__interval )
        }

        patternObject.__isEditing = !patternObject.__isEditing
      }else if( e.shiftKey === true ) {
          //patternObject.reset()
        //}else{
          patternObject.__frozen = !patternObject.__frozen
        //}
      }
    }
    // timeout needeed because applying css is not synchronous... I think
    //setTimeout( ()=> { 
    //  Array.from( document.querySelectorAll( '.' + cssName ) ).forEach( el => el.onclick = __onclick )
    //}, 500 )
    Marker.arrayPatterns[ cssName ] = patternObject.__onclick
    
    if( track.markup === undefined ) Marker.prepareObject( track )
    track.markup.textMarkers[ className ] = {}
    
    // create marker for entire array...
    // you have to pass the onclick as a string, otherwise codemirror will
    // delete it from spans during random operations. We store the event handler
    // globally so that we can use a closure. 
    const arrayMarker = cm.markText( start, end, { 
      className:cssName,
      attributes:{
        onclick: `Environment.codeMarkup.arrayPatterns['${cssName}']( event )`
      }
    })
    track.markup.textMarkers[ cssName ] = arrayMarker

    const mark = () => {

      // first time through, use the position given to us by the parser
      let range,start, end

      // get new position in case the pattern has moved via inserted line breaks 
      const pos = patternObject.commentMarker.find()
      if( pos === undefined ) return

      const memberAnnotationStart   = Object.assign( {}, pos.from ),
            memberAnnotationEnd     = Object.assign( {}, pos.to )

      if( initialized === false ) {
        memberAnnotationStart.ch = annotationStartCh
        memberAnnotationEnd.ch   = annotationEndCh
        initialized = true
      }else{
        // after the first time through, every update to the pattern store the current
        // position of the first element (in markStart) before replacing. Use this to generate position
        // info. REPLACING TEXT REMOVES TEXT MARKERS.
        range = markStart
        start = range.from
        memberAnnotationStart.ch = start.ch
        memberAnnotationEnd.ch = start.ch + 1 
      }

      for( let i = 0; i < patternObject.values.length; i++ ) {
        window.__ignore = patternObject
        track.markup.textMarkers[ className ][ i ] = cm.markText(
          memberAnnotationStart,  memberAnnotationEnd,
          { 
            'className': `${className}_${i} euclid gibber_comment`
          }
        )

        memberAnnotationStart.ch += 1
        memberAnnotationEnd.ch   += 1

        setTimeout( ()=> {
          const ele = document.querySelector( `.${className}_${i}` )
          if( ele !== null ) ele.onclick = patternObject.__onclick
        }, 50 )
      }

      if( start !== undefined ) {
        start.ch -= 3
        end = Object.assign({}, start )
        end.ch = memberAnnotationEnd.ch + 3
        patternObject.commentMarker = cm.markText( start, end, { className:className + ' gibber_comment', atomic:false })
      }
    }

    mark()

    // XXX: there's a bug when you sequence pattern transformations, and then insert newlines ABOVE the annotation
    let count = 0, span, update, activeSpans = []

    update = () => {
      // XXX what happened??? this should be incremented by 1, and there
      // should be no need for Math.floor
      // works with 1 increment in HexSteps but not in Hex... :(
      count += 1
      let currentIdx = Math.floor( count ) % patternObject.values.length

      if( span !== undefined ) {
        span.remove( 'euclid0' )
      }

      let spanName = `.${className}_${currentIdx}`,
          currentValue = patternObject.values[ currentIdx ]

      span = $( spanName )

      // deliberate ==
      if( currentValue == 1 ) {
        span.add( 'euclid0' )
        span.add( 'euclid1' )
        activeSpans.push( span )
        setTimeout( ()=> { 
          activeSpans.forEach( _span => _span.remove( 'euclid1' ) )
          activeSpans.length = 0 
        }, 50 )
      }else{
        span.add( 'euclid0' )
      }
    }

    let clearing = false
    patternObject._onchange = () => {
      // store cursor position to restore it after ccalling replaceRange
      const cursorpos = marker.doc.getCursor()

      // IMPORTANT: markStart is a closure upvalue that is also used in mark()
      if( clearing === false ) {
        // offset annotation position to ignore starting /* + space
        markStart = arrayMarker.find() 
        markStart.from.ch += 3
        markStart.to.ch += 3

        // end = start + pattern length
        const to = { line: markStart.from.line, ch: markStart.from.ch + patternObject.values.length }

        if( markStart !== undefined ) { 
          marker.doc.replaceRange( '' + patternObject.values.join(''), markStart.from, to )
        }

        mark()
        marker.doc.setCursor( cursorpos )
      }
    }

    patternObject.clear = () => {
      clearing = true
      const commentPos = patternObject.commentMarker.find()

      // if this gets called twice...
      if( commentPos === undefined ) return

      // check to see if the last character is a parenthesis... if so we could
      // not add 1 to commentPos.to.ch so that we don't accidentally delete it.
      const end = { line:commentPos.to.line, ch:commentPos.to.ch+1 } 
      const text = cm.getRange( commentPos.from, end )
      const replacement = text[ text.length - 1 ] === ')' ? ')' : '' 

      cm.replaceRange( replacement, commentPos.from, end )
      if( patternObject.__interval ) clearInterval( patternObject.__interval )
      patternObject.commentMarker.clear()
    }

    // XXX remove global reference somehow...
    Gibber.subscribe( 'clear', patternObject.clear )
    out = update
  }

  if( window.Environment.useComments === false ) {
    out = ()=>{}
  }

  return out 
}

