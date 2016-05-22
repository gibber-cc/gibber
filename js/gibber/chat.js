module.exports = function( Gibber ) {

"use strict"

var GE, Layout, Chat;

Chat = {
  socket : null,
  lobbyElement: null,
  roomElement: null,
  currentRoom: 'lobby',
  initialized : false,
  onSocketConnect: null,
  open : function() {
    GE = Gibber.Environment
    Layout = GE.Layout
    
    if( GE.Account.nick === null ) {
      GE.Message.post( 'You must log in before chatting. Click the link in the upper right corner of the window to login (and create an account if necessary).' )
      return
    }
    
    this.column = Layout.addColumn({ type:'form', fullScreen:false, header:'Chat' })
    this.column.bodyElement.remove()
    
    this.column.onclose = function() {
      console.log( 'you have left the chat server.' )
      Chat.lobbyElement = null
      Chat.roomElement  = null
      Chat.socket.close()
      Chat.initialized = false
      
    }
    // this.column.header.append( $( '<span>lobby</span>') )
    this.lobbyRoom = $( '<div>' ).css({ display:'inline', marginLeft:'2em' })
    
    this.lobby = $( '<button>' )
      .text( 'lobby' )
      .on( 'click', function() { Chat.moveToLobby() } )

    this.room =  $( '<button>' )
      .text( 'room' )
      .on( 'click', function() { Chat.moveToRoom( 'test' ) } )
      .hide()

    this.addButton = $('<button>' )
      .text( 'create room' )
      .on( 'click', function() { Chat.createRoom() } )
      .css({ right:0 })

    this.lobbyRoom.append( this.lobby, this.room, this.addButton )

    this.column.header.append( this.lobbyRoom )

    if( !this.initialized ) {
      Chat.socket = new WebSocket( 'ws' + GE.SERVER_URL.split( 'http' )[1] )
      Chat.socket.onmessage = function( e ) {
        var data = e.data
        data = JSON.parse( data )
        
        // if( data.msg !== 'tock' )
          // console.log("MSG RECEIVED", data )
        
        if( data.msg ) {
          if( Chat.handlers[ data.msg ] ) {
            Chat.handlers[ data.msg ]( data )
          }else{
            console.error( 'Cannot process message ' + data.msg + ' from server' )
          }
        }
      }
      
      Chat.socket.onopen = function() {
        console.log( 'you are now connected to the chat server' )
        Chat.moveToLobby()
        Chat.socket.send( JSON.stringify({ cmd:'register', nick:GE.Account.nick }) )
        if( Chat.onSocketConnect !== null ) {
          Chat.onSocketConnect()
        }
      } 
    }else{
      Chat.moveToLobby()
    }
    this.initialized = true;
    Layout.setColumnBodyHeight( this.column )
  },

  moveToLobby : function () {
    if( this.lobbyElement === null ) {
      this.lobbyElement = $( '<div>' ).addClass( 'chatlobby' )
      this.column.element.append( this.lobbyElement )
      this.lobbyElement.append( $('<h3>Available Chatrooms</h3>').css({ marginLeft:'.5em' }) )
    }else{
      this.lobbyElement.empty()
      this.lobbyElement.append( $('<h3>Available Chatrooms</h3>').css({ marginLeft:'.5em' }) )
      this.lobbyElement.show()
      this.column.bodyElement = this.lobbyElement

      if( this.roomElement !== null ) this.roomElement.hide()
    }

    GE.Layout.setColumnBodyHeight( this.column )
    this.lobby.css({ color:'#333', background:'#ccc' })

    if( this.currentRoom !== 'lobby' ) {
      this.socket.send( JSON.stringify({ cmd:'leaveRoom', room:this.currentRoom }) ) 
    }

    this.currentRoom = 'lobby'
    this.room.css({ color:'#ccc', background:'#333' })
    this.room.hide()
    this.addButton.show()
    
    this.socket.send( JSON.stringify({ cmd:'listRooms' }) )
  },

  moveToRoom : function( roomName, occupants ) {
    if( this.currentRoom === 'lobby' ) {
      this.lobbyElement.hide()
      this.lobby.css({ color:'#ccc', background:'#333' })
    }
    this.room.show()
    this.addButton.hide()

    if( this.roomElement === null ) {
      this.roomElement = $( '<div>' ).addClass( 'chatroom' )
      this.messages = $( '<ul>')
        .css({
          display:'block',
          height:'calc(100% - 5em - ' + this.column.header.outerHeight() + 'px)',
          width: 'calc(100% - 1em - ' + GE.Layout.resizeHandleSize + 'px)',
          margin:0,
          padding:'.5em',
          'box-sizing':'border-box !important',
          'overflow-y':'auto',
        })
      this.msgPrompt = $( '<span>' )
        .text( 'enter msg : ' )
        .css({
          left:0,
          bottom:0,
          position:'absolute',
          display:'inline-block',
          width:'6em',
          height:'5em',
          lineHeight:'5em',
          background:'#191919',
          color:'#ccc',
          paddingLeft:'.5em',
        })
      
      this.msgField = $( '<textarea>' ).css({
        position:'absolute',
        left:'6em',
        bottom:0,
        height: '5em',
        verticalAlign: 'center',
        width:'calc(100% - 6em - ' + GE.Layout.resizeHandleSize +'px )', 
        background:'#aaa',
        color:'#333',
        fontSize:'1em',
      })
      .keydown(function(event) {
        if (event.keyCode == 13) {
          Chat.socket.send( JSON.stringify({ cmd:'message', text:this.value, user:GE.Account.nick }) )
          this.value = ''
          event.preventDefault() 
        }
      })

      this.roomElement.append( this.messages, this.msgPrompt, this.msgField )
      this.column.element.append( this.roomElement )
    }else{
      this.roomElement.find('ul').empty()
      this.roomElement.show()
      if( this.lobbyElement !== null ) this.lobbyElement.hide()
    }

    var welcomeString = "You are now in chatroom " + roomName + "."
    if( occupants.length > 0 ) {
      welcomeString += " Your fellow gibberers are: "
      for( var i = 0; i < occupants.length; i++ ){
        if( occupants[ i ] !== GE.Account.nick ) {
          welcomeString += occupants[i]
          welcomeString += i < occupants.length - 1 ? ', ' : '.'
        }
      }
    }

    this.messages.append( $('<li>').text( welcomeString ).css({ color:'#b00'}) )

    this.column.bodyElement = this.roomElement
    GE.Layout.setColumnBodyHeight( this.column )
    this.room
      .css({ color:'#333', background:'#ccc' })
      .text( roomName )

    this.currentRoom = roomName
  },
  
  createRoom : function( name ) {
    console.log( 'WHAT IS THE NAME?', name )
    var msg = {}
    if( typeof name === 'undefined' ) name = window.prompt( "Enter a name for the chatroom." )
    
    if( name === null || name === '' ) return

    msg.name = name
    msg.password = null
    msg.cmd = 'createRoom'
    Chat.socket.send( JSON.stringify( msg ) )
  },
  handlers : {
    messageSent : function( data ) {
      /* msg sent successfully, do nothing for now */
    },
    registered : function( data ) {
      /* successfully registered nick, do nothing for now */
    },
    listRooms : function( data ) {
      var roomList = $( '<ul>' ).css({ paddingLeft:'1em' })      
      
      for( var key in data.rooms ) {
        (function() {
          var _key = key,  
              msg = JSON.stringify( { cmd:'joinRoom', room:_key } ),
              lock = data.rooms[ _key ].password ? " - password required" : " - open",
              userCount = data.rooms[ _key ].userCount,
              link = $( '<span>').text( _key + "  " + lock + ' - ' + userCount + ' gibberer(s)' )
                .on( 'click', function() { Chat.socket.send( msg ) } )
                .css({ cursor:'pointer' }),
              li = $( '<li>').append( link )
              
          roomList.append( li )
        })()
      }
      
      Chat.rooms = data.rooms
      
      Chat.lobbyElement.append( roomList )
      
      $.publish( 'Chat.roomsListed', Chat.rooms )
    },
    incomingMessage: function( data ) {
      var name = $( '<span>' )
            .text( data.nick )
            .addClass( (GE.Account.nick === data.nick ? 'messageFromSelf' : 'messageFromOther' ))
            .on( 'click', function() {
              GE.Share.promptToShareWith( data.nick )
            })
            .css({ cursor:'pointer' }),
          li = $( '<li class="message">' )
            .text(  " : " +  data.incomingMessage )

      li.prepend( name )
      Chat.messages.append( li )
      $( Chat.messages ).prop( 'scrollTop', Chat.messages.prop('scrollHeight') )

      if( Chat.onMsg ) {
        Chat.onMsg( data.nick, data.incomingMessage )
      }
    },
    roomCreated: function( data ) { // response for when the user creates room...
      $.publish( 'Chat.roomCreated', { name:data.name })
    },
    roomAdded : function( data ) { // response for when any user creates a room...
      if( Chat.currentRoom === 'lobby' ) { 
        Chat.lobbyElement.find('ul').remove()
        Chat.socket.send( JSON.stringify({ cmd:'listRooms' }) )
      }
    },
    roomDeleted : function( data ) {
      if( Chat.currentRoom === 'lobby' ) { 
        Chat.lobbyElement.find('ul').remove()
        Chat.socket.send( JSON.stringify({ cmd:'listRooms' }) )
      }
    },
    roomJoined: function( data ) {
      Chat.moveToRoom( data.roomJoined, data.occupants )
      $.publish( 'Chat.roomJoined', data )
    },
    roomLeft: function( data ) {},
    arrival : function( data ) {
      console.log("ARRIVAL", data  )
      var msg = $( '<span>' ).text( data.nick + ' has joined the chatroom.' ).css({ color:'#b00', dislay:'block' })
      if( Chat.messages ) {
        $( Chat.messages ).append( msg )
        $( Chat.messages ).prop( 'scrollTop', Chat.messages.prop( 'scrollHeight' ) )
      }
      $.publish( 'Chat.arrival', data )
    },
    departure : function( data ) {
      var msg = $( '<span>' ).text( data.nick + ' has left the chatroom.' ).css({ color:'#b00', display:'block' })
      Chat.messages.append( msg )
      $( Chat.messages ).prop( 'scrollTop', Chat.messages.prop('scrollHeight') )
      $.publish('Chat.departure', data )
    },
    collaborationRequest: function( data ) {
      var div = $('<div>'),
          msg = null,
          h3  = $('<h3>').text( data.from + ' would like to collaboratively edit code with you. Choose a response:' ),
          radioY = $('<input type="radio" name="yesorno" value="edit">Allow '+data.from+' to code with me.</input><br>'),
          radioYY = $('<input type="radio" name="yesorno" value="editandexecute">Allow '+data.from+' to code with me and execute code remotely.</input><br>'),
          radioN = $('<input type="radio" name="yesorno" value="no">Do not let '+data.from+' code with me.</input><br>'),

          submit = $('<button>')
            .text('submit')
            .on( 'click', function() {
              var val =  $('input[type=radio]:checked').val()
              Chat.socket.send( JSON.stringify({ cmd:'collaborationResponse', response:val, to:data.from }) )
              GE.Share.willAcceptRemoteExecution = val === 'editandexecute'
              msg.remove()
            })
      
      div.append( h3, radioY )
      if( data.enableRemoteExecution ) div.append( radioYY )
      div.append( radioN, submit )
      
      msg =  GE.Message.postHTML( div )
    },
    collaborationResponse: function( data ) {
      GE.Share.collaborationResponse({ from: data.from, response: data.response })
    },
    shareReady : function( data ) {
      GE.Share.acceptCollaborationRequest( data )
    },
    remoteExecution : function( data ) {
      var column, cm
      for( var i = 0; i < GE.Layout.columns.length; i++ ){ 
        var _column = GE.Layout.columns[i]
        if( _column && _column.shareName === data.shareName ) {
          column = _column
          break
        }
      }
      if( typeof column === 'undefined' ) { console.log("CANNOT FIND COLUMN FOR REMOTE EXECUTION"); return }
      cm  = column.editor

      // from, selectionRange, code
      if( column.allowRemoteExecution ) {
        GE.Keymap.flash( cm, data.selectionRange )

        GE.modes.javascript.run( column, data.code, data.selectionRange, cm, data.shouldDelay )
      }
    },
  },
}

return Chat

}
