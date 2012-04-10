// run this script using Node.js to perform distributed live coding using Gibber.
// see test.htm in the same folder for an example of how to send code to a master
// Gibber instance.

var io = require('socket.io').listen(8080);

var master = null;

io.sockets.on('connection', function (socket) {
	socket.addr = socket.handshake.address.address;
	socket.port = socket.handshake.address.port;
	socket.isMaster = false;
	
	socket.on('message', function (msg) {
		console.log("MESSAGE " + msg + "for user " + socket.userName);
		if(master != null) {
			master.emit("code", {code:msg, userName:socket.userName});
		};
	});
	
	socket.on('msg', function(msg) {
		console.log("BROADCASTING");
		
		socket.broadcast.emit("chat", {user: socket.userName, "text": msg.text});
		socket.emit("chat", {user: socket.userName, "text": msg.text});
	});
	
	socket.on('master', function(msg) {
		if(master === null) {
			console.log("SETTING MASTER SOCKET");
			master = socket;
		}
	});
	
	socket.on('name', function(msg) {
		console.log("NAME RECEIVED " + msg.name);
		socket.userName = msg.name;
	});
	
	socket.on('disconnect', function () { 
		console.log("DISCONNECT : " + this.addr);
		if(master === this) {
			console.log("DISCONNECTING MASTER");
			master = null;
		}
	});
});