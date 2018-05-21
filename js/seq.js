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
    //Array.isArray( __values ) ? __values : [ __values ]
    // const timingsPreProcessing = Array.isArray( __timings ) ? __timings : [ __timings ]
    let timings
    if( Array.isArray( __timings ) ) {
      timings  = Audio.Pattern( ...__timings )
    }else{
      timings = Audio.Pattern( __timings )
    }

    timings.filters.push( args => {
      args[ 0 ] = Gibber.Clock.time( args[0] )
      return args
    })

    // console.log( 'timings pattern:', timings )
    // XXX this needs to dynamically lookup the current bpm everytime a timing is accessed...
    // const timings = timingsPreProcessing.map( Audio.Clock.time )

    return Gibberish.Sequencer({ values, timings, target, key })
  }

  return Seq

}
