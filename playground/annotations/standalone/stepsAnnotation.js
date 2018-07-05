const Utility = require( '../../../js/utility.js' )
const $ = Utility.create

module.exports = function( node, cm, track, objectName, state, cb ) {
  const Marker = Gibber.Environment.codeMarkup // tsk tsk tsk global...
  const steps = node.arguments[ 0 ].properties

  track.markup.textMarkers[ 'step' ] = []
  track.markup.textMarkers[ 'step' ].children = []

  const mark = ( _step, _key, _cm, _track ) => {
    for( let i = 0; i < _step.value.length; i++ ) {
      let pos = { loc:{ start:{}, end:{}} }
      Object.assign( pos.loc.start, _step.loc.start )
      Object.assign( pos.loc.end  , _step.loc.end   )
      pos.loc.start.ch += i
      pos.loc.end.ch = pos.loc.start.ch + 1
      let posMark = _cm.markText( pos.loc.start, pos.loc.end, { className:`step_${_key}_${i}` })
      _track.markup.textMarkers.step[ _key ].pattern[ i ] = posMark
    }
  }

  for( let key in steps ) {
    let step = steps[ key ].value

    if( step && step.value ) { // ensure it is a correctly formed step
      step.loc.start.line += Marker.offset.vertical - 1
      step.loc.end.line   += Marker.offset.vertical - 1
      step.loc.start.ch   = step.loc.start.column + 1
      step.loc.end.ch     = step.loc.end.column - 1

      let marker = cm.markText( step.loc.start, step.loc.end, { className:`step${key}` } )
      track.markup.textMarkers.step[ key ] = marker

      track.markup.textMarkers.step[ key ].pattern = []

      mark( step, key, cm, track )

      let count = 0, span, update,
        _key = steps[ key ].key.value,
        patternObject = window[ objectName ].seqs[ _key ].values

      update = () => {
        let currentIdx = update.currentIndex // count++ % step.value.length

        if( span !== undefined ) {
          span.remove( 'euclid0' )
          span.remove( 'euclid1' )
        }

        let spanName = `.step_${key}_${currentIdx}`,
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
  }

}  

