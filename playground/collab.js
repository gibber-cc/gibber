module.exports = function( Gibber, Environment ) {
  const rpad = function( value, pad ) {
    let out = value+''
    const len = (value + '').length

    if( len < pad ) {
      for( let i = pad - len; i > 0; i-- ) {
        out += '&nbsp;'
      }
    }else if( len > pad ) {
      out = out.slice( 0, pad )
    }

    return out
  }

  Environment.showStats = function( rate = 30 ) {
    const display = document.createElement('div')
    display.setAttribute( 'id', 'stats' )
    document.body.appendChild( display )
    
    let frameCounter = 0, toggle = true
    const statsCallback = function() {
      window.requestAnimationFrame( statsCallback )

      let txt = '|&nbsp;'
      if( Environment.sounds !== undefined && Environment.sounds !== null ) {
        Object.entries( Environment.sounds ).forEach( arr => {
          let value = arr[1].__out
          if( value < .001 ) value = '0.000' 
          value = rpad( value, 5 )
          const gainIsObject = typeof arr[1].gain.value === 'object'
          const isFade = gainIsObject && arr[1].gain.value.isFade
          const gain = gainIsObject ? 1 : arr[1].gain.value

          let color = 'white', bg = 'transparent'

          // if ugen has been faded out, flash a warning
          if( isFade ) {
            color = toggle ? 'yellow' : 'black'
            bg    = toggle ? 'black'  : 'yellow'
          } else if( gain < .00001 ) {
            color = toggle ? 'red'   : 'white'
            bg    = toggle ? 'white' : 'red'
          }
          txt += `<span style="color:${color}; background:${bg}">${arr[0]}:${value}&nbsp;</span>|&nbsp;` 
        })

        display.innerHTML = txt
        if( frameCounter++ % rate === 0 ) toggle = !toggle
      } 
    }
    window.requestAnimationFrame( statsCallback )
  }

  window.watchers = []
  window.watch = function( method, cb, seqId=0 ) {
    // get reference to current values pattern for sequence
    const pattern =  method.__owner[ method.__name ][ seqId ].values

    // if the pattern is already being watched, remove the associated filter.
    // .watchIndex is set at bottom of this function
    if( pattern.watchIndex !== undefined ) pattern.removeFilter( pattern.watchIndex )

    const pos = window.watchers.length

    // is it fine to just leave this as an expanding array and never
    // cull dormant watchers? I think yes, it is fine.
    window.watchers.push( cb )

    // I added .__owner and .__name properties to all sequencable functions
    // in gibber for situations like below. this enables us to just call
    // watch( k.trigger, ()=> {} ) instead of having to do something like
    // watch( k, 'trigger', ()=>{} ) which just offends my sense of aesthetics.
    eval(`method.__owner[ method.__name ][ seqId ].values.addFilter( args => {
      global.main( eval( '()=>window.watchers[${pos}](' + args[0] + ')' ) )
      return args
    })`)

    // we need to overide the seq method of the function being watched,
    // so that if it is called again we can assign our watcher to
    // the new sequence that is created.
    const store = method.seq
    method.seq = function( ...args ) {
      if( args[2] === seqId || args[2] === undefined && seqId === 0 ) {
        store( ...args )
        window.watch( method, cb, seqId )
      }
    }
    // store pattern filter index so we can potentially remove filter
    // but do we still need this? after testing it seems like we do
    // although I'm not 100% sure why
    pattern.watchIndex = pattern.filters.length - 1 
  }

  watchers.clear = (fnc=null) => {
    if( fnc === null ) {
      watchers.length = 0
      return
    }
    // I don't think we want to do the below lines as we'll change the 
    // indexing for all watchers > pos and that will cause massive
    // issues...
    // const pos = watchers.findIndex( fnc )
    // watchers.splice( pos, 1 )
  }

  Gibber.subscribe( 'clear', ()=> watchers.length = 0 )
}
