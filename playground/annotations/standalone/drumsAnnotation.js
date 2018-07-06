const Utility = require( '../../../js/utility.js' )
const $ = Utility.create

module.exports = function( node, cm, track, objectName, state, cb ) {
  const Marker = Environment.codeMarkup // tsk tsk tsk global...
  const patternObject = window[ objectName ].seq.values

  let drumsStringNode = node.callee.object.arguments[0]
  console.log( 'drums annotations:', drumsStringNode )
  track.markup.textMarkers[ 'pattern' ] = []
  track.markup.textMarkers[ 'pattern' ].children = []

  for( let i = 0; i < drumsStringNode.value.length; i++ ) {
    let pos = { loc:{ start:{}, end:{}} }
    Object.assign( pos.loc.start, drumsStringNode.loc.start )
    Object.assign( pos.loc.end  , drumsStringNode.loc.end   )
    pos.loc.start.ch = pos.loc.start.column + 1
    pos.loc.start.line += Marker.offset.vertical - 1
    pos.loc.start.ch += i
    pos.loc.end.ch = pos.loc.start.ch + 1
    pos.loc.end.line += Marker.offset.vertical - 1
    //console.log( i, pos.loc )
    let posMark = cm.markText( pos.loc.start, pos.loc.end, { className:`step_${ patternObject.id }_${i}` })
    track.markup.textMarkers.pattern[ i ] = posMark
  }
  
  let span
  const update = () => {
    let currentIdx = update.currentIndex // count++ % step.value.length

    if( span !== undefined ) {
      span.remove( 'euclid0' )
      span.remove( 'euclid1' )
    }

    let spanName = `.step_${patternObject.id}_${currentIdx}`,
      currentValue = patternObject.update.value.pop() //step.value[ currentIdx ]

    span = $( spanName )

    //if( currentValue !== Gibber.Seq.DO_NOT_OUTPUT ) {
    span.add( 'euclid1' )
    setTimeout( ()=> { span.remove( 'euclid1' ) }, 50 )
    //}

    span.add( 'euclid0' )
  }

  patternObject._onchange = () => {
    let delay = Utility.beatsToMs( 1,  Gibber.Scheduler.bpm )
    Gibber.Environment.animationScheduler.add( () => {
      marker.doc.replaceRange( patternObject.values.join(''), step.loc.start, step.loc.end )
      mark( step, key, cm, track )
    }, delay ) 
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

  Marker._addPatternFilter( patternObject )
}  

