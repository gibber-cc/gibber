module.exports = function( Gibber ) {

let Pattern = Gibber.Pattern

let Hex = function( hexString, time = 1/16, rotation ) {
  let count = 0,
      onesAndZeros = ''

  for( let chr of hexString ) {
    let num = Number( '0x'+chr )

    onesAndZeros += (num & 8) > 0 ? 1 : 0
    onesAndZeros += (num & 4) > 0 ? 1 : 0
    onesAndZeros += (num & 2) > 0 ? 1 : 0
    onesAndZeros += (num & 1) > 0 ? 1 : 0
  } 

  let __onesAndZeros = onesAndZeros.split('') 

  let pattern = Pattern( ...__onesAndZeros ) 
  pattern.isPattern = true

  pattern.time = time

  pattern.output = { time, shouldExecute: 0 }
  
  pattern.addFilter( ( args, ptrn ) => {
    let val = args[ 0 ]

    ptrn.output.time = Gibberish.Clock.time( ptrn.time )
    ptrn.output.shouldExecute = parseInt(val) 

    args[ 0 ] = ptrn.output 

    return args
  })

  pattern.reseed = ( ...args )=> {
    let n, k
    
    if( Array.isArray( args[0] ) ) {
      k = args[0][0]
      n = args[0][1]
    }else{
      k = args[0]
      n = args[1]
    }

    if( n === undefined ) n = 16
    
    out = createStartingArray( n,k )
    let _onesAndZeros = Inner( n,k )
    
    pattern.set( _onesAndZeros )
    pattern.time = 1 / n

    // this.checkForUpdateFunction( 'reseed', pattern )

    return pattern
  }

  //Gibber.addSequencingToMethod( pattern, 'reseed' )

  if( typeof rotation === 'number' ) pattern.rotate( rotation )

  return pattern
}

return Hex

}
