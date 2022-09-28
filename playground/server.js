const WebSocket         = require( 'ws' ),
      fs                = require( 'fs' ),
      http              = require( 'http' ),
      utils             = require( 'y-websocket/bin/utils.js' ),
      express           = require( 'express' ),
      app               = express(),
      setupWSConnection = utils.setupWSConnection,
      production        = process.env.PRODUCTION  != null,
      port              = process.env.SERVER_PORT || 9080 

require( 'dotenv' ).config()

app.use( express.static( './', { 
  setHeaders: function(res, path) {
    res.set("Cross-Origin-Embedder-Policy", "require-corp")
    res.set("Cross-Origin-Opener-Policy",   "same-origin")
  }  
}) )
   
app.use( function(req,res,next) {
  fs.readdir( __dirname + req.url, function(err,files) {
    res.json( files )
    next() 
  })
})

const wss = new WebSocket.Server({ server:app })

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

app.listen( port )

console.log(`Listening to http://localhost:${port} ${production ? '(production)' : ''}`)
