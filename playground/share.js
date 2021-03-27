const Y = require( 'yjs' ),
      WebsocketProvider = require( 'y-websocket'  ).WebsocketProvider,
      CodemirrorBinding = require( 'y-codemirror' ).CodemirrorBinding

const share = {
  addUser( userInfo ) {
    console.log( userInfo )
  },
  initShare( editor, username='anonymous', room='default' ) {
    const protocol = window.location.hostname === '127.0.0.1' ? 'ws' : 'wss'
    const ydoc = new Y.Doc(),
          provider = new WebsocketProvider(
            `${protocol}://${window.location.host}`,
            room,
            ydoc,
            { connect:true }
          ),
          yText = ydoc.getText( 'codemirror' + room ),
          chatData = ydoc.getArray('chat' + room ),
          userData = ydoc.getArray('user' + room ),
          commands = ydoc.getArray('commands' + room ),
          binding = new CodemirrorBinding( yText, editor, provider.awareness ),
          socket = provider.ws

    binding.awareness.setLocalStateField( 'user', { color: '#008833', name:username  })

    // Listen for messages
    socket.addEventListener('message', function (event) {
      if( event.data instanceof ArrayBuffer ) return 

      const msg = JSON.parse( JSON.stringify(event.data) )

      switch( msg.cmd ) {
        case 'user':
          share.addUser( msg.body )
          break
        case 'msg':
          console.log( msg.body )
          break
        case 'eval':
          Environment.runCode( editor, false, true, false, msg.body, false ) 
          break
        case 'preview':
          Environment.previewCode( editor, false, true, false, msg.body, true )
          break
        default:
          console.log( 'error for networked message:', event.data )
      }
    })

    const clear = function( clearEditor = false ){ 
      Gibber.clear()
      commands.delete( 0, commands.length )
      if( clearEditor ) editor.setValue('')
    }
    return { provider, ydoc, yText, Y, socket, binding, chatData, commands, userData, clear }
  },

  setupShareHandler( cm, environment, networkConfig ) {
    document.querySelector('#connect').onclick = function() {
      const closeconnect = function() {
        const shouldShowChat  = document.querySelector('#showChat').checked,
              useSharedEditor = document.querySelector('#useSharedEditorBox').checked,
              username = document.querySelector( '#connectname' ).value,  
              roomname = document.querySelector( '#connectroom' ).value

        const { socket, provider, binding, chatData, commands, userData, clear } = share.initShare(
          cm, 
          username, 
          roomname
        )
        share.clear = clear
        share.commands = commands

        userData.unshift([{ username }])

        __socket = socket
        networkConfig.isNetworked = true

        window.socket = socket
        window.binding = binding
        window.provider = provider
        window.chatData = chatData
        window.commands = commands
        window.username = username
        window.Gabber = {
          clear
        }

        commands.observe( e => {
          if( e.transaction.local === false ) {
            // XXX only process last change, should we process all changes?
            // if we did this would allow late users to potentially "catch up"
            // with a performance...

            // make sure there commands to run...
            if( e.changes.delta.length > 0 ) {
              const inserts = e.changes.delta[0].insert
              for( let i = inserts.length - 1; i > 0; i -= 5 ) {
                const arr = e.changes.delta[0].insert.slice( i-4, i+1 )
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
          }
        })

        chatData.observe( e => {
          const msgs = e.changes.delta[0].insert
          for( let i = msgs.length-1; i>=0; i-- ) {
            const msg = msgs[ i ]

            makeMsg( msg.username, msg.value )
          }
        })

        const users = []
        userData.observe( e => {
          const msgs = e.changes.delta[0].insert
          for( let i = msgs.length-1; i>=0; i-- ) {
            const msg = msgs[ i ]

            if( users.indexOf( msg.username ) === -1 ) {
              users.push( msg.username )
              if( useSharedEditor === false ) {
                createSplits( msg.username, users )
              }
            }
          }
        })
        environment.showArgHints = false
        environment.showCompletions = false
        
        menu.remove()

        const btn = document.querySelector('#connect')
        btn.innerText = 'disconnect'
        btn.onclick = ()=> {
          provider.destroy()
        } 
        document.querySelector('.CodeMirror-scroll').removeEventListener( 'click', blurfnc )

        if( shouldShowChat ) {
          share.createChatWindow()
          share.chatDisplayed = true
        }else{
          Environment.CodeMirror.keyMap.playground['Ctrl-M'] = cm => share.quickmsg( Environment.editor, false, true  )
          share.chatDisplayed = false
        }

        __connected = true
        return true
      }

      const menu = document.createElement('div')
      menu.setAttribute('id', 'connectmenu')
      menu.setAttribute('class', 'menu' )
      menu.style.width = '12.5em'
      menu.style.height = '13.5em'
      menu.style.position = 'absolute'
      menu.style.display = 'block'
      menu.style.border = '1px #666 solid'
      menu.style.borderTop = 0
      menu.style.top = '2.5em'
      menu.style.right = 0 
      menu.style.zIndex = 1000

      menu.innerHTML = `<p style='font-size:.7em; margin:.5em; margin-bottom:1.5em; color:var(--f_inv)'>gabber is a server for shared performances / chat. joining a gabber performance will make your code execute on all connected computers in the same room... and their code execute on yours.</p><input type='text' value='your name' class='connect' id='connectname'><input class='connect' type='text' value='room name' id='connectroom'><input type='checkbox' checked style='width:1em' id='showChat'><label for='showChat'>display chat?</label><br><input type='checkbox' checked style='width:1em' id='useSharedEditorBox' disabled><label for='useSharedEditorBox'>share editor?</label><br><button id='connect-btn' style='float:right; margin-right:.5em'>join</button>`

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

  },

  createSplits( mostRecentUser, usernames ) {
    let grid = [[]]
    
    switch( usernames.length ) {
      case 2: grid[0] = [usernames[0], usernames[1]]; break; 
      case 3: 
        grid[0] = [usernames[0], usernames[1]]
        grid[1] = [usernames[2]]
        break
      case 4:
        grid[0] = [usernames[0], usernames[1]]
        grid[1] = [usernames[2], usernames[3]]
        break
      case 5:
        grid[0] = [usernames[0], usernames[1], usernames[4]]
        grid[1] = [usernames[2], usernames[3]]
        break
      case 6:
        grid[0] = [usernames[0], usernames[1], usernames[4]]
        grid[1] = [usernames[2], usernames[3], usernames[5]]
        break

      default:
        grid[0][0] = mostRecentUser
        // 1 user, do nothing
    }
    
  },

  createChatWindow() {
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
  },
  makeMsg( user, msg ) {
    if( share.chatDisplayed ) {
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
  }
}

module.exports = share 
