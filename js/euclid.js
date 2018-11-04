module.exports = function( Gibber ) {

let Pattern = Gibber.Pattern

let flatten = function(){
   let flat = []
   for ( let i = 0, l = this.length; i < l; i++ ){
     let type = Object.prototype.toString.call( this[ i ]).split(' ').pop().split( ']' ).shift().toLowerCase()

     if (type) { 
       flat = flat.concat( /^(array|collection|arguments|object)$/.test( type ) ? flatten.call( this[i] ) : this[i]) 
     }
   }
   return flat
}

let createStartingArray = function( length, ones ) {
  let out = []
  for( let i = 0; i < ones; i++ ) {
    out.push( [1] )
  }
  for( let j = ones; j < length; j++ ) {
    out.push( 0 )
  }
  return out
}

let printArray = function( array ) {
  let str = ''
  for( let i = 0; i < array.length; i++ ) {
    let outerElement = array[ i ]
    if( Array.isArray( outerElement ) ) {
      str += '['
      for( let j = 0; j < outerElement.length; j++ ) {
        str += outerElement[ j ]
      }
      str += '] '
    }else{
      str += outerElement + ''
    }
  }

  return str
}

let arraysEqual = function( a, b ) {
  if ( a === b ) return true
  if ( a == null || b == null ) return false
  if ( a.length != b.length ) return false

  for ( let i = 0; i < a.length; ++i ) {
    if ( a[ i ] !== b[ i ] ) return false
  }

  return true
}

let getLargestArrayCount = function( input ) {
  let length = 0, count = 0

  for( let i = 0; i < input.length; i++ ) {
    if( Array.isArray( input[ i ] ) ) { 
      if( input[ i ].length > length ) {
        length = input[ i ].length
        count = 1
      }else if( input[ i ].length === length ) {
        count++
      }
    }
  }

  return count
}

let Euclid = function( ones, length, time, rotation ) {
  let count = 0,
      out = createStartingArray( length, ones ),
      onesAndZeros

 	function Inner( n,k ) {
    let operationCount = count++ === 0 ? k : getLargestArrayCount( out ),
        moveCandidateCount = out.length - operationCount,
        numberOfMoves = operationCount >= moveCandidateCount ? moveCandidateCount : operationCount

    if( numberOfMoves > 1 || count === 1 ) {
      for( let i = 0; i < numberOfMoves; i++ ) {
        let willBeMoved = out.pop(), isArray = Array.isArray( willBeMoved )
        out[ i ].push( willBeMoved )
        if( isArray ) { 
          flatten.call( out[ i ] )
        }
      }
    }

    if( n % k !== 0 ) {
      return Inner( k, n % k )
    }else {
      return flatten.call( out )
    }
  }
  
  onesAndZeros = Inner( length, ones )

  let pattern = Gibber.Pattern( ...onesAndZeros )

  if( isNaN( time ) || time === null ) time = 1 / onesAndZeros.length

  pattern.time = time

  // re-use to avoid GC in worklet processor
  pattern.output = { time, shouldExecute:0 }

  pattern.addFilter( ( args, ptrn ) => {
    let val = args[ 0 ]

    ptrn.output.time = Gibberish.Clock.time( ptrn.time )
    ptrn.output.shouldExecute = val 

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

  // out = calculateRhythms( onesAndZeros, dur )
  // out.initial = onesAndZeros
  if( typeof rotation === 'number' ) pattern.rotate( rotation )
  return pattern //out
}
// E(5,8) = [ .25, .125, .25, .125, .25 ]
let calculateRhythms = function( values, dur ) {
  let out = []
  
  if( typeof dur === 'undefined' ) dur = 1 / values.length

  let idx = 0,
      currentDur = 0
  
  while( idx < values.length ) {
    idx++
    currentDur += dur
    
    if( values[ idx ] == 1 || idx === values.length ) {
      out.push( currentDur )
      currentDur = 0
    } 
  }
  
  return out
}

let answers = {
  '1,4' : '1000',
  '2,3' : '101',
  '2,5' : '10100',
  '3,4' : '1011',
  '3,5' : '10101',
  '3,7' : '1010100',
  '3,8' : '10010010',
  '4,7' : '1010101',
  '4,9' : '101010100',
  '4,11': '10010010010',
  '5,6' : '101111',
  '5,7' : '1011011',
  '5,8' : '10110110',
  '5,9' : '101010101',
  '5,11': '10101010100',
  '5,12': '100101001010',
  '5,16': '1001001001001000',
  '7,8' : '10111111',
  '11,24': '100101010101001010101010'
}

Euclid.test = function( testKey ) {
  let failed = 0, passed = 0

  if( typeof testKey !== 'string' ) {
    for( let key in answers ) {
      let expectedResult = answers[ key ],
          result = flatten.call( Euclid.apply( null, key.split(',') ) ).join('')

      console.log( result, expectedResult )

      if( result === expectedResult ) {
        console.log("TEST PASSED", key )
        passed++
      }else{
        console.log("TEST FAILED", key )
        failed++
      }
    }
    console.log("*****************************TEST RESULTS - Passed: " + passed + ", Failed: " + failed )
  }else{
    let expectedResult = answers[testKey],
				result = flatten.call( Euclid.apply( null, testKey.split(',') ) ).join('')

    console.log( result, expectedResult )

    if( result == expectedResult ) {
      console.log("TEST PASSED FOR", testKey)
    }else{
      console.log("TEST FAILED FOR", testKey)
    }
  }
}

return Euclid
}
