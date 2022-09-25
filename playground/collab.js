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
    const pos = window.watchers.length
    window.watchers.push( cb )
    eval(`method.__owner[ method.__name ][ seqId ].values.addFilter( args => {
      global.main( eval( '()=>window.watchers[${pos}](' + args[0] + ')' ) )
      return args
    })`)
  }
  watchers.clear = (fnc=null) => {
    if( fnc === null ) {
      watchers.length = 0
      return
    }
    const pos = watchers.findIndex( fnc )
    watchers.splice( pos, 1 )
  }

  Gibber.subscribe( 'clear', ()=> watchers.length = 0 )
}
