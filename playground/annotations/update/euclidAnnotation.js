const Utility = require( '../utilities.js' )
const $ = Utility.create

module.exports = ( patternObject, marker, className, cm, track, patternNode, Marker ) => {
  let val ='/* ' + patternObject.values.join('')  + ' */',
      pos = marker.find(),
      end = Object.assign( {}, pos.to ),
      annotationStartCh = pos.from.ch + 3,
      annotationEndCh   = annotationStartCh + 1,
      memberAnnotationStart   = Object.assign( {}, pos.from ),
      memberAnnotationEnd     = Object.assign( {}, pos.to ),
      initialized = false,
      markStart = null,
      commentMarker,
      currentMarker, chEnd

  patternObject.__delayAnnotations = false
  end.ch = pos.from.ch + val.length

  pos.to.ch -= 1
  cm.replaceRange( val, pos.from, pos.to )

  patternObject.commentMarker = cm.markText( pos.from, end, { className, atomic:false })
  patternObject.__onclick = e => {
    if( e.altKey == true ) {
      console.log( 'click', e.shiftKey )
      if( e.shiftKey === true ) {
        patternObject.reset()
      }else{
        patternObject.__frozen = !patternObject.__frozen
      }
    }
  }

  setTimeout( ()=> {
    document.querySelector( '.' + className ).onclick = patternObject.__onclick
  }, 500 )

  if( track.markup === undefined ) Marker.prepareObject( track )
  track.markup.textMarkers[ className ] = {}

  let mark = () => {
    // first time through, use the position given to us by the parser
    let range,start, end

    // get new position in case the pattern has moved via inserted line breaks 
    const pos = patternObject.commentMarker.find()
    if( pos === undefined ) return
    let memberAnnotationStart   = Object.assign( {}, pos.from ),
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
          'className': `${className}_${i} euclid`
        }
      )

      memberAnnotationStart.ch += 1
      memberAnnotationEnd.ch   += 1

      setTimeout( ()=> {
        document.querySelector( `.${className}_${i}` ).onclick = patternObject.__onclick
      }, 50 )
    }

    if( start !== undefined ) {
      start.ch -= 3
      end = Object.assign({}, start )
      end.ch = memberAnnotationEnd.ch + 3
      patternObject.commentMarker = cm.markText( start, end, { className, atomic:true })
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

  patternObject._onchange = () => {
    //let delay = Utility.beatsToMs( 1,  Gibber.Scheduler.bpm )

    // markStart is a closure variable that will be used in the call to mark()
    markStart = track.markup.textMarkers[ className ][ 0 ].find()
    markEnd   = track.markup.textMarkers[ className ][ patternObject.values.length - 1  ].find()

    if( markStart !== undefined && markEnd !== undefined ) { 
      marker.doc.replaceRange( '' + patternObject.values.join(''), markStart.from, markEnd.to )
    }

    //for( let i = 0; i < patternObject.values.length; i++ ) {

    //  let markerCh = track.markup.textMarkers[ className ][ i ],
    //      pos = markerCh.find()

    //  // break for loop and remark pattern if a character
    //  // isn't found
    //  if( pos === undefined ) {
    //    break
    //  }

    //  marker.doc.replaceRange( '' + patternObject.values[ i ], pos.from, pos.to )
    //}

    mark()
  }

  patternObject.clear = () => {
    const commentPos = patternObject.commentMarker.find()

    // if this gets called twice...
    if( commentPos === undefined ) return

    // check to see if the last character is a parenthesis... if so we could
    // not add 1 to commentPos.to.ch so that we don't accidentally delete it.
    const end = { line:commentPos.to.line, ch:commentPos.to.ch+1 } 
    const text = cm.getRange( commentPos.from, end )
    const replacement = text[ text.length - 1 ] === ')' ? ')' : '' 

    cm.replaceRange( replacement, commentPos.from, end )
    patternObject.commentMarker.clear()
  }

  // XXX remove global reference somehow...
  Gibber.subscribe( 'clear', patternObject.clear )

  return update 
}

