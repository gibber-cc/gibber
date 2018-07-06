module.exports = function( Marker ) {
  'use strict'

  // CallExpression denotes an array (or other object) that calls a method, like .rnd()
  // could also represent an anonymous function call, like Rndi(19,40)
  const CallExpression = function( patternNode, state, seq, patternType, index=0 ) {
    if( patternNode.processed === true ) return 

    console.log( 'call:', patternNode )
    var args = Array.prototype.slice.call( arguments, 0 )

    if( patternNode.callee.type === 'MemberExpression' && patternNode.callee.object.type === 'ArrayExpression' ) {
      args[ 0 ] = patternNode.callee.object
      args[ 0 ].offset = Marker.offset

      Marker.patternMarkupFunctions.ArrayExpression( ...args )
    } else if (patternNode.callee.type === 'Identifier' ) {
      // function like Euclid or gen~d
      Marker.patternMarkupFunctions.Identifier( ...args )
    }
  }

  return CallExpression
}
