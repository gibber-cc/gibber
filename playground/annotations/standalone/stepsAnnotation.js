const Utility = require( '../utilities.js' )
const $ = Utility.create
const EuclidAnnotation = require( '../update/euclidAnnotation.js' )

module.exports = function( node, cm, track, objectName, state, cb ) {
  const Marker = Gibber.Environment.codeMarkup 
  const steps = node.arguments[ 0 ].properties
  const Identifier = Marker.patternMarkupFunctions.Identifier

  track.markup.textMarkers[ 'step' ] = []
  track.markup.textMarkers[ 'step' ].children = []

  const instance = window[ objectName ]
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
      let pattern  

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

      let className = objectClassName + '_' + key + '_' + count

      let marker, span
     
      let type
      if( step.type === 'CallExpression' ) {
        type = step.callee.name
      }else{
        type = 'Literal'
      }
      if( type === 'Euclid' || type === 'Hex' ) {
        pattern = instance.seqs[ nodename ].timings
        marker = cm.markText( step.loc.start, step.loc.end, { className } )
        pattern.update = EuclidAnnotation( pattern, marker, className, cm, track )
        pattern.patternName = className
      }else{
        if( step.type === 'Literal' || step.type === 'BinaryExpression' || step.type === 'UnaryExpression' ) {
          step.offset = { vertical:1, horizontal:0 }
        }

        pattern = instance.seqs[ nodename ].values

        ////patternNode, state, seq, patternType, container=null, index=0, isLookup=false 
        if( typeof step.value !== 'string' ) {
          Marker.patternMarkupFunctions[ step.type ](
            step, state, instance.seqs[ nodename ], 'timings'
          )
        }else{
          marker = cm.markText( step.loc.start, step.loc.end, { className } )
          track.markup.textMarkers.step[ key ] = marker

          track.markup.textMarkers.step[ key ].pattern = []
          const mark = ( _step, _key, _cm, _track ) => {
            for( let i = 0; i < _step.value.length; i++ ) {
              const pos = { loc:{ start:{}, end:{}} }
              Object.assign( pos.loc.start, _step.loc.start )
              Object.assign( pos.loc.end, _step.loc.end )
              pos.loc.start.ch = pos.loc.start.column + 1
              pos.loc.start.ch += i
              pos.loc.end.ch = pos.loc.start.ch + 1

              const posMark = _cm.markText( pos.loc.start, pos.loc.end, { className:`step_${_key}_${i} euclid` })
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
                currentValue = pattern.values[ currentIdx ]

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

          pattern._onchange = () => {
            // .column is used by mark(), .ch is used by replaceRange
            //step.loc.start.ch = step.loc.start.column + 1 
            const start = Object.assign( {}, step.loc.start )
            const end = Object.assign( {}, step.loc.end )
            start.ch = step.loc.start.column + 1 
            end.ch -= useComma ? 3 : 2

            // must add ending quotation mark back in... XXX hmmm, what if they use double quotes?
            // lots of hackery here...
            marker.doc.replaceRange( pattern.values.join('') /*+ "'" + (useComma ? ',' : '')*/, start, end )
            mark( step, key, cm, track )
          }
        }
      }

      // store value changes in array and then pop them every time the annotation is updated
      // pattern.update.value = []
      
      if( pattern.update !== undefined && pattern.update.currentIndex === undefined ) {
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
        //pattern.reset()
        console.log( 'span:', span, span.remove )
        if( span !== undefined ) {
          span.toggle( 'euclid0' ) 
          span.toggle( 'euclid1' ) 
        }
      }

      Gibber.subscribe( 'clear', pattern.clear )
    }
  }

}  
