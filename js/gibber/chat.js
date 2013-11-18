( function() {

"use strict"

var GE = Gibber.Environment,
    Layout = GE.Layout,
    chatPort = 20000,

Chat = Gibber.Environment.Chat = {
  socket : null,
  open : function() {
    this.column = Layout.addColumn({ header:'Chat' })
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

    var expr = /[-a-zA-Z0-9.]+(:(6553[0-5]|655[0-2]\d|65[0-4]\d{2}|6[0-4]\d{3}|[1-5]\d{4}|[1-9]\d{0,3}))/,
				socketIPAndPort = expr.exec( window.location.toString() )[0].split(":"),
				socketString = 'ws://' + socketIPAndPort[0] + ':' + chatPort;

    this.socket = new WebSocket( socketString );

    this.socket.onmessage = function( _data ) {
		  var data = JSON.parse( _data.data )

			console.log( data, data.msg )
		  
			if( data.msg ) {
				if( Chat.handlers[ data.msg ] ) {
          console.log( "CALLING HANDLER", data.msg )
					Chat.handlers[ data.msg ]( data )
				}else{
					console.error( 'Cannot process message ' + data.msg + ' from server' )
				}
			}
    }
    
		this.socket.onopen = function() {
      Chat.moveToLobby()
		}
  },
  moveToLobby : function () {
		console.log( "LOBBY" )
    this.lobby.css({ color:'#333', background:'#ccc' })
    this.currentRoom = 'lobby'
    this.room.css({ color:'#ccc', background:'#333' })
    
    this.socket.send( JSON.stringify({ cmd:'listRooms' }) )
  },
  moveToRoom : function( roomName ) {
    if( this.currentRoom === 'lobby' ) this.lobby.css({ color:'#ccc', background:'#333' })

    this.room
      .css({ color:'#333', background:'#ccc' })
      .text( roomName )

    this.currentRoom = roomName
  },

  handlers : {
    listRooms : function( data ) {

			console.log("ROOMS", data )
      var roomList = $( '<ul>' )
      for( var key in data.rooms ) {
        console.log( 'ROOM : ', key )
        var room = $( '<li>' ).text( key )

        roomList.append( room )
        console.log( key, data.rooms[ key ].password, data.rooms[ key ].userCount )
      }
      Chat.column.element.append( roomList )
    }
  },
}

})()
