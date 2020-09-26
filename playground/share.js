const Y = require( 'yjs' ),
      WebsocketProvider = require( 'y-websocket'  ).WebsocketProvider,
      CodemirrorBinding = require( 'y-codemirror' ).CodemirrorBinding

const initShare = function( editor, username='anonymous', room='default' ) {
  const ydoc = new Y.Doc(),
        provider = new WebsocketProvider(
          'ws://'+ process.env.SERVER_ADDRESS +':' + process.env.SERVER_PORT,
          room,
          ydoc,
          { connect:true }
        ),
        yText = ydoc.getText( 'codemirror' ),
        binding = new CodemirrorBinding( yText, editor, provider.awareness ),
        // process.env variables are substituted in build script, and defined in .env file
        socket = new WebSocket( 'ws://'+ process.env.SERVER_ADDRESS +':' + process.env.SOCKET_PORT )

  binding.awareness.setLocalStateField('user', { color: '#008833', name:username  })

  // Listen for messages
  socket.addEventListener('message', function (event) {
    const msg = JSON.parse( event.data )

    switch( msg.cmd ) {
      case 'msg':
        console.log( msg.body )
        break
      case 'eval':
        Environment.runCode( editor, false, true, false, msg.body ) 
        break
      default:
        console.log( 'error for message:', event.data )
    }
  })

  return { provider, ydoc, yText, Y, socket }
}

module.exports = initShare 
