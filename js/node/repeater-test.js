var io   = require('socket.io').listen(8081);
var mdns = require('mdns');
var osc  = require('./omgosc.js');

var
  me = 'charlie',
  port = 10001,
  fief = {};

var receiver = new osc.UdpReceiver(port);

receiver.on('/code', function(message) {
  console.log('got osc/udp message:', message);
  for (var recipient in fief) {
    if (recipient !== me) {
      if (fief[recipient]) {
        fief[recipient].send(message.path, message.typetag, message.params);
      }
    }
  }
});

var browser = mdns.createBrowser(mdns.udp('osc'));

browser.on('serviceUp', function(service) {
  console.log('ad found on', service.host, ':',  service.port);
  if (service.txtRecord.name) {
    fief[service.txtRecord.name] = new osc.UdpSender(service.host, service.port);
    console.log('added', service.txtRecord.name);
  }
});

browser.on('serviceDown', function(service) {
  console.log('ad lost on', service.host, ':',  service.port);
  if (service.txtRecord.name) {
    delete fief[service.txtRecord.name];
    console.log('deleted', service.txtRecord.name);
  }
});

var ad = mdns.createAdvertisement(mdns.udp('osc'), port, {txtRecord: { name: me, }});

ad.start();
browser.start();
