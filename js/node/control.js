var io 		= require('socket.io').listen(8080);
var mdns 	= require('mdns');
var osc 	= require('./omgosc.js');
var os		= require('os');

var control = null;
var gibber = null;

var myIP = (function() {
	var interfaces = os.networkInterfaces();
	var addresses = [];
	for (k in interfaces) {
	    for (k2 in interfaces[k]) {
	        var address = interfaces[k][k2];
	        if (address.family == 'IPv4' && !address.internal) {
	        	console.log("ADDR", address.address);
				if(address.address.charAt(0) !== "f") {
		            addresses.push(address.address);
				}
	        }
	    }
	}
	console.log("MY IP = ", myIP);
	return addresses[0];
})();

// can't have double quotes sent to Control... double quotes are the default for JSON stringify
function stringify(string) {
	var s = JSON.stringify(string);
	s = s.replace(/\"/g, "'");
	return s;
}

var browser = mdns.createBrowser(mdns.udp('osc'));

browser.on('serviceUp', function(service) {
	control = new osc.UdpSender(service.host, 8080);
	control.send( '/control/createBlankInterface', 'ss', ['testing', 'portrait'] );
	control.send( "/control/pushDestination", 's', [myIP + ":" + 8081] );	
});

browser.on('serviceDown', function(service) { console.log("service down: ", service); });
browser.start();

var receiver = new osc.UdpReceiver(8081);
receiver.on('', function(e) {
	console.log(e);
	gibber.emit('OSC', {path:e.path, tags:e.typetag, params:e.params});
});

io.sockets.on('connection', function (socket) {
	socket.addr = socket.handshake.address.address;
	socket.port = socket.handshake.address.port;
	
	gibber = socket;
	
	socket.on('OSC', function (msg) {
		//console.log("OSC", msg);
		for(var i = 0; i < msg.typetags.length; i++) {
			if(msg.typetags.charAt(i) === 's' && typeof msg.params[i] === "object") {
				msg.params[i] = stringify(msg.params[i]);
			}
		}
		if(control !== null) {
			//console.log("SENDING", msg);
			control.send(msg.path, msg.typetags, msg.params );
		}
	});
});
