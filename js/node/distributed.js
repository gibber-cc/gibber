// run this script using Node.js to perform distributed live coding using Gibber.
// see test.htm in the same folder for an example of how to send code to a master
// Gibber instance.

var io = require('socket.io').listen(8080 );
//var osc = require('./omgosc.js');

// var receiver = new osc.UdpReceiver(8081);
// receiver.on('', function(e) {
// 	for(var i = 0; i < sockets.length; i++) {
// 		sockets[i].emit(e.path, e.params );
// 	}
// 	console.log(e);
// });
// var osc_server = new osc.UdpReceiver(8080);
// osc_server.on('/key2', function(msg) {
//     console.log(msg);
// });
var master = null;

var sockets = [];

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
			socket.userName = "MASTER";
			master = socket;
		}
	});
	
	socket.on('name', function(msg) {
		console.log("NAME RECEIVED " + msg.name);
		socket.userName = msg.name;
		
		var found = [];
		for(var i = 0; i < sockets.length; i++) {
			var _socket = sockets[i];
			if(socket.addr === _socket.addr && socket.userName === _socket.userName) {
				found.push(i);
				console.log("FOUND MATCH FOR " + socket.addr);
			}
		}
		
		if(found.length !== 0) {
			for(var i = 0; i < found.length; i++) {
				console.log("DISCONNECTING " + found[i])
				sockets[found[i]].disconnect();
				sockets.splice(found[i], 1);
			}
			sockets.push(socket);
		}else{
			console.log("NEW CONNECTION", socket.addr);
			sockets.push(socket);
		}
		
	});
	
	socket.on('disconnect', function () { 
		console.log("DISCONNECT : " + this.addr + "," + this.userName);
		if(master === this) {
			console.log("DISCONNECTING MASTER");
			master = null;
		}
		for(var i = 0; i < sockets.length; i++) {
			var _socket = sockets[i];
			if(this.addr == _socket.addr && this.userName === _socket.userName) {
				console.log("KILLING", this.addr, this.userName);
				sockets.splice(i,1);
			}
		}
	});
	
	// var found = false;
	// for(var i = 0; i < sockets.length; i++) {
	// 	var _socket = sockets[i];
	// 	if(socket.addr === _socket.addr) {
	// 		found = true;
	// 		console.log("FOUND MATCH FOR " + socket.addr);
	// 	}
	// }
	// 
	// if(found) {
	// 	console.log("NOT CONNECTING " + socket.addr);
	// 	socket.disconnect();
	// }else{
	// 	console.log("NEW CONNECTION", socket.addr);
	// 	sockets.push(socket);
	// }
});