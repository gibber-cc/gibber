var io = require('socket.io').listen(8080);

// PUT PATH TO YOUR RECORDED FILE HERE
require("./CREATE_CONCERT_GIBBER.js");

// a.___ where ___ is the name you used to save your performance
var concert = a.CONCERT;

var i = 0;

var prevTime = 0;

var processEvent = function() {
	var e  = concert[i++];
	if(typeof e.code !== "undefined") {
		master.emit("code", {code:e.code, userName:""});
	}else{
		master.emit("chat", {user: e.user, "text": e.text});
	}
	if(i < concert.length - 1) {
		var newTime = concert[i].time - e.time; 
		setTimeout(processEvent, newTime);
	}
}

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
			if(i < concert.length) {
				processEvent();
			}
		}
	});
	
});