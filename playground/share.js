//import * as Y from 'yjs'
const Y = require('yjs')
//import { WebsocketProvider } from 'y-websocket'
const WebsocketProvider = require('y-websocket').WebsocketProvider
//import { CodemirrorBinding } from 'y-codemirror'
const CodemirrorBinding = require('y-codemirror').CodemirrorBinding

const initShare = function( editor, username='anonymous', room='default' ) {
      const ydoc = new Y.Doc()
      const provider = new WebsocketProvider(
       'ws://127.0.0.1:8080',
       //'ws://gibber.cc:8080',
       room,
       ydoc,
       { connect:true }
      )

      const yText = ydoc.getText('codemirror')
      const binding = new CodemirrorBinding(yText, editor, provider.awareness)

      binding.awareness.setLocalStateField('user', { color: '#008833', name:username  })

      const socket = new WebSocket('ws://127.0.0.1:8081')

      // Listen for messages
      socket.addEventListener('message', function (event) {
        const msg = JSON.parse( event.data )

        switch( msg.cmd ) {
          case 'msg':
            console.log( msg.body )
            break
          case 'eval':
            console.log( 'eval cmd' )
            runNetworkedCode( msg.body )
            break
          default:
            console.log( 'error for message:', event.data )
        }
      })

      const send = function( msg ) {
        socket.send( JSON.stringify( msg ) )
      }

      const runNetworkedCode = function( selectedCode ) {

        window.genish = Gibber.Audio.Gen.ugens
      //var code = shouldUseJSDSP ? Babel.transform(selectedCode.code, { presets: [], plugins:['jsdsp'] }).code : selectedCode.code
      let code = `{
  'use jsdsp'
  ${selectedCode.code}
}`
        code = Babel.transform(code, { presets: [], plugins:['jsdsp'] }).code 

        console.log( selectedCode )

        flash( editor, selectedCode.selection )

        const func = new Function( code )

        Gibber.shouldDelay = Gibber.Audio.shouldDelay = true

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
            editor, 
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
      }
var flash = function(cm, pos) {
  var sel,
  cb = function() { sel.clear() }

  if (pos !== null) {
    if( pos.start ) { // if called from a findBlock keymap
      sel = cm.markText( pos.start, pos.end, { className:"CodeMirror-highlight" } );
    }else{ // called with single line
      sel = cm.markText( { line: pos.line, ch:0 }, { line: pos.line, ch:null }, { className: "CodeMirror-highlight" } )
    }
  }else{ // called with selected block
    sel = cm.markText( cm.getCursor(true), cm.getCursor(false), { className: "CodeMirror-highlight" } );
  }

  window.setTimeout(cb, 250);
}
      //resolve({ provider, ydoc, yText, Y, socket, send })
      return { provider, ydoc, yText, Y, socket, send }

}

module.exports = initShare 
