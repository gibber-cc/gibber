const Gibber = window.Gibber = require( 'gibber.core.lib' )
const Audio  = require( 'gibber.audio.lib' )
const Graphics = require( 'gibber.graphics.lib' )

const createProxies = require( './proxies.js' )
const codeMarkup = require( './codeMarkup.js' )
const share      = require( './share.js' )

const Toastr = require('toastr')

const CodeMirror = require( 'codemirror' )
require("../node_modules/codemirror/addon/dialog/dialog.js")
require("../node_modules/acorn/dist/acorn.js")
require("../node_modules/acorn-loose/dist/acorn-loose.js")
require("../node_modules/acorn-walk/dist/walk.js")
require("../node_modules/tern/doc/demo/polyfill.js")
require("../node_modules/tern/lib/signal.js")

// seemingly required as global by codemirror addon (sheesh)
window.tern = require("../node_modules/tern/lib/tern.js")
require("../node_modules/tern/lib/def.js")
require("../node_modules/tern/lib/comment.js")
require("../node_modules/tern/lib/infer.js")
require("../node_modules/tern/plugin/doc_comment.js")
require("../node_modules/codemirror/mode/javascript/javascript.js")
require("../node_modules/codemirror/addon/edit/matchbrackets.js")
require("../node_modules/codemirror/addon/edit/closebrackets.js")
require("../node_modules/codemirror/addon/hint/show-hint.js")
require("../node_modules/codemirror/addon/hint/javascript-hint.js")
require("../node_modules/codemirror/addon/tern/tern.js")


let cm, cmconsole, exampleCode, 
    isStereo = false,
    environment = {
      showArgHints:true,
      showCompletions:true
    },
    fontSize = 1

window.onload = function() {
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
// or go line by line with ctrl+enter
Clock.bpm = 140
 
verb = Bus2('spaceverb')
 
perc = PolySynth('square.perc')
perc.connect( verb, .35 ).connect()
perc.spread(1)
 
perc.note.seq( 
  gen( cycle(2) * 7 ), 
  Hex(0x8036) 
)
perc.note.seq( 
  gen( 7 + cycle(2.25) * 4 ), 
  Hex(0x4541), 
  1 
)
perc.loudnessV.seq( gen( .65 + cycle(1.5) * .5 ) )
 
bass = Monosynth('bassPad', { decay:4 })
bass.connect( verb, .5 )
bass.note.seq( [0,-1,-2,-4], 4 )
 
k = Kick()
k.trigger.seq( 1,1/4 )
 
h = Hat()
h.connect( verb, .15 )
h.trigger.tidal( '<.5 .35*3 [.5 .25] [.75 .25 .5 .25]>' )
h.decay = gen( .05 + cycle(2)* .025 )
 
lead = Synth( 'cry', { gain:.1, octave:1 })
lead.connect( verb, 1 )
lead.note.seq( 
  gen( cycle(.15) * 7 ), 
  [1/2,1,2] 
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
        options: { workletPath }
      },
      {
        name:    'Graphics',
        plugin:  Graphics,
        options: { canvas:document.querySelector('canvas' ) }
      }
    ]).then( ()=> {
      Gibber.Audio.Theory.__loadingPrefix = './resources/tune.json/' 
      Gibber.export( window ) 
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
          ['demo #1: intro', 'intro.js'],
          ['demo #2: acid', 'acid.js'],
          ['demo #3: geometry melds', 'meld.js'],

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
}

/*const setupSplit = function() {
  const splitDiv = document.querySelector( '#splitbar' ),
        editor   = document.querySelector( '#editor'   ),
        sidebar  = document.querySelector( '#console'  )

  const mouseup = evt => {
    window.removeEventListener( 'mousemove', mousemove )
    window.removeEventListener( 'mouseup', mouseup )
  }

  const mousemove = evt => {
    const splitPos = evt.clientX

    editor.style.width = splitPos + 'px'
    sidebar.style.left = splitPos  + 'px'
    sidebar.style.width = (window.innerWidth - splitPos) + 'px'
  }

  splitDiv.addEventListener( 'mousedown', evt => {
    window.addEventListener( 'mousemove', mousemove )
    window.addEventListener( 'mouseup', mouseup )
  })
}*/

const fixCallback = function( cb ) {
  const cbarr = cb.split( '\n' )
  cbarr.splice(1,1)
  cbarr[0] += ') {'

  return cbarr.join('\n')
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

let isNetworked = false

const runCodeOverNetwork = function( selectedCode ) {
  console.log( 'sending:', selectedCode )
  __socket.send( JSON.stringify({ cmd:'eval', body:selectedCode }) ) 
}

const runCode = function( cm, useBlock=false, useDelay=true ) {
  try {
    const selectedCode = getSelectionCodeColumn( cm, useBlock )

    window.genish = Gibber.Audio.Gen.ugens
    
    let code = `{
  'use jsdsp'
  ${selectedCode.code}
}`
    code = Babel.transform(code, { presets: [], plugins:['jsdsp'] }).code 

    if( isNetworked ) runCodeOverNetwork( selectedCode )

    flash( cm, selectedCode.selection )

    const func = new Function( code )

    Gibber.shouldDelay = Gibber.Audio.shouldDelay = useDelay 

    const preWindowMembers = Object.keys( window )
    func()
    const postWindowMembers = Object.keys( window )

    if( preWindowMembers.length !== postWindowMembers.length ) {
      createProxies( preWindowMembers, postWindowMembers, window, Environment, Gibber )
    }

    //const func = new Function( selectedCode.code ).bind( Gibber.currentTrack ),
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

  'Ctrl-Enter'( cm )  { runCode( cm, false, true  ) },
  'Shift-Enter'( cm ) { runCode( cm, false, false ) },
  'Alt-Enter'( cm )   { runCode( cm, true,  true  ) },

  'Ctrl-.'( cm ) {
    Gibber.clear()

    for( let key of environment.proxies ) delete window[ key ]
    environment.proxies.length = 0
    //Gibberish.generateCallback()
    //cmconsole.setValue( fixCallback( Gibberish.callback.toString() ) )
  },
  'Shift-Ctrl-C'(cm) { toggleSidebar() },

  "Shift-Ctrl-=": function(cm) {
    fontSize += .2
    document.querySelector('#editor').style.fontSize = fontSize + 'em'
    document.querySelector('#editor').style.paddingLeft= (fontSize/4) + 'em'
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

const getSelectionCodeColumn = function( cm, findBlock ) {
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

const flash = function(cm, pos) {
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

  Toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": false,
    "progressBar": false,
    "positionClass": "toast-top-center",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": 0,
    "extendedTimeOut": 0,
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut",
    "tapToDismiss": false
  }

  copyToClipboard( link )
  //Toastr["info"](`<a href="${link}">${name}</a>`, "Your sketch link:")
  Toastr["success"]("Your sketch link was copied to the clipboard.")

  return link
}

let __socket = null
let __connected = false

window.addEventListener('load', function() {
  document.querySelector('#connect').onclick = function() {
    const closeconnect = function() {
      const { socket } = share( 
        cm, 
        document.querySelector('#connectname' ).value,  
        document.querySelector('#connectroom' ).value 
      )
      __socket = socket
      isNetworked = true
      menu.remove()

      document.querySelector('#connect').innerText = 'disconnect'
      document.querySelector('#connect').onclick = null

      __connected = true
      return true
    }

    const menu = document.createElement('div')
    menu.setAttribute('id', 'connectmenu')
    menu.style.width = '12.5em'
    menu.style.height = '5.5em'
    menu.style.position = 'absolute'
    menu.style.display = 'block'
    menu.style.border = '1px #666 solid'
    menu.style.borderTop = 0
    menu.style.top = '3em'
    menu.style.right = 0 
    menu.style.zIndex = 1000

    menu.innerHTML = `<input type='text' value='your name' class='connect' id='connectname'><input class='connect' type='text' value='room name' id='connectroom'><button id='connect-btn' style='float:right; margin-right:.5em'>go</button>`

    document.body.appendChild( menu )
    document.querySelector('#connectmenu').style.left = document.querySelector('#connect').offsetLeft + 'px'
    document.getElementById('connectname').focus()
    document.getElementById('connectname').select()

    document.getElementById('connect-btn').onclick = closeconnect
  }

})
