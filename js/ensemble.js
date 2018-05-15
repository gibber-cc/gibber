module.exports = function( Audio ) {
  const Gibberish = Audio.Gibberish
  const Ensemble = function( props ) {
    const cp = {
      shouldAddToUgen:true 
    }

    for( let key in props ) {
      const dict = props[ key ]
      const target = dict.target
      const method = dict.method
      const args = dict.args
      cp[ key ] = {
        play: function( ...args ) { 
          Gibberish.worklet.ugens.get( this.target )[ this.method ]( ...args ) 
        },
        target:target.id,
        method,
        args
      }
    }

    cp.play = function( key ) {
      Gibberish.worklet.ugens.get( this[ key ].target )[ this[ key ].method ]( ...this[ key ].args )
    }

    const ens = Audio.busses.Bus2( cp )

    for( let key in props ) {
      // Audio.Gibberish.worklet.ugens.get( cp[ key ].target ).connect( ens )
      props[ key ].target.connect( ens )
    }

    //ens.seq = Audio.Seq({
    //  target:ens,
    //  key:'play',
    //  values:loopString.split(''),
    //  timings:1 / loopString.length
    //}).start()
    
    return ens
  }

  return Ensemble
}
