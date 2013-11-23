(function() {
var ws = require( 'ws' ),
    rooms = {},
    users = {},
    port  = 20000,
    server = new ws.Server({ port: port }),
    handlers = null

server.on( 'connection', function( client ) {
  client.ip = client._socket.remoteAddress
  console.log( 'CONNECTION', client.ip )
  users[ client.ip ] = client

  var msg = { connection: true }

  client.send( JSON.stringify( msg ) )

  client.on( 'message', function( _msg ) {
    var msg = JSON.parse( _msg )
    console.log( msg )  
    handlers[ msg.cmd ]( client, msg )
  })

  client.on( 'close', function() {
    // console.log( "ROOM", client.room, rooms[ client.room ] )
    var idx = rooms[ client.room ].clients.indexOf( client )
    if( client.room ) rooms[ client.room ].clients.splice( idx , 1 )
    delete users[ client.ip ]
  })
})



handlers = {
  register : function( client, msg ) {
    client.nick = msg.nick

    var msg = { msg:'registered', nickRegistered: client.nick }

    client.send( JSON.stringify( msg ) )
  },

  joinRoom : function( client, msg ) {
    var response = null

    if( rooms[ msg.room ] ) {
      if( rooms[ msg.room ].password !== null ) {
        if( rooms[ msg.room ].password === msg.password ) {
          client.room = msg.room
          rooms[ msg.room ].clients.push( client )
          response = { msg:'roomJoined', roomJoined: msg.room }
        }else{
          response = { msg:'roomJoined', roomJoined:null, error:'ERROR: The password you submitted to join ' + msg.room + ' was incorrect.' }
        }
      }else{
        client.room = msg.room
        rooms[ msg.room ].clients.push( client )
        response = { msg:'roomJoined', roomJoined: msg.room }
      }
    }else{
      response = { msg:'roomJoined', roomJoined: null, error:"ERROR: There is no room named " + msg.room + '.' }
    }

    client.send( JSON.stringify( response ) )
  },

  leaveRoom : function( client, msg ) {
    var response = null
    if( rooms[ msg.room ] ) {
      var idx = rooms[ msg.room ].clients.indexOf( client )

      if( idx > -1 ) {
        rooms[ msg.room ].clients.splice( idx, 1 )
        response = { msg:'roomLeft', roomLeft: msg.room }
      }else{
        response = { msg:'roomLeft', roomLeft: null, error:'ERROR: The server tried to remove you from a room you weren\'t in' }
      }
    }else{
      response = { msg:'roomLeft', roomLeft: null, error:'ERROR: The server tried to remove you from a room that doesn\'t exist.' }
    }

    client.send( JSON.stringify( response ) )
  },

  message : function( client, msg ) {
    var room = rooms[ client.room ], response = null, _msg = null
    
    if( typeof room !== 'undefined' ) {
      _msg = JSON.stringify({ msg:'incomingMessage', incomingMessage:msg.text, nick:client.nick }) 
      for( var i = 0; i < room.clients.length; i++ ){
        var recipient = room.clients[ i ]

        recipient.send( _msg )
      }
      // console.log( 'Sending message from', client.nick )
      response = { msg:'messageSent', messageSent: msg.text, nick:client.nick }
    }else{
      response = { msg:'messageSent', messageSent:null, error:'ERROR: You tried to send a message without joining a chat room!' }
    }

    client.send( JSON.stringify( response ) )
  },

  createRoom : function( client, msg ) {
    var response = null, room = null

    if( typeof rooms[ msg.name ] === 'undefined' ) {
      rooms[ msg.name ] = {
        clients : [],
        password: msg.password || null
      }
      response = { msg:'roomCreated', roomCreated: msg.room } 
    }else{
      response = { msg:'roomCreated', roomCreated: null, error:'ERROR: A room with that name already exists' }
    }

    client.send( JSON.stringify( response ) )
  },

  listRooms : function( client, msg ) {
    var response = {}
    console.log(" LISTING ROOMS ")
    for( var key in rooms ) {
      response[ key ]  = { 
        password: rooms[ key ].password !== null,
        userCount : rooms[ key ].clients.length
      }
    }

    client.send( JSON.stringify({ msg:'listRooms', rooms:response }) )
  },

  logout : function( client, msg ) {
    var response = null,
        idx = rooms[ client.room ].clients.indexOf( client )

    if( idx > -1 ) {
      rooms[ client.room ].clients.splice( idx , 1 )
    }
  },

  listUsers : function( client, msg ) {
    var reponse = null, _users = []
    for( var key in users ) {
      _users.push( users[ key ].nick )
    }

    response = { msg:'listUsers', users:_users }

    client.send( JSON.stringify( response ) )
  },
}

rooms[ 'gibber' ] = {
  clients : [],
  password: null
}
})()
