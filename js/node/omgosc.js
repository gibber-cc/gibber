// OMG OSC, a Plask / NodeJS OSC implementation.
// (c) Dean McNamee <dean@gmail.com>, 2011.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
// IN THE SOFTWARE.

var sys = require('util');
var events = require('events');
var dgram = require('dgram');

function UdpSender(host, port, opts) {
  opts = opts === undefined ? { } : opts;

  var udp = dgram.createSocket('udp4');
  if (opts.broadcast === true)
    udp.setBroadcast(true);

  // Some buffers to get the float bit pattern, for example.
  var array_buffer = new ArrayBuffer(4);
  var data_view = new DataView(array_buffer);

  function appendString(octets, str) {
    var len = str.length;
    for (var i = 0; i < len; ++i) {
      octets.push(str.charCodeAt(i) & 0x7f);  // Should be 7-bit clean right?
    }
    // We want to add the null byte and pad to 4 byte boundary.
    var num_nulls = 4 - (len & 3);  // Will always be at least 1 for terminator.
    for (var i = 0; i < num_nulls; ++i) {
      octets.push(0);
    }
  }

  function appendBlob(octets, val) {
    var len = val.length;
    appendInt(octets, len);

    // grow byte array and carve out space for the Blob
    var start = octets.length;
    octets.length += len;
    for (var i = 0; i < len; ++i) {
      octets[start+i] = val[i];
    }

    // We want to pad to 4 byte boundary.
    var num_nulls = (4 - (len & 3)) & 3;
    for (var i = 0; i < num_nulls; ++i) {
      octets.push(0);
    }
  }

  function appendInt(octets, val) {
    data_view.setInt32(0, val, false);
    for (var i = 0; i < 4; ++i) {
      octets.push(data_view.getUint8(i));
    }
  }

  function appendFloat(octets, val) {
    data_view.setFloat32(0, val, false);
    for (var i = 0; i < 4; ++i) {
      octets.push(data_view.getUint8(i));
    }
  }

  function makeMessageOctets(path, typetag, params) {
    var octets = [ ];
    appendString(octets, path);
    appendString(octets, ',' + typetag);
    for (var i = 0, il = typetag.length; i < il; ++i) {
      var tag = typetag[i];
      switch (tag) {
        case 'i':
          appendInt(octets, params[i]);
          break;
        case 'f':
          appendFloat(octets, params[i]);
          break;
        case 's':
          appendString(octets, params[i]);
          break;
        case 'b':
          appendBlob(octets, params[i]);
          break;
        // Types with implicit parameters, just ignore the passed parameter.
        case 'T': case 'F': case 'N': case 'I':
          break;
        default:
          throw 'Unknown osc type: ' + tag;
          break;
      }
    }
    return octets;
  }

  this.send = function(path, typetag, params) {
    var octets = makeMessageOctets(path, typetag, params);
    udp.send(new Buffer(octets), 0, octets.length, port, host);
  };

  this.sendBundled = function(path, typetag, params) {
    var octets = [ ];
    var message_octets = makeMessageOctets(path, typetag, params);
    appendString(octets, "#bundle");
    appendInt(octets, 0); appendInt(octets, 1);  // timetag now.
    appendInt(octets, message_octets.length);
    octets = octets.concat(message_octets);
    udp.send(new Buffer(octets), 0, octets.length, port, host);
  };
}

var dgram = require('dgram');

// TODO(deanm): Support an opts with opts.host for binding.
function UdpReceiver(port) {
  // Some buffers to get the float bit pattern, for example.
  var array_buffer = new ArrayBuffer(4);
  var data_view = new DataView(array_buffer);

  function readString(buffer, start) {
    var end = start;
    var len = buffer.length;

    // Seek to the end of the string (which will be terminated by 1-4 NULLs).
    while (end < len && buffer[end] !== 0) end++;

    // NOTE(deanm): At this point we could probably salvage the message and
    // take the string (which was probably truncated due to UDP packet size),
    // but it is probably the best decision to error out on malformed data.
    if (end >= len)
      throw "Encountered invalid OSC string, missing NULL termination.";

    return buffer.toString('ascii', start, end);
  }

  function readBlob(buffer, start) {
    var len = readInt(buffer, start);
    start += 4;
    return buffer.slice(start, start+len);
  }

  function readFloat(buffer, pos) {
    data_view.setUint8(0, buffer[pos]);
    data_view.setUint8(1, buffer[pos+1]);
    data_view.setUint8(2, buffer[pos+2]);
    data_view.setUint8(3, buffer[pos+3]);
    return data_view.getFloat32(0, false);
  }

  function readInt(buffer, pos) {
    data_view.setUint8(0, buffer[pos]);
    data_view.setUint8(1, buffer[pos+1]);
    data_view.setUint8(2, buffer[pos+2]);
    data_view.setUint8(3, buffer[pos+3]);
    return data_view.getInt32(0, false);
  }

  var udp = dgram.createSocket('udp4');

  var this_ = this;
  function processMessageOrBundle(msg, pos) {
    var path = readString(msg, pos);
    pos += path.length + 4 - (path.length & 3);

    if (path === '#bundle') {
      pos += 8;  // Skip timetag, treat everything as 'immediately'.
      while (pos < msg.length) {
        var len = readInt(msg, pos);
        pos += 4;
        processMessageOrBundle(msg, pos);
        pos += len;
      }

      return;
    }

    var typetag = readString(msg, pos);
    pos += typetag.length + 4 - (typetag.length & 3);

    var params = [ ];
    for (var i = 1, il = typetag.length; i < il; ++i) {
      var tag = typetag[i];
      switch (tag) {
        case 'T':
          params.push(true);
          break;
        case 'F':
          params.push(false);
          break;
        case 'N':
          params.push(null);
          break;
        case 'I':
          // NOTE(pizthewiz) - find better synthesized parameter for Impulse.
          params.push(undefined);
          break;
        case 'f':
          params.push(readFloat(msg, pos));
          pos += 4;
          break;
        case 'i':
          params.push(readInt(msg, pos));
          pos += 4;
          break;
        case 's':
          var str = readString(msg, pos);
          pos += str.length + 4 - (str.length & 3);
          params.push(str);
          break;
        case 'b':
          var bytes = readBlob(msg, pos);
          pos += 4 + bytes.length + ((4 - (bytes.length & 3)) & 3);
          params.push(bytes);
          break;
        default:
          console.log('WARNING: Unhandled OSC type tag: ' + tag);
          break;
      }
    }

    var e = {path: path, typetag: typetag.substr(1), params: params}
    this_.emit(path + typetag, e);
    this_.emit(path, e);
    this_.emit('', e);
  }

  udp.on('message', function(msg, rinfo) {
    try {
      processMessageOrBundle(msg, 0);
    } catch(e) {
      console.log('WARNING: Skipping OSC message, error: ' + e);
    }
  });

  udp.bind(port);
}
sys.inherits(UdpReceiver, events.EventEmitter);

exports.UdpSender = UdpSender;
exports.UdpReceiver = UdpReceiver;
