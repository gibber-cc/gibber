module.exports = function( Gibber ) {
   const gen = Gibber.Gen.make  

   // will use this in a few places...
   const beats = b => {
     return phasor( Gibber.Utilities.btof( b ), 0, { min:0 } )
   }

   // needs to support changing values in more than one place
   // in the graph, hence the array of __params.
   const addProp = ( obj, prop, __params, __value ) => {
     let value = __value
     Object.defineProperty( obj, prop, {
       configurable:true,
       get() { return value },
       set(v) {
         value = v
         for( let __param of __params ) {
           __param.value = value
         }
       }
     })
   }

   const WavePatterns = {
     Beats( numBeats ) {
       const ugen = gen( beats( numBeats ) )
       ugen.isGen = ugen.__wrapped__.isGen = true
       
       return ugen 
     },

     SineR( period, gain, bias=0 ) {
       const ugen =  gen( floor( add( bias, mul( cycle( Gibber.Utilities.btof( period ) ), gain ) ) ), ['bias', 'frequency', 'gain'] )
       ugen.isGen = ugen.__wrapped__.isGen = true

       return ugen
     },

     LineR( period, from=0, to=1 ) {
       const b = beats( period )

       const diff = sub( to, from )
       const mult = mul( b, diff )
       const adder = add( from, mult )
       const ugen = gen( round( adder ) )
       
       addProp( ugen, 'from', [ ugen.p0, ugen.p4 ], from )
       addProp( ugen, 'to', [ ugen.p3 ], to )
       addProp( ugen, 'period', [ ugen.p1 ], period )

       const oldSetter = Object.getOwnPropertyDescriptor( ugen, 'period' ).set
       const oldGetter = Object.getOwnPropertyDescriptor( ugen, 'period' ).get

       Object.defineProperty( ugen, 'period', {
         get() { return oldGetter() },
         set(v) {
            oldSetter( btof(v) )
         }

       })
       
       ugen.isGen = ugen.__wrapped__.isGen = true

       return ugen
     },

     Line( period, from=0, to=1 ) {
       const b = beats( period )

       const diff = sub( to, from )
       const mult = mul( b, diff )
       const adder = add( from, mult )
       const ugen = gen( adder )
       
       addProp( ugen, 'from', [ ugen.p0, ugen.p4 ], from )
       addProp( ugen, 'to', [ ugen.p3 ], to )
       addProp( ugen, 'period', [ ugen.p1 ], period )

       const oldSetter = Object.getOwnPropertyDescriptor( ugen, 'period' ).set
       const oldGetter = Object.getOwnPropertyDescriptor( ugen, 'period' ).get

       Object.defineProperty( ugen, 'period', {
         get() { return oldGetter() },
         set(v) {
            oldSetter( btof(v) )
         }

       })

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
