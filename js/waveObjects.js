module.exports = function( Gibber ) {
   const gen = Gibber.Gen.make  

   // will use this in a few places...
   const beats = b => {
     return phasor( Gibber.Utilities.btof( b ), 0, { min:0 } )
   }

   const WavePatterns = {
     Beats( numBeats ) {
       const ugen = gen( beats( numBeats ) )
       ugen.isGen = ugen.__wrapped__.isGen = true
       
       return ugen 
     },

     SineR( period, gain ) {
       const ugen =  gen( floor( mul( cycle( Gibber.Utilities.btof( period ) ), gain ) ), ['frequency', 'gain'] )
       ugen.isGen = ugen.__wrapped__.isGen = true

       return ugen
     },

     LineR( period, from=0, to=1 ) {
       const b = beats( period )
       b.options.min = from; b.options.max = to
       const ugen = gen( round( b ) )
       //const ugen = gen round( add( from, mul( beats( period ), to-from ) ) ), ['from', 'period','reset', 'range'] )
       ugen.isGen = ugen.__wrapped__.isGen = true

       return ugen
     }
   }

   // stores names so that annotations will correctly interpret this as a gen object
   for( let key in WavePatterns ) {
     Gibber.Gen.names.push( key )
   }

  return WavePatterns
}
