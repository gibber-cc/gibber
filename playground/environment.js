const Gibber        = require( 'gibber.core.lib' ),
      Audio         = require( 'gibber.audio.lib' ),
      Graphics      = require( 'gibber.graphics.lib' ),
      createProxies = require( './proxies.js' ),
      codeMarkup    = require( './codeMarkup.js' ),
      CodeMirror    = require( 'codemirror' ),
      Theme         = require( './resources/js/theme.js' ),
      Metronome     = require( './metronome.js' ),
      {setupShare,makeMsg} = require( './share.js' )

require( '../node_modules/codemirror/addon/dialog/dialog.js' )
require( '../node_modules/acorn/dist/acorn.js' )
require( '../node_modules/acorn-loose/dist/acorn-loose.js' )
require( '../node_modules/acorn-walk/dist/walk.js' )
require( '../node_modules/tern/doc/demo/polyfill.js' )
require( '../node_modules/tern/lib/signal.js' )

// seemingly required as global by codemirror addon (sheesh)
window.tern = require( '../node_modules/tern/lib/tern.js' )

require( '../node_modules/tern/lib/def.js' )
require( '../node_modules/tern/lib/comment.js' )
require( '../node_modules/tern/lib/infer.js' )
require( '../node_modules/tern/plugin/doc_comment.js' )
require( '../node_modules/codemirror/mode/javascript/javascript.js' )
require( '../node_modules/codemirror/addon/edit/matchbrackets.js' )
require( '../node_modules/codemirror/addon/edit/closebrackets.js' )
require( '../node_modules/codemirror/addon/hint/show-hint.js' )
require( '../node_modules/codemirror/addon/hint/javascript-hint.js' )
require( '../node_modules/codemirror/addon/tern/tern.js' )

let cm, cmconsole, exampleCode, 
    isStereo = false,
    environment = {
      showArgHints:true,
      showCompletions:true
    },
    fontSize = 1

window.Gibber = Gibber

window.onload = function() {
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

  
  cm = CodeMirror( document.querySelector('#editor'), {
    mode:   'javascript',
    value:  '// click in the editor to begin!!!',
    keyMap: 'playground',
    autofocus: true,
    //matchBrackets:true,
    indentUnit:2,
    autoCloseBrackets:true,
    tabSize:2,
    extraKeys:{ 'Ctrl-Space':'autocomplete' },
    hintOptions:{ hint:CodeMirror.hint.javascript }
  })


  Babel.registerPlugin( 'jsdsp', jsdsp )

  cm.setSize( null, '100%' )

  function getURL(url) {
    const xhr = new XMLHttpRequest()
    xhr.open( 'get', url, true )

    const p = new Promise( (resolve, reject ) => {
      xhr.send()
      xhr.onreadystatechange = function() {
        if (xhr.readyState != 4) return
        if (xhr.status < 400) resolve( xhr.responseText )
        const e = new Error( xhr.responseText || "No response" )
        e.status = xhr.status
        reject( e )
      }
    })

    return p
  }
  const filter = function( doc, query, request,error,data ) {
    debugger
  } 

  let server
  Promise.all( [ getURL("./gibber.def.json" ) ] ).then( defs => {
    environment.server = server = new CodeMirror.TernServer({defs: defs.map( JSON.parse ), options:{ hintDelay:5000, responseFilter:filter } })

    cm.setOption("extraKeys", {
      "Ctrl-Space": function(cm) { server.complete(cm) },
      "Ctrl-I"    : function(cm) { server.showType(cm) },
      "Ctrl-O"    : function(cm) { server.showDocs(cm) }
    })

    cm.on( 'cursorActivity', function( cm ) { 
      if( environment.showArgHints === true ) {
        server.updateArgHints( cm ) 
      }
    })

    cm.on( 'change', function( cm, change ) {
      if( environment.showCompletions === true ) {
        if( change.text[ change.text.length - 1 ] === '.' ) {
          //console.log( 'complete' )
          server.complete( cm )
        }
      }
    })
  })

  cm.getWrapperElement().addEventListener( 'click', e => {
    if( e.altKey === true ) {
      let obj
      let node = e.path[0]
      while( node.parentNode.className.indexOf( 'CodeMirror-line' ) === -1 ) {
        node = node.parentNode
      }
      const split = node.innerText.split( '=' )[0].split('.')
      let txt = null
      try {
        obj = window[  split[0].trim() ]
        for( let i = 1; i < split.length; i++ ) {
          obj = obj[ split[ i ].trim() ]
        }
        if( obj !== undefined )
          txt = obj.value !== undefined ? obj.value : obj
      } catch(e) {
        throw e
      }

      if( obj !== undefined ) {
        // XXX ideally this would return a promise that we could use to insert the current
        // value of the property into once the DOM node has been added. 
        // Instead we have to use a hacky setTimeout... to fix this we need to edit
        // the ternserver itself.
        server.showDocs( cm ) 

        setTimeout( ()=>{
          cm.state.ternTooltip.children[0].innerHTML = `value: ${txt} ${cm.state.ternTooltip.children[0].innerHTML}`
        }, 50 )
      }
    }
  })

  var Pos = CodeMirror.Pos;
  var cls = "CodeMirror-Tern-";
  var bigDoc = 250;
  function elt(tagname, cls /*, ... elts*/) {
    var e = document.createElement(tagname);
    if (cls) e.className = cls;
    for (var i = 2; i < arguments.length; ++i) {
      var elt = arguments[i];
      if (typeof elt == "string") elt = document.createTextNode(elt);
      e.appendChild(elt);
    }
    return e;
  }
  function tempTooltip(cm, content, ts) {
    if (cm.state.ternTooltip) remove(cm.state.ternTooltip);
    var where = cm.cursorCoords();
    var tip = cm.state.ternTooltip = makeTooltip(where.right + 1, where.bottom, content);
    function maybeClear() {
      old = true;
      if (!mouseOnTip) clear();
    }
    function clear() {
      cm.state.ternTooltip = null;
      if (tip.parentNode) fadeOut(tip)
      clearActivity()
    }
    var mouseOnTip = false, old = false;
    CodeMirror.on(tip, "mousemove", function() { mouseOnTip = true; });
    CodeMirror.on(tip, "mouseout", function(e) {
      var related = e.relatedTarget || e.toElement
      if (!related || !CodeMirror.contains(tip, related)) {
        if (old) clear();
        else mouseOnTip = false;
      }
    });
    setTimeout(maybeClear, ts.options.hintDelay ? ts.options.hintDelay : 1700);
    var clearActivity = onEditorActivity(cm, clear)
  }

  function onEditorActivity(cm, f) {
    cm.on("cursorActivity", f)
    cm.on("blur", f)
    cm.on("scroll", f)
    cm.on("setDoc", f)
    return function() {
      cm.off("cursorActivity", f)
      cm.off("blur", f)
      cm.off("scroll", f)
      cm.off("setDoc", f)
    }
  }

  function makeTooltip(x, y, content) {
    var node = elt( "div", cls + "tooltip", content )
    node.style.left = x + "px"
    node.style.top = y + "px"
    document.body.appendChild( node )
    return node
  }

  function remove(node) {
    var p = node && node.parentNode;
    if (p) p.removeChild(node);
  }

  function fadeOut(tooltip) {
    tooltip.style.opacity = "0";
    setTimeout(function() { remove(tooltip); }, 1100);
  }

  
  const defaultCode = `// hit alt+enter to run all code
// or run line/selection with ctrl+enter.
// ctrl+period to stop all sounds.
 
Theory.tuning = 'slendro'
Theory.mode = null
  
verb = Bus2('spaceverb')
delay = Bus2('delay.1/3').connect( verb, .1 )
  
perc = PolyFM('perc', { voices:3 })
  .connect( verb, .35 ).connect( delay, .65 )
  .spread(.975)
  .note.seq( sine( btof(8),7,0 ), 1/8,  0 )
  .note.seq( sine( btof(4),3,0 ), 1/16, 1 )
  .note.seq( sine( btof(8),7,7 ), 1/6,  2 )
  .loudness.seq( sine(4.33,.35,.7)  )
 
kik = Kick()
  .trigger.seq( 1,1/4 )
 
hat = Hat({ decay:.0125 })
  .trigger.seq( [1,.5], 1/4, 0, 1/8 )
 
bass = Synth('bass.hollow')
  .note.seq( [0,1,2,-1], 1 )
  .trigger.seq( [.75,.5,.25], [1/4,1/8] )
 
clave = Clave({ gain:.1 }).connect( verb, .25 )
  .trigger.seq( .5, e = Euclid(3,8) )
 
e.rotate.seq( [1,-1], 2, 0, 4 )
 
fm = FM({ feedback:.0015, decay:1/2 })
  .connect( verb, .35 ).connect( delay, .125 )
	.note.seq( 
  	sine( btof(4.5),4,5 ), 
  	Hex(0x8032,1/4 ),
  	0,
    8
  )`

  const workletPath = './gibberish_worklet.js' 
  const start = () => {

    if( window.location.search !== '' ) {
      // use slice to get rid of ?
      const val = atob( window.location.search.slice(1) )
      cm.setValue(val)
    }else{
      cm.setValue( defaultCode )
    }
    
    const promises = Gibber.init([
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
          ['music tutorial #6: step sequencing', 'steps.js' ], 
          ['music tutorial #7: creating synths', 'make.js' ], 

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
}


let shouldUseProxies = false
environment.proxies = []

const shouldUseJSDSP = true

let hidden = false
const toggleGUI = function() {
  hidden = !hidden
  if( hidden === true ) {
    document.getElementsByTagName('header')[0].style.display = 'none'
    cm.getWrapperElement().style.display = 'none'
  }else{
    document.getElementsByTagName('header')[0].style.display = 'block'
    cm.getWrapperElement().style.display = 'block'
  }
}

delete CodeMirror.keyMap.default[ 'Ctrl-H' ]

window.addEventListener( 'keydown', e => {
  if( e.key === 'h' && e.ctrlKey === true ) {
    toggleGUI()
  }
})

let networkConfig = { isNetworked :false }

const runCodeOverNetwork = function( selectedCode ) {
  //socket.send( JSON.stringify({ cmd:'eval', body:selectedCode }) ) 
  //binding.awareness.setLocalStateField( 'code', [selectedCode] )
  const sel = selectedCode.selection,
        end = sel.end,
        start = sel.start
        
  commands.unshift([ start.line, start.ch, end.line, end.ch, selectedCode.code ])
}

// shouldRunNetworkCode is used to prevent recursive ws sending of code
// while isNetworked is used to test for acive ws connection
// selectedCode can be set via ws messages
environment.runCode = function( cm, useBlock=false, useDelay=true, shouldRunNetworkCode=true, selectedCode=null ) {
  try {
    if( selectedCode === null ) selectedCode = environment.getSelectionCodeColumn( cm, useBlock )

    window.genish = Gibber.Audio.Gen.ugens
    
    let code = `{
  'use jsdsp'
  ${selectedCode.code}
}`
    code = Babel.transform(code, { presets: [], plugins:['jsdsp'] }).code 

    if( networkConfig.isNetworked && shouldRunNetworkCode ) runCodeOverNetwork( selectedCode )

    environment.flash( cm, selectedCode.selection )

    const func = new Function( code )

    Gibber.shouldDelay = Gibber.Audio.shouldDelay = useDelay 

    const preWindowMembers = Object.keys( window )
    func()
    const postWindowMembers = Object.keys( window )

    if( preWindowMembers.length !== postWindowMembers.length ) {
      createProxies( preWindowMembers, postWindowMembers, window, Environment, Gibber )
    }

    const markupFunction = () => {
      Environment.codeMarkup.process( 
        selectedCode.code, 
        selectedCode.selection, 
        cm, 
        Gibber.currentTrack 
      ) 
    }

    markupFunction.origin = func

    if( !Environment.debug ) {
      Gibber.Scheduler.functionsToExecute.push( func )
      if( Environment.annotations === true ) {
        Gibber.Scheduler.functionsToExecute.push( markupFunction  )
      }
    }else{
      //func()
      if( Environment.annotations === true ) markupFunction()
    }
  } catch (e) {
    console.log( e )
    return
  }

  Gibber.shouldDelay = false
}

CodeMirror.keyMap.playground =  {
  fallthrough:'default',

  'Cmd-Enter'( cm )   { environment.runCode( cm, false, true  ) },
  'Ctrl-Enter'( cm )  { environment.runCode( cm, false, true  ) },
  'Shift-Enter'( cm ) { environment.runCode( cm, false, false ) },
  'Alt-Enter'( cm )   { environment.runCode( cm, true,  true  ) },

  'Ctrl-.'( cm ) {
    Gibber.clear()

    for( let key of environment.proxies ) delete window[ key ]
    environment.proxies.length = 0
  },
  'Shift-Ctrl-C'(cm) { toggleSidebar() },

  "Shift-Ctrl-=": function(cm) {
    fontSize += .2
    document.querySelector('#editor').style.fontSize = fontSize + 'em'
    document.querySelector('#editor').style.paddingLeft = (fontSize/4) + 'em'
    cm.refresh()
  },

  "Shift-Ctrl--": function(cm) {
    fontSize -= .2
    document.querySelector('#editor').style.fontSize = fontSize + 'em'
    document.querySelector('#editor').style.paddingLeft = (fontSize/4) + 'em'
    cm.refresh()
  },
        
}

const toggleSidebar = () => {
    Environment.sidebar.isVisible = !Environment.sidebar.isVisible
    let editor = document.querySelector( '#editor' )
    if( !Environment.sidebar.isVisible ) {
      Environment.editorWidth = editor.style.width
      editor.style.width = '100%'
    }else{
      editor.style.width = Environment.editorWidth
    }

    Environment.sidebar.style.display = Environment.sidebar.isVisible ? 'block' : 'none'
}

environment.getSelectionCodeColumn = function( cm, findBlock ) {
  let  pos = cm.getCursor(), 
  text = null

  if( !findBlock ) {
    text = cm.getDoc().getSelection()

    if ( text === "") {
      text = cm.getLine( pos.line )
    }else{
      pos = { start: cm.getCursor('start'), end: cm.getCursor('end') }
      //pos = null
    }
  }else{
    let startline = pos.line, 
        endline = pos.line,
        pos1, pos2, sel

    while ( startline > 0 && cm.getLine( startline ) !== "" ) { startline-- }
    while ( endline < cm.lineCount() && cm.getLine( endline ) !== "" ) { endline++ }

    pos1 = { line: startline, ch: 0 }
    pos2 = { line: endline, ch: 0 }

    text = cm.getRange( pos1, pos2 )

    pos = { start: pos1, end: pos2 }
  }

  if( pos.start === undefined ) {
    let lineNumber = pos.line,
        start = 0,
        end = text.length

    pos = { start:{ line:lineNumber, ch:start }, end:{ line:lineNumber, ch: end } }
  }

  return { selection: pos, code: text }
}

environment.flash = function(cm, pos) {
  let sel,
      cb = function() { sel.clear() }

  if (pos !== null) {
    if( pos.start ) { // if called from a findBlock keymap
      sel = cm.markText( pos.start, pos.end, { className:"CodeMirror-highlight" } );
    }else{ // called with single line
      sel = cm.markText( { line: pos.line, ch:0 }, { line: pos.line, ch:null }, { className: "CodeMirror-highlight" } )
    }
  }else{ // called with selected block
    sel = cm.markText( cm.getCursor(true), cm.getCursor(false), { className: "CodeMirror-highlight" } )
  }

  window.setTimeout( cb, 250 )
}

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
  menu.style.top = '3em'
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
    menu.style.top = '3em'
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


let __socket = null
let __connected = false

window.makeMsg = makeMsg
window.addEventListener('load', ()=> {
  document.getElementById('sharebtn').onclick = getlink
  setupShare(cm, environment, networkConfig ) 
})

