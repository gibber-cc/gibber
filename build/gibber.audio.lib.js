!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Gibber=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./scripts/gibber/audio.lib.js":[function(require,module,exports){
!function() {

var Gibber = require( 'gibber.core.lib' )
Gibber.Audio = require( './audio.js')( Gibber )
module.exports = Gibber

}()
},{"./audio.js":"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio.js","gibber.core.lib":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/gibber.core.lib/scripts/gibber.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/base64-js/lib/b64.js":[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS)
			return 62 // '+'
		if (code === SLASH)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/browser-resolve/empty.js":[function(require,module,exports){

},{}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/buffer/index.js":[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('is-array')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var kMaxLength = 0x3fffffff

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Note:
 *
 * - Implementation must support adding new properties to `Uint8Array` instances.
 *   Firefox 4-29 lacked support, fixed in Firefox 30+.
 *   See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *  - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *  - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *    incorrect length in some situations.
 *
 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they will
 * get the Object implementation, which is slower but will work correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = (function () {
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        new Uint8Array(1).subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Find the length
  var length
  if (type === 'number')
    length = subject > 0 ? subject >>> 0 : 0
  else if (type === 'string') {
    if (encoding === 'base64')
      subject = base64clean(subject)
    length = Buffer.byteLength(subject, encoding)
  } else if (type === 'object' && subject !== null) { // assume object is array-like
    if (subject.type === 'Buffer' && isArray(subject.data))
      subject = subject.data
    length = +subject.length > 0 ? Math.floor(+subject.length) : 0
  } else
    throw new TypeError('must start with number, buffer, array or string')

  if (this.length > kMaxLength)
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
      'size: 0x' + kMaxLength.toString(16) + ' bytes')

  var buf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer.TYPED_ARRAY_SUPPORT && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    if (Buffer.isBuffer(subject)) {
      for (i = 0; i < length; i++)
        buf[i] = subject.readUInt8(i)
    } else {
      for (i = 0; i < length; i++)
        buf[i] = ((subject[i] % 256) + 256) % 256
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer.TYPED_ARRAY_SUPPORT && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

Buffer.isBuffer = function (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b))
    throw new TypeError('Arguments must be Buffers')

  var x = a.length
  var y = b.length
  for (var i = 0, len = Math.min(x, y); i < len && a[i] === b[i]; i++) {}
  if (i !== len) {
    x = a[i]
    y = b[i]
  }
  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function (list, totalLength) {
  if (!isArray(list)) throw new TypeError('Usage: Buffer.concat(list[, length])')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (totalLength === undefined) {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    case 'hex':
      ret = str.length >>> 1
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    default:
      ret = str.length
  }
  return ret
}

// pre-set for values that may exist in the future
Buffer.prototype.length = undefined
Buffer.prototype.parent = undefined

// toString(encoding, start=0, end=buffer.length)
Buffer.prototype.toString = function (encoding, start, end) {
  var loweredCase = false

  start = start >>> 0
  end = end === undefined || end === Infinity ? this.length : end >>> 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase)
          throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.equals = function (b) {
  if(!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max)
      str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  return Buffer.compare(this, b)
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(byte)) throw new Error('Invalid hex string')
    buf[offset + i] = byte
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function asciiWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function utf16leWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf16leToBytes(string), buf, offset, length, 2)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = utf16leWrite(this, string, offset, length)
      break
    default:
      throw new TypeError('Unknown encoding: ' + encoding)
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function binarySlice (buf, start, end) {
  return asciiSlice(buf, start, end)
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len;
    if (start < 0)
      start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0)
      end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start)
    end = start

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0)
    throw new RangeError('offset is not uint')
  if (offset + ext > length)
    throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
      ((this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      this[offset + 3])
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80))
    return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16) |
      (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
      (this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      (this[offset + 3])
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new TypeError('value is out of bounds')
  if (offset + ext > buf.length) throw new TypeError('index out of range')
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = value
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else objectWriteUInt16(this, value, offset, true)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else objectWriteUInt16(this, value, offset, false)
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = value
  } else objectWriteUInt32(this, value, offset, true)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else objectWriteUInt32(this, value, offset, false)
  return offset + 4
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = value
  return offset + 1
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else objectWriteUInt16(this, value, offset, true)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else objectWriteUInt16(this, value, offset, false)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else objectWriteUInt32(this, value, offset, true)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else objectWriteUInt32(this, value, offset, false)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new TypeError('value is out of bounds')
  if (offset + ext > buf.length) throw new TypeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert)
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert)
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  if (end < start) throw new TypeError('sourceEnd < sourceStart')
  if (target_start < 0 || target_start >= target.length)
    throw new TypeError('targetStart out of bounds')
  if (start < 0 || start >= source.length) throw new TypeError('sourceStart out of bounds')
  if (end < 0 || end > source.length) throw new TypeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < len; i++) {
      target[i + target_start] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new TypeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new TypeError('start out of bounds')
  if (end < 0 || end > this.length) throw new TypeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-z]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F) {
      byteArray.push(b)
    } else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++) {
        byteArray.push(parseInt(h[j], 16))
      }
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length, unitSize) {
  if (unitSize) length -= length % unitSize;
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

},{"base64-js":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/base64-js/lib/b64.js","ieee754":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/buffer/node_modules/ieee754/index.js","is-array":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/buffer/node_modules/is-array/index.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/buffer/node_modules/ieee754/index.js":[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/buffer/node_modules/is-array/index.js":[function(require,module,exports){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

},{}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/events/events.js":[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/http-browserify/index.js":[function(require,module,exports){
var http = module.exports;
var EventEmitter = require('events').EventEmitter;
var Request = require('./lib/request');
var url = require('url')

http.request = function (params, cb) {
    if (typeof params === 'string') {
        params = url.parse(params)
    }
    if (!params) params = {};
    if (!params.host && !params.port) {
        params.port = parseInt(window.location.port, 10);
    }
    if (!params.host && params.hostname) {
        params.host = params.hostname;
    }

    if (!params.protocol) {
        if (params.scheme) {
            params.protocol = params.scheme + ':';
        } else {
            params.protocol = window.location.protocol;
        }
    }

    if (!params.host) {
        params.host = window.location.hostname || window.location.host;
    }
    if (/:/.test(params.host)) {
        if (!params.port) {
            params.port = params.host.split(':')[1];
        }
        params.host = params.host.split(':')[0];
    }
    if (!params.port) params.port = params.protocol == 'https:' ? 443 : 80;
    
    var req = new Request(new xhrHttp, params);
    if (cb) req.on('response', cb);
    return req;
};

http.get = function (params, cb) {
    params.method = 'GET';
    var req = http.request(params, cb);
    req.end();
    return req;
};

http.Agent = function () {};
http.Agent.defaultMaxSockets = 4;

var xhrHttp = (function () {
    if (typeof window === 'undefined') {
        throw new Error('no window object present');
    }
    else if (window.XMLHttpRequest) {
        return window.XMLHttpRequest;
    }
    else if (window.ActiveXObject) {
        var axs = [
            'Msxml2.XMLHTTP.6.0',
            'Msxml2.XMLHTTP.3.0',
            'Microsoft.XMLHTTP'
        ];
        for (var i = 0; i < axs.length; i++) {
            try {
                var ax = new(window.ActiveXObject)(axs[i]);
                return function () {
                    if (ax) {
                        var ax_ = ax;
                        ax = null;
                        return ax_;
                    }
                    else {
                        return new(window.ActiveXObject)(axs[i]);
                    }
                };
            }
            catch (e) {}
        }
        throw new Error('ajax not supported in this browser')
    }
    else {
        throw new Error('ajax not supported in this browser');
    }
})();

http.STATUS_CODES = {
    100 : 'Continue',
    101 : 'Switching Protocols',
    102 : 'Processing',                 // RFC 2518, obsoleted by RFC 4918
    200 : 'OK',
    201 : 'Created',
    202 : 'Accepted',
    203 : 'Non-Authoritative Information',
    204 : 'No Content',
    205 : 'Reset Content',
    206 : 'Partial Content',
    207 : 'Multi-Status',               // RFC 4918
    300 : 'Multiple Choices',
    301 : 'Moved Permanently',
    302 : 'Moved Temporarily',
    303 : 'See Other',
    304 : 'Not Modified',
    305 : 'Use Proxy',
    307 : 'Temporary Redirect',
    400 : 'Bad Request',
    401 : 'Unauthorized',
    402 : 'Payment Required',
    403 : 'Forbidden',
    404 : 'Not Found',
    405 : 'Method Not Allowed',
    406 : 'Not Acceptable',
    407 : 'Proxy Authentication Required',
    408 : 'Request Time-out',
    409 : 'Conflict',
    410 : 'Gone',
    411 : 'Length Required',
    412 : 'Precondition Failed',
    413 : 'Request Entity Too Large',
    414 : 'Request-URI Too Large',
    415 : 'Unsupported Media Type',
    416 : 'Requested Range Not Satisfiable',
    417 : 'Expectation Failed',
    418 : 'I\'m a teapot',              // RFC 2324
    422 : 'Unprocessable Entity',       // RFC 4918
    423 : 'Locked',                     // RFC 4918
    424 : 'Failed Dependency',          // RFC 4918
    425 : 'Unordered Collection',       // RFC 4918
    426 : 'Upgrade Required',           // RFC 2817
    428 : 'Precondition Required',      // RFC 6585
    429 : 'Too Many Requests',          // RFC 6585
    431 : 'Request Header Fields Too Large',// RFC 6585
    500 : 'Internal Server Error',
    501 : 'Not Implemented',
    502 : 'Bad Gateway',
    503 : 'Service Unavailable',
    504 : 'Gateway Time-out',
    505 : 'HTTP Version Not Supported',
    506 : 'Variant Also Negotiates',    // RFC 2295
    507 : 'Insufficient Storage',       // RFC 4918
    509 : 'Bandwidth Limit Exceeded',
    510 : 'Not Extended',               // RFC 2774
    511 : 'Network Authentication Required' // RFC 6585
};
},{"./lib/request":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/http-browserify/lib/request.js","events":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/events/events.js","url":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/url/url.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/http-browserify/lib/request.js":[function(require,module,exports){
var Stream = require('stream');
var Response = require('./response');
var Base64 = require('Base64');
var inherits = require('inherits');

var Request = module.exports = function (xhr, params) {
    var self = this;
    self.writable = true;
    self.xhr = xhr;
    self.body = [];
    
    self.uri = (params.protocol || 'http:') + '//'
        + params.host
        + (params.port ? ':' + params.port : '')
        + (params.path || '/')
    ;
    
    if (typeof params.withCredentials === 'undefined') {
        params.withCredentials = true;
    }

    try { xhr.withCredentials = params.withCredentials }
    catch (e) {}
    
    if (params.responseType) try { xhr.responseType = params.responseType }
    catch (e) {}
    
    xhr.open(
        params.method || 'GET',
        self.uri,
        true
    );

    xhr.onerror = function(event) {
        self.emit('error', new Error('Network error'));
    };

    self._headers = {};
    
    if (params.headers) {
        var keys = objectKeys(params.headers);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (!self.isSafeRequestHeader(key)) continue;
            var value = params.headers[key];
            self.setHeader(key, value);
        }
    }
    
    if (params.auth) {
        //basic auth
        this.setHeader('Authorization', 'Basic ' + Base64.btoa(params.auth));
    }

    var res = new Response;
    res.on('close', function () {
        self.emit('close');
    });
    
    res.on('ready', function () {
        self.emit('response', res);
    });

    res.on('error', function (err) {
        self.emit('error', err);
    });
    
    xhr.onreadystatechange = function () {
        // Fix for IE9 bug
        // SCRIPT575: Could not complete the operation due to error c00c023f
        // It happens when a request is aborted, calling the success callback anyway with readyState === 4
        if (xhr.__aborted) return;
        res.handle(xhr);
    };
};

inherits(Request, Stream);

Request.prototype.setHeader = function (key, value) {
    this._headers[key.toLowerCase()] = value
};

Request.prototype.getHeader = function (key) {
    return this._headers[key.toLowerCase()]
};

Request.prototype.removeHeader = function (key) {
    delete this._headers[key.toLowerCase()]
};

Request.prototype.write = function (s) {
    this.body.push(s);
};

Request.prototype.destroy = function (s) {
    this.xhr.__aborted = true;
    this.xhr.abort();
    this.emit('close');
};

Request.prototype.end = function (s) {
    if (s !== undefined) this.body.push(s);

    var keys = objectKeys(this._headers);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var value = this._headers[key];
        if (isArray(value)) {
            for (var j = 0; j < value.length; j++) {
                this.xhr.setRequestHeader(key, value[j]);
            }
        }
        else this.xhr.setRequestHeader(key, value)
    }

    if (this.body.length === 0) {
        this.xhr.send('');
    }
    else if (typeof this.body[0] === 'string') {
        this.xhr.send(this.body.join(''));
    }
    else if (isArray(this.body[0])) {
        var body = [];
        for (var i = 0; i < this.body.length; i++) {
            body.push.apply(body, this.body[i]);
        }
        this.xhr.send(body);
    }
    else if (/Array/.test(Object.prototype.toString.call(this.body[0]))) {
        var len = 0;
        for (var i = 0; i < this.body.length; i++) {
            len += this.body[i].length;
        }
        var body = new(this.body[0].constructor)(len);
        var k = 0;
        
        for (var i = 0; i < this.body.length; i++) {
            var b = this.body[i];
            for (var j = 0; j < b.length; j++) {
                body[k++] = b[j];
            }
        }
        this.xhr.send(body);
    }
    else if (isXHR2Compatible(this.body[0])) {
        this.xhr.send(this.body[0]);
    }
    else {
        var body = '';
        for (var i = 0; i < this.body.length; i++) {
            body += this.body[i].toString();
        }
        this.xhr.send(body);
    }
};

// Taken from http://dxr.mozilla.org/mozilla/mozilla-central/content/base/src/nsXMLHttpRequest.cpp.html
Request.unsafeHeaders = [
    "accept-charset",
    "accept-encoding",
    "access-control-request-headers",
    "access-control-request-method",
    "connection",
    "content-length",
    "cookie",
    "cookie2",
    "content-transfer-encoding",
    "date",
    "expect",
    "host",
    "keep-alive",
    "origin",
    "referer",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
    "user-agent",
    "via"
];

Request.prototype.isSafeRequestHeader = function (headerName) {
    if (!headerName) return false;
    return indexOf(Request.unsafeHeaders, headerName.toLowerCase()) === -1;
};

var objectKeys = Object.keys || function (obj) {
    var keys = [];
    for (var key in obj) keys.push(key);
    return keys;
};

var isArray = Array.isArray || function (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};

var indexOf = function (xs, x) {
    if (xs.indexOf) return xs.indexOf(x);
    for (var i = 0; i < xs.length; i++) {
        if (xs[i] === x) return i;
    }
    return -1;
};

var isXHR2Compatible = function (obj) {
    if (typeof Blob !== 'undefined' && obj instanceof Blob) return true;
    if (typeof ArrayBuffer !== 'undefined' && obj instanceof ArrayBuffer) return true;
    if (typeof FormData !== 'undefined' && obj instanceof FormData) return true;
};

},{"./response":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/http-browserify/lib/response.js","Base64":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/http-browserify/node_modules/Base64/base64.js","inherits":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/inherits/inherits_browser.js","stream":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/stream-browserify/index.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/http-browserify/lib/response.js":[function(require,module,exports){
var Stream = require('stream');
var util = require('util');

var Response = module.exports = function (res) {
    this.offset = 0;
    this.readable = true;
};

util.inherits(Response, Stream);

var capable = {
    streaming : true,
    status2 : true
};

function parseHeaders (res) {
    var lines = res.getAllResponseHeaders().split(/\r?\n/);
    var headers = {};
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line === '') continue;
        
        var m = line.match(/^([^:]+):\s*(.*)/);
        if (m) {
            var key = m[1].toLowerCase(), value = m[2];
            
            if (headers[key] !== undefined) {
            
                if (isArray(headers[key])) {
                    headers[key].push(value);
                }
                else {
                    headers[key] = [ headers[key], value ];
                }
            }
            else {
                headers[key] = value;
            }
        }
        else {
            headers[line] = true;
        }
    }
    return headers;
}

Response.prototype.getResponse = function (xhr) {
    var respType = String(xhr.responseType).toLowerCase();
    if (respType === 'blob') return xhr.responseBlob || xhr.response;
    if (respType === 'arraybuffer') return xhr.response;
    return xhr.responseText;
}

Response.prototype.getHeader = function (key) {
    return this.headers[key.toLowerCase()];
};

Response.prototype.handle = function (res) {
    if (res.readyState === 2 && capable.status2) {
        try {
            this.statusCode = res.status;
            this.headers = parseHeaders(res);
        }
        catch (err) {
            capable.status2 = false;
        }
        
        if (capable.status2) {
            this.emit('ready');
        }
    }
    else if (capable.streaming && res.readyState === 3) {
        try {
            if (!this.statusCode) {
                this.statusCode = res.status;
                this.headers = parseHeaders(res);
                this.emit('ready');
            }
        }
        catch (err) {}
        
        try {
            this._emitData(res);
        }
        catch (err) {
            capable.streaming = false;
        }
    }
    else if (res.readyState === 4) {
        if (!this.statusCode) {
            this.statusCode = res.status;
            this.emit('ready');
        }
        this._emitData(res);
        
        if (res.error) {
            this.emit('error', this.getResponse(res));
        }
        else this.emit('end');
        
        this.emit('close');
    }
};

Response.prototype._emitData = function (res) {
    var respBody = this.getResponse(res);
    if (respBody.toString().match(/ArrayBuffer/)) {
        this.emit('data', new Uint8Array(respBody, this.offset));
        this.offset = respBody.byteLength;
        return;
    }
    if (respBody.length > this.offset) {
        this.emit('data', respBody.slice(this.offset));
        this.offset = respBody.length;
    }
};

var isArray = Array.isArray || function (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};

},{"stream":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/stream-browserify/index.js","util":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/util/util.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/http-browserify/node_modules/Base64/base64.js":[function(require,module,exports){
;(function () {

  var object = typeof exports != 'undefined' ? exports : this; // #8: web workers
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  function InvalidCharacterError(message) {
    this.message = message;
  }
  InvalidCharacterError.prototype = new Error;
  InvalidCharacterError.prototype.name = 'InvalidCharacterError';

  // encoder
  // [https://gist.github.com/999166] by [https://github.com/nignag]
  object.btoa || (
  object.btoa = function (input) {
    for (
      // initialize result and counter
      var block, charCode, idx = 0, map = chars, output = '';
      // if the next input index does not exist:
      //   change the mapping table to "="
      //   check if d has no fractional digits
      input.charAt(idx | 0) || (map = '=', idx % 1);
      // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
      output += map.charAt(63 & block >> 8 - idx % 1 * 8)
    ) {
      charCode = input.charCodeAt(idx += 3/4);
      if (charCode > 0xFF) {
        throw new InvalidCharacterError("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
      }
      block = block << 8 | charCode;
    }
    return output;
  });

  // decoder
  // [https://gist.github.com/1020396] by [https://github.com/atk]
  object.atob || (
  object.atob = function (input) {
    input = input.replace(/=+$/, '');
    if (input.length % 4 == 1) {
      throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
    }
    for (
      // initialize result and counters
      var bc = 0, bs, buffer, idx = 0, output = '';
      // get next character
      buffer = input.charAt(idx++);
      // character found in table? initialize bit storage and add its ascii value;
      ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
        // and if not first of each 4 characters,
        // convert the first 8 bits to one ascii character
        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    ) {
      // try to find character in table (0-63, not found => -1)
      buffer = chars.indexOf(buffer);
    }
    return output;
  });

}());

},{}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/inherits/inherits_browser.js":[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/isarray/index.js":[function(require,module,exports){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

},{}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/process/browser.js":[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/punycode/punycode.js":[function(require,module,exports){
(function (global){
/*! http://mths.be/punycode v1.2.4 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports;
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^ -~]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /\x2E|\u3002|\uFF0E|\uFF61/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		while (length--) {
			array[length] = fn(array[length]);
		}
		return array;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings.
	 * @private
	 * @param {String} domain The domain name.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		return map(string.split(regexSeparators), fn).join('.');
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <http://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * http://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols to a Punycode string of ASCII-only
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name to Unicode. Only the
	 * Punycoded parts of the domain name will be converted, i.e. it doesn't
	 * matter if you call it on a string that has already been converted to
	 * Unicode.
	 * @memberOf punycode
	 * @param {String} domain The Punycode domain name to convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(domain) {
		return mapDomain(domain, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name to Punycode. Only the
	 * non-ASCII parts of the domain name will be converted, i.e. it doesn't
	 * matter if you call it with a domain that's already in ASCII.
	 * @memberOf punycode
	 * @param {String} domain The domain name to convert, as a Unicode string.
	 * @returns {String} The Punycode representation of the given domain name.
	 */
	function toASCII(domain) {
		return mapDomain(domain, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.2.4',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <http://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/querystring-es3/decode.js":[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/querystring-es3/encode.js":[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/querystring-es3/index.js":[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/querystring-es3/decode.js","./encode":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/querystring-es3/encode.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/readable-stream/duplex.js":[function(require,module,exports){
module.exports = require("./lib/_stream_duplex.js")

},{"./lib/_stream_duplex.js":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/readable-stream/lib/_stream_duplex.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/readable-stream/lib/_stream_duplex.js":[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

module.exports = Duplex;

/*<replacement>*/
var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
}
/*</replacement>*/


/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

var Readable = require('./_stream_readable');
var Writable = require('./_stream_writable');

util.inherits(Duplex, Readable);

forEach(objectKeys(Writable.prototype), function(method) {
  if (!Duplex.prototype[method])
    Duplex.prototype[method] = Writable.prototype[method];
});

function Duplex(options) {
  if (!(this instanceof Duplex))
    return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false)
    this.readable = false;

  if (options && options.writable === false)
    this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false)
    this.allowHalfOpen = false;

  this.once('end', onend);
}

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended)
    return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  process.nextTick(this.end.bind(this));
}

function forEach (xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

}).call(this,require('_process'))
},{"./_stream_readable":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/readable-stream/lib/_stream_readable.js","./_stream_writable":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/readable-stream/lib/_stream_writable.js","_process":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/process/browser.js","core-util-is":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/readable-stream/node_modules/core-util-is/lib/util.js","inherits":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/inherits/inherits_browser.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/readable-stream/lib/_stream_passthrough.js":[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.

module.exports = PassThrough;

var Transform = require('./_stream_transform');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough))
    return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function(chunk, encoding, cb) {
  cb(null, chunk);
};

},{"./_stream_transform":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/readable-stream/lib/_stream_transform.js","core-util-is":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/readable-stream/node_modules/core-util-is/lib/util.js","inherits":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/inherits/inherits_browser.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/readable-stream/lib/_stream_readable.js":[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Readable;

/*<replacement>*/
var isArray = require('isarray');
/*</replacement>*/


/*<replacement>*/
var Buffer = require('buffer').Buffer;
/*</replacement>*/

Readable.ReadableState = ReadableState;

var EE = require('events').EventEmitter;

/*<replacement>*/
if (!EE.listenerCount) EE.listenerCount = function(emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

var Stream = require('stream');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

var StringDecoder;


/*<replacement>*/
var debug = require('util');
if (debug && debug.debuglog) {
  debug = debug.debuglog('stream');
} else {
  debug = function () {};
}
/*</replacement>*/


util.inherits(Readable, Stream);

function ReadableState(options, stream) {
  var Duplex = require('./_stream_duplex');

  options = options || {};

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  var defaultHwm = options.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = (hwm || hwm === 0) ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = ~~this.highWaterMark;

  this.buffer = [];
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;


  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex)
    this.objectMode = this.objectMode || !!options.readableObjectMode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // when piping, we only care about 'readable' events that happen
  // after read()ing all the bytes and not getting any pushback.
  this.ranOut = false;

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder)
      StringDecoder = require('string_decoder/').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  var Duplex = require('./_stream_duplex');

  if (!(this instanceof Readable))
    return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  Stream.call(this);
}

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function(chunk, encoding) {
  var state = this._readableState;

  if (util.isString(chunk) && !state.objectMode) {
    encoding = encoding || state.defaultEncoding;
    if (encoding !== state.encoding) {
      chunk = new Buffer(chunk, encoding);
      encoding = '';
    }
  }

  return readableAddChunk(this, state, chunk, encoding, false);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function(chunk) {
  var state = this._readableState;
  return readableAddChunk(this, state, chunk, '', true);
};

function readableAddChunk(stream, state, chunk, encoding, addToFront) {
  var er = chunkInvalid(state, chunk);
  if (er) {
    stream.emit('error', er);
  } else if (util.isNullOrUndefined(chunk)) {
    state.reading = false;
    if (!state.ended)
      onEofChunk(stream, state);
  } else if (state.objectMode || chunk && chunk.length > 0) {
    if (state.ended && !addToFront) {
      var e = new Error('stream.push() after EOF');
      stream.emit('error', e);
    } else if (state.endEmitted && addToFront) {
      var e = new Error('stream.unshift() after end event');
      stream.emit('error', e);
    } else {
      if (state.decoder && !addToFront && !encoding)
        chunk = state.decoder.write(chunk);

      if (!addToFront)
        state.reading = false;

      // if we want the data now, just emit it.
      if (state.flowing && state.length === 0 && !state.sync) {
        stream.emit('data', chunk);
        stream.read(0);
      } else {
        // update the buffer info.
        state.length += state.objectMode ? 1 : chunk.length;
        if (addToFront)
          state.buffer.unshift(chunk);
        else
          state.buffer.push(chunk);

        if (state.needReadable)
          emitReadable(stream);
      }

      maybeReadMore(stream, state);
    }
  } else if (!addToFront) {
    state.reading = false;
  }

  return needMoreData(state);
}



// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended &&
         (state.needReadable ||
          state.length < state.highWaterMark ||
          state.length === 0);
}

// backwards compatibility.
Readable.prototype.setEncoding = function(enc) {
  if (!StringDecoder)
    StringDecoder = require('string_decoder/').StringDecoder;
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
  return this;
};

// Don't raise the hwm > 128MB
var MAX_HWM = 0x800000;
function roundUpToNextPowerOf2(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2
    n--;
    for (var p = 1; p < 32; p <<= 1) n |= n >> p;
    n++;
  }
  return n;
}

function howMuchToRead(n, state) {
  if (state.length === 0 && state.ended)
    return 0;

  if (state.objectMode)
    return n === 0 ? 0 : 1;

  if (isNaN(n) || util.isNull(n)) {
    // only flow one buffer at a time
    if (state.flowing && state.buffer.length)
      return state.buffer[0].length;
    else
      return state.length;
  }

  if (n <= 0)
    return 0;

  // If we're asking for more than the target buffer level,
  // then raise the water mark.  Bump up to the next highest
  // power of 2, to prevent increasing it excessively in tiny
  // amounts.
  if (n > state.highWaterMark)
    state.highWaterMark = roundUpToNextPowerOf2(n);

  // don't have that much.  return null, unless we've ended.
  if (n > state.length) {
    if (!state.ended) {
      state.needReadable = true;
      return 0;
    } else
      return state.length;
  }

  return n;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function(n) {
  debug('read', n);
  var state = this._readableState;
  var nOrig = n;

  if (!util.isNumber(n) || n > 0)
    state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 &&
      state.needReadable &&
      (state.length >= state.highWaterMark || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended)
      endReadable(this);
    else
      emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0)
      endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  }

  if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0)
      state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
  }

  // If _read pushed data synchronously, then `reading` will be false,
  // and we need to re-evaluate how much data we can return to the user.
  if (doRead && !state.reading)
    n = howMuchToRead(nOrig, state);

  var ret;
  if (n > 0)
    ret = fromList(n, state);
  else
    ret = null;

  if (util.isNull(ret)) {
    state.needReadable = true;
    n = 0;
  }

  state.length -= n;

  // If we have nothing in the buffer, then we want to know
  // as soon as we *do* get something into the buffer.
  if (state.length === 0 && !state.ended)
    state.needReadable = true;

  // If we tried to read() past the EOF, then emit end on the next tick.
  if (nOrig !== n && state.ended && state.length === 0)
    endReadable(this);

  if (!util.isNull(ret))
    this.emit('data', ret);

  return ret;
};

function chunkInvalid(state, chunk) {
  var er = null;
  if (!util.isBuffer(chunk) &&
      !util.isString(chunk) &&
      !util.isNullOrUndefined(chunk) &&
      !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}


function onEofChunk(stream, state) {
  if (state.decoder && !state.ended) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // emit 'readable' now to make sure it gets picked up.
  emitReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    if (state.sync)
      process.nextTick(function() {
        emitReadable_(stream);
      });
    else
      emitReadable_(stream);
  }
}

function emitReadable_(stream) {
  debug('emit readable');
  stream.emit('readable');
  flow(stream);
}


// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    process.nextTick(function() {
      maybeReadMore_(stream, state);
    });
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended &&
         state.length < state.highWaterMark) {
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;
    else
      len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function(n) {
  this.emit('error', new Error('not implemented'));
};

Readable.prototype.pipe = function(dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

  var doEnd = (!pipeOpts || pipeOpts.end !== false) &&
              dest !== process.stdout &&
              dest !== process.stderr;

  var endFn = doEnd ? onend : cleanup;
  if (state.endEmitted)
    process.nextTick(endFn);
  else
    src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable) {
    debug('onunpipe');
    if (readable === src) {
      cleanup();
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', cleanup);
    src.removeListener('data', ondata);

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain &&
        (!dest._writableState || dest._writableState.needDrain))
      ondrain();
  }

  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    var ret = dest.write(chunk);
    if (false === ret) {
      debug('false write response, pause',
            src._readableState.awaitDrain);
      src._readableState.awaitDrain++;
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EE.listenerCount(dest, 'error') === 0)
      dest.emit('error', er);
  }
  // This is a brutally ugly hack to make sure that our error handler
  // is attached before any userland ones.  NEVER DO THIS.
  if (!dest._events || !dest._events.error)
    dest.on('error', onerror);
  else if (isArray(dest._events.error))
    dest._events.error.unshift(onerror);
  else
    dest._events.error = [onerror, dest._events.error];



  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function() {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain)
      state.awaitDrain--;
    if (state.awaitDrain === 0 && EE.listenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}


Readable.prototype.unpipe = function(dest) {
  var state = this._readableState;

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0)
    return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes)
      return this;

    if (!dest)
      dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest)
      dest.emit('unpipe', this);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var i = 0; i < len; i++)
      dests[i].emit('unpipe', this);
    return this;
  }

  // try to find the right one.
  var i = indexOf(state.pipes, dest);
  if (i === -1)
    return this;

  state.pipes.splice(i, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1)
    state.pipes = state.pipes[0];

  dest.emit('unpipe', this);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function(ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  // If listening to data, and it has not explicitly been paused,
  // then call resume to start the flow of data on the next tick.
  if (ev === 'data' && false !== this._readableState.flowing) {
    this.resume();
  }

  if (ev === 'readable' && this.readable) {
    var state = this._readableState;
    if (!state.readableListening) {
      state.readableListening = true;
      state.emittedReadable = false;
      state.needReadable = true;
      if (!state.reading) {
        var self = this;
        process.nextTick(function() {
          debug('readable nexttick read 0');
          self.read(0);
        });
      } else if (state.length) {
        emitReadable(this, state);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function() {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    state.flowing = true;
    if (!state.reading) {
      debug('resume read 0');
      this.read(0);
    }
    resume(this, state);
  }
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    process.nextTick(function() {
      resume_(stream, state);
    });
  }
}

function resume_(stream, state) {
  state.resumeScheduled = false;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading)
    stream.read(0);
}

Readable.prototype.pause = function() {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (false !== this._readableState.flowing) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  if (state.flowing) {
    do {
      var chunk = stream.read();
    } while (null !== chunk && state.flowing);
  }
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function(stream) {
  var state = this._readableState;
  var paused = false;

  var self = this;
  stream.on('end', function() {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length)
        self.push(chunk);
    }

    self.push(null);
  });

  stream.on('data', function(chunk) {
    debug('wrapped data');
    if (state.decoder)
      chunk = state.decoder.write(chunk);
    if (!chunk || !state.objectMode && !chunk.length)
      return;

    var ret = self.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (util.isFunction(stream[i]) && util.isUndefined(this[i])) {
      this[i] = function(method) { return function() {
        return stream[method].apply(stream, arguments);
      }}(i);
    }
  }

  // proxy certain important events.
  var events = ['error', 'close', 'destroy', 'pause', 'resume'];
  forEach(events, function(ev) {
    stream.on(ev, self.emit.bind(self, ev));
  });

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  self._read = function(n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return self;
};



// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
function fromList(n, state) {
  var list = state.buffer;
  var length = state.length;
  var stringMode = !!state.decoder;
  var objectMode = !!state.objectMode;
  var ret;

  // nothing in the list, definitely empty.
  if (list.length === 0)
    return null;

  if (length === 0)
    ret = null;
  else if (objectMode)
    ret = list.shift();
  else if (!n || n >= length) {
    // read it all, truncate the array.
    if (stringMode)
      ret = list.join('');
    else
      ret = Buffer.concat(list, length);
    list.length = 0;
  } else {
    // read just some of it.
    if (n < list[0].length) {
      // just take a part of the first list item.
      // slice is the same for buffers and strings.
      var buf = list[0];
      ret = buf.slice(0, n);
      list[0] = buf.slice(n);
    } else if (n === list[0].length) {
      // first list is a perfect match
      ret = list.shift();
    } else {
      // complex case.
      // we have enough to cover it, but it spans past the first buffer.
      if (stringMode)
        ret = '';
      else
        ret = new Buffer(n);

      var c = 0;
      for (var i = 0, l = list.length; i < l && c < n; i++) {
        var buf = list[0];
        var cpy = Math.min(n - c, buf.length);

        if (stringMode)
          ret += buf.slice(0, cpy);
        else
          buf.copy(ret, c, 0, cpy);

        if (cpy < buf.length)
          list[0] = buf.slice(cpy);
        else
          list.shift();

        c += cpy;
      }
    }
  }

  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0)
    throw new Error('endReadable called on non-empty stream');

  if (!state.endEmitted) {
    state.ended = true;
    process.nextTick(function() {
      // Check that we didn't get one last unshift.
      if (!state.endEmitted && state.length === 0) {
        state.endEmitted = true;
        stream.readable = false;
        stream.emit('end');
      }
    });
  }
}

function forEach (xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

function indexOf (xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}

}).call(this,require('_process'))
},{"./_stream_duplex":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/readable-stream/lib/_stream_duplex.js","_process":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/process/browser.js","buffer":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/buffer/index.js","core-util-is":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/readable-stream/node_modules/core-util-is/lib/util.js","events":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/events/events.js","inherits":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/inherits/inherits_browser.js","isarray":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/isarray/index.js","stream":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/stream-browserify/index.js","string_decoder/":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/readable-stream/node_modules/string_decoder/index.js","util":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/browser-resolve/empty.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/readable-stream/lib/_stream_transform.js":[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.


// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

module.exports = Transform;

var Duplex = require('./_stream_duplex');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(Transform, Duplex);


function TransformState(options, stream) {
  this.afterTransform = function(er, data) {
    return afterTransform(stream, er, data);
  };

  this.needTransform = false;
  this.transforming = false;
  this.writecb = null;
  this.writechunk = null;
}

function afterTransform(stream, er, data) {
  var ts = stream._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb)
    return stream.emit('error', new Error('no writecb in Transform class'));

  ts.writechunk = null;
  ts.writecb = null;

  if (!util.isNullOrUndefined(data))
    stream.push(data);

  if (cb)
    cb(er);

  var rs = stream._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    stream._read(rs.highWaterMark);
  }
}


function Transform(options) {
  if (!(this instanceof Transform))
    return new Transform(options);

  Duplex.call(this, options);

  this._transformState = new TransformState(options, this);

  // when the writable side finishes, then flush out anything remaining.
  var stream = this;

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  this.once('prefinish', function() {
    if (util.isFunction(this._flush))
      this._flush(function(er) {
        done(stream, er);
      });
    else
      done(stream);
  });
}

Transform.prototype.push = function(chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function(chunk, encoding, cb) {
  throw new Error('not implemented');
};

Transform.prototype._write = function(chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform ||
        rs.needReadable ||
        rs.length < rs.highWaterMark)
      this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function(n) {
  var ts = this._transformState;

  if (!util.isNull(ts.writechunk) && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};


function done(stream, er) {
  if (er)
    return stream.emit('error', er);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  var ws = stream._writableState;
  var ts = stream._transformState;

  if (ws.length)
    throw new Error('calling transform done when ws.length != 0');

  if (ts.transforming)
    throw new Error('calling transform done when still transforming');

  return stream.push(null);
}

},{"./_stream_duplex":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/readable-stream/lib/_stream_duplex.js","core-util-is":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/readable-stream/node_modules/core-util-is/lib/util.js","inherits":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/inherits/inherits_browser.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/readable-stream/lib/_stream_writable.js":[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// A bit simpler than readable streams.
// Implement an async ._write(chunk, cb), and it'll handle all
// the drain event emission and buffering.

module.exports = Writable;

/*<replacement>*/
var Buffer = require('buffer').Buffer;
/*</replacement>*/

Writable.WritableState = WritableState;


/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

var Stream = require('stream');

util.inherits(Writable, Stream);

function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
}

function WritableState(options, stream) {
  var Duplex = require('./_stream_duplex');

  options = options || {};

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  var defaultHwm = options.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = (hwm || hwm === 0) ? hwm : defaultHwm;

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex)
    this.objectMode = this.objectMode || !!options.writableObjectMode;

  // cast to ints.
  this.highWaterMark = ~~this.highWaterMark;

  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function(er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.buffer = [];

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;
}

function Writable(options) {
  var Duplex = require('./_stream_duplex');

  // Writable ctor is applied to Duplexes, though they're not
  // instanceof Writable, they're instanceof Readable.
  if (!(this instanceof Writable) && !(this instanceof Duplex))
    return new Writable(options);

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function() {
  this.emit('error', new Error('Cannot pipe. Not readable.'));
};


function writeAfterEnd(stream, state, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  process.nextTick(function() {
    cb(er);
  });
}

// If we get something that is not a buffer, string, null, or undefined,
// and we're not in objectMode, then that's an error.
// Otherwise stream chunks are all considered to be of length=1, and the
// watermarks determine how many objects to keep in the buffer, rather than
// how many bytes or characters.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  if (!util.isBuffer(chunk) &&
      !util.isString(chunk) &&
      !util.isNullOrUndefined(chunk) &&
      !state.objectMode) {
    var er = new TypeError('Invalid non-string/buffer chunk');
    stream.emit('error', er);
    process.nextTick(function() {
      cb(er);
    });
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function(chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;

  if (util.isFunction(encoding)) {
    cb = encoding;
    encoding = null;
  }

  if (util.isBuffer(chunk))
    encoding = 'buffer';
  else if (!encoding)
    encoding = state.defaultEncoding;

  if (!util.isFunction(cb))
    cb = function() {};

  if (state.ended)
    writeAfterEnd(this, state, cb);
  else if (validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, chunk, encoding, cb);
  }

  return ret;
};

Writable.prototype.cork = function() {
  var state = this._writableState;

  state.corked++;
};

Writable.prototype.uncork = function() {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;

    if (!state.writing &&
        !state.corked &&
        !state.finished &&
        !state.bufferProcessing &&
        state.buffer.length)
      clearBuffer(this, state);
  }
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode &&
      state.decodeStrings !== false &&
      util.isString(chunk)) {
    chunk = new Buffer(chunk, encoding);
  }
  return chunk;
}

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, chunk, encoding, cb) {
  chunk = decodeChunk(state, chunk, encoding);
  if (util.isBuffer(chunk))
    encoding = 'buffer';
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret)
    state.needDrain = true;

  if (state.writing || state.corked)
    state.buffer.push(new WriteReq(chunk, encoding, cb));
  else
    doWrite(stream, state, false, len, chunk, encoding, cb);

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (writev)
    stream._writev(chunk, state.onwrite);
  else
    stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  if (sync)
    process.nextTick(function() {
      state.pendingcb--;
      cb(er);
    });
  else {
    state.pendingcb--;
    cb(er);
  }

  stream._writableState.errorEmitted = true;
  stream.emit('error', er);
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er)
    onwriteError(stream, state, sync, er, cb);
  else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(stream, state);

    if (!finished &&
        !state.corked &&
        !state.bufferProcessing &&
        state.buffer.length) {
      clearBuffer(stream, state);
    }

    if (sync) {
      process.nextTick(function() {
        afterWrite(stream, state, finished, cb);
      });
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished)
    onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}


// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;

  if (stream._writev && state.buffer.length > 1) {
    // Fast case, write everything using _writev()
    var cbs = [];
    for (var c = 0; c < state.buffer.length; c++)
      cbs.push(state.buffer[c].callback);

    // count the one we are adding, as well.
    // TODO(isaacs) clean this up
    state.pendingcb++;
    doWrite(stream, state, true, state.length, state.buffer, '', function(err) {
      for (var i = 0; i < cbs.length; i++) {
        state.pendingcb--;
        cbs[i](err);
      }
    });

    // Clear buffer
    state.buffer = [];
  } else {
    // Slow case, write chunks one-by-one
    for (var c = 0; c < state.buffer.length; c++) {
      var entry = state.buffer[c];
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;

      doWrite(stream, state, false, len, chunk, encoding, cb);

      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        c++;
        break;
      }
    }

    if (c < state.buffer.length)
      state.buffer = state.buffer.slice(c);
    else
      state.buffer.length = 0;
  }

  state.bufferProcessing = false;
}

Writable.prototype._write = function(chunk, encoding, cb) {
  cb(new Error('not implemented'));

};

Writable.prototype._writev = null;

Writable.prototype.end = function(chunk, encoding, cb) {
  var state = this._writableState;

  if (util.isFunction(chunk)) {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (util.isFunction(encoding)) {
    cb = encoding;
    encoding = null;
  }

  if (!util.isNullOrUndefined(chunk))
    this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished)
    endWritable(this, state, cb);
};


function needFinish(stream, state) {
  return (state.ending &&
          state.length === 0 &&
          !state.finished &&
          !state.writing);
}

function prefinish(stream, state) {
  if (!state.prefinished) {
    state.prefinished = true;
    stream.emit('prefinish');
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(stream, state);
  if (need) {
    if (state.pendingcb === 0) {
      prefinish(stream, state);
      state.finished = true;
      stream.emit('finish');
    } else
      prefinish(stream, state);
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished)
      process.nextTick(cb);
    else
      stream.once('finish', cb);
  }
  state.ended = true;
}

}).call(this,require('_process'))
},{"./_stream_duplex":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/readable-stream/lib/_stream_duplex.js","_process":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/process/browser.js","buffer":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/buffer/index.js","core-util-is":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/readable-stream/node_modules/core-util-is/lib/util.js","inherits":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/inherits/inherits_browser.js","stream":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/stream-browserify/index.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/readable-stream/node_modules/core-util-is/lib/util.js":[function(require,module,exports){
(function (Buffer){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

function isBuffer(arg) {
  return Buffer.isBuffer(arg);
}
exports.isBuffer = isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}
}).call(this,require("buffer").Buffer)
},{"buffer":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/buffer/index.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/readable-stream/node_modules/string_decoder/index.js":[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var Buffer = require('buffer').Buffer;

var isBufferEncoding = Buffer.isEncoding
  || function(encoding) {
       switch (encoding && encoding.toLowerCase()) {
         case 'hex': case 'utf8': case 'utf-8': case 'ascii': case 'binary': case 'base64': case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le': case 'raw': return true;
         default: return false;
       }
     }


function assertEncoding(encoding) {
  if (encoding && !isBufferEncoding(encoding)) {
    throw new Error('Unknown encoding: ' + encoding);
  }
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters. CESU-8 is handled as part of the UTF-8 encoding.
//
// @TODO Handling all encodings inside a single object makes it very difficult
// to reason about this code, so it should be split up in the future.
// @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
// points as used by CESU-8.
var StringDecoder = exports.StringDecoder = function(encoding) {
  this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
  assertEncoding(encoding);
  switch (this.encoding) {
    case 'utf8':
      // CESU-8 represents each of Surrogate Pair by 3-bytes
      this.surrogateSize = 3;
      break;
    case 'ucs2':
    case 'utf16le':
      // UTF-16 represents each of Surrogate Pair by 2-bytes
      this.surrogateSize = 2;
      this.detectIncompleteChar = utf16DetectIncompleteChar;
      break;
    case 'base64':
      // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
      this.surrogateSize = 3;
      this.detectIncompleteChar = base64DetectIncompleteChar;
      break;
    default:
      this.write = passThroughWrite;
      return;
  }

  // Enough space to store all bytes of a single character. UTF-8 needs 4
  // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).
  this.charBuffer = new Buffer(6);
  // Number of bytes received for the current incomplete multi-byte character.
  this.charReceived = 0;
  // Number of bytes expected for the current incomplete multi-byte character.
  this.charLength = 0;
};


// write decodes the given buffer and returns it as JS string that is
// guaranteed to not contain any partial multi-byte characters. Any partial
// character found at the end of the buffer is buffered up, and will be
// returned when calling write again with the remaining bytes.
//
// Note: Converting a Buffer containing an orphan surrogate to a String
// currently works, but converting a String to a Buffer (via `new Buffer`, or
// Buffer#write) will replace incomplete surrogates with the unicode
// replacement character. See https://codereview.chromium.org/121173009/ .
StringDecoder.prototype.write = function(buffer) {
  var charStr = '';
  // if our last write ended with an incomplete multibyte character
  while (this.charLength) {
    // determine how many remaining bytes this buffer has to offer for this char
    var available = (buffer.length >= this.charLength - this.charReceived) ?
        this.charLength - this.charReceived :
        buffer.length;

    // add the new bytes to the char buffer
    buffer.copy(this.charBuffer, this.charReceived, 0, available);
    this.charReceived += available;

    if (this.charReceived < this.charLength) {
      // still not enough chars in this buffer? wait for more ...
      return '';
    }

    // remove bytes belonging to the current character from the buffer
    buffer = buffer.slice(available, buffer.length);

    // get the character that was split
    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

    // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
    var charCode = charStr.charCodeAt(charStr.length - 1);
    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
      this.charLength += this.surrogateSize;
      charStr = '';
      continue;
    }
    this.charReceived = this.charLength = 0;

    // if there are no more bytes in this buffer, just emit our char
    if (buffer.length === 0) {
      return charStr;
    }
    break;
  }

  // determine and set charLength / charReceived
  this.detectIncompleteChar(buffer);

  var end = buffer.length;
  if (this.charLength) {
    // buffer the incomplete character bytes we got
    buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
    end -= this.charReceived;
  }

  charStr += buffer.toString(this.encoding, 0, end);

  var end = charStr.length - 1;
  var charCode = charStr.charCodeAt(end);
  // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
  if (charCode >= 0xD800 && charCode <= 0xDBFF) {
    var size = this.surrogateSize;
    this.charLength += size;
    this.charReceived += size;
    this.charBuffer.copy(this.charBuffer, size, 0, size);
    buffer.copy(this.charBuffer, 0, 0, size);
    return charStr.substring(0, end);
  }

  // or just emit the charStr
  return charStr;
};

// detectIncompleteChar determines if there is an incomplete UTF-8 character at
// the end of the given buffer. If so, it sets this.charLength to the byte
// length that character, and sets this.charReceived to the number of bytes
// that are available for this character.
StringDecoder.prototype.detectIncompleteChar = function(buffer) {
  // determine how many bytes we have to check at the end of this buffer
  var i = (buffer.length >= 3) ? 3 : buffer.length;

  // Figure out if one of the last i bytes of our buffer announces an
  // incomplete char.
  for (; i > 0; i--) {
    var c = buffer[buffer.length - i];

    // See http://en.wikipedia.org/wiki/UTF-8#Description

    // 110XXXXX
    if (i == 1 && c >> 5 == 0x06) {
      this.charLength = 2;
      break;
    }

    // 1110XXXX
    if (i <= 2 && c >> 4 == 0x0E) {
      this.charLength = 3;
      break;
    }

    // 11110XXX
    if (i <= 3 && c >> 3 == 0x1E) {
      this.charLength = 4;
      break;
    }
  }
  this.charReceived = i;
};

StringDecoder.prototype.end = function(buffer) {
  var res = '';
  if (buffer && buffer.length)
    res = this.write(buffer);

  if (this.charReceived) {
    var cr = this.charReceived;
    var buf = this.charBuffer;
    var enc = this.encoding;
    res += buf.slice(0, cr).toString(enc);
  }

  return res;
};

function passThroughWrite(buffer) {
  return buffer.toString(this.encoding);
}

function utf16DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 2;
  this.charLength = this.charReceived ? 2 : 0;
}

function base64DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 3;
  this.charLength = this.charReceived ? 3 : 0;
}

},{"buffer":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/buffer/index.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/readable-stream/passthrough.js":[function(require,module,exports){
module.exports = require("./lib/_stream_passthrough.js")

},{"./lib/_stream_passthrough.js":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/readable-stream/lib/_stream_passthrough.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/readable-stream/readable.js":[function(require,module,exports){
exports = module.exports = require('./lib/_stream_readable.js');
exports.Stream = require('stream');
exports.Readable = exports;
exports.Writable = require('./lib/_stream_writable.js');
exports.Duplex = require('./lib/_stream_duplex.js');
exports.Transform = require('./lib/_stream_transform.js');
exports.PassThrough = require('./lib/_stream_passthrough.js');

},{"./lib/_stream_duplex.js":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/readable-stream/lib/_stream_duplex.js","./lib/_stream_passthrough.js":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/readable-stream/lib/_stream_passthrough.js","./lib/_stream_readable.js":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/readable-stream/lib/_stream_readable.js","./lib/_stream_transform.js":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/readable-stream/lib/_stream_transform.js","./lib/_stream_writable.js":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/readable-stream/lib/_stream_writable.js","stream":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/stream-browserify/index.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/readable-stream/transform.js":[function(require,module,exports){
module.exports = require("./lib/_stream_transform.js")

},{"./lib/_stream_transform.js":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/readable-stream/lib/_stream_transform.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/readable-stream/writable.js":[function(require,module,exports){
module.exports = require("./lib/_stream_writable.js")

},{"./lib/_stream_writable.js":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/readable-stream/lib/_stream_writable.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/stream-browserify/index.js":[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Stream;

var EE = require('events').EventEmitter;
var inherits = require('inherits');

inherits(Stream, EE);
Stream.Readable = require('readable-stream/readable.js');
Stream.Writable = require('readable-stream/writable.js');
Stream.Duplex = require('readable-stream/duplex.js');
Stream.Transform = require('readable-stream/transform.js');
Stream.PassThrough = require('readable-stream/passthrough.js');

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;



// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EE.call(this);
}

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EE.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

},{"events":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/events/events.js","inherits":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/inherits/inherits_browser.js","readable-stream/duplex.js":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/readable-stream/duplex.js","readable-stream/passthrough.js":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/readable-stream/passthrough.js","readable-stream/readable.js":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/readable-stream/readable.js","readable-stream/transform.js":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/readable-stream/transform.js","readable-stream/writable.js":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/readable-stream/writable.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/url/url.js":[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var punycode = require('punycode');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a puny coded representation of "domain".
      // It only converts the part of the domain name that
      // has non ASCII characters. I.e. it dosent matter if
      // you call it with a domain that already is in ASCII.
      var domainArray = this.hostname.split('.');
      var newOut = [];
      for (var i = 0; i < domainArray.length; ++i) {
        var s = domainArray[i];
        newOut.push(s.match(/[^A-Za-z0-9_-]/) ?
            'xn--' + punycode.encode(s) : s);
      }
      this.hostname = newOut.join('.');
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  Object.keys(this).forEach(function(k) {
    result[k] = this[k];
  }, this);

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    Object.keys(relative).forEach(function(k) {
      if (k !== 'protocol')
        result[k] = relative[k];
    });

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      Object.keys(relative).forEach(function(k) {
        result[k] = relative[k];
      });
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especialy happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!isNull(result.pathname) || !isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host) && (last === '.' || last === '..') ||
      last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last == '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especialy happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!isNull(result.pathname) || !isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

function isString(arg) {
  return typeof arg === "string";
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isNull(arg) {
  return arg === null;
}
function isNullOrUndefined(arg) {
  return  arg == null;
}

},{"punycode":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/punycode/punycode.js","querystring":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/querystring-es3/index.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/util/support/isBufferBrowser.js":[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/util/util.js":[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/util/support/isBufferBrowser.js","_process":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/process/browser.js","inherits":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/inherits/inherits_browser.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/gibber.core.lib/scripts/dollar.js":[function(require,module,exports){
(function (global){
!function() {

"use strict"

var hasZepto = typeof Zepto === 'function',
    hasJQuery = typeof jQuery === 'function',
    has$ = typeof global.$ === 'object' || typeof global.$ === 'function',
    $ = null,
    hasConflict = hasZepto || hasJQuery || has$,
    isArray = Array.isArray,
    isObject = function( obj ) { return typeof obj === 'object' },
    isPlainObject = function( obj ) {
      return isObject(obj) && Object.getPrototypeOf( obj ) == Object.prototype
    }

if( !hasConflict ) {
  $ = {}
}else if( hasJQuery ) {
  $ = jQuery 
}else if( hasZepto ) {
  $ = Zepto
}else if( has$ ){
  $ = global.$
}else{
  $ = {}
}

// taken from Zepto: zeptojs.com
function extend(target, source, deep) {
  for (var key in source)
    if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
      if (isPlainObject(source[key]) && !isPlainObject(target[key]))
        target[key] = {}
      if (isArray(source[key]) && !isArray(target[key]))
        target[key] = []
      extend(target[key], source[key], deep)
    }
    else if (source[key] !== undefined) target[key] = source[key]
}

if( !hasConflict ) {
  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function( target ){
    var deep, args = Array.prototype.slice.call(arguments, 1)

    if (typeof target === 'boolean') {
      deep = target
      target = args.shift()
    }
    args.forEach(function(arg){ extend(target, arg, deep) })
    return target
  }
  
  $.isArray = Array.isArray 
  $.isPlainObject = isPlainObject

  $.type = function( val ) {
    return typeof val
  }
}

var events = {}
$.subscribe   = function( key, fcn ) { 
  if( typeof events[ key ] === 'undefined' ) {
    events[ key ] = []
  }
  events[ key ].push( fcn )
}

$.unsubscribe = function( key, fcn ) {
  if( typeof events[ key ] !== 'undefined' ) {
    var arr = events[ key ]
    
    arr.splice( arr.indexOf( fcn ), 1 )
  }
}

$.publish = function( key, data ) {
  if( typeof events[ key ] !== 'undefined' ) {
    var arr = events[ key ]
    for( var i = 0; i < arr.length; i++ ) {
      arr[ i ]( data )
    }
  }
}

module.exports = $

}()
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/gibber.core.lib/scripts/euclidean.js":[function(require,module,exports){
module.exports = function( Gibber ) {

"use strict"

var flatten = function(){
   var flat = [];
   for (var i = 0, l = this.length; i < l; i++){
       var type = Object.prototype.toString.call(this[i]).split(' ').pop().split(']').shift().toLowerCase();
       if (type) { flat = flat.concat(/^(array|collection|arguments|object)$/.test(type) ? flatten.call(this[i]) : this[i]); }
   }
   return flat;
}

var createStartingArray = function( length, ones ) {
  var out = []
  for( var i = 0; i < ones; i++ ) {
    out.push([1])
  }
  for( var j = i; j < length; j++ ) {
    out.push(0)
  }
  return out
}

var printArray = function( array ) {
  var str = ''
  for( var i = 0; i < array.length; i++ ) {
    var outerElement = array[ i ]
    if( Array.isArray( outerElement ) ) {
      str += '['
      for( var j = 0; j < outerElement.length; j++ ) {
        str += outerElement[ j ]
      }
      str += '] '
    }else{
      str += outerElement + ''
    }
  }

  return str
}

var arraysEqual = function(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

var getLargestArrayCount = function( input ) {
  var length = 0, count = 0

  for( var i = 0; i < input.length; i++ ) {
    if( Array.isArray( input[ i ] ) ) { 
      if( input[ i ].length > length ) {
        length = input[ i ].length
        count = 1
      }else if( input[ i ].length === length ) {
        count++
      }
    }
  }

  return count
}

var Euclid = function( ones,length, dur ) {
  var count = 0,
      out = createStartingArray( length, ones )

 	function Inner( n,k ) {
    var operationCount = count++ === 0 ? k : getLargestArrayCount( out ),
        moveCandidateCount = out.length - operationCount,
        numberOfMoves = operationCount >= moveCandidateCount ? moveCandidateCount : operationCount

    if( numberOfMoves > 1 || count === 1 ) {
      for( var i = 0; i < numberOfMoves; i++ ) {
        var willBeMoved = out.pop(), isArray = Array.isArray( willBeMoved )
        out[ i ].push( willBeMoved )
        if( isArray ) { 
          flatten.call( out[ i ] )
        }
      }
    }

    if( n % k !== 0 ) {
      return Inner( k, n % k )
    }else {
      return flatten.call( out )
    }
  }

  return calculateRhythms( Inner( length, ones ), dur )
}
// E(5,8) = [ .25, .125, .25, .125, .25 ]
var calculateRhythms = function( values,dur ) {
  var out = []
  
  console.log( values, dur )
  if( typeof dur === 'undefined' ) dur = 1 / values.length

  var idx = 0,
      currentDur = 0
  
  while( idx < values.length ) {
    idx++
    currentDur += dur
    
    if( values[ idx ] == 1 || idx === values.length ) {
      out.push( currentDur )
      currentDur = 0
    } 
  }
  
  return out
}

var answers = {
  '1,4' : '1000',
  '2,3' : '101',
  '2,5' : '10100',
  '3,4' : '1011',
  '3,5' : '10101',
  '3,7' : '1010100',
  '3,8' : '10010010',
  '4,7' : '1010101',
  '4,9' : '101010100',
  '4,11': '10010010010',
  '5,6' : '101111',
  '5,7' : '1011011',
  '5,8' : '10110110',
  '5,9' : '101010101',
  '5,11': '10101010100',
  '5,12': '100101001010',
  '5,16': '1001001001001000',
  '7,8' : '10111111',
  '11,24': '100101010101001010101010'
}

Euclid.test = function( testKey ) {
  var failed = 0, passed = 0

  if( typeof testKey !== 'string' ) {
    for( var key in answers ) {
      var expectedResult = answers[ key ],
          result = flatten.call( Euclid.apply( null, key.split(',') ) ).join('')

      console.log( result, expectedResult )

      if( result === expectedResult ) {
        console.log("TEST PASSED", key )
        passed++
      }else{
        console.log("TEST FAILED", key )
        failed++
      }
    }
    console.log("*****************************TEST RESULTS - Passed: " + passed + ", Failed: " + failed )
  }else{
    var expectedResult = answers[testKey],
				result = flatten.call( Euclid.apply( null, testKey.split(',') ) ).join('')

    console.log( result, expectedResult )

    if( result == expectedResult ) {
      console.log("TEST PASSED FOR", testKey)
    }else{
      console.log("TEST FAILED FOR", testKey)
    }
  }
}

return Euclid

}
},{}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/gibber.core.lib/scripts/gibber.js":[function(require,module,exports){
(function() {
//"use strict" 
// can't use strict because eval is used to evaluate user code in the run method
// I should wrap this in a Function call instead...
var $ = require( './dollar' )

var Gibber = {
  dollar: $,
  Presets: {},
  scale : null,
  minNoteFrequency:50,
  started:false,
  outputCurves : {
    LINEAR:0,
    LOGARITHMIC:1
  },
  Pattern: require( './pattern' ),
  
  export: function( target ) {
    Gibber.Utilities.export( target )
    target.Pattern = Gibber.Pattern 
    target.Score = Gibber.Score
    target.Euclid = Gibber.Euclid

    if( Gibber.Audio ) {
      $.subscribe( 'audio.init', function( audio ) {
        var __clear = Gibber.clear
        audio.export( target )
        Gibber.clear = __clear
      })
    }
    
    if( Gibber.Graphics ) {
      Gibber.Graphics.export( target )
    }
    
    if( Gibber.Interface ) {
      Gibber.Interface.export( target )
    }
    
    if( Gibber.Communication ) { 
      Gibber.Communication.export( target )
    }
  },
  
  init: function( _options, __$ ) {
      if( __$ !== undefined ) $ = __$

      if( typeof window === 'undefined' ) { // check for node.js
        window = GLOBAL // is this a good idea? makes a global window available in all files required in node
        document = GLOBAL.document = false
      }else if( typeof GLOBAL !== 'undefined' ) { // I can't remember why I put this in there...
        if( !GLOBAL.document ) document = GLOBAL.document = false
      }
      
      var options = {
        globalize: true,
        canvas: null,
        target: window,
        graphicsMode:'3d',
        callback: null
      }
      
      if( typeof _options === 'function' ) 
        options.callback = _options
      else if( typeof _options === 'object' ) 
        $.extend( options, _options )
      
      Gibber.Pattern = Gibber.Pattern( Gibber )
      if( Gibber.Audio ) {
        var _export = Gibber.export.bind( Gibber )
        var __clear__ = Gibber.clear
        $.extend( Gibber, Gibber.Audio )
        Gibber.clear = __clear__

        Gibber.export = _export
        //Gibber.Audio.export( Gibber )
        var __save = options.callback
        options.callback = function() {
          //Gibber.Audio.export( Gibber )
          if( __save !== null ) __save()
        }
        Gibber.Audio.init( options.callback, Gibber.dollar ) 
      
        //if( options.globalize ) {
          //options.target.Master = Gibber.Audio.Master    
        //}else{

        //}        
        _export( options.target )
      }
      
      if( Gibber.Graphics ) {
        // this happens dynamically when a graphics object is first created to save CPU
        // Gibber.Graphics.init( options.graphicsMode ) 
      }
      
      if( Gibber.Interface ) {}
      
      if( options.globalize ) {
        Gibber.export( options.target )
      }
      
      options.target.$ = $ // TODO: geez louise
            
      Gibber.Utilities.init()
      
      // Gibber.isInstrument = true
  },
  // interfaceIsReady : function() {
  //   if( !Gibber.started ) {
  //     if( typeof Gibber.Audio.context.currentTime !== 'undefined' ) {
  //       Gibber.started = true
  //       if( Gibber.isInstrument ) eval( loadFile.text )
  //     }
  //   }
  // },
  Modules : {},
 	import : function( path, exportTo, shouldSave ) {
    // XXX should be replaced with a Promise
    var _done = null
    console.log( 'Loading module ' + path + '...' )

    if( path.indexOf( 'http:' ) === -1 ) { 
      //console.log( 'loading via post', path )
      $.post(
        Gibber.Environment.SERVER_URL + '/gibber/'+path, {},
        function( d ) {
          d = JSON.parse( d )
                              
          var f = new Function( 'return ' + d.text )
          
          Gibber.Modules[ path ] = f()
          
          if( exportTo && Gibber.Modules[ path ] ) {
            $.extend( exportTo, Gibber.Modules[ path ] )
            //Gibber.Modules[ path ] = exportTo
          }
          if( Gibber.Modules[ path ] ) {
            if( typeof Gibber.Modules[ path ].init === 'function' ) {
              Gibber.Modules[ path ].init()
            }
            if( typeof Gibber.Modules[ path ] === 'object' ) {
              Gibber.Modules[ path ].moduleText = d.text
            }
            console.log( 'Module ' + path + ' is now loaded.' )
          }else{
            console.log( 'Publication ' + path + ' is loaded. It may not be a valid module.')
          }
          
          if( _done !== null ) { _done( Gibber.Modules[ path ] ) }

          return false;
        }
      )
    }else{
      var script = document.createElement( 'script' )
      script.src = path
      
      script.onload = function () {
        console.log( 'Module ' + path + ' is now loaded.' )
        if( _done !== null ) { _done() }
      };

      document.head.appendChild( script )
    }
    return { done: function( fcn ) { _done =  fcn } }
 	}, 

  loadText: function( path ) {
    var _done = null
    console.log( 'Loading text ' + path + '....' )

    $.post(
      Gibber.Environment.SERVER_URL + '/gibber/'+path, {},
      function( d ) {
        var json = JSON.parse( d ) 
        if( _done ) { _done( json.text ) }
      }
    )
    return { done: function( fcn ) { _done = fcn } }
  }, 
  
  // log: function( msg ) { 
  //   //console.log( "LOG", typeof msg )
  //   if( typeof msg !== 'undefined' ) {
  //     if( typeof msg !== 'function') {
  //       console.log( msg )
  //     }else{
  //       console.log( 'Function' )
  //     }
  //   }
  // },
  
  scriptCallbacks: [],
  
  run: function( script, pos, cm ) { // called by Gibber.Environment.Keymap.modes.javascript
		var _start = pos.start ? pos.start.line : pos.line,
				tree
    
	  try{
			tree = Gibber.Esprima.parse(script, { loc:true, range:true} )
		}catch(e) {
			console.error( "Parse error on line " + ( _start + e.lineNumber ) + " : " + e.message.split(':')[1] )
			return
		}
    
    // must wrap i with underscores to avoid confusion in the eval statement with commands that use proxy i
    for( var __i__ = 0; __i__ < tree.body.length; __i__++ ) {
      var obj = tree.body[ __i__ ],
					start = { line:_start + obj.loc.start.line - 1, ch: obj.loc.start.column },
					end   = { line:_start + obj.loc.end.line - 1, ch: obj.loc.end.column },
				  src   = cm.getRange( start, end ),
          result = null
			
			//console.log( start, end, src )
			try{
				result = eval( src )
        if( typeof result !== 'function' ) {
          log( result )
        }else{
          log( 'Function' )
        }
			}catch( e ) {
				console.error( "Error evaluating expression beginning on line " + (start.line + 1) + '\n' + e.message )
			}
      
      if( this.scriptCallbacks.length > 0 ) {
        for( var ___i___ = 0; ___i___ < this.scriptCallbacks.length; ___i___++ ) {
          this.scriptCallbacks[ ___i___ ]( obj, cm, pos, start, end, src, _start )
        }
      }
    }
  },
  
  processArguments: function(args, type) {    
    var obj
    
    if( args.length ) {
      if( typeof args[0] === 'string' && type !== 'Drums' && type !== 'XOX' ) {
        obj = Gibber.getPreset( args[0], type )
        
        if( typeof args[1] == 'object' ) {
          $.extend( obj, args[ 1 ] )
        }
        return obj
      }
      return Array.prototype.slice.call(args, 0)
    }
    
    return obj
  },
  
  processArguments2 : function(obj, args, type) {
    if( args.length ) {
      var firstArg = args[ 0 ]
    
      if( typeof firstArg === 'string' && type !== 'Drums' && type !== 'XOX' && type !== 'Shader' ) {
        preset = Gibber.getPreset( args[0], type )
      
        if( typeof args[1] === 'object' ) {
          $.extend( preset, args[ 1 ] )
        }
      
        $.extend( obj, preset )
        
        //if( obj.presetInit ) obj.presetInit() 
      }else if( $.isPlainObject( firstArg ) && typeof firstArg.type === 'undefined' ) {
        $.extend( obj, firstArg )
      }else{
        var keys = Object.keys( obj.properties )
                
        if( obj.type === 'FX' ) {
          for( var i = 0; i < args.length; i++ ) { obj[ keys[ i + 1 ] ] = args[ i ] }
        }else{
          for( var i = 0; i < args.length; i++ ) { obj[ keys[ i ] ] = args[ i ] }
        }
        
      }
    }      
  },
    
  getPreset: function( presetName, ugenType ) {
    var obj = {}
    
    if( Gibber.Presets[ ugenType ] ) {
      if( Gibber.Presets[ ugenType ][ presetName ] ) {
        obj = Gibber.Presets[ ugenType ][ presetName ]
      }else{
        Gibber.log( ugenType + ' does not have a preset named ' + presetName + '.' )
      }
    }else{
      Gibber.log( ugenType + ' does not have a preset named ' + presetName + '.' )
    }
    
    return obj
  },
  
  clear : function() {
    var args = Array.prototype.slice.call( arguments, 0 )
    if( Gibber.Audio ) Gibber.Audio.clear.apply( Gibber.Audio, args );
    
    if( Gibber.Graphics ) {
      Gibber.Graphics.clear( Gibber.Graphics, args )
    }

    //Gibber.proxy( window, [ a ] )
    Gibber.proxy( window )
		
    $.publish( '/gibber/clear', {} )
        
    console.log( 'Gibber has been cleared.' )
  },
  
  singleton: function( lt, target ) {
    if( !target ) target = window 
    
    if( $.isArray( lt ) ) {
      for( var i = 0; i < lt.length; i++ ) {
        Gibber.singleton( lt[ i ], target )
      }
      return
    }
    
    if( typeof target[ lt ] !== 'undefined' ) { //&& arguments[1].indexOf( window[ lt ] ) === -1 ) { 
      delete target[ lt ] 
      delete target[ '___' + lt ]
    }

		var ltr = lt;
  
		Object.defineProperty( target, ltr, {
      configurable: true,
			get:function() { return target[ '___'+ltr] },
			set:function( newObj ) {
        if( newObj ) {
          if( target[ '___'+ltr ] ) { 
            if( typeof target[ '___'+ltr ].replaceWith === 'function' ) {
              target[ '___'+ltr ].replaceWith( newObj )
              console.log( target[ '___'+ltr ].name + ' was replaced with ' + newObj.name )
            }
          }
          target[ '___'+ltr ] = newObj
        }else{
				  if( target[ '___'+ltr ] ) {
				  	 var variable = target[ '___'+ltr ]
				  	 if( variable ) {
				  		 if( typeof variable.kill === 'function' /*&& target[ '___'+ltr ].destinations.length > 0 */) {
				  			 variable.kill();
				  		 }
				  	 }
				  }
        }
      }
    });
  },
  proxy: function( target ) {
		var letters = "abcdefghijklmnopqrstuvwxyz"
    
		for(var l = 0; l < letters.length; l++) {

			var lt = letters.charAt(l);
      Gibber.singleton( lt, target )
      
    }
  },

  construct: function( constructor, args ) {
    function F() {
      return constructor.apply( this, args );
    }
    F.prototype = constructor.prototype;
    return new F();
  },

  createMappingObject : function(target, from) {
    var min = typeof target.min === 'function' ? target.min() : target.min,
        max = typeof target.max === 'function' ? target.max() : target.max,
        _min = typeof from.min === 'function' ? from.min() : from.min,
        _max = typeof from.max === 'function' ? from.max() : from.max
    
    if( typeof from.object === 'undefined' && from.Value) { // if using an interface object directly to map
      from = from.Value
    }
    
    if( typeof target.object[ target.Name ].mapping !== 'undefined') {
      target.object[ target.Name ].mapping.replace( from.object, from.propertyName, from.Name )
      return
    }
    
    if( typeof from.targets !== 'undefined' ) {
      if( from.targets.indexOf( target ) === -1 ) from.targets.push( [target, target.Name] )
    }
    
    var fromTimescale = from.Name !== 'Out' ? from.timescale : 'audioOut' // check for audio Out, which is a faux property
        
    mapping = Gibber.mappings[ target.timescale ][ fromTimescale ]( target, from )
    
    //target.object[ target.name ].toString = function() { return '> continuous mapping: ' + from.name + ' -> ' + target.name }
    
    Object.defineProperties( target.object[ target.Name ], {
      'min' : {
        configurable:true,
        get : function() { return min },
        set : function(v) { min = v;  target.object[ target.Name ].mapping.outputMin = min }
      },
      'max' : {
        configurable:true,
        get : function() { return max },
        set : function(v) { max = v; target.object[ target.Name ].mapping.outputMax = max }
      },
    })
    
    target.object[ target.Name ].mappingObjects = []
    
    Gibber.createProxyProperty( target.object[ target.Name ], 'min', 1, 0, {
      'min':min, 'max':max, output: target.output,
      timescale: target.timescale,
      dimensions:1
    })
    
    Gibber.createProxyProperty( target.object[ target.Name ], 'max', 1, 0, {
      'min':min, 'max':max, output: target.output,
      timescale: target.timescale,
      dimensions:1
    })
    
    Object.defineProperties( from.object[ from.Name ], {
      'min' : {
        configurable:true,
        get : function() { return _min },
        set : function(v) { _min = v; target.object[ target.Name ].mapping.inputMin = _min }
      },
      'max' : {
        configurable:true,
        get : function() { return _max },
        set : function(v) { _max = v; target.object[ target.Name ].mapping.inputMax = _max }
      },
    })
    
    target.object[ target.Name ].invert = function() {
      target.object[ target.Name ].mapping.invert()
    }
    
    if( typeof target.object.mappings === 'undefined' ) target.object.mappings = []
    
    target.object.mappings.push( mapping )
    
    if( typeof from.object.mappings === 'undefined' ) from.object.mappings = []
    
    from.object.mappings.push( mapping )
    
    Gibber.defineSequencedProperty( target.object[ target.Name ], 'invert' )
        
    return mapping
  },
  
  defineSequencedProperty : function( obj, key, priority ) {
    var fnc = obj[ key ], seqNumber, seqNumHash = {}, seqs = {}
    
    /* 
      seqNumHash is used to store a unique id number in the Seq objects seq array
      that is accessed via the property name and sequence number
    */

    if( !obj.seq && Gibber.Audio ) {
      obj.seq = Gibber.Audio.Seqs.Seq({ doNotStart:true, scale:obj.scale, priority:priority, target:obj }) 
    }
    
    //seqs = obj.seq.seqs
    
    fnc.score = function( v,d,n ) {
      return function() {
        fnc.seq( v,d,n )
      }
    }
    obj[ key +'_' ] = function() {
      var args = Array.prototype.slice.call( arguments, 0 )

      var out = function() {
        fnc.apply( obj, args )
      }

      return out
    }
    
    fnc.seq = function( _v,_d, seqNumberForKey ) {
      var seq, uniqueSeqID, autofire = false
      if( typeof _v === 'string' && ( obj.name === 'Drums' || obj.name === 'XOX' || obj.name === 'Ensemble' )) {
        _v = _v.split('')
        if( typeof _d === 'undefined' ) _d = 1 / _v.length
      }else if( typeof _d === 'undefined' ) {
        autofire = true
      }
      
      if( typeof obj.seq === 'function' ) {
        obj.seq = obj.object.seq // cube.position etc. TODO: Fix this hack!
      }
      
      seqs = obj.seq.seqs
      
      var v = $.isArray(_v) ? _v : [_v],
          d = $.isArray(_d) ? _d : typeof _d !== 'undefined' ? [_d] : null,
          valuesPattern = Gibber.construct( Gibber.Pattern, v ),
          durationsPattern = Gibber.construct( Gibber.Pattern, d ),
          args = {
            'key': key,
            values: [ valuesPattern ],
            durations: d !== null ? [ durationsPattern ] : null,
            target: obj,
            'priority': priority
          }
      
      valuesPattern.patternName = key + '_values'
      durationsPattern.patternName = key + '_durations'

      if( typeof seqNumberForKey === 'undefined' ) seqNumberForKey = 0 // _num++
      
      if( typeof seqNumHash[ key ] === 'undefined' ) seqNumHash[ key ] = []
      
      uniqueSeqID = seqNumHash[ key ][ seqNumberForKey ] //seqs[  ]
      
      var shouldSplice = -1
      
      // // TODO: what about scheduling chords through multiple autofire note sequences?
      // if( !autofire ) { // check and make sure autofire doesn't exist for this key
      //   for( var i = obj.seq.autofire.length - 1; i > 0; i-- ) {
      //     var autofireSeq = obj.seq.autofire[ i ]
      //     if( autofireSeq.key === key ) {
      //       obj.seq.autofire.splice( i, 1 )
      //       break;
      //     }
      //   }
      // }
      //console.log( "HASH", uniqueSeqID, "numhash", seqNumHash[ key ] )
      if( typeof uniqueSeqID !== 'undefined' && typeof seqs[ uniqueSeqID ] !== 'undefined' ) {
        shouldSplice = uniqueSeqID
      }
            
      if( v.randomFlag ) {
        valuesPattern.filters.push( function() {
          var idx = Gibber.Utilities.rndi(0, valuesPattern.values.length - 1)
          return [ valuesPattern.values[ idx ], 1, idx ] 
        })
        for( var i = 0; i < v.randomArgs.length; i+=2 ) {
          valuesPattern.repeat( v.randomArgs[ i ], v.randomArgs[ i + 1 ] )
        }
      }

      if( d !== null ) {
        if( d.randomFlag ) {
          durationsPattern.filters.push( function() { 
            var idx = Gibber.Utilities.rndi(0, durationsPattern.values.length - 1)
            return [ durationsPattern.values[ idx ], 1, idx ] 
          })
          for( var i = 0; i < d.randomArgs.length; i+=2 ) {
            durationsPattern.repeat( d.randomArgs[ i ], d.randomArgs[ i + 1 ] )
          }
        }
        
        durationsPattern.seq = obj.seq
      }
      
      valuesPattern.seq = obj.seq
      
      //console.log( "SHOULD SPLICE", shouldSplice )
      if( shouldSplice > -1 ) {        
        var old = autofire ? obj.seq.autofire.splice( shouldSplice, 1 )[0] : seqs.splice( shouldSplice, 1 )[ 0 ]
        for( var timestamp in obj.seq.timeline ) {
          var timelinePos = obj.seq.timeline[ timestamp ],
              idx = timelinePos.indexOf( old )
          
          if( idx > -1 ) {
            timelinePos.splice( idx, 1 )
          }
        }
        obj.seq.add( args, shouldSplice )
      }else{
        // var old = autofire ? obj.seq.autofire.splice( shouldSplice, 1 )[0] : seqs.splice( shouldSplice, 1 )[ 0 ]
        // for( var timestamp in obj.seq.timeline ) {
        //   var timelinePos = obj.seq.timeline[ timestamp ],
        //       idx = timelinePos.indexOf( old )
        //
        //   if( idx > -1 ) {
        //     timelinePos.splice( idx, 1 )
        //   }
        // }
        obj.seq.add( args )
        uniqueSeqID = obj.seq.seqs.length - 1
      }
      
      if( !autofire )
        seqNumHash[ key ][ seqNumberForKey ] = uniqueSeqID
      
      //console.log( "HASH NUMBER", uniqueSeqID, "SEQ NUMBER", seqNumberForKey )
      fnc[ seqNumberForKey ] = {}
      
      Object.defineProperties( fnc[ seqNumberForKey ], {
        values: {
          configurable:true,
          get: function() { 
            return valuesPattern
            /*
            if( d !== null ) { // then use autofire array
              return obj.seq.seqs[ seqNumber ].values[0]
            }else{
              return obj.seq.autofire[ seqNumber ].values[0]
            }*/
          },
          set: function( val ) {
            var pattern = Gibber.construct( Gibber.Pattern, val )
            
            if( !Array.isArray( pattern ) ) {
              pattern = [ pattern ]
            }

            if( d !== null ) {
              obj.seq.seqs[ uniqueSeqID ].values = pattern
            }else{
              obj.seq.autofire[ uniqueSeqID ].values = pattern
            }
          }
        },
        durations: {
          configurable:true,
          get: function() { 
            /*if( d !== null ) { // then it's not an autofire seq
              return obj.seq.seqs[ seqNumber ].durations[ 0 ] 
            }else{
              return null
            }*/
            return durationsPattern
          },
          set: function( val ) {
            if( !Array.isArray( val ) ) {
              val = [ val ]
            }
            //obj.seq.seqs[ seqNumber ].durations = val   //.splice( 0, 10000, v )
            var pattern = Gibber.construct( Gibber.Pattern, val )
            
            if( !Array.isArray( pattern ) ) {
              pattern = [ pattern ]
            }
            
            obj.seq.seqs[ uniqueSeqID ].durations = pattern   //.splice( 0, 10000, v )
          },
        },
      })
      
      fnc[ seqNumberForKey ].seq = function( v, d ) {
        fnc.seq( v,d,seqNumberForKey ) 
      }
      
      if( !obj.seq.isRunning ) {
        obj.seq.offset = Gibber.Clock.time( obj.offset )
        obj.seq.start( true, priority )
      }
            
      fnc.seq.stop = function() {
        var seqNumbersForKey = seqNumHash[ key ]
        
        for( var i = 0; i < seqNumbersForKey.length; i++ ) {
          var _num = seqNumbersForKey[ i ],
              _seq = seqs[ _num ]
          
          _seq.shouldStop = true
        }
      }
      
      fnc[ seqNumberForKey ].stop = function() {
        seqs[ uniqueSeqID ].shouldStop = true
      }
      
      // TODO: property specific stop/start/shuffle etc. for polyseq
      fnc.seq.start = function() {
        var seqNumbersForKey = seqNumHash[ key ]
        
        for( var i = 0; i < seqNumbersForKey.length; i++ ) {
          var _num = seqNumbersForKey[ i ],
              _seq = seqs[ _num ]
          
          _seq.shouldStop = false
          
          if( ! obj.seq.timeline[0] ) obj.seq.timeline[0] = []
          obj.seq.timeline[0].push( _seq )

          obj.seq.nextTime = 0
        }

        if( !obj.seq.isRunning ) { 
          obj.seq.start( false, priority )
        }
      }
      
      fnc[ seqNumberForKey ].start = function() {
        var _seq = seqs[ uniqueSeqID ]
        _seq.shouldStop = false
        
        obj.seq.timeline[0] = [ _seq ]
        obj.seq.nextTime = 0
      
        if( !obj.seq.isRunning ) { 
          obj.seq.start( false, priority )
        }
        seqs[ uniqueSeqID ].shouldStop = false
      }
  
      fnc.seq.repeat = function( numberOfTimes ) {
        var repeatCount = 0
      
        var filter = function( args, ptrn ) {
          if( args[2] % (ptrn.getLength() - 1) === 0 && args[2] !== 0) {
            repeatCount++
            if( repeatCount === numberOfTimes ) {
              ptrn.seq.stop()
            }
          }
          return args
        }
      
        fnc.values.filters.push( filter )
      }
    
      fnc[ seqNumberForKey ].score = function( __v__, __d__ ) {
        return fnc.seq.bind( obj, __v__, __d__, seqNumberForKey )
      }
    
      Object.defineProperties( fnc, {
        values: { 
          configurable: true,
          get: function() { return fnc[ seqNumberForKey ].values },
          set: function( val ) { return fnc[ seqNumberForKey ].values = val },
        },
        durations: { 
          configurable: true,
          get: function() { return fnc[ seqNumberForKey ].durations },
          set: function( val ) { return fnc[ seqNumberForKey ].durations = val },
        }
      })
      
      // console.log( key, fnc.values, fnc.durations )
      return obj
    }
  },
  
  defineRampedProperty : function( obj, _key ) {
    var fnc = obj[ _key ], key = _key.slice(1), cancel
    
    fnc.ramp = function( from, to, length ) {
      if( arguments.length < 2 ) {
        console.err( 'ramp requires at least two arguments: target and time.' )
        return
      }
      
      if( typeof length === 'undefined' ) { // if only to and length arguments
        length = to
        to = from
        from = obj[ key ]()
      }
      
      if( cancel ) cancel()
      
      if( typeof from !== 'object' ) {
        obj[ key ] = Line( from, to, length )
      }else{
        from.retrigger( to, Gibber.Clock.time( length ) )
      }
      
      cancel = future( function() {
        obj[ key ] = to
      }, length )
      
      return obj
    }
  },
  
  createProxyMethods : function( obj, methods, priority ) {
    for( var i = 0; i < methods.length; i++ ) Gibber.defineSequencedProperty( obj, methods[ i ], priority ) 
  },
  
  defineProperty : function( obj, propertyName, shouldSeq, shouldRamp, mappingsDictionary, shouldUseMappings, priority, useOldGetter ) {
    var originalValue = typeof obj[ propertyName ] === 'object' ? obj[ propertyName ].valueOf() : obj[ propertyName ],
        Name = propertyName.charAt( 0 ).toUpperCase() + propertyName.slice( 1 ),
        property = function( v ) {
          var returnValue = property
          
          if( typeof v !== 'undefined' ) { 
            //obj[ propertyName ] = v
            //property.value = v
            if( property.oldSetter ) {
              property.oldSetter.call( obj, v )
            }else{
              obj[ propertyName ] = v
            }  
            
            returnValue = obj
          }
          
          return returnValue
        }

    // TODO: get rid of this line
    mappingsDictionary = shouldUseMappings ? mappingsDictionary || obj.mappingProperties[ propertyName ] : null
    
    $.extend( property, mappingsDictionary )
    
    $.extend( property, {
      'propertyName': propertyName, // can't redfine 'name' on a function, unless we eval or something...
      'Name':   Name,  
      value:    originalValue,
      type:     'property',
      object:   obj,
      targets:  [],
      valueOf:  function() { return property.value },
      toString: function() { 
        var output = ""
        if( typeof property.value === 'object' ) {
          output = property.value.toString()
        }else{
          output = property.value
        }
        return output
      },
      oldSetter: obj.__lookupSetter__( propertyName ),
      oldGetter: obj.__lookupGetter__( propertyName ),      
      oldMappingObjectGetter: obj.__lookupGetter__( Name ),
      oldMappingObjectSetter: obj.__lookupSetter__( Name )
    })
    
    Object.defineProperty( obj, propertyName, {
      configurable:true,
      get: function(){ 
        // var returnValue = property
        // if( useOldGetter ) {
        //   console.log( property.oldGetter )
        //   returnValue = property.oldGetter()
        // }
        // else if( property.oldMappingObjectGetter ) {
        //   return property.oldMappingObjectGetter()
        // }
        // return returnValue || property
        return property
      },
      set: function( v ){
        if( (typeof v === 'function' || typeof v === 'object' && v.type === 'mapping') && ( v.type === 'property' || v.type === 'mapping' ) ) {
          Gibber.createMappingObject( property, v )
        }else{
          if( shouldUseMappings && obj[ property.Name ] ) {
            if( typeof obj[ property.Name ].mapping !== 'undefined' ) { 
              if( obj[ property.Name ].mapping.remove ) obj[ property.Name ].mapping.remove( true )
            }
          }
          
          var newValue = v
        
          if( property.oldSetter ) {
            var setterResult = property.oldSetter.call( obj, v )
            if( typeof setterResult !== 'undefined' ) { newValue = setterResult }
          }
          
          property.value = newValue
        }
        
        return obj
      }
    })
    
    if( shouldSeq  ) Gibber.defineSequencedProperty( obj, propertyName, priority )
    if( shouldRamp ) Gibber.defineRampedProperty( obj, propertyName )
    
    // capital letter mapping sugar
    if( shouldUseMappings ) {
      Object.defineProperty( obj, property.Name, {
        configurable: true,
        get : function()  {
          if( typeof property.oldMappingObjectGetter === 'function' ) property.oldMappingObjectGetter()
          return property
        },
        set : function( v ) {
          obj[ property.Name ] = v
          if( typeof mapping.oldMappingObjectSetter === 'function' ) mapping.oldMappingObjectSetter( v )
        }
      })
    }
  },
                                 //obj, propertyName, shouldSeq, shouldRamp, mappingsDictionary, shouldUseMappings, priority, useOldGetter
  createProxyProperty: function( obj, _key, shouldSeq, shouldRamp, dict, _useMappings, priority ) {
    _useMappings = _useMappings === false ? false : true
    
    Gibber.defineProperty( obj, _key, shouldSeq, shouldRamp, dict, _useMappings, priority )
    if( dict && dict.perNote ) { 
      Gibber.defineProperty( obj, _key+'V', shouldSeq, shouldRamp, dict, _useMappings, priority )
    }
  },
  
  // obj, _key, shouldSeq, shouldRamp, dict, _useMappings, priority
  createProxyProperties : function( obj, mappingProperties, noSeq, noRamp ) {
    var shouldSeq = typeof noSeq === 'undefined' ? true : noSeq,
        shouldRamp = typeof noRamp === 'undefined' ? true : noRamp
    
    obj.gibber = true // keyword identifying gibber object, needed for notation parser    
    
    obj.mappingProperties = mappingProperties
    obj.mappingObjects = []
        
    for( var key in mappingProperties ) {
      if( ! mappingProperties[ key ].doNotProxy ) {
        Gibber.createProxyProperty( obj, key, shouldSeq, shouldRamp, mappingProperties[ key ] )
      }
    }
  },  
}

Gibber.Utilities = require( './utilities' )( Gibber )
// Gibber.Audio     = require( 'gibber.audio.lib/scripts/gibber/audio' )( Gibber )
// Gibber.Graphics  = require( 'gibber.graphics.lib/scripts/gibber/graphics/graphics' )( Gibber )
// Gibber.Interface = require( 'gibber.interface.lib/scripts/gibber/interface/interface' )( Gibber )
Gibber.mappings  = require( './mappings' )( Gibber )
Gibber.Euclid = require( './euclidean' )( Gibber )
// TODO: Make Score work without requiring audio
// Gibber.Score     = require( './score' )//( Gibber ) // only initialize once Gibber.Audio.Core is loaded, otherwise problems

module.exports = Gibber

})()

},{"./dollar":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/gibber.core.lib/scripts/dollar.js","./euclidean":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/gibber.core.lib/scripts/euclidean.js","./mappings":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/gibber.core.lib/scripts/mappings.js","./pattern":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/gibber.core.lib/scripts/pattern.js","./utilities":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/gibber.core.lib/scripts/utilities.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/gibber.core.lib/scripts/mappings.js":[function(require,module,exports){
module.exports = function( Gibber ) {  
  var mappings = {
    audio : {
      graphics: function( target, from ) {
				if( typeof from.object.track === 'undefined' ) from.object.track = {}
				
        var proxy = typeof from.object.track[ from.propertyName ] !== 'undefined' ? from.object.track[ from.propertyName ] : new Gibber.Audio.Core.Proxy2( from.object, from.propertyName ),
            op    = new Gibber.Audio.Core.OnePole({ a0:.005, b1:.995 }),
            mapping
        
        from.object.track = proxy;

        mapping = target.object[ target.Name ].mapping = Gibber.Audio.Core.Binops.Map( proxy, target.min, target.max, from.min, from.max, target.output, from.wrap ) 
        
        op.input = mapping
        
        target.object[ target.propertyName ] = op
        
        mapping.proxy = proxy
        mapping.op = op
        
        mapping.remove = function( doNotSet ) {
          if( !doNotSet ) {
            target.object[ target.propertyName ] = target.object[ target.Name ].mapping.getValue()
          }
          
          delete target.object[ target.Name ].mapping
        }
        
        return mapping
      },
      interface: function( target, from ) {
        // TODO: why does the proxy track from.name instead of from.propertyName? maybe because interface elements don't get passed to mapping init?
        // console.log( "Making mapping : ", from.object, from, from.propertyName, target.propertyName )
        var proxy = typeof from.track !== 'undefined' ? from.track : new Gibber.Audio.Core.Proxy2( from.object, from.propertyName ),
            op    = new Gibber.Audio.Core.OnePole({ a0:.005, b1:.995 }),
            range = target.max - target.min,
            percent = ( target.object[ target.propertyName ] - target.min ) / range,
            widgetValue = from.min + ( ( from.max - from.min ) * percent ),
            mapping
        
        if( from.object.setValue ) from.object.setValue( widgetValue )
        
        from.track = proxy
        
        mapping = target.object[ target.Name ].mapping = Gibber.Audio.Core.Binops.Map( proxy, target.min, target.max, from.min, from.max, target.output, from.wrap ) 
        
        op.input = mapping
        target.object[ target.propertyName ] = op
        
        mapping.proxy = proxy
        mapping.op = op

        mapping.remove = function( doNotSet ) {
          if( !doNotSet ) target.object[ target.propertyName ] = mapping.getValue()
          
          //if( mapping.op ) mapping.op.remove()
          
          delete mapping
        }
        
        if( typeof from.object.label !== 'undefined' ) { 
          var labelString = ''
          for( var i = 0; i < from.targets.length; i++ ) {
            var __target = from.targets[ i ]
            labelString += __target[0].object.name + '.' + __target[1]
            if( i !== from.targets.length - 1 ) labelString += ' & '
          }
          from.object.label = labelString
        }
                
        mapping.replace = function( replacementObject, key, Key  ) {
          proxy.setInput( replacementObject )
          if( replacementObject[ Key ].targets.indexOf( target ) === -1 ) replacementObject[ Key ].targets.push( [target, target.Name] )
        }
        
        return mapping
      },
      audio: function( target, from ) {
        var proxy, mapping
        
        if( typeof from.object.track !== 'undefined' ) {
          proxy = from.object.track
          proxy.count++
        } else {
          proxy = new Gibber.Audio.Core.Proxy2( from.object, from.propertyName )
          proxy.count = 1
        }
        from.object.track = proxy
        
        target.object[ target.propertyName ] = Gibber.Audio.Core.Binops.Map( proxy, target.min, target.max, from.min, from.max )
        
        mapping = target.object[ target.Name ].mapping = target.object[ target.propertyName ] // must call getter function explicitly
        
        mapping.remove = function( doNotSet ) {
          if( !doNotSet ) {
            target.object[ target.propertyName ] = mapping.getValue()
          }
          
          if( mapping.op ) mapping.op.remove()
          
          delete target.object[ target.Name ].mapping
        }
        
        mapping.replace = function( replacementObject, key, Key ) {
          var proxy = new Gibber.Audio.Core.Proxy2( replacementObject, key )
          mapping.input = proxy
          if( replacementObject[ Key ].targets && replacementObject[ Key ].targets.indexOf( target ) === -1 ) {
            replacementObject[ Key ].targets.push( [target, target.Name] )
          }
        }
        
        return mapping
      },
      audioOut : function( target, from ) {
        var mapping
        
        mapping = Gibber.Audio.Core.Binops.Map( null, target.min, target.max, 0, 1, 0 )
        
        target.object[ target.propertyName ] = target.object[ target.Name ].mapping = mapping
        
        if( typeof from.object.track !== 'undefined' ) {
          mapping.follow = from.object.track
          mapping.follow.count++
        } else {
          mapping.follow = new Gibber.Audio.Analysis.Follow({ input:from.object, useAbsoluteValue: true })
          mapping.follow.count = 1
        }
        
        from.object.track = mapping.input = mapping.follow
        
        mapping.remove = function( doNotSet ) {
          if( !doNotSet ) {
            target.object[ target.propertyName ] = target.object[ target.Name ].mapping.getValue()
          }
          
          if( mapping.bus )
            mapping.bus.disconnect()
          
          if( mapping.follow ) {
            mapping.follow.count--
            if( mapping.follow.count === 0) {
              delete from.object.track
              mapping.follow.remove()
            }
          }
          
          delete target.object[ target.Name ].mapping
        }
        
        mapping.replace = function( replacementObject, key, Key  ) {
          mapping.follow.input = replacementObject   
          if( replacementObject[ Key ].targets.indexOf( target ) === -1 ) replacementObject[ Key ].targets.push( [target, target.Name] )            
        }
      
        var env = mapping.follow.bufferSize
        Object.defineProperty( target.object[ target.Name ], 'env', {
          configurable:true,
          get: function() { return env },
          set: function(v) { env = Gibber.Clock.time( v ); mapping.follow.bufferSize = env; }
        })
                
        return mapping
      }
    },
    graphics: {
      graphics: function( target, from ) {
        // rewrite getValue function of Map object to call Map callback and then return appropriate value
        var map = Gibber.Audio.Core.Binops.Map( from.object[ from.propertyName ], target.min, target.max, from.min, from.max, target.output, from.wrap ),
            old = map.getValue.bind( map ),
            mapping
        
        map.getValue = function() {
          //console.log( from.propertyName, from, target.min, target.max, from.min, from.max )
          map.callback( from.object[ from.propertyName ], target.min, target.max, from.min, from.max, target.output, from.wrap )
          return old()
        }
        
        mapping = target.object[ target.Name ].mapping = map
        
        if( target.object.mod ) { // second case accomodates modding individual [0][1][2] properties fo vectors
          target.object.mod( target.propertyName, mapping, '=' )
        }else{
          target.modObject.mod( target.modName, mapping, '=' )
        }
        
        mapping.remove = function() {
          if( target.object.mod ) {
            target.object.removeMod( target.propertyName )
          }else{
            target.modObject.removeMod( target.modName )
          }
          target.object[ target.propertyName ] = target.object[ target.Name ].mapping.getValue()
          
          delete target.object[ target.Name ].mapping
        }
        
        mapping.replace = function( replacementObject, key, Key  ) { mapping.input = replacementObject }
        
        return mapping
      },
      interface: function( target, from ) {
        var _map = Gibber.Audio.Core.Binops.Map( from.object[ from.propertyName ], target.min, target.max, from.min, from.max, target.output, from.wrap ),
            mapping
            
        if( typeof from.object.functions === 'undefined' ) {
          from.object.functions = {}
          from.object.onvaluechange = function() {
            for( var key in from.object.functions ) {
              from.object.functions[ key ]()
            }
          }
        }

        mapping = target.object[ target.Name ].mapping = _map

        target.mapping.from = from
        
        var fcn_name = target.propertyName + ' <- ' + from.object.propertyName + '.' + from.Name

        from.object.functions[ fcn_name ] = function() {
          var val = mapping.callback( from.object[ from.propertyName ], target.min, target.max, from.min, from.max, target.output, from.wrap )
          // target.object[ target.Name ].value = val
          // console.log( target.Name )
          target.object[ target.Name ].oldSetter.call( target.object[ target.Name ], val )
        }
        // from.object.onvaluechange = function() {          
        //   var val = map.callback( this[ from.propertyName ], target.min, target.max, from.min, from.max, target.output, from.wrap )
        //   target.object[ target.propertyName ] = val
        // }
        mapping.replace = function() {
          // var old = from.functions[ target.Name ]
        } 
        
        mapping.remove  = function() {
          console.log( "mapping removed" )
          delete from.object.functions[ fcn_name ]
        } 
        
        if( from.object.setValue ) 
          from.object.setValue( target.object[ target.propertyName ] )
        
        // if( typeof from.object.label !== 'undefined' ) {
        //   from.object.label = target.object.propertyName + '.' + target.Name
        // }
        if( typeof from.object.label !== 'undefined' ) { 
          var labelString = ''
          for( var i = 0; i < from.targets.length; i++ ) {
            var __target = from.targets[ i ]
            labelString += __target[0].object.propertyName + '.' + __target[1]
            if( i !== from.targets.length - 1 ) labelString += ' & '
          }
          from.object.label = labelString
        }
        
        return mapping
      },
      audio: function( target, from ) {
        var mapping
        
        mapping = target.object[ target.Name ].mapping = Gibber.Audio.Core.Binops.Map( null, target.min, target.max, from.min, from.max, target.output, from.wrap )
      
        mapping.follow = typeof from.object.track !== 'undefined' ? from.object.track : new Gibber.Audio.Core.Follow({ input:from.object[ from.propertyName ], useAbsoluteValue: false })
        
        from.object.track = target.object[ target.Name ].mapping.follow
        // assign input after Map ugen is created so that follow can be assigned to the mapping object
        mapping.input = mapping.follow
      
        mapping.bus = new Gibber.Audio.Core.Bus2({ amp:0 }).connect()

        mapping.connect( mapping.bus )
        
        mapping.replace = function( replacementObject, key, Key ) {
          mapping.follow.input = replacementObject            
          if( replacementObject[ Key ].targets.indexOf( target ) === -1 ) replacementObject[ Key ].targets.push( [target, target.Name] )
        }
        
        var env = mapping.follow.bufferSize
        Object.defineProperty( target.object[ target.Name ], 'env', {
          get: function() { return env },
          set: function(v) { env = Gibber.Clock.time( v ); mapping.follow.bufferSize = env; }
        })
        
        if( target.object.mod ) { // second case accomodates modding individual [0][1][2] properties fo vectors
          //console.log( target.object, target.object.mod )
          target.object.mod( target.propertyName, mapping, '=' )
        }else{
          target.modObject.mod( target.modName, mapping, '=' )
        }
        
        mapping.remove = function() {
          this.bus.disconnect()
          
          if( this.follow ) {
            this.follow.count--
            if( this.follow.count === 0) {
              delete from.object.track
              this.follow.remove()
            }
          }

          if( target.object.mod ) {
            target.object.removeMod( target.propertyName )
          }else{
            target.modObject.removeMod( target.modName )
          }
          
          delete target.object[ target.Name ].mapping
        }
        
        return mapping
      },
      audioOut : function( target, from ) {
        if( typeof target.object[ target.Name ].mapping === 'undefined') {
          var mapping = target.object[ target.Name ].mapping = Gibber.Audio.Core.Binops.Map( null, target.min, target.max, 0, 1, 0 )   
          if( typeof from.object.track !== 'undefined' ) {
            mapping.follow = from.object.track
            mapping.follow.count++
          } else {
            mapping.follow = new Gibber.Audio.Core.Follow({ input:from.object })
            mapping.follow.count = 1
          }
          from.object.track = mapping.follow
          
          var env = mapping.follow.bufferSize
          Object.defineProperty( target.object[ target.Name ], 'env', {
            configurable: true,
            get: function() { return env },
            set: function(v) { env = Gibber.Clock.time( v ); mapping.follow.bufferSize = env; }
          })
          
          mapping.input = mapping.follow
          mapping.bus = new Gibber.Audio.Core.Bus2({ amp:0 }).connect()
          mapping.connect( mapping.bus )
        
          mapping.replace = function( replacementObject, key, Key  ) {
            // _console.log( key, replacementObject )
            
            // what if new mapping isn't audio type?
            if ( replacementObject[ Key ].timescale === from.timescale ) {
              var idx = mapping.follow.input[ from.Name ].targets.indexOf( target )
              if( idx >= -1 ) {
                mapping.follow.input[ from.Name ].targets.splice( idx, 1 )
              }
            
              mapping.follow.input = replacementObject   
              if( replacementObject[ Key ].targets.indexOf( target ) === -1 ) replacementObject[ Key ].targets.push( [target, target.Name] )            
            }else{
              mapping.bus.disconnect()
              mapping.follow.remove()
              Gibber.createMappingObject( target, replacementObject )
            }
            
          }
        }else{
          mapping.replace( from.object, from.propertyName, from.Name )
          return mapping
        }
        
        if( target.object.mod ) { // second case accomodates modding individual [0][1][2] properties of vectors
          //console.log( target.object, target.object.mod )
          target.object.mod( target.propertyName, mapping, '=' )
        }else if (target.modObject) {
          target.modObject.mod( target.modName, mapping, '=' )
        }else{
          !function() {
            var _mapping = mapping
            target.object.update = function() { 
              target.object[ target.propertyName ]( _mapping.getValue() )
            }
          }()
          //target.object.mod( target.propertyName, mapping, '=' ) 
        }
        
        //target.object[ target.Name ].mapping = mapping
        
        mapping.remove = function() {
          this.bus.disconnect()
          
          if( this.follow ) {
            this.follow.count--
            if( this.follow.count === 0) {
              delete from.object.track
              this.follow.remove()
            }
          }

          if( target.object.mod ) {
            target.object.removeMod( target.propertyName )
          }else if( target.modObject ) {
            target.modObject.removeMod( target.modName )
          }else{
            //target.object.update = function() {}
          }
          
          target.object.mappings.splice( target.object.mappings.indexOf( mapping ), 1 )
          from.object.mappings.splice( from.object.mappings.indexOf( mapping ), 1 ) 
          
          var targets = target.object[ target.Name ].targets,
              idx = targets.indexOf( mappings )
          
          if( idx !== -1 ) {
            targets.splice( idx, 1 )
          }
          
          delete target.object[ target.Name ].mapping
        }
        return mapping
      }
    },
    notation: {
      graphics: function( target, from ) {
        // rewrite getValue function of Map object to call Map callback and then return appropriate value

        var map = Gibber.Audio.Core.Binops.Map( from.object[ from.propertyName ], target.min, target.max, from.min, from.max, target.output, from.wrap ),
            old = map.getValue.bind( map ),
            mapping
        
        map.getValue = function() {
          map.callback( from.object[ from.propertyName ], target.min, target.max, from.min, from.max, target.output, from.wrap )
          return old()
        }
        
        mapping = target.object[ target.Name ].mapping = map
        
        if( target.object.mod ) { // second case accomodates modding individual [0][1][2] properties fo vectors
          target.object.mod( target.propertyName, mapping, '=' )
        }else{
          target.modObject.mod( target.modName, mapping, '=' )
        }
        
        mapping.remove = function() {
          if( target.object.mod ) {
            target.object.removeMod( target.propertyName )
          }else{
            target.modObject.removeMod( target.modName )
          }
          target.object[ target.propertyName ] = target.object[ target.Name ].mapping.getValue()
          
          delete target.object[ target.Name ].mapping
        }
        
        mapping.replace = function( replacementObject, key, Key  ) { mapping.input = replacementObject }
        
        return mapping
      },
      interface: function( target, from ) {
        // console.log( "FROM", from.propertyName, target.min, target.max, from.min, from.max )
        var _map = Gibber.Audio.Core.Binops.Map( from.object[ from.propertyName ], target.min, target.max, from.min, from.max, target.output, from.wrap ),
            mapping
            
        if( typeof from.object.functions === 'undefined' ) {
          from.object.functions = {}
          from.object.onvaluechange = function() {
            for( var key in from.object.functions ) {
              from.object.functions[ key ]()
            }
          }
        }

        mapping = target.object[ target.Name ].mapping = _map

        target.mapping.from = from
        
        var fcn_name = target.propertyName + ' <- ' + from.object.propertyName + '.' + from.Name

        from.object.functions[ fcn_name ] = function() {
          var val = mapping.callback( from.object[ from.propertyName ], target.min, target.max, from.min, from.max, target.output, from.wrap )
          // target.object[ target.Name ].value = val
          // console.log( target.Name )
          target.object[ target.Name ].oldSetter.call( target.object[ target.Name ], val )
        }
        // from.object.onvaluechange = function() {          
        //   var val = map.callback( this[ from.propertyName ], target.min, target.max, from.min, from.max, target.output, from.wrap )
        //   target.object[ target.propertyName ] = val
        // }
        mapping.replace = function() {
          // var old = from.functions[ target.Name ]
        } 
        
        mapping.remove  = function() {
          console.log( "mapping removed" )
          delete from.object.functions[ fcn_name ]
        } 
        
        if( from.object.setValue ) 
          from.object.setValue( target.object[ target.propertyName ] )
        
        // if( typeof from.object.label !== 'undefined' ) {
        //   from.object.label = target.object.propertyName + '.' + target.Name
        // }
        if( typeof from.object.label !== 'undefined' ) { 
          var labelString = ''
          for( var i = 0; i < from.targets.length; i++ ) {
            var __target = from.targets[ i ]
            labelString += __target[0].object.propertyName + '.' + __target[1]
            if( i !== from.targets.length - 1 ) labelString += ' & '
          }
          from.object.label = labelString
        }
        
        return mapping
      },
      audio: function( target, from ) {
        var mapping
        
        mapping = target.object[ target.Name ].mapping = Gibber.Audio.Core.Binops.Map( null, target.min, target.max, from.min, from.max, target.output, from.wrap )
  
        if( typeof from.object.track !== 'undefined' && from.object.track.input === from.object.properties[ from.propertyName ] ) {
          mapping.follow = from.object.track
          mapping.follow.count++
        }else{
          mapping.follow = new Gibber.Audio.Core.Follow({ input:from.object.properties[ from.propertyName ], useAbsoluteValue: false })
          mapping.follow.count = 1
        }
        
        from.object.track = target.object[ target.Name ].mapping.follow
        
        // assign input after Map ugen is created so that follow can be assigned to the mapping object
        mapping.input = mapping.follow
      
        mapping.bus = new Gibber.Audio.Core.Bus2({ amp:0 }).connect()

        mapping.connect( mapping.bus )
        
        mapping.replace = function( replacementObject, key, Key ) {
          mapping.follow.input = replacementObject            
          if( replacementObject[ Key ].targets.indexOf( target ) === -1 ) replacementObject[ Key ].targets.push( [target, target.Name] )
        }
        
        var env = mapping.follow.bufferSize
        Object.defineProperty( target.object[ target.Name ], 'env', {
          get: function() { return env },
          set: function(v) { env = Gibber.Clock.time( v ); mapping.follow.bufferSize = env; }
        })
        
        mapping.update = function() {   
          target.object[ target.propertyName ]( mapping.getValue() )
        }
        mapping.text = target.object

        // let Notation object handle scheduling updates
        Gibber.Environment.Notation.add( mapping )
        
        mapping.remove = function() {
          this.bus.disconnect()
          
          if( this.follow ) {
            this.follow.count--
            if( this.follow.count === 0) {
              delete from.object.track
              this.follow.remove()
            }
          }
          
          Gibber.Environment.Notation.remove( mapping )
          
          delete target.object[ target.Name ].mapping
        }
        
        return mapping
      },
      audioOut : function( target, from ) {
        if( typeof target.object[ target.Name ].mapping === 'undefined') {
          var mapping = target.object[ target.Name ].mapping = Gibber.Audio.Core.Binops.Map( null, target.min, target.max, 0, 1, 0 )
          
          if( typeof from.object.track !== 'undefined' && from.object.track.input === from.object.properties[ from.propertyName ] ) {
            mapping.follow = from.object.track
            mapping.follow.count++
          }else{
            mapping.follow = new Gibber.Audio.Core.Follow({ input:from.object, useAbsoluteValue: true })
            mapping.follow.count = 1
          }
          
          from.object.track = mapping.follow
          
          var env = mapping.follow.bufferSize
          Object.defineProperty( target.object[ target.Name ], 'env', {
            configurable:true,
            get: function() { return env },
            set: function(v) { env = Gibber.Clock.time( v ); mapping.follow.bufferSize = env; }
          })
          
          mapping.input = mapping.follow
          mapping.bus = new Gibber.Audio.Core.Bus2({ amp:0 }).connect()
          mapping.connect( mapping.bus )
          
          mapping.replace = function( replacementObject, key, Key  ) {            
            // what if new mapping isn't audio type?
            if ( replacementObject[ Key ].timescale === from.timescale ) {
              var idx = mapping.follow.input[ from.Name ].targets.indexOf( target )
              if( idx >= -1 ) {
                mapping.follow.input[ from.Name ].targets.splice( idx, 1 )
              }
            
              mapping.follow.input = replacementObject   
              if( replacementObject[ Key ].targets.indexOf( target ) === -1 ) replacementObject[ Key ].targets.push( [target, target.Name] )            
            }else{
              mapping.bus.disconnect()
              mapping.follow.remove()
              Gibber.createMappingObject( target, replacementObject )
            }
            
          }
        }else{
          mapping.replace( from.object, from.propertyName, from.Name )
          return mapping
        }
        
        mapping.update = function() {   
          target.object[ target.propertyName ]( mapping.getValue() )
        }
        mapping.text = target.object

        // let Notation object handle scheduling updates
        Gibber.Environment.Notation.add( mapping )
        
        mapping.remove = function() {
          this.bus.disconnect()
          
          if( this.follow ) {
            this.follow.count--
            if( this.follow.count === 0) {
              delete from.object.track
              this.follow.remove()
            }
          }
          
          Gibber.Environment.Notation.remove( mapping )
          
          delete target.object[ target.Name ].mapping
        }
        return mapping
      }
    },
  } 
  
  return mappings
}

module.exports.outputCurves= {
  LINEAR:0,
  LOGARITHMIC:1
}
},{}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/gibber.core.lib/scripts/pattern.js":[function(require,module,exports){
module.exports = function( Gibber ) {

"use strict"

var $ = require( './dollar' )

var PatternProto = {
  concat : function( _pattern ) { this.values = this.values.concat( _pattern.values ) },  
  toString: function() { return this.values.toString() },
  valueOf: function() { return this.values },
  getLength: function() {
    var l
    if( this.start <= this.end ) {
      l = this.end - this.start + 1
    }else{
      l = this.values.length + this.end - this.start + 1
    }
    return l
  },
  runFilters : function( val, idx ) {
    var args = [ val, 1, idx ] // 1 is phaseModifier

    for( var i = 0; i < this.filters.length; i++ ) {
      args = this.filters[ i ]( args, this )
    }
    
    return args
  },
  checkForUpdateFunction: function( name, _arguments ) {
    var args = Array.prototype.slice.call( _arguments, 0 )

    if( this.listeners[ name ] ) {
      this.listeners[ name ].apply( this, args )
    }else if( Pattern.listeners[ name ] ) {
      Pattern.listeners[ name ].apply( this, args )
    }
  },
  _onchange : function() {},
}

var Pattern = function() {
  if( ! ( this instanceof Pattern ) ) {
    var args = Array.prototype.slice.call( arguments, 0 )
    return Gibber.construct( Pattern, args )
  }

  var fnc = function() {
    var len = fnc.getLength(),
        idx, val, args
    
    if( len === 1 ) { 
      idx = 0 
    }else{
      idx = fnc.phase > -1 ? Math.floor( fnc.start + (fnc.phase % len ) ) : Math.floor( fnc.end + (fnc.phase % len ) )
    }
    
    val = fnc.values[ Math.floor( idx % fnc.values.length ) ]
    args = fnc.runFilters( val, idx )
    
    fnc.phase += fnc.stepSize * args[ 1 ]
    val = args[ 0 ]
    
    // check to see if value is a function, and if so evaluate it
    if( typeof val === 'function' ) {
      val = val()
    }
    /*else if ( Array.isArray( val ) ) {
      // if val is an Array, loop through array and evaluate any functions found there. TODO: IS THIS SMART?

      for( var i = 0; i < val.length; i++ ){
        if( typeof val[ i ] === 'function' ) {
          val[ i ] = val[ i ]()
        }
      }
    }
    */

    // if pattern has update function, set new value
    if( fnc.update ) fnc.update.value = val
    
    return val
  }
   
  $.extend( fnc, {
    start : 0,
    end   : 0,
    phase : 0,
    values : Array.prototype.slice.call( arguments, 0 ),
    //values : typeof arguments[0] !== 'string' || arguments.length > 1 ? Array.prototype.slice.call( arguments, 0 ) : arguments[0].split(''),    
    original : null,
    storage : [],
    stepSize : 1,
    integersOnly : false,
    filters : [],
    onchange : null,

    range : function() {
      var start, end
      
      if( Array.isArray( arguments[0] ) ) {
        start = arguments[0][0]
        end   = arguments[0][1]
      }else{
        start = arguments[0]
        end   = arguments[1]
      }
      
      if( start < end ) {
        fnc.start = start
        fnc.end = end
      }else{
        fnc.start = end
        fnc.end = start
      }

      this.checkForUpdateFunction( 'range', [ fnc ] )

      return fnc
    },
    
    set: function() {
      var args = Array.isArray( arguments[ 0 ] ) ? arguments[ 0 ] : arguments
      
      fnc.values.length = 0
      
      for( var i = 0; i < args.length; i++ ) {
        fnc.values.push( args[ i ] )
      }
      
      fnc.end = fnc.values.length - 1
      
      // if( fnc.end > fnc.values.length - 1 ) {
      //   fnc.end = fnc.values.length - 1
      // }else if( fnc.end < )
      
      fnc._onchange()
      
      return fnc
    },
     
    reverse : function() { 
      //fnc.values.reverse(); 
      var array = fnc.values,
          left = null,
          right = null,
          length = array.length,
          temporary;
          
      for (left = 0, right = length - 1; left < right; left += 1, right -= 1) {
        temporary = array[left];
        array[left] = array[right];
        array[right] = temporary;
      }
      
      fnc._onchange() 
      
      return fnc;
    },
    // humanize: function( randomMin, randomMax ) {
 //      var lastAmt = 0
 //
 //      for( var i = 0; i < this.filters.length; i++ ) {
 //        if( this.filters[ i ].humanize ) {
 //          lastAmt = this.filters[ i ].lastAmt
 //          this.filters.splice( i, 1 )
 //          break;
 //        }
 //      }
 //
 //      var filter = function( args ) {
 //        console.log( filter.lastAmt, args[0])
 //        args[ 0 ] -= filter.lastAmt
 //        filter.lastAmt = Gibber.Clock.time( Gibber.Utilities.rndi( randomMin, randomMax ) )
 //
 //        console.log( "LA", filter.lastAmt )
 //        args[0] += filter.lastAmt
 //
 //        return args
 //      }
 //      filter.lastAmt = lastAmt
 //      filter.humanize = true
 //
 //      this.filters.push( filter )
 //
 //      return this
 //    },
    repeat: function() {
      var counts = {}
    
      for( var i = 0; i < arguments.length; i +=2 ) {
        counts[ arguments[ i ] ] = {
          phase: 0,
          target: arguments[ i + 1 ]
        }
      }
      
      var repeating = false, repeatValue = null, repeatIndex = null
      var filter = function( args ) {
        var value = args[ 0 ], phaseModifier = args[ 1 ], output = args
        
        //console.log( args, counts )
        if( repeating === false && counts[ value ] ) {
          repeating = true
          repeatValue = value
          repeatIndex = args[2]
        }
        
        if( repeating === true ) {
          if( counts[ repeatValue ].phase !== counts[ repeatValue ].target ) {
            output[ 0 ] = repeatValue            
            output[ 1 ] = 0
            output[ 2 ] = repeatIndex
            //[ val, 1, idx ]
            counts[ repeatValue ].phase++
          }else{
            counts[ repeatValue ].phase = 0
            output[ 1 ] = 1
            if( value !== repeatValue ) { 
              repeating = false
            }else{
              counts[ repeatValue ].phase++
            }
          }
        }
      
        return output
      }
    
      fnc.filters.push( filter )
    
      return fnc
    },
  
    reset : function() { fnc.values = fnc.original.slice( 0 ); fnc._onchange(); return fnc; },
    store : function() { fnc.storage[ fnc.storage.length ] = fnc.values.slice( 0 ); return fnc; },
    transpose : function( amt ) { 
      for( var i = 0; i < fnc.values.length; i++ ) { 
        var val = fnc.values[ i ]
        
        if( $.isArray( val ) ) {
          for( var j = 0; j < val.length; j++ ) {
            if( typeof val[ j ] === 'number' ) {
              val[ j ] = fnc.integersOnly ? Math.round( val[ j ] + amt ) : val[ j ] + amt
            }
          }
        }else{
          if( typeof val === 'number' ) {
            fnc.values[ i ] = fnc.integersOnly ? Math.round( fnc.values[ i ] + amt ) : fnc.values[ i ] + amt
          }
        }
      }
      
      fnc._onchange()
      
      return fnc
    },
    shuffle : function() { 
      Gibber.Utilities.shuffle( fnc.values )
      fnc._onchange()
      
      return fnc
    },
    scale : function( amt ) { 
      for( var i = 0; i < fnc.values.length; i++ ) {
        var val = fnc.values[ i ]
        if( $.isArray( val ) ) {
          for( var j = 0; j < val.length; j++ ) {
            if( typeof val[ j ] === 'number' ) {
              val[ j ] = fnc.integersOnly ? Math.round( val[ j ] * amt ) : val[ j ] * amt
            }
          }
        }else{
          if( typeof val === 'number' ) {
            fnc.values[ i ] = fnc.integersOnly ? Math.round( fnc.values[ i ] * amt ) : fnc.values[ i ] * amt
          }
        }
      }
      fnc._onchange()
      
      return fnc
    },

    flip : function() {
      var start = [],
          ordered = null
    
      ordered = fnc.values.filter( function(elem) {
      	var shouldPush = start.indexOf( elem ) === -1
        if( shouldPush ) start.push( elem )
        return shouldPush
      })
    
      ordered = ordered.sort( function( a,b ){ return a - b } )
    
      for( var i = 0; i < fnc.values.length; i++ ) {
        var pos = ordered.indexOf( fnc.values[ i ] )
        fnc.values[ i ] = ordered[ ordered.length - pos - 1 ]
      }
      
      fnc._onchange()
    
  		return fnc
    },
    
    invert: function() {
      var prime0 = fnc.values[ 0 ]
      
      for( var i = 1; i < fnc.values.length; i++ ) {
        if( typeof fnc.values[ i ] === 'number' ) {
          var inverse = prime0 + (prime0 - fnc.values[ i ])
          fnc.values[ i ] = inverse
        }
      }
      
      fnc._onchange()
      
  		return fnc
    },
  
    switch : function( to ) {
      if( fnc.storage[ to ] ) {
        fnc.values = fnc.storage[ to ].slice( 0 )
      }
      
      fnc._onchange()
      
      return fnc
    },
  
    rotate : function( amt ) {
      if( amt > 0 ) {
        while( amt > 0 ) {
          var end = fnc.values.pop()
          fnc.values.unshift( end )
          amt--
        }
      }else if( amt < 0 ) {
        while( amt < 0 ) {
          var begin = fnc.values.shift()
          fnc.values.push( begin )
          amt++
        }
      }
      
      fnc._onchange()
      
      return fnc
    }
  })
  
  Object.defineProperty( fnc, 'size', {
    get: function() { return this.values.length },
    set: function(v){
      Gibber.log( 'cannot set size of pattern; use pattern.set() to update pattern contents.' )
    }
  })

  fnc.retrograde = fnc.reverse.bind( fnc )
  
  fnc.end = fnc.values.length - 1
  
  fnc.original = fnc.values.slice( 0 )
  fnc.storage[ 0 ] = fnc.original.slice( 0 )
  
  fnc.integersOnly = fnc.values.every( function( n ) { return n === +n && n === (n|0); })
  
  var methodNames =  [
    'rotate','switch','invert','reset', 'flip',
    'transpose','reverse','shuffle','scale',
    'store', 'range', 'set'
  ]

  Gibber.createProxyMethods( fnc, methodNames , true )
  
  // for( var i = 0; i < methodNames.length; i++ ) {
  //  var name = methodNames[ i ]
  //
  //  fnc[ name ].listeners = {}
  //  }
  fnc.listeners = {}

  Gibber.createProxyProperties( fnc, { 'stepSize':0, 'start':0, 'end':0 })
  
  // trying to figure out a way for calls like: a.note.durations.seq( [1/8,1/16], 1/2 ) ...
    
  // future( function() {
  //   fnc._seq = fnc.seq
  //
  //   fnc.seq = function() {
  //     var args = Array.prototype.slice.call( arguments, 0 )
  //
  //     fnc.set.seq.apply( fnc, args )
  //   }
  // }, ms(100) )
  
  
  fnc.__proto__ = this.__proto__ 
  
  return fnc
}

Pattern.listeners = {}
Pattern.prototype = PatternProto

return Pattern

}

},{"./dollar":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/gibber.core.lib/scripts/dollar.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/gibber.core.lib/scripts/utilities.js":[function(require,module,exports){
module.exports = function( Gibber ) {

"use strict"

var soloGroup = [],
    isSoloing = false,
    $ = Gibber.dollar,
    Synths = { Presets: {} },
    Gibberish = Gibber.Audio ? Gibber.Audio.Core : null ,//require( 'gibberish-dsp' ),
    Clock = Gibber.Clock,
    rnd = Math.random,

    Utilities = {
      seq : function() {
        var arg = arguments[0],
            type = typeof arg,
            list = [],
            output = null
    
        if( type === 'object' ) {
          if( Array.isArray( arg ) ) type = 'array'
        }
    
        // switch( type ) {
        //   case 'function':
        //     output = arg
        //     break;
        //   case 'array':
        //     for( var i = 0; i < arg.length; i++ ) {
        //       var elem = arg[ i ]
        //       if( typeof )
        //     }
        //     break;
        //   default: 
        //     output = function() { return arg }
        //     break;
        // }
    
        return output
      },
      random :  function() {
        this.randomFlag = true
        this.randomArgs = Array.prototype.slice.call( arguments, 0 )
        // var dict = {},
        //     lastChosen = null;
        //     
        // for(var i = 0; i < arguments.length; i+=2) {
        //   dict[ "" + arguments[i] ] = { repeat: arguments[i+1], count: 0 };
        // }
        // 
        // this.pick = function() {
        //   var value = 0, index, lastValue;
        //   if(this[lastChosen]) lastValue = this[lastChosen]
        // 
        //   if(lastChosen !== null && dict[ lastValue ].count++ <= dict[ lastValue ].repeat) {
        //     index = lastChosen;
        //     if( dict[ lastValue ].count >= dict[ lastValue ].repeat) {
        //       dict[ lastValue ].count = 0;
        //       lastChosen = null;
        //     };
        //   }else{
        //     index = Utilities.rndi(0, this.length - 1);
        //     value = this[index];
        //     if( typeof dict[ ""+value ] !== 'undefined' ) {
        //       dict[ ""+value ].count = 1;
        //       lastChosen = index;
        //     }else{
        //       lastChosen = null;
        //     }
        //   }
    
        return this
      },
  
      random2 : function() {
        var dict = {},
            lastChosen = null,
            that = this;
    
        for(var i = 0; i < arguments.length; i+=2) {
          dict[ "" + arguments[i] ] = { repeat: arguments[i+1], count: 0 };
        }

        this.pick = function() {
          var value = 0, index, lastValue;
          if(that[lastChosen]) lastValue = that[lastChosen]

          if(lastChosen !== null && dict[ lastValue ].count++ <= dict[ lastValue ].repeat) {
            index = lastChosen;
            if( dict[ lastValue ].count >= dict[ lastValue ].repeat) {
              dict[ lastValue ].count = 0;
              lastChosen = null;
            };
          }else{
            index = Utilities.rndi(0, that.length - 1);
            value = that[index];
            if( typeof dict[ ""+value ] !== 'undefined' ) {
              dict[ ""+value ].count = 1;
              lastChosen = index;
            }else{
              lastChosen = null;
            }
          }
      
        	return that[ index ]; // return index, not value as required by secondary notation stuff
        }
    
        return this.pick
      },
  
      choose: function( length ) {
        var output = null
    
        if( isNaN( length ) ) length = 1
    
        if( length !== 1 ) {
          var arr = []
    
          for( var i = 0; i < length; i++ ) {
            arr[ i ] = this[ Utilities.rndi( 0, this.length - 1 ) ]
          }
      
          output = arr
        }else{
          output = this[ Utilities.rndi( 0, this.length - 1 ) ]
        }
    
      	return output;
      },

      future : function(func, time) { 
        var count = 0
        
        var __seq = Gibber.Audio.Seqs.Seq(
          function() {
            if( count === 1 ) {
              func()
              __seq.stop()
              __seq.disconnect()
            }
            count++
          }, 
          Gibber.Audio.Clock.time( time ) 
        )
    
        return function(){ __seq.stop(); __seq.disconnect(); }
      },
  
      shuffle : function( arr ) {
      	for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
      },
  
      solo : function( ugen ) {
        var args = Array.prototype.slice.call( arguments, 0 );
        if( ugen ) {
          if( isSoloing ) { Utilities.solo(); } // quick toggle on / off
      
          for( var j = 0; j < args.length; j++ ) { // check if user soloed ugen, but fx is actually feeding Master bus
            var arg = args[ j ]
            if( arg.fx.length > 0 ) { 
              args[j] = arg.fx[ arg.fx.length - 1 ] // get last fx in chain
            }
          }
      
          for(var i = 0; i < Master.inputs.length; i++) {
            //console.log( i, Master.inputs[i] )
            var idx = args.indexOf( Master.inputs[i].value ),
                _ugen = Master.inputs[i].value,
                name = _ugen.name
            
            if( idx === -1 ) {
              if( name !== 'polyseq' &&  name !== 'Seq' ) { // TODO: please, please, don't route seqs into master bus...
                Master.inputs[i]._amp = Master.inputs[i].amp
                Master.inputs[i].amp = 0//value = Mul( Master.inputs[i].value, 0 )
                soloGroup.push( Master.inputs[i] );
              }
            }
          }
          isSoloing = true;
        }else{
          for( var i = 0; i < soloGroup.length; i++ ) {
            soloGroup[i].amp = soloGroup[i]._amp
          }
          soloGroup.length = 0
          isSoloing = false;
        } 
      },
      fill : function( length, fnc ) {
        if( isNaN( length ) ) length = 16
        if( typeof fnc !== 'function' ) { fnc = Rndf() }
    
        fnc = fnc.bind( this )
    
        for( var i = 0; i < length; i++ ) {
          this[ i ] = fnc()
        }
    
        return this
      },
      merge : function() {
        var output = []
      	for( var i = 0; i < this.length; i++ ) {
          var arg = this[ i ]
          if( Array.isArray( arg ) ) {
            for( var j = 0; j < arg.length; j++ ) {
      				output.push( arg[ j ] )
            }
          }else{
            output.push( arg )
          }
        }
  
        return output
      },
      weight : function() {
        var weights = Array.prototype.slice.call( arguments, 0 )
        this.pick = function() {
          var returnValue = this[0],
              total = 0,
              _rnd = Utilities.rndf();
  
          for(var i = 0; i < weights.length; i++) {
            total += weights[i];
            if( _rnd < total ) { 
              returnValue = i;
              break;
            }
          }
          return returnValue;
        }
    
      	return this
      },
      gibberArray: function( arr ) {
        
      },
      rndf : function(min, max, number, canRepeat) {
        canRepeat = typeof canRepeat === "undefined" ? true : canRepeat;
      	if(typeof number === "undefined" && typeof min != "object") {
      		if(arguments.length == 1) {
      			max = arguments[0]; min = 0;
      		}else if(arguments.length == 2) {
      			min = arguments[0];
      			max = arguments[1];
      		}else{
      			min = 0;
      			max = 1;
      		}

      		var diff = max - min,
      		    r = Math.random(),
      		    rr = diff * r
	
      		return min + rr;
      	}else{
      		var output = [];
      		var tmp = [];
      		if(typeof number === "undefined") {
      			number = max || min.length;
      		}
		
      		for(var i = 0; i < number; i++) {
      			var num;
      			if(typeof arguments[0] === "object") {
      				num = arguments[0][rndi(0, arguments[0].length - 1)];
      			}else{
      				if(canRepeat) {
      					num = Utilities.rndf(min, max);
      				}else{
                num = Utilities.rndf(min, max);
                while(tmp.indexOf(num) > -1) {
                  num = Utilities.rndf(min, max);
                }
      					tmp.push(num);
      				}
      			}
      			output.push(num);
      		}
      		return output;
      	}
      },
  
      Rndf : function() {
        var _min, _max, quantity, random = Math.random, canRepeat;
    
        if(arguments.length === 0) {
          _min = 0; _max = 1;
        }else if(arguments.length === 1) {
          _max = arguments[0]; _min = 0;
        }else if(arguments.length === 2) {
          _min = arguments[0]; _max = arguments[1];
        }else if(arguments.length === 3) {
          _min = arguments[0]; _max = arguments[1]; quantity = arguments[2];
        }else{
          _min = arguments[0]; _max = arguments[1]; quantity = arguments[2]; canRepeat = arguments[3];
        }    
  
        return function() {
          var value, min, max, range;
    
          min = typeof _min === 'function' ? _min() : _min
          max = typeof _max === 'function' ? _max() : _max
      
          if( typeof quantity === 'undefined') {
            value = Utilities.rndf( min, max )
          }else{
            value = Utilities.rndf( min, max, quantity, canRepeat )
          }
    
          return value;
        }
      },

      rndi : function( min, max, number, canRepeat ) {
        var range;
    
        if(arguments.length === 0) {
          min = 0; max = 1;
        }else if(arguments.length === 1) {
          max = arguments[0]; min = 0;
        }else if( arguments.length === 2 ){
          min = arguments[0]; max = arguments[1];
        }else{
          min = arguments[0]; max = arguments[1]; number = arguments[2]; canRepeat = arguments[3];
        }    
  
        range = max - min
        if( range < number ) canRepeat = true
  
        if( typeof number === 'undefined' ) {
          range = max - min
          return Math.round( min + Math.random() * range );
        }else{
      		var output = [];
      		var tmp = [];
		
      		for(var i = 0; i < number; i++) {
      			var num;
      			if(canRepeat) {
      				num = Utilities.rndi(min, max);
      			}else{
      				num = Utilities.rndi(min, max);
      				while(tmp.indexOf(num) > -1) {
      					num = Utilities.rndi(min, max);
      				}
      				tmp.push(num);
      			}
      			output.push(num);
      		}
      		return output;
        }
      },

      Rndi : function() {
        var _min, _max, quantity, random = Math.random, round = Math.round, canRepeat, range;
    
        if(arguments.length === 0) {
          _min = 0; _max = 1;
        }else if(arguments.length === 1) {
          _max = arguments[0]; _min = 0;
        }else if(arguments.length === 2) {
          _min = arguments[0]; _max = arguments[1];
        }else if(arguments.length === 3) {
          _min = arguments[0]; _max = arguments[1]; quantity = arguments[2];
        }else{
          _min = arguments[0]; _max = arguments[1]; quantity = arguments[2]; canRepeat = arguments[3];
        }  
  
        range = _max - _min
        if( typeof quantity === 'number' && range < quantity ) canRepeat = true
  
        return function() {
          var value, min, max, range;
    
          min = typeof _min === 'function' ? _min() : _min
          max = typeof _max === 'function' ? _max() : _max
    
          if( typeof quantity === 'undefined') {
            value = Utilities.rndi( min, max )
          }else{
            value = Utilities.rndi( min, max, quantity, canRepeat )
          }
    
          return value;
        }
      },
      export : function( target ) {
        target.rndi = Utilities.rndi
        target.rndf = Utilities.rndf
        target.Rndi = Utilities.Rndi
        target.Rndf = Utilities.Rndf
        
        target.future = Utilities.future
        target.solo = Utilities.solo
      },
      init: function() {
        // window.solo = Utilities.solo
        // window.future = Utilities.future // TODO: fix global reference
        Array.prototype.random = Array.prototype.rnd = Utilities.random
        // Array.prototype.weight = Utilities.weight
        // Array.prototype.fill = Utilities.fill
        // Array.prototype.choose = Utilities.choose
        // // Array.prototype.Rnd = Utilities.random2
        // Array.prototype.merge = Utilities.merge
      }
    }
  
  return Utilities
}

},{}],"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/gibberish-dsp/build/gibberish.js":[function(require,module,exports){
(function (global){
!function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof exports === "object") {
    module.exports = factory();
  } else {
  root.Gibberish = factory();
  }
}(this, function () {
/**#Gibberish - Miscellaneous
Gibberish is the main object used to manage the audio graph and perform codegen functions. All constructors are also inside of the Gibberish object. Gibberish can automatically generate an appropriate web audio callback for you; if you want to use this you must execute the Gibberish.init() command before creating any Gibberish ugens.

## Example Usage##
`// make a sine wave  
Gibberish.init();  
a = new Gibberish.Sine().connect();`
## Constructor
**param** *bufferSize*: Integer. Default 1024. The size of the buffer to be calculated. Since JavaScript is single-threaded, setting exceedingly large values for this will yield to stuttering in graphics and user interface performance.
- - - -
**/
/**###Gibberish.audioFiles : property  
Array. Anytime an audiofile is loaded (normally using the Sampler ugen) the resulting sample buffer is stored in this array so that it can be immediately recalled.
**/
/**###Gibberish.callback : property
String. Whenever Gibberish performs code generation the resulting callback is stored here.
**/
/**###Gibberish.out : property
Object. The is the 'master' bus that everything eventually gets routed to if you're using the auto-generated calback. This bus is initialized in the call to Gibberish.init.
**/
/**###Gibberish.dirtied : property
Array. A list of objects that need to be codegen'd
**/
/**###Gibberish.isDirty : property
Booelan. Whether or codegen should be performed.
**/
/**###Gibberish.codeblock : property
Array. During codegen, each ugen's codeblock is inserted into this array. Once all the ugens have codegen'd, the array is concatenated to form the callback.
**/
/**###Gibberish.upvalues : property
Array. Each ugen's callback function is stored in this array; the contents of the array become upvalues to the master callback function when it is codegen'd.
**/
/**###Gibberish.debug : property
Boolean. Default false. When true, the callbackString is printed to the console whenever a codegen is performed
**/
/**###Gibberish.memo : property
Object. Used in the codegen process to make sure codegen for each ugen is only performed once.
**/


var Gibberish = {
  memo              : {},
  codeblock         : [],
  analysisCodeblock : [],
  analysisUgens     : [],
  dirtied           : [],
  id                : 0,
  isDirty           : false,  // whether or not callback needs to codegen'd
  out               : null,   // main output bus
  debug             : false,
  callback          : '',
  audioFiles        : {},
  sequencers        : [],
  callbackArgs      : ['input'], // names of function arguments for main audio callback
  callbackObjects   : [],        // ugen function callbacks used in main audio callback
  analysisCallbackArgs    : [],
  analysisCallbackObjects : [],
  onBlock: null,
/**###Gibberish.createCallback : method
Perform codegen on all dirty ugens and re-create the audio callback. This method is called automatically in the default Gibberish sample loop whenever Gibberish.isDirty is true.
**/
  createCallback : function() {
    this.memo = {};
    
    this.codeblock.length = 0;
    
    this.callbackArgs.length = 0;
    this.callbackObjects.length = 0;
    this.analysisCallbackArgs.length = 0;
    
    /* generate code for dirty ugens */
    /*for(var i = 0; i < this.dirtied.length; i++) {
      this.dirtied[i].codegen();
    }*/
    this.dirtied.length = 0;
    
    this.codestring = '\t'
    
    this.args = ['input']
    
    this.out.codegen()
    
    var codeblockStore = this.codeblock.slice(0)
    
    // we must push these here because the callback arguments are at the start of the string, 
    // but we have to wait to codegen the analysis ugens until after their targets have been codegen'd
    if(this.analysisUgens.length > 0) { 
      this.analysisCodeblock.length = 0;
      for(var i = 0; i < this.analysisUgens.length; i++) {
        this.analysisCallbackArgs.push( this.analysisUgens[i].analysisSymbol )
      }
    }
    
    this.args = this.args.concat( this.callbackArgs )
    
    this.args = this.args.concat( this.analysisCallbackArgs )

    /* concatenate code for all ugens */
    //this.memo = {};
    
    this.codestring += codeblockStore.join('\t') //this.codeblock.join("\t");
    this.codestring += "\n\t";
    
    /* analysis codeblock */
    if(this.analysisUgens.length > 0) {
      this.analysisCodeblock.length = 0;
      for(var i = 0; i < this.analysisUgens.length; i++) {
        this.codeblock.length = 0;
        this.analysisUgens[i].analysisCodegen();
        /*
        if(this.codestring !== 'undefined' ) {
          this.codestring += this.codeblock.join("");
          this.codestring += "\n\t";
          this.analysisCodeblock.push ( this.analysisUgens[i].analysisCodegen() );
        }
        */
      }
      this.codestring += this.analysisCodeblock.join('\n\t');
      this.codestring += '\n\t';
    }
    this.codestring += 'return ' + this.out.variable +';\n';
    
    this.callbackString = this.codestring;
    if( this.debug ) console.log( this.callbackString );
    
    return [this.args, this.codestring];
  },

/**###Gibberish.audioProcess : method
The default audio callback used in Webkit browsers. This callback starts running as soon as Gibberish.init() is called.  
  
param **Audio Event** : Object. The HTML5 audio event object.
**/ 
  audioProcess : function(e){
		var bufferL = e.outputBuffer.getChannelData(0),
		    bufferR = e.outputBuffer.getChannelData(1),	
		    input = e.inputBuffer.getChannelData(0),
        me = Gibberish,
        callback = me.callback,
        sequencers = me.sequencers,
        out = Gibberish.out.callback,
        objs = me.callbackObjects.slice(0),
        callbackArgs, callbackBody, _callback, val

    if( me.onBlock !== null ) me.onBlock( me.context )
    
    objs.unshift(0)
        
		for(var i = 0, _bl = e.outputBuffer.length; i < _bl; i++){
      
      for(var j = 0; j < sequencers.length; j++) { sequencers[j].tick(); }
      
      if(me.isDirty) {
        _callback = me.createCallback();
        try{
          callback = me.callback = new Function( _callback[0], _callback[1] )
        }catch( e ) {
          console.error( "ERROR WITH CALLBACK : \n\n", _callback )
        }
        
        me.isDirty = false;
        objs = me.callbackObjects.slice(0)
        objs.unshift(0)
      }
      
      //console.log( "CB", callback )
      objs[0] = input[i]
      val = callback.apply( null, objs );
      
			bufferL[i] = val[0];
			bufferR[i] = val[1];      
		}
  },
/**###Gibberish.audioProcessFirefox : method
The default audio callback used in Firefox. This callback starts running as soon as Gibberish.init() is called.  
  
param **Sound Data** : Object. The buffer of audio data to be filled
**/   
  audioProcessFirefox : function(soundData) { // callback for firefox
    var me = Gibberish,
        callback = me.callback,
        sequencers = me.sequencers,
        objs = me.callbackObjects.slice(0),
        _callback
        
    objs.unshift(0)
    for (var i=0, size=soundData.length; i<size; i+=2) {
      
      for(var j = 0; j < sequencers.length; j++) { sequencers[j].tick(); }
      
      if(me.isDirty) {
        _callback = me.createCallback();
        
        try {
          callback = me.callback = new Function( _callback[0], _callback[1] )
        }catch( e ) {
          console.error( 'ERROR WITH CALLBACK : \n\n', callback )
        }
        me.isDirty = false;
        objs = me.callbackObjects.slice(0)
        objs.unshift(0)       
      }      
      
			var val = callback.apply(null, objs);
      
			soundData[i] = val[0];
      soundData[i+1] = val[1];
    }
  },
/**###Gibberish.clear : method
Remove all objects from Gibberish graph and perform codegen... kills all running sound and CPU usage.
**/   
  clear : function() {
    this.out.inputs.length = 0;
    this.analysisUgens.length = 0;
    this.sequencers.length = 0;
    
    this.callbackArgs.length = 2
    this.callbackObjects.length = 1
    
    Gibberish.dirty(this.out);
  },

/**###Gibberish.dirty : method
Tell Gibberish a ugen needs to be codegen'd and mark the entire callback as needing regeneration  
  
param **Ugen** : Object. The ugen that is 'dirtied'... that has a property value changed.
**/     
	dirty : function(ugen) {
    if(typeof ugen !== 'undefined') {
      var found = false;
      for(var i = 0; i < this.dirtied.length; i++) {
        if(this.dirtied[i].variable === ugen.variable) found = true;
      }
    
      if(!found) {
        this.isDirty = true;
        this.dirtied.push(ugen);
      }
    }else{
      this.isDirty = true;
    }
	},

/**###Gibberish.generateSymbol : method
Generate a unique symbol for a given ugen using its name and a unique id number.  
  
param **name** : String. The name of the ugen; for example, reverb, delay etc.
**/       
	generateSymbol : function(name) {
		return name + "_" + this.id++; 
	},
  
  // as taken from here: https://wiki.mozilla.org/Audio_Data_API#Standardization_Note
  // only the number of channels is changed in the audio.mozSetup() call
  
/**###Gibberish.AudioDataDestination : method
Used to generate callback for Firefox.  
  
param **sampleRate** : String. The sampleRate for the audio callback to run at. NOT THE BUFFER SIZE.  
param **readFn** : Function. The audio callback to use.
**/ 
  AudioDataDestination : function(sampleRate, readFn) { // for Firefox Audio Data API
    // Initialize the audio output.
    var audio = new Audio();
    audio.mozSetup(2, sampleRate);

    var currentWritePosition = 0;
    var prebufferSize = sampleRate / 2; // buffer 500ms
    var tail = null, tailPosition;

    // The function called with regular interval to populate 
    // the audio output buffer.
    setInterval(function() {
      var written;
      // Check if some data was not written in previous attempts.
      if(tail) {
        written = audio.mozWriteAudio(tail.subarray(tailPosition));
        currentWritePosition += written;
        tailPosition += written;
        if(tailPosition < tail.length) {
          // Not all the data was written, saving the tail...
          return; // ... and exit the function.
        }
        tail = null;
      }

      // Check if we need add some data to the audio output.
      var currentPosition = audio.mozCurrentSampleOffset();
      var available = currentPosition + prebufferSize - currentWritePosition;
      if(available > 0) {
        // Request some sound data from the callback function.
        var soundData = new Float32Array(available);
        readFn(soundData);

        // Writting the data.
        written = audio.mozWriteAudio(soundData);
        currentPosition = audio.mozCurrentSampleOffset();
        if(written < soundData.length) {
          // Not all the data was written, saving the tail.
          tail = soundData;
          tailPosition = written;
        }
        currentWritePosition += written;
      }
    }, 100);
  },
/**###Gibberish.AudioDataDestination : method
Create a callback and start it running. Note that in iOS audio callbacks can only be created in response to user events. Thus, in iOS this method assigns an event handler to the HTML body that creates the callback as soon as the body is touched; at that point the event handler is removed. 
**/   
  init : function() {
    // TODO: GET A BETTER TEST FOR THIS. The problem is that browserify adds a process object... not sure how robust
    // testing for the presence of the version property will be
    var isNode = typeof global !== 'undefined',
        bufferSize = typeof arguments[0] === 'undefined' ? 1024 : arguments[0], 
        audioContext,
        start
    
    if( typeof webkitAudioContext !== 'undefined' ) {
      audioContext = webkitAudioContext
    }else if ( typeof AudioContext !== 'undefined' ) {
      audioContext = AudioContext
    }

    // we will potentially delay start of audio until touch of screen for iOS devices
    start = function() {
      if( typeof audioContext !== 'undefined' ) {
        Gibberish.context = new audioContext();
        Gibberish.node = Gibberish.context.createScriptProcessor(bufferSize, 2, 2, Gibberish.context.sampleRate);	
        Gibberish.node.onaudioprocess = Gibberish.audioProcess;
        Gibberish.node.connect(Gibberish.context.destination);
        


        if( document && document.documentElement && 'ontouchstart' in document.documentElement ) {
          window.removeEventListener('touchstart', start);

          if('ontouchstart' in document.documentElement){ // required to start audio under iOS 6
            var mySource = Gibberish.context.createBufferSource();
            mySource.connect(Gibberish.context.destination);
            mySource.noteOn(0);
          }
        }else{
          window.removeEventListener('click', start)
        }
      }else{
        alert('Your browser does not support javascript audio synthesis. Please download a modern web browser that is not Internet Explorer.')
      }

      Gibberish.out = new Gibberish.Bus2();
      Gibberish.out.codegen(); // make sure bus is first upvalue so that clearing works correctly
      Gibberish.dirty(Gibberish.out);     

      if( Gibberish.onstart ) Gibberish.onstart()
    }
    
    
    if( document && document.documentElement && 'ontouchstart' in document.documentElement ) {
      window.addEventListener('touchstart', start);
    }else{
      window.addEventListener('click', start )
      //start();
    }
    
    return this;
  },
  
/**###Gibberish.makePanner : method
Create and return an object that can be used to pan a stereo source.
**/ 
  //   makePanner : function() {
  //   var sin = Math.sin;
  //   var cos = Math.cos;
  //   var sqrtTwoOverTwo = Math.sqrt(2) / 2;
  //     
  //   var f = function(val, pan, array) {
  //       var isObject = typeof val === 'object';
  //       var l = isObject ? val[0] : val;
  //       var r = isObject ? val[1] : val;
  //           
  //       array[0] = l * (sqrtTwoOverTwo * (cos(pan) - sin(pan)) );
  //       array[1] = r * (sqrtTwoOverTwo * (cos(pan) + sin(pan)) );
  //           
  //     return array;
  //   };
  //         
  //   return f;
  // },
  
makePanner : function() {
  // thanks to grrrwaaa for this
  // create pan curve arrays (once-only): 
	var panTableL = [], panTableR = [];
	var sqrtTwoOverTwo = Math.sqrt(2) / 2;

	for( var i = 0; i < 1024; i++ ) { 
		var pan = -1 + ( i / 1024 ) * 2;
		panTableL[i] = (sqrtTwoOverTwo * (Math.cos(pan) - Math.sin(pan)) );
		panTableR[i] = (sqrtTwoOverTwo * (Math.cos(pan) + Math.sin(pan)) );
	}

  return function(val, pan, output) {
    var isObject = typeof val === 'object',
        l = isObject ? val[0] : val,
        r = isObject ? val[1] : val,
        _index, index, frac, index2, val1, val2;
      
    _index  = ((pan + 1) * 1023) / 2
    index   = _index | 0
    frac    = _index - index;
    index   = index & 1023;
    index2  = index === 1023 ? 0 : index + 1;
    
    val1    = panTableL[index];
    val2    = panTableL[index2];
    output[0] = ( val1 + ( frac * (val2 - val1) ) ) * l;
    
    val1    = panTableR[index];
    val2    = panTableR[index2];
    output[1] = ( val1 + ( frac * (val2 - val1) ) ) * r;
    
    return output;
	}
},
  // IMPORTANT: REMEMBER THIS IS OVERRIDDEN IN GIBBER
  defineUgenProperty : function(key, initValue, obj) {
    var prop = obj.properties[key] = {
      value:  initValue,
      binops: [],
      parent : obj,
      name : key,
    };

    Object.defineProperty(obj, key, {
      configurable: true,
      get: function() { return prop.value },
      set: function(val) { 
        prop.value = val;
        Gibberish.dirty(obj);
      },
    });
  },
/**###Gibberish.polyInit : method
For ugens with polyphony, add metaprogramming that passes on property changes to the 'children' of the polyphonic object. Polyphonic ugens in Gibberish are just single instances that are routed into a shared bus, along with a few special methods for voice allocation etc.  
  
param **Ugen** : Object. The polyphonic ugen
**/ 
  polyInit : function(ugen) {
    ugen.mod = ugen.polyMod;
    ugen.removeMod = ugen.removePolyMod;
    
    ugen.voicesClear = function() {
      if( ugen.children.length > 0 ) {
        for( var i = 0; i < ugen.children.length; i++ ) {
          ugen.children[ i ].disconnect()
        }
        ugen.children.length = 0
        ugen.voiceCount = 0
      }
    }
    
    for(var key in ugen.polyProperties) {
      (function(_key) {
        var value = ugen.polyProperties[_key];
        
        Object.defineProperty(ugen, _key, {
          configurable: true,
          get : function() { return value; },
          set : function(val) { 
            value = val;
            for(var i = 0; i < ugen.children.length; i++) {
              ugen.children[i][_key] = value;
            }
          },
        });
        
      })(key);
    }
    
    var maxVoices = ugen.maxVoices
    Object.defineProperty( ugen, 'maxVoices', {
      get: function() { return maxVoices },
      set: function(v) { maxVoices = v; this.voicesClear(); this.initVoices() }
    })
  },
  
/**###Gibberish.interpolate : method
Similiar to makePanner, this method returns a function that can be used to linearly interpolate between to values. The resulting function takes an array and a floating point position index and returns a value.
**/   
	interpolate : function(arr, phase){
		var	index	  = phase | 0, // round down
        index2  = index + 1 > arr.length - 1 ? 0 : index + 1;
				frac	  = phase - index;
    				
    return arr[index] + frac * (arr[index2] - arr[index]);
	},
  
  pushUnique : function(item, array) {
		var obj = item;
		var shouldAdd = true;
    
		for(var j = 0; j < array.length; j++) {
			if(obj === array[j]) {
				shouldAdd = false;
				break;
			}
		}
    
		if(shouldAdd) {
			array.push(obj);
		}
  },
  
  export : function(key, obj) {
    for(var _key in Gibberish[key]) {
      //console.log("exporting", _key, "from", key);
      obj[_key] = Gibberish[key][_key];
    }
  },

/**###Gibberish.ugen : method
Creates a prototype object that is used by all ugens.
**/    
  ugen : function() {
    Gibberish.extend(this, {
  
/**#Ugen - Miscellaneous
The prototype object that all ugens inherit from
**/
/**###Ugen.processProperties : method
Used to assign and process arguments passed to the constructor functions of ugens.  
  
param **argumentList** : Array. A list of arguments (may be a single dictionary) passed to a ugen constructor.
**/     

      processProperties : function(args){
        if(typeof arguments[0][0] === 'object' && typeof arguments[0][0].type === 'undefined' && !Array.isArray(arguments[0][0]) && arguments[0][0].name !== 'op') {
          var dict = arguments[0][0];
          for(var key in dict) {
            if(typeof dict[key] !== 'undefined') {
              if(typeof this.properties[key] === 'object' && typeof this.properties[key].binops !== 'undefined') {
                this.properties[key].value = dict[key];
              }else{
                this[key] = dict[key];
              } 
            }
          }
        }else{
          var i = 0;
          for(var key in this.properties) {
            if(typeof this.properties[key] === 'object' && typeof this.properties[key].binops !== 'undefined') {
              if(typeof arguments[0][i] !== 'undefined'){
                this.properties[key].value = arguments[0][i++];
              }
            }else{
              if(typeof arguments[0][i] !== 'undefined') {
                this.properties[key] = arguments[0][i++];
              }
            }
          }
        }
        return this;
      },
      
      valueOf: function() {
        this.codegen()
        //console.log( "VALUEOF", this.variable )
        return this.variable
      },
/**###Ugen.codegen : method
Generates output code (as a string) used inside audio callback
**/   
      codegen : function() {
        var s = '', 
            v = null,
            initialized = false;
        
        if(Gibberish.memo[this.symbol]) {
          //console.log("MEMO" + this.symbol);
          return Gibberish.memo[this.symbol];
        }else{
          // we generate the symbol and use it to create our codeblock, but only if the ugen doesn't already have a variable assigned. 
          // since the memo is cleared every time the callback is created, we need to check to see if this exists. 
          v = this.variable ? this.variable : Gibberish.generateSymbol('v');
          Gibberish.memo[this.symbol] = v;
          this.variable = v;
        }

        s += 'var ' + v + " = " + this.symbol + "(";

        for(var key in this.properties) {
          var property = this.properties[key];
          var value = '';
          //if(this.name === "single_sample_delay") { console.log( "SSD PROP" + key ); }
          if( Array.isArray( property.value ) ) {
            if(property.value.length === 0) value = 0;  // primarily for busses
            
            for(var i = 0; i < property.value.length; i++) {
              var member = property.value[i];
              if( typeof member === 'object' ) {
            		value += member !== null ? member.valueOf() : 'null';
              }else{
                if(typeof property.value === 'function') {
                  value += property.value();
                }else{
                  value += property.value;
                }
              }
              value += i < property.value.length - 1 ? ', ' : '';
            }
            
          }else if( typeof property.value === 'object' ) {
            if( property.value !== null) {
              value = property.value.codegen ? property.value.valueOf() : property.value
            }
          }else if( property.name !== 'undefined'){
            if(typeof property.value === 'function') {
              value = property.value();
            }else{
              value = property.value;
            }
          }
          

          if(property.binops.length != 0) {
            for( var k = 0; k < property.binops.length; k++) {
              s += '(' // all leading parenthesis...
            }
            for(var j = 0; j < property.binops.length; j++) {
              var op = property.binops[j],
                  val;
                  
              if( typeof op.ugen === 'number') {
                  val = op.ugen;
              }else{
                  val = op.ugen !== null ? op.ugen.valueOf() : 'null';
              }
              
              if(op.binop === "=") {
                s = s.replace(value, "");
                s += val;
              }else if(op.binop === "++"){
                s += ' + Math.abs(' + val + ')';
              }else{
                if( j === 0) s+= value
                s += " " + op.binop + " " + val + ")";
              }
              
            }
          }else{
            s += value
          }

          s += ", ";
        }
        
        if(s.charAt(s.length - 1) === " ")
          s = s.slice(0, -2); // remove trailing spaces
      
        s += ");\n";
        
        this.codeblock = s;
        
        if( Gibberish.codeblock.indexOf( this.codeblock ) === -1 ) Gibberish.codeblock.push( this.codeblock )
        if( Gibberish.callbackArgs.indexOf( this.symbol ) === -1 && this.name !== 'op') { Gibberish.callbackArgs.push( this.symbol ) }
        if( Gibberish.callbackObjects.indexOf( this.callback ) === -1 && this.name !== 'op' ) { Gibberish.callbackObjects.push( this.callback ) }
        
        this.dirty = false;        
        
        return v;
      },

/**###Ugen.defineUgenProperty : method
Creates getters and setters for ugen properties that automatically dirty the ugen whenever the property value is changed.  
  
param **key** : String. The name of a property to add getter / setters for.  
param **value** : Any. The initival value to set the property to
**/       
      
/**###Ugen.init : method
Initialize ugen by calling defineUgenProperty for every key in the ugen's properties dictionary, generating a unique id for the ugen and various other small tasks.
**/             
      init : function() {
        if(!this.initalized) {
          this.symbol = Gibberish.generateSymbol(this.name);
          this.codeblock = null;
          this.variable = null;
        }
        
        if(typeof this.properties === 'undefined') {
          this.properties = {};
        }
        
        if(!this.initialized) {
          this.destinations = [];
          for(var key in this.properties) {
            Gibberish.defineUgenProperty(key, this.properties[key], this);
          }
        }
        
        if(arguments.length > 0 && typeof arguments[0][0] === 'object' && arguments[0][0].type === 'undefined') {
          var options = arguments[0][0];
          for(var key in options) {
            this[key] = options[key];
          }
        }
                        
        this.initialized = true;
        
        return this;
      },
/**###Ugen.mod : method
Modulate a property of a ugen on a per-sample basis.  
  
param **key** : String. The name of the property to modulate  
param **value** : Any. The object or number value to modulate the property with  
param **op** : String. Default "+". The operation to perform. Can be +,-,*,/,= or ++. ++ adds and returns the absolute value.
**/            
      mod : function(name, value, op) {
        var property = this.properties[ name ];
        var mod = { ugen:value, binop:op };
       	property.binops.push( mod );
        
        Gibberish.dirty( this );
      },
/**###Ugen.removeMod : method
Remove a modulation from a ugen.  
  
param **key** : String. The name of the property to remove the modulation from  
param **arg** : Number or Object. Optional. This determines which modulation to remove if more than one are assigned to the property. If this argument is undefined, all modulations are removed. If the argument is a number, the number represents a modulation in the order that they were applied (an array index). If the argument is an object, it removes a modulation that
is using a matching object as the modulator.
**/                  
      removeMod : function(name, arg) {
        if(typeof arg === 'undefined' ) {
          this.properties[name].binops.length = 0;
        }else if(typeof arg === 'number') {
          this.properties[name].binops.splice(arg, 1);
        }else if(typeof arg === 'object') {
          for(var i = 0, j = this.properties[name].binops.length; i < j; i++) {
            if(this.properties[name].binops[i].ugen === arg) {
              this.properties[name].binops.splice(i, 1);
            }
          }
        };
        
        Gibberish.dirty( this );
      },

/**###Ugen.polyMod : method
Applies a modulation to all children of a polyphonic ugen  
  
param **key** : String. The name of the property to modulate  
param **value** : Any. The object or number value to modulate the property with  
param **op** : String. Default "+". The operation to perform. Can be +,-,*,/,= or ++. ++ adds and returns the absolute value.
**/       
  		polyMod : function(name, modulator, type) {
  			for(var i = 0; i < this.children.length; i++) {
  				this.children[i].mod(name, modulator, type);
  			}
  			Gibberish.dirty(this);
  		},

/**###Ugen.removePolyMod : method
Removes a modulation from all children of a polyphonic ugen. The arguments  
  
param **arg** : Number or Object. Optional. This determines which modulation to remove if more than one are assigned to the property. If this argument is undefined, all modulations are removed. If the argument is a number, the number represents a modulation in the order that they were applied (an array index). If the argument is an object, it removes a modulation that
is using a matching object as the modulator.
**/       
  		removePolyMod : function() {
  			var args = Array.prototype.slice.call(arguments, 0);
        
  			if(arguments[0] !== "amp" && arguments[0] !== "pan") {
  				for(var i = 0; i < this.children.length; i++) {
  					this.children[i].removeMod.apply(this.children[i], args);
  				}
  			}else{
  				this.removeMod.apply(this, args);
  			}
        
  			Gibberish.dirty(this);
  		},
      
      smooth : function(property, amount) {
        var op = new Gibberish.OnePole();
        this.mod(property, op, "=");
      },
/**###Ugen.connect : method
Connect the output of a ugen to a bus.  
  
param **bus** : Bus ugen. Optional. The bus to connect the ugen to. If no argument is passed the ugen is connect to Gibberish.out. Gibberish.out is automatically created when Gibberish.init() is called and can be thought of as the master stereo output for Gibberish.
**/      
      connect : function(bus, position) {
        if(typeof bus === 'undefined') bus = Gibberish.out;
        
        if(this.destinations.indexOf(bus) === -1 ){
          bus.addConnection( this, 1, position );
          this.destinations.push( bus );
        }
        return this;
      },
/**###Ugen.send : method
Send an arbitrary amount of output to a bus  
  
param **bus** : Bus ugen. The bus to send the ugen to.  
param **amount** : Float. The amount of signal to send to the bus. 
**/      
      send : function(bus, amount) {
        if(this.destinations.indexOf(bus) === -1 ){
          bus.addConnection( this, amount );
          this.destinations.push( bus );
        }else{
          bus.adjustSendAmount(this, amount);
        }
        return this;
      },
/**###Ugen.disconnect : method
Disconnect a ugen from a bus (or all busses). This stops all audio and signal processing for the ugen.  
  
param **bus** : Bus ugen. Optional. The bus to disconnect the ugen from. If this argument is undefined the ugen will be disconnected from all busses.
**/      
      disconnect : function(bus, tempDisconnect ) { // tempDisconnect is used to do a short disconnect and reconnect
        var idx
        
        if( !tempDisconnect ) {
          /*if( this.children ) {
            for(var i = 0; i < this.children.length; i++) {
              this.children[i].disconnect( this )
            }
          }else if( typeof this.input === 'object' ) {
            this.input.disconnect( null, tempDisconnect )
          }*/
          
          /*var idx = Gibberish.callbackArgs.indexOf( this.symbol )
          Gibberish.callbackArgs.splice(idx, 1)
        
          idx = Gibberish.callbackObjects.indexOf( this.callback )        
          Gibberish.callbackObjects.splice(idx, 1)*/
        }
        
        if( !bus ) {
          for(var i = 0; i < this.destinations.length; i++) {
            this.destinations[i].removeConnection( this );
          }
          this.destinations = [];
        }else{
          idx = this.destinations.indexOf(bus);
          if(idx > -1) {
            this.destinations.splice(idx, 1);
          }
          bus.removeConnection( this );
        }
        
        Gibberish.dirty( this )
        return this;
      },
    });
  },
};


Array2 = function() { 
  this.length = 0;
};

Array2.prototype = [];
	
Array2.prototype.remove = function(arg, searchDeep) { // searchDeep when true removes -all- matches, when false returns first one found.
	searchDeep = typeof searchDeep === 'undefined' ? true : searchDeep;
	if(typeof arg === "undefined") { // clear all
		for(var i = 0; i < this.length; i++) {
			delete this[i];
		}
		this.length = 0;
	}else if(typeof arg === "number") {
		this.splice(arg,1);
	}else if(typeof arg === "string"){ // find named member and remove
		var removeMe = [];
		for(var i = 0; i < this.length; i++) {
			var member = this[i];
			if(member.type === arg || member.name === arg) {
				if(!searchDeep) {
					this.splice(i,1);
					return;
				}else{
					removeMe.push(i);
				}
			}
		}
		for(var i = 0; i < removeMe.length; i++) {
			this.splice( removeMe[i], 1);
		}
	}else if(typeof arg === "object") {
		var idx = this.indexOf(arg);
		while(idx > -1) {
			this.splice(idx,1);
			idx = this.indexOf(arg);
		}
	}
	if(this.parent) Gibberish.dirty(this.parent);
};
	
Array2.prototype.get = function(arg) {
	if(typeof arg === "number") {
		return this[arg];
	}else if(typeof arg === "string"){ // find named member and remove
		for(var i = 0; i < this.length; i++) {
			var member = this[i];

			if(member.name === arg) {
				return member;
			}
		}
	}else if(typeof arg === "object") {
		var idx = this.indexOf(arg);
		if(idx > -1) {
			return this[idx];
		}
	}
	return null;
};
	

Array2.prototype.replace = function(oldObj, newObj) {
	newObj.parent = this;
  newObj.input = oldObj.input;
  
	if(typeof oldObj != "number") {
		var idx = this.indexOf(oldObj);
		if(idx > -1) {
			this.splice(idx, 1, newObj);
		}
	}else{
		this.splice(oldObj, 1, newObj);
	}
	if(this.parent) Gibberish.dirty(this.parent);
};

Array2.prototype.insert = function(v, pos) {
	v.parent = this;
  this.input = this.parent;
  
	if(Array.isArray(v)) {
		for(var i = 0; i < v.length; i++) {
			this.splice(pos + i, 0, v[i]);
		}
	}else{
		this.splice(pos,0,v);
	}
	if(this.parent) Gibberish.dirty(this.parent);
};

Array2.prototype.add = function() {
	for(var i = 0; i < arguments.length; i++) {
		arguments[i].parent = this;
    arguments[i].input = this.parent;
		//console.log(this.parent, this.parent.channels);
		//if(typeof this.parent.channels === "number") {
			//console.log("CHANGING CHANNELS");
			//arguments[i].channels = this.parent.channels;
    //}
		this.push(arguments[i]);
	}
	//console.log("ADDING ::: this.parent = ", this.parent)
	if(this.parent) {  
    console.log("DIRTYING");
  	Gibberish.dirty(this.parent);
  }
		
};
	
var rnd = Math.random;
Gibberish.rndf = function(min, max, number, canRepeat) {
  canRepeat = typeof canRepeat === "undefined" ? true : canRepeat;
	if(typeof number === "undefined" && typeof min != "object") {
		if(arguments.length == 1) {
			max = arguments[0]; min = 0;
		}else if(arguments.length == 2) {
			min = arguments[0];
			max = arguments[1];
		}else{
			min = 0;
			max = 1;
		}

		var diff = max - min,
		    r = Math.random(),
		    rr = diff * r
	
		return min + rr;
	}else{
		var output = [];
		var tmp = [];
		if(typeof number === "undefined") {
			number = max || min.length;
		}
		
		for(var i = 0; i < number; i++) {
			var num;
			if(typeof arguments[0] === "object") {
				num = arguments[0][rndi(0, arguments[0].length - 1)];
			}else{
				if(canRepeat) {
					num = Gibberish.rndf(min, max);
				}else{
          num = Gibberish.rndf(min, max);
          while(tmp.indexOf(num) > -1) {
            num = Gibberish.rndf(min, max);
          }
					tmp.push(num);
				}
			}
			output.push(num);
		}
		return output;
	}
};
  
Gibberish.Rndf = function() {
  var _min, _max, quantity, random = Math.random, canRepeat;
    
  if(arguments.length === 0) {
    _min = 0; _max = 1;
  }else if(arguments.length === 1) {
    _max = arguments[0]; _min = 0;
  }else if(arguments.length === 2) {
    _min = arguments[0]; _max = arguments[1];
  }else if(arguments.length === 3) {
    _min = arguments[0]; _max = arguments[1]; quantity = arguments[2];
  }else{
    _min = arguments[0]; _max = arguments[1]; quantity = arguments[2]; canRepeat = arguments[3];
  }    
  
  return function() {
    var value, min, max, range;
    
    min = typeof _min === 'function' ? _min() : _min
    max = typeof _max === 'function' ? _max() : _max
      
    if( typeof quantity === 'undefined') {
      value = Gibberish.rndf( min, max )
    }else{
      value = Gibberish.rndf( min, max, quantity, canRepeat )
    }
    
    return value;
  }
};

Gibberish.rndi = function( min, max, number, canRepeat ) {
  var range;
    
  if(arguments.length === 0) {
    min = 0; max = 1;
  }else if(arguments.length === 1) {
    max = arguments[0]; min = 0;
  }else if( arguments.length === 2 ){
    min = arguments[0]; max = arguments[1];
  }else{
    min = arguments[0]; max = arguments[1]; number = arguments[2]; canRepeat = arguments[3];
  }    
  
  range = max - min
  if( range < number ) canRepeat = true
  
  if( typeof number === 'undefined' ) {
    range = max - min
    return Math.round( min + Math.random() * range );
  }else{
		var output = [];
		var tmp = [];
		
		for(var i = 0; i < number; i++) {
			var num;
			if(canRepeat) {
				num = Gibberish.rndi(min, max);
			}else{
				num = Gibberish.rndi(min, max);
				while(tmp.indexOf(num) > -1) {
					num = Gibberish.rndi(min, max);
				}
				tmp.push(num);
			}
			output.push(num);
		}
		return output;
  }
};

Gibberish.Rndi = function() {
  var _min, _max, quantity, random = Math.random, round = Math.round, canRepeat, range;
    
  if(arguments.length === 0) {
    _min = 0; _max = 1;
  }else if(arguments.length === 1) {
    _max = arguments[0]; _min = 0;
  }else if(arguments.length === 2) {
    _min = arguments[0]; _max = arguments[1];
  }else if(arguments.length === 3) {
    _min = arguments[0]; _max = arguments[1]; quantity = arguments[2];
  }else{
    _min = arguments[0]; _max = arguments[1]; quantity = arguments[2]; canRepeat = arguments[3];
  }  
  
  range = _max - _min
  if( typeof quantity === 'number' && range < quantity ) canRepeat = true
  
  return function() {
    var value, min, max, range;
    
    min = typeof _min === 'function' ? _min() : _min
    max = typeof _max === 'function' ? _max() : _max
    
    if( typeof quantity === 'undefined') {
      value = Gibberish.rndi( min, max )
    }else{
      value = Gibberish.rndi( min, max, quantity, canRepeat )
    }
    
    return value;
  }
};

Gibberish.extend = function(destination, source) {
    for (var property in source) {
			var keys = property.split(".");
			if(source[property] instanceof Array && source[property].length < 100) { // don't copy large array buffers
		    destination[property] = source[property].slice(0);
				if(property === "fx") {
					destination[property].parent = source[property].parent;
				}
      }else if (typeof source[property] === "object" && source[property] !== null && !(source[property] instanceof Float32Array) ) {
          destination[property] = destination[property] || {};
          arguments.callee(destination[property], source[property]);
      } else {
          destination[property] = source[property];
      }
    }
    return destination;
};
	
Function.prototype.clone=function(){
    return eval('['+this.toString()+']')[0];
};

String.prototype.format = function(i, safe, arg) {
    function format() {
        var str = this,
            len = arguments.length + 1;

        for (i = 0; i < len; arg = arguments[i++]) {
            safe = arg; //typeof arg === 'object' ? JSON.stringify(arg) : arg;
            str = str.replace(RegExp('\\{' + (i - 1) + '\\}', 'g'), safe);
        }
        return str;
    }

    format.native = String.prototype.format;

    return format;
}();

Gibberish.future = function(func, time) { 
  var seq = new Gibberish.Sequencer({
    values:[
      function(){},
      function() {
        func();
        seq.stop();
        seq.disconnect();
      }
    ],
    durations:[ time ]
  }).start()
  
  seq.cancel = function() {
    seq.stop();
    seq.disconnect();
  }
  
  return seq
}
Gibberish.Proxy = function() {
  var value = 0;
      
	Gibberish.extend(this, {
  	name: 'proxy',
    type: 'effect',
    
    properties : {},
    
    callback : function() {
      return value;
    },
  }).init();
  
  this.input = arguments[0];
  
  value = this.input.parent[ this.input.name ];
  delete this.input.parent[ this.input.name ];
    
  this.input.parent.properties[ this.input.name ].value = this;
  
  Object.defineProperty( this.input.parent, this.input.name, {
    get : function(){ return value; },
    set : function(_value) { value = _value; }
  });
  Gibberish.dirty(this.input.parent);
};
Gibberish.Proxy.prototype = new Gibberish.ugen();

Gibberish.Proxy2 = function() {
  var input = arguments[0],
      name = arguments[1],
      phase = 0
      
	Gibberish.extend( this, {
  	name: 'proxy2',
    type: 'effect',
    
    properties : { },
    
    callback : function() {
      var v = input[ name ]
      // if( phase++ % 44100 === 0 ) console.log( v, input, name)
      return Array.isArray( v ) ? ( v[0] + v[1] + v[2] ) / 3 : v
    },
  }).init();
  
  this.getInput = function() { return input }
  this.setInput = function( v ) { input = v }
  this.getName = function() { return name }
  this.setName = function( v ) { name = v }
};
Gibberish.Proxy2.prototype = new Gibberish.ugen();

Gibberish.Proxy3 = function() {
  var input = arguments[0],
      name = arguments[1],
      phase = 0
      
	Gibberish.extend( this, {
  	name: 'proxy3',
    type: 'effect',
    
    properties : { },
    
    callback : function() {
      var v = input[ name ]
      //if( phase++ % 44100 === 0 ) console.log( v, input, name)
      return v || 0
    },
  })
  
  this.init();
  
  this.codegen = function() {
    // if(Gibberish.memo[this.symbol]) {
    //   return Gibberish.memo[this.symbol];
    // }
    
    console.log(" CALLED ")
    if( ! this.variable ) this.variable = Gibberish.generateSymbol('v');
    Gibberish.callbackArgs.push( this.symbol )
    Gibberish.callbackObjects.push( this.callback )

    this.codeblock = "var " + this.variable + " = " + this.symbol + "(" + input.properties[ name ].codegen() + ");\n"
  }
  
};
Gibberish.Proxy3.prototype = new Gibberish.ugen();
Gibberish.oscillator = function() {
  this.type = 'oscillator';
  
  this.oscillatorInit = function() {
    this.fx = new Array2; 
    this.fx.parent = this;
    
    return this;
  }
};
Gibberish.oscillator.prototype = new Gibberish.ugen();
Gibberish._oscillator = new Gibberish.oscillator();

/**#Gibberish.Table - Oscillator
An wavetable oscillator.

## Example Usage##
`// fill the wavetable with random samples
Gibberish.init();  
a = new Gibberish.Table();  
var t = []  
for( var i = 0; i < 1024; i++ ) { t[ i ] = Gibberish.rndf(-1,1) }  
a.setTable( t )  
a.connect()  
`
- - - -
**/
/**###Gibberish.Table.frequency : property  
Number. From 20 - 20000 hz.
**/
/**###Gibberish.Table.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/

Gibberish.Wavetable = function() {
  var phase = 0,
      table = null,
      tableFreq = Gibberish.context.sampleRate / 1024,
      signHistory = 0,
      flip = 0;
  
  this.properties = {
    frequency : 440,
    amp : .25,
    sync: 0
  };
  
/**###Gibberish.Wavetable.setTable : method  
Assign an array representing one cycle of a waveform to use.  

param **table** Float32Array. Assign an array to be used as the wavetable.
**/     
  this.getTable = function() { return table; }
  this.setTable = function(_table) { table = _table; tableFreq = Gibberish.context.sampleRate / table.length }
  
  this.getTableFreq = function() { return tableFreq }
  this.setTableFreq = function( v ) { tableFreq = v;  }  
  
  this.getPhase = function()  { return phase }
  this.setPhase = function(v) { phase = v }

/**###Gibberish.Wavetable.callback : method  
Returns a single sample of output.  

param **frequency** Number. The frequency to be used to calculate output.  
param **amp** Number. The amplitude to be used to calculate output.  
**/   
  this.callback = function(frequency, amp, sync) { 
    var index, frac, index2, val1, val2, sign;
            
    phase += frequency / tableFreq;
    while(phase >= 1024) phase -= 1024;  
    
    index   = phase | 0;
    frac    = phase - index;
    index   = index & 1023;
    index2  = index === 1023 ? 0 : index + 1;
    val1    = table[index];
    val2    = table[index2];
    
    // sign = typeof sync == 'number' ? sync ? sync < 0 ? -1 : 1 : isNaN(sync) ? NaN : 0 : NaN;
    // if( sign !== signHistory && sign !== 0) {
    //   flip++
    //   
    //   if( flip === 2 ){
    //     phase = 0
    //     flip = 0
    //   }
    //   //console.log( "FLIP", sign, signHistory, count, sync )
    // }
    // 
    // if( sign !== 0 ) signHistory = sign
    
    return ( val1 + ( frac * (val2 - val1) ) ) * amp;
  }
}
Gibberish.Wavetable.prototype = Gibberish._oscillator;

Gibberish.Table = function( table ) {
  this.__proto__ = new Gibberish.Wavetable();
  
  this.name = 'table';
  
  var pi_2 = Math.PI * 2
  
  if( typeof table === 'undefined' ) { 
    table = new Float32Array(1024);
    for(var i = 1024; i--;) { table[i] = Math.sin( (i / 1024) * pi_2); }
  }
  
  this.setTable( table );

  this.init();
  this.oscillatorInit();
  //this.processProperties( arguments );
}

Gibberish.asmSine = function (stdlib, foreign, heap) {
    "use asm";

    var sin = stdlib.Math.sin;
    var phase = 0.0;
    var out = new stdlib.Float32Array(heap);
    var floor = stdlib.Math.floor;
    var tableFreq = 0.0;
    
    function init() {
      var i = 1024;
      var j = 1024.0;
      var test = 0.0;
      for (;  i = (i - 1) | 0; ) {
        j = j - 1.0;
        out[i >> 2] = +(sin( +(j / 1024.0) * 6.2848));
      }  
      tableFreq = 44100.0 / 1024.0;
    }
    
    function gen(freq, amp, sr) {
      freq = +freq;
      amp = +amp;
      sr = +sr;
      
      var index = 0.0,
          index1 = 0,
          index2 = 0,
          frac = 0.0,
          val1 = 0.0,
          val2 = 0.0;
      
      phase = +(phase + freq / tableFreq);
      if(phase >= 1024.0) phase = +(phase - 1024.0);
          
      index = +floor(phase);
      frac = phase - index;
      
      index1 = (~~index);
      if((index1 | 0) == (1024 | 0)) {
        index2 = 0
      } else { 
        index2 = (index1 + 1) | 0;
      }
      
      val1 = +out[ index1 >> 2 ];
      val2 = +out[ index2 >> 2 ];
          
      return +((val1 + (frac * (val2 - val1))) * amp);
    }
    
    function get(idx) {
      idx = idx|0;
      return +out[idx >> 2];
    }

    return {
      init:init,
      gen: gen,
      get: get,
    }
};

/*
    phase += frequency / tableFreq;
    while(phase >= 1024) phase -= 1024;  
    
    index   = phase | 0;
    frac    = phase - index;
    index   = index & 1023;
    index2  = index === 1023 ? 0 : index + 1;
    val1    = table[index];
    val2    = table[index2];
        
    return ( val1 + ( frac * (val2 - val1) ) ) * amp;
*/





/*function gen (freq, amp, sr) {
    freq = +freq;
    amp  = +amp;
    sr = +sr;
    
    phase = +(phase + +(+(freq / sr) * 3.14159 * 2.0));
    
    return +(+sin(phase) * amp);
}*/
//var pi_2 = (3.14159 * 2.0);


Gibberish.asmSine2 = function () {    
    this.properties = { frequency:440.0, amp:.5, sr: Gibberish.context.sampleRate }
    this.name = 'sine'
    var buf = new ArrayBuffer(4096);
    var asm = Gibberish.asmSine(window, null, buf);
    asm.init();
    
    this.getTable = function() { return buf; }
    this.get = asm.get;
    this.callback = asm.gen;
    this.init();
    this.oscillatorInit();
    this.processProperties( arguments );
    
    return  this;
}
Gibberish.asmSine2.prototype = Gibberish._oscillator;
/**#Gibberish.Sine - Oscillator
A sinewave calculated on a per-sample basis.

## Example Usage##
`// make a sine wave  
Gibberish.init();  
a = new Gibberish.Sine().connect();`
- - - -
**/
/**###Gibberish.Sine.frequency : property  
Number. From 20 - 20000 hz.
**/
/**###Gibberish.Sine.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/

Gibberish.Sine = function() {
  this.__proto__ = new Gibberish.Wavetable();
  
  this.name = 'sine';
  
  var pi_2 = Math.PI * 2, 
      table = new Float32Array(1024);
      
  for(var i = 1024; i--;) { table[i] = Math.sin( (i / 1024) * pi_2); }
  
  this.setTable( table );

  this.init( arguments );
  this.oscillatorInit();
  this.processProperties( arguments );
};

/**#Gibberish.Sine2 - Oscillator
A sinewave calculated on a per-sample basis that can be panned.

## Example Usage##
`// make a sine wave  
Gibberish.init();  
a = new Gibberish.Sine2(880, .5, -.25).connect();`
- - - -
**/
/**###Gibberish.Sine2.frequency : property  
Number. From 20 - 20000 hz.
**/
/**###Gibberish.Sine2.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/
/**###Gibberish.Sine2.pan : property  
Number. -1..1. The position of the sinewave in the stereo spectrum
**/
Gibberish.Sine2 = function() {
  this.__proto__ = new Gibberish.Sine();
  this.name = "sine2";
    
  var sine = this.__proto__.callback,
      panner = Gibberish.makePanner(),
      output = [0,0];

/**###Gibberish.Sine2.callback : method  
Returns a stereo sample of output as an array.  
  
param **frequency** Number. The frequency to be used to calculate output.  
param **amp** Number. The amplitude to be used to calculate output.  
param **pan** Number. The position in the stereo spectrum of the signal.
**/  
  this.callback = function(frequency, amp, pan) {
    var out = sine(frequency, amp);
    output = panner(out, pan, output);
    return output;
  }

  this.init();
  this.oscillatorInit();
  Gibberish.defineUgenProperty('pan', 0, this);
  this.processProperties(arguments);  
};

Gibberish.Square = function() {
  this.__proto__ = new Gibberish.Wavetable();
  
  this.name = 'square';
  
  var pi_2 = Math.PI * 2, 
      table = new Float32Array(1024);
      
  for(var i = 1024; i--;) { 
    table[i] = i / 1024 > .5 ? 1 : -1;
  }
  
  this.setTable( table );

  this.init( arguments );
  this.oscillatorInit();
  this.processProperties( arguments );
};

/**#Gibberish.Saw - Oscillator
A non-bandlimited saw wave calculated on a per-sample basis.

## Example Usage##
`// make a saw wave  
Gibberish.init();  
a = new Gibberish.Saw(330, .4).connect();`
- - - -
**/
/**###Gibberish.Saw.frequency : property  
Number. From 20 - 20000 hz.
**/
/**###Gibberish.Saw.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/
Gibberish.Saw = function() {
  this.__proto__ = new Gibberish.Wavetable();
  
  this.name = 'saw';
  
  var table = new Float32Array(1024);
      
  for(var i = 1024; i--;) { table[i] = (((i / 1024) / 2 + 0.25) % 0.5 - 0.25) * 4; }
  
  this.setTable( table );

  this.init( arguments );
  this.oscillatorInit();
  this.processProperties( arguments );
};

/**#Gibberish.Saw2 - Oscillator
A stereo, non-bandlimited saw wave calculated on a per-sample basis.

## Example Usage##
`// make a saw wave  
Gibberish.init();  
a = new Gibberish.Saw2(330, .4).connect();`
- - - -
**/
/**###Gibberish.Saw.frequency : property  
Number. From 20 - 20000 hz.
**/
/**###Gibberish.Saw.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/
Gibberish.Saw2 = function() {
  this.__proto__ = new Gibberish.Saw();
  this.name = "saw2";
  
  var saw = this.__proto__.callback,
      panner = Gibberish.makePanner(),
      output = [0,0];

/**###Gibberish.Saw2.callback : method  
Returns a stereo sample of output as an array.  
  
param **frequency** Number. The frequency to be used to calculate output.  
param **amp** Number. The amplitude to be used to calculate output.  
param **pan** Number. The position in the stereo spectrum of the signal.
**/    
  this.callback = function(frequency, amp, pan) {
    var out = saw(frequency, amp);
    output = panner(out, pan, output);
    return output;
  };

  this.init();
  Gibberish.defineUgenProperty('pan', 0, this);
  
};

/**#Gibberish.Triangle - Oscillator
A triangle calculated on a per-sample basis.

## Example Usage##
`// make a triangle wave  
Gibberish.init();  
a = new Gibberish.Triangle({frequency:570, amp:.35}).connect();`
- - - -
**/
/**###Gibberish.Triangle.frequency : property  
Number. From 20 - 20000 hz.
**/
/**###Gibberish.Triangle.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/

Gibberish.Triangle = function() {
  this.__proto__ = new Gibberish.Wavetable();
  
  this.name = 'triangle';
  
  var table = new Float32Array(1024),
      abs = Math.abs;
      
  for(var i = 1024; i--;) { table[i] = 1 - 4 * abs(( (i / 1024) + 0.25) % 1 - 0.5); }
  
  this.setTable( table );

  this.init( arguments );
  this.oscillatorInit();
  this.processProperties( arguments );
};

/**#Gibberish.Triangle2 - Oscillator
A triangle calculated on a per-sample basis that can be panned.

## Example Usage##
`Gibberish.init();  
a = new Gibberish.Triangle2(880, .5, -.25).connect();`
- - - -
**/
/**###Gibberish.Triangle2.frequency : property  
Number. From 20 - 20000 hz.
**/
/**###Gibberish.Triangle2.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/
/**###Gibberish.Triangle2.pan : property  
Number. -1..1. The position of the triangle wave in the stereo spectrum
**/
 
Gibberish.Triangle2 = function() {
  this.__proto__ = new Gibberish.Triangle();
  this.name = "triangle2";
    
  var triangle = this.__proto__.callback,
      panner = Gibberish.makePanner(),
      output = [0,0];

/**###Gibberish.Triangle2.callback : method  
Returns a stereo sample of output as an array.  
  
param **frequency** Number. The frequency to be used to calculate output.  
param **amp** Number. The amplitude to be used to calculate output.  
param **pan** Number. The position in the stereo spectrum of the signal.
**/    
  this.callback = function(frequency, amp, pan) {
    var out = triangle(frequency, amp);
    return panner(out, pan, output);
  };

  this.init();
  this.oscillatorInit();
  Gibberish.defineUgenProperty('pan', 0, this);
  this.processProperties(arguments);
};

/**#Gibberish.Saw3 - Oscillator
A bandlimited saw wave created using FM feedback, see http://scp.web.elte.hu/papers/synthesis1.pdf.  
  
## Example Usage##
`// make a saw wave  
Gibberish.init();  
a = new Gibberish.Saw3(330, .4).connect();`
- - - -
**/
/**###Gibberish.Saw3.frequency : property  
Number. From 20 - 20000 hz.
**/
/**###Gibberish.Saw3.amp : property  
Number. A linear value specifying relative ampltiude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/

Gibberish.Saw3 = function() {
  var osc = 0,
      phase = 0,
      a0 = 2.5,
      a1 = -1.5,
      history = 0,
      sin = Math.sin,
      scale = 11;
      pi_2 = Math.PI * 2,
      flip = 0,
      signHistory = 0,
      ignore = false,
      sr = Gibberish.context.sampleRate;
      
  Gibberish.extend(this, {
    name: 'saw',
    properties : {
      frequency: 440,
      amp: .15,
      sync:0,
      sr: Gibberish.context.sampleRate,
    },
/**###Gibberish.Saw3.callback : method  
Returns a single sample of output.  
  
param **frequency** Number. The frequency to be used to calculate output.  
param **amp** Number. The amplitude to be used to calculate output.  
**/    
    callback : function(frequency, amp, sync) {
      var w = frequency / sr,
          n = .5 - w,
          scaling = scale * n * n * n * n,
          DC = .376 - w * .752,
          norm = 1 - 2 * w,
          out = 0,
          sign;
          
      phase += w;
      phase -= phase > 1 ? 2 : 0;
      
      osc = (osc + sin(pi_2 * (phase + osc * scaling))) * .5;
      out = a0 * osc + a1 * history;
      history = osc;
      out += DC;
      out *= norm;

      // sign = typeof sync == 'number' ? sync ? sync < 0 ? -1 : 1 : isNaN(sync) ? NaN : 0 : NaN;
      // if( sign !== signHistory && sign !== 0) {
      //   flip++
      //   
      //   if( flip === 2 ){
      //     phase = 0
      //     flip = 0
      //   }
      //   //console.log( "FLIP", sign, signHistory, count, sync )
      // }
      // if( sign !== 0 ) signHistory = sign
      
      return out * amp;
    }
  });
  
  /*
    .1 : 1 1
    0  : 0 1   // ignored
  -.1  : -1 1  // flip
  -.2  : -1 -1 
  */
  
  Object.defineProperty(this, 'scale', {
    get : function() { return scale; },
    set : function(val) { scale = val; }
  });
  
  this.init();
  this.oscillatorInit();
  this.processProperties(arguments);
}
Gibberish.Saw3.prototype = Gibberish._oscillator;

/**#Gibberish.PWM - Oscillator
A bandlimited pulsewidth modulation wave created using FM feedback, see http://scp.web.elte.hu/papers/synthesis1.pdf.
  
## Example Usage##
`// make a pwm wave  
Gibberish.init();  
a = new Gibberish.PWM(330, .4, .9).connect();`
- - - -
**/
/**###Gibberish.PWM.frequency : property  
Number. From 20 - 20000 hz.
**/
/**###Gibberish.PWM.amp : property  
Number. A linear value specifying relative ampltiude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/
/**###Gibberish.PWM.pulsewidth : property  
Number. 0..1. The width of the waveform's duty cycle.
**/
Gibberish.PWM = function() {
  var osc = 0,
      osc2= 0,
      _osc= 0,
      _osc2=0,
      phase = 0,
      a0 = 2.5,
      a1 = -1.5,
      history = 0,
      sin = Math.sin,
      scale = 11;
      pi_2 = Math.PI * 2,
      test = 0,
      sr = Gibberish.context.sampleRate;

  Gibberish.extend(this, {
    name: 'pwm',
    properties : {
      frequency: 440,
      amp: .15,
      pulsewidth: .05,
      sr: Gibberish.context.sampleRate,
    },
/**###Gibberish.PWM.callback : method  
Returns a single sample of output.  
  
param **frequency** Number. The frequency to be used to calculate output.  
param **amp** Number. The amplitude to be used to calculate output.  
param **pulsewidth** Number. The duty cycle of the waveform
**/    
    callback : function(frequency, amp, pulsewidth) {
      var w = frequency / sr,
          n = .5 - w,
          scaling = scale * n * n * n * n,
          DC = .376 - w * .752,
          norm = 1 - 2 * w,
          out = 0;
          
      phase += w;
      phase -= phase > 1 ? 2 : 0;
      
      osc = (osc  + sin( pi_2 * (phase + osc  * scaling ) ) ) * .5;
      osc2 =(osc2 + sin( pi_2 * (phase + osc2 * scaling + pulsewidth) ) ) * .5;
      out = osc2 - osc;
      
      out = a0 * out + a1 * (_osc - _osc2);
      _osc = osc;
      _osc2 = osc2;

      return out * norm * amp;
    },
  });
  
  Object.defineProperty(this, 'scale', {
    get : function() { return scale; },
    set : function(val) { scale = val; }
  });
  
  this.init();
  this.oscillatorInit();
  this.processProperties(arguments);  
};
Gibberish.PWM.prototype = Gibberish._oscillator;

/**#Gibberish.Noise - Oscillator
A white noise oscillator

## Example Usage##
`// make some noise
Gibberish.init();  
a = new Gibberish.Noise(.4).connect();`
- - - -
**/
/**###Gibberish.Noise.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/
Gibberish.Noise = function() {
  var rnd = Math.random;
  
  Gibberish.extend(this, {
    name:'noise',
    properties: {
      amp:1,
    },
    
    callback : function(amp){ 
      return (rnd() * 2 - 1) * amp;
    },
  });
  
  this.init();
  this.oscillatorInit();
  this.processProperties(arguments);  
};
Gibberish.Noise.prototype = Gibberish._oscillator;

// this file is dependent on oscillators.js

/**#Gibberish.KarplusStrong - Physical Model
A plucked-string model.  
  
## Example Usage##
`Gibberish.init();  
a = new Gibberish.KarplusStrong({ damping:.6 }).connect();  
a.note(440);
`
- - - -
**/
/**###Gibberish.KarplusStrong.blend : property  
Number. 0..1. The likelihood that the sign of any given sample will be flipped. A value of 1 means there is no chance, a value of 0 means each samples sign will be flipped. This introduces noise into the model which can be used for various effects.
**/
/**###Gibberish.KarplusStrong.damping : property  
Number. 0..1. Higher amounts of damping shorten the decay of the sound generated by each note.
**/
/**###Gibberish.KarplusStrong.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/
/**###Gibberish.KarplusStrong.channels : property  
Number. Default 2. If two channels, the signal may be panned.
**/
/**###Gibberish.KarplusStrong.pan : property  
Number. Default 0. The position in the stereo spectrum for the sound, from -1..1.
**/
Gibberish.KarplusStrong = function() {
  var phase   = 0,
      buffer  = [0],
      last    = 0,
      rnd     = Math.random,
      panner  = Gibberish.makePanner(),
      sr      = Gibberish.context.sampleRate,
      out     = [0,0];
      
  Gibberish.extend(this, {
    name:"karplus_strong",
    frequency : 0,
    properties: { blend:1, damping:0, amp:1, channels:2, pan:0, velocity:1  },
  
    note : function( frequency, velocity ) {
      if( typeof frequency === 'undefined' ) return

      var _size = Math.floor(sr / frequency);
      buffer.length = 0;
    
      for(var i = 0; i < _size; i++) {
        buffer[i] = rnd() * 2 - 1; // white noise
      }
      
      if( velocity ) this.velocity = velocity

      this.frequency = frequency;
    },

    callback : function(blend, damping, amp, channels, pan, velocity ) { 
      var val = buffer.shift();
      var rndValue = (rnd() > blend) ? -1 : 1;
				
  	  damping = damping > 0 ? damping : 0;
				
      var value = rndValue * (val + last) * (.5 - damping / 100);

      last = value;

      buffer.push(value);
				
      value *= amp * velocity;
      return channels === 1 ? value : panner(value, pan, out);
    },
  })
  .init()
  .oscillatorInit()
  .processProperties(arguments);
};
Gibberish.KarplusStrong.prototype = Gibberish._oscillator;

Gibberish.PolyKarplusStrong = function() {
  this.__proto__ = new Gibberish.Bus2();
  
  Gibberish.extend(this, {
    name:     "poly_karplus_strong",
    maxVoices:    5,
    voiceCount:   0,
    _frequency: 0,
    
    polyProperties : {
  		blend:			1,
      damping:    0,
      velocity:   1
    },

    note : function(_frequency, velocity) {
      var synth = this.children[this.voiceCount++];
      if(this.voiceCount >= this.maxVoices) this.voiceCount = 0;
      synth.note(_frequency, velocity);
      this._frequency = _frequency;
    },
    initVoices: function() {
      for(var i = 0; i < this.maxVoices; i++) {
        var props = {
          blend:   this.blend,
          damping: this.damping,
          channels: 2,
          amp:      1,
        };
        var synth = new Gibberish.KarplusStrong(props).connect(this);

        this.children.push(synth);
      }
    }
  });
  
  this.amp = 1 / this.maxVoices;
  this.children = [];
  
  if(typeof arguments[0] === 'object') {
    this.maxVoices = arguments[0].maxVoices ? arguments[0].maxVoices : this.maxVoices
  }
  
  Gibberish.polyInit(this);
  this.initVoices()
  
  this.processProperties(arguments);
  
  this.initialized = false
  Gibberish._synth.oscillatorInit.call(this);
  Gibberish.dirty( this )
};

/**#Gibberish.Bus - Miscellaneous
Create a mono routing bus. A bus callback routes all it's inputs and scales them by the amplitude of the bus.  
  
For a stereo routing bus, see [Bus2](javascript:displayDocs('Gibberish.Bus2'\))

##Example Usage##    
`a = new Gibberish.Bus();  
b = new Gibberish.Sine(440).connect(a);  
c = new Gibberish.Sine(880).connect(a);  
a.amp = .1;  
a.connect();`
  
## Constructor     
**param** *properties*: Object. A dictionary of property values (see below) to set for the bus on initialization.
**/
/**###Gibberish.Bus.amp : property  
Array. Read-only. Relative volume for the sum of all ugens connected to the bus.
**/
Gibberish.bus = function(){
  this.type = 'bus';
  
  this.inputCodegen = function() {
    //console.log( this, this.value, this.value.valueOf() )
    var val = this.value.valueOf();
    var str;
    
    /*if( this.value.name === 'Drums' ) {
      str = '[ ' + val + '[0] * ' + this.amp + ', ' + val + '[1] * ' + this.amp + ']'  // works!
    }else{
      str = this.amp === 1 ? val : val + ' * ' + this.amp;
    }*/
      
    str = val + ', ' + this.amp 
    this.codeblock = str;
    return str;
  };

  this.addConnection = function() {
    var position = arguments[2]
    var arg = { 
      value:	      arguments[0], 
      amp:		      arguments[1], 
      codegen:      this.inputCodegen,
      valueOf:      function() { return this.codegen() }
    };
    
    if( typeof position !== 'undefined' ) {
      this.inputs.splice( position,0,arg );
    }else{
      this.inputs.push( arg );
    }

    Gibberish.dirty( this );
  };
  
  this.removeConnection = function(ugen) {
    for(var i = 0; i < this.inputs.length; i++) {
      if(this.inputs[i].value === ugen) {
        this.inputs.splice(i,1);
        Gibberish.dirty(this);
        break;
      }
    }
  };
  
  this.adjustSendAmount = function(ugen, amp) {
    for(var i = 0; i < this.inputs.length; i++) {
      if(this.inputs[i].value === ugen) {
        this.inputs[i].amp = amp;
        Gibberish.dirty(this);
        break;
      }
    }
  };
  
  this.callback = function() {
    var amp = arguments[arguments.length - 2]; // use arguments to accommodate arbitray number of inputs without using array
    var pan = arguments[arguments.length - 1];
    
    output[0] = output[1] = 0;
    
    for(var i = 0; i < arguments.length - 2; i+=2) {
      var isObject = typeof arguments[i] === 'object',
          _amp = arguments[i + 1]
          
      output[0] += isObject ? arguments[i][0] * _amp :arguments[i] * _amp;
      output[1] += isObject ? arguments[i][1] * _amp: arguments[i] * _amp;
    }
    
    output[0] *= amp;
    output[1] *= amp;
    
    return panner(output, pan, output);
  };
};

Gibberish.bus.prototype = new Gibberish.ugen();
Gibberish._bus = new Gibberish.bus();

Gibberish.Bus = function() {
  Gibberish.extend(this, {
    name : 'bus',
        
    properties : {
      inputs :  [],
      amp :     1,
    },

    callback : function() {
      var out = 0;
      var length = arguments.length - 1;
      var amp = arguments[length]; // use arguments to accommodate arbitray number of inputs without using array
      
      for(var i = 0; i < length; i++) {
        out += arguments[i];
      }
      out *= amp;
      
      return out;
    },
  });

  this.init();
  this.processProperties(arguments);
  
  return this;
};
Gibberish.Bus.prototype = Gibberish._bus;

/**#Gibberish.Bus2 - Miscellaneous
Create a stereo outing bus. A bus callback routes all it's inputs and scales them by the amplitude of the bus.

##Example Usage##    
`a = new Gibberish.Bus2();  
b = new Gibberish.Sine(440).connect(a);  
c = new Gibberish.Sine(880).connect(a);  
  
d = new Gibberish.Sequencer({ target:a, key:'pan', values:[-.75,.75], durations:[ 22050 ] }).start();
a.connect();`
  
## Constructor     
**param** *properties*: Object. A dictionary of property values (see below) to set for the bus on initialization.
**/
/**###Gibberish.Bus.amp : property  
Array. Read-only. Relative volume for the sum of all ugens connected to the bus.
**/
Gibberish.Bus2 = function() {
  this.name = 'bus2';
  this.type = 'bus';
  
  this.properties = {
    inputs :  [],
    amp :     1,
    pan :     0,
  };
  
  var output = [0,0],
      panner = Gibberish.makePanner(),
      phase = 0;
  
  this.callback = function() {
    // use arguments to accommodate arbitray number of inputs without using array    
    var args = arguments,
        length = args.length,
        amp = args[length - 2], 
        pan = args[length - 1]
    
    output[0] = output[1] = 0;
    
    //if(phase++ % 44100 === 0) console.log(args)
    for(var i = 0, l = length - 2; i < l; i+= 2) {
      var isObject = typeof args[i] === 'object',
          _amp = args[i + 1]
          
      output[0] += isObject ? args[i][0] * _amp || 0 : args[i] * _amp || 0;
      output[1] += isObject ? args[i][1] * _amp || 0 : args[i] * _amp || 0;
    }
    
    output[0] *= amp;
    output[1] *= amp;
    
    return panner(output, pan, output);
  };
  
  this.show = function() { console.log(output, args) }
  this.getOutput = function() { return output }
  this.getArgs = function() { return args }
  
  //this.initialized = false;
  this.init( arguments );
  this.processProperties( arguments );
};
Gibberish.Bus2.prototype = Gibberish._bus;
Gibberish.envelope = function() {
    this.type = 'envelope';
};
Gibberish.envelope.prototype = new Gibberish.ugen();
Gibberish._envelope = new Gibberish.envelope();

Gibberish.ExponentialDecay = function(){
	var pow = Math.pow,
      value = 0,
      phase = 0;
      
  Gibberish.extend(this, {
  	name:"ExponentialDecay",
  	properties: { decay:.5, length:11050 },

  	callback: function( decay, length ) {
  		value = pow( decay, phase );
  		phase += 1 / length;

  		return value;
  	},
    
    trigger : function() {
      phase = typeof arguments[0] === 'number' ? arguments[0] : 0;
    },
  })
  .init()
};
Gibberish.ExponentialDecay.prototype = Gibberish._envelope;

Gibberish.Line = function(start, end, time, loops) {
	var that = { 
		name:		'line',

    properties : {
  		start:	start || 0,
  		end:		isNaN(end) ? 1 : end,
  		time:		time || Gibberish.context.sampleRate,
  		loops:	loops || false,
    },
    
    retrigger: function( end, time ) {
      phase = 0;
      this.start = out
      this.end = end
      this.time = time
      
      incr = (end - out) / time
    },
    
    getPhase: function() { return phase },
    getIncr: function() { return incr },
    getOut: function() { return out }
	};
  
	var phase = 0,
	    incr = (end - start) / time,
      out
  
  //console.log("INCREMENT", incr, end, start, time )
  
	this.callback = function(start, end, time, loops) {
    var incr = (end - start) / time
		out = phase < time ? start + ( phase++ * incr) : end;
				
		phase = (out >= end && loops) ? 0 : phase;
		
		return out;
	};
  
  this.setPhase = function(v) { phase = v; }
  
  Gibberish.extend(this, that);
  
  this.init();

  return this;
};
Gibberish.Line.prototype = Gibberish._envelope;

Gibberish.Ease = function( start, end, time, easein, loops ) {
  var sqrt = Math.sqrt, out = 0, phase = 0
      
  start = start || 0
  end = end || 1
  time = time || Gibberish.context.sampleRate
  loops = loops || false
  easein = typeof easein === 'undefined' ? 1 : easein
  
	var that = { 
		name:		'ease',
    properties : {},
    retrigger: function( end, time ) {
      phase = 0;
      this.start = out
      this.end = end
      this.time = time      
    },
    
    getPhase: function() { return phase },
    getOut: function() { return out }
	};
  
	this.callback = function() {
    var x = phase++ / time,
        y = easein ? 1 - sqrt( 1 - x * x ) : sqrt( 1 - ((1-x) * (1-x)) )
    
    out = phase < time ? start + ( y * ( end - start ) ) : end
    
		//out = phase < time ? start + ( phase++ * incr) : end;
				
		phase = (out >= end && loops) ? 0 : phase;
		
		return out;
	};
  
  this.setPhase = function(v) { phase = v; }
  this.setEase = function(v) {
    easein = v
  }
  
  Gibberish.extend(this, that);
  
  this.init();

  return this;
};
Gibberish.Ease.prototype = Gibberish._envelope;

// quadratic bezier
// adapted from http://www.flong.com/texts/code/shapers_bez/
Gibberish.Curve = function( start, end, time, a, b, fadeIn, loops ) {
  var sqrt = Math.sqrt, 
      out = 0,
      phase = 0
      
  start = start || 0
  end = end || 1
  time = time || Gibberish.context.sampleRate
  a = a || .940
  b = b || .260
  loops = loops || false
  fadeIn = typeof fadeIn === 'undefined' ? 1 : fadeIn
  
	var that = { 
		name:		'curve',

    properties : {},
    
    retrigger: function( end, time ) {
      phase = 0;
      this.start = out
      this.end = end
      this.time = time
      
      incr = (end - out) / time
    },
    
    getPhase: function() { return phase },
    getOut: function() { return out }
	};
  
	this.callback = function() {
    var x = phase++ / time,
        om2a = 1 - 2 * a,
        t = ( sqrt( a*a + om2a*x ) - a ) / om2a,
        y = (1-2*b) * (t*t) + (2*b) * t
    
    out = phase < time ? start + ( y * ( end - start ) ) : end
    
    if( !fadeIn ) out =  1 - out
    
		//out = phase < time ? start + ( phase++ * incr) : end;
				
		phase = (out >= end && loops) ? 0 : phase;
		
		return out;
	};
  
  this.setPhase = function(v) { phase = v; }
  
  Gibberish.extend(this, that);
  
  this.init();

  return this;
};
Gibberish.Curve.prototype = Gibberish._envelope;

Gibberish.Lines = function( values, times, loops ) {
  var out = values[0],
      phase = 0,
      valuesPhase = 1,
      timesPhase = 0,
      targetValue = 0,
      targetTime = 0,
      end = false,
      incr
  
  
  if( typeof values === 'undefined' ) values = [ 0,1 ]
  if( typeof times  === 'undefined' ) times  = [ 44100 ]  
    
  targetValue = values[ valuesPhase ]
  targetTime  = times[ 0 ]
  
  incr = ( targetValue - values[0] ) / targetTime
  //console.log( "current", out, "target", targetValue, "incr", incr )
  
  loops = loops || false
  
	var that = { 
		name:		'lines',

    properties : {},
    
    retrigger: function() {
      phase = 0
      out = values[0]
      targetTime = times[ 0 ]
      targetValue = values[ 1 ]
      valuesPhase = 1
      timesPhase = 0
      incr = ( targetValue - out ) / targetTime
      end = false
    },
    
    getPhase: function() { return phase },
    getOut:   function() { return out }
	};
  
  that.run = that.retrigger
  
	this.callback = function() {
    if( phase >= targetTime && !end ) {
      if( valuesPhase < values.length - 1 ) {
        var timeStep = times[ ++timesPhase % times.length ]
        targetTime = phase + timeStep
        targetValue = values[ ++valuesPhase % values.length ]
        incr = ( targetValue - out ) / timeStep        
      }else{
        if( !loops ) {
          end = true
          out = values[ values.length - 1 ]
        }else{
          phase = 0
          out = values[0]
          targetTime = times[ 0 ]
          targetValue = values[ 1 ]
          valuesPhase = 1
          timesPhase = 0
          incr = ( targetValue - out ) / targetTime
        }
      }
    }else if( !end ) {
      out += incr
      phase++
    }
		
		return out;
	};
  
  this.setPhase = function(v) { phase = v; }
  
  Gibberish.extend(this, that);
  
  this.init();

  return this;
};
Gibberish.Lines.prototype = Gibberish._envelope;

Gibberish.AD = function(_attack, _decay) {
  var phase = 0,
      state = 0;
      
  Gibberish.extend( this,{
    name : "AD",
  	properties : {
      attack :	_attack || 10000,
  	  decay  :	_decay  || 10000,
    },

  	run : function() {
  		state = 0;
      phase = 0;
  		return this;			
    },
  	callback : function(attack,decay) {
  		attack = attack < 0 ? 22050 : attack;
  		decay  = decay  < 0 ? 22050 : decay;				
  		if(state === 0){
  			var incr = 1 / attack;
  			phase += incr;
  			if(phase >=1) {
  				state++;
  			}
  		}else if(state === 1){
  			var incr = 1 / decay;
  			phase -= incr;
  			if(phase <= 0) {
  				phase = 0;
  				state++;;
  			}			
  		}
  		return phase;
    },
    getState : function() { return state; },
  })
  .init()
  .processProperties(arguments);
};
Gibberish.AD.prototype = Gibberish._envelope;

Gibberish.ADSR = function(attack, decay, sustain, release, attackLevel, sustainLevel, requireReleaseTrigger) {
	var that = { 
    name:   "adsr",
		type:		"envelope",
    'requireReleaseTrigger' : typeof requireReleaseTrigger !== 'undefined' ? requireReleaseTrigger : false,
    
    properties: {
  		attack:		isNaN(attack) ? 10000 : attack,
  		decay:		isNaN(decay) ? 10000 : decay,
  		sustain: 	isNaN(sustain) ? 22050 : sustain,
  		release:	isNaN(release) ? 10000 : release,
  		attackLevel:  attackLevel || 1,
  		sustainLevel: sustainLevel || .5,
      releaseTrigger: 0,
    },

		run: function() {
			this.setPhase(0);
			this.setState(0);
		},
    stop : function() {
      this.releaseTrigger = 1
    }
	};
	Gibberish.extend(this, that);
	
	var phase = 0,
	    state = 0,
      rt  = 0,
      obj = this;
      
  this.callback = function(attack,decay,sustain,release,attackLevel,sustainLevel,releaseTrigger) {
		var val = 0;
    rt = rt === 1 ? 1 : releaseTrigger;
		if(state === 0){
			val = phase / attack * attackLevel;
			if(++phase / attack >= 1) {
				state++;
				phase = decay;
			}
		}else if(state === 1) {
			val = phase / decay * (attackLevel - sustainLevel) + sustainLevel;
			if(--phase <= 0) {
				if(sustain !== null){
					state += 1;
					phase = sustain;
				}else{
					state += 2;
					phase = release;
				}
			}
		}else if(state === 2) {
			val = sustainLevel;
      if( obj.requireReleaseTrigger && rt ){
        state++;
        phase = release;
        obj.releaseTrigger = 0;
        rt = 0;
      }else if(phase-- <= 0 && !obj.requireReleaseTrigger) {
				state++;
				phase = release;
			}
		}else if(state === 3) {
      phase--;
			val = (phase / release) * sustainLevel;
			if(phase <= 0) {
        state++;
      }
		}
		return val;
	};
  this.call = function() {
    return this.callback( this.attack, this.decay, this.sustain, this.release, this.attackLevel, this.sustainLevel, this.releaseTrigger )
  };
  this.getPhase = function() { return phase; };
	this.setPhase = function(newPhase) { phase = newPhase; };
	this.setState = function(newState) { state = newState; phase = 0; };
	this.getState = function() { return state; };		
	
  this.init();
  
	return this;
};
Gibberish.ADSR.prototype = Gibberish._envelope;

Gibberish.ADR = function(attack, decay, release, attackLevel, releaseLevel) {
	var that = { 
    name:   "adr",
		type:		"envelope",
    
    properties: {
  		attack:		isNaN(attack) ? 11025 : attack,
  		decay:		isNaN(decay) ? 11025 : decay,
  		release:	isNaN(release) ? 22050 : release,
  		attackLevel:  attackLevel || 1,
  		releaseLevel: releaseLevel || .2,
    },

		run: function() {
			this.setPhase(0);
			this.setState(0);
		},
	};
	Gibberish.extend(this, that);
	
	var phase = 0;
	var state = 0;
  
	this.callback = function(attack,decay,release,attackLevel,releaseLevel) {
		var val = 0;
		if(state === 0){
			val = phase / attack * attackLevel;
			if(++phase / attack === 1) {
				state++;
				phase = decay;
			}
		}else if(state === 1) {
			val = (phase / decay) * (attackLevel - releaseLevel) + releaseLevel;
			if(--phase <= 0) {
					state += 1;
					phase = release;
			}
		}else if(state === 2){
      phase--;
      
			val = (phase / release) * releaseLevel;
			if(phase <= 0) {
        state++;
      }
		}
		return val;
	};
	this.setPhase = function(newPhase) { phase = newPhase; };
	this.setState = function(newState) { state = newState; phase = 0; };
	this.getState = function() { return state; };		
	
  this.init();
  
	return this;
};
Gibberish.ADR.prototype = Gibberish._envelope;
/*
Analysis ugens have two callbacks, one to perform the analysis and one to output the results.
This allows the analysis to occur at the end of the callback while the outback can occur at
the beginning, in effect using a single sample delay.

Because of the two callbacks, there are also two codegen methods. The default codegens used by
the analysis prototype object should be fine for most applications.
*/

Gibberish.analysis = function() {
  this.type = 'analysis';
  
  this.codegen = function() {
    if(Gibberish.memo[this.symbol]) {
      return Gibberish.memo[this.symbol];
    }else{
      var v = this.variable ? this.variable : Gibberish.generateSymbol('v');
      Gibberish.memo[this.symbol] = v;
      this.variable = v;
      Gibberish.callbackArgs.push( this.symbol )
      Gibberish.callbackObjects.push( this.callback )
    }
        
    this.codeblock = "var " + this.variable + " = " + this.symbol + "();\n";
    
    if( Gibberish.codeblock.indexOf( this.codeblock ) === -1 ) Gibberish.codeblock.push( this.codeblock )
    return this.variable;
  }
  
  this.analysisCodegen = function() {
    // TODO: can this be memoized somehow?
    //if(Gibberish.memo[this.analysisSymbol]) {
    //  return Gibberish.memo[this.analysisSymbol];
    //}else{
    // Gibberish.memo[this.symbol] = v;
    // console.log( this.input )
    
    var input = 0;
    if(this.input.codegen){
      input = this.input.codegen()
      //console.log( "PROPERTY UGEN", input)
      if(input.indexOf('op') > -1) console.log("ANALYSIS BUG")
    }else if( this.input.value ){
      input = typeof this.input.value.codegen !== 'undefined' ? this.input.value.codegen() : this.input.value
    }else{
      input = 'null'
    }
    
    var s = this.analysisSymbol + "(" + input + ",";
    for(var key in this.properties) {
      if(key !== 'input') {
        s += this[key] + ",";
      }
    }
    s = s.slice(0, -1); // remove trailing comma
    s += ");";
  
    this.analysisCodeblock = s;
    
    if( Gibberish.analysisCodeblock.indexOf( this.analysisCodeblock ) === -1 ) Gibberish.analysisCodeblock.push( this.analysisCodeblock )
    
    if( Gibberish.callbackObjects.indexOf( this.analysisCallback) === -1 ) Gibberish.callbackObjects.push( this.analysisCallback )
    
    //console.log( this.analysisCallback )
        
    return s;
  };
  
  this.remove = function() {
    Gibberish.analysisUgens.splice( Gibberish.analysisUgens.indexOf( this ), 1 )
  }
  
  this.analysisInit = function() {
    this.analysisSymbol = Gibberish.generateSymbol(this.name);
    Gibberish.analysisUgens.push( this );
    Gibberish.dirty(); // dirty in case analysis is not connected to graph, 
  };
  
};
Gibberish.analysis.prototype = new Gibberish.ugen();
Gibberish._analysis = new Gibberish.analysis();

Gibberish.Follow = function() {
  this.name = 'follow';
    
  this.properties = {
    input : 0,
    bufferSize : 4410,
    mult : 1,
    useAbsoluteValue:true // for amplitude following, false for other values
  };
  
  this.storage = [];
    
  var abs = Math.abs,
      history = [0],
      sum = 0,
      index = 0,
      value = 0,
      phase = 0;
      
  this.analysisCallback = function(input, bufferSize, mult, useAbsoluteValue ) {
    if( typeof input === 'object' ) input = input[0] + input[1]
    
  	sum += useAbsoluteValue ? abs(input) : input;
  	sum -= history[index];
    
  	history[index] = useAbsoluteValue ? abs(input) : input;
    
  	index = (index + 1) % bufferSize;
			
    // if history[index] isn't defined set it to 0 
    // TODO: does this really need to happen here? I guess there were clicks on initialization...
    history[index] = history[index] ? history[index] : 0;
  	value = (sum / bufferSize) * mult;
  };
    
  this.callback = this.getValue = function() { return value; };
    
  this.init();
  this.analysisInit();
  this.processProperties( arguments );
  
  var oldBufferSize = this.__lookupSetter__( 'bufferSize' ),
      bs = this.bufferSize
  
  Object.defineProperty( this, 'bufferSize', {
    get: function() { return bs },
    set: function(v) { bs = v; sum = 0; history = [0]; index = 0; }
  })
  
  this.getStorage = function() { return this.storage; }
};
Gibberish.Follow.prototype = Gibberish._analysis;

Gibberish.SingleSampleDelay = function() {
  this.name = 'single_sample_delay';
  
  this.properties = {
    input : arguments[0] || 0,
    amp   : arguments[1] || 1,
  };
  
  var value = 0,
      phase = 0;
  
  this.analysisCallback = function(input, amp) {
    /*if(typeof input === 'object') {
      value = typeof input === 'object' ? [input[0] * amp, input[1] * amp ] : input * amp;
    }else{
      value = input * amp;
    }*/
    value = input
    //if(phase++ % 44100 === 0) console.log(value, input, amp)
  };
  
  this.callback = function() {
    //if(phase % 44100 === 0) console.log(value)
    
    return value;
  };
  
  this.getValue = function() { return value }
  this.init();
  this.analysisInit();
  this.processProperties( arguments );
  
};
Gibberish.SingleSampleDelay.prototype = Gibberish._analysis;

Gibberish.Record = function(_input, _size, oncomplete) {
  var buffer      = new Float32Array(_size),
      phase       = 0,
      isRecording = false,
      self        = this;

  Gibberish.extend(this, {
    name: 'record',
    'oncomplete' :  oncomplete,
    
    properties: {
      input:   0,
      size:    _size || 0,
    },
    
    analysisCallback : function(input, length) {
      if(isRecording) {
        buffer[phase++] = typeof input === 'object' ? input[0] + input[1] : input;
        
        if(phase >= length) {
          isRecording = false;
          self.remove();
        }
      }
    },
    
    record : function() {
      phase = 0;
      isRecording = true;
      return this;
    },
    
    getBuffer : function() { return buffer; },
    getPhase : function() { return phase; },
    
    remove : function() {
      if(typeof this.oncomplete !== 'undefined') this.oncomplete();
      
      for(var i = 0; i < Gibberish.analysisUgens.length; i++) {
        var ugen = Gibberish.analysisUgens[i];
        if(ugen === this) {
          if( Gibberish.callbackArgs.indexOf( this.analysisSymbol) > -1 ) {
            Gibberish.callbackArgs.splice( Gibberish.callbackArgs.indexOf( this.analysisSymbol), 1 )
          }
          if( Gibberish.callbackObjects.indexOf( this.analysisCallback ) > -1 ) {
            Gibberish.callbackObjects.splice( Gibberish.callbackObjects.indexOf( this.analysisCallback ), 1 )
          }
          Gibberish.analysisUgens.splice(i, 1);
          return;
        }
      }
    },
  });
  // cannot be assigned within extend call
  this.properties.input = _input;

  this.init();
  this.analysisInit();
  
  Gibberish.dirty(); // ugen is not attached to anything else
};
Gibberish.Record.prototype = Gibberish._analysis;
Gibberish.effect = function() {
    this.type = 'effect';
};
Gibberish.effect.prototype = new Gibberish.ugen();
Gibberish._effect = new Gibberish.effect();

/**#Gibberish.Distortion - FX
A simple waveshaping distortion that adaptively scales its gain based on the amount of distortion applied.
  
## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 });  
b = new Gibberish.Distortion({ input:a, amount:30 }).connect();  
a.note(440);  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Distortion.amount : property  
Number. The amount of distortion to apply. This number cannot be set lower than 2.
**/
Gibberish.Distortion = function() {
  var abs = Math.abs, 
      log = Math.log, 
      ln2 = Math.LN2;
  
  Gibberish.extend(this, {
    name : 'distortion',
    
    properties : {
      input  : 0,
      amount : 50,
    },
    
    callback : function(input, amount) {
      var x;
      amount = amount > 2 ? amount : 2;
      if(typeof input === 'number') {
    		x = input * amount;
    		input = (x / (1 + abs(x))) / (log(amount) / ln2); //TODO: get rid of log / divide
      }else{
        x = input[0] * amount;
        input[0] = (x / (1 + abs(x))) / (log(amount) / ln2); //TODO: get rid of log / divide
        x = input[1] * amount;
        input[1] = (x / (1 + abs(x))) / (log(amount) / ln2); //TODO: get rid of log / divide      
      }
  		return input;
    },
  })
  .init()
  .processProperties(arguments);
};
Gibberish.Distortion.prototype = Gibberish._effect;

/**#Gibberish.Gain - FX
Amplitude attenutation / gain.
  
## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 });  
b = new Gibberish.Distortion({ input:a, amount:30 })
c = new Gibberish.Gain({ input:b, amount:.5 }).connect()
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Gain.amount : property  
Number. The amount of gain to multiply the inpyt signal by.
**/
Gibberish.Gain = function() {  
  
  Gibberish.extend(this, {
    name : 'gain',
    
    properties : {
      input  : 0,
      amount : 1,
    },
    
    callback : function(input, amount) {
      if(typeof input === 'number') {
        input *= amount;
      }else{
        input[0] *=amount;
        input[1] *=amount;
      }
  		return input;
    },
  })
  .init()
  .processProperties(arguments);
  
};
Gibberish.Gain.prototype = Gibberish._effect;

/**#Gibberish.Delay - FX
A simple echo effect.
  
## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 });  
b = new Gibberish.Delay({ input:a, time:22050, feedback:.35 }).connect();  
a.note(440);  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Delay.time : property  
Number. The delay time as measured in samples
**/
/**###Gibberish.Delay.feedback : property  
Number. The amount of feedback that the delay puts into its buffers.
**/
Gibberish.Delay = function() {
  var buffers = [],
      phase = 0;
  
  buffers.push( new Float32Array(Gibberish.context.sampleRate * 2) );
  buffers.push( new Float32Array(Gibberish.context.sampleRate * 2) );
  
  Gibberish.extend(this, {
  	name:"delay",
  	properties:{ input:0, time: 22050, feedback: .5, wet:1, dry:1, rate:1 },
				
  	callback : function( sample, time, feedback, wet, dry, rate ) {
      var channels = typeof sample === 'number' ? 1 : 2;
      
  		var _phase = phase++ % 88200;
      time = time / rate;
  		var delayPos = (_phase + ( time | 0 )) % 88200;
      
      if(channels === 1) {
  			buffers[0][delayPos] =  sample + (buffers[0][_phase] ) * feedback;
        sample = (sample * dry) + (buffers[0][_phase] * wet);
      }else{
  			buffers[0][delayPos] =  sample[0] + buffers[0][_phase] * feedback;
        sample[0] = (sample[0] * dry) + (buffers[0][_phase] * wet);
  			buffers[1][delayPos] =  sample[1] + buffers[1][_phase] * feedback;
        sample[1] = (sample[1] * dry) + (buffers[1][_phase] * wet);
      }
      
  		return sample;
  	},
  });
  
  var time = Math.round( this.properties.time );
  Object.defineProperty(this, 'time', {
    configurable: true,
    get: function() { return time; },
    set: function(v) { time = Math.round(v); Gibberish.dirty( this ) }
  });
  
  this.init();
  this.processProperties(arguments);
  
};
Gibberish.Delay.prototype = Gibberish._effect;

/**#Gibberish.Decimator - FX
A bit-crusher / sample rate reducer. Adapted from code / comments at http://musicdsp.org/showArchiveComment.php?ArchiveID=124

## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 });  
b = new Gibberish.Decimator({ input:a, bitDepth:4.2, sampleRate:.33 }).connect();  
a.note(440);  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Decimator.bitDepth : property  
Float. 0..16. The number of bits the signal is truncated to. May be a floating point number.
**/
/**###Gibberish.Decimator.sampleRate : property  
Number. 0..1. The sample rate to use where 0 is 0 Hz and 1 is nyquist.
**/
Gibberish.Decimator = function() {
  var counter = 0,
      hold = [],
      pow = Math.pow,
      floor = Math.floor;
      
  Gibberish.extend(this, {
  	name:"decimator",
  	properties:{ input:0, bitDepth: 16, sampleRate: 1 },
				
  	callback : function(sample, depth, rate) {
  		counter += rate;
      var channels = typeof sample === 'number' ? 1 : 2;
      
      if(channels === 1) {
  			if(counter >= 1) {
  				var bitMult = pow( depth, 2.0 );
  				hold[0]  = floor( sample * bitMult ) / bitMult;
  				counter -= 1;
  			}
  			sample = hold[0];
      }else{
  			if(counter >= 1) {
  				var bitMult = pow( depth, 2.0 );
  				hold[0]  = floor( sample[0] * bitMult ) / bitMult;
  				hold[1]  = floor( sample[1] * bitMult ) / bitMult;          
  				counter -= 1;
  			}
  			sample = hold;
      }
					
  		return sample;
  	},
  })
  .init()
  .processProperties(arguments);
};
Gibberish.Decimator.prototype = Gibberish._effect;

/**#Gibberish.RingModulation - FX
The name says it all. This ugen also has a mix property to control the ratio of wet to dry output.

## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 });  
b = new Gibberish.RingModulation({ input:a, frequency:1000, amp:.4, mix:1 }).connect();  
a.note(440);  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.RingModulation.frequency : property  
Float. The frequency of the ring modulation modulator wave.
**/
/**###Gibberish.RingModulation.amp : property  
Float. The amplitude of the ring modulation modulator wave.
**/
/**###Gibberish.RingModulation.mix : property  
Float. 0..1. The wet/dry output ratio. A value of 1 means a completely wet signal, a value of 0 means completely dry.
**/
Gibberish.RingModulation = function() {
  var sin = new Gibberish.Sine().callback,
      output = [0,0];
      
  Gibberish.extend( this, { 
  	name : "ringmod",
  
	  properties : { input:0, frequency:440, amp:.5, mix:.5 },

    callback : function(sample, frequency, amp, mix) {
      var channels = typeof sample === 'number' ? 1 : 2;
      var output1 = channels === 1 ? sample : sample[0];
      
      var mod = sin(frequency, amp);
      
      output1 = output1 * (1-mix) + (output1 * mod) * mix;
      
      if(channels === 2) {
        var output2 = sample[1];
        output2 = output2 * (1-mix) + (output2 * mod) * mix;

        output[0] = output1;
        output[1] = output2;
        return output;
      }
      
		  return output1; // return mono
  	},
  })
  .init()
  .processProperties(arguments); 
};
Gibberish.RingModulation.prototype = Gibberish._effect;


/**#Gibberish.DCBlock - FX
A one-pole filter for removing bias.

## Example Usage##
` `  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.DCBlock.input : property  
Float. The input ugen to remove bias from.
**/

Gibberish.DCBlock = function() {
  var x1 = 0, y1 = 0

	Gibberish.extend(this, {
  	name: 'dcblock',
    type: 'effect',
    
    properties : {
      input : 0, 
    },
    
    reset : function() {
      x1 = 0;
      y1 = 0;
    },
    
    callback : function(input) {
      var y = input - x1 + y1 * .9997
      x1 = input
      y1 = y
    
      return y;
    }
  })
  .init()
  .processProperties(arguments);
};
Gibberish.DCBlock.prototype = Gibberish._effect;

/**#Gibberish.Tremolo - FX
A basic amplitude modulation effect.

## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 }).connect();  
b = new Gibberish.Tremolo({input:a, frequency:4, amp:1});   
a.note(880);   
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Tremolo.input : property  
Float. The input to apply the tremolo effect to
**/
/**###Gibberish.Tremolo.frequency : property  
Float. The speed of the tremolo effect, measured in Hz
**/
/**###Gibberish.Tremolo.amp : property  
Float. The magnitude of the tremolo effect.
**/

Gibberish.Tremolo = function() {
  var modulationCallback = new Gibberish.Sine().callback
  
	Gibberish.extend(this, {
  	name: 'tremolo',
    type: 'effect',
    
    properties : {
      input : 0,
      frequency:2.5,
      amp:.5,
    },
  
    callback : function( input, frequency, amp ) {
      var channels = typeof input === 'number' ? 1 : 2,
          modAmount = modulationCallback( frequency, amp )
      
      if(channels === 1) {
        input *= modAmount
      }else{
        input[0] *= modAmount
        input[1] *= modAmount
      }
      
      return input;
    }
  })
  .init()
  .processProperties(arguments);
};
Gibberish.Tremolo.prototype = Gibberish._effect;

/**#Gibberish.OnePole - FX
A one-pole filter for smoothing property values. This is particularly useful when the properties are being controlled interactively. You use the smooth method to apply the filter.

## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 }).connect();  
b = new Gibberish.OnePole({input:a.properties.frequency, a0:.0001, b1:.9999});  
b.smooth('frequency', a);  
a.note(880);  
a.note(440);  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.OnePole.input : property  
Float. The property to smooth. You should always refer to this property through the properties dictionary of the ugen. In general it is much easier to use the smooth method of the OnePole than to set this property manually.
**/
/**###Gibberish.OnePole.a0 : property  
Float. The value the input is multiplied by.
**/
/**###Gibberish.OnePole.b1 : property  
Float. The value this pole of the filter is multiplied by.
**/
Gibberish.OnePole = function() {
  var history = 0,
      phase = 0;
      
	Gibberish.extend(this, {
  	name: 'onepole',
    type: 'effect',
    
    properties : {
      input : 0,
      a0 : .15,           
      b1 : .85, 
    },
    
    callback : function(input, a0, b1) {
      var out = input * a0 + history * b1;
      history = out;
    
      return out;
    },

/**###Gibberish.OnePole.smooth : method  
Use this to apply the filter to a property of an object.

param **propertyName** String. The name of the property to smooth.  
param **object** Object. The object containing the property to be smoothed
**/    
    smooth : function(property, obj) {
      this.input = obj[ property ]
      history = this.input
      obj[ property ] = this
      
      this.obj = obj
      this.property = property
      
      this.oldSetter = obj.__lookupSetter__( property )
      this.oldGetter = obj.__lookupGetter__( property )
      
      var op = this
      Object.defineProperty( obj, property, {
        get : function() { return op.input },
        set : function(v) { 
          op.input = v
        }
      })
    },

/**###Gibberish.OnePole.remove : method  
Remove OnePole from assigned ugen property. This will effectively remove the filter from the graph and return the normal target ugen property behavior.
**/      
    remove : function() {
      Object.defineProperty( this.obj, this.property, {
        get: this.oldGetter,
        set: this.oldSetter
      })
      
      this.obj[ this.property ] = this.input
    }
  })
  .init()
  .processProperties(arguments);
};
Gibberish.OnePole.prototype = Gibberish._effect;

/**#Gibberish.Filter24 - FX
A four pole ladder filter. Adapted from Arif Ove Karlsne's 24dB ladder approximation: http://musicdsp.org/showArchiveComment.php?ArchiveID=141.

## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 });  
b = new Gibberish.Filter24({input:a, cutoff:.2, resonance:4}).connect();  
a.note(1760);   
a.note(440);  
a.isLowPass = false;  
a.note(220);  
a.note(1760);  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Filter24.input : property  
Object. The ugen that should feed the filter.
**/
/**###Gibberish.Filter24.cutoff : property  
Number. 0..1. The cutoff frequency for the synth's filter.
**/
/**###Gibberish.Filter24.resonance : property  
Number. 0..50. Values above 4.5 are likely to produce shrieking feedback. You are warned.
**/
/**###Gibberish.Filter24.isLowPass : property  
Boolean. Default true. Whether to use a low-pass or high-pass filter.
**/
Gibberish.Filter24 = function() {
  var poles  = [0,0,0,0],
      poles2 = [0,0,0,0],
      output = [0,0],
      phase  = 0,
      _cutoff = isNaN(arguments[0]) ? .1 : arguments[0],
      _resonance = isNaN(arguments[1]) ? 3 : arguments[1]
      _isLowPass = typeof arguments[2] !== 'undefined' ? arguments[2] : true;
      
  Gibberish.extend( this, { 
  	name : "filter24",
  
	  properties : { input:0, cutoff:_cutoff, resonance:_resonance, isLowPass:_isLowPass },

    callback : function(sample, cutoff, resonance, isLowPass) {
      var channels = typeof sample === 'number' ? 1 : 2;
      var output1 = channels === 1 ? sample : sample[0];
      
			var rezz = poles[3] * resonance; 
			rezz = rezz > 1 ? 1 : rezz;
						
			cutoff = cutoff < 0 ? 0 : cutoff;
			cutoff = cutoff > 1 ? 1 : cutoff;
						
			output1 -= rezz;

			poles[0] = poles[0] + ((-poles[0] + output1) * cutoff);
			poles[1] = poles[1] + ((-poles[1] + poles[0])  * cutoff);
			poles[2] = poles[2] + ((-poles[2] + poles[1])  * cutoff);
			poles[3] = poles[3] + ((-poles[3] + poles[2])  * cutoff);

			output1 = isLowPass ? poles[3] : output1 - poles[3];
      
      if(channels === 2) {
        var output2 = sample[1];

  			rezz = poles2[3] * resonance; 
  			rezz = rezz > 1 ? 1 : rezz;

  			output2 -= rezz;

  			poles2[0] = poles2[0] + ((-poles2[0] + output2) * cutoff);
  			poles2[1] = poles2[1] + ((-poles2[1] + poles2[0])  * cutoff);
  			poles2[2] = poles2[2] + ((-poles2[2] + poles2[1])  * cutoff);
  			poles2[3] = poles2[3] + ((-poles2[3] + poles2[2])  * cutoff);

  			output2 = isLowPass ? poles2[3] : output2 - poles2[3];
        output[0] = output1;
        output[1] = output2;
        
        return output;
      }
      
		  return output1; // return mono
  	},
  })
  .init()
  .processProperties(arguments);
};
Gibberish.Filter24.prototype = Gibberish._effect;

/**#Gibberish.SVF - FX
A two-pole state variable filter. This filter calculates coefficients on a per-sample basis, so that you can easily modulate cutoff and Q. Can switch between low-pass, high-pass, band and notch modes.

## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 });  
b = new Gibberish.SVF({input:a, cutoff:200, Q:4, mode:0});  
a.note(1760);   
a.note(440);  
a.mode = 2;
a.note(220);  
a.note(1760);  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.SVF.input : property  
Object. The ugen that should feed the filter.
**/
/**###Gibberish.SVF.cutoff : property  
Number. 0..22050. The cutoff frequency for the synth's filter. Note that unlike the Filter24, this is measured in Hz.
**/
/**###Gibberish.SVF.resonance : property  
Number. 0..50. Values above 4.5 are likely to produce shrieking feedback. You are warned.
**/
/**###Gibberish.SVF.mode : property  
Number. 0..3. 0 = lowpass, 1 = highpass, 2 = bandpass, 3 = notch.
**/
Gibberish.SVF = function() {
	var d1 = [0,0], d2 = [0,0], pi= Math.PI, out = [0,0];
  
  Gibberish.extend( this, {
  	name:"SVF",
  	properties : { input:0, cutoff:440, Q:2, mode:0, sr: Gibberish.context.sampleRate },
				
  	callback: function(sample, frequency, Q, mode, sr) {
      var channels = typeof sample === 'number' ? 1 : 2;
      var output1 = channels === 1 ? sample : sample[0];
      
  		var f1 = 2 * pi * frequency / sr;
  		Q = 1 / Q;
					
			var l = d2[0] + f1 * d1[0];
			var h = output1 - l - Q * d1[0];
			var b = f1 * h + d1[0];
			var n = h + l;
						
			d1[0] = b;
			d2[0] = l;
      
			if(mode === 0) 
				output1 = l;
			else if(mode === 1)
				output1 = h;
			else if(mode === 2)
				output1 = b;
			else
				output1 = n;
        
      if(channels === 2) {
        var output2 = sample[1];
  			var l = d2[1] + f1 * d1[1];
  			var h = output2 - l - Q * d1[1];
  			var b = f1 * h + d1[1];
  			var n = h + l;
						
  			d1[1] = b;
  			d2[1] = l;
      
  			if(mode === 0) 
  				output2 = l;
  			else if(mode === 1)
  				output2 = h;
  			else if(mode === 2)
  				output2 = b;
  			else
  				output2 = n;
          
        out[0] = output1; out[1] = output2;
      }else{
        out = output1;
      }

  		return out;
  	},
  })
  .init()
  .processProperties(arguments);
};
Gibberish.SVF.prototype = Gibberish._effect;

/**#Gibberish.Biquad - FX
A two-pole biquad filter. Currently, you must manually call calculateCoefficients every time mode, cutoff or Q changes; thus this filter isn't good for samplerate modulation.

## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 });  
b = new Gibberish.Biquad({input:a, cutoff:200, Q:4, mode:"LP"}).connect();  
a.note(1760);   
a.note(440);  
a.mode = "HP";
a.note(220);  
a.note(1760);  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Biquad.input : property  
Object. The ugen that should feed the filter.
**/
/**###Gibberish.Biquad.cutoff : property  
Number. 0..22050. The cutoff frequency for the synth's filter. Note that unlike the Filter24, this is measured in Hz.
**/
/**###Gibberish.Biquad.Q : property  
Number. 0..50. Values above 4.5 are likely to produce shrieking feedback. You are warned.
**/
/**###Gibberish.Biquad.mode : property  
Number. 0..3. "LP" = lowpass, "HP" = highpass, "BP" = bandpass
**/
Gibberish.Biquad = function() {
  var x1L = 0,
      x2L = 0,
      y1L = 0,
      y2L = 0,
      x1R = 0,
      x2R = 0,
      y1R = 0,
      y2R = 0,
      out = [0,0],
	    b0 = 0.001639,
	    b1 = 0.003278,
	    b2 = 0.001639,
	    a1 = -1.955777,
	    a2 = 0.960601,
      _mode = "LP",
    	_cutoff = 2000,
      _Q = .5,
      sr = Gibberish.context.sampleRate,
      _phase = 0;
      
	Gibberish.extend(this, {
		name: "biquad",

	  properties: {
      input: null,
	  },

	  calculateCoefficients: function() {
      switch (_mode) {
	      case "LP":
           var w0 = 2 * Math.PI * _cutoff / sr,
               sinw0 = Math.sin(w0),
               cosw0 = Math.cos(w0),
               alpha = sinw0 / (2 * _Q);
           b0 = (1 - cosw0) / 2,
           b1 = 1 - cosw0,
           b2 = b0,
           a0 = 1 + alpha,
           a1 = -2 * cosw0,
           a2 = 1 - alpha;
           break;
	       case "HP":
           var w0 = 2 * Math.PI * _cutoff / sr,
               sinw0 = Math.sin(w0),
               cosw0 = Math.cos(w0),
               alpha = sinw0 / (2 * _Q);
           b0 = (1 + cosw0) / 2,
           b1 = -(1 + cosw0),
           b2 = b0,
           a0 = 1 + alpha,
           a1 = -2 * cosw0,
           a2 = 1 - alpha;
           break;
	       case "BP":
           var w0 = 2 * Math.PI * _cutoff / sr,
               sinw0 = Math.sin(w0),
               cosw0 = Math.cos(w0),
               toSinh = Math.log(2) / 2 * _Q * w0 / sinw0,
               alpha = sinw0 * (Math.exp(toSinh) - Math.exp(-toSinh)) / 2;
           b0 = alpha,
           b1 = 0,
           b2 = -alpha,
           a0 = 1 + alpha,
           a1 = -2 * cosw0,
           a2 = 1 - alpha;
           break;
	       default:
           return;
       }

       b0 = b0 / a0;
       b1 = b1 / a0;
       b2 = b2 / a0;
       a1 = a1 / a0;
       a2 = a2 / a0;
       
    },

    callback: function( x ) {
      var channels = isNaN( x ) ? 2 : 1,
          outL = 0,
          outR = 0,
          inL = channels === 1 ? x : x[0];
      
      //if( _phase++ % 22050 === 0 ) console.log( "X IS ", typeof x )

      outL = b0 * inL + b1 * x1L + b2 * x2L - a1 * y1L - a2 * y2L;

      x2L = x1L;
      x1L = inL;
      y2L = y1L;
      y1L = outL;

      if(channels === 2) {
        inR = x[1];
        outR = b0 * inR + b1 * x1R + b2 * x2R - a1 * y1R - a2 * y2R;
        x2R = x1R;
        x1R = inR;
        y2R = y1R;
        y1R = outR;

        out[0] = outL;
        out[1] = outR;
      }
      return channels === 1 ? outL : out;
    },
	})
  .init();

  Object.defineProperties(this, {
    mode : {
      get: function() { return _mode; },
      set: function(v) { _mode = v; this.calculateCoefficients(); }
    },
    cutoff : {
      get: function() { return _cutoff; },
      set: function(v) { _cutoff = v; this.calculateCoefficients(); }
    },
    Q : {
      get: function() { return _Q; },
      set: function(v) { _Q = v; this.calculateCoefficients(); }
    },
  })
  
  this.processProperties(arguments);
  
  this.calculateCoefficients();
};
Gibberish.Biquad.prototype = Gibberish._effect;

/**#Gibberish.Flanger - FX
Classic flanging effect with feedback.

## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 });  
b = new Gibberish.Flanger({input:a, rate:.5, amount:125, feedback:.5}).connect();  
a.note(440);  
a.feedback = 0;  
a.note(440);  
a.rate = 4;
a.note(440);
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Flanger.input : property  
Object. The ugen that should feed the flagner.
**/
/**###Gibberish.Flanger.rate : property  
Number. The speed at which the delay line tap position is modulated.
**/
/**###Gibberish.Flanger.amount : property  
Number. The amount of time, in samples, that the delay line tap position varies by.
**/
/**###Gibberish.Flanger.feedback : property  
Number. The amount of output that should be fed back into the delay line
**/
/**###Gibberish.Flanger.offset : property  
Number. The base offset of the delay line tap from the current time. Large values (> 500) lead to chorusing effects.
**/

Gibberish.Flanger = function() {
	var buffers =	        [ new Float32Array(88200), new Float32Array(88200) ],
	    bufferLength =    88200,
	    delayModulation =	new Gibberish.Sine().callback,
	    interpolate =		  Gibberish.interpolate,
	    readIndex =			  -100,
	    writeIndex = 		  0,
	    phase =				    0;
      
	Gibberish.extend(this, {
    name:"flanger",
    properties:{ input:0, rate:.25, feedback:0, amount:125, offset:125 },
    
    callback : function(sample, delayModulationRate, feedback, delayModulationAmount, offset) {
      var channels = typeof sample === 'number' ? 1 : 2;
      
  		var delayIndex = readIndex + delayModulation( delayModulationRate, delayModulationAmount * .95 );

  		if(delayIndex > bufferLength) {
  			delayIndex -= bufferLength;
  		}else if(delayIndex < 0) {
  			delayIndex += bufferLength;
  		}
					
			var delayedSample = interpolate(buffers[0], delayIndex);
			buffers[0][writeIndex] = channels === 1 ? sample + (delayedSample * feedback): sample[0] + (delayedSample * feedback);
				
      if(channels === 2) {
        sample[0] += delayedSample;
        
  			delayedSample = interpolate(buffers[1], delayIndex);
  			buffers[1][writeIndex] = sample[1] + (delayedSample * feedback);
        
        sample[1] += delayedSample;
      }else{
        sample += delayedSample;
      }
			
  		if(++writeIndex >= bufferLength) writeIndex = 0;
  		if(++readIndex  >= bufferLength) readIndex  = 0;

  		return sample;
  	},	
  })
  .init()
  .processProperties(arguments);

	readIndex = this.offset * -1;
};
Gibberish.Flanger.prototype = Gibberish._effect;

/**#Gibberish.Vibrato - FX
Delay line vibrato effect.

## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 });  
b = new Gibberish.Vibrato({input:a, rate:4, amount:125 }).connect();  
a.note(440);  
a.rate = .5;
a.note(440);
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Vibrato.input : property  
Object. The ugen that should feed the vibrato.
**/
/**###Gibberish.Vibrato.rate : property  
Number. The speed at which the delay line tap position is modulated.
**/
/**###Gibberish.Vibrato.amount : property  
Number. The size of the delay line modulation; effectively the amount of vibrato to produce, 
**/
/**###Gibberish.Vibrato.offset : property  
Number. The base offset of the delay line tap from the current time.
**/
Gibberish.Vibrato = function() {
	var buffers =	        [ new Float32Array(88200), new Float32Array(88200) ],
	    bufferLength =    88200,
	    delayModulation =	new Gibberish.Sine().callback,
	    interpolate =		  Gibberish.interpolate,
	    readIndex =			  -100,
	    writeIndex = 		  0,
	    phase =				    0;
      
	Gibberish.extend(this, {
    name:"vibrato",
  	properties:{ input:0, rate:5, amount:.5, offset:125 },
    
  	callback : function(sample, delayModulationRate, delayModulationAmount, offset) {
      var channels = typeof sample === 'number' ? 1 : 2;
      
  		var delayIndex = readIndex + delayModulation( delayModulationRate, delayModulationAmount * offset - 1 );

  		if(delayIndex > bufferLength) {
  			delayIndex -= bufferLength;
  		}else if(delayIndex < 0) {
  			delayIndex += bufferLength;
  		}
					
			var delayedSample = interpolate(buffers[0], delayIndex);
			buffers[0][writeIndex] = channels === 1 ? sample : sample[0];
				
      if(channels === 2) {
        sample[0] = delayedSample;
        
  			delayedSample = interpolate(buffers[1], delayIndex);
  			buffers[1][writeIndex] = sample[1];
        
        sample[1] = delayedSample;
      }else{
        sample = delayedSample;
      }
			
  		if(++writeIndex >= bufferLength) writeIndex = 0;
  		if(++readIndex  >= bufferLength) readIndex  = 0;

  		return sample;
  	},	
  })
  .init()
  .processProperties(arguments);

	readIndex = this.offset * -1;
};
Gibberish.Vibrato.prototype = Gibberish._effect;

/**#Gibberish.BufferShuffler - FX
A buffer shuffling / stuttering effect with reversing and pitch-shifting

## Example Usage##
`a = new Gibberish.Synth({ attack:88200, decay:88200 });  
b = new Gibberish.BufferShuffler({input:a, chance:.25, amount:125, rate:44100, pitchMin:-4, pitchMax:4 }).connect();  
a.note(440);
`  
##Constructor##
**param** *properties* : Object. A dictionary of property keys and values to assign to the Gibberish.BufferShuffler object
- - - - 
**/
/**###Gibberish.BufferShuffler.chance : property
Float. Range 0..1. Default .25. The likelihood that incoming audio will be shuffled.
**/
/**###Gibberish.BufferShuffler.rate : property
Integer, in samples. Default 11025. How often Gibberish.BufferShuffler will randomly decide whether or not to shuffle.
**/
/**###Gibberish.BufferShuffler.length : property
Integer, in samples. Default 22050. The length of time to play stuttered audio when stuttering occurs.
**/
/**###Gibberish.BufferShuffler.reverseChance : property
Float. Range 0..1. Default .5. The likelihood that stuttered audio will be reversed
**/
/**###Gibberish.BufferShuffler.pitchChance : property
Float. Range 0..1. Default .5. The likelihood that stuttered audio will be repitched.
**/
/**###Gibberish.BufferShuffler.pitchMin : property
Float. Range 0..1. Default .25. The lowest playback speed used to repitch the audio
**/
/**###Gibberish.BufferShuffler.pitchMax : property
Float. Range 0..1. Default 2. The highest playback speed used to repitch the audio.
**/
/**###Gibberish.BufferShuffler.wet : property
Float. Range 0..1. Default 1. When shuffling, the amplitude of the wet signal
**/
/**###Gibberish.BufferShuffler.dry : property
Float. Range 0..1. Default 0. When shuffling, the amplitude of the dry signal
**/

Gibberish.BufferShuffler = function() {
	var buffers = [ new Float32Array(88200), new Float32Array(88200) ],
    	bufferLength = 88200,  
  		readIndex = 0,
  		writeIndex = 0,
  		randomizeCheckIndex = 0,
  		shuffleTimeKeeper = 0,
  		isShuffling = 0,
  		random = Math.random,
  		fadeIndex = 0,
  		fadeAmount = 1,
  		isFadingWetIn = false,
  		isFadingDryIn = false,
  		reversed = false,
  		interpolate = Gibberish.interpolate,
  		pitchShifting = false,
  		speed = 1,
  		isBufferFull = false,
      rndf = Gibberish.rndf,
      _output = [0,0];
	
	Gibberish.extend(this, {
    name:"buffer_shuffler",
	
  	properties: { input:0, chance:.25, rate:11025, length:22050, reverseChange:.5, pitchChance:.5, pitchMin:.25, pitchMax:2, wet:1, dry:0 },

  	callback : function(sample, chance, rate, length, reverseChance, pitchChance, pitchMin, pitchMax, wet, dry) {
      var channels = typeof sample === 'number' ? 1 : 2;
      
  		if(!isShuffling) {
        buffers[0][writeIndex] = channels === 1 ? sample : sample[0];
        buffers[1][writeIndex] = channels === 1 ? sample : sample[1]; // won't be used but with one handle but probably cheaper than an if statement?
                
  			writeIndex++
  			writeIndex %= bufferLength;

  			isBufferFull = writeIndex === 0 ? 1 : isBufferFull; // don't output buffered audio until a buffer is full... otherwise you just get a gap
						
  			randomizeCheckIndex++;

  			if(randomizeCheckIndex % rate == 0 && random() < chance) {
  				reversed = random() < reverseChance;
  				isShuffling = true;
  				if(!reversed) {
  					readIndex = writeIndex - length;
  					if(readIndex < 0) readIndex = bufferLength + readIndex;
  				}
  				pitchShifting = random() < pitchChance;
  				if(pitchShifting) {
  					speed = rndf(pitchMin, pitchMax);
  				}
  				fadeAmount = 1;
  				isFadingWetIn = true;
  				isFadingDryIn = false;
  			}
  		}else if(++shuffleTimeKeeper % (length - 400) === 0) {
  			isFadingWetIn = false;
  			isFadingDryIn = true;
  			fadeAmount = 1;
  			shuffleTimeKeeper = 0;
  		}
					
  		readIndex += reversed ? speed * -1 : speed;
  		if(readIndex < 0) {
  			readIndex += bufferLength;
  		}else if( readIndex >= bufferLength ) {
  			readIndex -= bufferLength;
  		}	
  		var outSampleL = interpolate(buffers[0], readIndex);
			
      var outL, outR, shuffle, outSampleR;			
			if(isFadingWetIn) {						
				fadeAmount -= .0025;
        
        shuffle = (outSampleL * (1 - fadeAmount));
				outL = channels === 1 ? shuffle + (sample * fadeAmount) : shuffle + (sample[0] * fadeAmount);
        
        if(channels === 2) {
          outSampleR = interpolate(buffers[1], readIndex);
          shuffle = (outSampleR * (1 - fadeAmount));
          outR = channels === 1 ? outL : shuffle + (sample[1] * fadeAmount);
        }

				if(fadeAmount <= .0025) isFadingWetIn = false;
			}else if(isFadingDryIn) {						
				fadeAmount -= .0025;
        
        shuffle = outSampleL * fadeAmount;
				outL = channels === 1 ? shuffle + (sample * fadeAmount) : shuffle + (sample[0] * (1 - fadeAmount));
        
        if(channels === 2) {
          outSampleR = interpolate(buffers[1], readIndex);
          shuffle = outSampleR * fadeAmount;
          outR = shuffle + (sample[1] * (1 - fadeAmount));
        }
        
				if(fadeAmount <= .0025) { 
					isFadingDryIn = false;
					isShuffling = false;
					reversed = false;
					speed = 1;
					pitchShifting = 0;
				}
			}else{
        if(channels === 1) {
          outL = isShuffling && isBufferFull ? (outSampleL * wet) + sample * dry : sample;
        }else{
          outSampleR = interpolate(buffers[1], readIndex);
          outL = isShuffling && isBufferFull ? (outSampleL * wet) + sample[0] * dry : sample[0];
          outR = isShuffling && isBufferFull ? (outSampleR * wet) + sample[1] * dry : sample[1];          
        }
			}
      _output = [outL, outR];
  		return channels === 1 ? outL : _output;
  	},
  })
  .init()
  .processProperties(arguments);
};
Gibberish.BufferShuffler.prototype = Gibberish._effect;

Gibberish.AllPass = function(time, feedback) {
	var index  = -1,
    	buffer =	new Float32Array(time || 500),
      bufferLength = buffer.length;
  
  Gibberish.extend(this, {
		name:		"allpass",
    properties: {
      input   : 0,
    },
    callback : function(sample) {
  		index = ++index % bufferLength;
  		var bufferSample = buffer[index];
  		var out = -1 * sample + bufferSample;

  		buffer[index] = sample + (bufferSample * .5);
  		return out;
  	},
	});
  
};
/*
adapted from audioLib.js, in turn adapted from Freeverb source code
this is actually a lowpass-feedback-comb filter (https://ccrma.stanford.edu/~jos/pasp/Lowpass_Feedback_Comb_Filter.html)
*/
Gibberish.Comb = function(time) {
	var buffer = new Float32Array(time || 1200),
    	bufferLength = buffer.length,
    	index = 0,
    	store = 0;
      
	Gibberish.extend(this, {
		name:		"comb",
    properties : {
      input : 0,
      feedback : .84,
      damping: .2,
  		//time:		time || 1200,
    },
    
    /*
		self.sample	= self.buffer[self.index];
		self.store	= self.sample * self.invDamping + self.store * self.damping;
		self.buffer[self.index++] = s + self.store * self.feedback;
    */
    
  	callback: function(sample, feedback, damping) {
  		var currentPos = ++index % bufferLength;
			var out = buffer[currentPos];
						
			store = (out * (1 - damping)) + (store * damping);
						
			buffer[currentPos] = sample + (store * feedback);

  		return out;
  	},
	});
  
};

/**#Gibberish.Reverb - FX
based off audiolib.js reverb and freeverb
 
## Example Usage##
`a = new Gibberish.Synth({ attack:88200, decay:88200 });  
b = new Gibberish.Reverb({input:a, roomSize:.5, wet:1, dry;.25}).connect();
a.note(440);
`  
##Constructor
**param** *properties* : Object. A dictionary of property keys and values to assign to the Gibberish.BufferShuffler object
**/
/**###Gibberish.Reverb.roomSize : property
Float. 0..1. The size of the room being emulated.
**/	
/**###Gibberish.Reverb.damping : property
Float. Attenuation of high frequencies that occurs.
**/	
/**###Gibberish.Reverb.wet : property
Float. Default = .75. The amount of processed signal that is output.  
**/	
/**###Gibberish.Reverb.dry : property
Float. Default = .5. The amount of dry signal that is output
**/	

Gibberish.Reverb = function() {
  var tuning =	{
		    combCount: 		    8,
		    combTuning: 	    [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617],
                          
		    allPassCount: 	  4,
		    allPassTuning: 	  [556, 441, 341, 225],
		    allPassFeedback:  0.5,
                          
		    fixedGain: 		    0.015,
		    scaleDamping: 	  0.4,
                          
		    scaleRoom: 		    0.28,
		    offsetRoom: 	    0.7,
                          
		    stereoSpread: 	  23
		},
    feedback = .84,
    combs = [],
    apfs  = [],
    output   = [0,0],
    phase  = 0;
    
	Gibberish.extend(this, {
		name:		"reverb",
    
		roomSize:	.5,
    
    properties: {
      input:    0,
  		wet:		  .5,
  		dry:		  .55,
      roomSize: .84,
      damping:  .5,
    },
    
    callback : function(sample, wet, dry, roomSize, damping) {
      var channels = typeof sample === 'object' ? 2 : 1;
      
			var input = channels === 1 ? sample : sample[0] + sample[1]; // converted to fake stereo

			var _out = input * .015;
      var out = _out;
						
			for(var i = 0; i < 8; i++) {
				var filt = combs[i](_out, roomSize * .98, (damping * .4)); // .98 is scaleRoom + offsetRoom, .4 is scaleDamping
				out += filt;				
			}
							
			for(var i = 0; i < 4; i++) {
				out = apfs[i](out);	
			}
      
      output[0] = output[1] = (input * dry) + (out * wet);

  		return output;
  	},
	})  
  .init()
  .processProperties(arguments);
      
  this.setFeedback = function(v) { feedback = v }
  
	for(var i = 0; i < 8; i++){
		combs.push( new Gibberish.Comb( tuning.combTuning[i] ).callback );
	}
  
	for(var i = 0; i < 4; i++){
		apfs.push( new Gibberish.AllPass(tuning.allPassTuning[i], tuning.allPassFeedback ).callback );
	}

};
Gibberish.Reverb.prototype = Gibberish._effect;

/**#Gibberish.StereoReverb - FX
stereo version of the reverb effect
 
## Example Usage##
`a = new Gibberish.Synth({ attack:88200, decay:88200, pan:-1 });  
b = new Gibberish.StereoReverb({input:a, roomSize:.5, wet:1, dry;.25}).connect();
a.note(440);
`  
##Constructor
**param** *properties* : Object. A dictionary of property keys and values to assign to the Gibberish.BufferShuffler object
**/
/**###Gibberish.Reverb.roomSize : property
Float. 0..1. The size of the room being emulated.
**/	
/**###Gibberish.Reverb.damping : property
Float. Attenuation of high frequencies that occurs.
**/	
/**###Gibberish.Reverb.wet : property
Float. Default = .75. The amount of processed signal that is output.  
**/	
/**###Gibberish.Reverb.dry : property
Float. Default = .5. The amount of dry signal that is output
**/	
Gibberish.StereoReverb = function() {
  var tuning =	{
		    combCount: 		    8,
		    combTuning: 	    [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617],
                          
		    allPassCount: 	  4,
		    allPassTuning: 	  [556, 441, 341, 225],
		    allPassFeedback:  0.5,
                          
		    fixedGain: 		    0.015,
		    scaleDamping: 	  0.4,
                          
		    scaleRoom: 		    0.28,
		    offsetRoom: 	    0.7,
                          
		    stereoSpread: 	  23
		},
    feedback = .84,
    combsL = [], combsR = [],
    apfsL  = [], apfsR = [],
    output   = [0,0],
    phase  = 0;
    
	Gibberish.extend(this, {
		name:		"reverb",
    
		roomSize:	.5,
    
    properties: {
      input:    0,
  		wet:		  .5,
  		dry:		  .55,
      roomSize: .84,
      damping:  .5,
    },
    
    callback : function(sample, wet, dry, roomSize, damping) {
      var channels = typeof sample === 'object' ? 2 : 1,
          l = sample[0],
          r = channels === 1 ? l : sample[1],
          _outL = outL = l * .015,
          _outR = outR = r * .015;
						
			for(var i = 0; i < 8; i++) { // parallel
				outL += combsL[ i ]( _outL, roomSize * .98, (damping * .4)); // .98 is scaleRoom + offsetRoom, .4 is scaleDamping
        outR += combsR[ i ]( _outR, roomSize * .98, (damping * .4));       
			}
							
			for(var i = 0; i < 4; i++) {
				outL = apfsL[ i ]( outL );	
				outR = apfsR[ i ]( outR );	        
			}
      
      output[0] = (l * dry) + (outL * wet);
      output[1] = (r * dry) + (outR * wet);

  		return output;
  	},
	})  
  .init()
  .processProperties(arguments);
      
  this.setFeedback = function(v) { feedback = v }
  
	for(var i = 0; i < 8; i++){
		combsL.push( new Gibberish.Comb( tuning.combTuning[i] ).callback );
    combsR.push( new Gibberish.Comb( tuning.combTuning[i] ).callback );
	}
  
	for(var i = 0; i < 4; i++){
		apfsL.push( new Gibberish.AllPass(tuning.allPassTuning[i], tuning.allPassFeedback ).callback );
    apfsR.push( new Gibberish.AllPass(tuning.allPassTuning[i], tuning.allPassFeedback ).callback );    
	}
};
Gibberish.StereoReverb.prototype = Gibberish._effect;

/**#Gibberish.Granulator - FX
A granulator that operates on a buffer of samples. You can get the samples from a [Sampler](javascript:displayDocs('Gibberish.Sampler'\))
object.

## Example Usage ##
`a = new Gibberish.Sampler('resources/trumpet.wav');  
// wait until sample is loaded to create granulator  
a.onload = function() {  
  b = new Gibberish.Granulator({  
    buffer:a.getBuffer(),  
    grainSize:1000,  
    speedMin: -2,  
    speedMax: 2,  
  });  
  b.mod('position', new Gibberish.Sine(.1, .45), '+');  
  b.connect();  
};`
## Constructor
**param** *propertiesList*: Object. At a minimum you should define the input to granulate. See the example.
**/
/**###Gibberish.Granulator.speed : property
Float. The playback rate, in samples, of each grain
**/
/**###Gibberish.Granulator.speedMin : property
Float. When set, the playback rate will vary on a per grain basis from (grain.speed + grain.speedMin) -> (grain.speed + grain.speedMax). This value should almost always be negative.
**/
/**###Gibberish.Granulator.speedMax : property
Float. When set, the playback rate will vary on a per grain basis from (grain.speed + grain.speedMin) -> (grain.speed + grain.speedMax).
**/
/**###Gibberish.Granulator.grainSize : property
Integer. The length, in samples, of each grain
**/
/**###Gibberish.Granulator.position : property
Float. The center position of the grain cloud. 0 represents the start of the buffer, 1 represents the end.
**/
/**###Gibberish.Granulator.positionMin : property
Float. The left boundary on the time axis of the grain cloud.
**/
/**###Gibberish.Granulator.positionMax : property
Float. The right boundary on the time axis of the grain cloud.
**/
/**###Gibberish.Granulator.buffer : property
Object. The input buffer to granulate.
**/
/**###Gibberish.Granulator.numberOfGrains : property
Float. The number of grains in the cloud. Can currently only be set on initialization.
**/

Gibberish.Granulator = function(properties) {
	var grains      = [];
	    buffer      = null,
	    interpolate = Gibberish.interpolate,
      panner      = Gibberish.makePanner(),
      bufferLength= 0,
	    debug       = 0,
	    write       = 0,
      self        = this,
      out         = [0,0],
      _out        = [0,0],
      rndf        = Gibberish.rndf,
      numberOfGrains = properties.numberOfGrains || 20;
  
      console.log( "NUMBER OF GRAINS", numberOfGrains )
  
	Gibberish.extend(this, { 
		name:		        "granulator",
		bufferLength:   88200,
		reverse:	      true,
		spread:		      .5,
    
    properties : {
      speed: 		    1,
      speedMin:     -0,
      speedMax: 	  .0,
      grainSize: 	  1000,
      position:	    .5,
      positionMin:  0,
      positionMax:  0,
      amp:		      .2,
      fade:		      .1,
      pan:		      0,
      shouldWrite:  false,
    },
    
    setBuffer : function(b) { buffer = b; bufferLength = b.length },
    
    callback : function(speed, speedMin, speedMax, grainSize, positionMin, positionMax, position, amp, fade, pan, shouldWrite) {
    		for(var i = 0; i < numberOfGrains; i++) {
    			var grain = grains[i];
					
    			if(grain._speed > 0) {
    				if(grain.pos > grain.end) {
    					grain.pos = (position + rndf(positionMin, positionMax)) * buffer.length;
    					grain.start = grain.pos;
    					grain.end = grain.start + grainSize;
    					grain._speed = speed + rndf(speedMin, speedMax);
    					grain._speed = grain._speed < .1 ? .1 : grain._speed;
    					grain._speed = grain._speed < .1 && grain._speed > 0 ? .1 : grain._speed;							
    					grain._speed = grain._speed > -.1 && grain._speed < 0 ? -.1 : grain._speed;							
    					grain.fadeAmount = grain._speed * (fade * grainSize);
    					grain.pan = rndf(self.spread * -1, self.spread);
    				}
						
    				var _pos = grain.pos;
    				while(_pos > buffer.length) _pos -= buffer.length;
    				while(_pos < 0) _pos += buffer.length;
						
    				var _val = interpolate(buffer, _pos);
					
    				_val *= grain.pos < grain.fadeAmount + grain.start ? (grain.pos - grain.start) / grain.fadeAmount : 1;
    				_val *= grain.pos > (grain.end - grain.fadeAmount) ? (grain.end - grain.pos)   / grain.fadeAmount : 1;
						
    			}else {
    				if(grain.pos < grain.end) {
    					grain.pos = (position + rndf(positionMin, positionMax)) * buffer.length;
    					grain.start = grain.pos;
    					grain.end = grain.start - grainSize;
    					grain._speed = speed + rndf(speedMin, speedMax);
    					grain._speed = grain._speed < .1 && grain._speed > 0 ? .1 : grain._speed;							
    					grain._speed = grain._speed > -.1 && grain._speed < 0 ? -.1 : grain._speed;	
    					grain.fadeAmount = grain._speed * (fade * grainSize);							
    				}
						
    				var _pos = grain.pos;
    				while(_pos > buffer.length) _pos -= buffer.length;
    				while(_pos < 0) _pos += buffer.length;
					
    				var _val = interpolate(buffer, _pos);
					
    				_val *= grain.pos > grain.start - grain.fadeAmount ? (grain.start - grain.pos) / grain.fadeAmount : 1;
    				_val *= grain.pos < (grain.end + grain.fadeAmount) ? (grain.end - grain.pos) / grain.fadeAmount : 1;
    			}
					
    			_out = panner(_val * amp, grain.pan, _out);
          out[0] += _out[0];
          out[1] += _out[1];
    			
          grain.pos += grain._speed;
    		}
				
    		return panner(out, pan, out);
    	},
	})
  .init()
  .processProperties(arguments);
  
  
  
	for(var i = 0; i < numberOfGrains; i++) {
		grains[i] = {
			pos : self.position + Gibberish.rndf(self.positionMin, self.positionMax),
			_speed : self.speed + Gibberish.rndf(self.speedMin, self.speedMax),
		}
		grains[i].start = grains[i].pos;
		grains[i].end = grains[i].pos + self.grainSize;
		grains[i].fadeAmount = grains[i]._speed * (self.fade * self.grainSize);
		grains[i].pan = Gibberish.rndf(self.spread * -1, self.spread);
    
    console.log( "GRAIN", i, "POS", grains[i].pos, "SPEED", grains[i]._speed )
	}
  
  this.grains = grains
			
	/*if(typeof properties.input !== "undefined") { 
			this.shouldWrite = true;
      
			this.sampler = new Gibberish.Sampler();
			this.sampler.connect();
			this.sampler.record(properties.buffer, this.bufferLength);
      
			buffer = this.sampler.buffer;
	}else*/ if(typeof properties.buffer !== 'undefined') {
	  buffer = properties.buffer;
    bufferLength = buffer.length;
	}

};
Gibberish.Granulator.prototype = Gibberish._effect;
Gibberish.synth = function() {
  this.type = 'oscillator';
    
  this.oscillatorInit = function() {
    this.fx = new Array2; 
    this.fx.parent = this;
  };
};
Gibberish.synth.prototype = new Gibberish.ugen();
Gibberish._synth = new Gibberish.synth();

/**#Gibberish.Synth - Synth
Oscillator + attack / decay envelope.
  
## Example Usage##
`Gibberish.init();  
a = new Gibberish.Synth({ attack:44, decay:44100 }).connect();  
a.note(880);  
a.waveform = "Triangle";  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Synth.frequency : property  
Number. The frequency for the carrier oscillator. This is normally set using the note method but can also be modulated.
**/
/**###Gibberish.Synth.pulsewidth : property  
Number. The duty cycle for PWM synthesis
**/
/**###Gibberish.Synth.attack : property  
Number. The length of the attack portion of the envelope in samples. Note that the synth's envelope affects both amplitude and the index of the synth.
**/
/**###Gibberish.Synth.decay : property  
Number. The length of the decay portion of the envelope in samples. Note that the synth's envelope affects both amplitude and the index of the synth.
**/
/**###Gibberish.Synth.glide : property  
Number. The synth has a one-pole filter attached to the carrier frequency. Set glide to a value between .999 and 1 to get pitch sweep between notes.
**/
/**###Gibberish.Synth.amp : property  
Number. The relative amplitude level of the synth.
**/
/**###Gibberish.Synth.channels : property  
Number. Default 2. Mono or Stereo synthesis.
**/
/**###Gibberish.Synth.pan : property  
Number. Default 0. If the synth has two channels, this determines its position in the stereo spectrum.
**/
/**###Gibberish.Synth.waveform : property  
String. The type of waveform to use. Options include 'Sine', 'Triangle', 'PWM', 'Saw' etc.
**/
		
Gibberish.Synth = function(properties) {
	this.name =	"synth";

	this.properties = {
	  frequency:0,
    pulsewidth:.5,
	  attack:		22050,
	  decay:		22050,
    sustain:  22050,
    release:  22050,
    attackLevel: 1,
    sustainLevel: .5,
    releaseTrigger: 0,
    glide:    .15,
    amp:		  .25,
    channels: 2,
	  pan:		  0,
    velocity: 1,
    sr:       Gibberish.context.sampleRate,
  };
/**###Gibberish.Synth.note : method  
Generate an enveloped note at the provided frequency  
  
param **frequency** Number. The frequency for the oscillator.  
param **amp** Number. Optional. The volume to use.  
**/    
	this.note = function(frequency, velocity) {
    if( typeof frequency === 'undefined' ) return
    if( Array.isArray( arguments[0] ) ) {
      var tmp  = arguments[0][0]
      velocity = arguments[0][1]
      frequency = tmp
    }


    if( velocity !== 0 ) {
  		if( typeof this.frequency !== 'object' ){
        if( useADSR && frequency === lastFrequency && properties.requireReleaseTrigger ) {
          this.releaseTrigger = 1;
          lastFrequency = null
          return;
        }
        
        this.frequency = lastFrequency = frequency;
        this.releaseTrigger = 0;
        
        if( typeof frequency === 'object' ) {
          Gibberish.dirty( this )
        }
      }else{
        this.frequency[0] = lastFrequency = frequency;
        this.releaseTrigger = 0;
        Gibberish.dirty(this);
      }
					
      if( typeof velocity !== 'undefined') {
        this.velocity = velocity;
      }
      _envelope.run();
    }else{
      this.releaseTrigger = 1;
    }
	};
  
  properties = properties || {}
  
	var useADSR     = typeof properties.useADSR === 'undefined' ? false : properties.useADSR,
      _envelope   = useADSR ? new Gibberish.ADSR() : new Gibberish.AD(),
      envstate    = _envelope.getState,
      envelope    = _envelope.callback,
      _osc        = new Gibberish.PWM(),
	    osc         = _osc.callback,
      lag         = new Gibberish.OnePole().callback,
    	panner      = Gibberish.makePanner(),
      obj         = this,
      lastFrequency = 0,
      phase = 0,
    	out         = [0,0];
      
  _envelope.requireReleaseTrigger = properties.requireReleaseTrigger || false;
      
  this.callback = function(frequency, pulsewidth, attack, decay, sustain,release,attackLevel,sustainLevel,releaseTrigger, glide, amp, channels, pan, velocity, sr) {
    glide = glide >= 1 ? .99999 : glide;
    frequency = lag(frequency, 1-glide, glide);
    
    var env, val
    if( useADSR ) {
      env = envelope( attack, decay, sustain, release, attackLevel, sustainLevel, releaseTrigger );
      if( releaseTrigger ) {
        obj.releaseTrigger = 0
      }

      if( envstate() < 4 ) {
  			val = osc( frequency, 1, pulsewidth, sr ) * env * velocity *  amp;
    
  			return channels === 1 ? val : panner(val, pan, out);
      }else{
  		  val = out[0] = out[1] = 0;
        return channels === 1 ? val : out
      }
    }else{
  		if(envstate() < 2) {
        env = envelope(attack, decay);
  			val = osc( frequency, 1, pulsewidth, sr ) * env * velocity * amp;
      
  			return channels === 1 ? val : panner(val, pan, out);
      }else{
  		  val = out[0] = out[1] = 0;
        return channels === 1 ? val : out
      }
    }
	};
  
  this.getEnv = function() { return _envelope; }
  this.getOsc = function() { return _osc; };
  this.setOsc = function(val) { _osc = val; osc = _osc.callback };
  
  var waveform = "PWM";
  Object.defineProperty(this, 'waveform', {
    get : function() { return waveform; },
    set : function(val) { this.setOsc( new Gibberish[val]() ); }
  });
  
  this.init();
  this.oscillatorInit();
	this.processProperties(arguments);
};
Gibberish.Synth.prototype = Gibberish._synth;

/**#Gibberish.PolySynth - Synth
A polyphonic version of [Synth](javascript:displayDocs('Gibberish.Synth'\)). There are two additional properties for the polyphonic version of the synth. The polyphonic version consists of multiple Synths being fed into a single [Bus](javascript:displayDocs('Gibberish.Bus'\)) object.
  
## Example Usage ##
`Gibberish.init();  
a = new Gibberish.PolySytn({ attack:88200, decay:88200, maxVoices:10 }).connect();  
a.note(880);  
a.note(1320); 
a.note(1760);  
`  
## Constructor   
One important property to pass to the constructor is the maxVoices property, which defaults to 5. This controls how many voices are allocated to the synth and cannot be changed after initialization.  
  
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.PolySynth.children : property  
Array. Read-only. An array holding all of the child FMSynth objects.
**/
/**###Gibberish.PolySynth.maxVoices : property  
Number. The number of voices of polyphony the synth has. May only be set in initialization properties passed to constrcutor.
**/
Gibberish.PolySynth = function() {
  this.__proto__ = new Gibberish.Bus2();
  
  Gibberish.extend(this, {
    name:     "polysynth",
    maxVoices:    5,
    voiceCount:   0,
    frequencies:  [],
    _frequency: 0,
    
    polyProperties : {
      frequency: 0,
  		glide:			0,
      attack: 22050,
      decay:  22050,
      sustain:22050,
      release:22050,
      attackLevel: 1,
      sustainLevel: .5,      
      pulsewidth:.5,
      velocity: 1,
      waveform:"PWM",
    },

/**###Gibberish.PolySynth.note : method  
Generate an enveloped note at the provided frequency using a simple voice allocation system where if all children are active, the one active the longest cancels its current note and begins playing a new one.    
  
param **frequency** Number. The frequency for the oscillator. 
param **amp** Number. Optional. The volume to use.  
**/  
    note : function(_frequency, velocity) {
      if( typeof _frequency === 'undefined' ) return

      var lastNoteIndex = this.frequencies.indexOf( _frequency ),
          idx = lastNoteIndex > -1 ? lastNoteIndex : this.voiceCount++,
          synth = this.children[ idx ];

      synth.note( _frequency, velocity );
 
      if( lastNoteIndex === -1) {
        this.frequencies[ idx ] = _frequency;
        this._frequency = _frequency
        if(this.voiceCount >= this.maxVoices) this.voiceCount = 0;
      }else{
        delete this.frequencies[ idx ]
      }
      this.lastChild = idx
    },
 
    initVoices: function() {
      for(var i = 0; i < this.maxVoices; i++) {
        var props = {
          waveform: this.waveform,
    			attack: 	this.attack,
    			decay:		this.decay,
          sustain:  this.sustain,
          release:  this.release,
          attackLevel: this.attackLevel,
          sustainLevel: this.sustainLevel,
          pulsewidth: this.pulsewidth,
          channels: 2,
          amp:      1,
          useADSR : this.useADSR || false,
          requireReleaseTrigger: this.requireReleaseTrigger || false,
        },
        synth = new Gibberish.Synth( props ).connect( this );

        this.children.push(synth);
      }
    },
  });
  
  this.amp = 1 / this.maxVoices;
    
  this.children = [];
  
  if(typeof arguments[0] === 'object') {
    this.maxVoices = arguments[0].maxVoices ? arguments[0].maxVoices : this.maxVoices
    this.useADSR = typeof arguments[0].useADSR !== 'undefined' ? arguments[ 0 ].useADSR : false
    this.requireReleaseTrigger = typeof arguments[0].requireReleaseTrigger !== 'undefined' ? arguments[ 0 ].requireReleaseTrigger : false    
  }
  
  Gibberish.polyInit(this);
  this.initVoices()
  
  this.processProperties(arguments);
  
  Gibberish._synth.oscillatorInit.call(this);
};

/**#Gibberish.Synth2 - Synth
Oscillator + attack / decay envelope + 24db ladder filter. Basically the same as the [Synth](javascript:displayDocs('Gibberish.Synth'\)) object but with the addition of the filter. Note that the envelope controls both the amplitude of the oscillator and the cutoff frequency of the filter.
  
## Example Usage##
`Gibberish.init();  
a = new Gibberish.Synth2({ attack:44, decay:44100, cutoff:.2, resonance:4 }).connect();  
a.note(880);  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Synth2.frequency : property  
Number. The frequency for the carrier oscillator. This is normally set using the note method but can also be modulated.
**/
/**###Gibberish.Synth2.pulsewidth : property  
Number. The duty cycle for PWM synthesis
**/
/**###Gibberish.Synth2.attack : property  
Number. The length of the attack portion of the envelope in samples. Note that the synth's envelope affects both amplitude and the index of the synth.
**/
/**###Gibberish.Synth2.decay : property  
Number. The length of the decay portion of the envelope in samples. Note that the synth's envelope affects both amplitude and the index of the synth.
**/
/**###Gibberish.Synth2.cutoff : property  
Number. 0..1. The cutoff frequency for the synth's filter.
**/
/**###Gibberish.Synth2.resonance : property  
Number. 0..50. Values above 4.5 are likely to produce shrieking feedback. You are warned.
**/
/**###Gibberish.Synth2.useLowPassFilter : property  
Boolean. Default true. Whether to use a high-pass or low-pass filter.
**/
/**###Gibberish.Synth2.glide : property  
Number. The synth has a one-pole filter attached to the carrier frequency. Set glide to a value between .999 and 1 to get pitch sweep between notes.
**/
/**###Gibberish.Synth2.amp : property  
Number. The relative amplitude level of the synth.
**/
/**###Gibberish.Synth2.channels : property  
Number. Default 2. Mono or Stereo synthesis.
**/
/**###Gibberish.Synth2.pan : property  
Number. Default 0. If the synth has two channels, this determines its position in the stereo spectrum.
**/
/**###Gibberish.Synth2.waveform : property  
String. The type of waveform to use. Options include 'Sine', 'Triangle', 'PWM', 'Saw' etc.
**/
Gibberish.Synth2 = function(properties) {
	this.name =	"synth2";

	this.properties = {
	  frequency:0,
    pulsewidth:.5,
	  attack:		22050,
	  decay:		22050,
    sustain:  22050,
    release:  22050,
    attackLevel: 1,
    sustainLevel: .5,
    releaseTrigger: 0,
    cutoff:   .25,
    resonance:3.5,
    useLowPassFilter:true,
    glide:    .15,
    amp:		  .25,
    channels: 1,
	  pan:		  0,
    velocity: 1,
    sr:       Gibberish.context.sampleRate,
  };
/**###Gibberish.Synth2.note : method  
Generate an enveloped note at the provided frequency  
  
param **frequency** Number. The frequency for the oscillator.  
param **amp** Number. Optional. The volume to use.  
**/      
	this.note = function(frequency, velocity) {
    if( typeof frequency === 'undefined' ) return
    if( velocity !== 0 ) {
  		if(typeof this.frequency !== 'object'){
        if( useADSR && frequency === lastFrequency && properties.requireReleaseTrigger ) {
          this.releaseTrigger = 1;
          lastFrequency = null
          return;
        }

        this.frequency = lastFrequency = frequency;
        this.releaseTrigger = 0;
        if( typeof frequency === 'object' ) {
          Gibberish.dirty( this )
        }
      }else{
        this.frequency[0] = lastFrequency = frequency;
        this.releaseTrigger = 0;
        Gibberish.dirty(this);
      }
					
  		if( typeof velocity !== 'undefined') this.velocity = velocity;
	  
      _envelope.run();
    }else{
      this.releaseTrigger = 1;
    }
	};
  
  properties = properties || {}
  
	var useADSR     = typeof properties.useADSR === 'undefined' ? false : properties.useADSR,
      _envelope   = useADSR ? new Gibberish.ADSR() : new Gibberish.AD(),
      envstate    = _envelope.getState,
      envelope    = _envelope.callback,
      _osc        = new Gibberish.PWM(),
	    osc         = _osc.callback,      
      _filter     = new Gibberish.Filter24(),
      filter      = _filter.callback,
      lag         = new Gibberish.OnePole().callback,
    	panner      = Gibberish.makePanner(),
      lastFrequency = 0,
      obj         = this,
    	out         = [0,0];
      
  _envelope.requireReleaseTrigger = properties.requireReleaseTrigger || false;
        
  this.callback = function(frequency, pulsewidth, attack, decay, sustain, release, attackLevel, sustainLevel, releaseTrigger, cutoff, resonance, isLowPass, glide, amp, channels, pan, velocity, sr) {
    glide = glide >= 1 ? .99999 : glide;
    frequency = lag(frequency, 1-glide, glide);
    
    var env, val
    if( useADSR ) {
      env = envelope( attack, decay, sustain, release, attackLevel, sustainLevel, releaseTrigger );
      if( releaseTrigger ) {
        obj.releaseTrigger = 0
      }

      if( envstate() < 4 ) {
  			val = filter ( osc( frequency, .15, pulsewidth, sr ), cutoff * env, resonance, isLowPass ) * env * velocity *  amp;
    
  			return channels === 1 ? val : panner(val, pan, out);
      }else{
  		  val = out[0] = out[1] = 0;
        return channels === 1 ? val : out
      }
    }else{
      if( envstate() < 2) {
			  env = envelope(attack, decay);
			  val = filter ( osc( frequency, .15, pulsewidth, sr ), cutoff * env, resonance, isLowPass ) * env * velocity *  amp;
      
    		return channels === 1 ? val : panner(val, pan, out);
      }else{
    	  val = out[0] = out[1] = 0;
        return channels === 1 ? val : out;
      }
    }
	};
  this.getUseADSR = function() { return useADSR; }
  this.getEnv = function() { return _envelope; };
  this.getOsc = function() { return _osc; };
  this.setOsc = function(val) { _osc = val; osc = _osc.callback };
  
  var waveform = "PWM";
  Object.defineProperty(this, 'waveform', {
    get : function() { return waveform; },
    set : function(val) { this.setOsc( new Gibberish[val]() ); }
  });
  
  this.init();
  this.oscillatorInit();
	this.processProperties(arguments);
};
Gibberish.Synth2.prototype = Gibberish._synth;

/**#Gibberish.PolySynth2 - Synth
A polyphonic version of [Synth2](javascript:displayDocs('Gibberish.Synth2'\)). There are two additional properties for the polyphonic version of the synth. The polyphonic version consists of multiple Synths being fed into a single [Bus](javascript:displayDocs('Gibberish.Bus'\)) object.
  
## Example Usage ##
`Gibberish.init();  
a = new Gibberish.PolySynth2({ attack:88200, decay:88200, maxVoices:10 }).connect();  
a.note(880);  
a.note(1320); 
a.note(1760);  
`  
## Constructor   
One important property to pass to the constructor is the maxVoices property, which defaults to 5. This controls how many voices are allocated to the synth and cannot be changed after initialization.  
  
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.PolySynth2.children : property  
Array. Read-only. An array holding all of the child FMSynth objects.
**/
/**###Gibberish.PolySynth2.maxVoices : property  
Number. The number of voices of polyphony the synth has. May only be set in initialization properties passed to constrcutor.
**/

Gibberish.PolySynth2 = function() {
  this.__proto__ = new Gibberish.Bus2();
  
  Gibberish.extend(this, {
    name:     "polysynth2",
    maxVoices:    5,
    voiceCount:   0,
    frequencies:  [],
    _frequency: 0,
    
    polyProperties : {
      frequency: 0,
      glide:			0,
      attack: 22050,
      decay:  22050,
      sustain:22050,
      release:22050,
      attackLevel: 1,
      sustainLevel: .5,      
      pulsewidth:.5,
      resonance: 3.5,
      cutoff:.25,
      velocity:1,
      useLowPassFilter:true,
      waveform:"PWM",
    },

/**###Gibberish.PolySynth2.note : method  
Generate an enveloped note at the provided frequency using a simple voice allocation system where if all children are active, the one active the longest cancels its current note and begins playing a new one.    
  
param **frequency** Number. The frequency for the oscillator. 
param **amp** Number. Optional. The volume to use.  
**/  
    note : function(_frequency, velocity) {
      if( typeof _frequency === 'undefined' ) return

      var lastNoteIndex = this.frequencies.indexOf( _frequency ),
          idx = lastNoteIndex > -1 ? lastNoteIndex : this.voiceCount++,
          synth = this.children[ idx ];
      
      synth.note(_frequency, velocity);
            
      if( lastNoteIndex === -1) {
        this.frequencies[ idx ] = _frequency;
        this._frequency = _frequency
        if(this.voiceCount >= this.maxVoices) this.voiceCount = 0;
      }else{
        delete this.frequencies[ idx ]
      }
      this.lastChild = idx
    },
    
    initVoices: function() {
      this.dirty = true;
      for(var i = 0; i < this.maxVoices; i++) {
        var props = {
    			attack: 	this.attack,
    			decay:		this.decay,
          sustain:  this.sustain,
          release:  this.release,
          attackLevel: this.attackLevel,
          sustainLevel: this.sustainLevel,
          pulsewidth: this.pulsewidth,
          channels: 2,
          amp:      1,
          useADSR:  this.useADSR || false,
          requireReleaseTrigger: this.requireReleaseTrigger || false,
        },
        synth = new Gibberish.Synth2( props ).connect( this );

        this.children.push(synth);
      }
    },
  });
  
  this.amp = 1 / this.maxVoices;
    
  this.children = [];
  
  if(typeof arguments[0] === 'object') {
    this.maxVoices = arguments[0].maxVoices ? arguments[0].maxVoices : this.maxVoices
    this.useADSR = typeof arguments[0].useADSR !== 'undefined' ? arguments[ 0 ].useADSR : false
    this.requireReleaseTrigger = typeof arguments[0].requireReleaseTrigger !== 'undefined' ? arguments[ 0 ].requireReleaseTrigger : false
  }
  
  Gibberish.polyInit(this);
  
  this.initVoices()

  this.processProperties(arguments);
  Gibberish._synth.oscillatorInit.call(this);
};

/**#Gibberish.FMSynth - Synth
Classic 2-op FM synthesis with an attached attack / decay envelope.
  
## Example Usage##
`Gibberish.init();  
a = new Gibberish.FMSynth({ cmRatio:5, index:3 }).connect();
a.note(880);`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.FMSynth.frequency : property  
Number. The frequency for the carrier oscillator. This is normally set using the note method but can also be modulated.
**/
/**###Gibberish.FMSynth.cmRatio : property  
Number. The carrier-to-modulation ratio. A cmRatio of 2 means that the carrier frequency will be twice the frequency of the modulator.
**/
/**###Gibberish.FMSynth.attack : property  
Number. The length of the attack portion of the envelope in samples. Note that the synth's envelope affects both amplitude and the index of the synth.
**/
/**###Gibberish.FMSynth.decay : property  
Number. The length of the decay portion of the envelope in samples. Note that the synth's envelope affects both amplitude and the index of the synth.
**/
/**###Gibberish.FMSynth.glide : property  
Number. The synth has a one-pole filter attached to the carrier frequency. Set glide to a value between .999 and 1 to get pitch sweep between notes.
**/
/**###Gibberish.FMSynth.amp : property  
Number. The relative amplitude level of the synth.
**/
/**###Gibberish.FMSynth.channels : property  
Number. Default 2. Mono or Stereo synthesis.
**/
/**###Gibberish.FMSynth.pan : property  
Number. Default 0. If the synth has two channels, this determines its position in the stereo spectrum.
**/
Gibberish.FMSynth = function(properties) {
	this.name =	"fmSynth";

  this.properties = {
	  frequency:0,
	  cmRatio:	2,
	  index:		5,			
	  attack:		22050,
	  decay:		22050,
    sustain:  22050,
    release:  22050,
    attackLevel: 1,
    sustainLevel: .5,
    releaseTrigger: 0,
    glide:    .15,
    amp:		  .25,
    channels: 2,
    velocity: 1,
	  pan:		  0,
  };
/**###Gibberish.FMSynth.note : method  
Generate an enveloped note at the provided frequency  
  
param **frequency** Number. The frequency for the carrier oscillator. The modulator frequency will be calculated automatically from this value in conjunction with the synth's carrier to modulation ratio  
param **amp** Number. Optional. The volume to use.  
**/

	this.note = function(frequency, velocity) {
    if( typeof frequency === 'undefined' ) return
    //console.log( frequency, lastFrequency, this.releaseTrigger, velocity )
    if( velocity !== 0 ) {
  		if(typeof this.frequency !== 'object'){
        if( useADSR && frequency === lastFrequency && properties.requireReleaseTrigger ) {
          this.releaseTrigger = 1;
          lastFrequency = null
          return;
        }
        
        this.frequency = lastFrequency = frequency;
        this.releaseTrigger = 0;
        
        if( typeof frequency === 'object' ) {
          Gibberish.dirty( this );
        }
      }else{
        this.frequency[0] = lastFrequency = frequency;
        this.releaseTrigger = 0;
        Gibberish.dirty(this);
      }
					
  		if( typeof velocity !== 'undefined') this.velocity = velocity;
	  
      _envelope.run();
    }else{
      this.releaseTrigger = 1;
    }
	};
  
  properties = properties || {}
  
	var useADSR     = typeof properties.useADSR === 'undefined' ? false : properties.useADSR,
      _envelope   = useADSR ? new Gibberish.ADSR() : new Gibberish.AD(),
      envstate    = _envelope.getState,
      envelope    = _envelope.callback,
	    carrier     = new Gibberish.Sine().callback,
	    modulator   = new Gibberish.Sine().callback,
      lag         = new Gibberish.OnePole().callback,
    	panner      = Gibberish.makePanner(),
    	out         = [0,0],
      obj         = this,
      lastFrequency = 0,
      phase = 0,
      check = false;

  _envelope.requireReleaseTrigger = properties.requireReleaseTrigger || false;

  this.callback = function(frequency, cmRatio, index, attack, decay, sustain, release, attackLevel, sustainLevel, releaseTrigger, glide, amp, channels, velocity, pan) {
    var env, val, mod
        
    if(glide >= 1) glide = .9999;
    frequency = lag(frequency, 1-glide, glide);
    
    if( useADSR ) {
      env = envelope( attack, decay, sustain, release, attackLevel, sustainLevel, releaseTrigger ) * velocity;
      if( releaseTrigger ) {
        obj.releaseTrigger = 0
      }

      if( envstate() < 4 ) {
        mod = modulator(frequency * cmRatio, frequency * index) * env;
  			val = carrier( frequency + mod, 1 ) * env * amp;

  			return channels === 1 ? val : panner(val, pan, out);
      }else{
  		  val = out[0] = out[1] = 0;
        return channels === 1 ? val : out
      }
    }else{
      if( envstate() < 2 ) {
  			env = envelope(attack, decay) * velocity;
  			mod = modulator(frequency * cmRatio, frequency * index) * env;
  			val = carrier( frequency + mod, 1 ) * env * amp;

        //if( phase++ % 44105 === 0 ) console.log( panner(val, pan, out) , channels )
  			return channels === 1 ? val : panner(val, pan, out);
      }else{
  		  val = out[0] = out[1] = 0;
        return channels === 1 ? val : out;
      }
    }
	};
  
  this.init();
  this.oscillatorInit();
	this.processProperties(arguments);
};
Gibberish.FMSynth.prototype = Gibberish._synth;
/**#Gibberish.PolyFM - Synth
A polyphonic version of [FMSynth](javascript:displayDocs('Gibberish.FMSynth'\)). There are two additional properties for the polyphonic version of the synth. The polyphonic version consists of multiple FMSynths being fed into a single [Bus](javascript:displayDocs('Gibberish.Bus'\)) object.
  
## Example Usage ##
`Gibberish.init();  
a = new Gibberish.PolyFM({ cmRatio:5, index:3, attack:88200, decay:88200 }).connect();  
a.note(880);  
a.note(1320);  
`  
## Constructor   
One important property to pass to the constructor is the maxVoices property, which defaults to 5. This controls how many voices are allocated to the synth and cannot be changed after initialization.  
  
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.PolyFM.children : property  
Array. Read-only. An array holding all of the child FMSynth objects.
**/
/**###Gibberish.PolyFM.maxVoices : property  
Number. The number of voices of polyphony the synth has. May only be set in initialization properties passed to constrcutor.
**/


Gibberish.PolyFM = function() {
  this.__proto__ = new Gibberish.Bus2();
  
	Gibberish.extend(this, {
    name:     "polyfm",
		maxVoices:		5,
		voiceCount:		0,
    children: [],
    frequencies: [],
    _frequency: 0,
    velocity: 1,

    polyProperties : {
      glide:		 0,
      attack: 22050,
      decay:  22050,
      sustain:22050,
      release:22050,
      attackLevel: 1,
      sustainLevel: .5,
      index:  5,
      cmRatio:2,
    },
/**###Gibberish.PolyFM.note : method  
Generate an enveloped note at the provided frequency using a simple voice allocation system where if all children are active, the one active the longest cancels its current note and begins playing a new one.    
  
param **frequency** Number. The frequency for the carrier oscillator. The modulator frequency will be calculated automatically from this value in conjunction with the synth's  
param **amp** Number. Optional. The volume to use.  
**/
    note : function(_frequency, velocity ) {
      if( typeof _frequency === 'undefined' ) return

      var lastNoteIndex = this.frequencies.indexOf( _frequency ),
          idx = lastNoteIndex > -1 ? lastNoteIndex : this.voiceCount++,
          synth = this.children[ idx ];
      
      if( typeof velocity === 'undefined' ) velocity = this.velocity

      synth.note(_frequency, velocity);
      
      if( lastNoteIndex === -1) {
        this.frequencies[ idx ] = _frequency;
        this._frequency = _frequency
        if(this.voiceCount >= this.maxVoices) this.voiceCount = 0;
      }else{
        delete this.frequencies[ idx ]
      }
    },
    
    initVoices : function() {
    	for(var i = 0; i < this.maxVoices; i++) {
    		var props = {
    			attack: 	this.attack,
    			decay:		this.decay,
          sustain:  this.sustain,
          release:  this.release,
          attackLevel: this.attackLevel,
          sustainLevel: this.sustainLevel,
    			cmRatio:	this.cmRatio,
    			index:		this.index,
          channels: 2,
          useADSR : this.useADSR || false,      
          requireReleaseTrigger: this.requireReleaseTrigger || false,
    			amp: 		  1,
    		};

    		var synth = new Gibberish.FMSynth(props);
    		synth.connect(this);

    		this.children.push(synth);
    	}
    },
	}); 
     
  this.amp = 1 / this.maxVoices;
    
  this.children = [];
  
  if(typeof arguments[0] === 'object') {
    this.maxVoices = arguments[0].maxVoices ? arguments[0].maxVoices : this.maxVoices
    this.useADSR = typeof arguments[0].useADSR !== 'undefined' ? arguments[ 0 ].useADSR : false    
    this.requireReleaseTrigger = typeof arguments[0].requireReleaseTrigger !== 'undefined' ? arguments[ 0 ].requireReleaseTrigger : false    
  }
  
  Gibberish.polyInit(this);
  this.initVoices()
  
	this.processProperties(arguments);
  Gibberish._synth.oscillatorInit.call(this);
};

// this file is dependent on oscillators.js

/**#Gibberish.Sampler - Oscillator
Sample recording and playback.
  
## Example Usage##
`Gibberish.init();  
a = new Gibberish.Sampler({ file:'resources/snare.wav' }).connect();  
// wait until sample has downloaded  
a.note(2);  
a.note(1);  
a.note(-.5);  
b = new Gibberish.Sampler().connect();  
b.record(a, 88200); // record two seconds of a playing  
a.note(8);  
// wait a bit    
b.note(1);`

## Constructor
###syntax 1  
**param** *filepath*: String. A path to the audiofile to be opened by the sampler.  
###syntax 2    
**param** *properties*: Object. A dictionary of property values (see below) to set for the sampler on initialization.
- - - -
**/
/**###Gibberish.Sampler.pitch : property  
Number. The speed that the sample is played back at. A pitch of 1 means the sample plays forward at speed it was recorded at, a pitch of -4 means the sample plays backwards at 4 times the speed it was recorded at.
**/
/**###Gibberish.Sampler.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/
/**###Gibberish.Sampler.playOnLoad : property  
Number. If this value is set to be non-zero, the sampler will trigger a note at the provided pitch as soon as the sample is downloaded. 
**/
/**###Gibberish.Sampler.isRecording : property  
Boolean. Tells the sample to record into it's buffer. This is handled automatically by the object; there is no need to manually set this property.
**/
/**###Gibberish.Sampler.isPlaying : property  
Number. 0..1. Tells the sample to record into it's buffer. This is handled automatically by the object; there is no need to manually set this property.
**/
/**###Gibberish.Sampler.input : property  
Object. The object the sampler is tapping into and recording.
**/
/**###Gibberish.Sampler.length : property  
Number. The length of the Sampler's buffer.
**/
/**###Gibberish.Sampler.start : property  
Number. When the Sampler's note method is called, sample playback begins at this sample.
**/
/**###Gibberish.Sampler.end : property  
Number. When the Sampler's note method is called, sample playback ends at this sample.
**/
/**###Gibberish.Sampler.loops : property  
Boolean. When true, sample playback loops continuously between the start and end property values.
**/
/**###Gibberish.Sampler.pan : property  
Number. -1..1. Position of the Sampler in the stereo spectrum.
**/

Gibberish.Sampler = function() {
	var phase = 1,
	    interpolate = Gibberish.interpolate,
	    write = 0,
	    panner = Gibberish.makePanner(),
	    debug = 0 ,
	    shouldLoop = 0,
	    out = [0,0],
      buffer = null,
      bufferLength = 1,
      self = this,
      count = 0;
      
	Gibberish.extend(this, {
		name: 			"sampler",
    
		file: 			null,
		isLoaded: 	false,
    playOnLoad :  0,
    buffers: {},
    properties : {
    	pitch:			  1,
  		amp:			    1,
  		isRecording: 	false,
  		isPlaying : 	true,
  		input:	 		  0,
  		length : 		  0,
      start :       0,
      end :         1,
      loops :       0,
      pan :         0,
    },
    
/**###Gibberish.Sampler.onload : method  
This is an event handler that is called when a sampler has finished loading an audio file.
Use this to trigger a set of events upon downloading the sample. 
  
param **buffer** Object. The decoded sampler buffers from the audio file
**/ 
		_onload : 		function(decoded) {
			buffer = decoded.channels[0]; 
			bufferLength = decoded.length;
			self.length = bufferLength
			//self.end = bufferLength;
      self.length = phase = bufferLength;
      self.isPlaying = true;
					
			//console.log("LOADED ", self.file, bufferLength);
			Gibberish.audioFiles[self.file] = buffer;
			self.buffers[ self.file ] = buffer;
      
      if(self.onload) self.onload();
      
      if(self.playOnLoad !== 0) self.note(self.playOnLoad);
      
			self.isLoaded = true;
		},
    
    switchBuffer: function( bufferID ) { // accepts either number or string
      if( typeof bufferID === 'string' ) {
        if( typeof this.buffers[ bufferID ] !== 'undefined' ) {
          buffer = this.buffers[ bufferID ]
          //bufferLength = this.end = this.length = buffer.length
          bufferLength = this.length = buffer.length
        }
      }else if( typeof bufferID === 'number' ){
        var keys = Object.keys( this.buffers )
        if( keys.length === 0 ) return 
        //console.log( "KEY", keys, keys[ bufferID ], bufferID )
        buffer = this.buffers[ keys[ bufferID ] ]
        bufferLength  = this.length = buffer.length
        //this.end( bufferLength )
        this.setPhase( 0 )
        //console.log( bufferLength, this.end, this.length )
      }
    },
    
    floatTo16BitPCM : function(output, offset, input){
      //console.log(output.length, offset, input.length )
      for (var i = 0; i < input.length - 1; i++, offset+=2){
        var s = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      }
    },
    encodeWAV : function(){
      //console.log("BUFFER LENGTH" + _buffer.length);
      var _buffer = this.getBuffer(),
          wavBuffer = new ArrayBuffer(44 + _buffer.length * 2),
          view = new DataView(wavBuffer),
          sampleRate = Gibberish.context.sampleRate;
      
      function writeString(view, offset, string){
        for (var i = 0; i < string.length; i++){
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      }

      /* RIFF identifier */
      writeString(view, 0, 'RIFF');
      /* file length */
      view.setUint32(4, 32 + _buffer.length * 2, true);
      /* RIFF type */
      writeString(view, 8, 'WAVE');
      /* format chunk identifier */
      writeString(view, 12, 'fmt ');
      /* format chunk length */
      view.setUint32(16, 16, true);
      /* sample format (raw) */
      view.setUint16(20, 1, true);
      /* channel count */
      view.setUint16(22, 1, true);
      /* sample rate */
      view.setUint32(24, sampleRate, true);
      /* byte rate (sample rate * block align) */
      view.setUint32(28, sampleRate * 4, true);
      /* block align (channel count * bytes per sample) */
      view.setUint16(32, 2, true);
      /* bits per sample */
      view.setUint16(34, 16, true);
      /* data chunk identifier */
      writeString(view, 36, 'data');
      /* data chunk length */
      view.setUint32(40, _buffer.length * 2, true);

      this.floatTo16BitPCM(view, 44, _buffer);

      return view;
    },
/**###Gibberish.Sampler.download : method  
Download the sampler buffer as a .wav file. In conjunction with the record method, this enables the Sampler
to record and downlaod Gibberish sessions.
**/  
    download : function( filename ) { // thanks to Palle and Gunnar for updates!
      var blob = this.encodeWAV();
      var audioBlob = new Blob( [ blob ] );

      // var url =  window.webkitURL.createObjectURL( audioBlob );
      var url;
      if (window.URL !== undefined) {
        url = window.URL.createObjectURL( audioBlob );
      } else if (window.webkitURL !== undefined) {
        url = window.webkitURL.createObjectURL( audioBlob );
      } else {
        console.log('Method Unavailable: createObjectURL');
        return;
      }

      var link = window.document.createElement('a');
      link.href = url;
      if( typeof filename === 'undefined' ) {
        filename = 'gibber_output.wav'
      }else if( filename.indexOf('.wav') === -1 ) {
        filename += '.wav'
      }

      link.download = filename || 'output.wav';

      var click = new MouseEvent('click', {
        'view': window,
        'bubbles': true,
        'cancelable': true
      });

      link.dispatchEvent(click);
    },

/**###Gibberish.Sampler.note : method  
Trigger playback of the samplers buffer
  
param **pitch** Number. The speed the sample is played back at.  
param **amp** Number. Optional. The volume to use.
**/   

/**###Gibberish.Sampler.range : method  
Set the start and end points in a single method call
  
param **start** Number. The start point for sample playback, 0..1
param **end** Number. The end point for sample playback, 0..1
**/  
    range: function( start, end ) {
      if( Array.isArray( start ) ) {
        end = start[1]
        start = start[0] 
      }
      
      if( end < start ) {
        var tmp = start
        start = end
        end = tmp
      }
      
      this.start = start
      this.end = end
    },

		note: function(pitch, amp) {
      if( typeof pitch === 'undefined' ) return

      switch( typeof pitch ) {
        case 'number' :
          this.pitch = pitch
          break;
        case 'function' :
          this.pitch = pitch()
          break;
        case 'object' :
          if( Array.isArray(pitch) ) {
            this.pitch = pitch[ 0 ]
          }else{
            this.pitch = pitch
          }
          break;
      }
      // if(typeof this.pitch === 'number' || typeof this.pitch === 'function' ){
      //   this.pitch = pitch;
      // }else if(typeof this.pitch === 'object'){
      //   this.pitch[0] = pitch;
      //   Gibberish.dirty(this);
      // }
      
			if(typeof amp === 'number') this.amp = amp;
			
			if(this.function !== null) {
				this.isPlaying = true;	// needed to allow playback after recording
        
        var __pitch;// = typeof this.pitch === 'number' || typeof this.pitch === 'function' ? this.pitch : this.pitch[0];  // account for modulations
                
        switch( typeof this.pitch ) {
          case 'number' :
            __pitch = this.pitch
            break;
          case 'function' :
            __pitch = this.pitch.getValue ? this.pitch.getValue() : this.pitch()
            break;
          case 'object' :
            if( Array.isArray( this.pitch ) ) {
              __pitch = this.pitch[ 0 ]
            } else {
              __pitch = this.pitch.getValue ? this.pitch.getValue() : this.pitch.input.getValue()              
            }
            
            if( typeof __pitch === 'function' ) __pitch = __pitch()
            
            break;
        }
        
        //         if( __pitch > 0 ) { //|| typeof __pitch === 'object' || typeof this.pitch === 'function' ) {
        //           phase = this.start;
        // }else{
        //           phase = this.end;
        // }
        phase = 0
        
        Gibberish.dirty( this )
        
        //this.pitch = __pitch;
			}
		},
/**###Gibberish.Sampler.record : method  
Record the output of a Gibberish ugen for a given amount of time
  
param **ugen** Object. The Gibberish ugen to be recorded.
param **recordLength** Number (in samples). How long to record for.
**/     
    // record : function(input, recordLength) {
    //       this.isRecording = true;
    //       
    //       var self = this;
    //       
    //       this.recorder = new Gibberish.Record(input, recordLength, function() {
    //         self.setBuffer( this.getBuffer() );
    //         self.end = bufferLength = self.getBuffer().length;
    //         self.setPhase( self.end )
    //         self.isRecording = false;
    //       })
    //       .record();
    //       
    //       return this;
    // },

/**###Gibberish.Sampler.getBuffer : method  
Returns a pointer to the Sampler's internal buffer.  
**/
    getBuffer : function() { return buffer; },
    setBuffer : function(b) { buffer = b },
    getPhase : function() { return phase },
    setPhase : function(p) { phase = p },
    getNumberOfBuffers: function() { return Object.keys( self.buffers ).length - 1 },
    
/**###Gibberish.Sampler.callback : method  
Return a single sample. It's a pretty lengthy method signature, they are all properties that have already been listed:  

_pitch, amp, isRecording, isPlaying, input, length, start, end, loops, pan
**/    
  	callback :function(_pitch, amp, isRecording, isPlaying, input, length, start, end, loops, pan) {
  		var val = 0, startInSamples = start * length, endInSamples = end * length;
  		phase += _pitch;
      
      // if( count++ % 44100 === 0 ) console.log( _pitch, startInSamples, endInSamples )
      
      if( buffer !== null && isPlaying ) {
        if( _pitch > 0 ) {
          if( startInSamples + phase < endInSamples ) {
            val = interpolate( buffer, startInSamples + phase )
          }else{
            if( loops ) phase = 0
          }
        }else{
          if( endInSamples + phase > startInSamples ) {
            val = interpolate( buffer, endInSamples + phase )
          }else{
            if( loops ) phase = 0
          }
        }
        
        return panner( val * amp, pan, out )
      }
	
  		out[0] = out[1] = val;
  		return out;
  	},
	})
  .init()
  .oscillatorInit()
  .processProperties(arguments);
  
	if(typeof arguments[0] !== "undefined") {
		if(typeof arguments[0] === "string") {
			this.file = arguments[0];
      this.pitch = 0;
			//this.isPlaying = true;
		}else if(typeof arguments[0] === "object") {
			if(arguments[0].file) {
				this.file = arguments[0].file;
				//this.isPlaying = true;
			}
		}
	}
  
  //console.log(this);
  		
	/*var _end = 1;
	Object.defineProperty(that, "end", {
		get : function() { return _end; },
		set : function(val) {
			if(val > 1) val = 1;
			_end = val * that.bufferLength - 1;
			Gibberish.dirty(that);
		}
	});
	var _start = 0;
	Object.defineProperty(that, "start", {
		get : function() { return _start; },
		set : function(val) {
			if(val < 0) val = 0;
			_start = val * that.bufferLength - 1;
			Gibberish.dirty(that);
		}
	});
	var _loops = 0;
	Object.defineProperty(that, "loops", {
		get : function() { return _loops; },
		set : function(val) {
			_loops = val;
			that.function.setLoops(_loops);
		}
	});
  */
  
	if(typeof Gibberish.audioFiles[this.file] !== "undefined") {
		buffer =  Gibberish.audioFiles[this.file];
		this.end = 1;
		this.buffers[ this.file ] = buffer;
    
    this.length = phase = this.bufferLength = buffer.length;
    Gibberish.dirty(this);
    
    if(this.onload) this.onload();
	}else if(this.file !== null){
    var xhr = new XMLHttpRequest(), initSound
        
    xhr.open( 'GET', this.file, true )
    xhr.responseType = 'arraybuffer'
    xhr.onload = function( e ) { initSound( this.response ) }
    xhr.send()
    
    //console.log("now loading sample", self.file )
    xhr.onerror = function( e ) { console.error( "Sampler file loading error", e )}
    
    initSound = function( arrayBuffer ) {
      Gibberish.context.decodeAudioData(arrayBuffer, function(_buffer) {
        buffer = _buffer.getChannelData(0)
        // self.length = phase = self.end = bufferLength = buffer.length
        self.length = phase = bufferLength = buffer.length
        self.isPlaying = true;
  			self.buffers[ self.file ] = buffer;

        //console.log("sample loaded | ", self.file, " | length | ", bufferLength);
  			Gibberish.audioFiles[self.file] = buffer;
			
        if(self.onload) self.onload();
      
        if(self.playOnLoad !== 0) self.note( self.playOnLoad );
      
  			self.isLoaded = true;
      }, function(e) {
        console.log('Error decoding file', e);
      }); 
    }
	}else if(typeof this.buffer !== 'undefined' ) {
		this.isLoaded = true;
					
		buffer = this.buffer;
    //this.end = this.bufferLength = buffer.length || 88200;
    this.bufferLength = buffer.length || 88200;
		    
		phase = this.bufferLength;
		if(arguments[0] && arguments[0].loops) {
			this.loops = 1;
		}
    Gibberish.dirty(this);
    
    if(this.onload) this.onload();
	}
};
Gibberish.Sampler.prototype = Gibberish._oscillator;
Gibberish.Sampler.prototype.record = function(input, recordLength) {
  this.isRecording = true;
  
  var self = this;
  
  this.recorder = new Gibberish.Record(input, recordLength, function() {
    self.setBuffer( this.getBuffer() );
    bufferLength = self.getBuffer().length;
    self.setPhase( self.end )
    self.isRecording = false;
  })
  .record();
  
  return this;
};

/**#Gibberish.MonoSynth - Synth
A three oscillator monosynth for bass and lead lines. You can set the octave and tuning offsets for oscillators 2 & 3. There is a 24db filter and an envelope controlling
both the amplitude and filter cutoff.
## Example Usage##
`  
t = new Gibberish.Mono({  
	cutoff:0,  
	filterMult:.5,  
	attack:_8,  
	decay:_8,  
	octave2:-1,  
	octave3:-1,  
	detune2:.01,  
	glide:_12,  
}).connect();  
t.note("C3");  `
## Constructors
  param **arguments** : Object. A dictionary of property values to set upon initialization. See the properties section and the example usage section for details.
**/
/**###Gibberish.MonoSynth.waveform : property
String. The primary oscillator to be used. Can currently be 'Sine', 'Square', 'Noise', 'Triangle' or 'Saw'. 
**/
/**###Gibberish.MonoSynth.attack : property
Integer. The length, in samples, of the attack of the amplitude envelope.
**/
/**###Gibberish.MonoSynth.decay : property
Integer. The length, in samples, of the decay of the amplitude envelope.
**/
/**###Gibberish.MonoSynth.amp : property
Float. The peak amplitude of the synth, usually between 0..1
**/
/**###Gibberish.MonoSynth.cutoff : property
Float. The frequency cutoff for the synth's filter. Range is 0..1.
**/
/**###Gibberish.MonoSynth.filterMult : property
Float. As the envelope on the synth progress, the filter cutoff will also change by this amount * the envelope amount.
**/
/**###Gibberish.MonoSynth.resonance : property
Float. The emphasis placed on the filters cutoff frequency. 0..50, however, GOING OVER 5 IS DANGEROUS TO YOUR EARS (ok, maybe 6 is all right...)
**/
/**###Gibberish.MonoSynth.octave2 : property
Integer. The octave difference between oscillator 1 and oscillator 2. Can be positive (higher osc2) or negative (lower osc 2) or 0 (same octave).
**/
/**###Gibberish.MonoSynth.detune2 : property
Float. The amount, from -1..1, the oscillator 2 is detuned. A value of -.5 means osc2 is half an octave lower than osc1. A value of .01 means osc2 is .01 octaves higher than osc1.
**/
/**###Gibberish.MonoSynth.octave3 : property
Integer. The octave difference between oscillator 1 and oscillator 3. Can be positive (higher osc3) or negative (lower osc 3) or 0 (same octave).
**/
/**###Gibberish.MonoSynth.detune3 : property
Float. The amount, from -1..1, the oscillator 3 is detuned. A value of -.5 means osc3 is half an octave lower than osc1. A value of .01 means osc3 is .01 octaves higher than osc1.
**/
/**###Gibberish.MonoSynth.glide : property
Integer. The length in time, in samples, to slide in pitch from one note to the next.
**/
Gibberish.MonoSynth = function() {  
	Gibberish.extend(this, { 
    name:       'monosynth',
    
    properties: {
  		attack:			10000,
  		decay:			10000,
  		cutoff:			.2,
  		resonance:	2.5,
  		amp1:			  1,
  		amp2:			  1,
  		amp3:			  1,
  		filterMult:	.3,
  		isLowPass:	true,
      pulsewidth: .5,
  		amp:		    .6,
  		detune2:		.01,
  		detune3:		-.01,
  		octave2:		1,
  		octave3:		-1,
      glide:      0,
  		pan:			  0,
      velocity:   1,
  		frequency:	0,
      channels:   2,
    },
    
		waveform:		"Saw3",
/**###Gibberish.MonoSynth.note : method
param **note or frequency** : String or Integer. You can pass a note name, such as "A#4", or a frequency value, such as 440.
param **amp** : Optional. Float. The volume of the note, usually between 0..1. The main amp property of the Synth will also affect note amplitude.
**/				
		note : function(_frequency, velocity) {
      if( typeof _frequency === 'undefined' ) return

      if(typeof velocity !== 'undefined' && velocity !== 0) this.velocity = velocity;
      
      if( velocity !== 0 ) {
    		if(typeof this.frequency !== 'object'){
      
          this.frequency = _frequency;
        }else{
          this.frequency[0] = _frequency;
          Gibberish.dirty(this);
        }
        
  			if(envstate() > 0 ) _envelope.run();
      }
		},
  	/*
    note : function(frequency, velocity) {
      if( typeof frequency === 'undefined' ) return
        
  		if(typeof this.frequency !== 'object'){
        if( useADSR && frequency === lastFrequency && velocity === 0) {
          this.releaseTrigger = 1;
          lastFrequency = null
          return;
        }
        if( velocity !== 0 ) {
          this.frequency = lastFrequency = frequency;
        }
        this.releaseTrigger = 0;
      }else{
        if( velocity !== 0 ) {
          this.frequency[0] = lastFrequency = frequency;
        }
        this.releaseTrigger = 0;
        Gibberish.dirty(this);
      }
					
  		if(typeof velocity !== 'undefined' && velocity !== 0) this.velocity = velocity;
	  
      if( velocity !== 0 ) { _envelope.run(); }
  	},
    */
	});
  
	var waveform = waveform1 = waveform2 = waveform3 = this.waveform;
	Object.defineProperty(this, "waveform", {
		get: function() { return waveform; },
		set: function(value) {
			if(waveform !== value) {
				waveform = value;
						
				osc1 = new Gibberish[ value ]().callback;
				osc2 = new Gibberish[ value ]().callback;
				osc3 = new Gibberish[ value ]().callback;
			}
		},
	});
  
  Object.defineProperties( this, {
    waveform1: {
      get: function() { return waveform1 },
      set: function(v) { waveform1 = v; osc1 = new Gibberish[ v ]().callback; }
    },
    waveform2: {
      get: function() { return waveform2 },
      set: function(v) { waveform2 = v; osc2 = new Gibberish[ v ]().callback; }
    },
    waveform3: {
      get: function() { return waveform3 },
      set: function(v) { waveform3 = v; osc3 = new Gibberish[ v ]().callback; }
    },
  })
  
  
	var _envelope = new Gibberish.AD(this.attack, this.decay),
      envstate  = _envelope.getState,
      envelope  = _envelope.callback,
      filter    = new Gibberish.Filter24().callback,
    	osc1      = new Gibberish[this.waveform](this.frequency,  this.amp1).callback,
    	osc2      = new Gibberish[this.waveform](this.frequency2, this.amp2).callback,
    	osc3      = new Gibberish[this.waveform](this.frequency3, this.amp3).callback,
      lag       = new Gibberish.OnePole().callback,      
    	panner    = Gibberish.makePanner(),
    	out       = [0,0];
  
  this.envelope = _envelope
  
  this.callback = function(attack, decay, cutoff, resonance, amp1, amp2, amp3, filterMult, isLowPass, pulsewidth, masterAmp, detune2, detune3, octave2, octave3, glide, pan, velocity, frequency, channels) {
		if(envstate() < 2) {
      if(glide >= 1) glide = .9999;
      frequency = lag(frequency, 1-glide, glide);
      
			var frequency2 = frequency;
			if(octave2 > 0) {
				for(var i = 0; i < octave2; i++) {
					frequency2 *= 2;
				}
			}else if(octave2 < 0) {
				for(var i = 0; i > octave2; i--) {
					frequency2 /= 2;
				}
			}
					
			var frequency3 = frequency;
			if(octave3 > 0) {
				for(var i = 0; i < octave3; i++) {
					frequency3 *= 2;
				}
			}else if(octave3 < 0) {
				for(var i = 0; i > octave3; i--) {
					frequency3 /= 2;
				}
			}
				
			frequency2 += detune2 > 0 ? ((frequency * 2) - frequency) * detune2 : (frequency - (frequency / 2)) * detune2;
			frequency3 += detune3 > 0 ? ((frequency * 2) - frequency) * detune3 : (frequency - (frequency / 2)) * detune3;
							
			var oscValue = osc1(frequency, amp1, pulsewidth) + osc2(frequency2, amp2, pulsewidth) + osc3(frequency3, amp3, pulsewidth);
			var envResult = envelope(attack, decay) * velocity;
			var val = filter( oscValue, cutoff + filterMult * envResult, resonance, isLowPass, 1) * envResult;
			val *= masterAmp;
			out[0] = out[1] = val;
			return channels === 1 ? out : panner(val, pan, out);
		}else{
			out[0] = out[1] = 0;
			return out;
		}
	}; 
  
  this.init();
  this.oscillatorInit();     
	this.processProperties(arguments);
};
Gibberish.MonoSynth.prototype = Gibberish._synth; 

/**#Gibberish.Binops - Miscellaneous
These objects create binary operations - mathematical operations taking two arguments - and create signal processing functions using them. They are primarily used for
modulation purposes. You can export the constructors for easier use similar to the [Time](javascript:displayDocs('Gibberish.Time'\)) constructors.

Add, Sub, Mul and Div can actually take as many arguments as you wish. For example, Add(1,2,3,4) will return an object that outputs 10. You can stack multiple oscillators this way as well.

##Example Usage   
`// This example creates a tremolo effect via amplitude modulation  
Gibberish.Binops.export(); // now all constructors are also part of the window object  
mod = new Gibberish.Sine(4, .25);  
sin = new Gibberish.Sine( 440, add( .5, mod ) ).connect();  
`
**/

Gibberish.Binops = {
/**###Gibberish.Binops.export : method  
Use this to export the constructor methods of Gibberish.Binops so that you can tersely refer to them.

param **target** object, default window. The object to export the Gibberish.Binops constructors into.
**/  
  export: function(target) {
    Gibberish.export("Binops", target || window);
  },
  
  operator : function () {
    var me = new Gibberish.ugen(),
        op = arguments[0],
        args = Array.prototype.slice.call(arguments, 1);
    
    me.name = 'op';
    me.properties = {};
    for(var i = 0; i < args.length; i++) { 
      me.properties[i] = args[i]; 
    }
    me.init.apply( me, args );
    
    me.codegen = function() {      
      var keys, out = "( ";
      
      if(typeof Gibberish.memo[this.symbol] !== 'undefined') { return Gibberish.memo[this.symbol]; }
      
      keys = Object.keys(this.properties);
            
      var shouldSkip = false;
      for(var i = 0; i < keys.length; i++) {
        if( shouldSkip ) { shouldSkip = false; continue; }
                
        var isObject = typeof this[i] === 'object';
        
        var shouldPush = false;
        if(isObject) {
          out += this[i].codegen();
        }else{
          out += this[i];
        }
        
        if( ( op === '*' || op === '/' ) && this[ i + 1 ] === 1 ) { 
          shouldSkip = true; continue; 
        }
        
        if(i < keys.length - 1) { out += " " + op + " "; }
        
        //if( isObject && shouldPush ) Gibberish.codeblock.push(this[i].codeblock); 
      }
      
      out += " )";
      
      this.codeblock = out;
      //Gibberish.memo[this.symbol] = out;
      
      return out;
    };
    
    me.valueOf = function() { return me.codegen() }
        
    //me.processProperties.apply( me, args );

    return me;
  },
  
/**###Gibberish.Binops.Add : method  
Create an object that sums all arguments at audio rate. The arguments may be unit generators, numbers, or any mix of the two.
**/
  Add : function() {
    var args = Array.prototype.slice.call(arguments, 0);
    args.unshift('+');
    
    return Gibberish.Binops.operator.apply(null, args);
  },

/**###Gibberish.Binops.Sub : method  
Create an object that starts with the first argument and subtracts all subsequent arguments at audio rate. The arguments may be unit generators, numbers, or any mix of the two.
**/
  Sub : function() {
    var args = Array.prototype.slice.call(arguments, 0);
    args.unshift('-');
    
    return Gibberish.Binops.operator.apply(null, args);
  },

/**###Gibberish.Binops.Mul : method  
Create an object that calculates the product of all arguments at audio rate. The arguments may be unit generators, numbers, or any mix of the two.
**/
  Mul : function() {
    var args = Array.prototype.slice.call(arguments, 0);
    args.unshift('*');
    
    return Gibberish.Binops.operator.apply(null, args);
  },

/**###Gibberish.Binops.Div : method  
Create an object that takes the first argument and divides it by all subsequent arguments at audio rate. The arguments may be unit generators, numbers, or any mix of the two.
**/
  Div : function() {
    var args = Array.prototype.slice.call(arguments, 0);
    args.unshift('/');
    
    return Gibberish.Binops.operator.apply(null, args);
  },

/**###Gibberish.Binops.Mod : method  
Create an object that takes the divides the first argument by the second and returns the remainder at audio rate. The arguments may be unit generators, numbers, or any mix of the two.
**/  
  Mod : function() {
    var args = Array.prototype.slice.call(arguments, 0);
    args.unshift('%');
    
    return Gibberish.Binops.operator.apply(null, args);

  },

/**###Gibberish.Binops.Abs : method  
Create an object that returns the absolute value of the (single) argument. The argument may be a unit generator or number.
**/  
  Abs : function() {
    var args = Array.prototype.slice.call(arguments, 0),
    me = {
      name : 'abs',
      properties : {},
      callback : Math.abs.bind( me ),
    };
    me.__proto__ = new Gibberish.ugen();
    me.properties[0] = args[0];
    me.init();

    return me;
  },
/**###Gibberish.Binops.Sqrt : method  
Create an object that returns the square root of the (single) argument. The argument may be a unit generator or number.
**/    
  Sqrt : function() {
    var args = Array.prototype.slice.call(arguments, 0),
    me = {
      name : 'sqrt',
      properties : {},
      callback : Math.sqrt.bind(me),
    };
    me.__proto__ = new Gibberish.ugen();    
    me.properties[i] = arguments[0];
    me.init();

    return me;
  },

/**###Gibberish.Binops.Pow : method  
Create an object that returns the first argument raised to the power of the second argument. The arguments may be a unit generators or numbers.
**/      
  Pow : function() {
    var args = Array.prototype.slice.call(arguments, 0),
    me = {
      name : 'pow',
      properties : {},
      callback : Math.pow.bind(me),
    };
    me.__proto__ = new Gibberish.ugen();
  
    for(var i = 0; i < args.length; i++) { me.properties[i] = args[i]; }
    me.init();
    
    console.log( me.callback )
    return me;
  },
  
  Clamp : function() {
    var args = Array.prototype.slice.call(arguments, 0),
    me = {
      name : 'clamp',
      properties : { input:0, min:0, max:1 },
      callback : function( input, min, max ) {
        if( input < min ) {
          input = min
        }else if( input > max ) {
          input = max
        }
        return input
      },
    };
    me.__proto__ = new Gibberish.ugen();

    me.init();
    me.processProperties( args );

    return me;
  },
  
  Merge : function() {
    var args = Array.prototype.slice.call(arguments, 0),
    me = {
      name : 'merge',
      properties : {},
      callback : function(a) {
        return a[0] + a[1];
      },
    };
    me.__proto__ = new Gibberish.ugen();
  
    for(var i = 0; i < args.length; i++) {
      me.properties[i] = args[i];
    }
    me.init();

    return me;
  },
            
  Map : function( prop, _outputMin, _outputMax, _inputMin, _inputMax, _curve, _wrap) {
    var pow = Math.pow,
    LINEAR = 0,
    LOGARITHMIC = 1,
    base = 0,
    phase = 0,
    _value = 0,
    me = {
      name : 'map',
      properties : { input:prop, outputMin:_outputMin, outputMax:_outputMax, inputMin:_inputMin, inputMax:_inputMax, curve:_curve || LINEAR, wrap: _wrap || false },
      callback : function( v, v1Min, v1Max, v2Min, v2Max, curve, wrap ) {
        var range1 = v1Max-v1Min,
            range2 = v2Max - v2Min,
            percent = (v - v2Min) / range2,
            val 
        
        if( percent > 1 ) {
          percent = wrap ? percent % 1 : 1
        }else if( percent < 0 ) {
          percent = wrap ? 1 + (percent % 1) : 0
        }
        
        val = curve === 0 ? v1Min + ( percent * range1 ) : v1Min + pow( percent, 1.5 ) * range1
        
        _value = val
        // if(phase++ % 22050 === 0 ) console.log( _value, percent, v )
        return val
      },
      // map_22(v_28, 0, 255, -1, 1, 0, false);
      getValue: function() { return _value },
      invert: function() {
        var tmp = me.outputMin
        me.outputMin = me.outputMax
        me.outputMax = tmp
      }
    }
  
    me.__proto__ = new Gibberish.ugen()
  
    me.init()

    return me
  },
};
/**#Gibberish.Time - Miscellaneous
This object is used to simplify timing in Gibberish. It contains an export function to place its methods in another object (like window)
so that you can code more tersely. The methods of the Time object translate ms, seconds and beats into samples. The default bpm is 120.

##Example Usage   
`Gibberish.Time.export(); // now all methods are also part of the window object
a = new Gibberish.Sine(440).connect();  
b = new Gibberish.Sequencer({ target:a, key:'frequency', durations:[ seconds(1), ms(500), beats( .5 ) ], values:[220,440,880] }).start()  
`
**/

/**###Gibberish.Time.bpm : property  
Number. Default 120. The beats per minute setting used whenever a call to the beats method is made.
**/

/**###Gibberish.Time.export : method  
Use this to export the methods of Gibberish.Time so that you can tersely refer to them.

param **target** object, default window. The object to export the Gibberish.Time methods into.
**/  

/**###Gibberish.Time.ms : method  
Convert the parameter from milliseconds to samples.

param **ms** number. The number of milliseconds to convert.
**/  

/**###Gibberish.Time.seconds : method  
Convert the parameter from seconds to samples.

param **seconds** number. The number of seconds to convert.
**/  

/**###Gibberish.Time.beats : method  
Return a function that converts the parameter from beats to samples. This method uses the bpm property of the Gibberish.Time object to determine the duration of a sample.
You can use the function returned by this method in a Sequencer; if Gibberish.Time.bpm is changed before the function is executed the function will use the updated value.

param **seconds** number. The number of seconds to convert.
**/  

Gibberish.Time = {
  bpm: 120,
  
  export: function(target) {
    Gibberish.export("Time", target || window);
  },
  
  ms : function(val) {
    return val * Gibberish.context.sampleRate / 1000;
  },
  
  seconds : function(val) {
    return val * Gibberish.context.sampleRate;
  },
  
  beats : function(val) {
    return function() { 
      var samplesPerBeat = Gibberish.context.sampleRate / ( Gibberish.Time.bpm / 60 ) ;
      return samplesPerBeat * val ;
    }
  },
};
/**#Gibberish.Sequencer - Miscellaneous
A sample-accurate sequencer that can sequence changes to properties, method calls or anonymous function calls.
  
## Example Usage##
`Gibberish.init();  
a = new Gibberish.Synth({ attack:44, decay:44100 }).connect();  
b = new Gibberish.Sequencer({ target:a, key:'note', durations:[11025, 22050], values:[440, 880] }).start()
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the sequencer on initialization.
- - - -
**/
/**###Gibberish.Sequencer.target : property  
Object. An object for the sequencer to control. May be null if you are sequencing anonymous functions.
**/
/**###Gibberish.Sequencer.key : property  
String. The name of the method or property you would like to sequnce on the Sequencer's target object.
**/
/**###Gibberish.Sequencer.durations : property  
Array. The number of samples between each advancement of the Sequencer. Once the Sequencer arrives at the end of this list, it loops back to the beginning
**/
/**###Gibberish.Sequencer.keysAndValues : property  
Object. A dictionary holding a set of values to be sequenced. The keys of the dictionary determine which methods and properties to sequence on the Sequencer's target object and
each key has an array of values representing the sequence for that key.
  
`Gibberish.init();  
a = new Gibberish.Synth({ attack:44, decay:44100 }).connect();  
b = new Gibberish.Sequencer({ target:a, durations:[11025, 22050], keysAndValues:{ 'note':[440,880], 'amp':[.2,.4] } }).start()
`
**/

Gibberish.Sequencer2 = function() {
  var that = this,
      phase = 0;
  
  Gibberish.extend(this, {
    target        : null,
    key           : null,
    values        : null,
    valuesIndex   : 0,
    durations     : null,
    durationsIndex: 0,
    nextTime      : 0,
    playOnce      : false,
    repeatCount   : 0,
    repeatTarget  : null,
    isConnected   : true,
    keysAndValues : null,
    counts        : {},
    properties    : { rate: 1, isRunning:false, nextTime:0 },
    offset        : 0,
    name          : 'seq',
    
    callback : function(rate, isRunning, nextTime) {
      if(isRunning) {
        if(phase >= nextTime) {
          if(that.values !== null) {
            if(that.target) {
              var val = that.values[ that.valuesIndex++ ];
              
              if(typeof val === 'function') { val = val(); }
              
              if(typeof that.target[that.key] === 'function') {
                that.target[that.key]( val );
              }else{
                that.target[that.key] = val;
              }
            }else{
              if(typeof that.values[ that.valuesIndex ] === 'function') {
                that.values[ that.valuesIndex++ ]();
              }
            }
            if(that.valuesIndex >= that.values.length) that.valuesIndex = 0;
          }else if(that.keysAndValues !== null) {
            for(var key in that.keysAndValues) {
              var index = that.counts[key]++;
              var val = that.keysAndValues[key][index];
              
              if(typeof val === 'function') { val = val(); }
              
              if(typeof that.target[key] === 'function') {
                that.target[key]( val );
              }else{
                that.target[key] = val;
              }
              if(that.counts[key] >= that.keysAndValues[key].length) {
                that.counts[key] = 0;
              }
              if( that.chose ) that.chose( key, index )
            }
          }else if(typeof that.target[that.key] === 'function') {
            that.target[that.key]();
          }
          
          phase -= nextTime;
        
          if(Array.isArray(that.durations)) {
            var next = that.durations[ that.durationsIndex++ ];
            that.nextTime = typeof next === 'function' ? next() : next;
            if( that.chose ) that.chose( 'durations', that.durationsIndex - 1 )
            if( that.durationsIndex >= that.durations.length) {
              that.durationsIndex = 0;
            }
          }else{
            var next = that.durations;
            that.nextTime = typeof next === 'function' ? next() : next;
          }
          
          if(that.repeatTarget) {
            that.repeatCount++;
            if(that.repeatCount === that.repeatTarget) {
              that.isRunning = false;
              that.repeatCount = 0;
            }
          }
          
          return 0;
        }
      
        phase += rate; //that.rate;
      }
      return 0;
    },
    
/**###Gibberish.Sequencer.start : method  
Start the sequencer running.

param **shouldKeepOffset** boolean, default false. If true, the phase of the sequencer will not be reset when calling the start method.
**/     
    start : function(shouldKeepOffset) {
      if(!shouldKeepOffset) {
        phase = 0;
      }
      
      this.isRunning = true;
      return this;
    },

/**###Gibberish.Sequencer.stop : method  
Stop the sequencer.
**/     
    stop: function() {
      this.isRunning = false;
      return this;
    },
    
/**###Gibberish.Sequencer.repeat : method  
Play the sequencer a certain number of times and then stop it.

param **timesToRepeat** number. The number of times to repeat the sequence.
**/        
    repeat : function(times) {
      this.repeatTarget = times;
      return this;
    },
    
    shuffle : function() {
      for( key in this.keysAndValues ) {
        this.shuffleArray( this.keysAndValues[ key ] )
      }
    },
    
    shuffleArray : function( arr ) {
  		for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
    },
/**###Gibberish.Sequencer.disconnect : method  
Each sequencer object has a tick method that is called once per sample. Use the disconnect method to stop the tick method from being called.
**/     
    /*disconnect : function() {
      var idx = Gibberish.sequencers.indexOf( this );
      Gibberish.sequencers.splice( idx, 1 );
      this.isConnected = false;
    },*/
/**###Gibberish.Sequencer.connect : method  
Each sequencer object has a tick method that is called once per sample. Use the connect method to start calling the tick method. Note that the connect
method is called automatically when the sequencer is first created; you should only need to call it again if you call the disconnect method at some point.
**/    
    /*connect : function() {
      if( Gibberish.sequencers.indexOf( this ) === -1 ) {
        Gibberish.sequencers.push( this );
      }
      Gibberish.dirty( this )
    },*/
  });
  
  this.init( arguments );
  this.processProperties( arguments );
  
  for(var key in this.keysAndValues) {
    this.counts[key] = 0;
  }
  
  this.oscillatorInit();
  
  phase += this.offset
  
  this.connect();
};
Gibberish.Sequencer2.prototype = Gibberish._oscillator
/**#Gibberish.Sequencer - Miscellaneous
A sample-accurate sequencer that can sequence changes to properties, method calls or anonymous function calls.
  
## Example Usage##
`Gibberish.init();  
a = new Gibberish.Synth({ attack:44, decay:44100 }).connect();  
b = new Gibberish.Sequencer({ target:a, key:'note', durations:[11025, 22050], values:[440, 880] }).start()
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the sequencer on initialization.
- - - -
**/
/**###Gibberish.Sequencer.target : property  
Object. An object for the sequencer to control. May be null if you are sequencing anonymous functions.
**/
/**###Gibberish.Sequencer.key : property  
String. The name of the method or property you would like to sequnce on the Sequencer's target object.
**/
/**###Gibberish.Sequencer.durations : property  
Array. The number of samples between each advancement of the Sequencer. Once the Sequencer arrives at the end of this list, it loops back to the beginning
**/
/**###Gibberish.Sequencer.keysAndValues : property  
Object. A dictionary holding a set of values to be sequenced. The keys of the dictionary determine which methods and properties to sequence on the Sequencer's target object and
each key has an array of values representing the sequence for that key.
  
`Gibberish.init();  
a = new Gibberish.Synth({ attack:44, decay:44100 }).connect();  
b = new Gibberish.Sequencer({ target:a, durations:[11025, 22050], keysAndValues:{ 'note':[440,880], 'amp':[.2,.4] } }).start()
`
**/

Gibberish.Sequencer = function() {  
  Gibberish.extend(this, {
    target        : null,
    key           : null,
    values        : null,
    valuesIndex   : 0,
    durations     : null,
    durationsIndex: 0,
    nextTime      : 0,
    phase         : 0,
    isRunning     : false,
    playOnce      : false,
    repeatCount   : 0,
    repeatTarget  : null,
    isConnected   : true,
    keysAndValues : null,
    counts        : {},
    offset        : 0,
    name          : 'seq',
    
    tick : function() {
      if(this.isRunning) {
        if(this.phase >= this.nextTime) {
          if(this.values !== null) {
            if(this.target) {
              var val = this.values[ this.valuesIndex++ ];
              
              if(typeof val === 'function') { 
                try {
                  val = val(); 
                }catch(e) {
                  console.error('ERROR: Can\'t execute function triggered by Sequencer:\n' + val.toString() )
                  this.values.splice( this.valuesIndex - 1, 1)
                  this.valuesIndex--;
                }
              }
              
              if(typeof this.target[this.key] === 'function') {
                this.target[this.key]( val );
              }else{
                this.target[this.key] = val;
              }
            }else{
              if(typeof this.values[ this.valuesIndex ] === 'function') {
                try {
                  this.values[ this.valuesIndex++ ]();
                }catch(e) {
                  console.error('ERROR: Can\'t execute function triggered by Sequencer:\n' + this.values[ this.valuesIndex - 1 ].toString() )
                  this.values.splice( this.valuesIndex - 1, 1)
                  this.valuesIndex--;
                }
              }
            }
            if(this.valuesIndex >= this.values.length) this.valuesIndex = 0;
          }else if(this.keysAndValues !== null) {
            for(var key in this.keysAndValues) {
              var index = typeof this.keysAndValues[ key ].pick === 'function' ? this.keysAndValues[ key ].pick() : this.counts[key]++;
              var val = this.keysAndValues[key][index];
              
              if(typeof val === 'function') { 
                try {
                  val = val(); 
                }catch(e) {
                  console.error('ERROR: Can\'t execute function triggered by Sequencer:\n' + val.toString() )
                  this.keysAndValues[key].splice( index, 1)
                  if( typeof this.keysAndValues[ key ].pick !== 'function' ) {
                    this.counts[key]--;
                  }
                }
              }
              
              if(typeof this.target[key] === 'function') {
                this.target[key]( val );
              }else{
                this.target[key] = val;
              }
              if(this.counts[key] >= this.keysAndValues[key].length) {
                this.counts[key] = 0;
              }
            }
          }else if(typeof this.target[this.key] === 'function') {
            this.target[this.key]();
          }
          
          this.phase -= this.nextTime;
        
          if(Array.isArray(this.durations)) {
            var next = typeof this.durations.pick === 'function' ? this.durations[ this.durations.pick() ] : this.durations[ this.durationsIndex++ ];
            this.nextTime = typeof next === 'function' ? next() : next;
            if( this.durationsIndex >= this.durations.length) {
              this.durationsIndex = 0;
            }
          }else{
            var next = this.durations;
            this.nextTime = typeof next === 'function' ? next() : next;
          }
          
          if(this.repeatTarget) {
            this.repeatCount++;
            if(this.repeatCount === this.repeatTarget) {
              this.isRunning = false;
              this.repeatCount = 0;
            }
          }
          
          return;
        }
      
        this.phase++
      }
    },

/**###Gibberish.Sequencer.start : method  
Start the sequencer running.

param **shouldKeepOffset** boolean, default false. If true, the phase of the sequencer will not be reset when calling the start method.
**/     
    start : function(shouldKeepOffset) {
      if(!shouldKeepOffset) {
        this.phase = this.offset;
      }
      
      this.isRunning = true;
      return this;
    },

/**###Gibberish.Sequencer.stop : method  
Stop the sequencer.
**/     
    stop: function() {
      this.isRunning = false;
      return this;
    },
    
/**###Gibberish.Sequencer.repeat : method  
Play the sequencer a certain number of times and then stop it.

param **timesToRepeat** number. The number of times to repeat the sequence.
**/        
    repeat : function(times) {
      this.repeatTarget = times;
      return this;
    },
    
    shuffle : function() {
      for( key in this.keysAndValues ) {
        this.shuffleArray( this.keysAndValues[ key ] )
      }
    },
    
    shuffleArray : function( arr ) {
  		for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
    },

/**###Gibberish.Sequencer.disconnect : method  
Each sequencer object has a tick method that is called once per sample. Use the disconnect method to stop the tick method from being called.
**/     
    disconnect : function() {
      var idx = Gibberish.sequencers.indexOf( this );
      Gibberish.sequencers.splice( idx, 1 );
      this.isConnected = false;
    },
/**###Gibberish.Sequencer.connect : method  
Each sequencer object has a tick method that is called once per sample. Use the connect method to start calling the tick method. Note that the connect
method is called automatically when the sequencer is first created; you should only need to call it again if you call the disconnect method at some point.
**/    
    connect : function() {
      if( Gibberish.sequencers.indexOf( this ) === -1 ) {
        Gibberish.sequencers.push( this );
      }
      
      this.isConnected = true
      
      return this
    },
  });
  
  for(var key in arguments[0]) {
    this[key] = arguments[0][key];
  }
  
  for(var key in this.keysAndValues) {
    this.counts[key] = 0;
  }
  
  this.connect();
  
  this.phase += this.offset
  
  //this.init( arguments );
  //this.oscillatorInit();
  //this.processProperties( arguments );
};
Gibberish.Sequencer.prototype = Gibberish._oscillator
// TODO: must fix scale seq

/*
c = new Gibberish.Synth({ pan:-1 }).connect();
b = new Gibberish.Synth({ pan:1 }).connect(); 
a = new Gibberish.PolySeq({ 
  seqs:[
    { key:'note', target:b, values:[440,880], durations:22050 },
    { key:'note', target:c, values:[220,1320], durations:[11025, 22050, 5512.5] },
  ] 
}).start()
*/
Gibberish.PolySeq = function() {
  var that = this,
      phase = 0,
      sort = function(a,b) { if( a < b ) return -1; if( a > b ) return 1; return 0; } ;
  
  Gibberish.extend(this, {
    seqs          : [],
    autofire      : [], // seqs with no scheduling that fire everytime a scheduled seq is triggered    
    timeline      : {},
    playOnce      : false,
    repeatCount   : 0,
    repeatTarget  : null,
    isConnected   : false,
    properties    : { rate: 1, isRunning:false, nextTime:0 },
    offset        : 0,
    name          : 'polyseq',
    getPhase      : function() { return phase },
    setPhase      : function(v) { phase = v },
    adjustPhase   : function(v) { phase += v },
    timeModifier  : null,
    add           : function( seq, pos ) {
      seq.valuesIndex = seq.durationsIndex = 0

      if( seq.durations === null ) {
        seq.autofire = true
        that.autofire.push( seq )
      }else{
        if( typeof pos === 'undefined' ) {
          that.seqs.push( seq )
        }else{
          that.seqs.splice( pos, 0, seq )
        }
        
        if( typeof that.timeline[ phase ] !== 'undefined' ) {
          if( seq.priority ) {
            that.timeline[ phase ].unshift( seq )
          }else{
            that.timeline[ phase ].push( seq )
          }
        }else{
          that.timeline[ phase ] = [ seq ]
        }
        
        that.nextTime = phase
      }
      // for Gibber... TODO: remove from Gibberish
      if( that.scale && (seq.key === 'frequency' || seq.key === 'note') ) {
        if( that.applyScale ) {
          that.applyScale()
        }
      }

      seq.shouldStop = false
    },
    
    callback : function(rate, isRunning, nextTime) {
      var newNextTime;
      
      if(isRunning) {
        if(phase >= nextTime) {
          var seqs = that.timeline[ nextTime ],
              phaseDiff = phase - nextTime
              
          if( typeof seqs === 'undefined') return
                    
          for( var j = 0; j < seqs.length; j++ ) {
            var seq = seqs[ j ]
            if( seq.shouldStop ) continue;

            var idx = seq.values.pick ? seq.values.pick() : seq.valuesIndex++ % seq.values.length
            
            var val = typeof seq.values === 'function' ? seq.values() : seq.values[ idx ];
    
            if(typeof val === 'function') { val = val(); } // will also call anonymous function
    
            if( seq.target ) {
              if( typeof seq.target[ seq.key ] === 'function' ) {
                seq.target[ seq.key ]( val );
              }else{
                seq.target[ seq.key ] = val;
              }
            }
            
            if( that.chose ) that.chose( seq.key, idx )
             
            if( Array.isArray( seq.durations ) ) {
              var idx = seq.durations.pick ? seq.durations.pick() : seq.durationsIndex++,
                  next = typeof seq.durations === 'function' ? seq.durations() : seq.durations[ idx ]

              newNextTime = typeof next === 'function' ? next() : next;
              if( typeof seq.durations !== 'function' && seq.durationsIndex >= seq.durations.length ) {
                seq.durationsIndex = 0;
              }
              if( that.chose ) that.chose( 'durations', idx )
            }else{
              var next = typeof seq.durations === 'function' ? seq.durations() : seq.durations;
              
              newNextTime = typeof next === 'function' ? next() : next;
            }
        
            var t;
          
            if( that.timeModifier !== null ) {
              t = that.timeModifier( newNextTime ) + phase // TODO: remove Gibber link... how?
            }else{
              t = newNextTime + phase
            }
          
            t -= phaseDiff
            newNextTime -= phaseDiff
          
            if( typeof that.timeline[ t ] === 'undefined' ) {
              that.timeline[ t ] = [ seq ]
            }else{
              if( seq.priority ) {
                that.timeline[ t ].unshift( seq )
              }else{
                that.timeline[ t ].push( seq )
              }
            }
          }
          
          for( var j = 0, l = that.autofire.length; j < l; j++ ) {
            var seq = that.autofire[ j ]
            if( seq.shouldStop ) continue;

            var idx = seq.values.pick ? seq.values.pick() : seq.valuesIndex++ % seq.values.length,
                val = seq.values[ idx ];
    
            if(typeof val === 'function') { val = val(); } // will also call anonymous function
    
            if( seq.target ) {
              if(typeof seq.target[ seq.key ] === 'function') {
                seq.target[ seq.key ]( val );
              }else{
                seq.target[ seq.key ] = val;
              }
            }
            
            if( that.chose ) that.chose( seq.key, idx )
          }
          
          delete that.timeline[ nextTime ]
          
          var times = Object.keys( that.timeline ),
              timesLength = times.length;
          
          if( timesLength > 1 ) {
            for( var i = 0; i < timesLength; i++ ) {
              times[ i ] = parseFloat( times[i] )
            }
          
            times = times.sort( sort )
            that.nextTime = times[0]
          }else{
            that.nextTime = parseFloat( times[0] )
          }
          
          // if(that.repeatTarget) {
          //   that.repeatCount++;
          //   if(that.repeatCount === that.repeatTarget) {
          //     that.isRunning = false;
          //     that.repeatCount = 0;
          //   }
          // }  
        }
        
        // TODO: If you set the phase to 0, it will be lower than nextTime for many many samples in a row, causing it to quickly skip
        // through lots of key / value pairs.
        
        phase += rate;
      }
      return 0;
    },
  
    start : function(shouldKeepOffset, priority) {
      if(!shouldKeepOffset || ! this.offset ) {
        phase = 0;
        this.nextTime = 0;
        
        this.timeline = { 0:[] }
        for( var i = 0; i < this.seqs.length; i++ ) {
          var _seq = this.seqs[ i ]
    
          _seq.valuesIndex = _seq.durationsIndex = _seq.shouldStop = 0
    
          this.timeline[ 0 ].push( _seq )
        }
      }else{
        phase = 0;
        this.nextTime = this.offset;
        
        var ___key = ''+this.offset
        
        this.timeline = {}
        this.timeline[ ___key ] = []

        for( var i = 0; i < this.seqs.length; i++ ) {
          var _seq = this.seqs[ i ]
    
          _seq.valuesIndex = _seq.durationsIndex = _seq.shouldStop = 0
    
          this.timeline[ ___key ].push( _seq )
        }
      }
      
      if( !this.isConnected ) {
        this.connect( Gibberish.Master, priority )
        this.isConnected = true
      }
      
      this.isRunning = true;
      return this;
    },
    
    stop: function() {
      this.isRunning = false;
      
      if( this.isConnected ) {
        this.disconnect()
        this.isConnected = false
      }
      return this;
    },
       
    repeat : function(times) {
      this.repeatTarget = times;
      return this;
    },
    
    shuffle : function( seqName ) {
      if( typeof seqName !== 'undefined' ) {
        for( var i = 0; i < this.seqs.length; i++ ) {
          if( this.seqs[i].key === seqName ) {
            this.shuffleArray( this.seqs[i].values )
          }
        }
      }else{
        for( var i = 0; i < this.seqs.length; i++ ) {
          this.shuffleArray( this.seqs[i].values )
        }
      }
    },
    
    shuffleArray : function( arr ) {
  		for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
    },

  });
  
  this.init( arguments );
  this.processProperties( arguments );
  
  this.oscillatorInit();
};
Gibberish.PolySeq.prototype = Gibberish._oscillator
var _hasInput = false; // wait until requested to ask for permissions so annoying popup doesn't appear automatically

if( typeof navigator === 'object' ) {
  navigator.getUserMedia = ( navigator.getUserMedia       ||
                             navigator.webkitGetUserMedia ||
                             navigator.mozGetUserMedia    ||
                             navigator.msGetUserMedia )
}
                           
function createInput() {
  console.log("connecting audio input...");
  
  navigator.getUserMedia(
		{audio:true}, 
		function (stream) {
      console.log( 'audio input connected' )
	    Gibberish.mediaStreamSource = Gibberish.context.createMediaStreamSource( stream );
	    Gibberish.mediaStreamSource.connect( Gibberish.node );
			_hasInput = true;
		},
    function( e ) { 
      console.log( e )
      console.log( 'error opening audio input')
    }
	)
}
/**#Gibberish.Input - Oscillator
Accept input from computer's line-in or microphone input. Use headphones and beware feedback! Reading the audio input is currently only supported by Google Chrome.

## Example Usage##
`
Gibberish.init();  
a = new Gibberish.Input()  
b = new Gibberish.Delay( a ).connect()  
- - - -
**/
/**###Gibberish.Input.amp : property  
Number. A gain multiplier for the input
**/

Gibberish.Input = function() {
  var out = [], phase = 0;
  
	if(!_hasInput) { 
		createInput(); 
	}
  
  this.type = this.name = 'input'
  
  this.fx = new Array2() 
  this.fx.parent = this
  
  this.properties = {
    input : 'input',
    amp : .5,  
    channels : 1,
  }
  
  this.callback = function(input, amp, channels) {
    if(channels === 1) {
      out = input * amp;
    }else {
      out[0] = input[0] * amp;
      out[1] = input[1] * amp;      
    }
    return out;
  }
  
  this.init( arguments )
  this.processProperties( arguments )
};
Gibberish.Input.prototype = new Gibberish.ugen();
Gibberish.Kick = function() {
  var trigger = false,
    	bpf = new Gibberish.SVF().callback,
    	lpf = new Gibberish.SVF().callback,
      _decay = .2,
      _tone = .8;
      
  Gibberish.extend(this, {
  	name:		"kick",
    properties:	{ pitch:50, __decay:20, __tone: 1000, amp:2, sr: Gibberish.context.sampleRate },
	
  	callback: function(pitch, decay, tone, amp, sr) {					
  		var out = trigger ? 60 : 0;
			
  		out = bpf( out, pitch, decay, 2, sr );
  		out = lpf( out, tone, .5, 0, sr );
		
  		out *= amp;
		
  		trigger = false;
		
  		return out;
  	},

  	note : function(p, d, t, amp) {
  		if(typeof p === 'number') this.pitch = p;
  		if(typeof d === 'number') this.decay = d;
  		if(typeof t === 'number') this.tone = t;
  		if(typeof amp === 'number') this.amp = amp;
		
      trigger = true;
  	},
  })
  .init()
  .oscillatorInit();
  
  Object.defineProperties(this, {
    decay :{
      get: function() { return _decay; },
      set: function(val) { _decay = val > 1 ? 1 : val; this.__decay = _decay * 100; }
    },
    tone :{
      get: function() { return _tone; },
      set: function(val) { _tone = val > 1 ? 1 : val; this.__tone = 220 + val * 1400;  }
    },
  });
  
  this.processProperties(arguments);
};
Gibberish.Kick.prototype = Gibberish._oscillator;

// congas are bridged t-oscillators like kick without the low-pass filter
Gibberish.Conga = function() {
  var trigger = false,
    	bpf = new Gibberish.SVF().callback,
      _decay = .5;
      
  Gibberish.extend(this, {
  	name:		"conga",
    properties:	{ pitch:190, /*__decay:50,*/ amp:2, sr:Gibberish.context.sampleRate },
	
  	callback: function(pitch, /*decay,*/ amp, sr) {					
  		var out = trigger ? 60 : 0;
			
  		out = bpf( out, pitch, 50, 2, sr );
		
  		out *= amp;
		
  		trigger = false;
		
  		return out;
  	},

  	note : function(p, amp) {
  		if(typeof p === 'number') this.pitch = p;
  		if(typeof amp === 'number') this.amp = amp;
		
      trigger = true;
  	},
  })
  .init()
  .oscillatorInit();

  // Object.defineProperties(this, {
  //   decay :{
  //     get: function() { return _decay; },
  //     set: function(val) { _decay = val > 1 ? 1 : val; this.__decay = _decay * 100; }
  //   }
  // });
  // 
  this.processProperties(arguments);
}
Gibberish.Conga.prototype = Gibberish._oscillator;

// clave are also bridged t-oscillators like kick without the low-pass filter
Gibberish.Clave = function() {
  var trigger = false,
    	_bpf = new Gibberish.SVF(),
      bpf = _bpf.callback,
      _decay = .5;
      
  Gibberish.extend(this, {
  	name:		"clave",
    properties:	{ pitch:2500, /*__decay:50,*/ amp:1, sr:Gibberish.context.sampleRate },
	
  	callback: function(pitch, /*decay,*/ amp, sr) {					
  		var out = trigger ? 2 : 0;
			
  		out = bpf( out, pitch, 5, 2, sr );
		
  		out *= amp;
		
  		trigger = false;
		
  		return out;
  	},

  	note : function(p, amp) {
  		if(typeof p === 'number') this.pitch = p;
  		if(typeof amp === 'number') this.amp = amp;
		
      trigger = true;
  	},
  })
  .init()
  .oscillatorInit();
  
  this.bpf = _bpf;
  // Object.defineProperties(this, {
  //   decay :{
  //     get: function() { return _decay; },
  //     set: function(val) { _decay = val > 1 ? 1 : val; this.__decay = _decay * 100; }
  //   }
  // });
  // 
  this.processProperties(arguments);
}
Gibberish.Clave.prototype = Gibberish._oscillator;

// tom is tbridge with lpf'd noise
Gibberish.Tom = function() {
  var trigger = false,
    	bpf = new Gibberish.SVF().callback,
    	lpf = new Gibberish.SVF().callback,
      _eg = new Gibberish.ExponentialDecay(),
      eg  = _eg.callback,
      rnd = Math.random,
      _decay = .2,
      _tone = .8;
      
  Gibberish.extend(this, {
  	name:		"tom",
    properties:	{ pitch:80, amp:.5, sr:Gibberish.context.sampleRate },
	
  	callback: function(pitch, amp, sr) {					
  		var out = trigger ? 60 : 0,
          noise;
			
  		out = bpf( out, pitch, 30, 2, sr );
      
      noise = rnd() * 16 - 8
		  noise = noise > 0 ? noise : 0;
      
      noise *= eg(.05, 11025);
      
  		noise = lpf( noise, 120, .5, 0, sr );
      
      out += noise;
  		out *= amp;
		
  		trigger = false;
		
  		return out;
  	},

  	note : function(p, amp) {
  		if(typeof p === 'number') this.pitch = p;
  		if(typeof amp === 'number') this.amp = amp;
		  
      _eg.trigger();
      trigger = true;
  	},
  })
  .init()
  .oscillatorInit();
  
  _eg.trigger(1)
  
  this.processProperties(arguments);
}
Gibberish.Tom.prototype = Gibberish._oscillator;

Gibberish.Clap = function() {
  var _bpf = new Gibberish.Biquad(),
      bpf  = _bpf.callback,
      _bpf2 = new Gibberish.Biquad(),
      bpf2 = _bpf2.callback,
      _bpf3 = new Gibberish.Biquad(),
      bpf3 = _bpf3.callback,      
      _eg = new Gibberish.ExponentialDecay(),
      eg  = _eg.callback,
      _eg2 = new Gibberish.ExponentialDecay(),
      eg2 = _eg2.callback,
      _ad  = new Gibberish.Line(),
      ad = _ad.callback,
      _lfo = new Gibberish.Saw(),
      lfo = _lfo.callback,
      rnd = Math.random,
      cutoff = 1000,
      rez = 2.5,
      env1K = .025,
      env2K = .9,
      env1Dur = 30 * 44.1,
      env2Dur = 660,
      freq = 100
      
  _bpf.mode = _bpf2.mode = 'BP'
  _bpf3.mode = 'BP'
  _bpf3.cutoff = 2400
  
  _bpf.cutoff = _bpf2.cutoff = 1000
  _bpf.Q = 2
  _bpf2.Q = 1
      
  Gibberish.extend(this, {
  	name:		"clap",
    properties:	{ amp:.5, sr:Gibberish.context.sampleRate },
	
  	callback: function( amp, sr ) {
  		var out = 0, noiseBPF, noise, env;
			      
      noiseBPF = rnd() * 4 - 2 //* 4 - 2
		  noiseBPF = noiseBPF > 0 ? noiseBPF : 0;
      
      noise = rnd() * 4 - 2 //* 16 - 8
		  noise = noise > 0 ? noise : 0;
      
  		out = bpf2( bpf( noiseBPF ) ) //, cutoff, rez, 2, sr ); // mode 2 is bp
      
      out *= eg2( env2K, env2Dur )
      
      noise = bpf3( lfo( freq, noise ) * eg( env1K, env1Dur ) )//ad( 1,0, env1Dur, false ) );
      
      out += noise;
  		out *= amp;
		
  		return out;
  	},

  	note : function( amp ) {
  		if(typeof amp === 'number') this.amp = amp;
		  
      _eg2.trigger();
      _eg.trigger();
      _ad.setPhase(0);
      _lfo.setPhase(0);

  	},
  })
  .init()
  .oscillatorInit();
  
  // _eg.trigger(1)
  // _eg2.trigger(1)
  
  this.getBPF = function() { return _bpf; }
  this.getBPF2 = function() { return _bpf2; }
  this.getBPF3 = function() { return _bpf3; }
  this.getLine = function() { return _ad; }
  
  this.setEnvK = function( k1,k2,d1,d2 ) {
    env1K = k1
    if( k2 ) env2K = k2
    if( d1 ) env1Dur = d1
    if( d2 ) env2Dur = d2    
  }
  
  this.setFreq = function(v) { freq = v }
  
  this.setRez = function(v) { rez = v; }
  this.setCutoff = function(v) { cutoff = v; }  
  
  this.processProperties(arguments);
}
Gibberish.Clap.prototype = Gibberish._oscillator;

// http://www.soundonsound.com/sos/Sep02/articles/synthsecrets09.asp
Gibberish.Cowbell = function() {
  var _s1 = new Gibberish.Square(),
      _s2 = new Gibberish.Square(),
      s1 = _s1.callback,
      s2 = _s2.callback,                              

      _bpf = new Gibberish.SVF({ mode:2 }),
      bpf   = _bpf.callback,

      _eg   = new Gibberish.ExponentialDecay( .0025, 10500 ),
      eg    = _eg.callback;
  
  Gibberish.extend(this, {
  	name: "cowbell",
  	properties : { amp: 1, pitch: 560, bpfFreq:1000, bpfRez:3, decay:22050, decayCoeff:.0001, sr:Gibberish.context.sampleRate },
	
  	callback : function(amp, pitch, bpfFreq, bpfRez, decay, decayCoeff, sr) {
  		var val;
      
  		val =  s1( pitch, 1, 1, 0 );
  		val += s2( 845, 1, 1, 0 );
		
      val  = bpf(  val, bpfFreq, bpfRez, 2, sr );
      		
      val *= eg(decayCoeff, decay);
  
  		val *= amp;
		  
  		return val;
  	},
	
  	note : function(_decay, _decay2) {
      _eg.trigger()
  		if(_decay)
  			this.decay = _decay;
  	}
  })
  .init()
  .oscillatorInit()
  .processProperties(arguments);
  
  this.bpf = _bpf;
  this.eg = _eg;
  
  _eg.trigger(1);
};
Gibberish.Cowbell.prototype = Gibberish._oscillator;

Gibberish.Snare = function() {
  var bpf1      = new Gibberish.SVF().callback,
      bpf2      = new Gibberish.SVF().callback,
      noiseHPF  = new Gibberish.SVF().callback,
      _eg       = new Gibberish.ExponentialDecay( .0025, 11025 ),
      eg        = _eg.callback,            
      rnd       = Math.random,
      phase  = 11025,      
      out    = 0,
      envOut = 0;
      
  Gibberish.extend(this, {
  	name: "snare",
  	properties: { cutoff:1000, decay:11025, tune:0, snappy:.5, amp:1, sr:Gibberish.context.sampleRate },

  	callback: function(cutoff, decay, tune, snappy, amp, sr) {
  		var p1, p2, noise = 0, env = 0, out = 0;

  		env = eg(.0025, decay);
		
  		if(env > .005) {	
  			out = ( rnd() * 2 - 1 ) * env ;
  			out = noiseHPF( out, cutoff + tune * 1000, .5, 1, sr );
  			out *= snappy;
        
        // rectify as per instructions found here: http://ericarcher.net/devices/tr808-clone/
        out = out > 0 ? out : 0;
        
  			envOut = env;
			
  			p1 = bpf1( envOut, 180 * (tune + 1), 15, 2, sr );
  			p2 = bpf2( envOut, 330 * (tune + 1), 15, 2, sr );
		
  			out += p1; 
  			out += p2 * .8;
  			out *= amp;
  		}

  		return out;
  	},

  	note : function(t, amp, s, c) {
      if(typeof t === 'number')   this.tune = t;					      
  		if(typeof c === 'number')   this.cutoff = c;					
  		if(typeof s === 'number')   this.snappy = s; 
  		if(typeof amp === 'number') this.amp = amp;
		
  		_eg.trigger()
  	},
  })
  .init()
  .oscillatorInit()
  .processProperties(arguments);
  
  _eg.trigger(1);
}
Gibberish.Snare.prototype = Gibberish._oscillator;

Gibberish.Hat = function() {
  var _s1 = new Gibberish.Square(),
      _s2 = new Gibberish.Square(),
      _s3 = new Gibberish.Square(),
      _s4 = new Gibberish.Square(),
      _s5 = new Gibberish.Square(),
      _s6 = new Gibberish.Square(),
      s1 = _s1.callback,
      s2 = _s2.callback,
      s3 = _s3.callback,
      s4 = _s4.callback,
      s5 = _s5.callback,
      s6 = _s6.callback,                              
      //_bpf = new Gibberish.Biquad({ mode:'BP' }),
      _bpf = new Gibberish.SVF({ mode:2 }),
      bpf   = _bpf.callback,
      _hpf  = new Gibberish.Filter24(),
      hpf   = _hpf.callback,
      _eg   = new Gibberish.ExponentialDecay( .0025, 10500 ),
      eg    = _eg.callback,
      _eg2   = new Gibberish.ExponentialDecay( .1, 7500 ),
      eg2    = _eg2.callback;        
  
  Gibberish.extend(this, {
  	name: "hat",
  	properties : { amp: 1, pitch: 325, bpfFreq:7000, bpfRez:2, hpfFreq:.975, hpfRez:0, decay:3500, decay2:3000, sr:Gibberish.context.sampleRate },
	
  	callback : function(amp, pitch, bpfFreq, bpfRez, hpfFreq, hpfRez, decay, decay2, sr) {
  		var val;
      
  		val =  s1( pitch, 1, .5, 0 );
  		val += s2( pitch * 1.4471, .75, 1, 0 );
  		val += s3( pitch * 1.6170, 1, 1, 0 );
  		val += s4( pitch * 1.9265, 1, 1, 0 );
  		val += s5( pitch * 2.5028, 1, 1, 0 );
  		val += s6( pitch * 2.6637, .75, 1, 0 );
		
      val  = bpf(  val, bpfFreq, bpfRez, 2, sr );
      		
  		val  *= eg(.001, decay);
      
      // rectify as per instructions found here: http://ericarcher.net/devices/tr808-clone/
      // val = val > 0 ? val : 0;
        		
  		//sample, cutoff, resonance, isLowPass, channels
  		val 	= hpf(val, hpfFreq, hpfRez, 0, 1 );
  
  		val *= amp;
		  
  		return val;
  	},
	
  	note : function(_decay, _decay2) {
  		_eg.trigger()
  		_eg2.trigger()
  		if(_decay)
  			this.decay = _decay;
  		if(_decay2)
  			this.decay2 = _decay2;
		
  	}
  })
  .init()
  .oscillatorInit()
  .processProperties(arguments);
  
  this.bpf = _bpf;
  this.hpf = _hpf;
  
  _eg.trigger(1);
  _eg2.trigger(1);
};
Gibberish.Hat.prototype = Gibberish._oscillator;

/* IMPORTANT README
*
* This class depends on having access to a folder of soundfonts that have been converted to
* binary string representations. More specifically, soundfonts designed to work with GenMIDI.js:
*
* https://github.com/gleitz/midi-js-soundfonts
*
* At some point it would be nice to make another soundfont system, as GenMIDI.js does not support
* defining loop points.
*
* By default soundfonts should be found in a folder named 'resources/soundfonts' one level above
* the location of the gibberish.js library (or gibberish.min.js). You can pass a different path
* as the second argument to the Gibberish.SoundFont constructor; the first is the name of the soundfont
* minus the "-mp3.js" extension. So, for example:
*
* b = new Gibberish.SoundFont( 'choir_aahs' ).connect()
* b.note( 'C4' )
*
* Note that you can only use note names, not frequency values.
*/

(function() {
  var cents = function(base, _cents) { return base * Math.pow(2,_cents/1200) },
      GenMIDI = { Soundfont: { instruments: {} } },
      SF = GenMIDI.Soundfont
  
  // TODO: GET RID OF THIS GLOBAL!!!! It's unfortunately in there because we're using soundfonts meant for GenMIDI.js
  if( typeof window === 'object' )
    window.GenMIDI = GenMIDI
  else
    global.GenMIDI = GenMIDI
  
  var getScript = function( scriptPath, handler ) {
    var oReq = new XMLHttpRequest();
    
    oReq.addEventListener("load", transferComplete, false);
    oReq.addEventListener("error", function(e){ console.log( "SF load error", e ) }, false);

    oReq.open( 'GET', scriptPath, true );
    oReq.send()
    //console.log("COMPLETE", scriptPath, evt )
    //var script = document.createElement('script')
    //script.innerHTML = evt.srcElement ? evt.srcElement.responseText : evt.target.responseText
    //script.onload = handler
    //script.src = scriptPath
    //document.querySelector( 'head' ).appendChild( script )

    function updateProgress (oEvent) {
      if (oEvent.lengthComputable) {
        var percentComplete = oEvent.loaded / oEvent.total;
        number.innerHTML = Math.round( percentComplete * 100 )

        var sizeString = new String( "" + oEvent.total )
        sizeString = sizeString[0] + '.' + sizeString[1] + ' MB'
        size.innerHTML = sizeString
        
        Gibber.log( percentComplete, "%" )
      } else {
        // Unable to compute progress information since the total size is unknown
      }
    }

    function transferComplete( evt ) {
      var script = document.createElement('script')
      script.innerText = evt.srcElement ? evt.srcElement.responseText : evt.target.responseText
      //script.onload = function() { console.log('LOADED FINAL SCRIPT', handler ) }
      //script.onerror = function( err ) { console.log( 'SCRIPT ERROR', err ) }
      document.querySelector( 'head' ).appendChild( script )
      setTimeout( handler, 0 )
    }
  }
  
  var Base64Binary = {
  	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
	
  	// will return a  Uint8Array type
  	decodeArrayBuffer: function(input) {
  		var bytes = (input.length/4) * 3;
  		var ab = new ArrayBuffer(bytes);
  		this.decode(input, ab);
		
  		return ab;
  	},
	
  	decode: function(input, arrayBuffer) {
  		//get last chars to see if are valid
  		var lkey1 = this._keyStr.indexOf(input.charAt(input.length-1));		 
  		var lkey2 = this._keyStr.indexOf(input.charAt(input.length-2));		 
	
  		var bytes = (input.length/4) * 3;
  		if (lkey1 == 64) bytes--; //padding chars, so skip
  		if (lkey2 == 64) bytes--; //padding chars, so skip
		
  		var uarray;
  		var chr1, chr2, chr3;
  		var enc1, enc2, enc3, enc4;
  		var i = 0;
  		var j = 0;
		
  		if (arrayBuffer)
  			uarray = new Uint8Array(arrayBuffer);
  		else
  			uarray = new Uint8Array(bytes);
		
  		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		
  		for (i=0; i<bytes; i+=3) {	
  			//get the 3 octects in 4 ascii chars
  			enc1 = this._keyStr.indexOf(input.charAt(j++));
  			enc2 = this._keyStr.indexOf(input.charAt(j++));
  			enc3 = this._keyStr.indexOf(input.charAt(j++));
  			enc4 = this._keyStr.indexOf(input.charAt(j++));
	
  			chr1 = (enc1 << 2) | (enc2 >> 4);
  			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
  			chr3 = ((enc3 & 3) << 6) | enc4;
	
  			uarray[i] = chr1;			
  			if (enc3 != 64) uarray[i+1] = chr2;
  			if (enc4 != 64) uarray[i+2] = chr3;
  		}
	
  		return uarray;	
  	}
  }
  
  var decodeBuffers = function( obj ) {
    //console.log('DECODING BUFFERS...', obj)
    var count = 0,
        font = SF[ obj.instrumentFileName ]
        
    if( typeof SF.instruments[ obj.instrumentFileName ] === 'undefined' ) {
      SF.instruments[ obj.instrumentFileName ] = {}
    }
    
    obj.buffers = SF.instruments[ obj.instrumentFileName ]
    
    for( var note in font ) {
      count++
      !function() {
        var _note = note
        
        var base = font[ _note ].split(",")[1]
        var arrayBuffer = Base64Binary.decodeArrayBuffer( base );
        
        Gibberish.context.decodeAudioData( arrayBuffer, function( _buffer ) {
          SF.instruments[ obj.instrumentFileName ][ _note ] = _buffer.getChannelData( 0 )
          count--
          if( count <= 0 ) { 
            console.log("Soundfont " + obj.instrumentFileName + " is loaded.")
            obj.isLoaded = true
            if( obj.onload ) obj.onload()
          }
        }, function(e) { console.log("ERROR", e.err, arguments, _note ) } )
        
      }()
    }
  }
  
  Gibberish.SoundFont = function( instrumentFileName, pathToResources ) {
    var that = this
    Gibberish.extend(this, {
      'instrumentFileName': instrumentFileName,
      name:'soundfont',
      properties: {
        amp:1,
        pan:0
      },
      playing:[],
      buffers:{},
      onload: null,
      out:[0,0],
      isLoaded: false,
      resourcePath: pathToResources || './resources/soundfonts/',
      
      callback: function( amp, pan ) {
        var val = 0
        for( var i = this.playing.length -1; i >= 0; i-- ) {
          var note = this.playing[ i ]
          
          val += this.interpolate( note.buffer, note.phase ) * note.velocity
          
          note.phase += note.increment
          if( note.phase > note.length ) {
            this.playing.splice( this.playing.indexOf( note ), 1 )
          }
        }
        
        return this.panner( val * amp, pan, this.out );
      }.bind( this ),
      
      note: function( name, velocity, cents ) {
        if( this.isLoaded ) {
          this.playing.push({
            buffer:this.buffers[ name ],
            phase:0,
            increment: isNaN( cents ) ? 1 : 1 + cents,
            length:this.buffers[ name ].length,
            velocity: isNaN( velocity ) ? 1 : velocity
          })
        }
      },
      interpolate: Gibberish.interpolate.bind( this ),
      panner: Gibberish.makePanner()
    })
    .init()
    .oscillatorInit()
    
    if( typeof arguments[0] === 'object' && arguments[0].instrumentFileName ) {
      this.instrumentFileName = arguments[0].instrumentFileName
    }
    
    // if already loaded, or if passed a buffer to use...
    var self = this
    if( !SF.instruments[ this.instrumentFileName ] && typeof this.resourcePath !== 'object' ) {
      console.log("Downloading soundfont: " + this.instrumentFileName )
      getScript( this.resourcePath + this.instrumentFileName + '-mp3.js', function() { decodeBuffers( self ) } ) //decodeBuffers.bind( null, this ) )
    }else{
      if( typeof pathToResources === 'object' ) {
        SF[ this.instrumentFileName ] = pathToResources
        decodeBuffers( this )
      }else{
        this.buffers = SF.instruments[ this.instrumentFileName ]
        this.isLoaded = true
        setTimeout( function() { if( this.onload ) this.onload() }.bind( this ), 0 )
      }
    }
    return this
  }
  Gibberish.SoundFont.storage = SF
  Gibberish.SoundFont.prototype = Gibberish._oscillator;
})()
  

Gibberish.Vocoder = function() {
  var encoders = [], decoders = [], amps = [], store = [], 
      abs = Math.abs, sqrt = Math.sqrt, phase = 0, output = [0,0],
      encoderObjects = [], decoderObjects = [], envelopeSize = 128,
      history = [],
      sums = [],
      env = [],
      index = 0,
      original_cutoffs = [
        330, 440, 554, 880, 1100, 1660, 2220, 3140
      ],
      cutoffs = [],
      startFreq = arguments[3] || 330,
      endFreq   = arguments[4] || 3200,
      numberOfBands = arguments[2] || 16,
      Q = arguments[5] || .15;
  
	this.name =	"vocoder";
  
	this.properties = {
    carrier:  arguments[0] || null,
    modulator:arguments[1] || null,
    amp:		  1,
	  pan:		  0
  }

  // filter band formula adapted from https://github.com/cwilso/Vocoder/blob/master/js/vocoder.js
	var totalRangeInCents = 1200 * Math.log( endFreq / startFreq ) / Math.LN2,
	    centsPerBand = totalRangeInCents / numberOfBands,
	    scale = Math.pow( 2, centsPerBand / 1200 ),  // This is the scaling for successive bands
	    currentFreq = startFreq;

	for(var i = 0; i < numberOfBands; i++) {
		encoderObjects[i] = new Gibberish.Biquad({ mode:'BP', Q:Q, cutoff:currentFreq });
    encoders[i] = encoderObjects[i].callback
		decoderObjects[i] = new Gibberish.Biquad({ mode:'BP', Q:Q, cutoff:currentFreq });
    decoders[i] = decoderObjects[i].callback    
		
    history[ i ] = [ 0 ]
    sums[ i ] = 0
    env[ i ] = 0
    
		currentFreq = currentFreq * scale;
	}
  
  //console.log( numberOfBands, startFreq, endFreq, Q )
  
  this.callback = function( carrier, modulator, amp, pan ) {
    var historyIndex = ( index + 1 ) % envelopeSize,
        modValue = typeof modulator !== 'number' ? modulator[0] + modulator[1] : modulator,
        carrierValue = typeof carrier !== 'number' ? carrier[0] + carrier[1] : carrier,
        encValue, out = 0
        
		for(var i = 0; i < numberOfBands; i++) {
      encValue = abs( encoders[ i ]( modValue ) )
      
      sums[ i ] += encValue
      sums[ i ] -= history[ i ][ index ]
      
      history[ i ][ index ] = encValue
      history[ i ][ historyIndex ] = history[ i ][ historyIndex ] ? history[ i ][ historyIndex ] : 0
      
      env[ i ] = sums[ i ] / envelopeSize
      
      out += decoders[i]( carrierValue ) * env[ i ];
		}
    index = historyIndex
	
    output[0] = output[1] = out * amp * 16; // look, ma... 16 IS MAGIC!!!

		return output;
	}
  
  this.getEncoders = function() { return encoderObjects }
  this.getDecoders = function() { return decoderObjects }  
  
  this.init();
  this.oscillatorInit();
	//this.processProperties(arguments);
}
Gibberish.Vocoder.prototype = Gibberish._synth
return Gibberish; 
})
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/external/freesound2.js":[function(require,module,exports){
(function () {

    var freesound = function () {        
        var authHeader = '';
        var clientId = '';
        var clientSecret = '';
        var host = 'freesound.org';

        var uris = {
            base : 'https://'+host+'/apiv2',
            textSearch : '/search/text/',
            contentSearch: '/search/content/',
            combinedSearch : '/sounds/search/combined/',
            sound : '/sounds/<sound_id>/',
            soundAnalysis : '/sounds/<sound_id>/analysis/',
            similarSounds : '/sounds/<sound_id>/similar/',
            comments : '/sounds/<sound_id>/comments/',
            download : '/sounds/<sound_id>/download/',
            upload : '/sounds/upload/',
            describe : '/sounds/<sound_id>/describe/',
            pending : '/sounds/pending_uploads/',
            bookmark : '/sounds/<sound_id>/bookmark/',
            rate : '/sounds/<sound_id>/rate/',
            comment : '/sounds/<sound_id>/comment/',
            authorize : '/oauth2/authorize/',
            logout : '/api-auth/logout/',
            logoutAuthorize : '/oauth2/logout_and_authorize/',
            me : '/me/',
            user : '/users/<username>/',
            userSounds : '/users/<username>/sounds/',
            userPacks : '/users/<username>/packs/',
            userBookmarkCategories : '/users/<username>/bookmark_categories/',
            userBookmarkCategorySounds : '/users/<username>/bookmark_categories/<category_id>/sounds/',
            pack : '/packs/<pack_id>/',
            packSounds : '/packs/<pack_id>/sounds/',
            packDownload : '/packs/<pack_id>/download/'            
        };
        
        var makeUri = function (uri, args){
            for (var a in args) {uri = uri.replace(/<[\w_]+>/, args[a]);}
            return uris.base+uri;
        };

        var makeRequest = function (uri, success, error, params, wrapper, method, data, content_type){
            if(method===undefined) method='GET';
            if(!error)error = function(e){console.log(e)};
            params = params || {};
            params['format'] = 'json';
            //params['api_key'] = '4287f0bacdcc492a8fae27fc3b228aaf';
            var fs = this;
            var parse_response = function (response){
                var data = eval("(" + response + ")");
                success(wrapper?wrapper(data):data);
            };                      
            var paramStr = "";
            for(var p in params){paramStr = paramStr+"&"+p+"="+params[p];}
            if (paramStr){
                uri = uri +"?"+ paramStr;
            }
            
            if (typeof module !== 'undefined'){ // node.js
                var http = require("http");
                var options = {
                    host: host,
                    path: uri.substring(uri.indexOf("/",8),uri.length), // first '/' after 'http://'
                    port: '443',
                    method: method,
                    headers: {'Authorization': authHeader},
                    withCredentials:false,
                };
                console.log( 'http options:', options )
                var req = http.request(options,function(res){
                    res.setEncoding('utf8');            
                    res.on('data', function (data){ 
                        if([200,201,202].indexOf(res.statusCode)>=0)
                            success(wrapper?wrapper(data):data);
                        else   
                            error(data);
                    });                    
                });                
                req.on('error', error).end();
            }
            else{ // browser
                var xhr;
                try {xhr = new XMLHttpRequest();}
                catch (e) {xhr = new ActiveXObject('Microsoft.XMLHTTP');}

                xhr.onreadystatechange = function(){
                    if (xhr.readyState === 4 && [200,201,202].indexOf(xhr.status)>=0){
                        var data = eval("(" + xhr.responseText + ")");
                        if(success) success(wrapper?wrapper(data):data);
                    }
                    else if (xhr.readyState === 4 && xhr.status !== 200){
                        if(error) error(xhr.statusText);
                    }
                };
                console.log( method, uri )
                xhr.open(method, uri);
                xhr.setRequestHeader('Authorization',authHeader);
                if(content_type!==undefined)
                    xhr.setRequestHeader('Content-Type',content_type);
                xhr.send(data);
            }
    };
    var checkOauth = function(){
        if(authHeader.indexOf("Bearer")==-1)
            throw("Oauth authentication required");
    };
        
    var makeFD = function(obj,fd){
        if(!fd)
            fd = new FormData(); 
        for (var prop in obj){
            fd.append(prop,obj[prop])
        }
        return fd;
    };
    
    var search = function(options, uri, success, error,wrapper){  
        if(options.analysis_file){ 
                makeRequest(makeUri(uri), success,error,null, wrapper, 'POST',makeFD(options));
        }
        else{
                makeRequest(makeUri(uri), success,error,options, wrapper);
        }    
    };
        
    var Collection = function (jsonObject){
        var nextOrPrev = function (which,success,error){
            makeRequest(which,success,error,{}, Collection);
        };        
        jsonObject.nextPage = function (success,error){
            nextOrPrev(jsonObject.next,success,error);
        };
        jsonObject.previousPage = function (success,error){
            nextOrPrev(jsonObject.previous,success,error);
        };
        jsonObject.getItem = function (idx){
            return jsonObject.results[idx];
        }
        
        return jsonObject;
    };  
        
    var SoundCollection = function(jsonObject){
        var collection = Collection(jsonObject);
        collection.getSound = function (idx){
            return new SoundObject(collection.results[idx]);
        };
        return collection;
    };
    
    var PackCollection = function(jsonObject){
        var collection = Collection(jsonObject);
        collection.getPack = function (idx){
            return new PackObject(collection.results[idx]);
        };   
        return collection;
    };
        
    var SoundObject = function (jsonObject){ 
        jsonObject.getAnalysis = function(filter, success, error, showAll){
            var params = {all: showAll?1:0};
            makeRequest(makeUri(uris.soundAnalysis,[jsonObject.id,filter?filter:""]),success,error);
        };

        jsonObject.getSimilar = function (success, error, params){
            makeRequest(makeUri(uris.similarSounds,[jsonObject.id]),success,error, params,SoundCollection);
        };
 
       jsonObject.getComments = function (success, error){
            makeRequest(makeUri(uris.comments,[jsonObject.id]),success,error,{},Collection);
       };

       jsonObject.download = function (targetWindow){// can be window, new, or iframe
            checkOauth();
            var uri = makeUri(uris.download,[jsonObject.id]);
            targetWindow.location = uri;
       };
       
	jsonObject.comment = function (commentStr, success, error){
            checkOauth();
            var data = new FormData();
            data.append('comment', comment);
            var uri = makeUri(uris.comment,[jsonObject.id]);
            makeRequest(uri, success, error, {}, null, 'POST', data);
        };

        jsonObject.rate = function (rating, success, error){
            checkOauth();
            var data = new FormData();
            data.append('rating', rating);
            var uri = makeUri(uris.rate,[jsonObject.id]);
            makeRequest(uri, success, error, {}, null, 'POST', data);
        };

        jsonObject.bookmark = function (name, category,success, error){
            checkOauth();
            var data = new FormData();
            data.append('name', name);
            if(category)
                data.append("category",category);
            var uri = makeUri(uris.bookmark,[jsonObject.id]);            
            makeRequest(uri, success, error, {}, null, 'POST', data);
        };
        
        jsonObject.edit = function (description,success, error){
            checkOauth();
            var data = makeFD(description);
            var uri = makeUri(uris.edit,[jsonObject.id]);
            makeRequest(uri, success, error, {}, null, 'POST', data);
        };        

        return jsonObject;
    };
    var UserObject = function(jsonObject){
        jsonObject.sounds = function (success, error, params){
            var uri = makeUri(uris.userSounds,[jsonObject.username]);
            makeRequest(uri, success, error,params,SoundCollection);            
        };

        jsonObject.packs = function (success, error){
            var uri = makeUri(uris.userPacks,[jsonObject.username]);
            makeRequest(uri, success, error,{},PackCollection);                    
        };

        jsonObject.bookmarkCategories = function (success, error){
            var uri = makeUri(uris.userBookmarkCategories,[jsonObject.username]);
            makeRequest(uri, success, error);                    
        };

        jsonObject.bookmarkCategorySounds = function (success, error,params){
            var uri = makeUri(uris.userBookmarkCategorySounds,[jsonObject.username]);
            makeRequest(uri, success, error,params);                    
        };

        return jsonObject;
    };
        
    var PackObject = function(jsonObject){
        jsonObject.sounds = function (success, error){
            var uri = makeUri(uris.packSounds,[jsonObject.id]);
            makeRequest(uri, success, error,{},SoundCollection);            
        };
        
        jsonObject.download = function (targetWindow){// can be current or new window, or iframe
            checkOauth();
            var uri = makeUri(uris.packDownload,[jsonObject.id]);
            targetWindow.location = uri;
        };                
        return jsonObject;
    };
                
    return {
            // authentication
            setToken: function (token, type) {
                authHeader = (type==='oauth' ? 'Bearer ':'Token ')+token;
            },
            setClientSecrets: function(id,secret){
                clientId = id;
                clientSecret = secret;
            },

            postAccessCode: function(code, success, error){
                var post_url = uris.base+"/oauth2/access_token/"
                var data = new FormData();
                data.append('client_id',clientId);
                data.append('client_secret',clientSecret);
                data.append('code',code);
                data.append('grant_type','authorization_code');
                                
                if (!success){
                    success = function(result){
                        setToken(result.access_token,'oauth');                        
                    }
                }
                makeRequest(post_url, success, error, {}, null, 'POST', data);
            },
            textSearch: function(query, options, success, error){                
                options = options || {};
                options.query = query ? query : " ";
                search(options,uris.textSearch,success,error,SoundCollection);
            },                    
            contentSearch: function(options, success, error){
                if(!(options.target || options.analysis_file))
                   throw("Missing target or analysis_file");
                search(options,uris.contentSearch,success,error,SoundCollection);
            },
            combinedSearch:function(options, success, error){
               if(!(options.target || options.analysis_file || options.query))
                   throw("Missing query, target or analysis_file");
                search(options,uris.contentSearch,success,error);
            },
            getSound: function(soundId,success, error){
                makeRequest(makeUri(uris.sound, [soundId]), success,error,{}, SoundObject);
            },

            upload: function(audiofile,filename, description, success,error){
                checkOauth();
                var fd = new FormData();
                fd.append('audiofile', audiofile,filename);                    
                if(description){                    
                    fd = makeFD(description,fd);
                }
                makeRequest(makeUri(uris.upload), success, error, {}, null, 'POST', fd);
            },
            describe: function(upload_filename , description, license, tags, success,error){
                checkOauth();                
                var fd = makeFD(description);
                makeRequest(makeUri(uris.upload), success, error, {}, null, 'POST', fd);
            },

            getPendingSounds: function(success,error){
                checkOauth();
                makeRequest(makeUri(uris.pending), success,error,{});
            },

            // user resources
            me: function(success,error){
                checkOauth();
                makeRequest(makeUri(uris.me), success,error);
            },

            getLoginURL: function(){
                    if(clientId===undefined) throw "client_id was not set"
                    var login_url = makeUri(uris.authorize);
                    login_url += "?client_id="+clientId+"&response_type=code";
                    return login_url;
            },
            getLogoutURL: function(){
                var logout_url = makeUri(uris.logoutAuthorize);
                logout_url += "?client_id="+clientId+"&response_type=code";
                
                return logout_url;
            },

            getUser: function(username, success,error){
                makeRequest(makeUri(uris.user, [username]), success,error,{}, UserObject);
            },
        
            getPack: function(packId,success,error){                
                makeRequest(makeUri(uris.pack, [packId]), success,error,{}, PackObject);            
            }        
        }    
    };

    // compatible with CommonJS (node), AMD (requireJS) failing back to browser global 
    // working with node requires web-audio-api module
    if (typeof module !== 'undefined') {module.exports = freesound(); }
    else if (typeof define === 'function' && typeof define.amd === 'object') { define("freesound", [], freesound); }
    else {this.freesound = freesound(); }
}());

},{"http":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/browserify/node_modules/http-browserify/index.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/external/teoria.min.js":[function(require,module,exports){
(function(){function t(t,e){return t=r[t],e=r[e],t.distance>e.distance?e.distance+12-t.distance:e.distance-t.distance}function e(t,e,i){for(;i>0;i--)t+=e;return t}function i(t,e){if("string"!=typeof t)return null;this.name=t,this.duration=e||4,this.accidental={value:0,sign:""};var i=t.match(/^([abcdefgh])(x|#|bb|b?)(-?\d*)/i);if(i&&t===i[0]&&0!==i[3].length)this.name=i[1].toLowerCase(),this.octave=parseFloat(i[3]),0!==i[2].length&&(this.accidental.sign=i[2].toLowerCase(),this.accidental.value=y[i[2]]);else{t=t.replace(/\u2032/g,"'").replace(/\u0375/g,",");var n=t.match(/^(,*)([abcdefgh])(x|#|bb|b?)([,\']*)$/i);if(!n||5!==n.length||t!==n[0])throw Error("Invalid note format");if(""===n[1]&&""===n[4])this.octave=n[2]===n[2].toLowerCase()?3:2;else if(""!==n[1]&&""===n[4]){if(n[2]===n[2].toLowerCase())throw Error("Invalid note format. Format must respect the Helmholtz notation.");this.octave=2-n[1].length}else{if(""!==n[1]||""===n[4])throw Error("Invalid note format");if(n[4].match(/^'+$/)){if(n[2]===n[2].toUpperCase())throw Error("Invalid note format. Format must respect the Helmholtz notation");this.octave=3+n[4].length}else{if(!n[4].match(/^,+$/))throw Error("Invalid characters after note name.");if(n[2]===n[2].toLowerCase())throw Error("Invalid note format. Format must respect the Helmholtz notation");this.octave=2-n[4].length}}this.name=n[2].toLowerCase(),0!==n[3].length&&(this.accidental.sign=n[3].toLowerCase(),this.accidental.value=y[n[3]])}}function n(t,e){if(!(t instanceof i))return null;e=e||"",this.name=t.name.toUpperCase()+t.accidental.sign+e,this.root=t,this.notes=[t],this.quality="major",this.type="major";var n,r,o,s,h,m=[],u=!1,c="quality",d=!1,p=!1,v=null;for(s=0,h=e.length;h>s;s++){for(n=e[s];" "===n||"("===n||")"===n;)n=e[++s];if(!n)break;if(r=n.charCodeAt(0),o=h>=s+3?e.substr(s,3):"","quality"===c)"M"===n||("maj"===o||916===r?(this.type="major",m.push("M7"),u=!0,(e[s+3]&&"7"===e[s+3]||916===r&&"7"===e[s+1])&&s++):"m"===n||"-"===n||"min"===o?this.quality=this.type="minor":111===r||176===r||"dim"===o?(this.quality="minor",this.type="diminished"):"+"===n||"aug"===o?(this.quality="major",this.type="augmented"):216===r||248===r?(this.quality="minor",this.type="diminished",m.push("m7"),u=!0):"sus"===o?(this.quality="sus",this.type=e[s+3]&&"2"===e[s+3]?"sus2":"sus4"):"5"===n?(this.quality="power",this.type="power"):s-=1),o in l&&(s+=2),c="";else if("#"===n)d=!0;else if("b"===n)p=!0;else if("5"===n)d?(v="A5","major"===this.quality&&(this.type="augmented")):p&&(v="d5","minor"===this.quality&&(this.type="diminished")),p=d=!1;else if("6"===n)m.push("M6"),p=d=!1;else if("7"===n)"diminished"===this.type?m.push("d7"):m.push("m7"),u=!0,p=d=!1;else if("9"===n)u||m.push("m7"),p?m.push("m9"):d?m.push("A9"):m.push("M9"),p=d=!1;else{if("1"!==n)throw Error("Unexpected character: '"+n+"' in chord name");n=e[++s],"1"===n?p?m.push("d11"):d?m.push("A11"):m.push("P11"):"3"===n&&(p?m.push("m13"):d?m.push("A13"):m.push("M13")),p=d=!1}}for(var y=0,g=f[this.type].length;g>y;y++)"5"===f[this.type][y][1]&&v?this.notes.push(a.interval(this.root,v)):this.notes.push(a.interval(this.root,f[this.type][y]));for(y=0,g=m.length;g>y;y++)this.notes.push(a.interval(this.root,m[y]))}var a={},r={c:{name:"c",distance:0,index:0},d:{name:"d",distance:2,index:1},e:{name:"e",distance:4,index:2},f:{name:"f",distance:5,index:3},g:{name:"g",distance:7,index:4},a:{name:"a",distance:9,index:5},b:{name:"b",distance:11,index:6},h:{name:"h",distance:11,index:6}},o=["c","d","e","f","g","a","b"],s={.25:"longa",.5:"breve",1:"whole",2:"half",4:"quarter",8:"eighth",16:"sixteenth",32:"thirty-second",64:"sixty-fourth",128:"hundred-twenty-eighth"},h=[{name:"unison",quality:"perfect",size:0},{name:"second",quality:"minor",size:1},{name:"third",quality:"minor",size:3},{name:"fourth",quality:"perfect",size:5},{name:"fifth",quality:"perfect",size:7},{name:"sixth",quality:"minor",size:8},{name:"seventh",quality:"minor",size:10},{name:"octave",quality:"perfect",size:12},{name:"ninth",quality:"minor",size:13},{name:"tenth",quality:"minor",size:15},{name:"eleventh",quality:"perfect",size:17},{name:"twelfth",quality:"perfect",size:19},{name:"thirteenth",quality:"minor",size:20},{name:"fourteenth",quality:"minor",size:22},{name:"fifteenth",quality:"perfect",size:24}],m={unison:0,second:1,third:2,fourth:3,fifth:4,sixth:5,seventh:6,octave:7,ninth:8,tenth:9,eleventh:10,twelfth:11,thirteenth:12,fourteenth:13,fifteenth:14},l={P:"perfect",M:"major",m:"minor",A:"augmented",d:"diminished",perf:"perfect",maj:"major",min:"minor",aug:"augmented",dim:"diminished"},u={perfect:"P",major:"M",minor:"m",augmented:"A",diminished:"d"},c={P:"P",M:"m",m:"M",A:"d",d:"A"},d={perfect:["diminished","perfect","augmented"],minor:["diminished","minor","major","augmented"]},f={major:["M3","P5"],minor:["m3","P5"],augmented:["M3","A5"],diminished:["m3","d5"],sus2:["M2","P5"],sus4:["P4","P5"],power:["P5"]},p={major:"M",minor:"m",augmented:"aug",diminished:"dim",power:"5"},v={"-2":"bb","-1":"b",0:"",1:"#",2:"x"},y={bb:-2,b:-1,"#":1,x:2};i.prototype={key:function(t){return t?7*(this.octave-1)+3+Math.ceil(r[this.name].distance/2):12*(this.octave-1)+4+r[this.name].distance+this.accidental.value},fq:function(t){return t=t||440,t*Math.pow(2,(this.key()-49)/12)},scale:function(t,e){return a.scale.list(this,t,e)},interval:function(t,e){return a.interval(this,t,e)},chord:function(t){return t=t||"major",t in p&&(t=p[t]),new n(this,t)},helmholtz:function(){var t,i=3>this.octave?this.name.toUpperCase():this.name.toLowerCase();return 2>=this.octave?(t=e("",",",2-this.octave),t+i+this.accidental.sign):(t=e("","'",this.octave-3),i+this.accidental.sign+t)},scientific:function(){return this.name.toUpperCase()+this.accidental.sign+("number"==typeof this.octave?this.octave:"")},enharmonics:function(){var t=[],e=this.key(),i=this.interval("m2","up"),n=this.interval("m2","down"),a=i.key()-i.accidental.value,r=n.key()-n.accidental.value,o=e-a;return 3>o&&o>-3&&(i.accidental={value:o,sign:v[o]},t.push(i)),o=e-r,3>o&&o>-3&&(n.accidental={value:o,sign:v[o]},t.push(n)),t},valueName:function(){return s[this.duration]},toString:function(t){return t="boolean"==typeof t?t:"number"==typeof this.octave?!1:!0,this.name.toLowerCase()+this.accidental.sign+(t?"":this.octave)}},n.prototype.dominant=function(t){return t=t||"",new n(this.root.interval("P5"),t)},n.prototype.subdominant=function(t){return t=t||"",new n(this.root.interval("P4"),t)},n.prototype.parallel=function(t){if(t=t||"","triad"!==this.chordType()||"diminished"===this.quality||"augmented"===this.quality)throw Error("Only major/minor triads have parallel chords");return"major"===this.quality?new n(this.root.interval("m3","down"),"m"):new n(this.root.interval("m3","up"))},n.prototype.chordType=function(){var t,e,i;if(2===this.notes.length)return"dyad";if(3===this.notes.length){e={unison:!1,third:!1,fifth:!1};for(var n=0,r=this.notes.length;r>n;n++)t=this.root.interval(this.notes[n]),i=h[parseFloat(a.interval.invert(t.simple)[1])-1],t.name in e?e[t.name]=!0:i.name in e&&(e[i.name]=!0);return e.unison&&e.third&&e.fifth?"triad":"trichord"}if(4===this.notes.length){e={unison:!1,third:!1,fifth:!1,seventh:!1};for(var n=0,r=this.notes.length;r>n;n++)t=this.root.interval(this.notes[n]),i=h[parseFloat(a.interval.invert(t.simple)[1])-1],t.name in e?e[t.name]=!0:i.name in e&&(e[i.name]=!0);if(e.unison&&e.third&&e.fifth&&e.seventh)return"tetrad"}return"unknown"},n.prototype.toString=function(){return this.name},a.note=function(t,e){return new i(t,e)},a.note.fromKey=function(t){var e=440*Math.pow(2,(t-49)/12);return a.frequency.note(e).note},a.chord=function(t){var e;if(e=t.match(/^([abcdefgh])(x|#|bb|b?)/i),e&&e[0])return new n(new i(e[0].toLowerCase()),t.substr(e[0].length));throw Error("Invalid Chord. Couldn't find note name")},a.frequency={note:function(t,e){e=e||440;var n,a,s,h,m,l,u;return n=Math.round(49+12*((Math.log(t)-Math.log(e))/Math.log(2))),u=e*Math.pow(2,(n-49)/12),l=1200*(Math.log(t/u)/Math.log(2)),a=Math.floor((n-4)/12),s=n-12*a-4,h=r[o[Math.round(s/2)]],m=h.name,s>h.distance?m+="#":h.distance>s&&(m+="b"),{note:new i(m+(a+1)),cents:l}}},a.interval=function(t,e,n){if("string"==typeof e){"down"===n&&(e=a.interval.invert(e));var r=l[e[0]],o=parseFloat(e.substr(1));if(!r||isNaN(o)||1>o)throw Error("Invalid string-interval format");return a.interval.from(t,{quality:r,interval:h[o-1].name},n)}if(e instanceof i&&t instanceof i)return a.interval.between(t,e);throw Error("Invalid parameters")},a.interval.from=function(e,n,a){n.direction=a||n.direction||"up";var s,l,u,c,f,p;if(f=m[n.interval],p=h[f],f>7&&(f-=7),f=r[e.name].index+f,f>o.length-1&&(f-=o.length),s=o[f],-1===d[p.quality].indexOf(n.quality)||-1===d[p.quality].indexOf(p.quality))throw Error("Invalid interval quality");return l=d[p.quality].indexOf(n.quality)-d[p.quality].indexOf(p.quality),u=p.size+l-t(e.name,s),e.octave&&(c=Math.floor((e.key()-e.accidental.value+t(e.name,s)-4)/12)+1+Math.floor(m[n.interval]/7)),u+=e.accidental.value,u>=11&&(u-=12),u>-3&&3>u&&(s+=v[u]),"down"===a&&c--,new i(s+(c||""))},a.interval.between=function(t,e){var i,n,a,o,s,m,l=t.key(),c=e.key();if(i=c-l,i>24||-25>i)throw Error("Too big interval. Highest interval is a augmented fifteenth (25 semitones)");return 0>i&&(o=t,t=e,e=o),a=r[e.name].index-r[t.name].index+7*(e.octave-t.octave),n=h[a],m=d[n.quality][Math.abs(i)-n.size+1],s=u[m]+(""+Number(a+1)),{name:n.name,quality:m,direction:i>0?"up":"down",simple:s}},a.interval.invert=function(t){if(2!==t.length&&3!==t.length)return!1;var e=c[t[0]],i=2===t.length?parseFloat(t[1]):parseFloat(t.substr(1));return i>8&&(i-=7),8!==i&&1!==i&&(i=9-i),e+(""+i)},a.scale={list:function(t,e,n){var r,o,s=[],h=[];if(!(t instanceof i))return!1;if("string"==typeof e&&(e=a.scale.scales[e],!e))return!1;for(s.push(t),n&&h.push(t.name+(t.accidental.sign||"")),r=0,o=e.length;o>r;r++)s.push(a.interval(t,e[r])),n&&h.push(s[r+1].name+(s[r+1].accidental.sign||""));return n?h:s},scales:{major:["M2","M3","P4","P5","M6","M7"],ionian:["M2","M3","P4","P5","M6","M7"],dorian:["M2","m3","P4","P5","M6","m7"],phrygian:["m2","m3","P4","P5","m6","m7"],lydian:["M2","M3","A4","P5","M6","M7"],mixolydian:["M2","M3","P4","P5","M6","m7"],minor:["M2","m3","P4","P5","m6","m7"],aeolian:["M2","m3","P4","P5","m6","m7"],locrian:["m2","m3","P4","d5","m6","m7"],majorpentatonic:["M2","M3","P5","M6"],minorpentatonic:["m3","P4","P5","m7"],chromatic:["m2","M2","m3","M3","P4","A4","P5","m6","M6","m7","M7"],harmonicchromatic:["m2","M2","m3","M3","P4","A4","P5","m6","M6","m7","M7"]}},module.exports=a})();
},{}],"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio.js":[function(require,module,exports){
module.exports = function( Gibber ) {
  
"use strict"

var times = [],
    $ = Gibber.dollar,
    Gibberish = require( 'gibberish-dsp' ),
    Audio

Audio = {
  initialized: false, // only run clear function if initialized
  // can't name export as Gibberish has the same nameAudio
  export: function( target ) {
    $.extend( target, Audio.Busses )       
    $.extend( target, Audio.Oscillators )
    $.extend( target, Audio.Synths )
    $.extend( target, Audio.Percussion )
    $.extend( target, Audio.Envelopes )
    $.extend( target, Audio.FX )
    $.extend( target, Audio.Seqs )    
    $.extend( target, Audio.Samplers )
    
    var __clear__ = target.clear
    $.extend( target, Audio.PostProcessing )
    target.clear = __clear__

    $.extend( target, Audio.Vocoder )
    
    target.Theory = Audio.Theory
    $.extend( target, Audio.Analysis ) 
    
    // target.future = Gibber.Utilities.future
    // target.solo = Gibber.Utilities.solo    
    target.Score = Audio.Score
		target.Clock = Audio.Clock
    target.Seq = Audio.Seqs.Seq
    target.Arp = Audio.Arp // move Arp to sequencers?
    target.ScaleSeq = Audio.Seqs.ScaleSeq
    target.SoundFont = Audio.SoundFont
    target.Speak = Audio.Speak
    target.Additive = Audio.Additive
    target.Ugen = Audio.Ugen
    
    target.Rndi = Audio.Core.Rndi
    target.Rndf = Audio.Core.Rndf     
    target.rndi = Audio.Core.rndi
    target.rndf = Audio.Core.rndf
    
    target.Input = Audio.Input
    
    target.Freesound = Audio.Freesound
    target.Freesoundjs2 = Audio.Freesoundjs2
    
    target.Scale = Audio.Theory.Scale
    
    target.Ensemble = Audio.Ensemble

		target.module = Gibber.import
    // target.ms = Audio.Time.ms
    // target.seconds = target.sec = Audio.Time.seconds
    // target.minutes = target.min = Audio.Time.minutes
    Audio.Core.Time.export( target )
    Audio.Clock.export( target )
    //target.sec = target.seconds
    Audio.Core.Binops.export( target )
    
    target.Master = Audio.Master    
  },
  init: function( callback ) {
    $ = Gibber.dollar
    // post-processing depends on having context instantiated
    var __onstart = null
    if( Audio.onstart ) __onstart = Audio.onstart
    
    if( !Audio.context ) { Audio.context = { sampleRate:44100 } }
    
    Audio.Core.onstart = function() {
      Audio.Clock.start( true )


      if( __onstart !== null ) { __onstart() }
      
      Audio.Score = Audio.Score( Gibber )
      Audio.Additive = Audio.Additive( Gibber )
      Gibber.Clock = Audio.Clock
            
      Gibber.Theory = Audio.Theory
      
      Gibber.Theory.scale = Gibber.scale = Gibber.Audio.Theory.Scale( 'c4','Minor' )
      
      $.extend( Gibber.Binops, Audio.Binops )
      
      Audio.Master = Audio.Busses.Bus().connect( Audio.Core.out )

      Audio.Master.type = 'Bus'
      Audio.Master.name = 'Master'

      $.extend( true, Audio.Master, Audio.ugenTemplate ) 
      Audio.Master.fx.ugen = Audio.Master
      
      Audio.ugenTemplate.connect = 
        Audio.Core._oscillator.connect =
        Audio.Core._synth.connect =
        Audio.Core._effect.connect =
        Audio.Core._bus.connect =
        Audio.connect;
        
      Audio.Core.defineUgenProperty = Audio.defineUgenProperty
      
      Object.assign( Gibber.Presets, Audio.Synths.Presets )
      Object.assign( Gibber.Presets, Audio.Percussion.Presets )
      Object.assign( Gibber.Presets, Audio.FX.Presets )


      $.publish( 'audio.init', Audio )
      if( typeof callback === 'function' ) callback()

      Audio.initialized = true
    }
    
    
    Audio.Core._init()
    //$.extend( Audio, Audio.Core )
  },
  
  Time : {
    ms: function( num ) {
      return {
        mode: 'absolute',
        value: (Gibber.Audio.Core.context.sampleRate / 1000) * num,
        valueOf: function() { return this.value }
      }
    },
    seconds: function( num ) {
      return {
        mode: 'absolute',
        value: Gibber.Audio.Core.context.sampleRate * num,
        valueOf: function() { return this.value }
      }
    },
    minutes: function( num ) {
      return {
        mode: 'absolute',
        value: Gibber.Audio.Core.context.sampleRate * 60 * num,
        valueOf: function() { return this.value }
      }
    }
  },
  // override for Gibber.Audio.Core method
  defineUgenProperty : function(key, initValue, obj) {
    var isTimeProp = Audio.Clock.timeProperties.indexOf( key ) > -1,
        prop = obj.properties[ key ] = {
          value:  isTimeProp ? Audio.Clock.time( initValue ) : initValue,
          binops: [],
          parent : obj,
          name : key,
        },
        mappingName = key.charAt(0).toUpperCase() + key.slice(1);
    
    Object.defineProperty(obj, key, {
      configurable: true,
      get: function() { return prop.value },
      set: function(val) { 
        if( obj[ mappingName ] && obj[ mappingName ].mapping ) {
          if( obj[ mappingName ].mapping.remove )
            obj[ mappingName ].mapping.remove( true ) // pass true to avoid setting property inside of remove method
        }
        
        // if( isTimeProp ) {
        //   if( typeof val === 'object' && val.mode ==='absolute' ) { // ms, seconds
        //     prop.value = val.value
        //   }else{
        //     prop.value = Audio.Core.Binops.Mul( Audio.Clock.time( val ), Audio.Core.Binops.Div( 1, Audio.Clock.rate ) ) 
        //   }
        // }else{
        //   prop.value = val
        // }
        // 
        prop.value = isTimeProp ? Audio.Clock.time( val ) : val
        
        Audio.Core.dirty( obj )
        
        return prop.value
      },
    });

    obj[key] = prop.value
  },
  
  // override for Gibber.Audio method
  polyInit : function(ugen) {
    ugen.mod = ugen.polyMod;
    ugen.removeMod = ugen.removePolyMod;
    
    for( var key in ugen.polyProperties ) {
      (function( _key ) {
        var value = ugen.polyProperties[ _key ],
            isTimeProp = Audio.Clock.timeProperties.indexOf( _key ) > -1

        Object.defineProperty(ugen, _key, {
          get : function() { return value; },
          set : function( val ) { 
            for( var i = 0; i < ugen.children.length; i++ ) {
              ugen.children[ i ][ _key ] = isTimeProp ? Audio.Clock.time( val ) : val;
            }
          },
        });
        
      })( key );
    }
  },
  // override for Gibber.Audio method to use master bus
  connect : function( bus, position ) {
    if( typeof bus === 'undefined' ) bus = Audio.Master
    
    if( this.destinations.indexOf( bus ) === -1 ){
      bus.addConnection( this, 1, position )
      if( position !== 0 ) {
        this.destinations.push( bus )
      }
    }
    
    return this
  },
  clear: function() {
    if( Audio.initialized === false ) return
    // Audio.analysisUgens.length = 0
    // Audio.sequencers.length = 0
    var args = Array.prototype.slice.call( arguments, 0 ),
      scaleSeqIsConnected = false
   
    if( Gibber.Theory.scale !== undefined ) {
      scaleSeqIsConnected = Gibber.Theory.scale.seq.isConnected
    }
    
    
    for( var i = 0; i < Audio.Master.inputs.length; i++ ) {
      if( args.indexOf( Audio.Master.inputs[ i ].value) === -1 ) {
        Audio.Master.inputs[ i ].value.disconnect()
      }
    }
  
    Audio.Master.inputs.length = arguments.length
    
    if( Audio.Clock.shouldResetOnClear !== false ) {
      Audio.Clock.reset()
    }
  
    Audio.Master.fx.remove()
  
    Audio.Master.amp = 1
    
    Audio.Core.clear()
    
    Audio.Clock.seq.connect()
    
    if( scaleSeqIsConnected  ) {
      Gibber.Theory.scale = Gibber.scale = Gibber.Audio.Theory.Scale( 'c4','Minor' )
    }
    
    Audio.Core.out.addConnection( Audio.Master, 1 );
    Audio.Master.destinations.push( Audio.Core.out );
  
    console.log( 'Audio stopped.')
  },
  ugenTemplate: {
    sequencers : [],
    mappings: [],
    fx: $.extend( [], {
      add: function() {
        var end = this.length === 0 ? this.ugen : this[ this.length - 1 ]
        end.disconnect()
        for( var i = 0; i < arguments.length; i++ ) {
          var fx = arguments[ i ]
          fx.input = end
          
          end = fx
          
          this.push( fx )
        }
        if( this.ugen !== Audio.Master ) {
          end.connect()
        }else{
          end.connect( Audio.Core.out )
        }
        return this.ugen
      },
      
      remove: function() {
        if( arguments.length > 0 ) {
          for( var i = 0; i < arguments.length; i++ ) {
            var arg = arguments[ i ];
						
						if( typeof arg === 'string' ) { // if identified using the fx name
							for( var j = 0; j < this.length; j++ ) {
								if( this[ j ].name === arg ) {
									this.remove( j )
								}
							}
							continue;
						}else if( typeof arg === 'object' ) {
							for( var j = 0; j < this.length; j++ ) {
								if( this[ j ] === arg ) {
									this.remove( j )
								}
							}
							continue;
						}
						
            if( typeof arg === 'number' ) { // if identified via position in fx chain
							var ugenToRemove = this[ arg ]
							ugenToRemove.disconnect()
              this.splice( arg, 1 )
							
              if( typeof this[ arg ] !== 'undefined') {
								
								// reset input for current position in chain
								var newConnectionNumber = arg - 1
								if( newConnectionNumber !== -1 ) {
									this[ arg ].input = this[ newConnectionNumber ]
								}else{
									this[ arg ].input = this.ugen
								}
								
								// reset input for next position in chain, or connect to Master bus
                if( typeof this[ arg + 1 ] !== 'undefined' ) { // if there is another fx ahead in chain...
                  this[ arg + 1 ].input = arg === 0 ? this.ugen : this[ arg ]
                }else{
                  if( this.ugen !== Audio.Master ) {
                    this.ugen.connect( Audio.Master )
                  }else{
                    this.ugen.connect( Audio.Core.out )
                  }
                }
              }else{
                if( this.length > 0 ) { // if there is an fx behind in chain
                  this[ arg - 1 ].connect( Audio.Master )
                }else{
                  if( this.ugen !== Audio.Master ) {
                    this.ugen.connect( Audio.Master ) // no more fx
                  }else{
                    this.ugen.connect( Audio.Core.out )
                  }
                }
              }
            }
          }
        }else{ // remove all fx
          if( this.length > 0) {
            this[ this.length - 1 ].disconnect()
            if( this.ugen !== Audio.Master ) {
              this.ugen.connect( Audio.Master )
            }else{
              this.ugen.connect( Audio.Core.out )
            }
            this.ugen.codegen()
            this.length = 0
          }else{
            console.log( this.ugen.name + ' does not have any fx to remove. ')
          }
        }
      },
    }),
      
    replaceWith: function( replacement ) {
      if( replacement.connect ) {
        for( var i = 0; i < this.destinations.length; i++ ) {
          replacement.connect( this.destinations[i] )
        }
      
        for( var i = 0; i < this.sequencers.length; i++ ) {
          this.sequencers[ i ].target = replacement
          replacement.sequencers.push( this.sequencers[i] )
        }
      
        for( var i = 0; i < this.mappingObjects.length; i++ ) {
          var mapping = this.mappingObjects[ i ]
        
          if( mapping.targets.length > 0 ) {
            for( var j = 0; j < mapping.targets.length; j++ ) {
              var _mapping = mapping.targets[ j ]
            
              if( replacement.mappingProperties[ mapping.name ] ) {
                _mapping[ 0 ].mapping.replace( replacement, mapping.name, mapping.Name )
              }else{ // replacement object does not have property that was assigned to mapping
                _mapping[ 0 ].mapping.remove()
              }
            }
          }
        }
      }
  
      this.kill()
    },

    kill: function() { 
      var end = this.fx.length !== 0 ? this.fx[ this.fx.length - 1 ] : this
      if( this.seq.isRunning ) this.seq.disconnect()
      end.disconnect()
      
      for( var i = 0; i < this.fx.length; i++ ) {
        var fx = this.fx[ i ]
        if( fx.seq.isRunning ) fx.seq.disconnect()
      }
      
      this.disconnect()
      
      for( var i = 0; i < this.mappings.length; i++ ) {
        this.mappings[ i ].remove() 
      }
      
      if( this.clearMarks ) // check required for modulators
        this.clearMarks()
      
      console.log( this.name + " has been terminated.")
    },

    play: function( notes, durations, repeat ) {
      if( this.note ) {
        this.note.seq( notes, durations )
      }else if( this.frequency ) {
        this.frequency.seq( notes, durations )
      }
      
      return this
    },

    // stop : function() {
    //   if( this.seq ) this.seq.stop()
    // },
    // start : function() {
    //   if( this.seq ) this.seq.start()
    // },
    
    fadeIn : function( _time, endLevel ) {
      if( isNaN( endLevel ) ) {
        endLevel = 1
      }

      var time = Audio.Clock.time( _time ),
          decay = new Audio.Core.ExponentialDecay({ decayCoefficient:.05, length:time }),
          //ramp = Mul( Sub(1,decay), endLevel )
          line = new Audio.Core.Line( 0, endLevel, time )
          
      this.amp = line
      
      future( function() { this.amp = endLevel }.bind( this ), time)
      
      return this
    },
    
    fadeOut : function( _time ) {
      var time = Audio.Clock.time( _time ),
          curve = Gibber.Audio.Envelopes.Curve( 0, 1, time, .05, .95, false )
          
      this.amp = Audio.Core.Binops.Mul( this.amp.oldGetter(), curve )
      
      future( function() { this.amp = 0 }.bind( this ), time )
      
      return this
    },
    fadeOut2 : function( _time ) {
      var time = Audio.Clock.time( _time ),
          curve = Gibber.Audio.Envelopes.Curve( 0, 1, time, .05, .95, false )
          
      this.amp = Audio.Core.Binops.Mul( this.amp.oldGetter(), curve )
      
      future( function() { 
        this.amp = 0
        this.kill()
      }.bind( this ), time )
      
      return this
    },
  }
}

Audio.Core = require( 'gibberish-dsp' )
Audio.Core._init = Audio.Core.init.bind( Audio.Core )
delete Audio.Core.init

Audio.Clock =          require( './audio/clock' )( Gibber )
Audio.Freesoundjs2 =   require( '../external/freesound2' )
Audio.Freesound =      require( './audio/gibber_freesound2' )( Audio.Freesoundjs2 )
Audio.Seqs =           require( './audio/seq')( Gibber )
Audio.Theory =         require( './audio/theory' )( Gibber )
Audio.FX =             require( './audio/fx' )( Gibber )
Audio.Oscillators =    require( './audio/oscillators' )( Gibber )
Audio.Synths =         require( './audio/synths' )( Gibber )
Audio.Busses =         require( './audio/bus' )( Gibber )
Audio.Analysis =       require( './audio/analysis' )( Gibber )
Audio.Envelopes =      require( './audio/envelopes' )( Gibber )
Audio.Percussion =     require( './audio/drums' )( Gibber )
Audio.Input =          require( './audio/audio_input' )( Gibber )
Audio.Samplers =       require( './audio/sampler' )( Gibber )
// Audio.Speak =          require( './audio/speak' )( Gibber )
Audio.Vocoder =        require( './audio/vocoder' )( Gibber )
Audio.PostProcessing = require( './audio/postprocessing' )( Gibber )
Audio.Arp =            require( './audio/arp' )( Gibber )
Audio.SoundFont =      require( './audio/soundfont' )( Gibber )
Audio.Score =          require( './audio/score' )
Audio.Ensemble =       require( './audio/ensemble' )( Gibber )
Audio.Ugen =           require( './audio/ugen')( Gibber )
Audio.Additive =       require( './audio/additive' )

return Audio

}

},{"../external/freesound2":"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/external/freesound2.js","./audio/additive":"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/additive.js","./audio/analysis":"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/analysis.js","./audio/arp":"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/arp.js","./audio/audio_input":"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/audio_input.js","./audio/bus":"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/bus.js","./audio/clock":"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/clock.js","./audio/drums":"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/drums.js","./audio/ensemble":"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/ensemble.js","./audio/envelopes":"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/envelopes.js","./audio/fx":"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/fx.js","./audio/gibber_freesound2":"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/gibber_freesound2.js","./audio/oscillators":"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/oscillators.js","./audio/postprocessing":"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/postprocessing.js","./audio/sampler":"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/sampler.js","./audio/score":"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/score.js","./audio/seq":"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/seq.js","./audio/soundfont":"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/soundfont.js","./audio/synths":"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/synths.js","./audio/theory":"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/theory.js","./audio/ugen":"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/ugen.js","./audio/vocoder":"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/vocoder.js","gibberish-dsp":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/gibberish-dsp/build/gibberish.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/additive.js":[function(require,module,exports){
module.exports = function( Gibber ) {

/*
XXX = Ugen({
  name:'Vox',
  inputs:{ 
    frequency:{ min:50, max:3000, default:440 },
    amp: { min:0, max:1, default:.1 }
  },
  callback: function( frequency, amp ) {
    this.out = this.sin( this.PI2 * (this.phase++ * frequency / 44100) ) * amp
    
    // if stereo, make this.out an array an fill appropriately
    // do not create a new array for every sample
    return this.out
  },
  init: function() {
    this.sin = Math.sin
    this.PI2 = Math.PI * 2
    this.phase = 0
    this.out =  0
  }
})
*/
    var Additive = Gibber.Audio.Ugen({
      name:'additive',
      inputs: {
        frequency:{ min:50, max:3000, default:440 },
        amp: { min:0, max:1, default:.5 }
        //pan: { min:0, max:1, default:-1 }
      },
      callback: function( frequency, amp, pan ) {
        var sines = this.sines, sine, harmonics = this.harmonics
        
        this.out = 0
        
        for( var i = 0, l = sines.length; i < l; i++  ) {
          sine = sines[ i ]
          this.out += sine( frequency * sine.harmonic, sine.amp )
          // if ( phase++ % 88200 === 0 ) console.log( frequency, sine.amp, this.out )
        }
      
        return this.out * amp
      },
      init: function() {
        this.sines = []
        //this.frequency = 440
        //if( typeof this.harmonics === 'undefined' ) this.harmonics = [1,1]
        
        for( var i = 0, j = 0; i < this.harmonics.length / 2; i++, j+=2 ) {
          var harmonicIndex = i * 2
          this.sines[ i ] = Gibber.Audio.Oscillators.Sine(440,1)._.callback
          this.sines[ i ].harmonic = this.harmonics[ j ]
          this.sines[ i ].amp = this.harmonics[ j + 1 ]
        }
        
        this.out = 0
        console.log( this.sines )
      }
    })
  
  //  return Additive
    //}
  
  return Additive
}

/*Sine = Ugen({
  name:'Vox',
  inputs:{ 
    frequency:{ min:50, max:3000, default:440 },
    amp: { min:0, max:1, default:.1 }
  },
  callback: function( frequency, amp ) {
    this.out = this.sin( this.PI2 * (this.phase++ * frequency / 44100) ) * amp
    return this.out
  },
  init: function() {
    this.sin = Math.sin
    this.PI2 = Math.PI * 2
    this.phase = 0
    this.out =  0
  }
})

Sine.connect()
Sine.frequency.seq( [440,880], 1/2 )
*/
},{}],"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/analysis.js":[function(require,module,exports){
module.exports = function( Gibber ) {
  "use strict"
  
  var fft,
      mappingProperties = { 
        value:{ min: 0, max: 255, output: LOGARITHMIC, wrap:false, timescale: 'graphics' } 
      },
      Gibberish = require( 'gibberish-dsp' ),
      $ = Gibber.dollar,
      curves = Gibber.outputCurves,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC
  
  var Analysis = {
    FFT : function( fftSize, updateRate ) {
      if( typeof fft === 'undefined' ) {      
        fft = Gibberish.context.createAnalyser()
        Gibberish.node.connect( fft )
        fft.fftSize = fftSize || 32
        fft.updateRate = updateRate || 40
        
        fft.values = new Uint8Array( fft.frequencyBinCount )
        fft.children = []
                
        for( var i = 0; i < fft.frequencyBinCount; i++ ) {          
          !function() { 
            var num = i,
                child = {},
                _value = 0
  
            Object.defineProperties( child, {
              value: {
                configurable:true,
                get: function() { return _value },
                set: function(v) { _value = v }
              }
            })
            
            Gibber.createProxyProperties( child, $.extend( {}, mappingProperties) , false )
            fft[ num ] = child
            fft.children.push( child )
            
            child.type = 'mapping'
            child.index = num
            child.min = 0; child.max = 255; // needed to map directly to children
            
            child.valueOf = function() { return this.value.value }
          }()
        }
        
        fft.low = { _value:0 }; fft.mid = { _value:0 }; fft.high = { _value:0 }

        var ranges = ['low','mid','high']

        ranges.forEach( function( v ) { 
          fft[ v ]._value = 0 

          Object.defineProperty( fft[ v ], 'value', {
            configurable:true,
            get: function() { return fft[ v ]._value },
            set: function(val) { fft[ v ]._value = val }
          })

          Gibber.createProxyProperties( fft[ v ], $.extend( {}, mappingProperties) , false )
            
          fft[ v ].type = 'mapping'
          fft[ v ].min = 0; fft[ v ].max = 255; // needed to map directly to children
            
          fft[ v ].valueOf = function() { return fft[ v ].value }
        })

        
        setInterval( function(){
          fft.getByteFrequencyData( fft.values );
          var lowSum = 0, midSum = 0, highSum = 0, lowCount = 0, midCount = 0, highCount = 0;

          // XXX ONLY WORKS FOR DEFAULT FFT WINDOW (32)
          for( var i = 0, len = fft.values.length; i < len; i++ ) {
            fft[ i ].value = fft.values[ i ]
            if( i > 0 ) {
              if( i < 3 ) {
                lowSum += fft.values[ i ]
                lowCount++
              }else if( i < 6 ) {
                midSum += fft.values[ i ]
                midCount++
              }else{
                highSum += fft.values[ i ]
                highCount++
              }
            }
          }

          fft.low.value = lowSum / lowCount
          fft.mid.value = midSum / midCount
          fft.high.value = highSum / highCount

        }, fft.updateRate );
      }else{
        if( fftSize ) fft.fftSize = fftSize
        if( updateRate ) fft.updateRate = updateRate
      }
      
      return fft
    },
    Follow : function( ugen, bufferSize ) {
      var follow = new Gibberish.Follow( ugen, bufferSize ),
          _mappingProperties = { value: { min: 0, max: 1, output: LOGARITHMIC, timescale: 'audio' } }

      Gibber.createProxyProperties( follow, _mappingProperties )

      return follow
    }
  }

  return Analysis
  //module.exports = function( __Gibber ) { if( typeof Gibber === 'undefined' ) { Gibber = __Gibber; } return Analysis }
  
}

},{"gibberish-dsp":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/gibberish-dsp/build/gibberish.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/arp.js":[function(require,module,exports){
module.exports = function( Gibber ) {
  
var theory = require('../../external/teoria.min'),
    $ = Gibber.dollar,
    curves = Gibber.outputCurves,
    Seq    = require('./seq')( Gibber ).Seq,
    Arp
    
Arp = function(notation, beats, pattern, mult, scale) {	
	var that = Seq()
  
  $.extend( that, {
  	name : "Arp",
  	notes : [],
  	pattern : pattern || "up",
  	notation : notation || "C4m7",
  	mult : mult || 1,
  	init : false,
  	speed : isNaN(beats) ? 1/4 : beats,
  	scale : scale || null,  
    
    chord : function(_chord, shouldReset) {
  		var arr = [];
  		this.notation = _chord;
		
  		if(typeof this.scale === 'undefined' || this.scale === null && typeof _chord === 'string') {
  			for(var i = 0; i < this.mult; i++) {
  				var tmp = [];
			
  				var _root = this.notation.slice(0,1);
  				var _octave, _quality;
  				if(isNaN(this.notation.charAt(1))) { 	// if true, then there is a sharp or flat...
  					_root += this.notation.charAt(1);	// ... so add it to the root name
  					_octave  = parseInt( this.notation.slice(2,3) );
  					_quality = this.notation.slice(3);
  				}else{
  					_octave  = parseInt( this.notation.slice(1,2) );
  					_quality = this.notation.slice(2);
  				}
  				_octave += i;

  				var _chord = theory.note(_root + _octave).chord(_quality);
  				for(var j = 0; j < _chord.notes.length; j++) {
  					var n = _chord.notes[j].fq();
  					tmp[j] = n;
  				}
  				arr = arr.concat(tmp);
  			}	

  		}else{
  			for(var i = 0; i < this.mult; i++) {
  				var tmp = [];
				
  				for(var j = 0; j < this.notation.length; j++) {
  					tmp[j] = this.notation[j] + (7 * i);
  				}
  				arr = arr.concat(tmp);
  			}	
  		}			
      this.notes = Gibber.construct( Gibber.Pattern, this.patterns[ this.pattern ]( arr ) )
      
      if( this.seqs[0] ) {
        this.seqs[0].values = [ this.notes ]
      }
  	},
	
	  set : function(_chord, _speed, _pattern, octaveMult, shouldReset) {
  		this.speed = _speed || this.speed;
  		this.pattern = _pattern || this.pattern;
  		this.mult = octaveMult || this.mult;
		
  		this.chord(_chord, shouldReset); // also sets sequence
  	},
    
    shuffle: function() {
      this.notes.shuffle()
    },
		
    reset: function() {
      this.notes.reset()
    },
    
	  patterns : {
    	up : function(array) {
    		return array;
    	},
    	down : function(array) {
    		return array.reverse();
    	},
    	updown : function(array) {
    		var _tmp = array.slice(0);
    		_tmp.reverse();
    		return array.concat(_tmp);
    	},
    	updown2 : function(array) { // do not repeat highest and lowest notes
    		var _tmp = array.slice(0);
    		_tmp.pop();
    		_tmp.reverse();
    		_tmp.pop();
    		return array.concat(_tmp);
    	}
    }
	});
	
  that.seq = that
  
  // I have no idea why I need this
  // that.__shuffle = that.shuffle 
  // that.shuffle = function() {
  //   that.__shuffle()
  // }
  
  Gibber.createProxyMethods( that, [ 'shuffle','reset','chord' ] )
  
	that.chord( that.notation );	// this sets the initial sequence
  
  var target = null
  Object.defineProperty( that, 'target', {
    get: function() { return target },
    set: function(v) {
      target = v
      var _seq = {
        key: 'note',
        'target': target,
        values: that.notes,
        durations:Gibber.Clock.time( beats )
      }
      that.add( _seq )
      that.start()
    }
  })
  
  var speed = beats
  Object.defineProperty( that, 'speed', {
    get : function() { return speed },
    set : function( v ) {
      speed = v
      for( var i = 0; i < that.seqs.length; i++ ) {
        that.seqs[0].durations = Gibber.Clock.time( speed )
      }
    }
  })

	return that;
}

return Arp

}
},{"../../external/teoria.min":"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/external/teoria.min.js","./seq":"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/seq.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/audio_input.js":[function(require,module,exports){
module.exports = function( Gibber ) { 
  "use strict"
  
  var Input = {},
      Gibberish = require( 'gibberish-dsp' ),
      curves = Gibber.outputCurves,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC,
      mappingProperties = {
        amp: {
          min: 0, max: 1,
          hardMax:2,
          output: LOGARITHMIC,
          timescale: 'audio',
          dimensions:1
        },
        out: {
          min: 0, max: 1,
          output: LINEAR,
          timescale: 'audio',
          dimensions:1
        },
        //pan: { min: -1, max: 1, output: LINEAR, timescale: 'audio',},   
      },
      name = 'Input'

  Input = function() {
    var oscillator = new Gibberish.Input().connect( Gibber.Master ),
        args = Array.prototype.slice.call( arguments, 0 )
       
    oscillator.type = 'Gen'
    $.extend( true, oscillator, Gibber.Audio.ugenTemplate )
    
    oscillator.fx.ugen = oscillator
    
    Object.defineProperty(oscillator, '_', {
      get: function() { 
        oscillator.kill();
        return oscillator 
      },
      set: function() {}
    })    
    
    Gibber.createProxyProperties( oscillator, mappingProperties )
        
    Gibber.processArguments2( oscillator, args, name )

    oscillator.toString = function() { return '> ' + name }
    
    return oscillator
  }
  
  return Input
}
},{"gibberish-dsp":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/gibberish-dsp/build/gibberish.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/bus.js":[function(require,module,exports){
module.exports = function( Gibber ) {
  "use strict"
  
  var $ = Gibber.dollar,//require('zepto-browserify').Zepto,
      Gibberish = require( 'gibberish-dsp' ),
      curves = Gibber.outputCurves,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC
      
  var types = [
    [ 'Bus2', 'Bus' ],
  ],
  mappingProperties = {
    amp: {
      min: 0, max: 1,
      output: LINEAR,
      timescale: 'audio',
    },
    pan: {
      min: -.75, max: .75,
      output: LINEAR,
      timescale: 'audio',
    },
    out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
  },
  init = false,
  Busses = {
    'mappingProperties': mappingProperties,
    Presets:{}
  }
  
  for( var i = 0; i < types.length; i++ ) {
  
    (function() {
      var type = Array.isArray( types[ i ] ) ? types[ i ][ 0 ] : types[ i ],
          name = Array.isArray( types[ i ] ) ? types[ i ][ 1 ] : types[ i ]
     
      Busses[ name ] = function() {
        var obj = Gibber.processArguments( arguments, name )
        
        if( Array.isArray( obj ) ) {
          obj.unshift(0)
          obj = Gibber.construct( Gibberish[ type ], obj )
        }else{
          obj =  new Gibberish[ type ]( obj )
        }
        
        if(init) {
          obj.connect( Master )
        }else{
          init = true;
        }
        
        obj.type = 'Gen'
        
        Object.defineProperty(obj, '_', {
          get: function() { obj.kill(); return obj },
          set: function() {}
        })
      
        $.extend( true, obj, Gibber.Audio.ugenTemplate )
        
        obj.fx.ugen = obj
        
        Gibber.createProxyProperties( obj, mappingProperties )    
        if( obj.presetInit ) obj.presetInit() 
        return obj
      }
    })()
  }
  
  Busses[ 'Group' ] = function() {
    var obj = Gibber.processArguments( arguments, 'Bus2' ),
        inputs = []
    
    // if( Array.isArray( obj ) ) {
    //   if( obj.length > 0 ) {
    //     inputs = obj.slice( 0 )
    //     for( var i = 0; i < inputs.length; i++ ) {
    //       inputs[ i ].disconnect()
    //     }
    //   }
    // }else{
    //   if( obj ) {
    //     inputs = obj.inputs || [] 
    //   }else{
    //     inputs = []
    //   }
    // }
     
    obj =  new Gibberish[ 'Bus2' ]()

    if(init) {
      obj.connect( Master )
    }else{
      init = true;
    }
    
    obj.type = 'FX'
  
    $.extend( true, obj, Gibber.Audio.ugenTemplate )
    
    obj.fx.ugen = obj
    
    Gibber.createProxyProperties( obj, mappingProperties )    
    
    $.extend( obj, {
      add : function() {
        for( var i = 0; i < arguments.length; i++ ) {
          arguments[ i ].disconnect()
          arguments[ i ].connect( obj )
        }
      },
      remove : function() {
        for( var i = 0; i < arguments.length; i++ ) {
          arguments[ i ].disconnect( obj )
        }
      },
      free : function() {
        for( var i = 0; i < arguments.length; i++ ) {
          arguments[ i ].disconnect( obj )
          arguments[ i ].connect()
        }
      }
    })
    
    for( var i = 0; i < arguments.length; i++ ) {
      obj.add( arguments[ i ] )
    }
    
    return obj
  }
  
  return Busses
}

},{"gibberish-dsp":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/gibberish-dsp/build/gibberish.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/clock.js":[function(require,module,exports){
!function() {
  
var times = [],
    $ = null,
    curves = null,
    LINEAR = null,
    LOGARITHMIC = null,
    Gibberish = require( 'gibberish-dsp' ),
    Gibber

var Clock = {
  seq : null, 
  bpm : null,
  maxMeasures: 44,
  baseBPM : 120,
  metronome : null,
  currentBeat : 0,
  beatsPerMeasure : 4,
  codeToExecute : [],
  signature: { lower: 4, upper: 4 },
  sequencers:[],
  shouldResetOnClear:true,
  timeProperties : [ 'attack', 'decay', 'sustain', 'release', 'offset', 'time' ],
  phase : 0,
  export: function( target ) {
    target.beats = Clock.beats
    target.Beats = Clock.Beats
    target.measures = Clock.measures
    target.Measures = Clock.Measures
  },
  
  processBeat : function() {
    Clock.currentBeat = Clock.currentBeat >= Clock.signature.upper ? 1 : Clock.currentBeat + 1
    
    if( Clock.currentBeat === 1 && Clock.codeToExecute.length > 0) {
      
      for( var i = 0; i < Clock.codeToExecute.length; i++ ) {
        try {
					if( typeof Clock.codeToExecute[ i ].function === 'function' ) {
						Clock.codeToExecute[ i ].function()
					}else{
            if( Gibber.Environment ) {
              Gibber.Environment.modes[ Clock.codeToExecute[ i ].cm.doc.mode.name ].run( Clock.codeToExecute[i].cm.column, Clock.codeToExecute[ i ].code, Clock.codeToExecute[ i ].pos, Clock.codeToExecute[ i ].cm, false ) 
            }else{
  	          //Gibber.run( Clock.codeToExecute[ i ].code, Clock.codeToExecute[ i ].pos, Clock.codeToExecute[ i ].cm )
              eval( Clock.codeToExecute[ i ].code )
            }
					}
        }catch( e ) {
          console.error( "FAILED TO EXECUTE CODE:", Clock.codeToExecute[ i ].code , e)
        }
      }
      
      Clock.codeToExecute.length = 0
    }
    
    if( Clock.metronome !== null ) {
      Clock.metronome.draw( Clock.currentBeat, Clock.signature.upper )
    }
    
    Clock.phase += Clock.beats( 1 )
  },
  
  getTimeSinceStart : function() {
    return Clock.phase + Clock.seq.phase
  },
  
  reset : function() {
    this.phase = 0
    this.currentBeat = 0
    this.rate = 1
    this.start( false )
  },
  
  tap : function() {
    var time = Gibber.Clock.getTimeSinceStart()
    if( times[2] && time - times[2] > 88200 ) {
      times.length = 0
    }
    times.unshift( time )
  
    while( times.length > 3 ) times.pop()
  
    if( times.length === 3) {
    	var average = ((times[0] + times[1]) - times[2] * 2) / 3.,
          bps = 44100 / average,
          bpm = bps * 60
    
      Gibber.Clock.bpm = bpm
    }
  },
  
  start : function( shouldInit ) {    
    var _phase = 0
    
    if( shouldInit ) {
      $.extend( this, {
        properties: { rate: 1 },
        name:'master_clock',
        callback : function( rate ) {
          _phase++ 
          return rate
        }
      })
     
      this.__proto__ = new Gibberish.ugen()
      this.__proto__.init.call( this )

      var bpm = this.baseBPM
      Object.defineProperty(Clock, 'bpm', {
        get: function() { return bpm },
        set: function(v) { 
          bpm = v;
          Clock.rate = bpm / Clock.baseBPM
        }
      })
      
      Object.defineProperty(this, 'timeSignature', {
        configurable:true,
        get: function() { return Clock.signature.upper + '/' + Clock.signature.lower },
        set: function(v) { 
          var values = v.split('/')
          if( values.length === 2 && ( values[0] !== Clock.signature.upper || values[1] !== Clock.signature.lower ) ) {
            Clock.signature.upper = parseInt( values[0] )
            Clock.signature.lower = parseInt( values[1] )
            Clock.currentBeat = Clock.currentBeat != 1 ? 0 : 1
          }
        }
      })
      
      Gibber.createProxyProperties( this, {
        rate : { min: .1, max: 2, output: LINEAR, timescale: 'audio' },
        bpm : { min: 20, max: 200, output: LINEAR, timescale: 'audio' },        
      })
      
      this.setPhase = function( v ) { _phase = v }
      this.getPhase = function() { return _phase }

      Clock.seq = new Gibberish.PolySeq({
        seqs : [{
          target:Clock,
          values: [ Clock.processBeat.bind( Clock ) ],
          durations:[ 1/4 ],
        }],
        rate: Clock,
      })
      Gibber.Audio.Seqs.Seq.children.push( Clock.seq ) // needed for Gabber
      Clock.seq.connect().start()
      Clock.seq.timeModifier = Clock.time.bind( Clock )
      
    }else{
      Clock.seq.setPhase(0)
      Clock.seq.connect().start()
    }
  },
  
  addMetronome: function( metronome ) {
    this.metronome = metronome
    this.metronome.init()
  },
  
  time : function(v) {
    var timeInSamples, beat;
    
    if( v < Clock.maxMeasures ) {
      timeInSamples = Clock.beats( v * Clock.signature.lower )
    }else{
      timeInSamples = v
    }
    return timeInSamples
  },
  
  Time : function(v) {
    var timeFunction, beat;
    
    if( v < this.maxMeasures ) {
      timeFunction = Clock.Beats( v * Clock.signature.lower )
    }else{
      timeFunction = Clock.Beats( v )
    }
    
    return timeFunction
  },
  
  beats : function(val) {
    var sampleRate = typeof Gibberish.context !== 'undefined' ? Gibberish.context.sampleRate : 44100,
        beatsPerSecond = Clock.bpm / 60,
        samplesPerBeat = sampleRate / beatsPerSecond
        
    return samplesPerBeat * val
  },
  
  Beats : function(val) {
    return Clock.beats.bind( null, val )
  },
  
  measures: function( val ) {
    return Clock.beats( val * Clock.signature.upper )
  },
  
  Measures: function( val ) {
    return Clock.Beats( val * Clock.signature.upper )
  }
}

module.exports = function( __Gibber ) {
  
  "use strict"
  Gibber = __Gibber
  $ = Gibber.dollar,
  curves = Gibber.outputCurves,
  LINEAR = curves.LINEAR,
  LOGARITHMIC = curves.LOGARITHMIC

  return Clock

}

}()
},{"gibberish-dsp":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/gibberish-dsp/build/gibberish.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/drums.js":[function(require,module,exports){
module.exports = function( Gibber ) {
  "use strict"
  
  var Percussion = { Presets:{} }, 
      Gibberish = require( 'gibberish-dsp' ),
      $ = Gibber.dollar,
      Clock = Gibber.Clock,
      curves = Gibber.outputCurves,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC, 
      types = [
        'Kick',
        'Snare',
        'Hat',
        'Conga',
        'Cowbell',
        'Clave',
        'Tom',
        'Clap'
      ],
      _mappingProperties = {
        Drums: {
          pitch: { min: .25, max: 4, output: LINEAR,     timescale: 'audio' },
          amp:   { min: 0,   max: 1, output: LOGARITHMIC,timescale: 'audio',},
          pan:   { min: 0,   max: 1, output: LINEAR,timescale: 'audio',},
          out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
        },
        XOX: {
          //pitch: { min: .25, max: 4, output: LINEAR, timescale: 'audio' },
          amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',},
          pan:   { min: 0,   max: 1, output: LINEAR,timescale: 'audio',},
          out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },      
        },
        Kick    : { 
          amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',},
          out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
        },
        Snare   : { 
          amp: { min: 0, max: 1, output: LOGARITHMIC, timescale: 'audio' },
          snappy: { min: .25, max: 1.5, output: LOGARITHMIC, timescale: 'audio' },
          tune: { min: 0, max: 2, output: LOGARITHMIC, timescale: 'audio' },
          out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },    
        },
        Hat     : { 
          amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',},
          out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
        },
        Conga   : { 
          amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',},
          out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
        },
        Cowbell : { 
          out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
          amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',},
        },
        Clave   : { 
          out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
          amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',}, },
        Tom     : { 
          out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
          amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',}, 
        },
        Clap     : { 
          out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
          amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',}, 
        },
      };

  for( var i = 0; i < types.length; i++ ) {
  
    (function() {
      var type = Array.isArray( types[ i ] ) ? types[ i ][ 0 ] : types[ i ],
          name = Array.isArray( types[ i ] ) ? types[ i ][ 1 ] : types[ i ]
     
      Percussion[ name ] = function() {
        var args = Array.prototype.slice.call(arguments),
            obj
        
        if( typeof args[0] === 'object' && typeof args[0].maxVoices === 'undefined') { 
          args[0].maxVoices = 1
        }else if( typeof args[0] === 'undefined') {
          args[0] = { maxVoices:1 }
        }
        
        obj = Gibber.processArguments( args, name )
      
        if( Array.isArray( obj ) ) {
          obj = Gibber.construct( Gibberish[ type ], obj ).connect( Gibber.Master )
        }else{
          obj =  new Gibberish[ type ]( obj ).connect( Gibber.Master )
        }
      
        obj.type = 'Gen'
        
        $.extend( true, obj, Gibber.Audio.ugenTemplate )
        
        obj.fx.ugen = obj
        
        // override note method to allow note names
        obj._note = obj.note.bind(obj)
        obj.note = function() {
          var args = Array.prototype.splice.call( arguments, 0 )
        
          if( typeof args[0] === 'string' ) {
            args[0] = Gibber.Theory.Teoria.note( args[0] ).fq()
          }
          
          this._note.apply( this, args )
        }
        
        Gibber.createProxyProperties( obj, _mappingProperties[ name ] )
        Gibber.createProxyMethods( obj, [ 'note', 'send' ] )
        
        obj.toString = function() { return '> ' + name }
        
        Object.defineProperty(obj, '_', {
          get: function() { obj.kill(); return obj },
          set: function() {}
        })

        return obj
      }
    })()
  
  }
  
  Percussion[ 'Drums' ] = function(_sequence, _timeValue, _amp, _freq){    
    var args = Array.prototype.slice.call(arguments),
        obj = {}, 
        props = Gibber.processArguments( args, 'Drums' )

    if( typeof props === 'undefined' ) props = {}
        
    $.extend( true, obj, props)
  
    if( Array.isArray( obj ) ) {
      obj = Gibber.construct( Gibberish.Bus2, obj ).connect( Gibber.Master )
    }else{
      obj =  new Gibberish.Bus2( obj ).connect( Gibber.Master )
    }
    
		obj.name = 'Drums'
    obj.type = 'Gen'
    obj.children = []
    
    $.extend( true, obj, Gibber.Audio.ugenTemplate )
    
    obj.fx.ugen = obj
  
    Object.defineProperty(obj, '_', { get: function() { obj.kill(); return obj }, set: function() {} })
		
  	obj.kit = Percussion.Drums.kits['default'];
    
  	if(typeof arguments[0] === "object") {
  		if(arguments[0].kit) {
  			obj.kit = Percussion.Drums.kits[ arguments[ 0 ].kit ];
  			arguments[0].kit = obj.kit;
  		}
  	}
    
  	for( var key in obj.kit ) {
  		var drum = obj.kit[ key ],
          ugen = drum.file ? { ugen: new Gibberish.Sampler({ file:drum.file, pitch:1, amp:drum.amp }), pitch:drum.pitch, amp:drum.amp } : drum
      
      if( ugen ) {
        if( isNaN( ugen.pitch ) ) ugen.pitch = 1
        if( isNaN( ugen.pan ) )   ugen.pan   = 0
        if( isNaN( ugen.amp ) )   ugen.amp = 1
        if( typeof ugen.symbol === 'undefined' ) ugen.symbol = key
        
    		obj[ key ] = ugen
        // console.log("KEY", key, ugen, drum, obj[key], obj[key].ugen )
    		obj[ key ].ugen.pan = drum.pan
        if( !drum.file ) drum.ugen.disconnect() // disconnect non-sampler ugens
    		obj[ key ].ugen.connect( obj )
    		obj[ key ].fx = obj[ key ].ugen.fx
    		obj.children.push( obj[ key ].ugen )
      }
  	}
	
    obj.mod = obj.polyMod
    obj.removeMod = obj.removePolyMod
	
  	obj.connect();
    
    Gibber.createProxyProperties( obj, _mappingProperties[ 'Drums' ] )
    
    obj.note = function(nt) {
      // var p = typeof obj.pitch === 'function' ? obj.pitch() : obj.pitch
      var p = obj.pitch.value
      
      if( $.isArray( nt ) ) {
        for( var i = 0; i < nt.length; i++ ) {
          var note = nt[ i ]

          if( typeof note === 'string' ) {
        		for( var key in obj.kit ) {
        			if( note === obj.kit[ key ].symbol ) {
                if( obj[ key ].ugen ) {
          				obj[ key ].ugen.note( p, obj[key].amp );
                }
                //var p = p //this.pitch() 
                // if( this[ key ].sampler.pitch !== p )
                  // this[ key ].sampler.pitch = p
        				break;
        			}
        		}
          }else{
            var drum = obj[ Object.keys( obj.kit )[ note ] ]
            drum.ugen.note( p.value, drum.ugen.amp )
            // if( drum.sampler.pitch !== p )
            //   drum.sampler.pitch = p
          }
        }
      }else{
        if( typeof nt === 'string' ) {
      		for( var key in obj.kit ) {
      			if( nt === obj.kit[ key ].symbol ) {
              //console.log("PITCH", p )
              if( obj[key].file ) {
        				obj[ key ].ugen.note( p, obj[key].amp );
                obj[ key ].ugen.pitch = p
              }else{
        				obj[ key ].ugen.note( obj[ key ].pitch, obj[key].amp );
                obj[ key ].ugen.pitch = p
              }
              //var p = this.pitch.value //this.pitch() 
              // if( this[ key ].sampler.pitch !== p )
              //   this[ key ].sampler.pitch = p
      				break;
      			}
      		}
        }else{
          var keys = Object.keys( obj.kit ),
              num = Math.abs( nt ),
              key = keys[ num % keys.length ], 
              drum = obj[ key ]
          
          drum.ugen.note( p, drum.ugen.amp )
          
          // if( drum.sampler.pitch !== p )
          //   drum.sampler.pitch = p
        }
      }
  	}
    
    Gibber.createProxyMethods( obj, [ 'note' ] )
    
  	obj.pitch = 1;
    
    if( $.type( props[0] )  === 'object' ) { props[0] = props[0].note }
        
    if( typeof props !== 'undefined') {
      switch( $.type( props[0] ) ) {
        case 'string':
          var notes = props[0], _seqs = [], _durations = [], __durations = [], seqs = notes.split('|'), timeline = {}
          
          for( var i = 0; i < seqs.length; i++ ) {
            var seq = seqs[i], duration, hasTime = false, idx = seq.indexOf(',')

            if( idx > -1 ) {
              var _value = seq.substr( 0, idx ),
                  duration = seq.substr( idx + 1 )
              
              duration = eval(duration)
              hasTime = true
              seq = _value.trim().split('')
            }else{
              seq = seq.trim().split('')
              duration = 1 / seq.length  
            }
            
            if( seq.indexOf('.rnd(') > -1) {
              // || seq.indexOf('.random(') > -1 ) {
              seq = seq.split( '.rnd' )[0]
              seq = seq.split('').rnd()
            }
            
            if( typeof props[1] !== 'undefined') { 
              duration = props[1]
              if( !Array.isArray( duration ) ) duration = [ duration ]
              
              var durationsPattern = Gibber.construct( Gibber.Pattern, duration )
        
              if( duration.randomFlag ) {
                durationsPattern.filters.push( function() { return [ durationsPattern.values[ rndi(0, durationsPattern.values.length - 1) ], 1 ] } )
                for( var i = 0; i < duration.randomArgs.length; i+=2 ) {
                  durationsPattern.repeat( duration.randomArgs[ i ], duration.randomArgs[ i + 1 ] )
                }
              }
              
              duration = durationsPattern
            }
            
            obj.note.seq( seq, [duration], i )
            //obj.note.seq( Gibber.construct( Gibber.Pattern, seq ), Gibber.construct( Gibber.Pattern, [duration] ), i )
          }

          break;
        case 'object':
      		if( typeof props[0].note === 'string' ) props[0].note = props[0].note.split("")
      		props[0].target    = obj
          props[0].durations = props[0].durations ? Gibber.Clock.Time( props[0].durations ) : Gibber.Clock.Time( 1 / props[0].note.length )
          props[0].offset    = props[0].offset ? Gibber.Clock.time( props[0].offset ) : 0
      	  //obj.seq = Seq( props[0] );
          
          break;

        case 'function': case 'array':
          var length = props[0].length || props[0].values.length,
              durations = typeof arguments[1] !== 'undefined' ? arguments[1] : Gibber.Clock.Time( 1 / length )
          
          if( typeof durations !== 'function' ) durations = Gibber.Clock.Time( durations )
              
          obj.seq.add({
            key:'note',
            values:[ props[0] ],
            durations: durations,
            target:obj
          })
          
          obj.pattern = obj.seq.seqs[ obj.seq.seqs.length - 1 ].values[ 0 ]
          
          break;
        default:
          break;
      }
    }

  	if( typeof props === "undefined" ) props = {};
	
  	if( props.pitch ) obj.pitch = props.pitch;
	
  	if( typeof props.snare !== "undefined" ) 	{ $.extend( obj.snare.ugen, props.snare ); $.extend( obj.snare, props.snare); }
  	if( typeof props.kick !== "undefined" ) 	{ $.extend( obj.kick.ugen, props.kick ); $.extend( obj.kick, props.kick); }
  	if( typeof props.hat !== "undefined" ) 	{ $.extend( obj.hat.ugen, props.hat ); $.extend( obj.hat, props.hat); }
  	if( typeof props.openHat !== "undefined" ) { $.extend( obj.openHat.ugen, props.openHat ); $.extend( obj.openHat, props.openHat); }
 	
  	obj.amp   = isNaN(_amp) ? 1 : _amp;
	
  	if( obj.seq && obj.seq.tick ) { Gibberish.future( obj.seq.tick, 1 ) }
    
    obj.start = function() { obj.seq.start( true ) }
    obj.stop = function() { obj.seq.stop() }
    obj.shuffle = function() { obj.note.values.shuffle() }
    obj.reset = function() { obj.seq.reset() }

    Gibber.createProxyMethods( obj, [ 'play','stop','shuffle','reset','start','send' ] )
            
    //obj.seq.start( true )

    Object.defineProperties( obj, {
      offset: {
        get: function() { return obj.seq.offset },
        set: function(v) { obj.seq.offset = Gibber.Clock.time(v)}
      }
    })
        
    //obj.toString = function() { return 'Drums : ' + obj.seq.seqs[0].values.join('') }
    
    return obj
  }
  
  Percussion[ 'EDrums' ] = function(_sequence, _timeValue, _amp, _freq){    
    var args = Array.prototype.slice.call(arguments),
        obj = {}, 
        props = Gibber.processArguments( args, 'Drums' )
        
    $.extend( true, obj, props)
  
    if( Array.isArray( obj ) ) {
      obj = Gibber.construct( Gibberish.Bus2, obj ).connect( Gibber.Master )
    }else{
      obj =  new Gibberish.Bus2( obj ).connect( Gibber.Master )
    }
    
    obj.name = 'XOX'
    obj.type = 'Gen'
    obj.children = []
    
    $.extend( true, obj, Gibber.Audio.ugenTemplate )
    
    obj.fx.ugen = obj
  
    Object.defineProperty(obj, '_', { get: function() { obj.kill(); return obj }, set: function() {} })
		
  	obj.pitch = 1;
    
  	/*obj.kit = Drums.kits['default'];
    
  	if(typeof arguments[0] === "object") {
  		if(arguments[0].kit) {
  			obj.kit = Drums.kits[arguments[0].kit];
  			arguments[0].kit = obj.kit;
  		}
  	}*/
	  
    // connect in note method
    obj.kick = Gibber.Audio.Percussion.Kick().disconnect()//new Gibberish.Kick()//.connect( obj )
    obj.snare = Gibber.Audio.Percussion.Snare().disconnect()//new Gibberish.Snare()//.connect( obj )
    obj.hat = Gibber.Audio.Percussion.Hat().disconnect()//new Gibberish.Hat()//.connect( obj )
    
    obj.kick.connect( obj )
    obj.snare.connect( obj )
    obj.hat.connect( obj )
    
    obj.children.push( obj.kick, obj.snare, obj.hat )
	
    obj.mod = obj.polyMod
    obj.removeMod = obj.removePolyMod

    obj.set = function( v ) { obj.seq.note = v.split('') }
    
    Gibber.createProxyProperties( obj, _mappingProperties[ 'XOX' ] )
    
    obj.start = function() { obj.seq.start( true ) }
    obj.stop = function() { obj.seq.stop() }
    obj.shuffle = function() { obj.seq.shuffle() }
    obj.reset = function() { obj.seq.reset() }
    
    var kcd = 1,
        scd = 1,
        hcd = 1,
        kf = null,
        sf = null,
        hf = null;
        
    obj.note = function(nt) {
      switch(nt) {
        case 'x': 
          if(kcd === 1) {
            //obj.kick.connect( obj ); 
            kcd = 0;
          }
          
          obj.kick.note();
          
          if( kf !== null ) {
            kf()
            kf = null
          }

          kf = Gibber.Utilities.future( function() {
              //obj.kick.disconnect()
              kcd = 1
              kf = null
          }, obj.kick.decay * 110000 ) 
          
          break;
          
        case 'o': 
          if(scd === 1) {
            //obj.snare.connect( obj ); 
            scd = 0;
          }
        
          obj.snare.note();
        
          if( sf !== null ) {
            sf()
            sf = null
          }

          sf = Gibber.Utilities.future( function() {
              //obj.snare.disconnect()
              scd = 1
              sf = null
          }, obj.snare.decay ) 
        
          break;
        case '*': 
          if(hcd === 1) {
            //obj.hat.connect( obj ); 
            hcd = 0;
          }
      
          obj.hat.note( 5000 );
      
          if( hf !== null ) {
            hf()
            hf = null
          }

          hf = Gibber.Utilities.future( function() {
              //obj.hat.disconnect()
              hcd = 1
              hf = null
          }, 5500 ) 
      
          break;

        case '-': 
          if(hcd === 1) {
            //obj.hat.connect( obj ); 
            hcd = 0;
          }
    
          obj.hat.note( 30000 );
    
          if( hf !== null ) {
            hf()
            hf = null
          }

          hf = Gibber.Utilities.future( function() {
              //obj.hat.disconnect()
              hcd = 1
              hf = null
          }, 30500 ) 
    
          break;
      }
  	}
    
    Gibber.createProxyMethods( obj, [ 'play','stop','shuffle','reset','start','send','note' ] )
    
    if( typeof props !== 'undefined') {
      switch( $.type( props[0] ) ) {
        case 'string':
          var notes = props[0], _seqs = [], _durations = [], __durations = [], seqs = notes.split('|'), timeline = {}
          
          for( var i = 0; i < seqs.length; i++ ) {
            var seq = seqs[i], duration, hasTime = false, idx = seq.indexOf(',')

            if( idx > -1 ) {
              var _value = seq.substr( 0, idx ),
                  duration = seq.substr( idx + 1 )
              
              duration = eval(duration)
              hasTime = true
              seq = _value.trim().split('')
            }else{
              seq = seq.trim().split('')
              duration = 1 / seq.length  
            }
            
            if( seq.indexOf('.rnd(') > -1) {
              // || seq.indexOf('.random(') > -1 ) {
              seq = seq.split( '.rnd' )[0]
              seq = seq.split('').rnd()
            }
            
            if( typeof props[1] !== 'undefined') { 
              duration = props[1]
              if( !Array.isArray( duration ) ) duration = [ duration ]
              
              var durationsPattern = Gibber.construct( Gibber.Pattern, duration )
        
              if( duration.randomFlag ) {
                durationsPattern.filters.push( function() { return [ durationsPattern.values[ rndi(0, durationsPattern.values.length - 1) ], 1 ] } )
                for( var i = 0; i < duration.randomArgs.length; i+=2 ) {
                  durationsPattern.repeat( duration.randomArgs[ i ], duration.randomArgs[ i + 1 ] )
                }
              }
              
              duration = durationsPattern
            }
              
            obj.note.seq( Gibber.construct( Gibber.Pattern, seq ), Gibber.construct( Gibber.Pattern, [duration] ), i )
          }

          break;
          
          break;
        case 'object':
      		if( typeof props[0].note === 'string' ) props[0].note = props[0].note.split("")
      		props[0].target = obj
          props[0].durations = props[0].durations ? Gibber.Clock.Time( props[0].durations ) : Gibber.Clock.Time( 1 / props[0].note.length )
          props[0].offset = props[0].offset ? Gibber.Clock.time( props[0].offset ) : 0
      	  obj.seq = Seq( props[0] );
          
          break;
        default:
          break;
      }
    }

  	if( typeof props === "undefined" ) props = {};
	
  	if( props.pitch ) obj.pitch = props.pitch;
	
  	if( typeof props.snare !== "undefined" ) 	{ $.extend( obj.snare.ugen, props.snare ); $.extend( obj.snare, props.snare); }
  	if( typeof props.kick !== "undefined" ) 	{ $.extend( obj.kick.ugen, props.kick ); $.extend( obj.kick, props.kick); }
  	if( typeof props.hat !== "undefined" ) 	{ $.extend( obj.hat.ugen, props.hat ); $.extend( obj.hat, props.hat); }
  	if( typeof props.openHat !== "undefined" ) { $.extend( obj.openHat.ugen, props.openHat ); $.extend( obj.openHat, props.openHat); }
 	
  	obj.amp   = isNaN(_amp) ? 1 : _amp;
	
  	if( obj.seq.tick ) { Gibberish.future( obj.seq.tick,1 ) }

    // obj.kill = function() {
    //   var end = this.fx.length !== 0 ? this.fx[ this.fx.length - 1 ] : this
    //   end.disconnect()
    //        
    //   obj.seq.kill()
    // }
     
    obj.seq.start( true )
    
    obj.toString = function() { return 'EDrums : ' + obj.seq.seqs[0].values.join('') }
    
    return obj
  }
  
  // for backwards compatibility
  Percussion.XOX = Percussion.EDrums 
  
  Percussion.Drums.kits = {
  	original: {
  		kick:     { file:"resources/audiofiles/kick.wav",   symbol:'x', amp:1, pitch:1, pan:0 	},
  		snare:    { file:"resources/audiofiles/snare.wav", 	symbol:'o', amp:1, pitch:1, pan:.15 },
  		hat:      { file:"resources/audiofiles/hat.wav",    symbol:'*', amp:1, pitch:1, pan:-.1 },
  		openHat:  { file:"resources/audiofiles/openHat.wav",symbol:'-', amp:1, pitch:1, pan:-.2 },
  	},
  	electronic: {
  		kick:     { file:"resources/audiofiles/electronic/kick.wav",    symbol:'x', amp:1.5, pitch:1, pan:0 },
  		snare:    { file:"resources/audiofiles/electronic/snare.wav",   symbol:'o', amp:1.5, pitch:1, pan:.15 },
  		hat:      { file:"resources/audiofiles/electronic/hat.wav",     symbol:'*', amp:1.5, pitch:1, pan:-.1 },
  		openHat:  { file:"resources/audiofiles/electronic/openhat.wav", symbol:'-', amp:1.5, pitch:1, pan:-.2 },
  	},
  	beatbox: {
  	    in_tss: { file:'resources/audiofiles/beatbox/^tss.wav' , symbol:'T', amp:1, pitch:1, pan: 0.1 },
  	    f:      { file:'resources/audiofiles/beatbox/f.wav'    , symbol:'f', amp:1, pitch:1, pan:-0.1 },
  	    h:      { file:'resources/audiofiles/beatbox/h.wav'    , symbol:'h', amp:1, pitch:1, pan: 0.1 },
  	    s:      { file:'resources/audiofiles/beatbox/s.wav'    , symbol:'s', amp:1, pitch:1, pan:-0.1 },

  	    d:      { file:'resources/audiofiles/beatbox/d.wav'    , symbol:'d', amp:1, pitch:1, pan: 0.8 },
  	    t:      { file:'resources/audiofiles/beatbox/t.wav'    , symbol:'t', amp:1, pitch:1, pan: 0.4 },
  	    k:      { file:'resources/audiofiles/beatbox/k.wav'    , symbol:'k', amp:1, pitch:1, pan:-0.1 },
  	    in_k:   { file:'resources/audiofiles/beatbox/^k.wav'   , symbol:'K', amp:1, pitch:1, pan:-0.4 },
  	    eight:  { file:'resources/audiofiles/beatbox/8.wav'    , symbol:'8', amp:1, pitch:1, pan:-0.8 },

  	    psh:    { file:'resources/audiofiles/beatbox/psh.wav'  , symbol:'p', amp:1, pitch:1, pan: 0.1 },
  	    in_p:   { file:'resources/audiofiles/beatbox/^p.wav'   , symbol:'P', amp:1, pitch:1, pan:-0.1 },
  	    pf:     { file:'resources/audiofiles/beatbox/pf.wav'   , symbol:'F', amp:1, pitch:1, pan: 0.2 },
  	    phs:    { file:'resources/audiofiles/beatbox/phs.wav'  , symbol:'H', amp:1, pitch:1, pan:-0.2 },

  	    b:      { file:'resources/audiofiles/beatbox/b.wav'    , symbol:'b', amp:1, pitch:1, pan: 0.3 },
  	    dot:    { file:'resources/audiofiles/beatbox/dot.wav'  , symbol:'.', amp:1, pitch:1, pan: 0.0 },
  	    duf:    { file:'resources/audiofiles/beatbox/duf.wav'  , symbol:'D', amp:1, pitch:1, pan:-0.3 },

  	    o:      { file:'resources/audiofiles/beatbox/o.wav'    , symbol:'o', amp:1, pitch:1, pan: 0.6 },
  	    a:      { file:'resources/audiofiles/beatbox/a.wav'    , symbol:'a', amp:1, pitch:1, pan: 0.8 },
  	    u:      { file:'resources/audiofiles/beatbox/u.wav'    , symbol:'u', amp:1, pitch:1, pan:-0.8 },

  	    m:      { file:'resources/audiofiles/beatbox/m.wav'    , symbol:'m', amp:1, pitch:1, pan:-0.6 },
  	    n:      { file:'resources/audiofiles/beatbox/n.wav'    , symbol:'n', amp:1, pitch:1, pan: 0.0 },
  	},
  };
  Percussion.Drums.kits.default = Percussion.Drums.kits.electronic;
  
  Percussion.Drums.makeKit = function( name, kit ) {
    Percussion.Drums.kits[ name ] = kit
  }
  
  Percussion.Presets.Kick = {
    short: { decay:.1, amp:.75 }
  }
  Percussion.Presets.Snare = {
    crack: { snappy:1, offset:1/4 }
  }
  
  return Percussion
  
}

},{"gibberish-dsp":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/gibberish-dsp/build/gibberish.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/ensemble.js":[function(require,module,exports){
module.exports = function( Gibber ) {
  "use strict"
  
  var Gibberish = require( 'gibberish-dsp' ),
      $ = Gibber.dollar,
      Clock = Gibber.Clock,
      curves = Gibber.outputCurves,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC,
      mappingProperties = {
        amp: {
          min: 0, max: 1,
          output: LINEAR,
          timescale: 'audio',
        },
        pan: {
          min: -.75, max: .75,
          output: LINEAR,
          timescale: 'audio',
        },
        out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
      }    
      
  var Ensemble = function( props ) {
    var obj = new Gibberish.Bus2( obj ).connect( Gibber.Master )
    
		obj.name = 'Ensemble'
    obj.type = 'Gen'
    obj.children = []
    
    $.extend( true, obj, Gibber.Audio.ugenTemplate )
    
    obj.fx.ugen = obj
  
    Object.defineProperty(obj, '_', { get: function() { obj.kill(); return obj }, set: function() {} })
    
    Gibber.createProxyProperties( obj, mappingProperties )
    
  	for(var key in props) {
  		var ugenDesc = props[key],
          ugen = ugenDesc.file ? { ugen: new Gibberish.Sampler({ file:ugenDesc.file, pitch:1, amp:ugenDesc.amp }), pitch:ugenDesc.pitch, amp:ugenDesc.amp } : ugenDesc
      
      if( ugen ) {
        if( isNaN( ugen.pitch ) ) ugen.pitch = 1
        if( isNaN( ugen.pan ) )   ugen.pan   = 0
        if( isNaN( ugen.amp ) )   ugen.amp = 1
        if( typeof ugen.symbol === 'undefined' ) ugen.symbol = key
        
    		obj[key] = ugen
        // console.log("KEY", key, ugen, drum, obj[key], obj[key].ugen )
    		obj[key].ugen.pan = ugen.pan
        if( !ugenDesc.file ) ugen.ugen.disconnect() // disconnect non-sampler ugens
    		obj[key].ugen.connect( obj )
    		obj[key].fx = obj[key].ugen.fx
    		obj.children.push( obj[key].ugen )
      }
  	}
    
    obj.note = function(nt) {
      // var p = typeof obj.pitch === 'function' ? obj.pitch() : obj.pitch
      var p = obj.pitch
      if( typeof nt === 'string' ) {
    		for( var key in props ) {
          var ugen = props[ key ]
    			if( nt === ugen.symbol ) {
            if( ugen.file ) {
      				ugen.ugen.note( p, obj[key].amp );
            }else{
      				ugen.ugen.note( ugen.pitch * p, ugen.amp );
            }

    				break;
    			}
    		}
      }else{
        var keys = Object.keys( obj.kit ),
            num = Math.abs( nt ),
            key = keys[ num % keys.length ], 
            ugen = obj[ key ]
        
        ugen.ugen.note( p, ugen.ugen.amp )
      }
    }
    
    var seqNumber
    obj.play = function( pattern ) {
      var notes = pattern, _seqs = [], _durations = [], __durations = [], seqs = notes.split('|'), timeline = {}

      for(var i = 0; i < obj.seq.seqs.length; i++ ) {
        obj.seq.seqs[i].shouldStop = true
      }
      obj.seq.seqs.length = 0
      
      for( var i = 0; i < seqs.length; i++ ) {
        var seq = seqs[i], duration, hasTime = false, idx = seq.indexOf(',')

        if( idx > -1 ) {
          var _value = seq.substr( 0, idx ),
              duration = seq.substr( idx + 1 )
          
          duration = eval(duration)
          hasTime = true
          seq = _value.trim().split('')
        }else{
          seq = seq.trim().split('')
          duration = 1 / seq.length  
        }
        
        if( seq.indexOf('.rnd(') > -1) {// || seq.indexOf('.random(') > -1 ) {
          seq = seq.split( '.rnd' )[0]
          seq = seq.split('').rnd()
        }
        
        if( typeof arguments[1] !== 'undefined') { 
          duration = arguments[1]
          if( !Array.isArray( duration ) ) duration = [ duration ]
          
          var durationsPattern = Gibber.construct( Gibber.Pattern, duration )
            
          if( duration.randomFlag ) {
            durationsPattern.filters.push( function() { return [ durationsPattern.values[ rndi(0, durationsPattern.values.length - 1) ], 1 ] } )
            for( var i = 0; i < duration.randomArgs.length; i+=2 ) {
              durationsPattern.repeat( duration.randomArgs[ i ], duration.randomArgs[ i + 1 ] )
            }
          }
          
          duration = durationsPattern
        }
        
        obj.seq.add({
          key:'note',
          values: Gibber.construct( Gibber.Pattern, seq ),
          durations: Gibber.construct( Gibber.Pattern, [duration] ),
          target:obj
        })
        
        seqNumber = obj.seq.seqs.length - 1
        Object.defineProperties( obj.note, {
          values: {
            configurable:true,
            get: function() { return obj.seq.seqs[ seqNumber ].values },
            set: function( val ) {
              var pattern = Gibber.construct( Gibber.Pattern, val )

              if( !Array.isArray( pattern ) ) {
                pattern = [ pattern ]
              }
              // if( key === 'note' && obj.seq.scale ) {  
              //   v = makeNoteFunction( v, obj.seq )
              // }
              //console.log("NEW VALUES", v )
              obj.seq.seqs[ seqNumber ].values = pattern
            }
          },
          durations: {
            configurable:true,
            get: function() { return obj.seq.seqs[ seqNumber ].durations },
            set: function( val ) {
              if( !Array.isArray( val ) ) {
                val = [ val ]
              }
              obj.seq.seqs[ seqNumber ].durations = val   //.splice( 0, 10000, v )
            }
          },
        })
      }
    }
    
  	obj.pitch = 1;
    
    obj.seq.start()
    obj.connect()
    
    return obj
  }

  return Ensemble
}
},{"gibberish-dsp":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/gibberish-dsp/build/gibberish.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/envelopes.js":[function(require,module,exports){
module.exports = function( Gibber ) {
  "use strict"
  
  var Envelopes = {},
      Gibberish = require( 'gibberish-dsp' ),
      $ = Gibber.dollar,
      Clock = Gibber.Clock,
      curves = Gibber.outputCurves,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC,
      types = [
        'Curve',
        'Line',
        'Ease',
        'Lines',
        'AD',
        'ADSR' 
      ],
      _mappingProperties = {
        Line: {
          start: {
            min: 0, max: 1,
            output: LINEAR,
            timescale: 'audio',
          },
          end: {
            min: 0, max: 1,
            output: LINEAR,
            timescale: 'audio',
          },
          time: {
            min: 0, max: 8,
            output: LINEAR,
            timescale: 'audio',
          }
        },
        Lines: {           
          time: {
            min: 0, max: 8,
            output: LINEAR,
            timescale: 'audio',
          }
        },
        Ease: {
          /*start: {
            min: 0, max: 1,
            output: LINEAR,
            timescale: 'audio',
          },
          end: {
            min: 0, max: 1,
            output: LINEAR,
            timescale: 'audio',
          },
          time: {
            min: 0, max: 8,
            output: LINEAR,
            timescale: 'audio',
          },*/
        },
        Curve: {
          start: {
            min: 0, max: 1,
            output: LINEAR,
            timescale: 'audio',
          },
          end: {
            min: 0, max: 1,
            output: LINEAR,
            timescale: 'audio',
          },
          time: {
            min: 0, max: 8,
            output: LINEAR,
            timescale: 'audio',
          },
          a: {
            min: 0, max: 1,
            output: LINEAR,
            timescale: 'audio',
          },
          b: {
            min: 0, max: 1,
            output: LINEAR,
            timescale: 'audio',
          },
        },
        AD: {
          attack: {
            min: 0, max: 8,
            output: LINEAR,
            timescale: 'audio',
          },
          decay: {
            min: 0, max: 8,
            output: LINEAR,
            timescale: 'audio',
          },
        },
        ADSR: {
          attack: {
            min: 0, max: 8,
            output: LINEAR,
            timescale: 'audio',
          },
          decay: {
            min: 0, max: 8,
            output: LINEAR,
            timescale: 'audio',
          },
          sustain: {
            min: 0, max: 8,
            output: LINEAR,
            timescale: 'audio',
          },
          release: {
            min: 0, max: 8,
            output: LINEAR,
            timescale: 'audio',
          }
        },
      };
  
  for( var i = 0; i < types.length; i++ ) {
  
    (function() {
      var type = Array.isArray( types[ i ] ) ? types[ i ][ 0 ] : types[ i ],
          name = Array.isArray( types[ i ] ) ? types[ i ][ 1 ] : types[ i ]
     
      Envelopes[ name ] = function() {
        var args = Array.prototype.slice.call(arguments, 0),
            obj
        
        if( typeof args[0] !== 'object' ) {
          // console.log( args[0], args[1], args[2], Gibber.Clock.time( args[2] ) )
          obj = new Gibberish[ type ]( args[0], args[1], Gibber.Clock.time( args[2] ), args[3], args[4], args[5], args[6] )
        }else if( name === 'Lines' ){
          obj = new Gibberish.Lines( args[0], args[1], args[2] )
        }else if( name === 'Ease' ){
          obj = new Gibberish.Ease( args[0], args[1], args[2], args[3], args[4] )
        }else if( name === 'Curve' ){ // not needed?
          obj = new Gibberish.Curve( args[0], args[1], args[2], args[3], args[4], args[5], args[6] )
        }else{
          obj = Gibber.construct( Gibberish[ type ], args[0] )
        }
        //obj.type = 'Env'
        obj.name = name
      
        $.extend( true, obj, Gibber.Audio.ugenTemplate )
        
        Gibber.createProxyProperties( obj, _mappingProperties[ name ] ) 
        
        if( name !== 'Lines' ) Gibber.processArguments2( obj, args, obj.name )
        
        if( name === '.' || name === 'ADSR' ) {
          Gibber.createProxyMethods( obj, ['run'] )
        }
        
        console.log( name + ' is created.' )
        return obj
      }
    })()
  }
  
  return Envelopes

}

},{"gibberish-dsp":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/gibberish-dsp/build/gibberish.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/fx.js":[function(require,module,exports){
module.exports = function( Gibber ) {
  "use strict"
  
  var FX = { Presets: {} },
      Gibberish = require( 'gibberish-dsp' ),
      $ = Gibber.dollar,
      curves = Gibber.outputCurves,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC
      
  // TODO: should this be completely moved into Gibberish? Is it useful inside there instead of just using Mul?
  Gibberish.Gain = function() {
  	Gibberish.extend(this, {
    	name: 'gain',
      type: 'effect',
    
      properties : {
        input  : 0,
        amount : 1, 
      },

      callback : function(input, amount) {
        if( typeof input === 'object' ) {
          input[0] *= amount
          input[1] *= amount
        }else{
          input *= amount
        }
    
        return input;
      }
    })
    .init()
    .processProperties(arguments);
  };
  Gibberish.Gain.prototype = Gibberish._effect;
  
  var types = [
    'Reverb',
    ['StereoReverb', 'StereoVerb'],
    'Delay',
    'Flanger',
    'Vibrato',
    'Distortion',
    'Biquad',
    'Gain',
    'Filter24',    
    [ 'RingModulation', 'RingMod' ],
    [ 'BufferShuffler', 'Schizo' ],
    [ 'Decimator', 'Crush' ],
    'Tremolo',
  ],
  _mappingProperties = {
    Reverb: {
      roomSize: {
        min: .5, max: .995,
        output: LINEAR,
        timescale: 'audio',
      },
      damping: {
        min: 0, max: 1,
        output: LINEAR,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
    },
    StereoReverb: {
      roomSize: {
        min: .5, max: .995,
        output: LINEAR,
        timescale: 'audio',
      },
      damping: {
        min: 0, max: 1,
        output: LINEAR,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
    },
    Delay : {
      feedback: {
        min: 0, max: 1,
        output: LINEAR,
        timescale: 'audio',
      },
      time : {
        min: 50, max: 88200, // TODO: Fix... problem with loading order, should be : Gibberish.context.sampleRate * 2,
        output: LINEAR,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
    },
    RingMod : {
      frequency : {
        min: 20, max: 3000,
        output: LINEAR,
        timescale: 'audio',
      },
      amp: {
        min: 0, max: 1,
        output: LINEAR,
        timescale: 'audio',
      },
      mix: {
        min: 0, max: 1,
        output: LINEAR,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
    },
    Flanger : {
      rate : {
        min: .01, max: 20,
        output: LOGARITHMIC,
        timescale: 'audio',
      },
      feedback: {
        min: 0, max: .99,
        output: LINEAR,
        timescale: 'audio',
      },
      amount: {
        min: 25, max: 300,
        output: LINEAR,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
    },
    Gain : {
      amount: {
        min: 0, max: 1,
        output: LINEAR,
        timescale: 'audio',
      },
    },
    Vibrato : {
      rate : {
        min: .2, max: 8,
        output: LOGARITHMIC,
        timescale: 'audio',
      },
      amount: {
        min: 25, max: 300,
        output: LINEAR,
        timescale: 'audio',
      },
      feedback: {
        min: .45, max: .55,
        output: LINEAR,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
    },
    Filter24 : {
      cutoff : {
        min: 0, max: .7,
        output: LINEAR,
        timescale: 'audio',
      },
      resonance: {
        min: 0, max: 5.5,
        output: LINEAR,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
    },
    LPF : {
      cutoff : {
        min: 0.05, max: .7,
        output: LINEAR,
        timescale: 'audio',
      },
      resonance: {
        min: 0, max: 5.5,
        output: LINEAR,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
    },
    HPF : {
      cutoff : {
        min: 0, max: .7,
        output: LINEAR,
        timescale: 'audio',
      },
      resonance: {
        min: 0, max: 5.5,
        output: LINEAR,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
    },
    Crush : {
      bitDepth : {
        min: 1, max: 16,
        output: LINEAR,
        timescale: 'audio',
      },
      sampleRate: {
        min: 0, max: 1,
        output: LINEAR,
        timescale: 'audio',
      },
      amp: {
        min: 0, max: 1,
        output: LOGARITHMIC,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
    },
    Schizo: {
      amp: {
        min: 0, max: 1,
        output: LOGARITHMIC,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
    },
    Tremolo: {
      amp: {
        min: 0, max: 1,
        output: LOGARITHMIC,
        timescale: 'audio',
      },
      frequency : {
        min: .05, max: 20,
        output: LOGARITHMIC,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
    }
  };
  
  for( var i = 0; i < types.length; i++ ) {
  
    (function() {
      var type = Array.isArray( types[ i ] ) ? types[ i ][ 0 ] : types[ i ],
          name = Array.isArray( types[ i ] ) ? types[ i ][ 1 ] : types[ i ]
     
      FX[ name ] = function() {
        var args = Array.prototype.slice.call(arguments, 0),
            obj
            
        obj = new Gibberish[ type ]()
        obj.type = 'FX'
        obj.name = name
      
        $.extend( true, obj, Gibber.Audio.ugenTemplate )
        
        Gibber.createProxyProperties( obj, _mappingProperties[ name ] ) 
        
        Gibber.createProxyMethods( obj, [ 'send' ] )
        
        Gibber.processArguments2( obj, args, obj.name )
        
        if( name === 'Delay' ) obj.rate = Gibber.Clock
        
        args.input = 0
        
        obj.toString = function() { return '> ' + name }
        
        if( obj.presetInit ) obj.presetInit() 
        return obj
      }
    })()
  }
  
  FX.Chorus = function( rate, feedback, amount ) {
  	var _rate = rate || 1, 
    	  _amount = amount || ms( 1 ),
        _feedback = feedback || 0,
    	  that = Flanger( _rate, _feedback, _amount, ms( 1 ) * 30 )
      
  	that.name = 'Chorus'
    that.type = 'FX'
    
  	return that
  }
  
  FX.LPF = function( cutoff, resonance ) {
    var _cutoff = isNaN(cutoff) ? .2 : cutoff,
        _resonance = isNaN( resonance ) ? 3.5 : resonance, 
        that = Filter24( _cutoff, _resonance, true )
    
  	that.name = 'LPF'
    that.type = 'FX'
    
  	return that
  }
  
  FX.HPF = function( cutoff, resonance ) {
  	var _cutoff = isNaN( cutoff ) ? .25 : cutoff,
        _resonance = isNaN( resonance ) ? 3.5 : resonance, 
        that = Filter24( _cutoff, _resonance, true )
    
    that.isLowPass = false
  	that.name = 'HPF'
    that.type = 'FX'
    
  	return that
  }
  
  FX.Presets.Schizo = {
		sane: {
			chance: .1,
			reverseChance: 0,
			pitchChance: .5,
			mix:.5,
		},
		borderline: {
			chance: .1,		
			pitchChance: .25,
			reverseChance: .5,
			mix: 1,
		},
		paranoid: {
			chance: .2,
			reverseChance: .5,
			pitchChance: .5,
			mix: 1,
		},
	};
  
  FX.Presets.Reverb = {
  	space : {
  		roomSize: .99,
  		damping: .23,
  		wet: .75,
  		dry: .25,
  	},
    small : {
      roomSize: .6,
      damping: .75,
      wet: .15,
      dry: .85,
    },
    medium: {
      roomSize: .8,
      damping: .5,
      wet: .35,
      dry: .65,
    },
    large: {
      roomSize: .85,
      damping: .3,
      wet: .55,
      dry: .45,
    }
  }
  
  FX.Presets.StereoVerb = {
  	space : {
  		roomSize: .99,
  		damping: .23,
  		wet: .75,
  		dry: .25,
  	},
    small : {
      roomSize: .6,
      damping: .75,
      wet: .15,
      dry: .85,
    },
    medium: {
      roomSize: .8,
      damping: .5,
      wet: .35,
      dry: .65,
    },
    large: {
      roomSize: .85,
      damping: .3,
      wet: .55,
      dry: .45,
    }
  }
  
  FX.Presets.Crush = {
    clean: {
      sampleRate:1,
      bitDepth:16
    },
    dirty:{
      sampleRate:.25,
      bitDepth:4
    },
    filthy:{
      sampleRate:.1,
      bitDepth:2.5
    }
  }

  return FX  
}
},{"gibberish-dsp":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/gibberish-dsp/build/gibberish.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/gibber_freesound2.js":[function(require,module,exports){
module.exports = function( freesound ) {
  freesound.setToken('6a00f80ba02b2755a044cc4ef004febfc4ccd476')

  var Freesound = function() {
    var sampler = Sampler();

    var key = arguments[0] || 96541;
    var callback = null;
    var filename, request;

    sampler.done = function(func) {
      callback = func
    }

    var onload = function(request) {
      Gibber.log('Freesound file ' + filename + " loaded." )
      Gibber.Audio.Core.context.decodeAudioData(request.response, function(buffer) {
        Freesound.loaded[filename] = buffer.getChannelData(0)
        sampler.buffer = Freesound.loaded[filename];
        sampler.bufferLength = sampler.buffer.length;
        sampler.isLoaded = true;
        //sampler.end = sampler.bufferLength;
        sampler.setBuffer(sampler.buffer);
        sampler.setPhase(sampler.bufferLength);
        sampler.filename = filename;
        sampler.length = sampler.bufferLength;
        //self.setPhase( self.length )
        //self.setBuffer( buffer )
        sampler.isPlaying = true;
        //self.buffers[ filename ] = buffer;
        Gibber.Audio.Core.audioFiles[sampler.filename] = buffer;
        sampler.buffers[ sampler.filename ] = buffer;       //
        sampler.file = filename
        sampler.send( Master, 1 )
        if (callback) {
          callback()
        }
      }, function(e) {
        console.log("Error with decoding audio data" + e.err)
      })
    }

    // freesound query api http://www.freesound.org/docs/api/resources.html
    if (typeof key === 'string') {
      var query = key;
      Gibber.log('searching freesound for ' + query)
      // textSearch: function(query, options, success, error){ 
        // search: function(query, page, filter, sort, num_results, fields, sounds_per_page, success, error
      //freesound.search(query, /*page*/ 0, 'duration:[0.0 TO 10.0]', 'rating_desc', null, null, null,
      freesound.textSearch( query, { page:1 },// page:0, filter: 'duration:[0.0 TO 10.0]', sort:'rating_desc' }, 
        function(sounds) {
          //console.log("SOUNDS", typeof sounds, sounds )
          sounds = JSON.parse( sounds )
          filename = sounds.results[0].name
          var id = sounds.results[0].id

          if (typeof Freesound.loaded[filename] === 'undefined') {

            freesound.getSound( id, function( val ){ 
              var request = new XMLHttpRequest(),
                  dict    = JSON.parse( val ),
                  path    = dict.previews['preview-hq-mp3']

              //Gibber.log("now downloading " + filename + ", " + sounds.sounds[0].duration + " seconds in length")
              request.open('GET', path, true) //"?&api_key=" + freesound.apiKey, true);
              request.responseType = 'arraybuffer';
              //request.withCredentials = true;
              request.onload = function( v ) {
                onload(request)
              };
              request.send();

              console.log( 'freesound path:', path, request )
            }, null )
          } else {
            sampler.buffer = Freesound.loaded[filename];
            sampler.filename = filename;
            sampler.bufferLength = sampler.buffer.length;
            sampler.isLoaded = true;
            sampler.end = sampler.bufferLength;
            sampler.setBuffer(sampler.buffer);
            sampler.setPhase(sampler.bufferLength);

            sampler.send(Master, 1)
            if (callback) {
              callback()
            }
          }
        }, function() {
          displayError("Error while searching...")
        }
      );
    } else if (typeof key === 'object') {
      var query = key.query,
          filter = key.filter || "",
          sort = key.sort || 'rating_desc',
          page = key.page || 0;
      
      pick = key.pick || 0

      Gibber.log( 'Searching freesound for ' + query )

      filter += ' duration:[0.0 TO 10.0]'
      freesound.textSearch(query, null, 
        function( soundsJSON ) {
          var soundsDict = JSON.parse( soundsJSON )
          if (soundsDict.count > 0) {
            var num = 0;

            if (typeof key.pick === 'number') {
              num = key.pick
            } else if (typeof key.pick === 'function') {
              num = key.pick();
            } else if (key.pick === 'random') {
              num = rndi(0, soundsDict.results.length - 1);
            }
            
            var result = soundsDict.results[ num ]
            filename = result.name 
            var id = result.id

            if (typeof Freesound.loaded[filename] === 'undefined') {
              if (typeof Freesound.loaded[filename] === 'undefined') {

                freesound.getSound( id, function( val ){ 
                  var request = new XMLHttpRequest(),
                  dict    = JSON.parse( val ),
                  path    = dict.previews['preview-hq-mp3']

                  request.open('GET', path, true) //"?&api_key=" + freesound.apiKey, true);
                  request.responseType = 'arraybuffer';
                  request.onload = function( v ) {
                    onload(request)
                  };
                  request.send();
                }, null )
              } else {
                sampler.buffer = Freesound.loaded[filename];
                sampler.filename = filename;
                sampler.bufferLength = sampler.buffer.length;
                sampler.isLoaded = true;
                sampler.end = sampler.bufferLength;
                sampler.setBuffer(sampler.buffer);
                sampler.setPhase(sampler.bufferLength);

                sampler.send(Master, 1)
                if (callback) {
                  callback()
                }
              }
            } else {
              Gibber.log('using exising loaded sample ' + filename)
              sampler.buffer = Freesound.loaded[filename];
              sampler.bufferLength = sampler.buffer.length;
              sampler.isLoaded = true;
              sampler.end = sampler.bufferLength;
              sampler.setBuffer(sampler.buffer);
              sampler.setPhase(sampler.bufferLength);

              sampler.send(Master, 1)
              if (callback) {
                callback()
              }
            }
          } else {
            Gibber.log("No Freesound files matched your query.")
          }
        }, function() {
          console.log("Error while searching...")
        }
      );
    } else if (typeof key === 'number') {
      Gibber.log( 'Searching for and downloading sound #' + key + ' from Freesound...' )
      var id = filename = key 
      //Freesound.getSoundByID( key )
      if (typeof Freesound.loaded[filename] === 'undefined') {

        freesound.getSound( id, function( val ){ 
          var request = new XMLHttpRequest(),
          dict    = JSON.parse( val ),
          path    = dict.previews['preview-hq-mp3']

          
          request.open('GET', path, true) //"?&api_key=" + freesound.apiKey, true);
          request.responseType = 'arraybuffer';
          
          request.onload = function( v ) {
            onload(request)
          };
          request.send();
        }, null )
      } else {
        sampler.buffer = Freesound.loaded[filename];
        sampler.filename = filename;
        sampler.bufferLength = sampler.buffer.length;
        sampler.isLoaded = true;
        sampler.end = sampler.bufferLength;
        sampler.setBuffer(sampler.buffer);
        sampler.setPhase(sampler.bufferLength);

        sampler.send(Master, 1)
        if (callback) {
          callback()
        }
      }
    }
    return sampler;
  }
  Freesound.getSoundByID = function( id  ){
    Gibber.log('downloading sound #' + id + ' from freesound.org')
    freesound.getSound( id,
      function( soundJSON ) {
        var soundDict = JSON.parse( soundJSON ),
            path = soundDict.previews['preview-hq-mp3']

        filename = soundDict.name

        request = new XMLHttpRequest();
        request.open('GET', path, true);
        request.responseType = 'arraybuffer';
        request.onload = function() {
          onload(request)
        };
        request.send();
      },
      function( err ) { console.log( 'ERROR with id', err ) }
    )

  }
  Freesound.loaded = {};

  return Freesound
}

},{}],"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/oscillators.js":[function(require,module,exports){
module.exports = function( Gibber ) {
  "use strict"
  
  var $ = Gibber.dollar,
      Oscillators = { Presets: {} },
      Gibberish = require( 'gibberish-dsp' ),
      curves = Gibber.outputCurves,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC
  
  var types = [
    'Sine',
    'Triangle',
    'Saw',
    'Square',
    'Noise',
    'PWM',
  ],
  mappingProperties = {
    frequency: {
      min: 50, max: 3200,
      hardMin:.01, hardMax:22050,
      output: LOGARITHMIC,
      timescale: 'audio',
      dimensions:1
    },
    amp: {
      min: 0, max: 1,
      hardMax:2,
      output: LOGARITHMIC,
      timescale: 'audio',
      dimensions:1
    },
    pulsewidth : {
      min: 0.01, max: .99,
      output: LINEAR,
      timescale: 'audio',
      dimensions:1
    },
    out: {
      min: 0, max: 1,
      output: LINEAR,
      timescale: 'audio',
      dimensions:1
    },
    pan: { min: -1, max: 1, output: LOGARITHMIC, timescale: 'audio',},   
    note: { 
      min: 50, max: 3200, 
      hardMin:.01, hardMax:22050,
      output: LOGARITHMIC, 
      timescale: 'audio', 
      doNotProxy:true 
    },
  }
  
  for( var i = 0; i < types.length; i++ ) {
    !function() {
      var type = Array.isArray( types[ i ] ) ? types[ i ][ 0 ] : types[ i ],
          name = Array.isArray( types[ i ] ) ? types[ i ][ 1 ] : types[ i ]

      Oscillators[ name ] = function() {
        var oscillator = new Gibberish[ type ]().connect( Gibber.Master ),
            args = Array.prototype.slice.call( arguments, 0 )
           
        oscillator.type = 'Gen'
        $.extend( true, oscillator, Gibber.Audio.ugenTemplate )
        
        oscillator.fx.ugen = oscillator
        
        Object.defineProperty(oscillator, '_', {
          get: function() { 
            oscillator.kill();
            return oscillator 
          },
          set: function() {}
        })
        
        if( typeof oscillator.note === 'undefined' ) {
          oscillator.note = function( pitch ) {
            var freq = this.frequency()
            if( typeof freq === 'number' || typeof freq === 'function' ) {
              this.frequency = typeof pitch === 'function' ? pitch() : pitch
            }else{
              freq[ 0 ] = pitch
            }
          }
        }
        
        oscillator.name = name
        
        Gibber.createProxyProperties( oscillator, mappingProperties )

        var proxyMethods = [ 'note','send' ]
        
        if( name === 'Sampler' ) { proxyMethods.push( 'pickBuffer' ) }
        
        Gibber.createProxyMethods( oscillator, proxyMethods )

        Gibber.processArguments2( oscillator, args, name )

        oscillator.toString = function() { return '> ' + name }
        
        return oscillator
      }
    }()
  }
  
  // $script.ready('gibber', function() {
  // 
  // })
  
  Oscillators.Wavetable = function( table ) {
    var oscillator = new Gibberish.Table().connect( Gibber.Master )
    if( table ) oscillator.setTable( table )
    
    oscillator.type = 'Gen'

    $.extend( true, oscillator, Gibber.Audio.ugenTemplate )

    oscillator.fx.ugen = oscillator
    
    Object.defineProperty(oscillator, '_', {
      get: function() { 
        oscillator.kill();
        return oscillator 
      },
      set: function() {}
    })
    
    if( typeof oscillator.note === 'undefined' ) {
      oscillator.note = function( pitch ) {
        var freq = this.frequency()
        if( typeof freq === 'number' || typeof freq === 'function' ) {
          this.frequency = typeof pitch === 'function' ? pitch() : pitch
        }else{
          freq[ 0 ] = pitch
        }
      }
    }
    
    Gibber.createProxyProperties( oscillator, {
      frequency: {
        min: 50, max: 3200,
        output: LOGARITHMIC,
        timescale: 'audio',
        dimensions:1
      },
      amp: {
        min: 0, max: 1,
        output: LOGARITHMIC,
        timescale: 'audio',
        dimensions:1
      },
      out: {
        min: 0, max: 1,
        output: LINEAR,
        timescale: 'audio',
        dimensions:1
      },
    })
    
    Gibber.createProxyMethods( oscillator, ['note'] )
    
    oscillator.toString = function() { return '> Wavetable' }
    return oscillator
  }
  
  Oscillators.Grains = function() {
    var props = typeof arguments[0] === 'object' ? arguments[0] : arguments[1],
        bufferLength = props.bufferLength || 88200,
        a,
        //a/ = Sampler().record( props.input, bufferLength ),
        oscillator
    
    if( props.input ) {
      a = Sampler().record( props.input, bufferLength )
    }else if( props.buffer ) {
      bufferLength = props.buffer.length
    }
    
    if(typeof arguments[0] === 'string') {
      var preset = Gibber.Presets.Grains[ arguments[0] ]
      if( typeof props !== 'undefined') $.extend( preset, props )
      oscillator = new Gibberish.Granulator( preset )
    }else{
      oscillator = new Gibberish.Granulator( props )
    }
  
    oscillator.loop = function(min, max, time, shouldLoop) {
      var curPos = this.position
  		min = isNaN(min) ? .25 : min;
  		max = isNaN(max) ? .75 : max;
  		time = isNaN(time) ? Gibber.Clock.time( 1 ) : Gibber.Clock.time( time );
	
  		shouldLoop = typeof shouldLoop === "undefined" ? true : shouldLoop;
    
      this.position = new Gibberish.Line( min, max, time, shouldLoop )
  
  		var mappingObject = this;
  		if(shouldLoop === false) {
  			future( function() { mappingObject.position = curPos }, Gibber.Clock.time( time ) );
  		}
      
      return oscillator
  	}
    
    if( a ){
      future( function() {
    	  oscillator.setBuffer( a.getBuffer() );
        oscillator.connect()
    	  oscillator.loop( 0, 1, bufferLength ); // min looping automatically
    
        a.disconnect()
      }, bufferLength + 1)
    }else{
      oscillator.connect()
      oscillator.loop( 0, 1, bufferLength );
    }
    
    oscillator.type = 'Gen'

    $.extend( true, oscillator, Gibber.Audio.ugenTemplate )

    oscillator.fx.ugen = oscillator

    Object.defineProperty(oscillator, '_', {
      get: function() { 
        oscillator.disconnect(); 
        return oscillator 
      },
      set: function() {}
    })
    
    oscillator.toString = function() { return 'Grains' }
    return oscillator
  }
  
  Oscillators.Presets.Grains = {
  	tight : {
  		numberOfGrains : 10,
  		grainSize : 44 * 25,
  		positionMin : -.05,
      positionMax : .05,
      speedMin : -.1,
      speedMax : .1,
  		shouldReverse : false,
  	},
  	cloudy : {
  		numberOfGrains : 20,
  		positionMin : -.25,
      positionMax : .25,
      speedMin : -.1,
      speedMax : 4,
  		grainSize : 44 * 100,
  		shouldReverse : true,
  	},
    flurry : {
      speed:2,
      speedMin:-2,
      speedMax:2,
      position:0,
      positionMin:0,
      positionMax:0,
      numberOfGrains:20,
      grainSize : 44 * 25,
    },  
  }
  
  return Oscillators
}

},{"gibberish-dsp":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/gibberish-dsp/build/gibberish.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/postprocessing.js":[function(require,module,exports){
module.exports = function( Gibber ) {
  "use strict";
  var loadBuffer = function(ctx, filename, callback) {
    var request = new XMLHttpRequest();
    request.open("GET", filename, true);
    request.responseType = "arraybuffer";
    request.onload = function() {
      Gibberish.context.decodeAudioData( request.response, function(_buffer) {
        callback( _buffer )
      }) 
    };
    request.send();
  }
  
  var compressor = null, 
      Gibberish,
      end = null,
      hishelf = null,
      lowshelf = null,
      postgraph = null,
      masterverb = null;
  
  var PP = Gibber.AudioPostProcessing = {
    initialized: false,    
    getPostgraph : function() { return postgraph },

    init : function() {
      if( !this.initialized ) {
        Gibberish = Gibber.Audio.Core
        postgraph = [ Gibberish.node, Gibberish.context.destination ]
        this.initialized = true
        $.subscribe( '/gibber/clear', PP.clear.bind( this ) )
      }
    },
    
    clear : function() {
      this.disconnectGraph()
      postgraph = [ Gibberish.node, Gibberish.context.destination ]
      this.connectGraph()
    },
    
    disconnectGraph: function() {
      for( var i = 0; i < postgraph.length - 1; i++ ) {
        postgraph[ i ].disconnect( postgraph[ i + 1 ] )
      }
    },
    
    connectGraph : function() {
      for( var i = 0; i < postgraph.length - 1; i++ ) {
        postgraph[ i ].connect( postgraph[ i + 1 ] )
      }
    },
    
    insert: function( node, position ) { 
      if( typeof position !== 'undefined' ) {
        if( position > 0 && position < postgraph.length - 1 ) {
          PP.disconnectGraph()
          postgraph.splice( position, 0, node )
        }else{
          console.error( 'Invalid position for inserting into postprocessing graph: ', position )
          return
        }
      }else{
        PP.disconnectGraph()
        postgraph.splice( 1, 0, node )
      }
      
      PP.connectGraph()
    },
    
    Compressor : function( position ) {
      if( compressor === null ) {
        
        PP.init()
        
        compressor = Gibberish.context.createDynamicsCompressor()
        
        var _threshold = compressor.threshold,
            _ratio     = compressor.ratio,
            _attack    = compressor.attack,
            _release    = compressor.release
            
        Object.defineProperties( compressor, {
          threshold: {
            get: function()  { return _threshold.value },
            set: function(v) { _threshold.value = v }
          },
          ratio: {
            get: function()  { return _ratio.value },
            set: function(v) { _ratio.value = v }
          },
          attack: {
            get: function()  { return _attack.value },
            set: function(v) { _attack.value = v }
          },
          release: {
            get: function()  { return _release.value },
            set: function(v) { _release.value = v }
          },
        }) 
        
        PP.insert( compressor, position )
      }
      
      return compressor
    },
    
    MasterVerb: function( verb ) {
      if( masterverb === null ) {
        if( typeof verb === 'undefined' ) verb = 'smallPlate'
        
        masterverb = Gibberish.context.createConvolver();
        masterverb.impulseName = verb
        
        loadBuffer( Gibberish.context, 'resources/impulses/' + verb + '.wav', function( _buffer ) {
          masterverb.buffer = _buffer
        })
        
        //postgraph[ 0 ].connect( masterverb, 2, 0 )
        //postgraph[ 0 ].connect( masterverb, 3, 1 )        
        
        Gibberish.reverbOut.connect( masterverb )
        
        masterverb.gainNode = Gibberish.context.createGain()
        
        masterverb.gainNode.connect( Gibberish.context.destination )
        masterverb.connect( masterverb.gainNode )
        
        Object.defineProperty( masterverb, 'gain', {
          get: function() { 
            return masterverb.gainNode.gain.value
          },
          set: function(v) {
            masterverb.gainNode.gain.value = v
          }
        })
        
        masterverb.gain = .2
        //175314__recordinghopkins__large-dark-plate-01.wav
      }else if( verb !== masterverb.impulseName ) {
        loadBuffer( Gibberish.context, 'resources/impulses/' + verb + '.wav', function( _buffer ) {
          masterverb.impulseName = verb
          masterverb.buffer = _buffer
        })
      }
      
      return masterverb
    },
    
    LowShelf : function( position ) {
      if( lowshelf === null ) {
        lowshelf = Gibberish.context.createBiquadFilter()
            
        lowshelf.type = 3 // lowshelf
        lowshelf.frequency.value = 220
        lowshelf.Q.value = 0
        lowshelf.gain.value = 6
        
        var _gain       = lowshelf.gain,
            _frequency  = lowshelf.frequency,
            _Q          = lowshelf.Q
            
            
        Object.defineProperties( lowshelf, {
          frequency: {
            get: function()  { return _frequency.value },
            set: function(v) { _frequency.value = v }
          },
          gain: {
            get: function()  { return _gain.value },
            set: function(v) { _gain.value = v }
          },
          Q: {
            get: function()  { return _Q.value },
            set: function(v) { _Q.value = v }
          },
        })
        
        PP.insert( lowshelf, position )
      }
      
      return lowshelf
    },
     
    HiShelf : function( position ) {
      if( hishelf === null ) {
        hishelf = Gibberish.context.createBiquadFilter()
            
        hishelf.type = 4 // hishelf
        hishelf.frequency.value = 880
        hishelf.Q.value = 0
        hishelf.gain.value = 6
        
        var _gain       = hishelf.gain,
            _frequency  = hishelf.frequency,
            _Q          = hishelf.Q
            
        Object.defineProperties( hishelf, {
          frequency: {
            get: function()  { return _frequency.value },
            set: function(v) { _frequency.value = v }
          },
          gain: {
            get: function()  { return _gain.value },
            set: function(v) { _gain.value = v }
          },
          Q: {
            get: function()  { return _Q.value },
            set: function(v) { _Q.value = v }
          },
        })
        
        PP.insert( hishelf, position )
      }
      
      return hishelf
    },
  }
  
  return PP
}
},{}],"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/sampler.js":[function(require,module,exports){
module.exports = function( Gibber ) { 
  "use strict"
  
  var Samplers = { Presets:{} },
      Gibberish = require( 'gibberish-dsp' ),
      $ = Gibber.dollar,
      Clock = require('./clock')( Gibber ),
      curves = Gibber.outputCurves,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC

  var mappingProperties = {
    amp: {
      min: 0, max: 1,
      hardMax:2,
      output: LOGARITHMIC,
      timescale: 'audio',
      dimensions:1
    },
    start: {
      min: 0, max: 1,
      output: LINEAR,
      timescale: 'audio',
      dimensions:1
    },
    end: {
      min: 0, max: 1,
      output: LINEAR,
      timescale: 'audio',
      dimensions:1
    },
    pitch: {
      min: 1, max: 4,
      hardMin: .01, hardMax: 20,      
      output: LOGARITHMIC,
      timescale: 'audio',
    },
    out: {
      min: 0, max: 1,
      output: LINEAR,
      timescale: 'audio',
      dimensions:1
    },
    pan: { min: -1, max: 1, output: LOGARITHMIC, timescale: 'audio',},   
    note: { 
      min: .1, max: 4, 
      output: LOGARITHMIC, 
      timescale: 'audio', 
      doNotProxy:true 
    },
  }
  
  Samplers.Sampler = function() {
    var args = Array.prototype.slice.call( arguments, 0 ),
        file = args[0] && args[0].file ? args[0].file : undefined,
        oscillator, buffer, name = 'Sampler'
        
      if( args[0] && args[0].buffer ) { buffer = args[0].buffer }
      if( buffer ) {
        oscillator = new Gibberish.Sampler({ 'buffer':buffer }).connect( Gibber.Master )
      }else{
        oscillator = new Gibberish.Sampler( file ).connect( Gibber.Master )
      }

      oscillator.type = 'Gen'
      $.extend( true, oscillator, Gibber.Audio.ugenTemplate )
      
      oscillator.fx.ugen = oscillator
      
      Object.defineProperty(oscillator, '_', {
        get: function() { 
          oscillator.kill();
          return oscillator 
        },
        set: function() {}
      })
      
      if( typeof oscillator.note === 'undefined' ) {
        oscillator.note = function( pitch ) {
          var freq = this.frequency()
          if( typeof freq === 'number' || typeof freq === 'function' ) {
            this.frequency = typeof pitch === 'object' ? pitch.value : pitch
          }else{
            freq[ 0 ] = pitch
          }
        }
      }

      var oldStart = oscillator.__lookupSetter__('start').bind( oscillator ),
          __start = 0
      
      Object.defineProperty(oscillator, 'start', {
        configurable: true,
        get: function() { 
          return __start 
        },
        set: function(v) {
          if( typeof v === 'number' ) {
            // if( v <= 1 ) {
            //   __start = v * oscillator.length
            // }else{
            //   __start = v
            // }
            __start = v
          }else{ 
            __start = v
          }
          oldStart( __start )
          // oscillator.setPhase( __start ) // TODO: HACK! Why doesn't this work automatically?
          
          return __start
        }
      })
      
      var oldEnd = oscillator.__lookupSetter__('end').bind( oscillator ),
          __end = 1
      Object.defineProperty(oscillator, 'end', {
        configurable:true,
        get: function() { 
          return __end 
        },
        set: function(v) {
          if( typeof v === 'number' ) {
            __end = v
          }else{
            __end = v
          }
          oldEnd( __end )
          //oscillator.setPhase( __end ) // TODO: HACK! Why doesn't this work automatically?
          
          return __end
        }
      })
       
      Gibber.createProxyProperties( oscillator, mappingProperties )

      var proxyMethods = [ 'note', 'pickBuffer', 'switchBuffer', 'range' ]
      
      Gibber.createProxyMethods( oscillator, proxyMethods )

      Gibber.processArguments2( oscillator, args, name )
      
      oscillator.toString = function() { return name }
      
      return oscillator
  }
  
  Gibberish.Sampler.prototype.readFile = function( file ) {
    var that = this
    if( file.isFile ) {
      file.file( function( file ) {
        that.readFile( file )
      })
      return
    }
    var reader = new FileReader()
    
    reader.readAsArrayBuffer( file );

    reader.onload = function (event) {
      Gibberish.context.decodeAudioData( reader.result, function(_buffer) {
        var buffer = _buffer.getChannelData(0)
        that.setBuffer( buffer )
  			that.length = buffer.length
        that.buffers[ file.name ] = buffer
    
        that.isPlaying = true;
			
        //console.log("LOADED", file.name, buffer.length);
  			Gibberish.audioFiles[ file.name ] = buffer;
	
        if(that.onload) that.onload();
  
        if(that.playOnLoad !== 0) that.note( that.playOnLoad );
  
  			that.isLoaded = true;
      })
    }
  }
  
  Gibberish.Sampler.prototype.ondrop = function( files ) {
    for( var i = 0; i < files.length; i++ ) {
      ( function(_that) { 
        var file = files[ i ],
            reader = new FileReader(),
            that = _that, item;
        
        item = file.webkitGetAsEntry ? file.webkitGetAsEntry() : file
        
        if( item.isDirectory ) {
          var dirReader = item.createReader()
      		dirReader.readEntries( function( entries ){
      			var idx = entries.length;
      			while(idx--){
      				_that.readFile( entries[idx] );
      			}	
      		})
        }else{
          _that.readFile( item )
        }
      })( this )
    }
  }
  
  Gibberish.Sampler.prototype.pickBuffer = function() {
    this.switchBuffer( rndi( 0, this.getNumberOfBuffers() ) )
  }
  
  Gibberish.Sampler.prototype.record = function(input, recordLength) {
    this.isRecording = true;
    console.log( 'starting recording' )
    var self = this;

    this.recorder = new Gibberish.Record(input, Gibber.Clock.time( recordLength ), function() {
      console.log( 'recording finished' )
      self.setBuffer( this.getBuffer() );
      self.length = self.getBuffer().length;
      self.setPhase( self.length )
      self.isRecording = false;
    })
    .record();

    return this;
  };
  
  Gibberish.Sampler.prototype.done = function( func ) {
    this.onload =  func
    return this
  }
  
  Gibberish.Sampler.prototype.load = function( url ) {
    var xhr = new XMLHttpRequest(), initSound
        
    xhr.open( 'GET', url, true )
    xhr.responseType = 'arraybuffer'
    xhr.onload = function( e ) { initSound( this.response, url ) }
    xhr.send()
    
    //console.log("now loading sample", url )
    xhr.onerror = function( e ) { console.error( "Sampler file loading error", e )}
    
    var self = this, buffer, bufferLength = 0, phase = 0
        
    function initSound( arrayBuffer, filename ) {
      Gibber.Audio.Core.context.decodeAudioData( arrayBuffer, function( _buffer ) {
        var buffer = _buffer.getChannelData(0)
  			self.length = buffer.length
        self.setPhase( self.length )
        self.setBuffer( buffer )
        self.isPlaying = true;
  			self.buffers[ filename ] = buffer;
        self.file = filename

        //console.log("sample loaded | ", filename, " | length | ", buffer.length );
  			Gibberish.audioFiles[ filename ] = buffer;
			
        if(self.onload) self.onload();
      
        if(self.playOnLoad !== 0) self.note( self.playOnLoad );
      
  			self.isLoaded = true;
      }, function(e) {
        console.log('Error decoding file', e);
      }); 
    };
    
    return this
  }
  
  Gibberish.Sampler.prototype.loadDir = function( dir ) {
    var xhr = new XMLHttpRequest(), initSound
        
    xhr.open( 'GET', dir, true )
    xhr.responseType = 'html'
    xhr.onload = function( e ) { loadDir( this.response, dir ) }
    xhr.send()
    
    console.log("now loading directory", dir )
    xhr.onerror = function( e ) { console.error( "Error loading directory", e )}
    
    var self = this
        
    function loadDir( response, dir ) {       
        var page = $( response ),
            links = $( page ).find( 'a' )
        
        for( var i = 0; i < links.length; i++ ) {
          var link = links[ i ],
              split = link.href.split( '/' ),
              url   = split[ split.length - 1 ]
              
          if( url !== '' && url !== '.DS_Store' && url !== 'node-ecstatic' ) {
            self.load( dir + '/' + url )
          }
        }
    };
    
    return this
  }
  

  Samplers.Looper = function(input, length, numberOfLoops) {
  	var that = Bus();
    $.extend( that, {
      children : [],
      input : input,
      length : Clock.time(length),
      numberOfLoops : numberOfLoops,
      pitch : 1,
      currentLoop : 0,
      loop : function() {
        that.children[ that.currentLoop ].record( that.input, that.length );
    
        var seq = {
          target: that.children[ that.currentLoop ],
          durations: that.length,
          key:'note',
          values: [ 1 ] 
        }

        that.seq.add( seq )
        that.seq.start()
        
        future(that.nextLoop, length);

        return that;
      },
      nextLoop : function() {
    		that.children[++that.currentLoop].record(that.input, that.length);
    		if(that.currentLoop < that.numberOfLoops - 1) {
    			future(that.nextLoop, length);
    		}
        var seq = {
          target: that.children[ that.currentLoop ],
          durations: that.length,
          key:'note',
          values: [ 1 ] 
        }

        that.seq.add( seq )
    	},
    })
    
    var __pitch = 1
    Object.defineProperty( that, 'pitch', {
      configurable:true,
      get: function() {
        return __pitch
      },
      set: function(v) {
        __pitch = v
        for( var i = 0; i < that.children.length; i++ ) {
          that.children[ i ].pitch = __pitch
        }
      }
    })
    
  	for(var i = 0; i < numberOfLoops; i++) {
  		that.children.push( Sampler({ pitch:that.pitch })._ );	
  		that.children[i].send(that, 1);
  	}
    
    Gibber.createProxyProperties( that, { pitch:mappingProperties.pitch } )
        
    that.stop = function() { that.seq.stop(); }
    that.play = function() { that.seq.start(); }
	
  	return that;
  }
  
  return Samplers
}

},{"./clock":"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/clock.js","gibberish-dsp":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/gibberish-dsp/build/gibberish.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/score.js":[function(require,module,exports){
/*
Score is a Seq(ish) object, with pause, start / stop, rewind, fast-forward.
It's internal phase is 

Score has start() method to start it running. next() advances to next element,
regardless of whether or not the score is running, and stats the transport running.
rewind() moves the score index to the first position.
*/

/*
Passed Timing           Result
=============           ======
Numeric literal         place function in timeline and store reference
a Function              callback. register to receive and advance. must use pub/sub.
Score.wait             pause until next() method is called
*/

module.exports = function( Gibber ) {

"use strict"

var Gibberish = require( 'gibberish-dsp' ),
    $ = Gibber.dollar

var ScoreProto = {
  start: function() { 
    if( !this.codeblock ) {
      this.connect()
    }
    this.isPaused = false
  
    return this
  },
  stop:  function() { 
    this.isPaused = true  
    return this
  },
  
  loop: function( loopPause ) {
    this.loopPause = loopPause || 0
    this.shouldLoop = !this.shouldLoop
    
    return this
  },
  
  pause: function() {
    this.isPaused = true
    
    return this
  },
  
  next: function() {
    if( !this.codeblock ) {
      this.connect()
    }
    this.isPaused = false
    
    return this
  },
}

var proto = new Gibberish.ugen()

$.extend( proto, ScoreProto )

var Score = function( data, opts ) {
  if( ! ( this instanceof Score ) ) {
    var args = Array.prototype.slice.call( arguments, 0 )
    return Gibber.construct( Score, args )
  }
  
  if( typeof opts === 'undefined' ) opts = {}
  
  this.timeline = []
  this.schedule = []
  this.shouldLoop = false
  this.loopPause = 0
  
  for( var i = 0; i < data.length; i+=2 ) {
    this.schedule.push( data[ i ] )
    this.timeline.push( data[ i+1 ] )    
  }
  
  var phase = 0, 
      index = 0,
      timeline = this.timeline,
      schedule = this.schedule,
      self = this,
      loopPauseFnc = function() {
        self.nextTime = phase = 0
        index = -1
        self.timeline.pop()
      }
      
  $.extend( this, {
    properties: { rate: 1, isPaused:true, nextTime:0  },
    name:'score',
    getIndex: function() { return index },
    callback : function( rate, isPaused, nextTime ) {
      if( !isPaused ) {
        if( phase >= nextTime && index < timeline.length ) {
          
          var fnc = timeline[ index ],
              shouldExecute = true
                    
          index++
          
          if( index <= timeline.length - 1 ) {
            var time = schedule[ index ]
            
            if( typeof time === 'number' && time !== Score.wait ) {
              self.nextTime = phase + time
            }else{
              if( time === Score.wait ) {
                self.isPaused = true
              }else if( time.owner instanceof Score ) {
                self.isPaused = true
                time.owner.oncomplete.listeners.push( self )
                // shouldExecute = false // doesn't do what I think it should do... 
              }
            }
          }else{
            if( self.shouldLoop ) {
              if( timeline[ timeline.length - 1 ] !== loopPauseFnc ) {
                timeline.push( loopPauseFnc )
              }
              self.nextTime = phase + self.loopPause
            }else{
              self.isPaused = true
            }
            self.oncomplete()
          }
          if( shouldExecute && fnc ) {
            if( fnc instanceof Score ) {
              if( !fnc.codeblock ) {
                fnc.start()
                console.log("STARTING SCORE")
              }else{
                fnc.rewind().next()
                //fnc.rewind().next()
                //fnc()
              }
            }else{
              fnc()
            }
          }
        }
        phase += rate
      }
      return 0
    },
    rewind : function() { 
      phase = index = 0 
      this.nextTime = this.schedule[ 0 ]
      return this
    },
    oncomplete: function() {
      // console.log("ON COMPLETE", this.oncomplete.listeners )
      var listeners = this.oncomplete.listeners
      for( var i = listeners.length - 1; i >= 0; i-- ) {
        var listener = listeners[i]
        if( listener instanceof Score ) {
          listener.next()
        }
      }
    }
  })
  
  this.oncomplete.listeners = []
  this.oncomplete.owner = this
  
  this.init()
  
  this.nextTime = this.schedule[ 0 ]
  
  var _rate = this.rate,
      oldRate  = this.__lookupSetter__( 'rate' )
   
  Object.defineProperty( this, 'rate', {
    get : function() { return _rate },
    set : function(v) {
      _rate = Mul( Gibber.Clock, v )
      oldRate.call( this, _rate )
    }
  })
  
  this.rate = this.rate // trigger meta-programming tie to master clock
  
  Gibber.createProxyProperties( this, {
    rate : { min: .1, max: 2, output: 0, timescale: 'audio' },
  })
}

Score.prototype = proto

Score.wait = -987654321
Score.combine = function() {
  var score = [ 0, arguments[ 0 ] ]
  
  for( var i = 1; i < arguments.length; i++ ) {
    var timeIndex = i * 2,
        valueIndex = timeIndex +  1,
        previousValueIndex = timeIndex - 1

    score[ timeIndex  ] = score[ previousValueIndex ].oncomplete
    score[ valueIndex ] = arguments[ i ]
  }
  
  return Score( score )
}

return Score

}

/*
a = Score([
  0, console.log.bind( null, 'test1'),
  seconds(.5),console.log.bind( null, 'test2'),
  Score.wait, null,
  seconds(.5),console.log.bind( null, 'test3'),
  seconds(.5),console.log.bind( null, 'test4'),
  seconds(.5),function() { a.rewind(); a.next() }
])

b = Score([
  100, console.log.bind(null,"B"),
  100, console.log.bind(null,"F"),  
  a.oncomplete, function() {
  	console.log("C")
  }
])
.start()

a.start()

-----
a = Score([
  0, console.log.bind( null, 'test1'),
  seconds(.5),console.log.bind( null, 'test2'),
  
  Score.wait, null,
  
  seconds(.5),console.log.bind( null, 'test3'),
  
  seconds(.5), Score([
    0, console.log.bind(null,"A"),
    beats(2), console.log.bind(null,"B")
  ]),
  
  Score.wait, null,
  
  seconds(.5),function() { a.rewind(); a.next() }
]).start()

-----
synth = Synth('bleep')
synth2 = Synth('bleep', {maxVoices:4})

// you need to uncomment the line below after the kick drum comes in
// and execute it

score.next()

score = Score([
  0, synth.note.score( 'c4', 1/4 ),
  
  measures(1), synth.note.score( ['c4','c5'], 1/8 ),
  
  measures(1), synth.note.score( ['c2','c3','c4','c5'], 1/16 ),
  
  measures(1), function() {
    kick = Kick().note.seq( 55,1/4 )
  },
  
  Score.wait, null,
  
  0, synth2.note.score('bb4',1/4 ),
  
  measures(1), synth2.chord.score( [['bb4','g4']], 1/4 ),
  
  measures(2), synth2.chord.score( [['c5','f4']], 1/4 ),
  
  measures(2), function() {
    synth2.chord.seq( [['eb4','bb4','d5']], 1/6 )
    synth2.note.seq.stop()
    synth2.fx.add( Delay(1/9,.35) )
    
    synth2.fadeOut(32)
  },
  
  measures(4), function() {
    ks = Pluck()
    	.note.seq( Rndi(100,600), 1/16 )
    	.blend.seq( Rndf() )
    	.fx.add( Schizo('paranoid') )
    
    Clock.rate = Line( 1, 1.1, 8 )
  },
  
  measures(8), function() {
		Master.fadeOut( 8 )
  },
  
  measures(8), Gibber.clear
  
]).start()

------

synth = Synth('bleep')

verse =  Score([ beats(1/2), synth.note.bind( synth, 'c4' ) ])
chorus = Score([ beats(1/2), synth.note.bind( synth, 'd4' ) ])
bridge = Score([ beats(1/2), synth.note.bind( synth, 'e4' ) ])

song = Score([
  0,                 verse,
  verse.oncomplete,  chorus,
  chorus.oncomplete, verse,
  verse.oncomplete,  chorus,
  chorus.oncomplete, bridge,
  bridge.oncomplete, chorus  
])

song.start()

*/
},{"gibberish-dsp":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/gibberish-dsp/build/gibberish.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/seq.js":[function(require,module,exports){
module.exports = function( Gibber ) {
  //"use strict"
  
  var Gibberish = require( 'gibberish-dsp' ),
      $ = Gibber.dollar,
      doNotSequence = [ 'durations', 'target', 'scale', 'offset', 'doNotStart', 'priority' ]
  
  var makeChordFunction = function( notes, obj ) {
    var _note = $.extend( [], notes ),
        count = 0

    return [function() {
      var idx, freq
    
      if( typeof _note.pick === 'function' ) {
        idx =  _note[ _note.pick() ] 
      }else if( typeof _note[ count ] === 'function') {
        idx = _note[ count ]()
      }else{
        idx = _note[ count++ ]
      }
      
      if( typeof obj.scale.notes[ idx ] === 'number' ) {
        freq = obj.scale.notes[ idx ]
      }else{
        if( typeof idx === 'undefined' ) return // rest
        try{
          freq = obj.scale.notes[ idx ].fq()
        }catch(e) {
          console.error( "The frequency could not be obtained from the current scale. Did you specify an invalid mode or root note?")
          obj.stop()
        }
      }          
      //freq = typeof obj.scale.notes[ idx ] === 'number' ? obj.scale.notes[ idx ] : obj.scale.notes[ idx ].fq()			
      if( count >= _note.length ) count = 0
			
      return freq
    }]
  }
  
  var Seq = function() {
    var obj = {}, seq, hasScale, keyList = []
    
    if( typeof arguments[0]  === 'object' && ! Array.isArray( arguments[0] ) ) {
      var arg = arguments[0],
          durationsType = typeof arg.durations,
          targetsType = typeof arg.target,
          priority = arg.priority,
          hasScale
      
      obj.target = arg.target
            
      if( typeof arg.scale === 'object' )  obj.scale = arg.scale
      if( typeof arg.offset === 'number' ) obj.offset = Gibber.Clock.time( arg.offset )
      
      // if( durationsType === 'object') {
      //   obj.durations = arg.durations
      // }else if( durationsType !== 'undefined') {
      //   obj.durations = [ arg.durations ]
      // }else{ }
      obj.durations = arg.durations 
            
      obj.keysAndValues = {}
      obj.seqs = []
      obj.autofire = []

      if( obj.durations ) {
        if( !Array.isArray( obj.durations) ) { obj.durations = [ obj.durations ] }
        
        var durationsPattern = Gibber.construct( Gibber.Pattern, obj.durations )
        
        if( obj.durations.randomFlag ) {
          durationsPattern.filters.push( function() { 
            var idx = Gibber.Utilities.rndi(0, durationsPattern.values.length - 1)
            return [ durationsPattern.values[ idx ], 1, idx ] 
          })
          for( var i = 0; i < obj.durations.randomArgs.length; i+=2 ) {
            durationsPattern.repeat( obj.durations.randomArgs[ i ], obj.durations.randomArgs[ i + 1 ] )
          }
        }
      }
      
      for( var _key in arg ) {
        !function() {
          var key = _key
          if( doNotSequence.indexOf( key ) === -1 ) {
            var isArray = Array.isArray( arg[key] )// $.type( arg[ key ] )
          
            var _seq = {
              key: key,
              target: obj.target,
              durations: durationsPattern,
            }
          
            var valuesPattern
            if( isArray ) {
              valuesPattern = Gibber.construct( Gibber.Pattern, arg[ key ] )
            }else if( typeof arg[ key ] !== 'undefined' ) {
              valuesPattern = Gibber.construct( Gibber.Pattern, [ arg[ key ] ] )//[ arg[ key ] ]
            }
          
            if( arg[ key ].randomFlag ) {
              valuesPattern.filters.push( function() {
                var idx = Gibber.Utilities.rndi(0, valuesPattern.values.length - 1)
                return [ valuesPattern.values[ idx ], 1, idx ] 
              })
              for( var i = 0; i < arg[ key ].randomArgs.length; i+=2 ) {
                valuesPattern.repeat( arg[ key ].randomArgs[ i ], arg[ key ].randomArgs[ i + 1 ] )
              }
            }
            
            //if( key === 'note' ) {
            //  valuesPattern.filters.push( function() { 
            //    var output = arguments[ 0 ][ 0 ]
            //    if( typeof output === 'number' && output < Gibber.minNoteFrequency ) {
            //      if( obj.scale ) {
            //        output = obj.scale.notes[ output ]
            //      }else{
            //        output = Gibber.scale.notes[ output ]
            //      }
            //    }
                
            //    return [ output, arguments[0][1], arguments[0][2] ] 
            //  })
            //}
            
            _seq.values = valuesPattern
            
            _seq.stop = function() { _seq.shouldStop = true } 
    
            // TODO: property specific stop/start/shuffle etc. for polyseq
            _seq.start = function() {
              _seq.shouldStop = false
              seq.timeline[0] = [ _seq ]                
              seq.nextTime = 0
      
              if( !seq.isRunning ) { 
                seq.start( false, priority )
              }
            }
    
            _seq.repeat = function( numberOfTimes ) {
              var repeatCount = 0
      
              var filter = function( args, ptrn ) {
                if( args[2] % (ptrn.getLength() - 1) === 0 && args[2] !== 0) {
                  repeatCount++
                  if( repeatCount === numberOfTimes ) {
                    ptrn.seq.stop()
                  }
                }
                return args
              }
      
              valuesPattern.filters.push( filter )
            }
            
            valuesPattern.seq = _seq
            //durationsPattern.seq = _seq 
            
            obj.seqs.push( _seq )
            keyList.push( key )
          }
        }()
      }
      
      if( 'scale' in obj ) {
        var noteIndex = keyList.indexOf( 'note' ),
            chordIndex = keyList.indexOf( 'chord' )
            
        //var makeNoteFunction = function( notes, obj ) {

        // if( noteIndex > -1 ) {
        //   obj.seqs[ noteIndex ].values = makeNoteFunction( obj.seqs[ noteIndex ].values, obj )
        // }
        
        if( chordIndex > -1 ) {
          var _chord = $.extend( [], obj.seqs[ chordIndex ] ),
              count = 0
              
          obj.seqs[ chordIndex ] = [ function() {
            var idxs, chord = []
          
            if( typeof _chord.pick === 'function' ) {
              idxs =  _chord[ _chord.pick() ] 
            }else if( typeof _chord[ count ] === 'function') {
              idxs = _chord[ count ]()
            }else{
              idxs = _chord[ count++ ]
            }
            
            chord = obj.scale.chord( idxs )
          
            if ( count >= _chord.length) count = 0
          
            return chord
          }]
        }
      }  
    }else if( typeof arguments[0] === 'function' || Array.isArray( arguments[0] ) ){
      obj.seqs = [{
        key:'functions',
        values: Array.isArray( arguments[0] ) ? arguments[0] : [ arguments[ 0 ] ],
        durations: Gibber.Clock.time( arguments[ 1 ] )
      }]
      if( typeof arguments[1] === 'function' || Array.isArray( arguments[1] ) ) {
        obj.seqs[0].durations = arguments[ 1  ]
      }
      keyList.push('functions')
    }
      
    seq = new Gibberish.PolySeq( obj )
    seq.timeModifier = Gibber.Clock.time.bind( Gibber.Clock )
		seq.name = 'Seq'
    seq.save = {}
    
    seq.oldShuffle = seq.shuffle
    delete seq.shuffle
    
    seq.rate = Gibber.Clock
    var oldRate  = seq.__lookupSetter__( 'rate' )
    
    var _rate = seq.rate 
    Object.defineProperty( seq, 'rate', {
      get : function() { return _rate },
      set : function(v) {
        _rate = Mul( Gibber.Clock, v )
        oldRate.call( seq, _rate )
      }
    })

    var nextTime = seq.nextTime,
        oldNextTime = seq.__lookupSetter__('nextTime')
    Object.defineProperty( seq, 'nextTime', {
      get: function() { return nextTime },
      set: function(v) { nextTime = Gibber.Clock.time( v ); oldNextTime( nextTime ) }
    })
    
    var offset = seq.offset
    Object.defineProperty( seq, 'offset', {
      get: function() { return offset },
      set: function(v) { offset = v; seq.nextTime += offset }
    })
    seq.nextTime += seq.offset
    
    for( var i = 0; i < keyList.length; i++ ) {
      (function(_seq) {
        var key = keyList[ i ],
            _i  = i

        Object.defineProperty( _seq, key, {
          get: function() { return _seq.seqs[ _i ].values },
          set: function(v) {
            // if( key === 'note' && _seq.scale ) {
            //   v = makeNoteFunction( v, _seq )
            // }
            _seq.seqs[ _i ].values = v  
          }
        })
      })(seq)
    }
    
    var _durations = durationsPattern
    Object.defineProperty( seq, 'durations', {
      get: function() { return _durations },
      set: function(v) {
        _durations = v
        for( var i = 0; i < seq.seqs.length; i++ ) {
          var _seq = seq.seqs[i]
          _seq.durations = _durations
        }
      }
    })
    
    if( arguments[0] && ! arguments[0].doNotStart ) {
      seq.start( true )
    }
    
    seq.toString = function() { return '> Seq' }
    seq.gibber = true
     
    $.extend( seq, {
      constructor: Seq,
      replaceWith: function( replacement ) { this.kill() },
      kill: function() { 
        if( this.target && this.target.sequencers )
          this.target.sequencers.splice( this.target.sequencers.indexOf( this ), 1 )
      
          console.log("SEQ KILL", this )
        this.stop().disconnect()
        
        Seq.children.splice( Seq.children.indexOf( this ), 1 )
      },
      applyScale : function() {
        // for( var i = 0; i < this.seqs.length; i++ ) {
        //   var s = this.seqs[ i ]
        //   if( s.key === 'note' || s.key === 'frequency' ) {
        //     s.values = makeNoteFunction( s.values, this )
        //   }
        // }
      },
      once : function() {
        this.repeat( 1 )
        return this
      },
      reset : function() {
        for( var i = 0; i < this.seqs.length; i++ ) {  
          this.seqs[ i ].values[0].reset()
        }
      },
      shuffle : function() {
        for( var i = 0; i < this.seqs.length; i++ ) {
          this.seqs[ i ].values[0].shuffle()
        }
      },
      // repeat : function( numberOfTimes ) { 
      //   var repeatCount = 0
      //   
      //   var filter = function( args, ptrn ) {
      //     if( args[2] % (ptrn.getLength() - 1) === 0 && args[2] !== 0) {
      //       ptrn.seq.stop()
      //     }
      //     return args
      //   }
      //   
      // }
    })
    
    Seq.children.push( seq )
    
    return seq
  }
  
  Seq.children = []
  
  var ScaleSeq = function() {
    var args = arguments[0],
        scale
    
    args.root = args.root || 'c4'
    args.mode = args.mode || 'aeolian'
    
    scale = Gibber.Theory.Scale( args.root, args.mode )
    
    delete args.root; delete args.mode
    
    args.scale = scale
    
    return Seq( args )
  }
  
  var Seqs = { 'Seq': Seq, 'ScaleSeq':ScaleSeq }
  
  return Seqs 
}

},{"gibberish-dsp":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/gibberish-dsp/build/gibberish.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/soundfont.js":[function(require,module,exports){
module.exports = function( Gibber, pathToSoundFonts ) {
  var Gibberish = require( 'gibberish-dsp' ),
      curves = Gibber.outputCurves,
      teoria = require( './theory' )( Gibber ).Teoria,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC,
      mappingProperties = {
        amp: {
          min: 0, max: 1,
          hardMax:2,
          output: LOGARITHMIC,
          timescale: 'audio',
          dimensions:1
        },
        loudness: {
          min: 0, max: 1,
          hardMax:2,
          output: LOGARITHMIC,
          timescale: 'audio',
          dimensions:1
        },
        pan: {
          min:-1, max:1,
          output: LINEAR,
          timescale: 'audio',
          dimensions:1
        }
      },
      cents = function(base, _cents) {
        return base * Math.pow(2,_cents/1200)
      },
      sensibleNames;
  
  sensibleNames = {
    piano : 'acoustic_grand_piano',
    guitar: 'electric_guitar_clean',
    bass  : 'acoustic_bass',
    organ : 'rock_organ',
    brass : 'synth_brass_1',
    strings:'synth_strings_1',
    choir : 'choir_aahs',
  }
  
  var SoundFont = function( soundFontName ) {
    var obj, path = SoundFont.path

    if( Gibber.Environment ) {
      if( Gibber.Environment.Storage.values.soundfonts ) {
        if( Gibber.Environment.Storage.values.soundfonts[ soundFontName ] ) {
          path = Gibber.Environment.Storage.values.soundfonts[ soundFontName ]
        }
      }
    }
    
    if( sensibleNames[ soundFontName ] ) soundFontName = sensibleNames[ soundFontName ];

    obj = new Gibberish.SoundFont( arguments[0], path ).connect( Gibber.Master )

    $.extend( true, obj, Gibber.Audio.ugenTemplate )
    obj.fx.ugen = obj
    obj.chord = Gibber.Theory.chord
    
    Object.defineProperty(obj, '_', {
      get: function() { 
        obj.kill();
        return obj 
      },
      set: function() {}
    })
    
    obj.onload = function() {
      
      if( Gibber.Environment && Gibber.Environment.Storage.values.saveSoundFonts ) {
        if( !Gibber.Environment.Storage.values.soundfonts ) {
          Gibber.Environment.Storage.values.soundfonts = {}
        }else{
          if( Gibber.Environment.Storage.values.soundfonts[ soundFontName] ) return
        }
        
        Gibber.Environment.Storage.values.soundfonts[ soundFontName ] = Gibber.Audio.Core.SoundFont.storage[ soundFontName ]
        
        try{
          Gibber.Environment.Storage.save()
        }catch(e){
          console.log("STORAGE ERROR", e )
          
          if( e.name === 'QuotaExceededError' ) {
            console.log('Your localStorage for Gibber has been exceeded; we can\'t save the soundfile. It is still usable.')
          }
        }
      }
    }
    
    obj._note = obj.note.bind( obj ) 
    obj.note = function( name, loudness ) {
      if( typeof name === 'number' ) {
        if( name < Gibber.minNoteFrequency ) {
          var scale = this.scale || Gibber.scale,
              note  = scale.notes[ name ]
              
          if( this.octave && this.octave !== 0 ) {
            var sign = this.octave > 0 ? 1 : 0,
                num  = Math.abs( this.octave )
            
            for( var i = 0; i < num; i++ ) {
              note *= sign ? 2 : .5
            }
          }
          
          name = note
        }
        var tNote = teoria.frequency.note( name ),
            noteName, _cents = 0
        
        if( tNote.note.accidental.value === 1 && tNote.note.accidental.sign !== 'b' ) { 
          var enharmonics = tNote.note.enharmonics()
          for( var i = 0; i < enharmonics.length; i++ ) {
            var enharmonic = enharmonics[ i ]
            if( enharmonic.accidental.sign === 'b' ) {
              tNote.note = enharmonic
              break;
            }
          }
        }
        
        _cents = tNote.cents 
        
        noteName =  tNote.note.name.toUpperCase() 
        if( tNote.note.accidental.value !== 0) {
          noteName += tNote.note.accidental.sign
        }
        noteName += tNote.note.octave
        
        name = noteName
      }else if( typeof name !== 'string' ) {
        return 
      }
      
      if( typeof loudness === 'undefined' ) loudness = this.loudness.value

      obj._note( name, loudness, cents(1, _cents) )
    }
    
    Gibber.createProxyProperties( obj, mappingProperties )
    Gibber.defineProperty( obj, 'loudness', true, true, { min: 0, max: 1, output: LOGARITHMIC, timescale: 'audio', perNote:true }, true, true )   
    Gibber.createProxyMethods( obj, [ 'note', 'chord', 'send' ] )
  
    return obj
  }
  
  SoundFont.path = pathToSoundFonts || "../../../resources/soundfonts/"
  
  return SoundFont
}

},{"./theory":"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/theory.js","gibberish-dsp":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/gibberish-dsp/build/gibberish.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/synths.js":[function(require,module,exports){
module.exports = function( Gibber ) {
  "use strict"
  
  function isInt(value) { return !isNaN(value) && (function(x) { return (x | 0) === x; })(parseFloat(value)) }
  
  var Synths = { Presets: {} },
      Gibberish = require( 'gibberish-dsp' ),
      $ = Gibber.dollar,
      Clock = require( './clock' )( Gibber ),
      curves = Gibber.outputCurves,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC

  var types = [
    [ 'PolySynth', 'Synth' ],
    [ 'PolyFM', 'FM' ],
    [ 'PolySynth2', 'Synth2' ],
    [ 'MonoSynth', 'Mono' ],
    [ 'PolyKarplusStrong', 'Pluck' ],
  ],
  _mappingProperties = {
    Synth: {
      note: { min: 50, max: 3200, output: LOGARITHMIC, timescale: 'audio', doNotProxy:true },
      frequency: { min: 50, max: 3200, output: LOGARITHMIC, timescale: 'audio' },
      amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',},
      pulsewidth :{ min: 0.01, max: .99, output: LINEAR, timescale: 'audio', perNote:true },
      attack: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio', perNote:true},
      decay: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio', perNote:true},
      sustain: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio', perNote:true},
      release: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio', perNote:true},
      pan: { min: -1, max: 1, output: LOGARITHMIC,timescale: 'audio', perNote:true,},
      sustainLevel: { min:.01, max: 1, output: LOGARITHMIC, timescale:'audio', perNote:true},
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },   
    },
    Synth2: {
      note: { min: 50, max: 3200, output: LOGARITHMIC, timescale: 'audio', doNotProxy:true },
      frequency: { min: 50, max: 3200, output: LINEAR, timescale: 'audio' },
      amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',},
      pulsewidth :{ min: 0.01, max: .99, output: LINEAR, timescale: 'audio', perNote:true },
      attack: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio', perNote:true},
      decay: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio', perNote:true},
      sustain: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio', perNote:true},
      release: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio', perNote:true},
      sustainLevel: { min:.01, max: 1, output: LOGARITHMIC, timescale:'audio', perNote:true},
      cutoff : { min: 0, max: .7, output: LINEAR, timescale: 'audio', perNote:true },
      resonance: { min: 0, max: 5.5, output: LINEAR, timescale: 'audio', perNote:true },
      pan: { min: -1, max: 1, output: LOGARITHMIC,timescale: 'audio', perNote:true,},
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },                
    },
    Mono: {
      note: { min: 50, max: 3200, output: LOGARITHMIC, timescale: 'audio', doNotProxy:true },
      frequency: { min: 50, max: 3200, output: LINEAR, timescale: 'audio' },
      amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',},
      pulsewidth :{ min: 0.01, max: .99, output: LINEAR, timescale: 'audio' },
      attack: { min:Clock.maxMeasures + 1, max: 176400, output: LOGARITHMIC, timescale:'audio'},
      decay: { min:Clock.maxMeasures + 1, max: 176400, output: LOGARITHMIC, timescale:'audio'},
      cutoff : { min: 0, max: .7, output: LINEAR, timescale: 'audio' },
      detune2: { min: 0, max: .15, output: LINEAR, timescale: 'audio' },
      detune3: { min: 0, max: .15, output: LINEAR, timescale: 'audio' },
      glide: { min:.99, max:.999995, output: LINEAR, timescale: 'audio'},
      resonance: { min: 0, max: 5.5, output: LINEAR, timescale: 'audio' },
      pan: { min: -1, max: 1, output: LOGARITHMIC,timescale: 'audio',},
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
    },
    FM: {
      note: { min: 50, max: 3200, output: LOGARITHMIC, timescale: 'audio', doNotProxy:true },
      frequency: { min: 50, max: 3200, output: LINEAR, timescale: 'audio' },
      amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',},
      attack: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio', perNote:true},
      decay: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio', perNote:true},
      sustain: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio', perNote:true},
      release: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio', perNote:true},
      sustainLevel: { min:.01, max: 1, output: LOGARITHMIC, timescale:'audio', perNote:true},  
      cmRatio : { min:.1, max:50, output:LINEAR, timescale:'audio', perNote:true },
      index: { min:.1, max:50, output:LINEAR, timescale:'audio', perNote:true },
      pan: { min: -1, max: 1, output: LOGARITHMIC,timescale: 'audio', perNote:true,},
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },     
    },
    Pluck: {
      note: { min: 50, max: 3200, output: LOGARITHMIC, timescale: 'audio', doNotProxy:true },    
      frequency: { min: 50, max: 3200, output: LINEAR, timescale: 'audio' },
      amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',},
      blend :{ min: 0, max: 1, output: LINEAR, timescale: 'audio', perNote:true },
      damping :{ min: 0, max: 1, output: LINEAR, timescale: 'audio', perNote:true },
      pan: { min: -1, max: 1, output: LOGARITHMIC,timescale: 'audio', perNote:true,},
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },     
    }
  }

  for( var i = 0; i < types.length; i++ ) {
  
    (function() {
      var type = Array.isArray( types[ i ] ) ? types[ i ][ 0 ] : types[ i ],
          name = Array.isArray( types[ i ] ) ? types[ i ][ 1 ] : types[ i ]

      Synths[ name ] = function() {
        var args = Array.prototype.slice.call( arguments, 0 ),
            obj,
            mv = 1,
            adsr = false,
            scale,
            requireReleaseTrigger = false,
            opts = {},
            optionsNum = typeof args[0] === 'string' ? 1 : 0
        
        Gibber.processArguments2( opts, args, name )
        
        for( var key in opts ) {
          if( Gibber.Audio.Clock.timeProperties.indexOf( key ) > -1 ) {
            opts[ key ] = Gibber.Clock.time( opts[key] )
          }
        }
        
        obj = new Gibberish[ type ]( opts ).connect( Gibber.Master )
        obj.type = 'Gen'
        
        $.extend( true, obj, Gibber.Audio.ugenTemplate )

        obj.fx.ugen = obj
        
        //Gibber.processArguments2( obj, args, name )        
        
        if( name === 'Vocoder' ) return obj
        
        if( name === 'Mono' ) {
          obj.note = function( _frequency, amp ) {
            if( typeof _frequency === 'undefined' ) return // rest
            if(typeof amp !== 'undefined' && amp !== 0) this.amp = amp;
              
            if( amp !== 0 ) {
              if(typeof this.frequency !== 'object' ){
                this.frequency = _frequency;
              }else{
                if( this.frequency.type !== 'property' ) {
                  this.frequency[0] = _frequency;
                  Gibberish.dirty(this);
                }else{
                  this.frequency = _frequency
                }
              }
              
              this.lastFrequency = this.frequency
              
              if( obj.envelope.getState() > 0 ) obj.envelope.run();
            }
          }
        }
        // override note method to allow note names
        obj._note = obj.note.bind( obj )
        obj.note = function() {
          var args = Array.prototype.slice.call( arguments, 0 ),
              freq
          
          if( typeof args[0] === 'undefined' ) return
          
          if( Array.isArray( args[0] ) ) {
            freq = args[0][0]
            freq = Gibber.Theory.processFrequency( obj, freq )
            args[0][0] = freq
          }else{
            args[0] = Gibber.Theory.processFrequency( obj, args[0] )
          }

          if( typeof args[1] === 'undefined' ) args[1] = this.loudness.value
          
          this._note.apply( this, args )
          this.processChildProperties()

          return this 
        }
        
        var propertyKeys = Object.keys( _mappingProperties[ name ] ), voiceIncr = 0
        obj.processChildProperties = function() {
          for( var i = 0; i < propertyKeys.length; i++ ) {
            var key = propertyKeys[ i ], name = key +'V', val
            if( this[ name ] && typeof this[ name ].value !== 'undefined' ) {
              if( Array.isArray( this[ name ].value ) ) {
                var propIndex = voiceIncr % this[ name ].value.length
                val = this[ name ].value[ propIndex ]
              }else if( typeof this[ name ].value === 'function' ) {
                val = this[ name ].value()   
              }else{
                val = this[ name ].value
              }

              this.children[ this.lastChild ][ key ] = val
            }
          }
          voiceIncr++
        }
        
        obj.chord = Gibber.Theory.chord.bind( obj )
      
        Object.defineProperty(obj, '_', {
          get: function() { obj.kill(); return obj },
          set: function() {}
        })
        
        //obj, _key, shouldSeq, shouldRamp, dict, _useMappings, priority
        Gibber.createProxyProperties( obj, _mappingProperties[ name ] )
        Gibber.defineProperty( obj, 'loudness', true, true, { min: 0, max: 1, output: LOGARITHMIC, timescale: 'audio'}, true, true )
        
        obj.trig = function() {
          this.note( this.lastFrequency )
        }
        
        Gibber.createProxyMethods( obj, [ 'note', 'chord', 'send', 'trig' ] )
                
        obj.name = name 
        
        //Object.assign( obj, opts )
        
        obj.toString = function() { return name }
        
        // define a continuous frequency mapping abstraction for all synths with children
        if( name !== 'Mono' ) {
          var __frequency = obj._frequency
          Object.defineProperty( obj, 'frequency', {
            configurable: true,
            get: function() { return this._frequency },
            set: function(v) { 
               __frequency = v;
               if( this.children ) {
                 for( var i = 0; i < this.children.length; i++ ) {
                   if( typeof this.children[i].frequency === 'number' ) {
                     this.children[i].frequency = __frequency
                   }else{
                     this.children[i].frequency[0] = __frequency // for binops
                   }
                 }
               }
            }
          })
        }
         
        var __scale = obj.scale;
        
        if( obj.scale ) obj.seq.scale = __scale
        
        Object.defineProperty(obj, 'scale', {
          get: function() { return __scale },
          set: function(v) {
            __scale = v;
            obj.seq.scale = __scale
          }
        })
        
        if( obj.presetInit ) obj.presetInit() 
        return obj
      }
    })()
  
  }
  
  Synths.Presets.Synth = {
  	short:  { attack: 44, decay: 1/16, },
  	bleep:  { waveform:'Sine', attack:44, decay:1/16 },
    bleepEcho: { waveform:'Sine', attack:44, decay:1/16, presetInit:function() { this.fx.add( Delay(1/6,.85 ) ) } },
    cascade: { waveform:'Sine', maxVoices:10, attack:Clock.maxMeasures, decay:Clock.beats(1/32),
      presetInit: function() { 
        this.fx.add( Gibber.Audio.FX.Delay(1/9,.2), Gibber.Audio.FX.Flanger() )
        this.pan = Sine( .25, 1 )._
      }
    },
    rhodes: { waveform:'Sine', maxVoices:4, attack:44, decay:1, 
      presetInit: function() { this.fx.add( Gibber.Audio.FX.Tremolo(2, .2) ) },
    },
    calvin: { waveform:'PWM',  maxVoices:4, amp:.075, attack:Clock.maxMeasures, decay:1/4,
      presetInit: function() { this.fx.add( Gibber.Audio.FX.Delay(1/6,.5), Gibber.Audio.FX.Vibrato() ) }  
    },
    warble: { waveform:'Sine', attack:Clock.maxMeasures,
      presetInit: function() { this.fx.add( Gibber.Audio.FX.Vibrato(2), Gibber.Audio.FX.Delay( 1/6, .75 ) ) } 
    },
  }
  
  Synths.Presets.Synth2 = {
    pad2: { waveform:'Saw', maxVoices:4, attack:1.5, decay:1/2, cutoff:.3, filterMult:.35, resonance:4.5, amp:.2, 
      presetInit: function() { this.fx.add( Gibber.Audio.FX.Delay( 1/9, .75 ) ) } 
    },
    pad4: { waveform:'Saw', maxVoices:4, attack:2, decay:2, cutoff:.3, filterMult:.35, resonance:4.5, amp:.2,
      presetInit: function() { this.fx.add( Gibber.Audio.FX.Delay( 1/9, .75 ) ) }
    },     
  }
  
  Synths.Presets.Mono = {
  	short : { attack: 44, decay: 1/16 },
  
  	lead : {
  		presetInit : function() { this.fx.add( Gibber.Audio.FX.Delay(1/4, .35), Gibber.Audio.FX.Reverb() ) },
  		attack: 1/8,
  		decay:1/2,
  		octave3:0,
  		cutoff:.2,
  		filterMult:.5,
  		resonance:5,
  		isLowPass: false,
  	},

  	winsome : {
  		presetInit : function() { 
        this.lfo = Gibber.Audio.Oscillators.Sine( 2, .075 )._
        this.cutoff = this.lfo
        this.detune2 = this.lfo
      },
  		attack: Clock.maxMeasures,
  		decay:1,
  		cutoff:.2,
  	},
  	bass : { 
      attack: Clock.maxMeasures,
  		decay:	1/8 - Clock.maxMeasures,
      octave: -2,
  		octave2 : -1,
  		cutoff: .5,
  		filterMult:.2,
  		resonance:1,
  	},
    bass2 : {
      attack: Clock.maxMeasures,
  		decay:	1/6,
      octave: -2,
  		octave2 : 0,
  		octave3 : 0,      
  		cutoff: .5,
  		filterMult:.2,
  		resonance:1,
      amp:.65
    },
    
    edgy: {
      presetInit: function() {
        this.decay = 1/8
        this.attack = ms(1)
      },
      octave: -2,
  		octave2 : -1,
  		cutoff: .5,
  		filterMult:.2,
      resonance:1, 
      waveform:'PWM', 
      pulsewidth:.2,
      detune2:0,
      amp:.2,
    },
  
  	easy : {
  		attack: Clock.maxMeasures,
  		decay:2,
  		octave2:0,
  		octave3:0,
  		cutoff:.3,
      glide:.9995,
  	},
    
  	easyfx : {
  		attack: Clock.maxMeasures,
  		decay:2,
      presetInit: function() {
        this.fx.add( Gibber.Audio.FX.Delay( Clock.time(1/6), .3) )
      },
      amp:.3,
  		octave2:0,
  		octave3:0,
  		cutoff:.3,
      glide:.9995,
  	},
  
    dark : {
      resonance:0,
      attack:44,
      cutoff:.075,
      amp:.35,
      filterMult:0
    },

    dark2 : {
      filterMult:.1,
      attack: Clock.maxMeasures,
      octave2:0,
      octave3:0,
      decay:1/4,
      amp:.45,
    },
    
    noise: {
      resonance:20,
      decay:1/2,
      cutoff:.3,
      glide:.99995,
      detune3:0,
      detune2:0,
      filterMult:0,
      presetInit: function() { this.fx.add( Gibber.Audio.FX.Gain(.1), Gibber.Audio.FX.Delay(1/6,.35) ) }
    },
  }
  
  Synths.Presets.FM = {
    stabs:{
      maxVoices:4,
			cmRatio : 1 / 1.0007,
			index	: 5,
			attack: Clock.maxMeasures,
			decay	: 1/8,
      amp:.1,
      presetInit: function() {
        this.bus = Gibber.Audio.Busses.Bus().fx.add( Gibber.Audio.FX.Delay(1/8,.75), Gibber.Audio.FX.LPF({ resonance:4 }) )
        this.bus.fx[1].cutoff = Gibber.Audio.Core.Binops.Add(.25, Gibber.Audio.Oscillators.Sine(.1,.2)._ )
        this.send( this.bus, .65 )
      },
    },
    bass : {
      cmRatio:1,
      index:3,
      presetInit: function() { this.attack = ms(1); },
      decay:1/16,
      octave:-2
    },
		glockenspiel : {
			cmRatio	: 3.5307,
			index 	: 1,
			attack	: 44,
			decay	: 44100,
		},
		radio : { //ljp
			cmRatio	: 1,
			index	: 40,
			attack	: 300 * 44.1,
			decay	: 500 * 44.1,
		},
		noise : { //ljp
			cmRatio	: 0.04,
			index	: 1000,
			attack	: 1 * 44.1,
			decay	: 100 * 44.1,
		},
		frog : { //ljp
			cmRatio	: 0.1,
			index	: 2.0,
			attack	: 300 * 44.1,
			decay	: 5 * 44.1,
		},
		gong : {
			cmRatio : 1.4,
			index	: .95,
			attack	: 44.1,
			decay	: 5000 * 44.1,
		},
		drum : {
			cmRatio : 1.40007,
			index	: 2,
			attack	: 44,
			decay	: 44100,
		},
		drum2 : {
			cmRatio: 1 + Math.sqrt(2),
			index: .2,
			attack: 44,
			decay: 20 * 44.1,
		},
		brass : {
      maxVoices:4,
			cmRatio : 1 / 1.0007,
			index	: 5,
			attack	: 4100,
			decay	: 1,
		},
		clarinet : {
			cmRatio	: 3 / 2,
			index	: 1.5,
			attack	: 50 * 44.1,
			decay	: 200 * 44.1,
		}
	};
  
  return Synths

}

},{"./clock":"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/clock.js","gibberish-dsp":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/gibberish-dsp/build/gibberish.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/theory.js":[function(require,module,exports){
module.exports = function( Gibber ) {
  "use strict"

var teoria = require('../../external/teoria.min'),
    $ = Gibber.dollar,
    isInt = function(value) { return !isNaN(value) && (function(x) { return (x | 0) === x; })(parseFloat(value)) }

var Theory = {
  Teoria: teoria,
  Scale : function( _root, _mode ) {
  	var that = {
  		root: typeof _root === "string" ? teoria.note(_root) : _root,
  		notes: [],
      degree:1,
		
  		chord : function(_notes, _offset) {
  			var _chord = [];
  			_offset = _offset || 0;
			  
        console.log("CHORD", _notes, this )
        
  			for(var i = 0; i < _notes.length; i++) {
  				_chord.push( this.notes[ _notes[i] + _offset ] );
  			}
  			return _chord;
  		},
		
  		create : function() {
        var __root = typeof root !== 'number' ? teoria.note( root ).fq() : root,
            __mode = mode
        
  			this.notes.length = 0
        
  			if( Gibber.Theory.Scales[ __mode ] ) {
  				var scale = Gibber.Theory.Scales[ __mode ]( __root )
  				scale.create( __root )// this.degree.value )
  				this.notes = scale.notes
  			}else{
  			  console.log( "No scale for the mode " + mode + " exists." )
  			}
  		},
		
  		set : function(__root, _mode) {
  			if(Array.isArray(arguments[0])) {
  				this.root = arguments[0][0];
  				this.mode = arguments[0][1];
  			}else{
  				this.root = __root;
  				this.mode = _mode;
  			}
  		},
  	};
	  
  	var mode = _mode || 'aeolian';
  	Object.defineProperty( that, 'mode', {
      configurable:true,
  		get: function() { return mode; },
  		set: function( val ) { 
        mode = val; 
        that.create(); 
      }	
  	});
    
    var root = _root || 440;
    Object.defineProperty( that, 'root', {
      get : function() { return root; },
      
      set : function( val ) { 
        if( typeof val === 'number' ) {
          root = val;
        }else if ( typeof val === 'string' ) {
          root = Theory.Teoria.note( val ).fq();
        }else if ( typeof val === 'object' ) {
          if( val.accidental ) {
            root = val.fq()
          }else{
            root = Theory.Teoria.note( val.value ).fq()
          }
        }
        
        that.create() 
      }
    });
    
    // createProxyProperty: function( obj, _key, shouldSeq, shouldRamp, dict, _useMappings ) {
    // obj, _key, shouldSeq, shouldRamp, dict, _useMappings, priority
    
    that.gibber = true // needed since createProxyProperties isn't called where this is normally set
                              // obj, _key, shouldSeq, shouldRamp, dict, _useMappings, priority 
    Gibber.createProxyProperty( that, 'root', true, false, null, false, 1 )
    Gibber.createProxyProperty( that, 'mode', true, false, null, false, 1 )
    //Gibber.defineSequencedProperty( that, 'root', 1 )
    //Gibber.defineSequencedProperty( that, 'mode', 1 )    
    // Gibber.createProxyProperty( that, 'degree', true, false, null, false, 1 )    
    
    $.subscribe( '/gibber/clear', function() {
      that.seq.isConnected = false
      that.seq.isRunning = false
      that.seq.destinations.length = 0
    })  
    
    that.create( root )
    //that.toString = function() { return 'Scale: ' + that.root() + ', ' + that.mode() }
  	return that;
  },
  
  CustomScale : function( _root, _ratios ) {
    var that = {
      notes : [],
      degree: 1,// ___degree || 1,
      ratios: _ratios || [ 1, 1.10, 1.25, 1.3333, 1.5, 1.666, 1.75 ],
	
      create : function( _root ) {
        this.notes = [];
        
        var scaleRoot = typeof _root === 'number' ? _root : teoria.note( _root ).fq() ;
        
        for( var octave = 0; octave < 8; octave++ ) {
          for( var num = 0; num < this.ratios.length; num++ ) {	
            var degreeNumber = num //+ _degree - 1
            var tempRoot = scaleRoot * ( 1 + Math.floor( degreeNumber / this.ratios.length ) )
            this.notes.push( tempRoot * this.ratios[ degreeNumber % this.ratios.length ] );
          }
          scaleRoot *= 2;
        }
      
        scaleRoot = typeof _root === 'number' ? _root : teoria.note( _root ).fq() ;
  	    var negCount = 8;
        for(var octave = -1; octave >= -8; octave--) {
          scaleRoot /= 2;
          for( var num = 0; num < this.ratios.length; num++ ) {
  		      var noteNum = octave * this.ratios.length + num;
            var degreeNumber = num //+ _degree - 1
            var tempRoot = scaleRoot * ( 1 + Math.floor( degreeNumber / this.ratios.length ) )
            this.notes[noteNum] = tempRoot * this.ratios[ degreeNumber % this.ratios.length ];
          }
        }	
      },
	
    	chord : function(_notes, _offset) {
    		var _chord = [];
    		_offset = _offset || 0;
			
    		for(var i = 0; i < _notes.length; i++) {
    			_chord.push( this.notes[_notes[i] + _offset] );
    		}
    		return _chord;
    	}
    }
    
    that.create( _root );
      
    return that;
  },
  
  Scales : {
    Major: function( root ) { return Theory.CustomScale( root, [1, 9/8, 5/4, 4/3, 3/2, 5/3, 15/8 ]) },
    Ionian: function( root ) { return Theory.CustomScale( root, [1, 9/8, 5/4, 4/3, 3/2, 5/3, 15/8 ]) },    
    Dorian: function( root ) { return Theory.CustomScale( root, [1, 9/8, 6/5, 4/3, 3/2, 5/3, 9/5 ]) },
    Phrygian: function( root ) { return Theory.CustomScale( root, [1, 16/15, 6/5, 4/3, 3/2, 8/5, 9/5 ]) },
    Lydian: function( root ) { return Theory.CustomScale( root, [1, 9/8, 5/4, 45/32, 3/2, 5/3, 15/8 ]) },
    Mixolydian: function( root ) { return Theory.CustomScale( root, [1, 9/8, 5/4, 4/3, 3/2, 8/5, 9/5 ]) },
    Minor: function( root ) { return Theory.CustomScale( root, [1, 9/8, 6/5, 4/3, 3/2, 8/5, 9/5 ]) },
    Aeolian : function( root ) { return Theory.CustomScale( root, [1, 9/8, 6/5, 4/3, 3/2, 8/5, 9/5 ]) },
    Locrian : function( root ) { return Theory.CustomScale( root, [1, 16/15, 6/5, 4/3, 62/45, 8/5, 15/8 ]) },
    MajorPentatonic : function( root ) { return Theory.CustomScale( root, [1, 9/8, 5/4, 3/2, 5/3 ] ) },
    MinorPentatonic : function( root ) { return Theory.CustomScale( root, [1, 6/5, 4/3, 3/2, 15/8] ) },
    Chromatic: function( root ) { return Theory.CustomScale( root, [1, 16/15, 9/8, 6/5, 5/4, 4/3, 45/32, 3/2, 8/5, 5/3, 7/4, 15/8 ]) },
  	// Scales contributed by Luke Taylor
  	// Half-Whole or Octatonic Scale
  	//http://en.wikipedia.org/wiki/Octatonic_scale
    
  	HalfWhole : function(root) { return Theory.CustomScale( root, [ 1,1.059463,1.189207,1.259921,1.414214,1.498307,1.681793, 1.781797 ]); },

  	//Whole-Half or Octatonic Scale http://en.wikipedia.org/wiki/Octatonic_scale
  	WholeHalf : function(root) { return Theory.CustomScale( root, [ 1,1.122462,1.189207,1.334840,1.414214,1.587401,1.681793, 1.887749 ]); },

  	//Pythagorean Tuning http://en.wikipedia.org/wiki/Pythagorean_tuning

  	//Chromatic scale in Pythagorean tuning
  	Pythagorean : function(root) { return Theory.CustomScale( root, [ 1, 256/243, 9/8, 32/27, 81/64, 4/3, 729/512, 3/2, 128/81, 27/16, 16/9, 243/128 ]); },

  	//Major Pythagorean
  	PythagoreanMajor : function(root) { return Theory.CustomScale( root, [ 1, 9/8, 81/64, 4/3, 3/2, 27/16, 243/128 ]); },

  	//Major Pythagorean
  	PythagoreanMinor : function(root) { return Theory.CustomScale( root, [ 1, 9/8, 32/27, 4/3, 3/2, 128/81, 16/9 ]); },
	
  	// 5-limit Just Intonation http://en.wikipedia.org/wiki/List_of_intervals_in_5-limit_just_intonation
  	//Chromatic scale in 5-limit just intonation
  	Limit5 : function(root) { return Theory.CustomScale( root, [ 1, 16/15, 9/8, 6/5, 5/4, 4/3, 45/32, 3/2, 8/5, 5/3, 9/5, 15/8 ]); },

  	//Major scale in 5-limit
  	Limit5Major : function(root) { return Theory.CustomScale( root, [ 1, 9/8, 5/4, 4/3, 3/2, 5/3, 15/8 ]); },

  	//Minor scale in 5-limit
  	Limit5Minor : function(root) { return Theory.CustomScale( root, [ 1, 9/8, 6/5, 4/3, 3/2, 8/5, 9/5 ]); },

  	// Messiaen's modes of limited transposition http://en.wikipedia.org/wiki/Modes_of_limited_transposition
  	Mess3 : function(root) { return Theory.CustomScale( root, [1,1.122462, 1.189207, 1.259921, 1.414214, 1.498307, 1.587401, 1.781797, 1.887749 ]) },
  	Mess4 : function(root) { return Theory.CustomScale( root, [1, 1.059463, 1.122462, 1.334840, 1.414214, 1.498307, 1.587401, 1.887749 ]) },
  	Mess5 : function(root) { return Theory.CustomScale( root, [1, 1.059463, 1.334840, 1.414214, 1.498307, 1.887749 ]) },
  	Mess6 : function(root) { return Theory.CustomScale( root, [1, 1.122462, 1.259921, 1.334840, 1.414214, 1.587401, 1.781797, 1.887749 ]) },
  	Mess7 : function(root) { return Theory.CustomScale( root, [1, 1.059463, 1.122462, 1.189207, 1.334840, 1.414214, 1.498307, 1.587401, 1.681793, 1.887749 ]) },

  	//And, a personal (anthony garcia) favorite synthetic mode, lydian flat 7:
  	Adams : function(root) { return Theory.CustomScale( root, [1, 1.122462, 1.259921, 1.414214, 1.498307, 1.681793, 1.781797 ]) },

  	//5 tone equal temperament //http://en.wikipedia.org/wiki/Equal_temperament#5_and_7_tone_temperaments_in_ethnomusicology
  	Equal5Tone : function(root) { return Theory.CustomScale( root, [ 1, 1.15, 1.32, 1.35, 1.52, 1.74 ]); },

  	//7 tone equal temperament
  	//http://en.wikipedia.org/wiki/Equal_temperament#5_and_7_tone_temperaments_in_ethnomusicology
  	Equal7Tone : function(root) { return Theory.CustomScale( root, [ 1, 1.1, 1.22, 1.35, 1.49, 1.64, 1.81 ]); },

  	Just : function(root) { return Theory.CustomScale( root, [ 1, 1.0417, 1.1250, 1.2000, 1.2500, 1.3333, 1.4063, 1.5, 1.6, 1.6667, 1.8, 1.8750] ); },
    
    Shruti: function(root) { return Theory.CustomScale( root, [1,256/243,16/15,10/9,9/8,32/27,6/5,5/4,81/64,4/3,27/20,45/32,729/512,3/2,128/81,8/5,5/3,27/16,16/9,9/5,15/8,243/128,2] ); },
  },
  
  processFrequency: function( obj, frequency ) {
    var note = frequency
    if( typeof frequency === 'string' ) {
      note = Gibber.Theory.Teoria.note( frequency ).fq()
    }else if( frequency < Gibber.minNoteFrequency ) {
      var scale = obj.scale || Gibber.scale,
          noteValue = frequency,
          isNoteInteger = isInt( noteValue ),
          note
      
      if( isNoteInteger ) {                      
        note  = scale.notes[ frequency  ]
      }else{
        var noteFloor = scale.notes[ Math.floor( noteValue )  ],
            noteCeil  = scale.notes[ Math.ceil( noteValue )  ],
            float = noteValue % 1,
            diff = noteCeil - noteFloor
        
        note = noteFloor + float * diff
      }
          
      if( obj.octave && obj.octave !== 0 ) {
        var sign = obj.octave > 0 ? 1 : 0,
            num  = Math.abs( obj.octave )
        
        for( var i = 0; i < num; i++ ) {
          note *= sign ? 2 : .5
        }
      }
    }
    
    return note
  },
  
	chord : function( val, volume ) {
		this.notation = val;
			
		if( typeof this.notation === "string" ) {
			var _root = this.notation.slice( 0,1 ),
          _octave, 
          _quality;
          
			if( isNaN( this.notation.charAt( 1 ) ) ) { 	// if true, then there is a sharp or flat...
				_root += this.notation.charAt( 1 );	// ... so add it to the root name
				_octave = parseInt( this.notation.slice( 2,3 ) );
				_quality = this.notation.slice( 3 );
			}else{
				_octave = parseInt( this.notation.slice( 1, 2 ) );
				_quality = this.notation.slice( 2 );
			}
		
			var _chord = teoria.note( _root + _octave ).chord( _quality );
			for( var j = 0; j < _chord.notes.length; j++ ) {
				var n = _chord.notes[ j ];
				this.note( typeof note === 'number' ? note : n.fq() );
			}
    }else{
			for( var k = 0; k < this.notation.length; k++ ) {
				var _note = this.scale ? this.scale.notes[ this.notation[k] ] : this.notation[ k ],
            note

        switch( typeof _note ) {
          case 'number':
            note = _note
            break;
          case 'object':
            if( _note.fq )
              note = _note.fq()
            else
              note = _note
              
            break;
          case 'string':
            note = Theory.Teoria.note( _note ).fq();
            break;
        }
        
        this.note( note )
			}
		}

		if( typeof arguments[ 1 ] !== "undefined" ) {
			this.amp = arguments[ 1 ];
		}
	
		return this;
	}
 
}

return Theory

}

},{"../../external/teoria.min":"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/external/teoria.min.js"}],"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/ugen.js":[function(require,module,exports){
module.exports = function( Gibber ) {

var Ugen = function( desc ) {
  var ctor = function( props ) {
    var obj = {}
    $.extend( obj, {
      properties: $.extend( {}, desc.inputs ),
      callback: desc.callback.bind( obj ),
      _init: desc.init.bind( obj ),
      name: desc.name
    })

    obj.__proto__ = Gibber.Audio.Core._synth
    
    if( typeof props === 'object' ) {
      for( var key in props ) {
        obj[ key ] = props[ key ]
      }
    }
    
    var doNotCopy = ['name','inputs','callback','init'], methods = []

    for( var key in desc ) {
      if( doNotCopy.indexOf( key ) === -1 ) {
        obj[ key ] = desc[ key ].bind( obj )
        methods.push( key )
      }
    }

    obj.init.call( obj )
    obj.oscillatorInit.call( obj )

    Gibber.createProxyProperties( obj, obj.properties )
    Gibber.createProxyMethods( obj, methods )

    for( var key in desc.inputs ) {
      if( typeof props === 'object' && props[ key ] ) {
        obj[ key ] = props[ key ]
      }else{
        obj[ key ] = desc.inputs[ key ].default
      }
    }  

    obj._init()
    
    obj.connect( Gibber.Master )
	  
    if( arguments.length > 0 )
      Gibber.processArguments2( obj, Array.prototype.slice.call( arguments, 0), obj.name )
  
    $.extend( true, obj, Gibber.Audio.ugenTemplate )
    obj.fx.ugen = obj
  
    return obj
  }

  return ctor
}

return Ugen

}

/*

// create constructor for XXX object using ugen factory
// this code would be used by end-users to create new ugens
XXX = Ugen({
  name:'Vox',
  inputs:{ 
    frequency:{ min:50, max:3000, default:440 },
    amp: { min:0, max:1, default:.1 }
  },
  callback: function( frequency, amp ) {
    this.out = this.sin( this.PI2 * (this.phase++ * frequency / 44100) ) * amp
    
    // if stereo, make this.out an array an fill appropriately
    // do not create a new array for every sample
    return this.out
  },
  init: function() {
    this.sin = Math.sin
    this.PI2 = Math.PI * 2
    this.phase = 0
    this.out =  0
  }
})

// instantiate using constructor
// frequency and amp are set to arguments
a = XXX( 330, .25 )

// can also pass dictionary
b = XXX({ frequency:250, amp:.1 })

// automatic sequencing of properties
a.frequency.seq( [440,880], 1/2 )

*/
},{}],"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/vocoder.js":[function(require,module,exports){
module.exports = function( Gibber ) {
  "use strict"
  
  var Vocoder = { Presets: {} },
      Gibberish = require( 'gibberish-dsp' ),
      $ = Gibber.dollar,
      Clock = require( './clock' )( Gibber ),
      curves = Gibber.outputCurves,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC,
      mappingProperties =  {
        amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',},
        pan: { min: -1, max: 1, output: LOGARITHMIC,timescale: 'audio',},
        out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },     
      }
      
  Vocoder.Vocoder = function( carrier, modulator, numBands, startFreq, endFreq, Q ) {
    var vocoder = new Gibberish.Vocoder( carrier, modulator, numBands, startFreq, endFreq, Q ).connect( Gibber.Master )
    
    vocoder.type = 'Gen'
    
    $.extend( true, vocoder, Gibber.Audio.ugenTemplate )
    
    vocoder.fx.ugen = vocoder
    
    return vocoder
  }
  
  Vocoder.Robot = function( _options ) {
    var carrier, modulator, options = _options || {}, robot
    
    robot = Gibber.Audio.Vocoder.Vocoder( null, null, options.numBands || 16 )
    
    robot.disconnect()
    
    if( isNaN( options.maxVoices ) ) { options.maxVoices = 1 }
    if( isNaN( options.resonance ) ) { options.resonance = 4 }
    if( isNaN( options.attack    ) ) { options.attack = ms(1) }
    if( isNaN( options.decay     ) ) { options.decay = measures(8) }
    if( isNaN( options.pulsewidth) ) { options.pulsewidth = .05 }  

    robot.carrier = Gibber.Audio.Synths.Synth2( options )
    robot.note = robot.carrier.note.bind( robot )
    robot._note = robot.carrier._note.bind( robot )
    robot.chord = robot.carrier.chord.bind( robot )
    //robot._note = robot.carrier._note.bind( robot )
    robot.carrier._
    
    // in case robot.say.seq is called before module is loaded...
    var storeSayValues, storeSayDurations, storeInit = false
    robot.say = function( values, durations ) {
      if( storeInit === false ) {
        storeSayValues = values
        storeSayDurations = durations
        storeInit = true
      }
    }
    
    function initRobot() {
      robot.modulator = Speak( options )
      robot.modulator._

      robot.say = robot.modulator.say.bind( robot )
      Gibber.defineSequencedProperty( robot, 'say' )
      
      if( storeInit ) {
        robot.say.values = storeSayValues
        robot.say.durations = storeSayDurations
      }
      
      robot.connect()
    }
    
    if( ! Gibber.Modules[ 'gibber/publications/SpeakLib' ] ) {
      Gibber.import( 'gibber/publications/SpeakLib' ).done( function(speak) {
        var clear = setInterval( function() {
          if( typeof Speak !== 'undefined' ) {
            initRobot()
            clearInterval( clear )
          } 
        }, 250 )
      })
    }else{
      initRobot()
    }

    Gibber.defineSequencedProperty( robot, 'say' )
    Gibber.defineSequencedProperty( robot, 'chord' )    
    Gibber.defineSequencedProperty( robot, 'note' )
    
    $.extend( true, robot, Gibber.Audio.ugenTemplate )
    
    Gibber.createProxyProperties( robot, mappingProperties )
    
    
    return robot
  }

  return Vocoder
}
      
},{"./clock":"/Users/thecharlie/Documents/www/gibber.audio.lib/scripts/gibber/audio/clock.js","gibberish-dsp":"/Users/thecharlie/Documents/www/gibber.audio.lib/node_modules/gibberish-dsp/build/gibberish.js"}]},{},["./scripts/gibber/audio.lib.js"])("./scripts/gibber/audio.lib.js")
});