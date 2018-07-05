
const Utility = require( '../../../js/utility.js' )
const $ = Utility.create

module.exports = function( node, cm, track, objectName, vOffset=0 ) {
  let timelineNodes = node.arguments[ 0 ].elements
  //console.log( timelineNodes )
  track.markup.textMarkers[ 'score' ] = []

  for( let i = 0; i < timelineNodes.length; i+=2 ) {
    let timeNode = timelineNodes[ i ],
      functionNode = timelineNodes[ i + 1 ]

    functionNode.loc.start.line += vOffset - 1
    functionNode.loc.end.line   += vOffset - 1
    functionNode.loc.start.ch = functionNode.loc.start.column
    functionNode.loc.end.ch = functionNode.loc.end.column

    let marker = cm.markText( functionNode.loc.start, functionNode.loc.end, { className:`score${i/2}` } )
    track.markup.textMarkers[ 'score' ][ i/2 ] = marker

  }

  let lastClass = 'score0'
  $( '.' + lastClass ).add( 'scoreCurrentIndex' )
  // TODO: global object usage is baaaad methinks?
  
  window[ objectName ].onadvance = ( idx ) => {
    $( '.' + lastClass ).remove( 'scoreCurrentIndex' )
    lastClass = `score${idx}`
    $( '.' + lastClass ).add( 'scoreCurrentIndex' ) 
  }
}
