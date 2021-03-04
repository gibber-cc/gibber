const Gibber        = require( 'gibber.core.lib' ),
      Audio         = require( 'gibber.audio.lib' ),
      Graphics      = require( 'gibber.graphics.lib' ),
      codeMarkup    = require( './codeMarkup.js' ),
      CodeMirror    = require( 'codemirror' ),
      Theme         = require( './resources/js/theme.js' ),
      Metronome     = require( './metronome.js' ),
      Editor        = require( './editor.js' ),
      Share         = require( './share.js' ),
      setupExamples = require( './examples.js' ),
      __Console       = require( './console.js' )
      //Gibberwocky   = require( 'gibberwocky' )

let cm, environment, cmconsole, exampleCode, 
    isStereo = false,
    fontSize = 1

window.Gibber = Gibber

window.onload = function() {
  [cm,environment] = Editor( Gibber )

  const theme = new Theme()
  theme.install( document.body )
  theme.start()
  environment.theme = theme
  environment.useComments = true

  environment.console = window.Console = __Console( environment )

  const themename = localStorage.getItem('themename')

  if( themename !== null ) {
    document.querySelector('#themer').src = `./resources/themes/${themename}.png`
  }else{
    document.querySelector('#themer').src = `./resources/themes/noir.png`
  }

  environment.share = Share

  const workletPath = './gibberish_worklet.js' 

  Gibber.init([
    {
      name:    'Audio',
      plugin:  Audio, // Audio is required, imported, or grabbed via <script>
      options: { workletPath, latencyHint:.05 }
    },
    {
      name:    'Graphics',
      plugin:  Graphics,
      options: { canvas:document.querySelector( '#graphics' ) }
    }
  ]).then( ()=> {
    Gibber.Audio.Theory.__loadingPrefix = './resources/tune.json/' 
    Gibber.export( window ) 

    window.future = function( fnc, time, dict ) {
      Gibber.Audio.Gibberish.utilities.future( fnc, Clock.btos(time*4), dict )
    } 

    environment.console.init( Gibber )

    window.solo = function( ...soloed ) {
      if( soloed.length > 0 ) {
        Gibber.Seq.sequencers.forEach( s => {
          let shouldStop = true
          soloed.forEach( solo => {
            if( s.target === solo.__wrapped__ ) shouldStop = false
          })
          if( shouldStop ) { 
            s.stop()
          }else{
            if( s.__isRunning === false )
              s.start( s.__delay || 0 )
          }
        })
      }else{
        Gibber.Seq.sequencers.forEach( s => {
          if( s.__isRunning === false ) s.start( s.__delay || 0 ) 
        })
      }
    }

    window.Graphics = Gibber.Graphics
    window.Audio    = Gibber.Audio
    window.fn = Gibber.Audio.Gibberish.utilities.fn
    window._ = Gibber.Audio.Gibberish.Sequencer.DO_NOT_OUTPUT

    window.run = fnc => { 
      Gibberish.worklet.port.__postMessage({ 
        address:'eval', 
        code:fnc.toString().split('=>')[1] 
      })
    }

    const fft = window.FFT = Marching.FFT
    fft.input = Gibber.Audio.Gibberish.worklet
    fft.__hasInput = true
    fft.ctx = Gibber.Audio.Gibberish.ctx

    fft.start = function( bins=null ) { 
      fft.bins = bins 
      fft.createFFT()
      fft.input.connect( fft.FFT )
      fft.interval = setInterval( fft.fftCallback, 1000/60 )
    }

    fft.clear = function() { clearInterval( fft.interval ) }

    Metronome.init( Gibber )
    environment.metronome = Metronome

    Gibber.subscribe( 'clear', ()=> {
      for( let key in Environment.sounds ) {
        delete Environment.sounds[ key ]
      }
      Console.log( '%cgibber has been cleared.', 'background:#006;color:white; padding:.5em' )
    })

    cm.__setup()
    Console.log( 
      '%cgibber is now running. thanks for playing!', 
      `color:white;background:black; padding:1em; width:100%` 
    ) 
  }) 

  environment.editor = cm
  //environment.console = cmconsole
  window.Environment = environment
  environment.annotations = true

  // XXX this should not be in 'debug' mode...
  environment.debug = true
  environment.codeMarkup = codeMarkup( Gibber )
  environment.codeMarkup.init()

  environment.displayCallbackUpdates = function() {
    Gibberish.oncallback = function( cb ) {
      environment.console.setValue( cb.toString() )
    }
  }

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

  environment.showStats = function() {
    const display = document.createElement('div')
    display.setAttribute( 'id', 'stats' )
    document.body.appendChild( display )
    
    const statsCallback = function() {
      window.requestAnimationFrame( statsCallback )
      let txt = '|&nbsp;'
      if( Environment.sounds !== undefined && Environment.sounds !== null ) {
        Object.entries( Environment.sounds ).forEach( arr => {
          let value = arr[1].__out
          if( value < .001 ) value = '0.000' 
          value = rpad( value, 5 )
          txt += `${arr[0]}:${value}&nbsp;|&nbsp;` 
        })

        display.innerHTML = txt
      } 
    }
    window.requestAnimationFrame( statsCallback )
  }

  environment.Annotations = environment.codeMarkup 
  
  Gibber.Environment = environment

  setupExamples()
  setupThemeMenu()
  setupCollapseBtn()
  setupRestartBtn()
}



// shouldRunNetworkCode is used to prevent recursive ws sending of code
// while isNetworked is used to test for acive ws connection
// selectedCode can be set via ws messages

// taken wih gratitude from https://stackoverflow.com/a/52082569
function copyToClipboard(text) {
    var selected = false
    var el = document.createElement('textarea')
    el.value = text
    el.setAttribute('readonly', '')
    el.style.position = 'absolute'
    el.style.left = '-9999px'
    document.body.appendChild(el)
    if (document.getSelection().rangeCount > 0) {
        selected = document.getSelection().getRangeAt(0)
    }
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    if (selected) {
        document.getSelection().removeAllRanges()
        document.getSelection().addRange(selected)
    }
}

window.getlink = function( name='link' ) {
  const lines = cm.getValue().split('\n')
  if( lines[ lines.length - 1].indexOf('getlink') > -1 ) {
    lines.pop()
  }

  const code = btoa( lines.join('\n' ) )
  const link = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${code}`

  copyToClipboard( link )

  // DRY... also used for gabber button
  const menu = document.createElement('div')
  menu.setAttribute('id', 'connectmenu')
  menu.setAttribute('class', 'menu' )
  menu.style.width = '12.5em'
  menu.style.height = '4.5em'
  menu.style.position = 'absolute'
  menu.style.display = 'block'
  menu.style.border = '1px var(--f_inv) solid'
  menu.style.borderTop = 0
  menu.style.top = '2.5em'
  menu.style.right = 0 
  menu.style.zIndex = 1000

  menu.innerHTML = `<p style='font-size:.7em; margin:.5em; margin-bottom:1.5em; color:var(--f_inv)'>A link containing your code has been copied to the clipboad.</p><button id='closelink' style='float:right; margin-right:.5em'>close</buttton>`

  document.body.appendChild( menu )
  document.querySelector('#connectmenu').style.left = document.querySelector('#sharebtn').offsetLeft + 'px'

  const blurfnc = ()=> {
    menu.remove()
    document.querySelector('.CodeMirror-scroll').removeEventListener( 'click', blurfnc )
  }
  document.querySelector('.CodeMirror-scroll').addEventListener( 'click', blurfnc )
  document.querySelector('#closelink').onclick = blurfnc

  return link
}

window.msg = function( msg ) {
  chatData.unshift([{ username, msg }]) 
}

const themes = [
  'apollo.svg',
  'battlestation.svg',
  'lotus.svg',
  'marble.svg',
  'murata.svg',
  'ninetynine.svg',
  'noir.svg',
  'nord.svg',
  'sonicpi.svg',
  'soyuz.svg',
  'zenburn.svg'
]

const setupThemeMenu = function() {
  const btn = document.getElementById('themer')

  btn.onclick = function() {
    const menu = document.querySelector('#thememenu')
    menu.style.display = 'block'
    menu.setAttribute('class', 'menu' )
    menu.style.width = '68px'
    menu.style.height = 'calc(38px*11)'
    menu.style.position = 'absolute'
    menu.style.display = 'block'
    menu.style.border = '1px var(--f_inv) solid'
    menu.style.borderTop = 0
    menu.style.top = '2.5em'
    menu.style.right = 0 
    menu.style.zIndex = 1000

    const list = menu.firstElementChild
    // array-like
    const items= [ ...list.children ]
    items.forEach( (li,idx) => {
      const img = li.firstElementChild

      img.style.width = '64px'
      img.style.height = '34px' 
      img.style.border = '2px solid var(--b_low)'

      img.onmouseover = ()=> {
        img.style.border = `2px solid var(--f_med)`
      }
      img.onmouseout = ()=> {
        img.style.border = '2px solid var(--b_low)'
      }

      img.width = 64
      img.height= 34
      img.onclick = ()=> {
        document.querySelector('#themer').src = `./resources/themes/${themes[idx].split('.')[0]}.png`
        localStorage.setItem( 'themename', themes[idx].split('.')[0] )

        fetch( './resources/themes/'+themes[idx] )
          .then( data => data.text() )
          .then( text => {
            Environment.theme.load( text ) 
          })
      }
    })

    document.body.appendChild( menu )
    menu.style.left = btn.offsetLeft + 'px'
    const blurfnc = ()=> {
      menu.style.display = 'none'
      document.querySelector('.CodeMirror-scroll').removeEventListener( 'click', blurfnc )
    }
    document.querySelector('.CodeMirror-scroll').addEventListener( 'click', blurfnc )
    //document.querySelector('#closelink').onclick = blurfnc      
  }
}

let isHeaderHidden = false
const setupCollapseBtn = function() {
  const hidebtn = document.querySelector( '#hidebtn' )
  const met = document.querySelector('#metronome')

  environment.togglemenu = function(e) {
    if( isHeaderHidden === false ) {
      document.querySelector('header').style.display = 'none'
      hidebtn.innerHTML= '&#9660;'
      //hidebtn.style.opacity = .5 
      met.style.right = '2em'
      met.style.top = '.3em'
      met.height /= 2
      met.width  /= 2
      Metronome.widthMod = 2
    }else{
      document.querySelector('header').style.display = 'block'
      hidebtn.innerHTML = '&#9650;'
      //hidebtn.style.opacity = 1
      met.style.removeProperty( 'right' )
      met.style.left = 0
      met.style.top = 0
      met.height *= 2
      Metronome.widthMod = 1
      met.width *= 2
    }
    isHeaderHidden = !isHeaderHidden
  }
  hidebtn.addEventListener( 'click', environment.togglemenu ) 
}

const setupRestartBtn = function() {
  const btn = document.getElementById('restart')
  btn.onclick = () => { 
    Gibber.Audio.restart()
    // DRY... also used for gabber button
    const menu = document.createElement('div')
    menu.setAttribute('id', 'restartnotification')
    menu.setAttribute('class', 'menu' )
    menu.style.width = '12.5em'
    menu.style.height = '4.5em'
    menu.style.position = 'absolute'
    menu.style.display = 'block'
    menu.style.border = '1px var(--f_inv) solid'
    menu.style.borderTop = 0
    menu.style.top = '2.5em'
    menu.style.right = 0 
    menu.style.zIndex = 1000

    menu.innerHTML = `<p style='font-size:.7em; margin:.5em; margin-bottom:1.5em; color:var(--f_inv)'>The audio engine has been restarted.</p><button id='restartcloselink' style='float:right; margin-right:.5em'>close</buttton>`

    document.body.appendChild( menu )
    document.querySelector('#restartnotification').style.left = document.querySelector('#sharebtn').offsetLeft + 'px'

    const blurfnc = ()=> {
      menu.remove()
      document.querySelector('.CodeMirror-scroll').removeEventListener( 'click', blurfnc )
    }
    document.querySelector('.CodeMirror-scroll').addEventListener( 'click', blurfnc )
    document.querySelector('#restartcloselink').onclick = blurfnc
  }

}


let __socket = null
let __connected = false

window.addEventListener('load', ()=> {
  document.getElementById('sharebtn').onclick = getlink
  window.makeMsg = environment.share.makeMsg
  environment.share.setupShareHandler(cm, environment, environment.networkConfig ) 
})


window.use = function( ...libs ) {
  if( libs.length === 1 ) { 
    return window.__use( libs[0] ) 
  }else{
    return Promise.all( libs.map( l => window.__use( l ) ) )
  }
}

const libs = {}
window.__use = function( lib ) {
  const p = new Promise( (res, rej) => {
    if( lib === 'vim' ) {
      if( libs.vim !== undefined ) { res(); return }
      // needed to load codemirror plugin
      window.CodeMirror = CodeMirror
        const __p = window.__use( 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.2/keymap/vim.min.js' ).then( ()=> {
          CodeMirror.keyMap.playground.fallthrough = 'vim'
          cm.setOption( 'vimMode', true )
          cm.setOption( 'extraKeys', CodeMirror.keyMap.playground )
          res()
          libs.vim = null
        })
    }else if( lib === 'hydra' ) {
      if( libs.Hydra !== undefined ) { res( libs.Hydra ); return }

      const hydrascript = document.createElement( 'script' )
      hydrascript.src = 'https://cdn.jsdelivr.net/npm/hydra-synth@1.3.6/dist/hydra-synth.js'

      hydrascript.onload = function() {
        //msg( 'hydra is ready to texture', 'new module loaded' )
        const Hydrasynth = Hydra
        let __hydra = null

        window.Hydra = function( shouldSrcGibberCanvas=false ) {
          const w = null
          const h = null
          environment.useProxies = false
          const canvas = document.createElement('canvas')
          canvas.width = w === null ? window.innerWidth : w
          canvas.height = h === null ? window.innerHeight : h
          canvas.style.width = `${canvas.width}px`
          canvas.style.height= `${canvas.height}px`

          const hydra = __hydra === null ?  new Hydrasynth({ canvas, global:false, detectAudio:false }) : __hydra
          document.getElementById('graphics').style = 'visibility:hidden'
          canvas.setAttribute('class','graphics')
          document.body.appendChild( canvas )

          window.hydra = hydra
          Gibber.subscribe( 'clear', ()=> hydra.hush() )
          hydra.setResolution(canvas.width,canvas.height)

          if( Gibber.Environment ) {
            const sheet = window.document.styleSheets[ window.document.styleSheets.length - 1 ]
            sheet.insertRule(
              '.CodeMirror pre { background-color: rgba( 0,0,0,.75 ) !important; }', 
              sheet.cssRules.length
            )
            if( shouldSrcGibberCanvas ) {
              s0.init({ 
                src:document.querySelector('#graphics'), 
                dynamic:true 
              })
            }
          }

          __hydra = hydra

          setTimeout( ()=> environment.useProxies = true, 0 )
          return hydra.synth
        }
        libs.Hydra = Hydra

        Gibber.Audio.Ugen.OUTPUT = 0
        res( Hydra )
      } 

      document.querySelector( 'head' ).appendChild( hydrascript )
    } else if( lib === 'p5' ) {
      if( libs.P5 !== undefined ) { res( libs.P5 ); return }

      // mute console error messages that are related to 
      // namespace clashes, log function is restored after
      // p5 script has been loaded.
      console.__log = console.log
      console.log = function() {} 

      const p5script = document.createElement( 'script' )
      p5script.src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.1.9/p5.js'

      window.setup = function(){
        if( Gibber.Environment ) {
          const sheet = window.document.styleSheets[ window.document.styleSheets.length - 1 ]
          sheet.insertRule(
            '.CodeMirror pre { background-color: rgba( 0,0,0,.75 ) !important; }', 
            sheet.cssRules.length
          )
        }
        createCanvas( window.innerWidth,window.innerHeight )

        // manage the draw loop ourselves so we can handle errors
        noLoop()
        window.__userDraw = window.draw
        window.__broken = false
        window.__draw = function() {
          // if the current draw function isn't broken...
          if( !window.__broken ) {
            try {
              // try to redraw
              redraw()
            }catch(e) {
              // if redraw fails print error and set broken flag
              console.log( e )
              window.__broken = true
            }
          }

          // if the user has created a new draw function...
          if( window.__userDraw !== window.draw ) {
            // store the new draw function...
            window.__userDraw = window.draw
            // ...and set the broken flag to false so that we 
            // try to resume drawing.
            window.__broken = false
          }

          window.__cancel = window.requestAnimationFrame( window.__draw )
        }

        window.__draw()
      }

      p5script.onload = function() {
        Gibber.subscribe( 'clear', ()=> {
          clear()
        })

        // .out() from ugens returns scalar, not function
        Gibber.Audio.Ugen.OUTPUT = 1
        libs.P5 = window.P5
        
        window.p5 = window.p5.instance
        window.p5.hydra = function() {
          s0.init({ 
            src:document.querySelector('.p5Canvas'), 
            dynamic:true 
          })
        }
        res( window.P5 )
        console.log = console.__log
      } 

      document.querySelector( 'head' ).appendChild( p5script )
     
    } else {
      const script = document.createElement( 'script' )
      script.src = lib

      document.querySelector( 'head' ).appendChild( script )

      script.onload = function() {
        //msg( `${lib} has been loaded.`, 'new module loaded' )
        res()
      }
    }
  })
  
  return p
}


// pass to synth.note.seq( 0, 1/4, 0, w=wait()
// call later to start seq with w()
window.wait = function() {
  const fnc = function() {
    fnc.seqs.forEach( seq => seq.start() )  
  }
  fnc.seqs = []

  return fnc
}

window.__Gibberwocky = function() {

Gibber.Audio.Gibberish.worklet.port.postMessage({
  address:'eval',
  code:`Gibberish.scheduler.shouldSync = true; Gibberish.isPlaying = false`
})

Gibber.shouldDelay = Gibber.Audio.shouldDelay = false

Gibber.ws = new WebSocket('ws://localhost:8082')
 
setTimeout( function() {
  Gibber.ws.onmessage = function( data ) {
    //console.log( data.data )
    if( data.data.indexOf( 'bit 1' ) > -1 ) {
      Gibber.Audio.Gibberish.worklet.port.postMessage({
        address:'eval',
        code:'if( Gibberish.isPlaying === true ) Gibberish.scheduler.shouldSync = false'
      })
    }else if( data.data.indexOf( 'ply 1' ) > -1 ) {
      console.log( 'play' )
      //Environment.metronome.clear()
      //Environment.metronome.beat = 0
      Gibber.Audio.Gibberish.worklet.port.postMessage({
        address:'eval',
        code:'Gibberish.isPlaying = true;'
      })
    }else if( data.data.indexOf( 'ply 0' ) > -1 ) {
      console.log( 'stop' )
      Environment.metronome.clear()
      Gibber.Audio.Gibberish.worklet.port.postMessage({
        address:'eval',
        code:'Gibberish.isPlaying = false; Gibberish.scheduler.shouldSync = true;' //Gibberish.Clock.beatCount = 0;'
      })
    }else if( data.data.indexOf( 'bpm' ) > -1 ) {
      Clock.bpm = data.data.split(' ')[2]
    }
  }}, 250 )
}


