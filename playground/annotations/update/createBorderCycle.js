const Utility = require( '../utilities.js' )
const $ = Utility.create

module.exports = function( classNamePrefix, patternObject ) {
  let modCount = 0,
      lastBorder = null,
      lastClassName = null

  const cycle = function( isArray=false ) {
    let className = '.' + classNamePrefix,
        border = 'top'

    // accommodate arrays
    if( patternObject.type !== 'tidal' ) { 
      if(  patternObject.values.length > 1 || patternObject.type === 'Lookup' || isArray === true ) {
        className += '_' + patternObject.update.currentIndex
      }
    }

    //isArray = false 

    switch( modCount++ % 4 ) {
      case 1: border = 'right'; break;
      case 2: border = 'bottom'; break;
      case 3: border = 'left'; break;
    }

    // for a pattern holding arrays... like for chord()
    if( isArray === true ) {
      // make sure base border surrounds array before dealing with highlight
      $( className ).add( 'annotation-array' )
      $( className+'_start' ).add( 'annotation-border-left' )
      $( className+'_end' ).add( 'annotation-border-right' ) 
      switch( border ) {
        case 'left':
          $( className ).remove( 'annotation-' + lastBorder + '-border-cycle' )
          $( className + '_start' ).add( 'annotation-left-border-cycle' )
          break;
        case 'right':
          $( className ).remove( 'annotation-' + lastBorder + '-border-cycle' ) 
          $( className + '_end' ).add( 'annotation-right-border-cycle' )

          break;
        case 'top':
          $( className ).add( 'annotation-top-border-cycle' )
          $( className+'_start' ).remove( 'annotation-left-border-cycle' )
          $( className+'_start' ).add( 'annotation-top-border-cycle' )
          $( className+'_end' ).add( 'annotation-top-border-cycle' )

          break;
        case 'bottom':
          $( className ).add( 'annotation-bottom-border-cycle' )
          $( className+'_end' ).remove( 'annotation-right-border-cycle' )
          $( className+'_end' ).add( 'annotation-bottom-border-cycle' )
          $( className+'_start' ).add( 'annotation-bottom-border-cycle' )

          break;
        default:
          //$( className ).add( 'annotation-' + border + '-border-cycle' )
          $( className+'_start' ).remove( 'annotation-' + border + '-border-cycle' )
          $( className+'_end' ).remove( 'annotation-' + border + '-border-cycle' )
          break;
      }

    }else{
      $( className ).remove( 'annotation-' + border + '-border' )
      $( className ).add( 'annotation-' + border + '-border-cycle' )

      if( lastBorder !== null ) {
        $( className ).remove( 'annotation-' + lastBorder + '-border-cycle' )
        $( className ).add( 'annotation-' + lastBorder + '-border' )
      }
    }

    lastBorder = border
    lastClassName = className
  }

  cycle.clear = function() {
    modCount = 1

    if( lastClassName !== null ) {
      $( lastClassName ).remove( 'annotation-left-border' )
      $( lastClassName ).remove( 'annotation-left-border-cycle' )
      $( lastClassName ).remove( 'annotation-right-border' )
      $( lastClassName ).remove( 'annotation-right-border-cycle' )
      $( lastClassName ).remove( 'annotation-top-border' )
      $( lastClassName ).remove( 'annotation-top-border-cycle' )
      $( lastClassName ).remove( 'annotation-bottom-border' )
      $( lastClassName ).remove( 'annotation-bottom-border-cycle' )
    }

    lastBorder = null
  }

  // XXX need to delay timing annotations in case value annotations changes underlying text, in
  // which case the underlying CSS of the line gets all wonky.
  const __cycle = patternObject.__delayAnnotations = true ? isArray => { setTimeout( cycle(isArray), 0 ) } : cycle

  // must create reference to original clear function so that it can be called via the delayed wrapper
  // if needed... if not needed, the below assignment is a no-op.
  __cycle.clear = cycle.clear

  return __cycle
}

