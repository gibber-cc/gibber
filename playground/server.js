const WebSocket         = require( 'ws' ),
      http              = require( 'http' ),
      StaticServer      = require( 'node-static' ).Server,
      setupWSConnection = require( 'y-websocket' ).setupWSConnection,
      production        = process.env.PRODUCTION  != null,
      port              = process.env.SERVER_PORT || 9080 

require( 'dotenv' ).config()

const staticServer = new StaticServer( '.', { cache: production ? 3600 : false, gzip: production })

const server = http.createServer((request, response) => {
  request.addListener( 'end', () => {
    staticServer.serve( request, response )
  }).resume()
})

const wss = new WebSocket.Server({ server })

const rooms = {}

wss.on('connection', (conn, req) => {
  setupWSConnection(conn, req, { gc: true })

  //console.log( conn )
  //const roomName = req.url.slice(1)
  //let   room = rooms[ roomName ]
  //if( room === undefined ) {
  //  room = rooms[ roomName ] = []
  //  room.name = roomName
  //  room.push( conn )
  //}else{
  //  room.push( conn )
  //  room.forEach( c => c.send( JSON.stringify({ cmd:'user', body:room.length }) ) ) 
  //}
})

server.listen( port )

console.log(`Listening to http://localhost:${port} ${production ? '(production)' : ''}`)
