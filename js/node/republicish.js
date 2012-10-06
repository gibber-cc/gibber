var io   = require('socket.io').listen(8080);
var mdns = require('mdns');
var osc  = require('./omgosc.js');

var
  port = 9999,
  gibber = null,
  me = null,
  ad = null,
  fief = {};

var receiver = new osc.UdpReceiver(port);

receiver.on('/code', function(message) {
  console.log('got osc/udp message:', message);
	gibber.emit('code', {user: message.params[0], code: message.params[1]});
});

var browser = mdns.createBrowser(mdns.udp('osc'));

browser.on('serviceUp', function(service) {
  console.log('ad found on', service.host, ':',  service.port);

  if (service.txtRecord.name) {
    fief[service.txtRecord.name] = new osc.UdpSender(service.host, service.port);
    if (gibber) {
      if (service.txtRecord.name !== me) {
        gibber.emit('addUser', service.txtRecord.name);
      }
    }
    console.log('added', service.txtRecord.name);
  }
});

browser.on('serviceDown', function(service) {
  console.log('ad lost on', service.host, ':',  service.port);
  if(service.txtRecord) {
    if (service.txtRecord.name) {
      if (service.txtRecord.name !== me) {
        gibber.emit('removeUser', service.txtRecord.name);
      }
      delete fief[service.txtRecord.name];
      console.log('deleted', service.txtRecord.name);
    }
  }
});

io.sockets.on('connection', function (socket) {
  socket.addr = socket.handshake.address.address;
  socket.port = socket.handshake.address.port;

  gibber = socket;
  
  socket.on('joinRepublic', function (userName) {
    console.log(userName, 'joins the republic');
    me = userName;
    if (ad) {
      ad.stop();
    }
    for(var key in fief) {
      if (key !== me) {
        socket.emit('addUser', key);
      }
    }
    ad = mdns.createAdvertisement(mdns.udp('osc'), port, {txtRecord: { name: me, }});
    ad.start();
  });

  socket.on('code', function (message) {
    for (var i = 0; i < message.recipients.length; i++) {
      var recipient = message.recipients[i];
      if (fief[recipient]) {
        fief[recipient].send('/code', 'ss', [me, message.code]);
      }
      else {
        console.log(recipient, 'is unknown');
      }
    }
    console.log("sent ", message.code, " to ", message.recipients);
  });
});

io.sockets.on('disconnect', function (socket) {
  if (ad) {
    ad.stop();
  }
  ad = null;
});

browser.start();
