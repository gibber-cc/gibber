module.exports = function( Marker ) {
  // Marker.patternMarkupFunctions[ valuesNode.type ]( valuesNode, state, seq, 'values', container, seqNumber )

  const Literal = function( patternNode, state, seq, patternType, container=null, index=0 ) {
    if( patternNode.processed === true ) return 

    const cm = state.cm
    const seqTarget = seq.target // XXX seq.object for gibberwocky
    const patternObject = seq[ patternType ]
    if( patternObject === null || patternObject == undefined ) return

    const [ className, start, end ] = Marker._getNamesAndPosition( patternNode, state, patternType, index )
    const cssName = className

    const marker = cm.markText( start, end, { 
      'className': cssName + ' annotation-border', 
      //inclusiveLeft: true,
      //inclusiveRight: true
    })

    if( seqTarget.markup === undefined ) Marker.prepareObject( seqTarget )

    seqTarget.markup.textMarkers[ className ] = marker

    if( seqTarget.markup.cssClasses[ className ] === undefined ) seqTarget.markup.cssClasses[ className ] = []

    seqTarget.markup.cssClasses[ className ][ index ] = cssName    
    
    patternObject.marker = marker
    Marker.finalizePatternAnnotation( patternObject, className, seqTarget, marker )
  }

  return Literal 

}
