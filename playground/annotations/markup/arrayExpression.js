const Utility = require( '../utilities.js' )
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
    patternObject.__isEditing = false
    patternObject.__isRecording = false
    patternObject.node = patternNode 

    if( target.markup === undefined ) Marker.prepareObject( target )
    if( Marker.arrayPatterns === undefined ) Marker.arrayPatterns = {}

    let annotationsAreFrozen = false

    let value = cm.getRange( start, end )
    const intervalCheck = ()=> {
      const pos = arrayMarker.find()
      const current = cm.getRange( pos.from, pos.to )
      if( current !== value ) {
        value = current
        const stripped = value.replace( ' ', '' )

        let valid = true
        if( stripped.indexOf( ',]' ) > -1 ) valid = false
        if( stripped.indexOf( ',,' ) > -1 ) valid = false
        if( stripped.indexOf( '[,' ) > -1 ) valid = false

        if( valid ) { 
          let arr
          try{
            arr = eval( value )
          } catch( e ) {
            const els = Array.from( document.querySelectorAll( '.' + cssName ) )
            els.forEach( (el,i) => { 
              el.classList.remove('patternEdit')
              el.classList.add( 'patternEditError' )
            })   
          }

          if( Array.isArray( arr ) ) {
            const tmp = Gibber.shouldDelay
            Gibber.shouldDelay = Gibber.Audio.shouldDelay = false 
            patternObject.set( arr )
            Gibber.shouldDelay = tmp

            pos.start = pos.from
            pos.end = pos.to
            pos.horizontalOffset = pos.from.ch
            const __patternNode = Environment.Annotations.process( value, pos, Environment.editor ).body[0].expression 
            patternObject.clear()
            patternNode = __patternNode
            makeMarkers()
 
            // XXX using markText would be better clearly, but
            // for some reason I can't get it to work? marking
            // the individual spans does work though

            //patternObject.__editMark = cm.markText( 
            //  pos.from, pos.to, 
            //  { 
            //    className:'patternEdit'
            //  }
            //)

            const els = Array.from( document.querySelectorAll( '.' + cssName ) )
            els.forEach( (el,i) => { 
              el.classList.add( 'patternEdit' )
              el.classList.remove( 'patternEditError' )
            }) 
          }
        }else{
          const els = Array.from( document.querySelectorAll( '.' + cssName ) )
          els.forEach( (el,i) => { 
            el.classList.remove( 'patternEdit' )
            el.classList.add( 'patternEditError' )
          })  
        }
      }
    }

    patternObject.__onclick = e => {
      if( e.shiftKey == true ) {
        //patternObject.freeze()
        patternObject.__frozen = !patternObject.__frozen
        //annotationsAreFrozen = true 
      }
      if( e.altKey == true ) {
        if( !patternObject.__isEditing ) {
          annotationsAreFrozen = true
          const pos = arrayMarker.find()
          patternObject.__editMark = cm.markText( 
            pos.from, pos.to, 
            { 
              className:'patternEdit'
            }
          )
          patternObject.markers.push( patternObject.__editMark )
          patternObject.__interval = setInterval( intervalCheck, 100 )
        }else{
          patternObject.__editMark.clear()
          clearInterval( patternObject.__interval )
        }

        patternObject.__isEditing = !patternObject.__isEditing
      }

      if( e.metaKey == true ) {
        patternObject.__isRecording = !patternObject.__isRecording

        if( patternObject.__isRecording ) {
          patternObject.__history = []
          annotationsAreFrozen = true
        }else{
          const pos = arrayMarker.find()
          const current = cm.getRange( pos.from, pos.to )

          //const stripped = value.replace( ' ', '' )

          //let valid = true
          //if( stripped.indexOf( ',]' ) > -1 ) valid = false
          //if( stripped.indexOf( ',,' ) > -1 ) valid = false
          //if( stripped.indexOf( '[,' ) > -1 ) valid = false

          let arr
          arr = eval( current )

          pos.start = pos.from
          pos.end = pos.to
          pos.horizontalOffset = pos.from.ch
          const __patternNode = Environment.Annotations.process( current, pos, Environment.editor ).body[0].expression 
          
          patternObject.clear()
          patternNode = __patternNode
          makeMarkers()

          patternObject.set( arr )

          annotationsAreFrozen = false
          for( const op of patternObject.__history ) {
            if( Array.isArray( op[1] ) ){
              patternObject[ op[0] ]( ...op[1] )
            }else{
              patternObject[ op[0] ]( op[1] )
            }
          }          
        } 
      }
    }

    Marker.arrayPatterns[ cssName ] = patternObject.__onclick

    // create marker for entire array...
    // you have to pass the onclick as a string, otherwise codemirror will
    // delete it from spans during random operations. We store the event handler
    // globally so that we can use a closure. 
    const arrayMarker = cm.markText( start, end, { 
      className:cssName,
      attributes:{
        onclick: `Environment.codeMarkup.arrayPatterns['${cssName}']( event )`
      }
    })
    target.markup.textMarkers[ cssName ] = arrayMarker

    const makeMarkers = function( useOffset = false) {
      // then create markers for individual elements
      let count = 0
      for( let element of patternNode.elements ) {
        let cssClassName = patternName + '_' + count,
            elementStart = Object.assign( {}, start ),
            elementEnd   = Object.assign( {}, end   ),
            marker
        
        elementStart.ch = element.loc.start.column + Marker.offset.horizontal
        elementEnd.ch   = element.loc.end.column   + Marker.offset.horizontal

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
    }
    makeMarkers()
    
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
      //$( className ).add( 'annotation-array' )
      //$( className+'_start' ).add( 'annotation-border-left' )
      //$( className+'_end' ).add( 'annotation-border-right' )
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
        const values = isLookup === false ? patternObject.values : patternObject._values
        cycle( Array.isArray( values ) )
      }
    }

    let currentIndex = 0
    Object.defineProperty( patternObject.update, 'currentIndex', {
      get() { return currentIndex },
      set(v){ 
        currentIndex = v; 
        patternObject.update( true )
      }
    })

    // check to see if a clear function already exists and save reference
    // XXX should clear be saved somewhere else... on the update function?
    let __clear = null
    if( patternObject.clear !== undefined )  __clear = patternObject.clear

    patternObject.clear = () => {
      if( highlighted.className !== null ) { $( highlighted.className ).remove( 'annotation-border' ) }
      cycle.clear()
      patternObject.markers.forEach( marker => marker.clear() )
      //patternObject.__editMark.clear()
      if( __clear !== null ) __clear.call( patternObject )
      if( patternObject.__interval !== undefined ) clearInterval( patternObject.__interval )
    }

    Marker._addPatternFilter( patternObject )
    patternObject._onchange = op => { 
      if( annotationsAreFrozen === false ) {
        Marker._updatePatternContents( patternObject, patternName, target ) 
      }
      if( patternObject.__isRecording ) {
        console.log( op )
        patternObject.__history.push( op )
      }
    }
  }
    
  return ArrayExpression
}

