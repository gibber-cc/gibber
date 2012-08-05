#!/usr/local/bin/node

// Authored by Karl Yerkes on 2012.08.02
//
// this node.js script watches a file, sending Gibber code whenever the file
// changes.  you must install node.js and the socket.io-client library for this
// script to work.  i made this script because i love Vim and honor those lost
// souls that still cling to Emacs.  also, i didn't love the web-based Gibber
// editor.  say '/path/to/watcher user host file' and have fun!  see the comment
// at the bottom for suggested Gibber code.
//

var name, host, file;

// parse command line arguments
//

var currentConnection = null;
if (process.argv.length == 5) {
  // args 0 and 1 are '/path/to/node' and '/path/to/watcher.js' respectively
  //
  name = process.argv[2];
  host = process.argv[3];
  file = process.argv[4];
}
else {
  console.log("USAGE: watcher <user> <host> <file>");
  process.exit(1);
}

// connect to the host.  tell Gibber out name when we receive a 'connect'
// message from the host
//
var io = require('socket.io-client').connect('http://' + host + ':8080/');

io.on('connect', function () {
  console.log("connected to host as " + name);
  currentConnection = io;
  currentConnection.emit('name', {"name":name});
});

// watch the given file, sending code to Gibber when changes are saved
//
var fs = require('fs');
var _prev = "";
fs.watchFile(file, { persistent: true, interval: 200 /* millisecond poll interval */ }, function (curr, prev) {
  fs.readFile(file, function(err, data) {
    if(err) {
      console.error("FAIL: Could not open file: %s", err);
      process.exit(1);
    }
    else {
		var _data = data.toString('ascii');
		if(_data != _prev){
		   currentConnection.send(data);
		   _prev = _data;
	       console.log('-----------------------------');
	       console.log(data.toString('ascii'));  
		}
    }
  });
});

/*
if (!k) {
  G.meta(k = {});
}

k.m = Mono();

k.f = function() {
  var next = _1;

  k.q = ScaleSeq([0, 2,  , 0, 7,  ,  6, 14], _12).slave(k.m).once();
  k.q.root = "C0";

  switch (rndi(0, 4)) {
    case 0:
      k.m.attack = _32;
      k.m.attack = _4;
      k.m.decay = _2;
      break;
    case 1:
      k.m.glide = _16;
      k.m.attack = _32;
      k.m.decay = _4;
      break;
    case 2:
      k.m.glide = _32;
      k.m.attack = 20;
      k.m.decay = _8;
      break;
    case 3:
      k.m.glide = _4;
      k.m.attack = _16;
      k.m.decay = _1;
      break;
    default:
      break;
  }

  k.m.amp = 0.3;
  k.m.filterMult = 0.02;
  k.m.cutoff = 0.05;
  future(function() { k.f() }, next);
};

k.f();
*/
