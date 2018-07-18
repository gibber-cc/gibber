module.exports = function( Gibber ) {

  const WavePattern = function( ugen ) {
    
    const fnc = function() {
      return fnc.ugen.__wrapped__.callback.out[0] 
    }

    fnc.ugen = ugen

    return Gibber.Pattern( fnc )
  }

  return WavePattern
}
