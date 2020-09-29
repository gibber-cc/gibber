const WebSocket         = require( 'ws' ),
      http              = require( 'http' ),
      StaticServer      = require( 'node-static' ).Server,
      setupWSConnection = require( 'y-websocket/bin/utils.js' ).setupWSConnection,
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

wss.on('connection', (conn, req) => {
  setupWSConnection(conn, req, { gc: req.url.slice(1) !== 'prosemirror-versions' })
})

server.listen( port )

console.log(`Listening to http://localhost:${port} ${production ? '(production)' : ''}`)
