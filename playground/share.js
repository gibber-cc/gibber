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
        yText = ydoc.getText( 'codemirror' + room ),
        chatData = ydoc.getArray('chat' + room ),
        commands = ydoc.getArray('commands' + room ),
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

const setupShareHandler = function( cm, environment, networkConfig ) {
  document.querySelector('#connect').onclick = function() {
    const closeconnect = function() {
      const username = document.querySelector( '#connectname' ).value  
      const { socket, provider, binding, chatData, commands } = initShare( 
        cm, 
        username, 
        document.querySelector( '#connectroom' ).value 
      )
      __socket = socket
      networkConfig.isNetworked = true

      window.socket = socket
      window.binding = binding
      window.provider = provider
      window.chatData = chatData
      window.commands = commands
      window.username = username

      commands.observe( e => {
        if( e.transaction.local === false ) {
          // XXX only process last change, should we process all changes?
          // if we did this would allow late users to potentially "catch up"
          // with a performance...

          const inserts = e.changes.delta[0].insert
          for( let i = inserts.length - 1; i > 0; i -= 5 ) {
            const arr = e.changes.delta[0].insert.slice( i-4, i+1 )
            console.log( arr )
            const code = {
              selection:{
                start: { line:arr[0], ch:arr[1] },
                end:   { line:arr[2], ch:arr[3] }
              },
              code: arr[4]
            }

            
            environment.runCode( cm, false, true, false, code )
          }
        }
      })

      chatData.observe( e => {
        const msgs = e.changes.delta[0].insert
        for( let i = msgs.length-1; i>=0; i-- ) {
          const msg = msgs[ i ]

          makeMsg( msg.username, msg.value )
        }
      })

      environment.showArgHints = false
      environment.showCompletions = false
      
      menu.remove()

      document.querySelector('#connect').innerText = 'disconnect'
      document.querySelector('#connect').onclick = null
      document.querySelector('.CodeMirror-scroll').removeEventListener( 'click', blurfnc )

      createChatWindow()

      __connected = true
      return true
    }

    const menu = document.createElement('div')
    menu.setAttribute('id', 'connectmenu')
    menu.style.width = '12.5em'
    menu.style.height = '11.5em'
    menu.style.position = 'absolute'
    menu.style.display = 'block'
    menu.style.border = '1px #666 solid'
    menu.style.borderTop = 0
    menu.style.top = '3em'
    menu.style.right = 0 
    menu.style.zIndex = 1000

    menu.innerHTML = `<p style='font-size:.7em; margin:.5em; margin-bottom:1.5em'>gabber is a server for shared performances / chat. joining a gabber performance will make your code execute on all connected computers in the same room... and their code execute on yours.</p><input type='text' value='your name' class='connect' id='connectname'><input class='connect' type='text' value='room name' id='connectroom'><button id='connect-btn' style='float:right; margin-right:.5em'>join</button>`

    document.body.appendChild( menu )
    document.querySelector('#connectmenu').style.left = document.querySelector('#connect').offsetLeft + 'px'
    document.getElementById('connectname').focus()
    document.getElementById('connectname').select()

    document.getElementById('connect-btn').onclick = closeconnect

    const blurfnc = ()=> {
      menu.remove()
      document.querySelector('.CodeMirror-scroll').removeEventListener( 'click', blurfnc )
    }
    document.querySelector('.CodeMirror-scroll').addEventListener( 'click', blurfnc )
  }

}

const createChatWindow = function() {
  const headerHeight = document.querySelector('header').offsetHeight
  
  const writer = document.createElement('input')
  Object.assign( writer.style, {
    position:'absolute',
    boxSizing:'border-box',
    margin:'1em',
    width:'calc(100% - 2em)',
    bottom:'1em',
    border:'1px solid #666'
  })

  writer.onchange = () => {
    chatData.unshift([
      { username, value:writer.value }
    ])
    writer.value = ''
  }
  
  const container = document.createElement('div')
  Object.assign( container.style, {
    position:'absolute',
    width:'300px',
    right:0,
    top: headerHeight + 'px',
    height: `calc(100% - ${headerHeight}px)`,
    borderWidth:'0 1px',
    borderStyle:'solid',
    borderColor:'#666',
    zIndex:10,
    'overflow-wrap':'anywhere'
  })
  container.setAttribute( 'id', 'chat' )

  const msgs = document.createElement('div')
  Object.assign( msgs.style, {
    height:'calc(100% - 4em)',
    width:'calc(100% - 2px)',
    'overflow-y':'auto'
  })
  msgs.setAttribute( 'id', 'chatmsgs' )

  container.appendChild( msgs )
  container.appendChild( writer )
  document.body.appendChild( container )
}

const makeMsg = function( user, msg ) {
  const chatDiv = document.querySelector('#chatmsgs')
  const div = document.createElement('div')

  Object.assign( div.style, {
    width:'100%',
    position:'relative',
    display:'block',
    marginBottom:'.25em'
  })
  div.innerHTML = `<span style="background:black; color:white; padding:0 .5em">${user}:</span> ${msg}`
  chatDiv.appendChild( div )
  chatDiv.scrollTop = chatDiv.scrollHeight

}

module.exports = { setupShare:setupShareHandler, makeMsg }
