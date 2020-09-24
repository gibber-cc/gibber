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
            eval( msg.body )
            break
          default:
            console.log( 'error for message:', event.data )
        }
      })

      const send = function( msg ) {
        socket.send( JSON.stringify( msg ) )
      }

      //resolve({ provider, ydoc, yText, Y, socket, send })
      return { provider, ydoc, yText, Y, socket, send }

}

module.exports = initShare 
