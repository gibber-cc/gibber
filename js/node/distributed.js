var io = require('socket.io').listen(8080);

var master = null;

io.sockets.on('connection', function (socket) {
	socket.addr = socket.handshake.address.address;
	socket.port = socket.handshake.address.port;
	socket.isMaster = false;
	
	socket.on('message', function (msg) {
		console.log("MESSAGE " + msg);
		if(master !== null) {
			master.send(msg);
		}
	});
	
	socket.on('master', function(msg) {
		if(master === null) {
			console.log("SETTING MASTER SOCKET");
			master = socket;
		}
	});
	
	socket.on('disconnect', function () { 
		console.log("DISCONNECT : " + this.addr);
		if(master === this) {
			console.log("DISCONNECTING MASTER");
			master = null;
		}
	});
});