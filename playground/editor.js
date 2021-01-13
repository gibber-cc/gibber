const CodeMirror    = require( 'codemirror' )

require( '../node_modules/codemirror/addon/dialog/dialog.js' )
require( '../node_modules/acorn/dist/acorn.js' )
require( '../node_modules/acorn-loose/dist/acorn-loose.js' )
require( '../node_modules/acorn-walk/dist/walk.js' )

require( '../node_modules/codemirror/mode/javascript/javascript.js' )
require( '../node_modules/codemirror/addon/edit/matchbrackets.js' )
require( '../node_modules/codemirror/addon/edit/closebrackets.js' )
require( '../node_modules/codemirror/addon/hint/show-hint.js' )
require( '../node_modules/codemirror/addon/hint/javascript-hint.js' )


let cm, cmconsole, exampleCode, 
    isStereo = false,
    fontSize = 1,
    environment = {
      proxies:[],
      createProxies: require( './proxies.js' ),
      networkConfig : { isNetworked :false },
      showArgHints:true,
      showCompletions:true,
      CodeMirror,
      runCode( cm, useBlock=false, useDelay=true, shouldRunNetworkCode=true, selectedCode=null, preview=false ) {
        try {
          if( selectedCode === null ) selectedCode = environment.getSelectionCodeColumn( cm, useBlock )

          window.genish = Gibber.Audio.Gen.ugens
          
          let code = `{
        'use jsdsp'
        ${selectedCode.code}
      }`
          code = Babel.transform(code, { presets: [], plugins:['jsdsp'] }).code 

          if( environment.networkConfig.isNetworked && shouldRunNetworkCode ) runCodeOverNetwork( selectedCode )

          environment.flash( cm, selectedCode.selection )

          const func = new Function( code )

          Gibber.shouldDelay = Gibber.Audio.shouldDelay = useDelay 

          const preWindowMembers = Object.keys( window )
          func()
          const postWindowMembers = Object.keys( window )

          if( preWindowMembers.length !== postWindowMembers.length ) {
            environment.createProxies( preWindowMembers, postWindowMembers, window, Environment, Gibber )
          }

          const markupFunction = () => {
            environment.codeMarkup.process( 
              selectedCode.code, 
              selectedCode.selection, 
              cm, 
              Gibber.currentTrack 
            ) 
          }

          markupFunction.origin = func

          if( !Environment.debug ) {
            Gibber.Scheduler.functionsToExecute.push( func )
            if( environment.annotations === true ) {
              Gibber.Scheduler.functionsToExecute.push( markupFunction  )
            }
          }else{
            //func()
            if( environment.annotations === true ) markupFunction()
          }
        } catch (e) {
          console.log( e )
          return
        }

        Gibber.shouldDelay = false
      },
      getSelectionCodeColumn( cm, findBlock ) {
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
      },
      flash(cm, pos) {
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
      },
      previewCode( cm, useBlock=false, useDelay=true, shouldRunNetworkCode=true, selectedCode=null ) {
        environment.flash( cm, selectedCode.selection )
      }
   } 

module.exports = function( Gibber ) {
  const editor = {}
  const cm = CodeMirror( document.querySelector('#editor'), {
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

  // setup autocomplete etc.
  require( './tern.js' )( Gibber, cm, environment )

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

  if( window.location.search !== '' ) {
    // use slice to get rid of ?
    const val = atob( window.location.search.slice(1) )
    cm.setValue(val)
  }else{
    cm.setValue( defaultCode )
  }

  return [cm,environment] 
}

CodeMirror.keyMap.playground =  {
  fallthrough:'default',

  'Cmd-Enter'( cm )   { environment.runCode( cm, false, true  ) },
  'Ctrl-Enter'( cm )  { environment.runCode( cm, false, true  ) },
  'Shift-Enter'( cm ) { environment.runCode( cm, false, false ) },
  'Alt-Enter'( cm )   { environment.runCode( cm, true,  true  ) },
  'Alt-Shift-Enter'( cm ) { environment.runCode( cm, true, true, true ) },

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
