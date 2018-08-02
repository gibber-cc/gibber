const Utility = require( '../../../js/utility.js' )
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

  end.ch = pos.from.ch + val.length

  pos.to.ch -= 1
  cm.replaceRange( val, pos.from, pos.to )

  patternObject.commentMarker = cm.markText( pos.from, end, { className, atomic:false })

  if( track.markup === undefined ) Marker.prepareObject( track )
  track.markup.textMarkers[ className ] = {}

  let mark = () => {
    // first time through, use the position given to us by the parser
    let range,start, end
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
      track.markup.textMarkers[ className ][ i ] = cm.markText(
        memberAnnotationStart,  memberAnnotationEnd,
        { 'className': `${className}_${i} euclid` }
      )

      memberAnnotationStart.ch += 1
      memberAnnotationEnd.ch   += 1
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
    let currentIdx = count++ % patternObject.values.length

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

    // markStart is a closure variable that will be used in the call
    // to mark()
    markStart = track.markup.textMarkers[ className ][ 0 ].find()

    //Gibber.Environment.animationScheduler.add( () => {
      for( let i = 0; i < patternObject.values.length; i++ ) {

        let markerCh = track.markup.textMarkers[ className ][ i ],
            pos = markerCh.find()

        marker.doc.replaceRange( '' + patternObject.values[ i ], pos.from, pos.to )
      }
      mark()
    //}, delay ) 
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

  return update 
}

