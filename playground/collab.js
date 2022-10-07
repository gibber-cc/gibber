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
  window.watch = function( watched, cb, seqId=0 ) {
    // check to see if this is a method or object
    const watchMethod = watched.__owner !== undefined
    const obj = watchMethod ? watched.__owner : watched 
    const name = watchMethod ? watched.__name : obj.__seqDefault
    const method = obj[ name ]

    // check to see if method has been sequenced
    if( method[ seqId ] === undefined ) {
      Console.error( `You tried to watch '${name}' on an object where that is not sequenced.` )
      return
    }

    // get reference to current values pattern for sequence
    const sequencer = method[ seqId ]
    // wish there was a better way to identify if this is 
    // .tidal or .seq...
    
    const isTidal = sequencer.__pattern !== undefined

    const pattern = isTidal ? sequencer.__pattern : sequencer.values

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

    if( isTidal ) {
      Gibber.Audio.Gibberish.worklet.port.postMessage({
        address:'method',
        name:'addFilter',
        object: sequencer.id,
        functions:true,
        args:`function( value ) {
          global.main( eval( '()=>window.watchers[${pos}](' + value + ')' ) )
          return value
        }`
      })
    }else{
      eval(`pattern.addFilter( args => {
        global.main( eval( '()=>window.watchers[${pos}](' + args[0] + ')' ) )
        return args
      })`)
    }

    // we need to overide the seq method of the function being watched,
    // so that if it is called again we can assign our watcher to
    // the new sequence that is created.
    const store = isTidal ? method.tidal : method.seq
    const sequenceName = isTidal ? 'tidal' : 'seq'

    method[ sequenceName ] = function( ...args ) {
      if( args[2] === seqId || args[2] === undefined && seqId === 0 ) {
        store( ...args )
        window.watch( method, cb, seqId )
      }
    }

    // store pattern filter index so we can potentially remove filter
    // but do we still need this? after testing it seems like we do
    // although I'm not 100% sure why
    if( !isTidal ) pattern.watchIndex = pattern.filters.length - 1 
  }

}
