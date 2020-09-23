const Utility = require( '../utilities.js' )
const $ = Utility.create
const EuclidAnnotation = require( '../update/euclidAnnotation.js' )

module.exports = function( node, cm, track, objectName, state, cb ) {
  const Marker = Gibber.Environment.codeMarkup 
  const steps = node.arguments[ 0 ].properties
  const Identifier = Marker.patternMarkupFunctions.Identifier

  track.markup.textMarkers[ 'step' ] = []
  track.markup.textMarkers[ 'step' ].children = []

  const hexSteps = window[ objectName ]
  const objectClassName = objectName + '_steps'

  let count = 0
  for( let key in steps ) {
    let step = steps[ key ].value

    if( step /*&& step.value*/ ) { // ensure it is a correctly formed step
      step.loc.start.line += Marker.offset.vertical - 1
      step.loc.end.line   += Marker.offset.vertical - 1
      step.loc.start.ch   = step.loc.end.column - 1
      step.loc.end.ch     = step.loc.end.column 

      const nodename = steps[ key ].key.value === undefined ? steps[ key ].key.name : steps[ key ].key.value
      const pattern = hexSteps.seqs[ nodename ].timings

      // we estimate whether or not a comma was used to separate between
      // key / value pairs. If there's more than one pattern and this
      // isn't the last time through the for loop, we assume there is a 
      // comma (otherwise an error would occur).
      const useComma = count++ != steps.length - 1 && steps.length > 1

      // subtle differences here... without the useComma condition
      // the comment winds up being inserted before the comma, which
      // I don't like the look of, even if it sort of makes sense?
      if( useComma === true ) {
        // move off of end quote to comma
        step.loc.start.ch += 1
        step.loc.end.ch += 1

        // replace comma with a comma and a space
        cm.replaceRange( ", ", step.loc.start, step.loc.end )

        step.loc.start.ch += 1
        step.loc.end.ch += 1
      }else{
        // replace end char with char and a space
        const end = cm.getRange( step.loc.start, step.loc.end )
        cm.replaceRange( `${end} `, step.loc.start, step.loc.end )

        step.loc.start.ch += 1
        step.loc.end.ch += 1
      }

      let className = objectClassName + '_' + key 

      let marker, span
     
      if( pattern.type === 'Euclid' || pattern.type === 'Hex' ) {
        marker = cm.markText( step.loc.start, step.loc.end, { className } )
        pattern.update = EuclidAnnotation( pattern, marker, className, cm, track )
        pattern.patternName = className
      }else{
        if( step.type === 'Literal' || step.type === 'BinaryExpression' || step.type === 'UnaryExpression' ) {
          step.offset = { vertical:1, horizontal:0 }
        }

        ////patternNode, state, seq, patternType, container=null, index=0, isLookup=false 
        if( typeof step.value !== 'string' ) {
          Marker.patternMarkupFunctions[ step.type ](
            step, state, hexSteps.seqs[ nodename ], 'timings'
          )
        }else{

          //module.exports = function( node, cm, track, objectName, state, cb ) {
          marker = cm.markText( step.loc.start, step.loc.end, { className } )
          track.markup.textMarkers.step[ key ] = marker

          track.markup.textMarkers.step[ key ].pattern = []
          const mark = ( _step, _key, _cm, _track ) => {
            for( let i = 0; i < _step.value.length; i++ ) {
              let pos = { loc:{ start:{}, end:{}} }
              Object.assign( pos.loc.start, _step.loc.start )
              Object.assign( pos.loc.end  , _step.loc.end   )
              pos.loc.start.ch = pos.loc.start.column + 1
              pos.loc.start.ch += i
              pos.loc.end.ch = pos.loc.start.ch + 1
              let posMark = _cm.markText( pos.loc.start, pos.loc.end, { className:`step_${_key}_${i} euclid` })
              _track.markup.textMarkers.step[ _key ].pattern[ i ] = posMark
            }
          }

          mark( step, key, cm, track )

          let count = 0, update, tm

          const _key = nodename, 
                patternObject = window[ objectName ].seqs[ _key ].values

          update = () => {
            let currentIdx = count++ % step.value.length

            if( span !== undefined ) {
              span.remove( 'euclid0' )
              span.remove( 'euclid1' )
            }

            let spanName = `.step_${key}_${currentIdx}`,
                currentValue = step.value[ currentIdx ]

            span = $( spanName )

            if( currentValue !== '.' ) {
              span.add( 'euclid0' )
              span.add( 'euclid1' )
            }

            tm = setTimeout( ()=> { 
              span.remove( 'euclid1' ) 
              span.add( 'euclid0' )
            }, 50 )
          }

          pattern.update = update
          pattern.patternName = className
        }
      }

      // store value changes in array and then pop them every time the annotation is updated
      // pattern.update.value = []
      
      if( pattern.update.currentIndex === undefined ) {
        let currentIndex = 0
        Object.defineProperty( pattern.update, 'currentIndex', {
          get() { return currentIndex },
          set(v){ 
            currentIndex = v; 
            pattern.update()
          }
        })

        Marker._addPatternFilter( pattern )

        if( pattern.marker === undefined ) pattern.marker = marker
      }
      
      const __clear = pattern.clear

      pattern.clear = () => {
        //track.markup.textMarkers.string = cm.markText( nodePosStart, nodePosEnd, { className:'euclid' })
        if( typeof __clear === 'function' ) __clear.call( pattern )
        pattern.reset()
        if( span !== undefined ) {
          span.remove( 'euclid0' ) 
          span.remove( 'euclid1' ) 
        }
      }

      Gibber.subscribe( 'clear', pattern.clear )
      /*

      patternObject._onchange = () => {
        let delay = Utility.beatsToMs( 1,  Gibber.Scheduler.bpm )
        Gibber.Environment.animationScheduler.add( () => {
          marker.doc.replaceRange( patternObject.values.join(''), step.loc.start, step.loc.end )
          mark( step, key, cm, track )
        }, delay ) 
      }
      */
    }
  }

}  


//const Utility = require( '../../../js/utility.js' )
//const $ = Utility.create

//module.exports = function( node, cm, track, objectName, state, cb ) {
//  const Marker = Gibber.Environment.codeMarkup // tsk tsk tsk global...
//  const steps = node.arguments[ 0 ].properties

//  track.markup.textMarkers[ 'step' ] = []
//  track.markup.textMarkers[ 'step' ].children = []

//  const mark = ( _step, _key, _cm, _track ) => {
//    for( let i = 0; i < _step.value.length; i++ ) {
//      let pos = { loc:{ start:{}, end:{}} }
//      Object.assign( pos.loc.start, _step.loc.start )
//      Object.assign( pos.loc.end  , _step.loc.end   )
//      pos.loc.start.ch += i
//      pos.loc.end.ch = pos.loc.start.ch + 1
//      let posMark = _cm.markText( pos.loc.start, pos.loc.end, { className:`step_${_key}_${i} euclid` })
//      _track.markup.textMarkers.step[ _key ].pattern[ i ] = posMark
//    }
//  }

//  for( let key in steps ) {
//    let step = steps[ key ].value

//    if( step && step.value ) { // ensure it is a correctly formed step
//      step.loc.start.line += Marker.offset.vertical - 1
//      step.loc.end.line   += Marker.offset.vertical - 1
//      step.loc.start.ch   = step.loc.start.column + 1
//      step.loc.end.ch     = step.loc.end.column - 1

//      let marker = cm.markText( step.loc.start, step.loc.end, { className:`step${key}` } )
//      track.markup.textMarkers.step[ key ] = marker

//      track.markup.textMarkers.step[ key ].pattern = []

//      mark( step, key, cm, track )

//      let count = 0, span, update, tm

//      const _key = steps[ key ].key.value,
//            patternObject = window[ objectName ].seqs[ _key ].values

//      update = () => {
//        let currentIdx = update.currentIndex // count++ % step.value.length

//        if( span !== undefined ) {
//          span.remove( 'euclid0' )
//          span.remove( 'euclid1' )
//        }

//        let spanName = `.step_${key}_${currentIdx}`
//            //currentValue = patternObject.update.value.pop() //step.value[ currentIdx ]

//        span = $( spanName )

//        //if( currentValue !== Gibber.Seq.DO_NOT_OUTPUT ) {
//        span.add( 'euclid0' )
//        span.add( 'euclid1' )

//        tm = setTimeout( ()=> { 
//          span.remove( 'euclid1' ) 
//          span.add( 'euclid0' )
//        }, 50 )
//      }

//      patternObject._onchange = () => {
//        //let delay = Gibber.Clock.btoms( 1,  Gibber.Clock.bpm )
//        //Gibber.Environment.animationScheduler.add( () => {
//        //  marker.doc.replaceRange( patternObject.values.join(''), step.loc.start, step.loc.end )
//        //  mark( step, key, cm, track )
//        //}, delay ) 
//      }

//      patternObject.update = update
//      patternObject.update.value = []
      
//      let currentIndex = 0
//      Object.defineProperty( patternObject.update, 'currentIndex', {
//        get() { return currentIndex },
//        set(v){ 
//          currentIndex = v; 
//          patternObject.update()
//        }
//      })

//      Marker._addPatternFilter( patternObject )

//      const __clear = patternObject.clear

//      patternObject.clear = () => {
//        if( span !== undefined ) {
//          span.remove( 'euclid0' )
//          span.remove( 'euclid1' )
//        }
//        if( tm !== undefined ) clearTimeout( tm )

//        //track.markup.textMarkers.string = cm.markText( nodePosStart, nodePosEnd, { className:'euclid' })
//        patternObject.reset()
//        if( typeof __clear === 'function' ) __clear.call( patternObject )
//      }

//      Gibber.subscribe( 'clear', patternObject.clear )
//    }
//  }

//}  

