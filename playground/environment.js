const Gibber        = require( 'gibber.core.lib' ),
      Audio         = require( 'gibber.audio.lib' ),
      Graphics      = require( 'gibber.graphics.lib' ),
      codeMarkup    = require( './codeMarkup.js' ),
      CodeMirror    = require( 'codemirror' ),
      Theme         = require( './resources/js/theme.js' ),
      Metronome     = require( './metronome.js' ),
      Editor        = require( './editor.js' ),
      Share         = require( './share.js' )

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

  const themename = localStorage.getItem('themename')

  if( themename !== null ) {
    document.querySelector('#themer').src = `./resources/themes/${themename}.png`
  }else{
    document.querySelector('#themer').src = `./resources/themes/noir.png`
  }

  environment.share = Share

  const workletPath = './gibberish_worklet.js' 
  const start = () => {
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
      //setupFFT( Marching.FFT )

      const fft = window.FFT = Marching.FFT
      fft.input = Gibber.Audio.Gibberish.worklet
      fft.__hasInput = true
      fft.ctx = Gibber.Audio.Gibberish.ctx

      fft.start = function() {  
        fft.createFFT()
        fft.input.connect( fft.FFT )
        fft.interval = setInterval( fft.fftCallback, 1000/60 )
      }

      fft.clear = function() { clearInterval( fft.interval ) }

      Metronome.init( Gibber )
      environment.metronome = Metronome
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

    environment.Annotations = environment.codeMarkup 
    
    Gibber.Environment = environment

    window.onclick = null
    window.onkeypress = null
  }

  window.onclick = start
  window.onkeypress = start

  const select = document.querySelector( 'select' ),
        files = [
          ['demo #1: intro', 'newintro.js'],
          ['demo #2: pick your sample', 'picksomesamples.js'],
          ['demo #2: acid', 'acid.js'],
          ['demo #3: moody', 'intro.js'],
          ['demo #4: geometry melds', 'meld.js'],

          ['tutorial #1: running/stopping code', 'intro.tutorial.js'],
          ['tutorial #2: creating objects', 'creating.objects.js'],
          ['tutorial #3: basic sequencing', 'sequencing.js'],
          ['tutorial #4: patterns', 'pattern.js'],
          ['tutorial #5: audiovisual mappings', 'mapping.js'],
          ['tutorial #6: tidalcycles', 'tidal.js' ],
          ['tutorial #7: modulation', 'modulation.js' ],

          ['music tutorial #1: scales/tunings', 'scales.tunings.js'],
          ['music tutorial #2: effects and busses', 'effects.js'],
          ['music tutorial #3: arpeggios and signals', 'arp.js' ], 
          ['music tutorial #4: polyphony', 'polyphony.js' ], 
          ['music tutorial #5: freesound', 'freesound.js' ], 
          ['music tutorial #6: samplers', 'sampler.js' ],
          ['music tutorial #7: step sequencing', 'steps.js' ], 
          ['music tutorial #8: creating synths', 'make.js' ], 

          ['sound design tutorial #1: oscillators', 'sounddesign_oscillators.js'],
          ['sound design tutorial #2: envelopes', 'sounddesign_envelopes.js'],

          ['graphics tutorial #1: intro to constructive solid geometry', 'graphics.intro.js' ],  
          ['graphics tutorial #2: lighting and materials', 'graphics.lighting.js' ], 
          ['graphics tutorial #3: textures', 'texture.js' ]  
        ]

  for( let file of files ) {
    const opt = document.createElement('option')
    opt.innerText = file[0]
    select.appendChild( opt )
  }

  select.onchange = function( e ) {
    loadexample( files[ select.selectedIndex ][1] )
  }

  const loadexample = function( filename ) {
    const  req = new XMLHttpRequest()
    req.open( 'GET', './examples/'+filename, true )
    req.onload = function() {
      const js = req.responseText
      window.Environment.editor.setValue( js )
    }

    req.send()
  }

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

  hidebtn.addEventListener( 'click', function(e) {
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
  })
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

window.__use = function( lib ) {
  let p
  if( lib === 'vim' ) {
    window.CodeMirror = CodeMirror
    p = new Promise( (res,rej) => {
      const __p = window.__use( 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.2/keymap/vim.min.js' ).then( ()=> {
        CodeMirror.keyMap.playground.fallthrough = 'vim'
        cm.setOption( 'vimMode', true )
        cm.setOption( 'extraKeys', CodeMirror.keyMap.playground )
        res()
      })
    })
  }else{
    p = new Promise( (res,rej) => {
      const script = document.createElement( 'script' )
      script.src = lib

      document.querySelector( 'head' ).appendChild( script )

      script.onload = function() {
        //msg( `${lib} has been loaded.`, 'new module loaded' )
        res()
      }
    }) 
  }
  
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
