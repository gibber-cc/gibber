const Utility = require( '../utilities.js' )
const $ = Utility.create

module.exports = function( Marker ) {
  // Marker.patternMarkupFunctions.tidal( tidalNode, state, tidalObj, container, seqNumber )

  const trimmers = [ 'string' ]
  const shouldTrim = type => trimmers.indexOf( type ) > -1

  const Tidal = function( node, state, tidal, container=null, index=0 ) {
    if( node.processed === true ) return 

    const cm       = state.cm,
          target   = tidal.target, // XXX seq.object for gibberwocky
          pattern  = tidal.__pattern,
          markers  = {},
          line     = node.loc.start.line - 1 + node.offset.vertical,
          startCol = node.loc.start.column,
          endCol   = node.loc.end.column,
          startRow = line,
          endRow   = line + (node.loc.end.line - node.loc.start.line)

    tidal.__isEditing = false
    tidal.markers = []
    let annotationsAreFrozen = false
    let mod = 0

    const markElement = ele => {
      if( ele.type_ === 'pattern' ) {
        const elements = ele.source_
        elements.forEach( markElement )
        return
      }
      const className = `tidal-${tidal.uid}-${ele.location_.start.column}`,
            loc = ele.location_,
            value = ele.source_

      if( value.type_ === 'pattern' ) {
        const elements = value.source_
        elements.forEach( markElement )
        return
      }
      
      
      let   trimmedValue = value.trim(),
            lineModY = node.loc.start.line === node.loc.end.line ? -1 : 0,
            lineModX = node.loc.start.line === node.loc.end.line ? node.loc.start.column-1 : 0

      lineModX += mod
      mod = 0
      const tokenStart = { 
        line:line + loc.start.line + lineModY, 
        ch:lineModX + loc.start.column 
      }

      const tokenEnd   = { 
        line:line + loc.end.line + lineModY, 
        ch:lineModX + loc.start.column + trimmedValue.length  
      } 

      const marker = cm.markText( 
        tokenStart, 
        tokenEnd,  
        { className: className+' cm-number tidal' } 
      )

      markers[ className ] = pattern

      pattern.cycle = Marker._createBorderCycleFunction( className, pattern )
      pattern.type = 'tidal'
      pattern.marker = marker

      if( ele.options_ !== null ) mod++
    }
    
    const markPattern = pattern => {
      const ast = pattern.ast[0]
      const elements = ast.source_
      //console.log( elements[0].loc.start.column )

      elements.forEach( markElement )
      mod = 0
    }
     
    const clearCycle = name => {
      if( markers[ name ] ) {
        let cycle = markers[ name ].cycle
        cycle.tm = setTimeout( function() {
          //cycle.clear()
          $( '.' + name ).remove( 'tidal-bright' )
        }, 250 )
      }
    }

    const clear = function() {
      for( const [ key, value ] of Object.entries( markers ) ) {
        value.marker.clear()
      }
    }
      
    let codestr = cm.getRange( { line:startRow, ch:startCol }, { line:endRow, ch:endCol } ) 
    const intervalCheck = ()=> {
      const pos = marker.find()
      const current = cm.getRange( pos.from, pos.to ).slice(1,-1)
      if( current !== codestr ) {
        codestr = current//.slice(1,-1)

        let valid = true
        try{
          Gibber.Audio.Gibberish.Tidal.Pattern( codestr )
        }catch(e) {
          valid = false
        }
        //console.log( value, numString, num, valid )

        if( valid ) { 
          const tmp = Gibber.shouldDelay
          Gibber.shouldDelay = Gibber.Audio.shouldDelay = false 
          tidal.set( codestr )
          Gibber.shouldDelay = tmp

          pos.start = pos.from
          pos.end = pos.to
          pos.horizontalOffset = pos.from.ch

          clear()
          markPattern( tidal.__pattern.__data )

          const els = Array.from( document.querySelectorAll( '.' + cssName ) )
          els.forEach( (el,i) => { 
            el.classList.add( 'patternEdit' )
            el.classList.remove( 'patternEditError' )
          }) 
        }else{
          const els = Array.from( document.querySelectorAll( '.' + cssName ) )
          els.forEach( (el,i) => { 
            el.classList.remove( 'patternEdit' )
            el.classList.add( 'patternEditError' )
          })  
        }
      }
    }
    tidal.__onclick = e => {
      if( e.altKey == true ) {
      //  if( e.shiftKey === true ) {
      //    patternObject.reset()
      //  }else{
      //    patternObject.__frozen = !patternObject.__frozen
      //  }
      //}else{

        if( !tidal.__isEditing ) {
          annotationsAreFrozen = true
          const pos = marker.find()
          tidal.__editMark = cm.markText( 
            pos.from, pos.to, 
            { 
              className:'patternEdit'
            }
          )
          tidal.markers.push( tidal.__editMark )
          tidal.__interval = setInterval( intervalCheck, 100 )
        }else{
          tidal.__editMark.clear()
          clearInterval( tidal.__interval )
        }

        tidal.__isEditing = !tidal.__isEditing
      }else if( e.shiftKey === true ) {
          //patternObject.reset()
        //}else{
          tidal.__frozen = !tidal.__frozen
        //}
      }
    }

    const cssName = 'tidal_'+ tidal.uid 

    Marker.arrayPatterns[ cssName ] = tidal.__onclick
    
    if( tidal.markup === undefined ) Marker.prepareObject( tidal )
    tidal.markup.textMarkers[ cssName ] = {}
    const marker = cm.markText( 
      { line:startRow, ch:startCol }, 
      { line:endRow, ch:endCol }, 
      { 
        className: `annotation tidalblock ${cssName}`,
        attributes:{
          onclick: `Environment.codeMarkup.arrayPatterns['${cssName}']( event )`
        }
      }
    )

    tidal.markup.textMarkers[ cssName ] = marker 

    tidal.update = function( val ) {
      const name = `tidal-${tidal.uid}-${tidal.update.uid}`

      $( '.' + name ).add( 'tidal-bright' ) 

      //const marker = markers[ name ]
      //let cycle = null
      //if( marker !== undefined ) cycle = marker.cycle
      //if( cycle === null ) return
      //if( cycle.tm !== undefined ) {
      //  clearTimeout( cycle.tm )
      //  cycle.tm = undefined
      //}

      //cycle() 
      //clearCycle( name )
      setTimeout( ()=> {
        $( '.' + name ).remove( 'tidal-bright' ) 
      }, 125 )
    }

    tidal.update.uid = 0

    markPattern( pattern )

    let value = null
    Object.defineProperty( tidal.update, 'value', {
      get() { return value },
      set(v){ 
        if( typeof v === 'string' ) v = v.trim()
        value = v
        tidal.update( value )
      }
    })

    tidal.clear = function() {
      clearCycle()
      if( tidal.__editMark !== undefined ) tidal.__editMark.clear()
      marker.clear()
      clear()
      if( tidal.__interval ) clearInterval( tidal.__interval ) 
    }

  }

  return Tidal 
}
