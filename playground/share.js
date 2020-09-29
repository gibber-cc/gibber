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
        chatData = ydoc.getArray('chat'),
        commands = ydoc.getArray('commands'),
        binding = new CodemirrorBinding( yText, editor, provider.awareness ),
        socket = provider.ws

  binding.awareness.setLocalStateField('user', { color: '#008833', name:username  })

  // Listen for messages
  socket.addEventListener('message', function (event) {
    if( event.data instanceof ArrayBuffer ) return 

    const msg = JSON.parse( JSON.stringify(event.data) )

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

  return { provider, ydoc, yText, Y, socket, binding, chatData, commands }
}

module.exports = initShare 
