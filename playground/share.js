// despair, all ye who enter here...
const Y = require( 'yjs' ),
      WebsocketProvider = require( 'y-websocket'  ).WebsocketProvider,
      CodemirrorBinding = require( 'y-codemirror' ).CodemirrorBinding,
      Editor = require( './editor.js' )

const share = {
  addUser( userInfo ) { console.log( userInfo ) },

  initShare( editor, username='anonymous', room='default', useSharedEditor=true ) {
    const protocol = window.location.hostname === '127.0.0.1' ? 'ws' : 'wss'
    const ydoc = new Y.Doc(),
          provider = new WebsocketProvider(
            `${protocol}://${window.location.host}`,
            room,
            ydoc,
            { connect:true }
          ),
          chatData = ydoc.getArray( 'chat' + room ),
          userData = ydoc.getArray( 'user' + room ),
          scrollData = ydoc.getArray( 'scroll' + room ),
          commands = ydoc.getArray( 'commands' + room ),
          socket   = provider.ws

    if( useSharedEditor ) {
      yText = ydoc.getText( 'codemirror' + room ),
      binding = new CodemirrorBinding( yText, editor, provider.awareness )

      binding.awareness.setLocalStateField( 'user', { color: '#008833', name:username  })
    }else{
      yText = null 
      binding = null
    }

    const clear = function( clearEditor = false, clearUsers=false ){ 
      Gibber.clear()
      commands.delete( 0, commands.length )
      if( clearUsers === true ) userData.delete( 0, userData.length )
      if( clearEditor ) editor.setValue('')
    }

    share.username = username

    return { provider, ydoc, yText, Y, socket, binding, chatData, commands, userData, clear, scrollData }
  },

  spectator() {
    const url = window.location.toString()
    if( url.indexOf( '?show=' ) === -1 ) return

    const arr = url.split('?show=')
    const showid = arr[1]
    const username = 'spectator'
    const networkConfig = Environment.networkConfig
    const environment = Environment
    const useSharedEditor = false
    const roomname = showid

    const { 
      socket, 
      provider, 
      binding,
      chatData, 
      commands, 
      userData, 
      scrollData,
      clear, 
      ydoc 
    } = share.initShare(
      Environment.editor, 
      'spectator', 
      showid,
      false
    )

    share.clear = clear
    share.commands = commands

    __socket = socket
    networkConfig.isNetworked = true

    window.socket = socket
    window.binding = binding
    window.provider = provider
    window.chatData = chatData
    window.commands = commands
    window.username = username
    window.Gabber = { clear }

    commands.observe( e => {
      if( e.transaction.local === false ) {
        // XXX only process last change, should we process all changes?
        // if we did this would allow late users to potentially "catch up"
        // with a performance...

        // make sure there commands to run...
        if( e.changes.delta.length > 0 ) {
          const inserts = e.changes.delta[0].insert
          for( let i = inserts.length - 1; i > 0; i -= 6 ) {
            const arr = e.changes.delta[0].insert.slice( i-5, i+1 )
            const code = {
              selection:{
                start: { line:arr[0], ch:arr[1] },
                end:   { line:arr[2], ch:arr[3] }
              },
              code: arr[4]
            }

            const cm = share.editors[ arr[5] ]
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

    scrollData.observe( e => {
      const msgs = e.changes.delta[0].insert
      if( msgs === undefined ) return

      for( let i = msgs.length-1; i>=0; i-- ) {
        const msg = msgs[ i ]

        if( msg !== undefined && msg.username !== 'spectator' ) {
          if( share.editors[ msg.username ] !== undefined ) {
            share.editors[ msg.username ].scrollTo( msg.left, msg.top )
          }
        }
      }
    })
    ydoc.scrollData = scrollData

    const users = []
    userData.observe( e => {
      //const delta = e.changes.delta[0]
      //if( delta !== undefined ) {
        //const msgs = e.changes.delta[0].insert
        const msgs = e.changes.added
        //if( msgs !== undefined ) {
          //for( let i = msgs.length-1; i>=0; i-- ) {
        for( let msg of msgs ) {
          //const msg = msgs[ i ]
          const __username = msg.content.arr[0].username
          if( users.indexOf( __username ) === -1 && __username !== 'spectator' ) {
            users.push( __username )
            if( useSharedEditor === false ) {
              share.createSplits( __username, users, ydoc, roomname, username )
            }
          }
        }
    })
    environment.showArgHints = false
    environment.showCompletions = false
    environment.annotations = false 
    
    //document.querySelector('.CodeMirror-scroll').removeEventListener( 'click', blurfnc )

    //if( shouldShowChat ) {
    //  share.createChatWindow()
    //  share.chatDisplayed = true
    //}else{
    //  Environment.CodeMirror.keyMap.playground['Ctrl-M'] = cm => share.quickmsg( Environment.editor, false, true  )
    //  share.chatDisplayed = false
    //}

    __connected = true

    window.alert( `Welcome to gibber performance ${roomname}! You must close this dialog box and then click in the gibber interface to begin watching the performance. You'll see the metronome start running in the upper left corner of the window after clicking in the interface, and hopefully the performers will begin coding shortly. Enjoy the show!` )

    return true


  },

  setupShareHandler( cm, environment, networkConfig ) {
    share.spectator()
    document.querySelector('#connect').onclick = function() {
      const closeconnect = function() {
        const shouldShowChat  = document.querySelector('#showChat').checked,
              useSharedEditor = document.querySelector('#useSharedEditorBox').checked,
              username = document.querySelector( '#connectname' ).value,  
              roomname = document.querySelector( '#connectroom' ).value

        const { socket, provider, binding, chatData, commands, userData, scrollData, clear, ydoc } = share.initShare(
          cm, 
          username, 
          roomname,
          useSharedEditor
        )
        share.clear = clear
        share.commands = commands

        if( username !== 'spectator' )
          userData.unshift([{ username }])

        __socket = socket
        networkConfig.isNetworked = true

        window.socket = socket
        window.binding = binding
        window.provider = provider
        window.chatData = chatData
        window.commands = commands
        window.username = username
        window.Gabber = { clear }

        commands.observe( e => {
          if( e.transaction.local === false ) {
            // XXX only process last change, should we process all changes?
            // if we did this would allow late users to potentially "catch up"
            // with a performance...

            // make sure there commands to run...
            if( e.changes.delta.length > 0 ) {
              const inserts = e.changes.delta[0].insert
              for( let i = inserts.length - 1; i > 0; i -= 6 ) {
                const arr = e.changes.delta[0].insert.slice( i-5, i+1 )
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

        scrollData.observe( e => {
          const msgs = e.changes.delta[0].insert
          if( msgs === undefined ) return
          for( let i = msgs.length-1; i>=0; i-- ) {
            const msg = msgs[ i ]

            if( msg !== undefined && msg.username !== 'spectator' ) {
              if( share.editors[ msg.username ] !== undefined ) {
                share.editors[ msg.username ].scrollTo( msg.left, msg.top )
              }
            }
          }
        })

        ydoc.scrollData = scrollData

        const users = []
        userData.observe( e => {
          //console.log( e.changes )
          //const delta = e.changes.delta[0]
          //if( delta !== undefined ) {
            //const msgs = e.changes.delta[0].insert
            const msgs = e.changes.added
            //if( msgs !== undefined ) {
              //for( let i = msgs.length-1; i>=0; i-- ) {
            for( let msg of msgs ) {
              //const msg = msgs[ i ]
              const __username = msg.content.arr[0].username
              if( users.indexOf( __username ) === -1 && __username !== 'spectator' ) {
                users.push( __username )
                if( useSharedEditor === false ) {
                  share.createSplits( __username, users, ydoc, roomname, username )
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

      menu.innerHTML = `<p style='font-size:.7em; margin:.5em; margin-bottom:1.5em; color:var(--f_inv)'>gabber is a server for shared performances / chat. joining a gabber performance will make your code execute on all connected computers in the same room... and their code execute on yours.</p><input type='text' value='your name' class='connect' id='connectname'><input class='connect' type='text' value='room name' id='connectroom'><input type='checkbox' style='width:1em' id='showChat'><label for='showChat'>display chat?</label><br><input type='checkbox' checked style='width:1em' id='useSharedEditorBox'><label for='useSharedEditorBox'>share editor?</label><br><button id='connect-btn' style='float:right; margin-right:.5em'>join</button>`

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

  createSplits( mostRecentUser, usernames, ydoc, roomname, username ) {
    if( mostRecentUser === 'spectator' ) return
    let grid = [[]]

    if( usernames.indexOf( window.username ) === -1 && window.username !== 'spectator' ) usernames.unshift( window.username )
    
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

    const editor = document.querySelector( '#editor' )

    const cells = Array.from( document.querySelectorAll( '.editorCell' ) )
    for( let cm of cells ) cm.remove()
    const codemirrors = Array.from( document.querySelectorAll( '.CodeMirror' ) )
    for( let cm of codemirrors ) cm.remove()
    
    const width  = editor.offsetWidth,
          height = editor.offsetHeight,
          editorHeight = height / grid.length

    share.editors = {}

    let count = 0, rowCount = 0
    for( let row of grid ) {
      const rowcount = row.length,
            editorWidth = width / rowcount

      let cellCount = 0
      for( let cell of row ) {
        count++
        const id = 'cell'+count++
        const div = document.createElement('div')
        div.setAttribute( 'user', cell )
        div.setAttribute( 'width', editorWidth )
        div.setAttribute( 'height', editorHeight )
        div.setAttribute( 'id', id )
        div.setAttribute( 'class', 'editorCell' )
        editor.appendChild(div)
        const [cm] = Editor( Gibber, '#'+id, cell === username )
        cm.setValue( '' )

        let style = `padding-left:1em; position:absolute; display:block; width:${editorWidth}; height:${editorHeight}; top:${rowCount*editorHeight}; left:${cellCount*editorWidth}; border:0px solid #999; box-sizing:border-box;`
        if( rowCount === 0 && grid.length > 1 ) style += 'border-bottom-width:1px;'
        if( cellCount !== 0 ) style +=  'border-left-width:1px;'
        div.style = style
        div.editor = cm
        share.editors[ cell ] = cm

        const namediv = document.createElement('div')
        namediv.innerText = cell
        namediv.style = 'text-align:right; padding:.25em; position:absolute; right:0; top:0; background: var(--b_inv); color: var(--f_inv ); height:1.25em; width:10em; box-sizing:border-box;'
        
        div.appendChild( namediv )
        const yText = ydoc.getText( 'codemirror' + roomname + cell )
        const binding = new CodemirrorBinding( yText, div.editor, provider.awareness )
        binding.on( 'cursorActivity', editor => {
          const scrollInfo = div.editor.getScrollInfo()
          ydoc.scrollData.unshift([
            { username, left:scrollInfo.left, top:scrollInfo.top }
          ])
        })
        binding.awareness.setLocalStateField( 'user', { color: '#008833', name:username  })

        cellCount++
      }

      rowCount++
    }

    Environment.annotations = false
    share.grid = grid
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
