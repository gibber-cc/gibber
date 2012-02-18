var io = require('socket.io').listen(8080);

io.sockets.on('connection', function (socket) {
	socket.on('message', function (msg) {
		console.log("MESSAGE " + msg);
		socket.broadcast.send(msg);
	});
	socket.on('disconnect', function () { });
});