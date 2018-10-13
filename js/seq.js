const Gibberish = require( 'gibberish-dsp' )

module.exports = function( Audio ) {

  const Seq = function( props ) { 
    const __values  = props.values
    const __timings = props.timings
    const delay     = props.delay
    const target    = props.target
    const key       = props.key
    const priority  = props.priority
    let   rate      = props.rate || 1

    let values
    if( Array.isArray( __values ) ) {
      values =  Audio.Pattern( ...__values )
    }else{
      values = Audio.Pattern( __values )
    }

    if( __values.randomFlag ) {
      values.addFilter( ( args,ptrn ) => {
        const range = ptrn.values.length - 1
        const idx = Math.round( Math.random() * range )
        return [ ptrn.values[ idx ], 1, idx ] 
      })
      //for( let i = 0; i < this.values.randomArgs.length; i+=2 ) {
      //  valuesPattern.repeat( this.values.randomArgs[ i ], this.values.randomArgs[ i + 1 ] )
      //}
    }
    
    let timings
    if( Array.isArray( __timings ) ) {
      timings  = Audio.Pattern( ...__timings )
    }else if( typeof __timings === 'function' && __timings.isPattern === true ) {
      timings = __timings
    }else{
      timings = Audio.Pattern( __timings )
    }

    if( __timings.randomFlag ) {
      timings.addFilter( ( args,ptrn ) => {
        const range = ptrn.values.length - 1
        const idx = Math.round( Math.random() * range )
        return [ ptrn.values[ idx ], 1, idx ] 
      })
      //for( let i = 0; i < this.values.randomArgs.length; i+=2 ) {
      //  valuesPattern.repeat( this.values.randomArgs[ i ], this.values.randomArgs[ i + 1 ] )
      //}
    }

    timings.addFilter( function( args ) {
      if( !isNaN( args[0] ) ) {
        args[ 0 ] = Gibberish.Clock.time( args[0] )
      }

      return args
    })

    const clear = function() {
      this.stop()

      if( this.values !== undefined && this.values.clear !== undefined ) this.values.clear()
      if( this.timings !== undefined && this.timings.clear !== undefined ) this.timings.clear()

      if( Gibberish.mode === 'worklet' ) {
        let idx = Seq.sequencers.indexOf( this )
        Seq.sequencers.splice( idx, 1 )
      }
    }
    //const offsetRate = Gibberish.binops.Mul(rate, Audio.Clock.audioClock )
    // XXX we need to add priority to Sequencer2; this priority will determine the order
    // that sequencers are added to the callback, ensuring that sequencers with higher
    // priority will fire first.
    const seq = Gibberish.Sequencer2({ values, timings, target, key, priority, rate:Audio.Clock.audioClock, clear })



    //Gibberish.worklet.port.postMessage({
    //  address:'addiMethod',
    //  properties:serialize( Clock ),
    //  id:this.id,
    //  post: 'store'    
    //})

    Seq.sequencers.push( seq )

    return seq
  }

  Seq.sequencers = []
  Seq.clear = function() {
    //Seq.sequencers.forEach( seq => seq.clear() )
    for( let i = Seq.sequencers.length - 1; i >= 0; i-- ) {
      Seq.sequencers[ i ].clear()
    }
    Seq.sequencers = []
  }

  return Seq

}
