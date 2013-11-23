( function() {

"use strict"

var GE = Gibber.Environment,
    Layout = GE.Layout,
    chatPort = 20000,
    expr = /[-a-zA-Z0-9.]+(:(6553[0-5]|655[0-2]\d|65[0-4]\d{2}|6[0-4]\d{3}|[1-5]\d{4}|[1-9]\d{0,3}))/,
    socketString = 'ws://gibber.mat.ucsb.edu:20000';
    //socketIPAndPort = expr.exec( window.location.toString() )[0].split(":"),
    //socketString = 'ws://' + socketIPAndPort[0] + ':' + chatPort;

window.Chat = Gibber.Environment.Chat = {
  socket : null,
  lobbyElement: null,
  roomElement: null,
  open : function() {
    if( GE.Account.nick === null ) {
      GE.Message.post( 'You must log in before chatting. Click the link in the upper right corner of the window to login (and create an account if necessary).' )
      return
    }
    this.column = Layout.addColumn({ header:'Chat' })
    this.column.onclose = function() {
      this.socket.close()
    }
    // this.column.header.append( $( '<span>lobby</span>') )
    this.lobbyRoom = $( '<div>' ).css({ display:'inline', marginLeft:'2em' })
    
    this.lobby = $( '<button>' )
      .text( 'lobby' )
      .on( 'click', function() { Chat.moveToLobby() } )

    this.room =  $( '<button>' )
      .text( 'room' )
      .on( 'click', function() { Chat.moveToRoom( 'test' ) } )

    this.lobbyRoom.append( this.lobby, this.room )

    this.column.header.append( this.lobbyRoom )

    this.socket = new WebSocket( socketString );

    this.socket.onmessage = function( _data ) {
		  var data = JSON.parse( _data.data )
      console.log( _data )
			console.log( data, data.msg )
		  
			if( data.msg ) {
				if( Chat.handlers[ data.msg ] ) {
					Chat.handlers[ data.msg ]( data )
				}else{
					console.error( 'Cannot process message ' + data.msg + ' from server' )
				}
			}
    }
    
		this.socket.onopen = function() {
      Chat.moveToLobby()
      Chat.socket.send( JSON.stringify({ cmd:'register', nick:GE.Account.nick }) )
		}
  },

  moveToLobby : function () {
    if( this.lobbyElement === null ) {
      this.lobbyElement = $( '<div>' ).addClass( 'chatlobby' )
      this.column.element.append( this.lobbyElement )
    }else{
      this.lobbyElement.empty()
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
    
    this.socket.send( JSON.stringify({ cmd:'listRooms' }) )
  },

  moveToRoom : function( roomName ) {
    if( this.currentRoom === 'lobby' ) {
      this.lobbyElement.hide()
      this.lobby.css({ color:'#ccc', background:'#333' })
    }
    this.room.show()

    if( this.roomElement === null ) {
      this.roomElement = $( '<div>' ).addClass( 'chatroom' )
      this.messages = $( '<ul>')
        .css({
          display:'block',
          height:'calc(100% - 5em - ' +this.column.header.outerHeight()+ 'px)',
          width: 'calc(100% - 1em - ' + GE.Layout.resizeHandleSize +'px)',
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
    this.column.bodyElement = this.roomElement
    GE.Layout.setColumnBodyHeight( this.column )
    this.room
      .css({ color:'#333', background:'#ccc' })
      .text( roomName )

    this.currentRoom = roomName
  },

  handlers : {
    messageSent : function( data ) {
      /* msg sent successfully, do nothing for now */
    },
    registered : function( data ) {
      /* successfully registered nick, do nothing for now */
    },
    listRooms : function( data ) {
			console.log("ROOMS", data )
      var roomList = $( '<ul>' )
      for( var key in data.rooms ) {
        var msg = JSON.stringify( { cmd:'joinRoom', room:key } ),
            lock = data.rooms[ key ].password !== null ? " - password" : " - open",
            link = $( '<span>').text( key + "  " + lock )
              .on( 'click', function() { Chat.socket.send( msg ) } )
              .css({ pointer:'hand' })
            
        roomList.append( link )
      }
      Chat.lobbyElement.append( roomList )
    },
    incomingMessage: function( data ) {
      console.log( 'NEW MESSAGE' )
      var name = $( '<span>' ).text( data.nick ).addClass( (GE.Account.nick === data.nick ? 'messageFromSelf' : 'messageFromOther' )),
          li = $( '<li class="message">' )
            .text(  " : " +  data.incomingMessage )

      li.prepend( name )
      Chat.messages.append( li )
      $( Chat.messages ).prop( 'scrollTop', Chat.messages.prop('scrollHeight') )
    },
    roomJoined: function( data ) {
      Chat.moveToRoom( data.roomJoined )
    },
  },
}

})()
