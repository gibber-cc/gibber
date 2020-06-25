module.exports = function( Marker ) {
  'use strict'

  // 1/4, 1/8 etc.
  const BinaryExpression = function( patternNode, state, seq, patternType,container=null, index=0 ) {
    if( patternNode.processed === true ) return 
    const cm = state.cm
    const seqTarget = seq.target //XXX in gibberwocky this was seq.object
    const patternObject = seq[ patternType ]
    if( patternObject === null ) return 
    const [ className, start, end ] = Marker._getNamesAndPosition( patternNode, state, patternType, index )
    const cssName = className

    const marker = cm.markText(
      start, 
      end,
      { 
        'className': cssName + ' annotation annotation-border' ,
        startStyle: 'annotation-no-right-border',
        endStyle: 'annotation-no-left-border',
        //inclusiveLeft:true,
        //inclusiveRight:true
      }
    )

    if( seqTarget.markup === undefined ) Marker.prepareObject( seqTarget )
    seqTarget.markup.textMarkers[ className ] = marker

    const divStart = Object.assign( {}, start )
    const divEnd   = Object.assign( {}, end )

    divStart.ch += 1
    divEnd.ch -= 1

    const marker2 = cm.markText( divStart, divEnd, { className:'annotation-binop-border' })     

    if( seqTarget.markup.cssClasses[ className ] === undefined ) seqTarget.markup.cssClasses[ className ] = []
    seqTarget.markup.cssClasses[ className ][ index ] = cssName

    patternObject.marker = marker

    Marker.finalizePatternAnnotation( patternObject, className, seqTarget, marker )
  }

  return BinaryExpression 

}
