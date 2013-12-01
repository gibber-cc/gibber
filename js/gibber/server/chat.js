(function() {

var Chat = {
  rooms : {},
  users : {},
  usersByNick : {},
  io  : require( 'socket.io' ).listen( gibber.server ),
  server: gibber.server, 
  sendall : function( msg ) {
    for( var ip in Chat.users ) {
      Chat.users[ ip ].send( msg )
    }
  },
  heartbeat : function() {
    var time = Date.now()
    for( var room in Chat.rooms ) {
      if( room !== 'gibber' ) {
        var _room = Chat.rooms[ room ]
        if( time - _room.timestamp > 300000 && _room.clients.length === 0 ) {
          console.log( 'deleting room', room )
          delete Chat.rooms[ room ]
          var msg = { msg:'roomDeleted', room:room }
          Chat.sendall( msg )
        }
      }
     setTimeout( Chat.heartbeat, 10000 ) 
    }
  },
  sendToRoom : function( msg, roomName ) {
    if( roomName && msg ) {
      var room = Chat.rooms[ roomName ]
      if( room ) {
        room.timestamp = Date.now()
        for( var i = 0; i < room.clients.length; i++ ){
          var client = room.clients[ i ]
          if( client ) {
            client.send( msg )
          }
        }
        return true
      }
    }
    return false
  },
  init : function() {
    Chat.io.sockets.on( 'connection', function( client ) {
      client.ip = client.handshake.address.address
      console.log( 'CONNECTION', client.ip )
      Chat.users[ client.ip ] = client

      var msg = { connection: true }

      client.send( JSON.stringify( msg ) )

      client.on( 'message', function( _msg ) {
        var msg = JSON.parse( _msg )
        Chat.handlers[ msg.cmd ]( client, msg )
      })

      client.on( 'disconnect', function() {
        if( Chat.rooms[ client.room ]  ) {
          var idx = Chat.rooms[ client.room ].clients.indexOf( client )
          if( client.room ) {
            Chat.rooms[ client.room ].clients.splice( idx , 1 )
            var notification = JSON.stringify( { msg:'departure', nick:client.nick } )
            Chat.sendToRoom( notification, client.room )
          }
        }
        delete Chat.users[ client.ip ]
      })
    })

    Chat.rooms[ 'gibber' ] = {
      clients : [],
      password: null
    }
    Chat.heartbeat()

    gibber.chat = Chat
  },
  handlers : {
    register : function( client, msg ) {
      client.nick = msg.nick
      
      Chat.usersByNick[ client.nick ] = client

      var msg = { msg:'registered', nickRegistered: client.nick }

      client.send( JSON.stringify( msg ) )
    },
     
    joinRoom : function( client, msg ) {
      var response = null, occupants = []

      if( Chat.rooms[ msg.room ] ) {
        if( Chat.rooms[ msg.room ].password !== null ) {
          if( Chat.rooms[ msg.room ].password === msg.password ) {
            client.room = msg.room

            for( var i = 0; i < Chat.rooms[ msg.room ].clients.length; i++ ) {
              occupants.push( Chat.rooms[ msg.room ].clients[ i ].nick )
            }
            if( Chat.rooms[ msg.room ].clients.indexOf( client ) === -1 ) {
              Chat.rooms[ msg.room ].clients.push( client )
            }
            response = { msg:'roomJoined', roomJoined: msg.room, occupants:occupants }

            notification = JSON.stringify( { msg:'arrival', nick:client.nick } )

            Chat.sendToRoom( notification, msg.room )
          }else{
            response = { msg:'roomJoined', roomJoined:null, error:'ERROR: The password you submitted to join ' + msg.room + ' was incorrect.' }
          }
        }else{
          client.room = msg.room

          for( var i = 0; i < Chat.rooms[ msg.room ].clients.length; i++ ) {
            occupants.push( Chat.rooms[ msg.room ].clients[ i ].nick )
          }

          if( Chat.rooms[ msg.room ].clients.indexOf( client ) === -1 ) {
            Chat.rooms[ msg.room ].clients.push( client )
          }

          response = { msg:'roomJoined', roomJoined: msg.room, occupants:occupants }

          notification = JSON.stringify( { msg:'arrival', nick:client.nick } )

          Chat.sendToRoom( notification, msg.room )
        }
      }else{
        response = { msg:'roomJoined', roomJoined: null, error:"ERROR: There is no room named " + msg.room + '.' }
      }

      client.send( JSON.stringify( response ) )
    },

    leaveRoom : function( client, msg ) {
      var response = null, notification

      if( Chat.rooms[ msg.room ] ) {
        var idx = Chat.rooms[ msg.room ].clients.indexOf( client )

        if( idx > -1 ) {
          Chat.rooms[ msg.room ].clients.splice( idx, 1 )

          response = { msg:'roomLeft', roomLeft: msg.room }
          
          notification = JSON.stringify( { msg:'departure', nick:client.nick } )

          Chat.sendToRoom( notification, msg.room )
        }else{
          response = { msg:'roomLeft', roomLeft: null, error:'ERROR: The server tried to remove you from a room you weren\'t in' }
        }
      }else{
        response = { msg:'roomLeft', roomLeft: null, error:'ERROR: The server tried to remove you from a room that doesn\'t exist.' }
      }

      client.send( JSON.stringify( response ) )
    },
    
    message : function( client, msg ) {
      var room = Chat.rooms[ client.room ], result = false, response = null, _msg = null
      
      _msg = JSON.stringify({ msg:'incomingMessage', incomingMessage:msg.text, nick:client.nick }) 
       
      result = Chat.sendToRoom( _msg, client.room )

      if( result ) {
        response = { msg:'messageSent', messageSent: msg.text, nick:client.nick }
      }else{
        response = { msg:'messageSent', messageSent:null, error:'ERROR: You tried to send a message without joining a chat room!' }
      }

      client.send( JSON.stringify( response ) )
    },
    collaborationRequest: function( client, msg ) {
      var from = msg.from, 
          to = msg.to,
          room = Chat.rooms[ client.room ]

      for( var i = 0; i < room.clients.length; i++ ){
        var _client = room.clients[ i ]
        if( _client.nick === to ) {
          _client.send( JSON.stringify( { msg:'collaborationRequest', from:client.nick, enableRemoteExecution:msg.enableRemoteExecution } ) )
          break;
        }
      }
    },
    collaborationResponse: function( client, msg ) {
      var to = msg.to, room = Chat.rooms[ client.room ]

      for( var i = 0; i < room.clients.length; i++ ){
        var _client = room.clients[ i ]
        if( _client.nick === to ) {
          _client.send( JSON.stringify({ msg:'collaborationResponse', from:client.nick, response:msg.response }) )
          break;
        }
      } 
    },
    shareCreated: function( client, msg ) {
      // GE.Share.openDoc( msg.shareName )
      var to = msg.to, room = Chat.rooms[ client.room ]
      for( var i = 0; i < room.clients.length; i++ ){
        var _client = room.clients[ i ]
        if( _client.nick === to ) {
          _client.send( JSON.stringify({ msg:'shareReady', from:client.nick, shareName:msg.shareName }) )
          break;
        }
      } 
    },
    createRoom : function( client, msg ) {
      var response = null, room = null, success = false

      if( typeof Chat.rooms[ msg.name ] === 'undefined' ) {
        Chat.rooms[ msg.name ] = {
          clients : [],
          password: msg.password || null,
          timestamp: Date.now()
        }
        success = true
        response = { msg:'roomCreated', roomCreated: msg.room } 
      }else{
        response = { msg:'roomCreated', roomCreated: null, error:'ERROR: A room with that name already exists' }
      }

      client.send( JSON.stringify( response ) )
      
      if( success ) {
        var msg = { msg:'roomAdded', roomAdded:msg.room }
        Chat.sendall( JSON.stringify( msg ) )
      }
    },

    listRooms : function( client, msg ) {
      var response = {}
      for( var key in Chat.rooms ) {
        response[ key ]  = { 
          password: Chat.rooms[ key ].password !== null,
          userCount : Chat.rooms[ key ].clients.length
        }
      }

      client.send( JSON.stringify({ msg:'listRooms', rooms:response }) )
    },

    logout : function( client, msg ) {
      var response = null,
          idx = Chat.rooms[ client.room ].clients.indexOf( client )

      if( idx > -1 ) {

      }
    },

    listUsers : function( client, msg ) {
      var reponse = null, _users = []
      for( var key in Chat.users ) {
        _users.push( Chat.users[ key ].nick )
      }

      response = { msg:'listUsers', users:_users }

      client.send( JSON.stringify( response ) )
    },

    remoteExecution : function( client, msg ) {
      var to = Chat.usersByNick[ msg.to ],
          _msg = {
            from: msg.from,
            selectionRange : msg.selectionRange,
            code: msg.code,
            msg: 'remoteExecution',
            shareName:msg.shareName
          }
      
      to.send( JSON.stringify( _msg ) )
    },
  }
}

Chat.init()

})()
