const Utility = require( '../../../js/utility.js' )
const $ = Utility.create

module.exports = function( Marker ) {
  'use strict'

  const ArrayExpression = function( patternNode, state, seq, patternType, container=null, index=0, isLookup=false ) {
    if( patternNode.processed === true ) return 

    const cm = state.cm
    const target = seq.target // XXX in gibberwocky this was seq.object
    const patternObject = seq[ patternType ]
    const [ patternName, start, end ] = Marker._getNamesAndPosition( patternNode, state, patternType, index )
    const cssName = patternName 

    patternObject.markers = []

    if( target.markup === undefined ) Marker.prepareObject( target )

    let count = 0

    for( let element of patternNode.elements ) {
      let cssClassName = patternName + '_' + count,
          elementStart = Object.assign( {}, start ),
          elementEnd   = Object.assign( {}, end   ),
          marker
      
      elementStart.ch = element.loc.start.column// + Marker.offset.horizontal
      elementEnd.ch   = element.loc.end.column //  + Marker.offset.horizontal

      if( element.type === 'BinaryExpression' ) {
        marker = cm.markText( elementStart, elementEnd, { 
          'className': cssClassName + ' annotation',
           startStyle: 'annotation-no-right-border',
           endStyle: 'annotation-no-left-border',
           //inclusiveLeft:true, inclusiveRight:true
        })

        // create specific border for operator: top, bottom, no sides
        const divStart = Object.assign( {}, elementStart )
        const divEnd   = Object.assign( {}, elementEnd )

        divStart.ch += 1
        divEnd.ch -= 1

        const marker2 = cm.markText( divStart, divEnd, { className:cssClassName + '_binop annotation-binop' })

        patternObject.markers.push( marker, marker2 )

      }else if (element.type === 'UnaryExpression' ) {
        marker = cm.markText( elementStart, elementEnd, { 
          'className': cssClassName + ' annotation', 
          //inclusiveLeft: true,
          //inclusiveRight: true
        })

        let start2 = Object.assign( {}, elementStart )
        start2.ch += 1
        let marker2 = cm.markText( elementStart, start2, { 
          'className': cssClassName + ' annotation-no-right-border', 
          //inclusiveLeft: true,
          //inclusiveRight: true
        })

        let marker3 = cm.markText( start2, elementEnd, { 
          'className': cssClassName + ' annotation-no-left-border', 
          //inclusiveLeft: true,
          //inclusiveRight: true
        })

        patternObject.markers.push( marker, marker2, marker3 )
      }else if( element.type === 'ArrayExpression' ) {
         marker = cm.markText( elementStart, elementEnd, { 
          'className': cssClassName + ' annotation',
          //inclusiveLeft:true, inclusiveRight:true,
          startStyle:'annotation-left-border-start',
          endStyle: 'annotation-right-border-end',
         })


         // mark opening array bracket
         const arrayStart_start = Object.assign( {}, elementStart )
         const arrayStart_end  = Object.assign( {}, elementStart )
         arrayStart_end.ch += 1
         cm.markText( arrayStart_start, arrayStart_end, { className:cssClassName + '_start' })

         // mark closing array bracket
         const arrayEnd_start = Object.assign( {}, elementEnd )
         const arrayEnd_end   = Object.assign( {}, elementEnd )
         arrayEnd_start.ch -=1
         const marker2 = cm.markText( arrayEnd_start, arrayEnd_end, { className:cssClassName + '_end' })

         patternObject.markers.push( marker, marker2 )

      }else{
        marker = cm.markText( elementStart, elementEnd, { 
          'className': cssClassName + ' annotation',
          //inclusiveLeft:true, inclusiveRight:true
        })

        patternObject.markers.push( marker )
      }

      if( target.markup.textMarkers[ patternName  ] === undefined ) target.markup.textMarkers[ patternName ] = []
      target.markup.textMarkers[ patternName ][ count ] = marker
     
      if( target.markup.cssClasses[ patternName ] === undefined ) target.markup.cssClasses[ patternName ] = []
      target.markup.cssClasses[ patternName ][ count ] = cssClassName 
      
      count++
    }
    
    let highlighted = { className:null, isArray:false },
        cycle = Marker._createBorderCycleFunction( patternName, patternObject )
    
    patternObject.patternType = patternType 
    patternObject.patternName = patternName

    patternObject.update = () => {
      let className = '.' + patternName
      
      className += '_' + patternObject.update.currentIndex 

      if( highlighted.className !== className ) {

        // remove any previous annotations for this pattern
        if( highlighted.className !== null ) {
          if( highlighted.isArray === false && highlighted.className ) { 
            $( highlighted.className ).remove( 'annotation-border' ) 
          }else{
            $( highlighted.className ).remove( 'annotation-array' )
            $( highlighted.className + '_start' ).remove( 'annotation-border-left' )
            $( highlighted.className + '_end' ).remove( 'annotation-border-right' )

            if( $( highlighted.className + '_binop' ).length > 0 ) {
              $( highlighted.className + '_binop' ).remove( 'annotation-binop-border' )
            }

          }
        }

        // add annotation for current pattern element
        const values = isLookup === false ? patternObject.values : patternObject._values

        if( Array.isArray( values[ patternObject.update.currentIndex ] ) ) {
          $( className ).add( 'annotation-array' )
          $( className + '_start' ).add( 'annotation-border-left' )
          $( className + '_end' ).add( 'annotation-border-right' )
          highlighted.isArray = true
        }else{
          $( className ).add( 'annotation-border' )

          if( $( className + '_binop' ).length > 0 ) {
            $( className + '_binop' ).add( 'annotation-binop-border' )
          }
          highlighted.isArray = false
        }

        highlighted.className = className

        cycle.clear()
      }else{
        cycle()
      }
    }

    let currentIndex = 0
    Object.defineProperty( patternObject.update, 'currentIndex', {
      get() { return currentIndex },
      set(v){ 
        currentIndex = v; 
        patternObject.update()
      }
    })

    // check to see if a clear function already exists and save reference
    // XXX should clear be saved somewhere else... on the update function?
    let __clear = null
    if( patternObject.clear !== undefined )  __clear = patternObject.clear

    patternObject.clear = () => {
      if( highlighted.className !== null ) { $( highlighted.className ).remove( 'annotation-border' ) }
      cycle.clear()
      console.log( 'CLEARING', cssName )
      patternObject.markers.forEach( marker => marker.clear() )
      if( __clear !== null ) __clear()
    }

    Marker._addPatternFilter( patternObject )
    patternObject._onchange = () => { Marker._updatePatternContents( patternObject, patternName, target ) }
  }
    
  return ArrayExpression
}

