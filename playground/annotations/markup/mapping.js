module.exports = function( Marker ) {

  let counter = 0

  const Mapping = function( left, right, expression, state ) {
    const src = window[ right.object.name ]
    if( src.mappings === undefined ) src.mappings = []
    const mappingName = `${left.object.name}-${left.property.name}`

    const cm = state.cm

    const start = left.loc.start, end = expression.loc.end
    start.line += Marker.offset.vertical - 1
    end.line += Marker.offset.vertical - 1
    start.ch = start.column
    end.ch   = end.column

    const marker = cm.markText( start, end, { 
      className : mappingName + ' mapping', 
      //css:'text-decoration: underline; text-decoration-color:green; text-decoration-thickness:10%',
      startStyle: `mapping-start ms-${counter++}`
      //inclusiveLeft: true,
      //inclusiveRight: true
    })
    
    /*
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
    */
  }

  return Mapping 
}
