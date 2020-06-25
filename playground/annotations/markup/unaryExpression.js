module.exports = function( Marker ) {
  
  // for negative literals e.g. -10
  const UnaryExpression = function( patternNode, state, seq, patternType, container=null, index=0 ) {
    if( patternNode.processed === true ) return 
    const cm = state.cm
    const seqTarget = seq.target
    const patternObject = seq[ patternType ]
    const [ className, start, end ] = Marker._getNamesAndPosition( patternNode, state, patternType, index )
    const cssName = className

    marker = cm.markText( start, end, { 
      'className': cssName + ' annotation', 
      //inclusiveLeft: true,
      //inclusiveRight: true
    })

    if( seqTarget.markup === undefined ) Marker.prepareObject( seqTarget )
    seqTarget.markup.textMarkers[ className ] = marker

    if( seqTarget.markup.cssClasses[ className ] === undefined ) seqTarget.markup.cssClasses[ className ] = []

    seqTarget.markup.cssClasses[ className ][ index ] = cssName    

    let start2 = Object.assign( {}, start )
    start2.ch += 1
    let marker2 = cm.markText( start, start2, { 
      'className': cssName + ' annotation-no-right-border', 
      //inclusiveLeft: true,
      //inclusiveRight: true
    })

    let marker3 = cm.markText( start2, end, { 
      'className': cssName + ' annotation-no-left-border', 
      //inclusiveLeft: true,
      //inclusiveRight: true
    })


    patternObject.marker = marker
    Marker.finalizePatternAnnotation( patternObject, className )
  }

  return UnaryExpression

}
