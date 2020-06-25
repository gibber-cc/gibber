const $ = Utility.create

module.exports = function( node, cm, track, objectName, state, cb ) {
  const Marker = Environment.codeMarkup // tsk tsk tsk global...

  // accomodate directly passing pattern for annotation instead of name, for Triggers
  const patternObject = typeof objectName === 'string' ? window[ objectName ].seq.values : objectName

  // the location of the node containing the drums sequence depends on whether
  // or not a call to .connect() is added to the Drums constructor. 
  const drumsStringNode = node.callee.object !== undefined ? node.callee.object.arguments[0] : node.arguments[0]

  track.markup.textMarkers[ 'pattern' ] = []
  track.markup.textMarkers[ 'pattern' ].children = []

  let nodePosStart = Object.assign( {}, drumsStringNode.loc.start ),
      nodePosEnd   = Object.assign( {}, drumsStringNode.loc.end )

  nodePosStart.line += Marker.offset.vertical - 1 
  nodePosStart.ch = nodePosStart.column + 1
  nodePosEnd.line += Marker.offset.vertical - 1
  nodePosEnd.ch = nodePosEnd.column - 1

  track.markup.textMarkers.string = cm.markText( nodePosStart, nodePosEnd, { className:'euclid' })

  let marker
  const mark = function() {
    let startPos = track.markup.textMarkers.string.find()//{ loc:{ start:{}, end:{}} }
    for( let i = 0; i < drumsStringNode.value.length; i++ ) {
      let pos = { loc:{ start:{}, end:{}} }
      Object.assign( pos.loc.start, startPos.from )
      Object.assign( pos.loc.end  , startPos.to )
      pos.loc.start.ch += i
      pos.loc.end.ch = pos.loc.start.ch + 1

      patternObject.marker = marker = cm.markText( pos.loc.start, pos.loc.end, { className:`step_${ patternObject.id }_${i} euclid` })
      track.markup.textMarkers.pattern[ i ] = marker
    }
  }
  
  mark()

  let span
  const update = () => {
    let currentIdx = update.currentIndex // count++ % step.value.length

    if( span !== undefined ) {
      span.remove( 'euclid0' )
      //span.remove( 'euclid1' )
    }

    let spanName = `.step_${patternObject.id}_${currentIdx}`,
        currentValue = patternObject.update.value

    span = $( spanName )

    span.add( 'euclid0' )
    if( currentValue !== Gibber.Seq.DNR && ( typeof currentValue === 'object' && currentValue.shouldExecute !== 0 ) ) {
      span.add( 'euclid1' )

      setTimeout( ()=> { 
        span.remove( 'euclid1' ) 
        span.add( 'euclid0' )
      }, 50 )
    }
    

    //span.add( 'euclid0' )
  }

  patternObject._onchange = () => {
    //let delay = Utility.beatsToMs( 1,  Gibber.Scheduler.bpm )
    //Gibber.Environment.animationScheduler.add( () => {
    const pos = track.markup.textMarkers.string.find()
    marker.doc.replaceRange( patternObject.values.join(''), pos.from, pos.to )
    track.markup.textMarkers.string = cm.markText( pos.from, pos.to )
    //console.log( pos, track.markup.textMarkers.string )
    mark( pos.from.line ) 
    //}, delay ) 
  }

  patternObject.update = update
  patternObject.update.value = []

  let currentIndex = 0
  Object.defineProperty( patternObject.update, 'currentIndex', {
    get() { return currentIndex },
    set(v){ 
      currentIndex = v; 
      patternObject.update()
    }
  })

  const __clear = patternObject.clear

  patternObject.clear = () => {
    track.markup.textMarkers.string = cm.markText( nodePosStart, nodePosEnd, { className:'euclid' })
    patternObject.reset()
    if( typeof __clear === 'function' ) __clear.call( patternObject )
  }

  Gibber.subscribe( 'clear', patternObject.clear )

  Marker._addPatternFilter( patternObject )
}  

