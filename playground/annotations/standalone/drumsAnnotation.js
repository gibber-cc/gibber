const Utility = require( '../../../js/utility.js' )
const $ = Utility.create

module.exports = function( node, cm, track, objectName, state, cb ) {
  const Marker = Environment.codeMarkup // tsk tsk tsk global...
  //const steps = node.arguments[ 0 ].properties

  let drumsStringNode = node.callee.object.arguments[0]
  console.log( 'drums annotations:', drumsStringNode )
  track.markup.textMarkers[ 'pattern' ] = []
  track.markup.textMarkers[ 'pattern' ].children = []

  for( let i = 0; i < drumsStringNode.value.length; i++ ) {
    let pos = { loc:{ start:{}, end:{}} }
    Object.assign( pos.loc.start, drumsStringNode.loc.start )
    Object.assign( pos.loc.end  , drumsStringNode.loc.end   )
    pos.loc.start.ch = pos.loc.start.column + 1
    pos.loc.start.line -= 1
    pos.loc.start.ch += i
    pos.loc.end.ch = pos.loc.start.ch + 1
    pos.loc.end.line -= 1
    console.log( i, pos.loc )
    let posMark = cm.markText( pos.loc.start, pos.loc.end, { className:`step_${i}` })
    track.markup.textMarkers.pattern[ i ] = posMark
  }
  

    //let step = steps[ key ].value

    //if( step && step.value ) { // ensure it is a correctly formed step
    //  step.loc.start.line += Marker.offset.vertical - 1
    //  step.loc.end.line   += Marker.offset.vertical - 1
    //  step.loc.start.ch   = step.loc.start.column + 1
    //  step.loc.end.ch     = step.loc.end.column - 1

    //  let marker = cm.markText( step.loc.start, step.loc.end, { className:`step${key}` } )
    //  track.markup.textMarkers.step[ key ] = marker

    //  track.markup.textMarkers.step[ key ].pattern = []

    //  mark( step, key, cm, track )

    //  let count = 0, span, update,
    //    _key = steps[ key ].key.value,
    //    patternObject = window[ objectName ].seqs[ _key ].values

  const patternObject = window[ objectName ].seq.values

  let span
  const update = () => {
    let currentIdx = update.currentIndex // count++ % step.value.length

    if( span !== undefined ) {
      span.remove( 'euclid0' )
      span.remove( 'euclid1' )
    }

    let spanName = `.step_${currentIdx}`,
      currentValue = patternObject.update.value.pop() //step.value[ currentIdx ]

    span = $( spanName )

    if( currentValue !== Gibber.Seq.DO_NOT_OUTPUT ) {
      span.add( 'euclid1' )
      setTimeout( ()=> { span.remove( 'euclid1' ) }, 50 )
    }

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

  Marker._addPatternFilter( patternObject )
}  

