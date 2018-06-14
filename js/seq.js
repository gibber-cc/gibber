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
    }else{
      timings = Audio.Pattern( __timings )
    }

    timings.addFilter( function( args ) {
      args[ 0 ] = Gibberish.Clock.time( args[0] )
      return args
    })

    //if( key === 'note' ) {
    //  values.addFilter( function( args ) {
    //    args[0] = Gibberish.Theory.Tune.note( args[0] )
    //    return args
    //  })
    //}else if( key === 'chord' ) {
      
    //}

    return Gibberish.Sequencer({ values, timings, target, key })
  }

  return Seq

}
