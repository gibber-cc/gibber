const Gibberish = require( 'gibberish-dsp' )

module.exports = function( Audio ) {

  const Seq = function( props ) { 
    const __values  = props.values
    const __timings = props.timings
    const delay     = props.delay
    const target    = props.target
    const key       = props.key

    let values
    if( Array.isArray( __values ) ) {
      values =  Audio.Pattern( ...__values )
    }else{
      values = Audio.Pattern( __values )
    }

    
    let timings
    if( Array.isArray( __timings ) ) {
      timings  = Audio.Pattern( ...__timings )
    }else if( typeof __timings === 'function' && __timings.isPattern === true ) {
      //console.log( 'found pattern passed to seq' )
      timings = __timings
    }else{
      timings = Audio.Pattern( __timings )
    }

    timings.addFilter( function( args ) {
      if( !isNaN( args[0] ) ) {
        args[ 0 ] = Gibberish.Clock.time( args[0] )
      }

      return args
    })

    //if( key === 'note' ) {
    //  values.addFilter( function( args ) {
    //    args[0] = Gibberish.Theory.Tune.note( args[0] )
    //    return args
    //  })
    //}else if( key === 'chord' ) {
      
    //}

    const seq = Gibberish.Sequencer({ values, timings, target, key })

    seq.clear = function() {
      if( seq.values !== undefined && seq.values.clear !== undefined ) seq.values.clear()
      if( seq.timings !== undefined && seq.timings.clear !== undefined ) seq.timings.clear()
      let idx = Seq.sequencers.indexOf( seq )
      Seq.sequencers.splice( idx, 1 )
    }
    Seq.sequencers.push( seq )

    return seq
  }

  Seq.sequencers = []
  Seq.clear = function() {
    Seq.sequencers.forEach( seq => seq.clear() )
    Seq.sequencers = []
  }

  return Seq

}
