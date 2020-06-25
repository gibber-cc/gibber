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

    if( step && step.value ) { // ensure it is a correctly formed step
      step.loc.start.line += Marker.offset.vertical - 1
      step.loc.end.line   += Marker.offset.vertical - 1
      step.loc.start.ch   = step.loc.end.column - 1
      step.loc.end.ch     = step.loc.end.column 

      const pattern = hexSteps.seqs[ steps[ key ].key.value ].timings

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

      let marker = cm.markText( step.loc.start, step.loc.end, { className } )
      pattern.update = EuclidAnnotation( pattern, marker, className, cm, track )
      pattern.patternName = className

      // store value changes in array and then pop them every time the annotation is updated
      //pattern.update.value = []
      
      let currentIndex = 0
      Object.defineProperty( pattern.update, 'currentIndex', {
        get() { return currentIndex },
        set(v){ 
          currentIndex = v; 
          pattern.update()
        }
      })

      Marker._addPatternFilter( pattern )

      pattern.marker = marker
      
      const __clear = pattern.clear

      pattern.clear = () => {
        //track.markup.textMarkers.string = cm.markText( nodePosStart, nodePosEnd, { className:'euclid' })
        pattern.reset()
        if( typeof __clear === 'function' ) __clear.call( pattern )
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

