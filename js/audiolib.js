/*
	audiolib.js
	Jussi Kalliokoski
	https://github.com/jussi-kalliokoski/audiolib.js
	MIT license
*/

/*
	wrapper-start.js
	Please note that the file is not of valid syntax when standalone.
*/

this.audioLib = (function AUDIOLIB(global, Math, Object, Array){

var	arrayType	= global.Float32Array || Array,
	audioLib	= this;

function Float32Array(length){
	var array = new arrayType(length);
	array.subarray = array.subarray || array.slice;
	return array;
}

audioLib.Float32Array = Float32Array;

var __define = (function(){

	if (Object.defineProperty){
		return Object.defineProperty;
	} else if (Object.prototype.__defineGetter__){
		return function(obj, prop, desc){
			desc.get && obj.__defineGetter__(prop, desc.get);
			desc.set && obj.__defineSetter__(prop, desc.set);
		}
	}

}());

function __defineConst(obj, prop, value, enumerable){
	if (__define){
		__define(obj, prop, {
			get: function(){
				return value;
			},
			enumerable: !!enumerable
		});
	} else {
		// Cheap...
		obj[prop] = value;
	}
}

__defineConst(audioLib, '__define', __define);
__defineConst(audioLib, '__defineConst', __defineConst);

function __extend(obj){
	var	args	= arguments,
		l	= args.length,
		i, n;
	for (i=1; i<l; i++){
		for (n in args[i]){
			if (args[i].hasOwnProperty(n)){
				obj[n] = args[i][n];
			}
		}
	}
	return obj;
}

__defineConst(audioLib, '__extend', __extend);

function __enum(obj, callback, unignoreInherited){
	var i;
	for (i in obj){
		(obj.hasOwnProperty(i) || unignoreInherited) && callback.call(obj, obj[i], i);
	}
	return obj;
}

__defineConst(audioLib, '__enum', __enum);

function __class(name, constructor, args){
	var	i, cls;
	if (!args){
		args	= [];
		i	= /^\s*function\s*\w*\s*\(([^\)]+)/.exec(constructor);
		if (i){
			i[1].replace(/[a-z$_0-9]+/ig, function(i){
				args.push(i);
			});
		} else {
			for (i=0; i<constructor.length; i++){
				args[i] = Array(i+2).join('_');
			}
		}
	}
	cls = Function('var __q;return function ' + name + '(' + args.join() + '){var i; if(__q){__q=!__q}else if(this instanceof ' + name +')this.__CLASSCONSTRUCTOR.apply(this,arguments);else{__q=!__q;i=new ' + name + ';i.__CLASSCONSTRUCTOR.apply(i,arguments);return i}};')();
	cls.prototype = constructor.prototype;
	cls.prototype.__CLASSCONSTRUCTOR = constructor;
	__extend(cls, constructor);
	return cls;
}

__defineConst(audioLib, '__class', __class);
function AutomationClass(parameter, automation, amount, type){
	this.parameter	= parameter;
	this.automation	= automation;
	this.amount	= isNaN(amount) ? this.amount : amount;
	this.setType(type);
}

AutomationClass.prototype = {
	parameter:	'',
	automation:	null,
	amount:		1,
	type:		'modulation',
	mode:		null,
	setType: function(type){
		if (type){
			if (typeof type === 'function'){
				this.type = type.name || 'custom';
				this.mode = type;
			}
			this.type	= type;
			this.mode	= Automation.modes[type];
		} else {
			this.mode	= this.mode || Automation.modes[this.type];
		}
	},
};

/**
 * Applies automation to a specified component.
 *
 * @class
 *
 * @arg type:Component The effect to apply the automation to.
 * @arg =!parameter
 * @arg =!automation
 * @arg =!amount
 * @arg =!type
 *
 * @param type:String parameter The name of the parameter to apply automation to.
 * @param type:Component automation The component that controls the automation.
 * @param type:Float default:1 amount The amount of automation to apply.
 * @param type:String|Function default:modulation type The algorithm of applying the automation, can be a string for predefined types or a custom function.
*/
function Automation(fx, parameter, automation, amount, type){
	if (!fx.automation){
		fx.automation = [];
		switch (fx.type){
		case 'generator':
			fx.append = Automation.generatorAppend;		break;
		case 'effect':
			fx.append = Automation.effectAppend;		break;
		case 'buffereffect':
			fx.append = Automation.bufferEffectAppend;	break;
		}
	}
	var automation = new AutomationClass(parameter, automation, amount, type);
	fx.automation.push(automation);
	return automation;
}

Automation.generatorAppend = function(buffer, channelCount, out){
	var	self	= this,
		l	= buffer.length,
		k	= self.automation.length,
		def	= [],
		z, i, n, m, a;
	out		= out || buffer;
	channelCount	= channelCount || self.channelCount;
	for (m=0; m<k; m++){
		def.push(self[self.automation[m].parameter]);
	}
	for (i=0, z=0; i<l; i+=channelCount, z++){
		for (m=0; m<k; m++){
			self[self.automation[m].parameter] = def[m];
		}
		for (m=0; m<k; m++){
			a = self.automation[m];
			a.mode(self, a.parameter, a.amount * a.automation.generatedBuffer[z]);
		}

		self.generate();

		for (n=0; n<channelCount; n++){
			out[i + n] = self.getMix(n) * self.mix + buffer[i + n];
		}
	}
	for (m=0; m<k; m++){
		self[self.automation[m].parameter] = def[m];
	}
	return out;
};

Automation.effectAppend = function(buffer, channelCount, out){
	var	self	= this,
		l	= buffer.length,
		k	= self.automation.length,
		def	= [],
		z, i, n, m, a;
	out		= out || buffer;
	channelCount	= channelCount || self.channelCount;
	for (m=0; m<k; m++){
		def.push(self[self.automation[m].parameter]);
	}
	for (i=0, z=0; i<l; i+=channelCount, z++){
		for (m=0; m<k; m++){
			self[self.automation[m].parameter] = def[m];
		}
		for (m=0; m<k; m++){
			a = self.automation[m];
			a.mode(self, a.parameter, a.amount * a.automation.generatedBuffer[z]);
		}

		for (n=0; n<channelCount; n++){
			self.pushSample(buffer[i + n], n);
			out[i + n] = self.getMix(n) * self.mix + buffer[i + n] * (1 - self.mix);
		}
	}
	for (m=0; m<k; m++){
		self[self.automation[m].parameter] = def[m];
	}
	return out;
};

Automation.bufferEffectAppend = function(buffer, channelCount, out){
	var	self	= this,
		ch	= channelCount || self.channelCount,
		l	= buffer.length,
		k	= self.automation.length,
		def	= [],
		i, n, m, z, a, x;
	out		= out || buffer;
	for (m=0; m<k; m++){
		def.push([]);
		for (n=0; n<ch; n++){
			def[m].push(self.effects[n][self.automation[m].parameter]);
		}
	}
	for (x=0, i=0; i<l; i+=ch, x++){
		for (n=0; n<ch; n++){
			for (m=0; m<k; m++){
				a = self.automation[m];
				self.effects[n][a.parameter] = def[m][n];
				a.mode(self.effects[n], a.parameter, a.amount * a.automation.generatedBuffer[x]);
			}
			out[i + n] = self.effects[n].pushSample(buffer[i + n]) * self.mix + buffer[i + n] * (1 - self.mix);
		}
	}
	for (m=0; m<k; m++){
		for (n=0; n<ch; n++){
			self.effects[n][self.automation[m].parameter] = def[m][n];
		}
	}
	return out;
};

Automation.modes = {
	modulation: function(fx, param, value){
		fx.setParam(param, fx[param] * value);
	},
	addition: function(fx, param, value){
		fx.setParam(param, fx[param] + value);
	},
	subtraction: function(fx, param, value){
		fx.setParam(param, fx[param] - value);
	},
	additiveModulation: function(fx, param, value){
		fx.setParam(param, fx[param] + fx[param] * value);
	},
	subtractiveModulation: function(fx, param, value){
		fx.setParam(param, fx[param] - fx[param] * value);
	},
	assignment: function(fx, param, value){
		fx.setParam(param, value);
	},
	absoluteAssignment: function(fx, param, value){
		fx.setParam(param, Math.abs(value));
	},
};

Automation.__constructror		= AutomationClass;

/**
 * Applies automation to a specified component.
 *
 * @method Effect
 * @name addAutomation
 *
 * @arg type:String parameter The name of the parameter to apply automation to.
 * @arg type:Component automation The component that controls the automation.
 * @arg type:Float default:1 amount The amount of automation to apply.
 * @arg type:String|Function default:modulation type The algorithm of applying the automation, can be a string for predefined types or a custom function.
*/

/**
 * Applies automation to a specified component.
 *
 * @method Generator
 * @name addAutomation
 *
 * @arg type:String parameter The name of the parameter to apply automation to.
 * @arg type:Component automation The component that controls the automation.
 * @arg type:Float default:1 amount The amount of automation to apply.
 * @arg type:String|Function default:modulation type The algorithm of applying the automation, can be a string for predefined types or a custom function.
*/
function Plugin(name, plugin){
	Plugin[name] = plugin;
	Plugin._pluginList.push({
		plugin: plugin,
		name:	name
	});
}

__defineConst(Plugin, '_pluginList', [], false);
function Codec(name, codec){
	var nameCamel = name[0].toUpperCase() + name.substr(1).toLowerCase();
	Codec[name] = codec;
	if (codec.decode){
		audioLib.Sampler.prototype['load' + nameCamel] = function(filedata){
			this.load.apply(this, [Codec[name].decode(filedata)].concat([].slice.call(arguments, 1)));
		};
	}
	if (codec.encode){
		audioLib.AudioDevice.Recording.prototype['to' + nameCamel] = function(bytesPerSample){
			return Codec[name].encode({
				data:		this.join(),
				sampleRate:	this.boundTo.sampleRate,
				channelCount:	this.boundTo.channelCount,
				bytesPerSample:	bytesPerSample
			});
		};
	}
	return codec;
}
/**
 * Buffer effect class provides a multi-channel interface for single channel effects.
 *
 * @class
 *
 * @arg type:ComponentClass effect The component class to create a buffer effect of.
 * @arg =!channelCount
 * @arg type:ArgumentArray !args An array of arguments to feed to the created effects.
 *
 * @param type:UInt min:2 units=channels channelCount The channel count of the buffer effect.
 * @param type:Float mix The mix between dry and wet for the effect.
*/
function BufferEffect(effect, channelCount, args){
	this.channelCount	= isNaN(channelCount) ? this.channelCount : channelCount;
	this.effects		= [];

	function fx(){
		effect.apply(this, args);
	}
	fx.prototype = effect.prototype;

	while (channelCount--){
		this.effects.push(new fx());
	}
}

BufferEffect.prototype = {
	mix:		0.5,
	type:		'buffereffect',
	channelCount:	2,
	append:	function(buffer, channelCount, out){
		var	self	= this,
			l	= buffer.length,
			i, n;
		channelCount	= channelCount || self.channelCount;
		out		= out || buffer;
		for (i=0; i<l; i+=channelCount){
			for (n=0; n<channelCount; n++){
				self.effects[n].pushSample(buffer[i + n], 0);
				out[i + n] = self.effects[n].getMix(0) * self.mix + buffer[i + n] * (1 - self.mix);
			}
		}
		return out;
	},
	addPreProcessing: function(){
		var i;
		for (i=0; i<this.effects.length; i++){
			this.effects[i].addPreProcessing.apply(this.effects[i], arguments);
		}
	},
	removePreProcessing: function(){
		var i;
		for (i=0; i<this.effects.length; i++){
			this.effects[i].removePreProcessing.apply(this.effects[i], arguments);
		}
	},
	setParam: function(param, value){
		var	l	= this.effects.length,
			i;
		for (i=0; i<l; i++){
			this.effects[i].setParam(param, value);
		}
	},
};
/**
 * The parent class of all effects.
 *
 * @name Effect
 * @class
 *
 * @param type:Float mix The mix between dry and wet for the effect.
 * @param type:UInt min:1 units:channels The channel count of the effect. If one, will be treated like a single channel effect and to be used with createBufferBased().
*/
function EffectClass(){
}

EffectClass.prototype = {
	type:		'effect',
	sink:		true,
	source:		true,
	mix:		0.5,
	channelCount:	1,
/**
 * Applies the effect to a buffer of audio data and optionally puts the result on a separate output channel.
 *
 * @method Effect
 *
 * @arg {Array<Float>} buffer The buffer to apply the effect to.
 * @arg {UInt} min:1 !channelCount The amount of channels the buffer has.
 * @arg {Array<Float>} default:buffer out The optional output buffer.
 * @return {Array<Float>} The output buffer.
*/
	append: function(buffer, channelCount, out){
		var	l	= buffer.length,
			i, n;
		out		= out || buffer;
		channelCount	= channelCount || this.channelCount;
		for (i=0; i<l; i+=channelCount){
			for (n=0; n<channelCount; n++){
				this.pushSample(buffer[i + n], n);
				out[i + n] = this.getMix(n) * this.mix + buffer[i + n] * (1 - this.mix);
			}
		}
		return out;
	},
/**
 * Adds a callback that is applied before pushSample() to the effect.
 *
 * @method Effect
 *
 * @arg {Function} callback The callback to add.
*/
	addPreProcessing: function(callback){
		callback.pushSample = this.pushSample;
		this.pushSample = function(){
			callback.apply(this, arguments);
			return callback.pushSample.apply(this, arguments);
		};
	},
/**
 * Removes a callback from the pre-processing queue.
 *
 * @method Effect
 *
 * @arg {Function} callback The callback to remove.
*/
	removePreProcessing: function(callback){
		var f;
		while (f = this.pushSample.pushSample){
			if (f === callback || !callback){
				this.pushSample		= f;
				callback.pushSample	= null;
			}
		}
	},
/**
 * Sets a parameter of the effect to a certain value, taking into account all the other changes necessary to keep the effect sane.
 *
 * @method Effect
 *
 * @arg {String} param The parameter to change.
 * @arg value The value to set the parameter to.
*/
	setParam: function(param, value){
		this[param] = value;
	},
/**
 * Pushes a sample to the effect, moving it one sample forward in sample time.
 *
 * @method Effect
 *
 * @arg {Float} The sample to push to the effect.
 * @arg {UInt} min:1 !channel The channel to push to. This is only applicable to multi-channel effects.
*/
	pushSample: function(){},
/**
 * Retrieves the current output of the effect.
 *
 * @method Effect
 *
 * @arg {UInt} default:0 !channel The channel to retrieve the output of. This is only applicable to multi-channel effects.
 * @return {Float} The current output of the effect.
*/
	getMix: function(){},
/**
 * Resets the component to it's initial state, if possible.
 *
 * @method Effect
*/
	reset: function(){},
};
/**
 * The parent class of all generators.
 *
 * @name Generator
 * @class
 *
 * @param type:Float mix The mix amount for the generator output.
 * @param type:UInt min:1 units:channels The channel count of the generator.
*/
function GeneratorClass(){
}

GeneratorClass.prototype = {
	type:			'generator',
	source:			true,
	mix:			1,
	generatedBuffer:	null,
	channelCount:		1,
/**
 * Generates the buffer full of audio data and optionally puts the result on a separate output channel.
 *
 * @method Generator
 *
 * @arg {Array<Float>} buffer The buffer to apply the effect to.
 * @arg {UInt} min:1 !channelCount The amount of channels the buffer has.
 * @arg {Array<Float>} default:buffer !out The optional output buffer.
 * @return {Array<Float>} The output buffer.
*/
	append: function(buffer, channelCount, out){
		var	l	= buffer.length,
			i, n;
		out		= out || buffer;
		channelCount	= channelCount || this.channelCount;
		for (i=0; i<l; i+=channelCount){
			this.generate();
			for (n=0; n<channelCount; n++){
				out[i + n] = this.getMix(n) * this.mix + buffer[i + n];
			}
		}
		return out;
	},
/**
 * Adds a callback that is applied before pushSample() to the effect.
 *
 * @method Generator
 *
 * @arg {Function} callback The callback to add.
*/
	addPreProcessing: function(callback){
		callback.generate = this.generate;
		this.generate = function(){
			callback.apply(this, arguments);
			return callback.generate.apply(this, arguments);
		};
	},
/**
 * Removes a callback from the pre-processing queue.
 *
 * @method Generator
 *
 * @arg {Function} callback The callback to remove.
*/
	removePreProcessing: function(callback){
		var f;
		while (f = this.generate.generate){
			if (f === callback || !callback){
				this.generate		= f;
				callback.generate	= null;
			}
		}
	},
/**
 * Generates a buffer of the specified length and channel count and assigns it to ``this.generatedBuffer``.
 *
 * Generally used when the generator is used as an automation modifier.
 *
 * @method Generator
 *
 * @arg {UInt} min:1 length The length of the buffer to generate.
 * @arg {UInt} min:1 default:1 !chCount The amount of channels the buffer should have.
*/
	generateBuffer: function(length, chCount){
		this.generatedBuffer = new Float32Array(length);
		this.append(this.generatedBuffer, chCount || 1);
	},
/**
 * Sets a parameter of the effect to a certain value, taking into account all the other changes necessary to keep the effect sane.
 *
 * @method Generator
 *
 * @arg {String} param The parameter to change.
 * @arg value The value to set the parameter to.
*/
	setParam: function(param, value){
		this[param] = value;
	},
/**
 * Generates one sample to all available channels, moving the generator one sample forward in the sample time.
 *
 * @method Generator
*/
	generate: function(){},
/**
 * Retrieves the current output of the generator.
 *
 * @method Generator
 *
 * @arg {UInt} default:0 !channel The channel to retrieve the output of. This is only applicable to multi-channel generators.
 * @return {Float} The current output of the generator.
*/
	getMix: function(){},
/**
 * Resets the component to it's initial state, if possible.
 *
 * @method Generator
*/
	reset: function(){},
};
(function(){

/* Depends on Sink.inlineWorker */

function inject(){
	var	args	= arguments,
		l	= args.length,
		code, i;
	for (i=0; i<l; i++){
		code = args[i];
		this.postMessage({type: 'injection', code: code instanceof Function ? '(' + String(code) + ').call(this);' : code });
	}
}

audioLib.AudioWorker = function(code, injectable){
	var	worker	= 'var audioLib=(' + String(AUDIOLIB) + '(this, Math, Object, Array));\n',
		i;
	for (i=0; i < audioLib.plugins._pluginList.length; i++) {
		worker += '(' + String(audioLib.plugins._pluginList[url]) + '());\n';
	}
	injectable && (worker += 'this.addEventListener("message",function(e){e.data&&e.data.type==="injection"&&Function(e.data.code).call(this)},true);\n');
	worker += (code instanceof Function ? '(' + String(code) + ').call(this);' : code);
	worker = Sink.inlineWorker(worker);
	if (injectable){
		worker.inject = inject;
	}
	return worker;
};

}());
/*
pcmdata.js
Uses binary.js and stream.js to parse PCM wave data.
On GitHub:
 * pcmdata.js	http://goo.gl/4uu06
 * binary.js	http://goo.gl/ZaWqK

binary.js repository also includes stream.js

MIT License
*/

(function(global, Math){

	var	fromCharCode	= String.fromCharCode,
		// the following two aren't really *performance optimization*, but compression optimization.
		y		= true,
		n		= false;

	function convertToBinaryLE(num, size){
		return size ? fromCharCode(num & 255) + convertToBinaryLE(num >> 8, size - 1) : '';
	}

	function convertToBinaryBE(num, size){ // I don't think this is right
		return size ? convertToBinaryBE(num >> 8, size - 1) + fromCharCode(255 - num & 255) : '';
	}

	function convertToBinary(num, size, bigEndian){
		return bigEndian ? convertToBinaryBE(num, size) : convertToBinaryLE(num, size);
	}

	function convertFromBinary(str, bigEndian){
		var	l	= str.length,
			last	= l - 1,
			n	= 0,
			pow	= Math.pow,
			i;
		if (bigEndian){
			for (i=0; i<l; i++){
				n += (255 - str.charCodeAt(i)) * pow(256, last - i);
			}
		} else {
			for (i=0; i < l; i++){
				n += str.charCodeAt(i) * pow(256, i);
			}
		}
		return n;
	}

	// The main function creates all the functions used.
	function Binary(bitCount, signed, /* false === unsigned */ isQ, from /* false === to */){

		// This is all just for major optimization benefits.
		var	pow			= Math.pow,
			floor			= Math.floor,
			convertFromBinary	= Binary.convertFromBinary,
			convertToBinary		= Binary.convertToBinary,
			byteCount		= bitCount / 8,
			bitMask			= pow(2, bitCount),
			semiMask		= bitMask / 2,
			intMask			= semiMask - 1,
			invSemiMask		= 1 / semiMask,
			invIntMask		= 1 / intMask;

		return from ?
			isQ ?
				signed ? function(num, bigEndian){
					num = floor(num < 0 ? num * semiMask + bitMask : num * intMask);
					return convertToBinary(
						num,
						byteCount,
						bigEndian
					);
				} : function(num, bigEndian){
					return convertToBinary(
						floor(num * intMask),
						byteCount,
						bigEndian
					);
				}
			:
				signed ? function(num, bigEndian){
					return convertToBinary(
						num < 0 ? num + bitMask : num,
						byteCount,
						bigEndian
					);
				} : function(num, bigEndian){
					return convertToBinary(
						num,
						byteCount,
						bigEndian
					);
				}
		:
			isQ ?
				signed ? function(str, bigEndian){
					var num = convertFromBinary(str, bigEndian);
					return num > intMask ? (num - bitMask) * invSemiMask : num * invIntMask;
				} : function(str, bigEndian){
					return convertFromBinary(str, bigEndian) * invIntMask;
				}
			:
				signed ? function(str, bigEndian){
					var num = convertFromBinary(str, bigEndian);
					return num > intMask ? num - bitMask : num;
				} : function(str, bigEndian){
					return convertFromBinary(str, bigEndian);
				};
	}

	Binary.convertToBinary		= convertToBinary;
	Binary.convertFromBinary	= convertFromBinary;
	// these are deprecated because JS doesn't support 64 bit uint, so the conversion can't be performed.
/*
	Binary.fromQ64			= Binary(64, y, y, y);
	Binary.toQ64			= Binary(64, y, y, n);
*/
	Binary.fromQ32			= Binary(32, y, y, y);
	Binary.toQ32			= Binary(32, y, y, n);
	Binary.fromQ24			= Binary(24, y, y, y);
	Binary.toQ24			= Binary(24, y, y, n);
	Binary.fromQ16			= Binary(16, y, y, y);
	Binary.toQ16			= Binary(16, y, y, n);
	Binary.fromQ8			= Binary( 8, y, y, y);
	Binary.toQ8			= Binary( 8, y, y, n);
	Binary.fromInt32		= Binary(32, y, n, y);
	Binary.toInt32			= Binary(32, y, n, n);
	Binary.fromInt16		= Binary(16, y, n, y);
	Binary.toInt16			= Binary(16, y, n, n);
	Binary.fromInt8			= Binary( 8, y, n, y);
	Binary.toInt8			= Binary( 8, y, n, n);
	Binary.fromUint32		= Binary(32, n, n, y);
	Binary.toUint32			= Binary(32, n, n, n);
	Binary.fromUint16		= Binary(16, n, n, y);
	Binary.toUint16			= Binary(16, n, n, n);
	Binary.fromUint8		= Binary( 8, n, n, y);
	Binary.toUint8			= Binary( 8, n, n, n);

	global.Binary = Binary;
}(this, Math));
(function(global, Binary){

function Stream(data){
	this.data = data;
}

var	proto	= Stream.prototype = {
		read:		function(length){
			var	self	= this,
				data	= self.data.substr(0, length);
			self.skip(length);
			return data;
		},
		skip:		function(length){
			var	self	= this,
				data	= self.data	= self.data.substr(length);
			self.pointer	+= length;
			return data.length;
		},
		readBuffer:	function(buffer, bitCount, type){
			var	self		= this,
				converter	= 'read' + type + bitCount,
				byteCount	= bitCount / 8,
				l		= buffer.length,
				i		= 0;
			while (self.data && i < l){
				buffer[i++] = self[converter]();
			}
			return i;
		}
	},
	i, match;

function newType(type, bitCount, fn){
	var	l	= bitCount / 8;
	proto['read' + type + bitCount] = function(bigEndian){
		return fn(this.read(l), bigEndian);
	};
}

for (i in Binary){
	match	= /to([a-z]+)([0-9]+)/i.exec(i);
	match && newType(match[1], match[2], Binary[i]);
}

global.Stream	= Stream;
Stream.newType	= newType;

}(this, this.Binary));
this.PCMData = (function(Binary, Stream){

function PCMData(data){
	return (typeof data === 'string' ? PCMData.decode : PCMData.encode)(data);
}

PCMData.decodeFrame = function(frame, bitCount, result){
	if (bitCount === 8){
		var buffer	= new (window.Uint8Array || Array)(result.length);
		(new Stream(frame)).readBuffer(buffer, 8, 'Uint');
		for (bitCount=0; bitCount<result.length; bitCount++){
			result[bitCount] = (buffer[bitCount] - 127.5) * 127.5;
		}
	} else {
		(new Stream(frame)).readBuffer(result, bitCount, 'Q');
	}
	return result;
};

PCMData.encodeFrame = function(frame, bitCount){
	var	properWriter	= Binary[(bitCount === 8 ? 'fromUint' : 'fromQ') + bitCount],
		l		= frame.length,
		r		= '',
		i;
	if (bitCount === 8){
		for (i=0; i<l; i++){
			r += properWriter(frame[i] * 127.5 + 127.5);
		}
	} else {
		for (i=0; i<l; i++){
			r += properWriter(frame[i]);
		}
	}
	return r;
};

PCMData.decode	= function(data, asyncCallback){
	var	stream			= new Stream(data),
		sGroupID1		= stream.read(4),
		dwFileLength		= stream.readUint32();
		stream			= new Stream(stream.read(dwFileLength));
	var	sRiffType		= stream.read(4),
		sGroupID2		= stream.read(4),
		dwChunkSize1		= stream.readUint32(),
		formatChunk		= new Stream(stream.read(dwChunkSize1)),
		wFormatTag		= formatChunk.readUint16(),
		wChannels		= formatChunk.readUint16(),
		dwSamplesPerSec		= formatChunk.readUint32(),
		dwAvgBytesPerSec	= formatChunk.readUint32(),
		wBlockAlign		= formatChunk.readUint16(),
		sampleSize		= wBlockAlign / wChannels,
		dwBitsPerSample		= /* dwChunkSize1 === 16 ? */ formatChunk.readUint16() /* : formatChunk.readUint32() */,
		sGroupID,
		dwChunkSize,
		sampleCount,
		chunkData,
		samples,
		dataTypeList,
		i,
		chunks	= {},
		output	= {
			channelCount:	wChannels,
			bytesPerSample:	wBlockAlign / wChannels,
			sampleRate:	dwAvgBytesPerSec / wBlockAlign,
			chunks:		chunks,
			data:		samples
		};

	function readChunk(){
		sGroupID		= stream.read(4);
		dwChunkSize		= stream.readUint32();
		chunkData		= stream.read(dwChunkSize);
		dataTypeList		= chunks[sGroupID] = chunks[sGroupID] || [];
		if (sGroupID === 'data'){
			sampleCount		= ~~(dwChunkSize / sampleSize);
			samples			= output.data = new (typeof Float32Array !== 'undefined' ? Float32Array : Array)(sampleCount);
			PCMData.decodeFrame(chunkData, sampleSize * 8, samples);
		} else {
			dataTypeList.push(chunkData);
		}
		asyncCallback && (stream.data ? setTimeout(readChunk, 1) : asyncCallback(output));
	}

	if (asyncCallback){
		stream.data ? readChunk() : asyncCallback(output);
	} else {
		while(stream.data){
			readChunk();
		}
	}
	return output;
}

PCMData.encode	= function(data, asyncCallback){
	var	
		dWord		= Binary.fromUint32,
		sWord		= Binary.fromUint16,
		samples		= data.data,
		sampleRate	= data.sampleRate,
		channelCount	= data.channelCount || 1,
		bytesPerSample	= data.bytesPerSample || 1,
		bitsPerSample	= bytesPerSample * 8,
		blockAlign	= channelCount * bytesPerSample,
		byteRate	= sampleRate * blockAlign,
		length		= samples.length,
		dLength		= length * bytesPerSample,
		padding		= Math.pow(2, bitsPerSample - 1) - 1,
		chunks		= [],
		chunk		= '',
		chunkType,
		i, n, chunkData;

		
		chunks.push(
			'fmt '				+	// sGroupID		4 bytes		char[4]
			dWord(16)			+	// dwChunkSize		4 bytes		uint32 / dword
			sWord(1)			+	// wFormatTag		2 bytes		uint16 / ushort
			sWord(channelCount)		+	// wChannels		2 bytes		uint16 / ushort
			dWord(sampleRate)		+	// dwSamplesPerSec	4 bytes		uint32 / dword
			dWord(byteRate)			+	// dwAvgBytesPerSec	4 bytes		uint32 / dword
			sWord(blockAlign)		+	// wBlockAlign		2 bytes		uint16 / ushort
			sWord(bitsPerSample)			// dwBitsPerSample	2 or 4 bytes	uint32 / dword OR uint16 / ushort
		);

		chunks.push(
			'data'				+	// sGroupID		4 bytes		char[4]
			dWord(dLength)			+	// dwChunkSize		4 bytes		uint32 / dword
			PCMData.encodeFrame(samples, bitsPerSample)
		);
		chunkData = data.chunks;
		if (chunkData){
			for (i in chunkData){
				if (chunkData.hasOwnProperty(i)){
					chunkType = chunkData[i];
					for (n=0; n<chunkType.length; n++){
						chunk = chunkType[n];
						chunks.push(i + dWord(chunk.length) + chunk);
					}
				}
			}
		}
		chunks = chunks.join('');
		chunks = 'RIFF'			+	// sGroupId		4 bytes		char[4]
			dWord(chunks.length)	+	// dwFileLength		4 bytes		uint32 / dword
			'WAVE'			+	// sRiffType		4 bytes		char[4]
			chunks;
		asyncCallback && setTimeout(function(){
			asyncCallback(chunks);
		}, 1);
		return chunks;
}

return PCMData;

}(this.Binary, this.Stream));
(function (global){

/**
 * Creates a Sink according to specified parameters, if possible.
 *
 * @class
 *
 * @arg =!readFn
 * @arg =!channelCount
 * @arg =!bufferSize
 * @arg =!sampleRate
 *
 * @param {Function} readFn A callback to handle the buffer fills.
 * @param {Number} channelCount Channel count.
 * @param {Number} bufferSize (Optional) Specifies a pre-buffer size to control the amount of latency.
 * @param {Number} sampleRate Sample rate (ms).
 * @param {Number} default=0 writePosition Write position of the sink, as in how many samples have been written per channel.
 * @param {String} default=async writeMode The default mode of writing to the sink.
 * @param {String} default=interleaved channelMode The mode in which the sink asks the sample buffers to be channeled in.
 * @param {Number} default=0 previousHit The previous time of a callback.
 * @param {Buffer} default=null ringBuffer The ring buffer array of the sink. If null, ring buffering will not be applied.
 * @param {Number} default=0 ringOffset The current position of the ring buffer.
*/
function Sink(readFn, channelCount, bufferSize, sampleRate){
	var	sinks	= Sink.sinks,
		dev;
	for (dev in sinks){
		if (sinks.hasOwnProperty(dev) && sinks[dev].enabled){
			try{
				return new sinks[dev](readFn, channelCount, bufferSize, sampleRate);
			} catch(e1){}
		}
	}

	throw Sink.Error(0x02);
}

/**
 * A light event emitter.
 *
 * @class
 * @static Sink
*/
function EventEmitter () {
	var k;
	for (k in EventEmitter.prototype) {
		if (EventEmitter.prototype.hasOwnProperty(k)) {
			this[k] = EventEmitter.prototype[k];
		}
	}
	this._listeners = {};
};

EventEmitter.prototype = {
	_listeners: null,
/**
 * Emits an event.
 *
 * @method EventEmitter
 *
 * @arg {String} name The name of the event to emit.
 * @arg {Array} args The arguments to pass to the event handlers.
*/
	emit: function (name, args) {
		if (this._listeners[name]) {
			for (var i=0; i<this._listeners[name].length; i++) {
				this._listeners[name][i].apply(this, args);
			}
		}
		return this;
	},
/**
 * Adds an event listener to an event.
 *
 * @method EventEmitter
 *
 * @arg {String} name The name of the event.
 * @arg {Function} listener The event listener to attach to the event.
*/
	on: function (name, listener) {
		this._listeners[name] = this._listeners[name] || [];
		this._listeners[name].push(listener);
		return this;
	},
/**
 * Adds an event listener to an event.
 *
 * @method EventEmitter
 *
 * @arg {String} name The name of the event.
 * @arg {Function} !listener The event listener to remove from the event. If not specified, will delete all.
*/
	off: function (name, listener) {
		if (this._listeners[name]) {
			if (!listener) {
				delete this._listeners[name];
				return this;
			}
			for (var i=0; i<this._listeners[name].length; i++) {
				if (this._listeners[name][i] === listener) {
					this._listeners[name].splice(i--, 1);
				}
			}
			this._listeners[name].length || delete this._listeners[name];
		}
		return this;
	},
};

Sink.EventEmitter = EventEmitter;

/*
 * A Sink-specific error class.
 *
 * @class
 * @static Sink
 * @name Error
 *
 * @arg =code
 *
 * @param {Number} code The error code.
 * @param {String} message A brief description of the error.
 * @param {String} explanation A more verbose explanation of why the error occured and how to fix.
*/

function SinkError(code) {
	if (!SinkError.hasOwnProperty(code)) throw SinkError(1);
	if (!(this instanceof SinkError)) return new SinkError(code);

	var k;
	for (k in SinkError[code]) {
		if (SinkError[code].hasOwnProperty(k)) {
			this[k] = SinkError[code][k];
		}
	}

	this.code = code;
}

SinkError.prototype = new Error();

SinkError.prototype.toString = function () {
	return 'SinkError 0x' + this.code.toString(16) + ': ' + this.message;
};

SinkError[0x01] = {
	message: 'No such error code.',
	explanation: 'The error code does not exist.',
};
SinkError[0x02] = {
	message: 'No audio sink available.',
	explanation: 'The audio device may be busy, or no supported output API is available for this browser.',
};

SinkError[0x10] = {
	message: 'Buffer underflow.',
	explanation: 'Trying to recover...',
};
SinkError[0x11] = {
	message: 'Critical recovery fail.',
	explanation: 'The buffer underflow has reached a critical point, trying to recover, but will probably fail anyway.',
};
SinkError[0x12] = {
	message: 'Buffer size too large.',
	explanation: 'Unable to allocate the buffer due to excessive length, please try a smaller buffer. Buffer size should probably be smaller than the sample rate.',
};

Sink.Error = SinkError;

/**
 * A Recording class for recording sink output.
 *
 * @class
 * @arg {Object} bindTo The sink to bind the recording to.
*/

function Recording(bindTo){
	this.boundTo = bindTo;
	this.buffers = [];
	bindTo.activeRecordings.push(this);
}

Recording.prototype = {
/**
 * Adds a new buffer to the recording.
 *
 * @arg {Array} buffer The buffer to add.
 *
 * @method Recording
*/
	add: function(buffer){
		this.buffers.push(buffer);
	},
/**
 * Empties the recording.
 *
 * @method Recording
*/
	clear: function(){
		this.buffers = [];
	},
/**
 * Stops the recording and unbinds it from it's host sink.
 *
 * @method Recording
*/
	stop: function(){
		var	recordings = this.boundTo.activeRecordings,
			i;
		for (i=0; i<recordings.length; i++){
			if (recordings[i] === this){
				recordings.splice(i--, 1);
			}
		}
	},
/**
 * Joins the recorded buffers into a single buffer.
 *
 * @method Recording
*/
	join: function(){
		var	bufferLength	= 0,
			bufPos		= 0,
			buffers		= this.buffers,
			newArray,
			n, i, l		= buffers.length;

		for (i=0; i<l; i++){
			bufferLength += buffers[i].length;
		}
		newArray = new Float32Array(bufferLength);
		for (i=0; i<l; i++){
			for (n=0; n<buffers[i].length; n++){
				newArray[bufPos + n] = buffers[i][n];
			}
			bufPos += buffers[i].length;
		}
		return newArray;
	}
};

function SinkClass(){
}

Sink.SinkClass		= SinkClass;

SinkClass.prototype = {
	sampleRate: 44100,
	channelCount: 2,
	bufferSize: 4096,
	writePosition: 0,
	writeMode: 'async',
	channelMode: 'interleaved',
	previousHit: 0,
	ringBuffer: null,
	ringOffset: 0,
/**
 * Does the initialization of the sink.
 * @method Sink
*/
	start: function(readFn, channelCount, bufferSize, sampleRate){
		this.channelCount	= isNaN(channelCount) || channelCount === null ? this.channelCount: channelCount;
		this.bufferSize	= isNaN(bufferSize) || bufferSize === null ? this.bufferSize : bufferSize;
		this.sampleRate		= isNaN(sampleRate) || sampleRate === null ? this.sampleRate : sampleRate;
		this.readFn		= readFn;
		this.activeRecordings	= [];
		this.previousHit	= +new Date;
		this.asyncBuffers	= [];
		this.syncBuffers	= [];
		Sink.EventEmitter.call(this);
	},
/**
 * The method which will handle all the different types of processing applied on a callback.
 * @method Sink
*/
	process: function(soundData, channelCount) {
		this.ringBuffer && (this.channelMode === 'interleaved' ? this.ringSpin : this.ringSpinInterleaved).apply(this, arguments);
		this.writeBuffersSync.apply(this, arguments);
		if (this.channelMode === 'interleaved') {
			this.emit('audioprocess', arguments);
			this.readFn && this.readFn.apply(this, arguments);
		} else {
			var	soundDataSplit	= Sink.deinterleave(soundData, this.channelCount),
				args		= [soundDataSplit].concat([].slice.call(arguments, 1));
			this.emit('audioprocess', args);
			this.readFn && this.readFn.apply(this, args);
			Sink.interleave(soundDataSplit, this.channelCount, soundData);
		}
		this.writeBuffersAsync.apply(this, arguments);
		this.recordData.apply(this, arguments);
		this.previousHit = +new Date;
		this.writePosition += soundData.length / channelCount;
	},
/**
 * Starts recording the sink output.
 *
 * @method Sink
 *
 * @return {Recording} The recording object for the recording started.
*/
	record: function(){
		return new Recording(this);
	},
/**
 * Private method that handles the adding the buffers to all the current recordings.
 *
 * @method Sink
 *
 * @arg {Array} buffer The buffer to record.
*/
	recordData: function(buffer){
		var	activeRecs	= this.activeRecordings,
			i, l		= activeRecs.length;
		for (i=0; i<l; i++){
			activeRecs[i].add(buffer);
		}
	},
/**
 * Private method that handles the mixing of asynchronously written buffers.
 *
 * @method Sink
 *
 * @arg {Array} buffer The buffer to write to.
*/
	writeBuffersAsync: function(buffer){
		var	buffers		= this.asyncBuffers,
			l		= buffer.length,
			buf,
			bufLength,
			i, n, offset;
		if (buffers){
			for (i=0; i<buffers.length; i++){
				buf		= buffers[i];
				bufLength	= buf.b.length;
				offset		= buf.d;
				buf.d		-= Math.min(offset, l);
				
				for (n=0; n + offset < l && n < bufLength; n++){
					buffer[n + offset] += buf.b[n];
				}
				buf.b = buf.b.subarray(n + offset);
				i >= bufLength && buffers.splice(i--, 1);
			}
		}
	},
/**
 * A private method that handles mixing synchronously written buffers.
 *
 * @method Sink
 *
 * @arg {Array} buffer The buffer to write to.
*/
	writeBuffersSync: function(buffer){
		var	buffers		= this.syncBuffers,
			l		= buffer.length,
			i		= 0,
			soff		= 0;
		for(;i<l && buffers.length; i++){
			buffer[i] += buffers[0][soff];
			if (buffers[0].length <= soff){
				buffers.splice(0, 1);
				soff = 0;
				continue;
			}
			soff++;
		}
		if (buffers.length){
			buffers[0] = buffers[0].subarray(soff);
		}
	},
/**
 * Writes a buffer asynchronously on top of the existing signal, after a specified delay.
 *
 * @method Sink
 *
 * @arg {Array} buffer The buffer to write.
 * @arg {Number} delay The delay to write after. If not specified, the Sink will calculate a delay to compensate the latency.
 * @return {Number} The number of currently stored asynchronous buffers.
*/
	writeBufferAsync: function(buffer, delay){
		buffer			= this.mode === 'deinterleaved' ? Sink.interleave(buffer, this.channelCount) : buffer;
		var	buffers		= this.asyncBuffers;
		buffers.push({
			b: buffer,
			d: isNaN(delay) ? ~~((+new Date - this.previousHit) / 1000 * this.sampleRate) : delay
		});
		return buffers.length;
	},
/**
 * Writes a buffer synchronously to the output.
 *
 * @method Sink
 *
 * @param {Array} buffer The buffer to write.
 * @return {Number} The number of currently stored synchronous buffers.
*/
	writeBufferSync: function(buffer){
		buffer			= this.mode === 'deinterleaved' ? Sink.interleave(buffer, this.channelCount) : buffer;
		var	buffers		= this.syncBuffers;
		buffers.push(buffer);
		return buffers.length;
	},
/**
 * Writes a buffer, according to the write mode specified.
 *
 * @method Sink
 *
 * @arg {Array} buffer The buffer to write.
 * @arg {Number} delay The delay to write after. If not specified, the Sink will calculate a delay to compensate the latency. (only applicable in asynchronous write mode)
 * @return {Number} The number of currently stored (a)synchronous buffers.
*/
	writeBuffer: function(){
		return this[this.writeMode === 'async' ? 'writeBufferAsync' : 'writeBufferSync'].apply(this, arguments);
	},
/**
 * Gets the total amount of yet unwritten samples in the synchronous buffers.
 *
 * @method Sink
 *
 * @return {Number} The total amount of yet unwritten samples in the synchronous buffers.
*/
	getSyncWriteOffset: function(){
		var	buffers		= this.syncBuffers,
			offset		= 0,
			i;
		for (i=0; i<buffers.length; i++){
			offset += buffers[i].length;
		}
		return offset;
	},
/**
 * Get the current output position, defaults to writePosition - bufferSize.
 *
 * @method Sink
 *
 * @return {Number} The position of the write head, in samples, per channel.
*/
	getPlaybackTime: function(){
		return this.writePosition - this.bufferSize;
	},
/**
 * A private method that applies the ring buffer contents to the specified buffer, while in interleaved mode.
 *
 * @method Sink
 *
 * @arg {Array} buffer The buffer to write to.
*/
	ringSpin: function(buffer){
		var	ring	= this.ringBuffer,
			l	= buffer.length,
			m	= ring.length,
			off	= this.ringOffset,
			i;
		for (i=0; i<l; i++){
			buffer[i] += ring[off];
			off = (off + 1) % m;
		}
		this.ringOffset = off;
	},
/**
 * A private method that applies the ring buffer contents to the specified buffer, while in deinterleaved mode.
 *
 * @method Sink
 *
 * @param {Array} buffer The buffers to write to.
*/
	ringSpinDeinterleaved: function(buffer){
		var	ring	= this.ringBuffer,
			l	= buffer.length,
			ch	= ring.length,
			m	= ring[0].length,
			len	= ch * m,
			off	= this.ringOffset,
			i, n;
		for (i=0; i<l; i+=ch){
			for (n=0; n<ch; n++){
				buffer[i + n] += ring[n][off];
			}
			off = (off + 1) % m;
		}
		this.ringOffset = n;
	}
};

/**
 * The container for all the available sinks. Also a decorator function for creating a new Sink class and binding it.
 *
 * @method Sink
 *
 * @arg {String} type The name / type of the Sink.
 * @arg {Function} constructor The constructor function for the Sink.
 * @arg {Object} prototype The prototype of the Sink. (optional)
 * @arg {Boolean} disabled Whether the Sink should be disabled at first.
*/

function sinks(type, constructor, prototype, disabled){
	prototype = prototype || constructor.prototype;
	constructor.prototype = new Sink.SinkClass();
	constructor.prototype.type = type;
	constructor.enabled = !disabled;
	for (disabled in prototype){
		if (prototype.hasOwnProperty(disabled)){
			constructor.prototype[disabled] = prototype[disabled];
		}
	}
	sinks[type] = constructor;
}

/**
 * A Sink class for the Mozilla Audio Data API.
*/

sinks('moz', function(){
	var	self			= this,
		currentWritePosition	= 0,
		tail			= null,
		audioDevice		= new Audio(),
		written, currentPosition, available, soundData, prevPos,
		timer; // Fix for https://bugzilla.mozilla.org/show_bug.cgi?id=630117
	self.start.apply(self, arguments);
	self.preBufferSize = isNaN(arguments[4]) || arguments[4] === null ? this.preBufferSize : arguments[4];

	function bufferFill(){
		if (tail){
			written = audioDevice.mozWriteAudio(tail);
			currentWritePosition += written;
			if (written < tail.length){
				tail = tail.subarray(written);
				return tail;
			}
			tail = null;
		}

		currentPosition = audioDevice.mozCurrentSampleOffset();
		available = Number(currentPosition + (prevPos !== currentPosition ? self.bufferSize : self.preBufferSize) * self.channelCount - currentWritePosition);
		currentPosition === prevPos && self.emit('error', [Sink.Error(0x10)]);
		if (available > 0 || prevPos === currentPosition){
			try {
				soundData = new Float32Array(prevPos === currentPosition ? self.preBufferSize * self.channelCount :
					self.forceBufferSize ? available < self.bufferSize * 2 ? self.bufferSize * 2 : available : available);
			} catch(e) {
				self.emit('error', [Sink.Error(0x12)]);
				self.kill();
				return;
			}
			self.process(soundData, self.channelCount);
			written = self._audio.mozWriteAudio(soundData);
			if (written < soundData.length){
				tail = soundData.subarray(written);
			}
			currentWritePosition += written;
		}
		prevPos = currentPosition;
	}

	audioDevice.mozSetup(self.channelCount, self.sampleRate);

	this._timers = [];

	this._timers.push(Sink.doInterval(function () {
		// Check for complete death of the output
		if (+new Date - self.previousHit > 2000) {
			self._audio = audioDevice = new Audio();
			audioDevice.mozSetup(self.channelCount, self.sampleRate);
			currentWritePosition = 0;
			self.emit('error', [Sink.Error(0x11)]);
		}
	}, 1000));

	this._timers.push(Sink.doInterval(bufferFill, self.interval));

	self._bufferFill	= bufferFill;
	self._audio		= audioDevice;
}, {
	// These are somewhat safe values...
	bufferSize: 24576,
	preBufferSize: 24576,
	forceBufferSize: false,
	interval: 20,
	kill: function () {
		while(this._timers.length){
			this._timers[0]();
			this._timers.splice(0, 1);
		}
		this.emit('kill');
	},
	getPlaybackTime: function() {
		return this._audio.mozCurrentSampleOffset() / this.channelCount;
	}
});

/**
 * A sink class for the Web Audio API
*/

var fixChrome82795 = [];

sinks('webkit', function(readFn, channelCount, bufferSize, sampleRate){
	var	self		= this,
		// For now, we have to accept that the AudioContext is at 48000Hz, or whatever it decides.
		context		= new (window.AudioContext || webkitAudioContext)(/*sampleRate*/),
		node		= context.createJavaScriptNode(bufferSize, 0, channelCount);
	self.start.apply(self, arguments);

	function bufferFill(e){
		var	outputBuffer	= e.outputBuffer,
			channelCount	= outputBuffer.numberOfChannels,
			i, n, l		= outputBuffer.length,
			size		= outputBuffer.size,
			channels	= new Array(channelCount),
			soundData	= new Float32Array(l * channelCount),
			tail;

		for (i=0; i<channelCount; i++){
			channels[i] = outputBuffer.getChannelData(i);
		}

		self.process(soundData, self.channelCount);

		for (i=0; i<l; i++){
			for (n=0; n < channelCount; n++){
				channels[n][i] = soundData[i * self.channelCount + n];
			}
		}
	}

	if (sinks.webkit.forceSampleRate && self.sampleRate !== context.sampleRate){
		bufferFill = function bufferFill(e){
			var	outputBuffer	= e.outputBuffer,
				channelCount	= outputBuffer.numberOfChannels,
				i, n, l		= outputBuffer.length,
				size		= outputBuffer.size,
				channels	= new Array(channelCount),
				soundData	= new Float32Array(Math.floor(l * self.sampleRate / context.sampleRate) * channelCount),
				channel;

			for (i=0; i<channelCount; i++){
				channels[i] = outputBuffer.getChannelData(i);
			}

			self.process(soundData, self.channelCount);
			soundData = Sink.deinterleave(soundData, self.channelCount);
			for (n=0; n<channelCount; n++){
				channel = Sink.resample(soundData[n], self.sampleRate, context.sampleRate);
				for (i=0; i<l; i++){
					channels[n][i] = channel[i];
				}
			}
		}
	} else {
		self.sampleRate = context.sampleRate;
	}

	node.onaudioprocess = bufferFill;
	node.connect(context.destination);

	self._context		= context;
	self._node		= node;
	self._callback		= bufferFill;
	/* Keep references in order to avoid garbage collection removing the listeners, working around http://code.google.com/p/chromium/issues/detail?id=82795 */
	// Thanks to @baffo32
	fixChrome82795.push(node);
}, {
	//TODO: Do something here.
	kill: function(){
		this._node.disconnect(0);
		for (var i=0; i<fixChrome82795.length; i++) {
			fixChrome82795[i] === this._node && fixChrome82795.splice(i--, 1);
		}
		this._node = this._context = null;
		this.kill();
		this.emit('kill');
	},
	getPlaybackTime: function(){
		return this._context.currentTime * this.sampleRate;
	},
});

sinks.webkit.fix82795 = fixChrome82795;

/**
 * A dummy Sink. (No output)
*/

sinks('dummy', function(){
	var 	self		= this;
	self.start.apply(self, arguments);
	
	function bufferFill(){
		var	soundData = new Float32Array(self.bufferSize * self.channelCount);
		self.process(soundData, self.channelCount);
	}

	self._kill = Sink.doInterval(bufferFill, self.bufferSize / self.sampleRate * 1000);

	self._callback		= bufferFill;
}, {
	kill: function () {
		this._kill();
		this.emit('kill');
	},
}, true);

Sink.sinks		= Sink.devices = sinks;
Sink.Recording		= Recording;

(function(){

var	BlobBuilder	= typeof window === 'undefined' ? undefined :
	window.MozBlobBuilder || window.WebKitBlobBuilder || window.MSBlobBuilder || window.OBlobBuilder || window.BlobBuilder,
	URL		= typeof window === 'undefined' ? undefined : (window.MozURL || window.webkitURL || window.MSURL || window.OURL || window.URL);

/**
 * Creates an inline worker using a data/blob URL, if possible.
 *
 * @static Sink
 *
 * @arg {String} script
 *
 * @return {Worker} A web worker, or null if impossible to create.
*/

function inlineWorker (script) {
	var	worker	= null,
		url, bb;
	try {
		bb	= new BlobBuilder();
		bb.append(script);
		url	= URL.createObjectURL(bb.getBlob());
		worker	= new Worker(url);

		worker._terminate	= worker.terminate;
		worker._url		= url;
		bb			= null;

		worker.terminate = function () {
			this._terminate;
			URL.revokeObjectURL(this._url);
		};

		inlineWorker.type = 'blob';

		return worker;

	} catch (e) {}

	try {
		worker			= new Worker('data:text/javascript;base64,' + btoa(script));
		inlineWorker.type	= 'data';

		return worker;

	} catch (e) {}

	return worker;
}

inlineWorker.ready = inlineWorker.working = false;

Sink.EventEmitter.call(inlineWorker);

inlineWorker.test = function () {
	var	worker	= inlineWorker('this.onmessage=function(e){postMessage(e.data)}'),
		data	= 'inlineWorker';
	inlineWorker.ready = inlineWorker.working = false;

	function ready(success) {
		if (inlineWorker.ready) return;
		inlineWorker.ready	= true;
		inlineWorker.working	= success;
		inlineWorker.emit('ready', [success]);
		inlineWorker.off('ready');
		success && worker && worker.terminate();
		worker = null;
	}

	if (!worker) {
		ready(false);
	} else {
		worker.onmessage = function (e) {
			ready(e.data === data);
		};
		worker.postMessage(data);
		setTimeout(function () {
			ready(false);
		}, 1000);
	}
};

Sink.inlineWorker = inlineWorker;

inlineWorker.test();

}());

/**
 * Creates a timer with consistent (ie. not clamped) intervals even in background tabs.
 * Uses inline workers to achieve this. If not available, will revert to regular timers.
 *
 * @static Sink
 * @name x
 *
 * @arg {Function} callback The callback to trigger on timer hit.
 * @arg {Number} timeout The interval between timer hits.
 *
 * @return {Function} A function to cancel the timer.
*/

Sink.doInterval		= function (callback, timeout) {
	var timer, kill;

	function create (noWorker) {
		if (Sink.inlineWorker.working && !noWorker) {
			timer = Sink.inlineWorker('setInterval(function(){ postMessage("tic"); }, ' + timeout + ');');
			timer.onmessage = function(){
				callback();
			};
			kill = function () {
				timer.terminate();
			};
		} else {
			timer = setInterval(callback, timeout);
			kill = function(){
				clearInterval(timer);
			};
		}
	}

	if (Sink.doInterval.backgroundWork || Sink.devices.moz.backgroundWork){
		Sink.inlineWorker.ready ? create() : Sink.inlineWorker.on('ready', function(){
			create();
		});
	} else {
		create(true);
	}

	return function () {
		if (!kill) {
			Sink.inlineWorker.ready || Sink.inlineWorker.on('ready', function () {
				kill && kill();
			});
		} else {
			kill();
		}
	};
};

Sink.doInterval.backgroundWork = true;

Sink.singleton = function () {
	var sink = Sink.apply(null, arguments);

	Sink.singleton = function () {
		return sink;
	};

	return sink;
};

(function(){

/**
 * If method is supplied, adds a new interpolation method to Sink.interpolation, otherwise sets the default interpolation method (Sink.interpolate) to the specified property of Sink.interpolate.
 *
 * @arg {String} name The name of the interpolation method to get / set.
 * @arg {Function} !method The interpolation method.
*/

function interpolation(name, method){
	if (name && method){
		interpolation[name] = method;
	} else if (name && interpolation[name] instanceof Function){
		Sink.interpolate = interpolation[name];
	}
	return interpolation[name];
}

Sink.interpolation = interpolation;


/**
 * Interpolates a fractal part position in an array to a sample. (Linear interpolation)
 *
 * @param {Array} arr The sample buffer.
 * @param {number} pos The position to interpolate from.
 * @return {Float32} The interpolated sample.
*/
interpolation('linear', function(arr, pos){
	var	first	= Math.floor(pos),
		second	= first + 1,
		frac	= pos - first;
	second		= second < arr.length ? second : 0;
	return arr[first] * (1 - frac) + arr[second] * frac;
});

/**
 * Interpolates a fractal part position in an array to a sample. (Nearest neighbour interpolation)
 *
 * @param {Array} arr The sample buffer.
 * @param {number} pos The position to interpolate from.
 * @return {Float32} The interpolated sample.
*/
interpolation('nearest', function(arr, pos){
	return pos >= arr.length - 0.5 ? arr[0] : arr[Math.round(pos)];
});

interpolation('linear');

}());


/**
 * Resamples a sample buffer from a frequency to a frequency and / or from a sample rate to a sample rate.
 *
 * @static Sink
 * @name resample
 *
 * @arg {Buffer} buffer The sample buffer to resample.
 * @arg {Number} fromRate The original sample rate of the buffer, or if the last argument, the speed ratio to convert with.
 * @arg {Number} fromFrequency The original frequency of the buffer, or if the last argument, used as toRate and the secondary comparison will not be made.
 * @arg {Number} toRate The sample rate of the created buffer.
 * @arg {Number} toFrequency The frequency of the created buffer.
 *
 * @return The new resampled buffer.
*/
Sink.resample	= function(buffer, fromRate /* or speed */, fromFrequency /* or toRate */, toRate, toFrequency){
	var
		argc		= arguments.length,
		speed		= argc === 2 ? fromRate : argc === 3 ? fromRate / fromFrequency : toRate / fromRate * toFrequency / fromFrequency,
		l		= buffer.length,
		length		= Math.ceil(l / speed),
		newBuffer	= new Float32Array(length),
		i, n;
	for (i=0, n=0; i<l; i += speed){
		newBuffer[n++] = Sink.interpolate(buffer, i);
	}
	return newBuffer;
};

/**
 * Splits a sample buffer into those of different channels.
 *
 * @static Sink
 * @name deinterleave
 *
 * @arg {Buffer} buffer The sample buffer to split.
 * @arg {Number} channelCount The number of channels to split to.
 *
 * @return {Array} An array containing the resulting sample buffers.
*/

Sink.deinterleave = function(buffer, channelCount){
	var	l	= buffer.length,
		size	= l / channelCount,
		ret	= [],
		i, n;
	for (i=0; i<channelCount; i++){
		ret[i] = new Float32Array(size);
		for (n=0; n<size; n++){
			ret[i][n] = buffer[n * channelCount + i];
		}
	}
	return ret;
};

/**
 * Joins an array of sample buffers into a single buffer.
 *
 * @static Sink
 * @name resample
 *
 * @arg {Array} buffers The buffers to join.
 * @arg {Number} !channelCount The number of channels. Defaults to buffers.length
 * @arg {Buffer} !buffer The output buffer.
 *
 * @return {Buffer} The interleaved buffer created.
*/

Sink.interleave = function(buffers, channelCount, buffer){
	channelCount		= channelCount || buffers.length;
	var	l		= buffers[0].length,
		bufferCount	= buffers.length,
		i, n;
	buffer			= buffer || new Float32Array(l * channelCount);
	for (i=0; i<bufferCount; i++){
		for (n=0; n<l; n++){
			buffer[i + n * channelCount] = buffers[i][n];
		}
	}
	return buffer;
};

/**
 * Mixes two or more buffers down to one.
 *
 * @static Sink
 * @name mix
 *
 * @arg {Buffer} buffer The buffer to append the others to.
 * @arg {Buffer} bufferX The buffers to append from.
 *
 * @return {Buffer} The mixed buffer.
*/

Sink.mix = function(buffer){
	var	buffers	= [].slice.call(arguments, 1),
		l, i, c;
	for (c=0; c<buffers.length; c++){
		l = Math.max(buffer.length, buffers[c].length);
		for (i=0; i<l; i++){
			buffer[i] += buffers[c][i];
		}
	}
	return buffer;
};

/**
 * Resets a buffer to all zeroes.
 *
 * @static Sink
 * @name resetBuffer
 *
 * @arg {Buffer} buffer The buffer to reset.
 *
 * @return {Buffer} The 0-reset buffer.
*/

Sink.resetBuffer = function(buffer){
	var	l	= buffer.length,
		i;
	for (i=0; i<l; i++){
		buffer[i] = 0;
	}
	return buffer;
};

/**
 * Copies the content of a buffer to another buffer.
 *
 * @static Sink
 * @name clone
 *
 * @arg {Buffer} buffer The buffer to copy from.
 * @arg {Buffer} !result The buffer to copy to.
 *
 * @return {Buffer} A clone of the buffer.
*/

Sink.clone = function(buffer, result){
	var	l	= buffer.length,
		i;
	result = result || new Float32Array(l);
	for (i=0; i<l; i++){
		result[i] = buffer[i];
	}
	return result;
};

/**
 * Creates an array of buffers of the specified length and the specified count.
 *
 * @static Sink
 * @name createDeinterleaved
 *
 * @arg {Number} length The length of a single channel.
 * @arg {Number} channelCount The number of channels.
 * @return {Array} The array of buffers.
*/

Sink.createDeinterleaved = function(length, channelCount){
	var	result	= new Array(channelCount),
		i;
	for (i=0; i<channelCount; i++){
		result[i] = new Float32Array(length);
	}
	return result;
};

global.Sink = Sink;
}(function(){ return this; }()));
/**
 * Creates a Bit Crusher Effect.
 * Adapted from http://www.musicdsp.org/archive.php?classid=4#139
 * 
 * @effect
 *
 * @arg =!sampleRate
 * @arg =!bits
 *
 * @param type:UInt units:Hz default:44100 sampleRate Sample Rate the apparatus operates on.
 * @param type:UInt units:bits default:8 bits Bit resolution of output signal.
*/
function BitCrusher(sampleRate, bits){
	var	self	= this,
		sample  = 0.0;
	self.sampleRate	= sampleRate;
	self.resolution	= bits ? Math.pow(2, bits-1) : Math.pow(2, 8-1); // Divided by 2 for signed samples (8bit range = 7bit signed)
	self.pushSample	= function(s){
		sample	= Math.floor(s*self.resolution+0.5)/self.resolution
		return sample;
	};
	self.getMix = function(){
		return sample;
	};
}
/**
 * Creates a dynamic amplitude limiter.
 *
 * Requires [[Amplitude]].
 * 
 * @effect
 *
 * @arg =!sampleRate
 * @arg =!threshold
 * @arg =!attack
 * @arg =!release
 *
 * @param type:UInt units:Hz default:44100 sampleRate Sample Rate the apparatus operates on.
 * @param type:Float min:0.0 default:0.95 threshold The amplitude threshold after which to start limiting.
 * @param type:Float min:0.0 default:0.01 attack The speed on which the amplitude metering reacts.
 * @param type:Float min:0.0 default:0.01 release The speed on which the amplitude metering cools down.
*/
function Limiter(sampleRate, threshold, attack, release){
	this.sampleRate		= isNaN(sampleRate) ? this.sampleRate : sampleRate;
	this.threshold		= isNaN(threshold) ? this.threshold : threshold;
	this.attack		= isNaN(attack) ? this.attack : attack;
	this.release		= isNaN(release) ? this.release : release;
	this._amplitude		= new audioLib.Amplitude(this.sampleRate, this.attack, this.release);
}

Limiter.prototype = {
	sampleRate:	44100,
	threshold:	0.95,
	attack:		0.01,
	release:	0.01,
	/* The Amplitude meter on which the limiting is based. */
	__amplitude:	null,
	/* The current output of the effect. */
	sample:		0,
/**
 * Processes a sample, moving the effect one sample further in sample-time.
 *
 * @arg {Float32} sample The sample to process.
 * @arg {Uint} channel The channel on which the sample is. (Only if multi-channel)
 * @return {Float32} The current output of the effect. (Only if single-channel)
*/
	pushSample: function(s){
		var	d	= this._amplitude.pushSample(s) - this.threshold;
		this.sample	= d > 0 ? s / (1 + d) : s;
		return this.sample;
	},
/**
 * Returns the current output of the effect.
 *
 * @arg {Uint} channel The channel for which to get the sample.
 * @return {Float32} The current output of the effect.
*/
	getMix: function(){
		return this.sample;
	},
/**
 * Sets a parameter of the effect, making necessary relative calculations.
 *
 * @arg {String} param The parameter name.
 * @arg {Object} value The new value of the parameter.
*/
	setParam: function(param, value){
		switch(param){
		case 'attack':
		case 'release':
			this._amplitude[param] = value;
		default:
			this[param] = value;
		}
	}
};
/**
 * Creates a Reverb Effect, based on the Freeverb algorithm
 * 
 * @effect Reverb
 *
 * @arg =!sampleRate
 * @arg =!channelCount
 * @arg =!wet
 * @arg =!dry
 * @arg =!roomSize
 * @arg =!damping
 * @arg {Object} !tuningOverride Freeverb tuning overwrite object.
 *
 * @param type:UInt units:Hz default:44100 sampleRate Sample Rate the apparatus operates on.
 * @param type:UInt min:1 default:2 channelCount The channel count of the Reverb.
 * @param type:Float default:0.5 wet The gain of the reverb signal output.
 * @param type:Float default:0.55 dry The gain of the original signal output.
 * @param type:Float min:0.0 max:1.0 default:0.5 roomSize The size of the simulated reverb area.
 * @param type:Float min:0.0 max:1.0 default:0.2223 damping Reverberation damping parameter.
*/
function Freeverb(sampleRate, channelCount, wet, dry, roomSize, damping, tuningOverride){
	var	self		= this;
	self.sampleRate		= sampleRate;
	self.channelCount	= isNaN(channelCount) ? self.channelCount : channelCount;
	self.wet		= isNaN(wet) ? self.wet: wet;
	self.dry		= isNaN(dry) ? self.dry: dry;
	self.roomSize		= isNaN(roomSize) ? self.roomSize: roomSize;
	self.damping		= isNaN(damping) ? self.damping: damping;
	self.tuning		= new Freeverb.Tuning(tuningOverride || self.tuning);
	
	self.sample	= (function(){
		var	sample	= [],
			c;
		for(c=0; c<self.channelCount; c++){
			sample[c] = 0.0;
		}
		return sample;
	}());

	self.CFs	= (function(){
		var 	combs	= [],
			channel	= [],
			num	= self.tuning.combCount,
			damp	= self.damping * self.tuning.scaleDamping,
			feed	= self.roomSize * self.tuning.scaleRoom + self.tuning.offsetRoom,
			sizes	= self.tuning.combTuning,
			i, c;
		for(c=0; c<self.channelCount; c++){
			for(i=0; i<num; i++){
				channel.push(new audioLib.CombFilter(self.sampleRate, sizes[i] + c * self.tuning.stereoSpread, feed, damp));
			}
			combs.push(channel);
			channel = [];
		}
		return combs;
	}());
	self.numCFs	= self.CFs[0].length;
	
	self.APFs	= (function(){
		var 	apfs	= [],
			channel	= [],
			num	= self.tuning.allPassCount,
			feed	= self.tuning.allPassFeedback,
			sizes	= self.tuning.allPassTuning,
			i, c;
		for(c=0; c<self.channelCount; c++){
			for(i=0; i<num; i++){
				channel.push(new Freeverb.AllPassFilter(self.sampleRate, sizes[i] + c * self.tuning.stereoSpread, feed));
			}
			apfs.push(channel);
			channel = [];
		}
		return apfs;
	}());
	self.numAPFs	= self.APFs[0].length;
}

Freeverb.prototype = {
	channelCount: 	2,
	sample:		[0.0, 0.0],

	wet:		0.5,
	dry:		0.55,
	damping:	0.2223,
	roomSize:	0.5,

	tuning: {
	},

	pushSample: function(s, channel){
		var	input	= s * this.tuning.fixedGain,
			output	= 0,
			i;
		for(i=0; i < this.numCFs; i++){
			output += this.CFs[channel][i].pushSample(input);
		}
		for(i=0; i < this.numAPFs; i++){
			output = this.APFs[channel][i].pushSample(output);
		}
		this.sample[channel] = output * this.wet + s * this.dry;
	},

	getMix: function(channel){
		return this.sample[channel];
	},

	reset: function(){
		var	i,
			c;
		for(c=0; c < this.channelCount; c++){
			for(i=0; i < this.numCFs; i++){
				this.CFs[c][i].reset();
			}
			for(i=0; i < this.numAPFs; i++){
				this.APFs[c][i].reset();
			}
			this.sample[c] = 0.0;
		}		
	},

	setParam: function(param, value){
		var	combFeed,
			combDamp,
			i,
			c;
		switch (param){
		case 'roomSize':
			this.roomSize	= value;
			combFeed	= this.roomSize * this.tuning.scaleRoom + this.tuning.offsetRoom;
			for(c=0; c < this.channelCount; c++){
				for(i=0; i < this.numCFs; i++){
					this.CFs[c][i].setParam('feedback', combFeed);
				}
			}
			break;
		case 'damping':
			this.damping	= value;
			combDamp	= this.damping * this.tuning.scaleDamping;
			for(c=0; c < this.channelCount; c++){
				for(i=0; i < this.numCFs; i++){
					this.CFs[c][i].setParam('damping', combDamp);
				}
			}
			break;
		default:
			this[param] = value;
		}
	}

	
};

/**
 * Creates a Freeverb tuning configurement object.
 *
 * @constructor
 * @this {Freeverb.Tuning}
 * @arg {Object} overrides The object containing the values to be overwritten.
*/

Freeverb.Tuning = function FreeverbTuning(overrides){
	var k;
	if (overrides){
		for (k in overrides){
			if (overrides.hasOwnProperty(k)){
				this[k] = overrides[k];
			}
		}
	}
};

Freeverb.Tuning.prototype = {
	combCount:		8,
	combTuning:		[1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617],

	allPassCount:		4,
	allPassTuning:		[556, 441, 341, 225],
	allPassFeedback:	0.5,

	fixedGain:		0.015,
	scaleDamping:		0.9,

	scaleRoom:		0.28,
	offsetRoom:		0.7,
	
	stereoSpread:		23
};

/**
 * Creates an All-Pass Filter Effect, based on the Freeverb APF.
 * 
 * @name AllPassFilter
 * @subeffect Freeverb FreeverbAllPassFilter
 *
 * @arg =!sampleRate
 * @arg {number} default:500 !delaySize Size (in samples) of the delay line buffer.
 * @arg =!feedback
 *
 * @param type:UInt units:Hz default:44100 sampleRate Sample Rate the apparatus operates on.
 * @param type:Float min:0.0 max:1.0 default:0.5 feedback Amount of feedback.
*/
Freeverb.AllPassFilter = function AllPassFilter(sampleRate, delaySize, feedback){
	var	self	= this;
	self.sampleRate	= sampleRate;
	self.buffer	= new Float32Array(isNaN(delaySize) ? 500 : delaySize);
	self.bufferSize	= self.buffer.length;
	self.feedback	= isNaN(feedback) ? self.feedback : feedback;
};

Freeverb.AllPassFilter.prototype = {
	sample:		0.0,
	index:		0,
	feedback:	0.5,

	pushSample: function(s){
		var	self		= this;
			bufOut		= self.buffer[self.index];
		self.sample		= -s + bufOut;
		self.buffer[self.index++] = s + bufOut * self.feedback;
		if (self.index >= self.bufferSize) {
			self.index = 0;
		}
		return self.sample;
	},
	getMix: function(){
		return this.sample;
	},
	reset: function(){
		this.index	= 0;
		this.sample	= 0.0;
		this.buffer	= new Float32Array(this.bufferSize);
	}
}
/**
 * Creates a Comb Filter effect.
 * Defaults to Freeverb defaults.
 *
 * @effect
 *
 * @arg =!sampleRate
 * @arg =!delaySize
 * @arg =!feedback
 * @arg =!damping
 *
 * @param type:UInt units:Hz default:44100 sampleRate Sample Rate the apparatus operates on.
 * @param type:UInt units:samples default:1200 delaySize Size of the delay line buffer.
 * @param type:Float min:0.0 max:0.0 default:0.84 feedback Amount of feedback for the CombFilter.
 * @param type:Float min:0.0 max:0.0 default:0.2 damping Amount of damping for the CombFilter.
*/
function CombFilter(sampleRate, delaySize, feedback, damping){
	var	self	= this;
	self.sampleRate	= sampleRate;
	self.buffer	= new Float32Array(isNaN(delaySize) ? 1200 : delaySize);
	self.bufferSize	= self.buffer.length;
	self.feedback	= isNaN(feedback) ? self.feedback : feedback;
	self.damping	= isNaN(damping) ? self.damping : damping;
	self.invDamping	= 1 - self.damping;
}

CombFilter.prototype = {
	sample:		0.0,
	index:		0,
	store:		0,

	feedback:	0.84,
	damping:	0.2,

	pushSample: function(s){
		var	self	= this;
		self.sample	= self.buffer[self.index];
		self.store	= self.sample * self.invDamping + self.store * self.damping;
		self.buffer[self.index++] = s + self.store * self.feedback;
		if (self.index >= self.bufferSize) {
			self.index = 0;
		}
		return self.sample;
	},
	getMix: function(){
		return this.sample;
	},
	reset: function(){
		this.index	= this.store = 0;
		this.samples	= 0.0;
		this.buffer	= new Float32Array(this.bufferSize);
	},
	setParam: function(param, value){
		switch (param){
		case 'damping':
			this.damping	= value;
			this.invDamping	= 1 - value;
			break;
		default:
			this[param] = value;
			break;
		}
	}

};
/**
 * Creates a IIRFilter effect.
 * Adapted from Corban Brook's dsp.js
 * 
 * @effect
 *
 * @arg =!sampleRate
 * @arg =!cutoff
 * @arg =!resonance
 * @arg =!type
 *
 * @param type:UInt units:Hz default:44100 sampleRate Sample Rate the apparatus operates on.
 * @param type:Float units:Hz min:40.0 default:20000 cutoff The cutoff frequency of the IIRFilter.
 * @param type:Float min:0.0 max:1.0 default:0.1 resonance The resonance of the IIRFilter.
 * @param type:UInt default:0 type The type of the filter (LowPass, HighPass, BandPass, Notch).
*/
function IIRFilter(sampleRate, cutoff, resonance, type){
	var	self	= this,
		f	= [0.0, 0.0, 0.0, 0.0],
		freq, damp,
		prevCut, prevReso,

		sin	= Math.sin,
		min	= Math.min,
		pow	= Math.pow;

	self.cutoff = isNaN(cutoff) ? 20000 : cutoff; // > 40
	self.resonance = !resonance ? 0.1 : resonance; // 0.0 - 1.0
	self.samplerate = isNaN(sampleRate) ? 44100 : sampleRate;
	self.type = type || 0;

	function calcCoeff(){
		freq = 2 * sin(Math.PI * min(0.25, self.cutoff / (self.samplerate * 2)));
		damp = min(2 * (1 - pow(self.resonance, 0.25)), min(2, 2 / freq - freq * 0.5));
	}

	self.pushSample = function(sample){
		if (prevCut !== self.cutoff || prevReso !== self.resonance){
			calcCoeff();
			prevCut = self.cutoff;
			prevReso = self.resonance;
		}

		f[3] = sample - damp * f[2];
		f[0] = f[0] + freq * f[2];
		f[1] = f[3] - f[0];
		f[2] = freq * f[1] + f[2];

		f[3] = sample - damp * f[2];
		f[0] = f[0] + freq * f[2];
		f[1] = f[3] - f[0];
		f[2] = freq * f[1] + f[2];

		return f[self.type];
	};

	self.getMix = function(type){
		return f[type || self.type];
	};
}
/**
 * A Custom Biquad Filter Effect
 * http://en.wikipedia.org/wiki/Digital_biquad_filter
 * Adapted from http://www.musicdsp.org/files/Audio-EQ-Cookbook.txt
 * 
 * @effect
 *
 * @arg =sampleRate
 * @arg =b0
 * @arg =b1
 * @arg =b2
 * @arg =a1
 * @arg =a2
 *
 * @param type:UInt units:Hz default:44100 sampleRate Sample Rate the apparatus operates on.
 * @param {number} b0 Biquadratic difference equation parameter
 * @param {number} b1 Biquadratic difference equation parameter
 * @param {number} b2 Biquadratic difference equation parameter
 * @param {number} a1 Biquadratic difference equation parameter
 * @param {number} a2 Biquadratic difference equation parameter
*/
function BiquadFilter(sampleRate, b0, b1, b2, a1, a2){
	this.reset.apply(this, arguments)
}

/**
 * A generic Biquad Filter class, used internally to create BiquadFilter classes.
 * @constructor
 * @this BiquadFilterClass
*/
BiquadFilter.BiquadFilterClass = function BiquadFilterClass(){
	var k;
	for (k in BiquadFilterClass.prototype){
		if (BiquadFilterClass.prototype.hasOwnProperty){
			this[k] = this[k];
		}
	}
};

BiquadFilter.BiquadFilterClass.prototype = {
	sampleRate:	44100,
	sample:		0,
	inputs:		null,
	outputs:	null,
	coefs:		null,
	pushSample: function(s){
		var	c	= this.coefs,
			i	= this.inputs,
			o	= this.outputs;
		this.sample = c.b0 * s + c.b1 * i[0] + c.b2 * i[1] - c.a1 * o[0] - c.a2 * o[1];
		i.pop();
		i.unshift(s);
		o.pop();
		o.unshift(this.sample);
		return this.sample;
	},
	getMix: function(){
		return this.sample;
	},
	reset: function(sampleRate, b0, b1, b2, a1, a2){
		this.inputs = [0,0];
		this.outputs = [0,0];
		this.sampleRate = isNaN(sampleRate) ? this.sampleRate : sampleRate;
		if (arguments.length > 1){
			this.coefs	= { b0:b0, b1:b1, b2:b2, a1:a1, a2:a2 };
		}
	}
};

/**
 * Creates a Biquad Low-Pass Filter Effect
 * 
 * @name LowPass
 * @subeffect BiquadFilter BiquadLowPassFilter
 *
 * @arg =sampleRate
 * @arg =cutoff
 * @arg =Q
 *
 * @param type:UInt units:Hz sampleRate Sample Rate the apparatus operates on.
 * @param type:Float units:Hz cutoff Low-pass cutoff frequency.
 * @param type:Float min:0.0 max:1.0 Q Filter Q-factor (Q<0.5 filter underdamped, Q>0.5 filter overdamped)
*/
BiquadFilter.LowPass = function(sampleRate, cutoff, Q){
	var	w0	= 2* Math.PI*cutoff/sampleRate,
		cosw0	= Math.cos(w0),
		sinw0   = Math.sin(w0),
		alpha   = sinw0/(2*Q),
		b0	=  (1 - cosw0)/2,
		b1	=   1 - cosw0,
		b2	=   b0,
		a0	=   1 + alpha,
		a1	=  -2*cosw0,
		a2	=   1 - alpha;
	this.reset(sampleRate, b0/a0, b1/a0, b2/a0, a1/a0, a2/a0);
};

/**
 * Creates a Biquad High-Pass Filter Effect
 * 
 * @name HighPass
 * @subeffect BiquadFilter BiquadHighPassFilter
 *
 * @arg =sampleRate
 * @arg =cutoff
 * @arg =Q
 *
 * @param type:UInt units:Hz sampleRate Sample Rate the apparatus operates on.
 * @param type:Float units:Hz cutoff High-pass cutoff frequency.
 * @param type:Float min:0.0 max:1.0 Q Filter Q-factor (Q<0.5 filter underdamped, Q>0.5 filter overdamped)
*/
BiquadFilter.HighPass = function(sampleRate, cutoff, Q){
	var	w0	= 2* Math.PI*cutoff/sampleRate,
		cosw0   = Math.cos(w0),
		sinw0   = Math.sin(w0),
		alpha   = sinw0/(2*Q),
		b0	=  (1 + cosw0)/2,
		b1	= -(1 + cosw0),
		b2	=   b0,
		a0	=   1 + alpha,
		a1	=  -2*cosw0,
		a2	=   1 - alpha;
	this.reset(sampleRate, b0/a0, b1/a0, b2/a0, a1/a0, a2/a0);
};

/**
 * Creates a Biquad All-Pass Filter Effect
 * 
 * @name AllPass
 * @subeffect BiquadFilter BiquadAllPassFilter
 *
 * @arg =sampleRate
 * @arg =f0
 * @arg =Q
 *
 * @param type:UInt units:Hz sampleRate Sample Rate the apparatus operates on.
 * @param type:Float units:Hz min:0.0 f0 Significant frequency: filter will cause a phase shift of 180deg at f0.
 * @param type:Float min:0.0 max:1.0 Q Filter Q-factor (Q<0.5 filter underdamped, Q>0.5 filter overdamped)
*/
BiquadFilter.AllPass = function(sampleRate, f0, Q){
	var	w0	= 2* Math.PI*f0/sampleRate,
		cosw0   = Math.cos(w0),
		sinw0   = Math.sin(w0),
		alpha   = sinw0/(2*Q),
		b0	=  1 - alpha,
		b1	= -2*cosw0,
		b2	=  1 + alpha,
		a0	=  b2,
		a1	=  b1,
		a2	=  b0;
	this.reset(sampleRate, b0/a0, b1/a0, b2/a0, a1/a0, a2/a0);
};

/**
 * Creates a Biquad Band-Pass Filter Effect
 * 
 * @name BandPass
 * @subeffect BiquadFilter BiquadBandPassFilter
 *
 * @arg =sampleRate
 * @arg =centerFreq
 * @arg =bandwidthInOctaves
 *
 * @param type:UInt units:Hz sampleRate Sample Rate the apparatus operates on.
 * @param type:Float units:Hz min:0.0 centerFreq Center frequency of filter: 0dB gain at center peak
 * @param type:Float units:octaves min:0 bandwidthInOctaves Bandwidth of the filter (between -3dB points).
*/
BiquadFilter.BandPass = function(sampleRate, centerFreq, bandwidthInOctaves){
	var	w0	= 2* Math.PI*centerFreq/sampleRate,
		cosw0	= Math.cos(w0),
		sinw0	= Math.sin(w0),
		toSinh	= Math.log(2)/2 * bandwidthInOctaves * w0/sinw0,
		alpha	= sinw0*(Math.exp(toSinh) - Math.exp(-toSinh))/2,
		b0	= alpha,
		b1	= 0,
		b2	= -alpha,
		a0	= 1 + alpha,
		a1	= -2 * cosw0,
		a2	= 1 - alpha;
	this.reset(sampleRate, b0/a0, b1/a0, b2/a0, a1/a0, a2/a0);
};

(function(classes, i){
for (i=0; i<classes.length; i++){
	classes[i].prototype = new BiquadFilter.BiquadFilterClass();
}
}([BiquadFilter, BiquadFilter.LowPass, BiquadFilter.HighPass, BiquadFilter.AllPass, BiquadFilter.BandPass]));
/**
 * Creates a Compressor Effect
 * 
 * @effect
 *
 * @arg =!sampleRate
 * @arg =!scaleBy
 * @arg =!gain
 * 
 * @param type:UInt units:Hz default:44100 sampleRate Sample Rate the apparatus operates on.
 * @param type:UInt min:1 scaleBy Signal scaling factor. If mixing n unscaled waveforms, use scaleBy=n.
 * @param type:Float min:0.0 max:2.0 default:0.5 gain Gain factor.
*/
function Compressor(sampleRate, scaleBy, gain){
	var	self	= this,
		sample  = 0.0;
	self.sampleRate	= sampleRate;
	self.scale	= scaleBy || 1;
	self.gain	= isNaN(gain) ? 0.5 : gain;
	self.pushSample = function(s){
		s	/= self.scale;
		sample	= (1 + self.gain) * s - self.gain * s * s * s;
		return sample;
	};
	self.getMix = function(){
		return sample;
	};
}
/**
 * Creates a Chorus effect.
 * Depends on [[Oscillator]]
 *
 * @effect
 *
 * @arg =!sampleRate
 * @arg =!delayTime
 * @arg =!depth
 * @arg =!freq
 *
 * @param type:UInt units:Hz default:44100 sampleRate Sample Rate the apparatus operates on.
 * @param type:Float units:ms min:0.0 delayTime Delay time of the chorus.
 * @param type:UInt depth Depth of the Chorus.
 * @param type:Float units:Hz min:0.0 freq The frequency of the LFO running the Chorus.
*/
function Chorus(sampleRate, delayTime, depth, freq){
	var	self		= this,
		buffer, bufferPos, sample;

	self.delayTime	= delayTime || 30;
	self.depth	= depth	|| 3;
	self.freq	= freq || 0.1;

	function calcCoeff(){
		buffer = new Float32Array(self.sampleRate * 0.1);
		bufferPos = 0;
		var i, l = buffer.length;
		for (i=0; i<l; i++){
			buffer[i] = 0.0;
		}
	}

	self.sampleRate = sampleRate;
	self.osc = new Oscillator(sampleRate, freq);
	self.calcCoeff = calcCoeff;
	self.pushSample = function(s){
		if (++bufferPos >= buffer.length){
			bufferPos = 0;
		}
		buffer[bufferPos] = s;
		self.osc.generate();

		var delay = self.delayTime + self.osc.getMix() * self.depth;
		delay *= self.sampleRate / 1000;
		delay = bufferPos - Math.floor(delay);
		while(delay < 0){
			delay += buffer.length;
		}

		sample = buffer[delay];
		return sample;
	};
	self.getMix = function(){
		return sample;
	};

	calcCoeff();
}
/**
 * Creates a LP12Filter effect.
 * Adapted from Corban Brook's dsp.js
 * 
 * @effect
 *
 * @arg =!sampleRate
 * @arg =!cutoff
 * @arg =!resonance
 *
 * @param type:UInt units:Hz default:44100 sampleRate Sample Rate the apparatus operates on.
 * @param type:Float units:Hz min:40 default:20000 cutoff The cutoff frequency of the filter.
 * @param type:Float min:1.0 max:20.0 default:1 resonance The resonance of the filter.
*/
function LP12Filter(samplerate, cutoff, resonance){
	var	self		= this,
		vibraSpeed	= 0,
		vibraPos	= 0,
		pi2		= Math.PI * 2,
		w, q, r, c,
		prevCut, prevReso;

	self.cutoff = !cutoff ? 20000 : cutoff; // > 40
	self.resonance = !resonance ? 1 : resonance; // 1 - 20
	self.samplerate = samplerate;

	function calcCoeff(){
		w = pi2 * self.cutoff / self.samplerate;
		q = 1.0 - w / (2 * (self.resonance + 0.5 / (1.0 + w)) + w - 2);
		r = q * q;
		c = r + 1 - 2 * Math.cos(w) * q;
	}

	self.pushSample = function(sample){
		if (prevCut !== self.cutoff || prevReso !== self.resonance){
			calcCoeff();
			prevCut = self.cutoff;
			prevReso = self.resonance;
		}
		vibraSpeed += (sample - vibraPos) * c;
		vibraPos += vibraSpeed;
		vibraSpeed *= r;
		return vibraPos;
	};

	self.getMix = function(){
		return vibraPos;
	};

	calcCoeff();
}
/**
 * Creates a Delay effect.
 * 
 * @effect
 *
 * @arg =!sampleRate
 * @arg =!time
 * @arg =!feedback
 *
 * @param type:UInt units:Hz default:44100 sampleRate Sample Rate the apparatus operates on.
 * @param type:Float units:ms min:0.0 default:1000 time The delay time between the individual delays.
 * @param type:Float min:0.0 max:0.0 default:0.0 feedback The amount of feedback in the delay line.
*/
function Delay(sampleRate, time, feedback){
	var	self	= this;
	self.time	= isNaN(time) ? self.time : time;
	self.feedback	= isNaN(feedback) ? self.feedback : feedback;
	self.reset(sampleRate);
}

Delay.prototype = {
	sampleRate:	1,
	time:		1000,
	feedback:	0,
	/* Buffer position of the Delay. */
	bufferPos:	0,
	/* AudioBuffer in which the delay line is stored. */
	buffer:		null,
	/* Current output of the Delay */
	sample:		0,

/* Reverse sample time factor */
	_rstf:		1,
/**
 * Adds a new sample to the delay line, moving the effect one sample forward in sample time.
 *
 * @arg {Float32} sample The sample to be added to the delay line.
 * @return {Float32} Current output of the Delay.
*/
	pushSample: function(s){
		var	self	= this,
			buffer	= self.buffer;
		buffer[self.bufferPos++] += s;
		if (self.bufferPos > self.time * self._rstf){
			self.bufferPos = 0;
		}
		self.sample = buffer[self.bufferPos];
		buffer[self.bufferPos] *= self.feedback;
		return self.sample;
	},
/**
 * Returns the current output of the Delay.
 *
 * @return {Float32} Current output of the Delay.
*/
	getMix: function(){
		return this.sample;
	},
/**
 * Changes the time value of the Delay and resamples the delay line accordingly.
 *
 * Requires sink.js
 *
 * @method Delay
 *
 * @arg {Uint} time The new time value for the Delay.
 * @return {AudioBuffer} The new delay line audio buffer.
*/
	resample: function(time){
		var	self	= this,
			ratio	= self.time / time;
		self.buffer	= audioLib.Sink.resample(self.buffer, time);
		self.time	= time;
		self.bufferPos	= Math.round(ratio * self.bufferPos);
		return self.buffer;
	},
/**
 * Resets the delay line, to recover from sample rate changes or such.
 *
 * @arg {Number} sampleRate The new sample rate. (Optional)
 * @arg {Boolean} resample Determines whether to resample and apply the old buffer. (Requires Sink)
 * @return {AudioBuffer} The new delay line audio buffer.
*/
	reset: function(sampleRate, resample){
		var	self	= this,
			buf	= self.buffer,
			i, ratio;
		sampleRate	= isNaN(sampleRate) ? self.sampleRate : sampleRate;
		ratio		= self.sampleRate / sampleRate;
		self.buffer	= new Float32Array(sampleRate * Delay.MAX_DELAY);
		self.bufferPos	= Math.round(ratio * self.bufferPos);
		self._rstf	= 1 / 1000 * sampleRate;
		if (resample){
			buf = audioLib.Sink.resample(buf, ratio);
			for (i=0; i<buf.length && i<self.buffer.length; i++){
				self.buffer[i] = buf[i];
			}
		}
		return self.buffer;
	}
};

/** The size that will be allocated for delay line buffers on initialization, in seconds */
Delay.MAX_DELAY = 2;
/**
 * Creates a Distortion effect.
 * Requires [[IIRFilter]]
 * 
 * @effect
 *
 * @arg =!sampleRate
 *
 * @param type:UInt units:Hz default:44100 sampleRate Sample Rate the apparatus operates on.
 * @param type:Float default:4 gain The gain value of the Distortion.
 * @param type:Float default:1 master The master volume value of the distortion.
*/
function Distortion(sampleRate) // Based on the famous TubeScreamer.
{
	sampleRate = sampleRate || 44100;
	var	hpf1	= new IIRFilter(sampleRate, 720.484),
		lpf1	= new IIRFilter(sampleRate, 723.431),
		hpf2	= new IIRFilter(sampleRate, 1.0),
		smpl	= 0.0;
	this.gain = 4;
	this.master = 1;
	this.sampleRate = sampleRate;
	this.filters = [hpf1, lpf1, hpf2];
	this.pushSample = function(s){
		hpf1.pushSample(s);
		smpl = hpf1.getMix(1) * this.gain;
		smpl = Math.atan(smpl) + smpl;
		if (smpl > 0.4){
			smpl = 0.4;
		} else if (smpl < -0.4) {
			smpl = -0.4;
		}
		lpf1.pushSample(smpl);
		hpf2.pushSample(lpf1.getMix(0));
		smpl = hpf2.getMix(1) * this.master;
		return smpl;
	};
	this.getMix = function(){
		return smpl;
	};
}
/**
 * Creates a Gain Controller effect.
 *
 * @effect
 *
 * @arg =!sampleRate
 * @arg =!gain
 *
 * @param type:UInt units:Hz default:44100 sampleRate Sample Rate the apparatus operates on.
 * @param type:UInt default:1 gain The gain for the gain controller.
*/
function GainController(sampleRate, gain){
	this.sampleRate	= isNaN(sampleRate) ? this.sampleRate : sampleRate;
	this.gain	= isNaN(gain) ? this.gain : gain;
}

GainController.prototype = {
	sampleRate:	44100,
	gain:		1,
	/* The current output sample of the gain controller */
	sample:		0,
/**
 * Processes provided sample, moves the gain controller one sample forward in the sample time.
 *
 * @arg {Number} s The input sample for the gain controller.
 * @return {Number} The current output sample of the controller.
*/
	pushSample:	function(s){
		this.sample	= s * this.gain;
		return this.sample;
	},
/**
 * Returns the current output sample of the controller.
 *
 * @return {Number} The current output sample of the controller.
*/
	getMix:		function(){
		return this.sample;
	}
};
/**
 * Creates a new Oscillator.
 *
 * @generator
 *
 * @arg =!sampleRate
 * @arg =!frequency
 *
 * @param type:UInt units:Hz default:44100 sampleRate Sample Rate the apparatus operates on.
 * @param type:Float units:Hz min:0 default:440 frequency The frequency of the Oscillator.
 * @param type:Float min:0.0 max:1.0 default:0.0 phaseOffset The phase offset of the Oscillator.
 * @param type:Float min:0.0 max:1.0 default:0.5 pulseWidth The pulse width of the Oscillator.
 * @param type:String|UInt default:sine waveShape The wave shape of the Oscillator.
 * @param type:Float default:0 fm The frequency modulation of the Oscillator.
*/

function Oscillator(sampleRate, freq)
{
	var	self	= this;
	self.frequency	= isNaN(freq) ? 440 : freq;
	self.waveTable	= new Float32Array(1);
	self.sampleRate = sampleRate;
	self.waveShapes	= self.waveShapes.slice(0);
}

(function(FullPI, waveshapeNames, proto, i){

proto = Oscillator.prototype = {
	sampleRate:	44100,
	frequency:	440,
	freqOffset: 0,
	ampOffset:  0,
	phaseOffset:0,
	pulseWidth:	0.5,
	fm:		0,
	waveShape:	'sine',
	/* Phase of the Oscillator */
	phase:		0,
/* The relative of phase of the Oscillator (pulsewidth, phase offset, etc applied). */
	_p:		0,

/**
 * Moves the Oscillator's phase forward by one sample.
*/
	generate: function(){
		var	self	= this,
			f	= +self.frequency,
			pw	= self.pulseWidth,
			p	= self.phase;
		f += f * self.fm;
		self.phase	= (p + f / self.sampleRate / 2) % 1;
		p		= (self.phase + self.phaseOffset) % 1;
		self._p		= p < pw ? p / pw : (p-pw) / (1-pw);
	},
/**
 * Returns the output signal sample of the Oscillator.
 *
 * @return {Float} The output signal sample.
*/
	getMix: function(){
		return this[this.waveShape]();
	},
/**
 * Returns the relative phase of the Oscillator (pulsewidth, phaseoffset, etc applied).
 *
 * @return {Float} The relative phase.
*/
	getPhase: function(){
		return this._p;
	},
/**
 * Resets the Oscillator phase (AND RELATIVE PHASE) to a specified value.
 *
 * @arg {Float} phase The phase to reset the values to. (Optional, defaults to 0).
*/
	reset: function(p){
		this.phase = this._p = isNaN(p) ? 0 : p;
	},
/**
 * Specifies a wavetable for the Oscillator.
 *
 * @method Oscillator
 *
 * @arg {Array<Float>} wavetable The wavetable to be assigned to the Oscillator.
 * @return {Boolean} Succesfulness of the operation.
*/
	setWavetable: function(wt){
		this.waveTable = wt;
		return true;
	},
/**
 * Returns sine wave output of the Oscillator.
 *
 * Phase for the zero crossings of the function: 0.0, 0.5
 *
 * @method Oscillator
 *
 * @return {Float} Sample.
*/
	sine: function(){
		return Math.sin(this._p * FullPI);
	},
/**
 * Returns triangle wave output of the Oscillator, phase zero representing the top of the triangle.
 *
 * Phase for the zero crossings of the function: 0.25, 0.75
 *
 * @method Oscillator
 *
 * @return {Float} Sample.
*/
	triangle: function(){
		return this._p < 0.5 ? 4 * this._p - 1 : 3 - 4 * this._p;
	},
/**
 * Returns square wave output of the Oscillator, phase zero being the first position of the positive side.
 *
 * Phase for the zero crossings of the function: 0.0, 0.5
 *
 * @method Oscillator
 *
 * @return {Float} Sample.
*/
	square: function(){
		return this._p < 0.5 ? -1 : 1;
	},
/**
 * Returns sawtooth wave output of the Oscillator, phase zero representing the negative peak.
 *
 * Phase for the zero crossings of the function: 0.5
 *
 * @method Oscillator
 *
 * @return {Float} Sample.
*/
	sawtooth: function(){
		return 1 - this._p * 2;
	},
/**
 * Returns invert sawtooth wave output of the Oscillator, phase zero representing the positive peak.
 *
 * Phase for the zero crossings of the function: 0.5
 *
 * @method Oscillator
 *
 * @return {Float} Sample.
*/
	invSawtooth: function(){
		return this._p * 2 - 1;
	},
/**
 * Returns pulse wave output of the Oscillator, phase zero representing slope starting point.
 *
 * Phase for the zero crossings of the function: 0.125, 0.325
 *
 * @method Oscillator
 *
 * @return {Float} Sample.
*/
	pulse: function(){
		return this._p < 0.5 ?
			this._p < 0.25 ?
				this._p * 8 - 1 :
				1 - (this._p - 0.25) * 8 :
			-1;
	},
/**
 * Returns wavetable output of the Oscillator.
 *
 * Requires sink.js
 *
 * @method Oscillator
 *
 * @return {Float} Sample.
*/
	wavetable: function(){
		return audioLib.Sink.interpolate(this.wavetable, this._p * this.wavetable.length);
	},
	waveShapes: []
};

for(i=0; i<waveshapeNames.length; i++){
	proto[i] = proto[waveshapeNames[i]];
	proto.waveShapes.push(proto[i]);
}

/**
 * Creates a new wave shape and attaches it to Oscillator.prototype by a specified name.
 *
 * @arg {String} name The name of the wave shape.
 * @arg {Function} algorithm The algorithm for the wave shape. If omitted, no changes are made.
 * @return {Function} The algorithm assigned to Oscillator.prototype by the specified name.
*/

Oscillator.WaveShape = function(name, algorithm){
	if (algorithm){
		this.prototype[name] = algorithm;
	}
	return this.prototype[name];
};

/**
 * Creates a new wave shape that mixes existing wave shapes into a new waveshape and attaches it to Oscillator.prototype by a specified name.
 *
 * @arg {String} name The name of the wave shape.
 * @arg {Array} waveshapes Array of the wave shapes to mix, wave shapes represented as objects where .shape is the name of the wave shape and .mix is the volume of the wave shape.
 * @return {Function} The algorithm created.
*/

Oscillator.createMixWave = function(name, waveshapes){
	var	l = waveshapes.length,
		smpl, i;
	return this.WaveShape(name, function(){
		smpl = 0;
		for (i=0; i<l; i++){
			smpl += this[waveshapes[i].shape]() * waveshapes[i].mix;
		}
		return smpl;
	});
};

}(Math.PI * 2, ['sine', 'triangle', 'pulse', 'sawtooth', 'invSawtooth', 'square']));
/**
 * @generator
 *
 * @arg =!sampleRate
 * @arg =!color
 *
 * @param type:UInt units:Hz default:44100 sampleRate Sample Rate the apparatus operates on.
 * @param type:String default:white color The color of the noise.
 * @param type:Float default:0 value The current value of the noise.
*/
function Noise(){
	this.reset.apply(this, arguments);
}

Noise.prototype = {
	/* The sample rate of the Noise. */
	sampleRate:	44100,
	/* The color of the Noise. */
	color:		'white',
	b0:		0,
	b1:		0,
	b2:		0,
	b3:		0,
	b4:		0,
	b5:		0,
	c1:		null,
	c2:		null,
	c3:		null,
	c4:		null,
	q:		15,
	q0:		null,
	q1:		null,
	/* Brown seed. */
	brownQ:		0,
	/* Current value of the Noise. */
	value:		0,
	reset: function(sampleRate, color){
		this.sampleRate		= isNaN(sampleRate) ? this.sampleRate : sampleRate;
		this.color		= typeof color === 'string' ? color : this.color;
		this.c1			= (1 << this.q) - 1;
		this.c2			= (~~(this.c1 /3)) + 1;
		this.c3			= 1 / this.c1;
		this.c1			= this.c2 * 6;
		this.c4			= 3 * (this.c2 - 1);
		this.q0			= Math.exp(-200 * Math.PI / this.sampleRate);
		this.q1			= 1 - this.q0;
	},
	generate: function(){
		this.value	= this[this.color]();
	},
	getMix: function(){
		return this.value;
	},
/**
 * Returns the white noise output of the noise generator.
 *
 * @method Noise
 *
 * @return {Float} White noise.
*/
	white: function(){
		var r = Math.random();
		return (r * this.c1 - this.c4) * this.c3;
	},
/**
 * Returns the pink noise output of the noise generator.
 *
 * @method Noise
 *
 * @return {Float} Pink noise.
*/
	pink: function(){
		var	w	= this.white();
		this.b0 = 0.997 * this.b0 + 0.029591 * w;
		this.b1 = 0.985 * this.b1 + 0.032534 * w;
		this.b2 = 0.950 * this.b2 + 0.048056 * w;
		this.b3 = 0.850 * this.b3 + 0.090579 * w;
		this.b4 = 0.620 * this.b4 + 0.108990 * w;
		this.b5 = 0.250 * this.b5 + 0.255784 * w;
		return 0.55 * (this.b0 + this.b1 + this.b2 + this.b3 + this.b4 + this.b5);
	},
/**
 * Returns the brown noise output of the noise generator.
 *
 * @method Noise
 *
 * @return {Float} Brown noise.
*/
	brown: function(){
		var	w	= this.white();
		this.brownQ	= (this.q1 * w + this.q0 * this.brownQ);
		return 6.2 * this.brownQ;
	}
};
/**
 * Creates a new Sampler.
 *
 * @generator
 *
 * @arg =!sampleRate
 * @arg =!pitch
 *
 * @param type:UInt units:Hz default:44100 sampleRate Sample Rate the apparatus operates on.
 * @param type:Float units:Hz default:440 pitch The pitch of the Sampler.
 * @param type:Float units:s default:0 min:0 delayStart The time offset where to start playing of the sample from.
 * @param type:float units:s default:0 min:0 delayEnd The time offset from the ending of the sample where to stop playback at.
 * @param type:UInt default:Infinity maxVoices The maximum amount of voices allowed to be played simultaneously.
*/

function Sampler(sampleRate, pitch){
	var	self	= this;
	self.voices	= [];
	self.sampleRate	= sampleRate;
	self.pitch	= isNaN(pitch) ? 440 : self.pitch;
}

Sampler.prototype = {
	sampleRate:	44100,
	pitch:		440,
	delayStart:	0,
	delayEnd:	0,
	maxVoices:	1 / 0,
	/* The length of a single channel of the sample loaded into Sampler, in samples. */
	sampleSize:	0,
	/* An array containing information of all the voices playing currently. */
	voices:		null,
	/* The AudioBuffer representation of the sample used by the sampler. */
	sample:		null,
	/* An array containing the sample, resampled and split by channels as AudioBuffers. */
	samples:	null,
	/* An AudioData object representation of the sample used by the sampler. */
	data:		null,
/**
 * Adds a new voice to the sampler and disbands voices that go past the maxVoices limit.
 *
 * @method Sampler
 *
 * @arg {Float} min:0.0 !frequency Determines the frequency the voice should be played at, relative to the Sampler's pitch.
 * @arg {Float} default:1.0 !velocity The relative volume of the voice.
 * @return {Voice} The voice object created.
*/
	noteOn: function(frequency, velocity){
		frequency	= isNaN(frequency) ? this.pitch : frequency;
		var	self	= this,
			speed	= frequency / self.pitch,
			rate	= self.sampleRate,
			start	= rate * self.delayStart,
			end	= self.sampleSize - rate * self.delayEnd - 1,
			note	= {
				f:	frequency,
				p:	start,
				s:	speed,
				l:	end,
				v:	isNaN(velocity) ? 1 : velocity
			};
		self.voices.push(note);
		while (self.voices.length > self.maxVoices){
			end = self.voices.shift();
			end.onend && end.onend();
		}
		return note;
	},
/**
 * Moves all the voices one sample position further and disbands the voices that have ended.
*/
	generate: function(){
		var	voices = this.voices,
			i, voice;
		for (i=0; i<voices.length; i++){
			voice = voices[i];
			voice.p += voice.s;
			voice.p > voice.l && voices.splice(i--, 1) && voice.onend && voice.onend();
		}
	},
/**
 * Returns the mix of the voices, by a specific channel.
 *
 * @arg {Int} channel The number of the channel to be returned. (Optional)
 * @return {Float32} The current output of the Sampler's channel number channel.
*/
	getMix: function(ch){
		var	voices	= this.voices,
			smpl	= 0,
			i;
		ch = ch || 0;
		if (this.samples[ch]){
			for (i=0; i<voices.length; i++){
				smpl	+= audioLib.Sink.interpolate(this.samples[ch], voices[i].p) * voices[i].v;
			}
		}
		return smpl;
	},
/**
 * Load an AudioData object to the sampler and resample if needed.
 *
 * @method Sampler
 *
 * @arg {AudioData} data The AudioData object representation of the sample to be loaded.
 * @arg {Boolean} !resample Determines whether to resample the sample to match the sample rate of the Sampler.
*/
	load: function(data, resample){
		var	self	= this,
			samples	= self.samples = audioLib.Sink.deinterleave(data.data, data.channelCount),
			i;
		if (resample){
			for (i=0; i<samples.length; i++){
				samples[i] = audioLib.Sink.resample(samples[i], data.sampleRate, self.sampleRate);
			}
		}
		self.sample	= data.data;
		self.samples	= samples;
		self.data	= data;
		self.sampleSize = samples[0].length;
	},
};
/**
 * A helper class for buffer-based audio analyzers, such as FFT.
 *
 * @arg {Number} bufferSize Size of the buffer (a power of 2)
*/

function AudioProcessingUnit(bufferSize){
	var k;
	for (k in AudioProcessingUnit.prototype){
		if (AudioProcessingUnit.prototype.hasOwnProperty(k)){
			this[k] = AudioProcessingUnit.prototype[k];
		}
	}
	this.resetBuffer.apply(this, arguments);
}

AudioProcessingUnit.prototype = {
	bufferPos:	-1,
	pushSample: function(s){
		this.bufferPos = (this.bufferPos + 1) % this.buffer.length;
		this.bufferPos === 0 && this.process(this.buffer);
		this.buffer[this.bufferPos] = s;
		return s;
	},
	getMix: function(){
		return this.buffer[this.bufferPos];
	},
	resetBuffer: function(bufferSize){
		this.bufferSize	= isNaN(bufferSize) ? this.bufferSize : bufferSize;
		this.buffer	= new Float32Array(this.bufferSize);
		this.bufferPos	= -1;
	}
};
this.FourierTransform = (function(){

var	sin		= Math.sin,
	cos		= Math.cos,
	sqrt		= Math.sqrt,
	floor		= Math.floor,
	pow		= Math.pow,
	log		= Math.log,
	ln2		= Math.ln2,
	pi		= Math.PI,
	tau		= pi * 2;

/**
 * A general purpose FourierTransform class, from which FFT and others inherit from.
 * Adapted from DSP.js https://github.com/corbanbrook/dsp.js/blob/master/dsp.js
 *
 * @arg {Number} sampleRate The sample rate of the FFT.
 * @arg {Number} bufferSize The buffer size of the FFT. Must be a power of 2.
*/

function FourierTransform(sampleRate, bufferSize){
	var k;
	for (k in FourierTransform.prototype){
		if (FourierTransform.prototype.hasOwnProperty){
			this[k] = FourierTransform.prototype[k];
		}
	}
	AudioProcessingUnit.apply(this, [].slice.call(arguments, 1));
	this.resetFT.apply(this, arguments);
}

FourierTransform.prototype = {
	/** Resets the parameters of the FT */
	resetFT: function(sampleRate){
		var self = this;
		self.sampleRate		= isNaN(sampleRate) ? self.sampleRate : sampleRate;
		self.bandWidth		= 2 / self.bufferSize * self.sampleRate * 0.5;
		self.spectrum		= new Float32Array(self.bufferSize * 0.5);
		self.peakBand		= 0;
		self.peak		= 0;
	},
/**
 * Gets the frequency of a specified band.
 *
 * @param {Number} index The index of the band.
 * @return {Number} The frequency.
*/
	getBandFrequency: function(index){
		return this.bandwidth * index + this.bandWidth * 0.5;
	},
	/** Calculates the spectrum of the FT */
	calculateSpectrum: function(){
		var	self		= this,
			spectrum	= self.spectrum,
			bSi		= 2 / self.bufferSize,
			N		= self.bufferSize / 2,
			rval, ival, mag, i, n;

		for (i=0; i<N; i++){
			n	= i * 2,
			rval	= self.buffer[  i * 2  ];
			ival	= self.buffer[i * 2 + 1];
			mag	= bSi * sqrt(rval * rval + ival * ival);

			if (mag > self.peak){
				self.peakBand	= i;
				self.peak	= mag;
			}

			spectrum[i] = mag;
		}
	}
};

return FourierTransform;
}());
var FFT = (function(){

var	sin	= Math.sin,
	cos	= Math.cos,
	pi2	= Math.PI * 2;

function twiddle(output, i, n, inverse){
	var	phase	= (inverse ? pi2 : -pi2) * i / n;
	output[0]	= cos(phase);
	output[1]	= sin(phase);
}

function pass2(input, output, inverse, product){
	var	size		= input.length * .5,
		i		= 0,
		j		= 0,
		factor		= 2,
		m		= size / factor,
		q		= size / product,
		product1	= product / factor,
		jump		= (factor - 1) * product1,
		twidlz		= new Float32Array(2),
		k, k1, z0r, z0i, z1r, z1i, x0r, x0i, x1r, x1i;
		for (k=0; k<q; k++, j+= jump){
			twiddle(twidlz, k, q * factor, inverse);

			for (k1=0; k1<product1; k1++, i++, j++){
				z0r	= input[2 * i    ];
				z0i	= input[2 * i + 1];
				z1r	= input[2 * (i + m)    ];
				z1i	= input[2 * (i + m) + 1];
				x0r	= z0r + z1r;
				x0i	= z0i + z1i;
				x1r	= z0r - z1r;
				x1i	= z0i - z1i;

				output[2 * j    ]		= x0r;
				output[2 * j + 1]		= x0i;
				output[2 * (j + product1)    ]	= twidlz[0] * x1r - twidlz[1] * x1i;
				output[2 * (j + product1) + 1]	= twidlz[0] * x1i + twidlz[1] * x1r;
			}
		}
}

function fft(value, scratch, factors, inverse){
	var	product		= 1,
		state		= 0,
		size		= value.length * .5,
		factorCount	= factors.length,
		inp, out, factor, i;

	for (i=0; i<factorCount; i++){
		factor		= factors[i];
		product		*= factor;
		
		state === 0 ? (inp = value, out = scratch, state = 1) : (inp = scratch, out = value, state = 0);
		factor === 2 && pass2(inp, out, inverse, product);
	}
	if (inverse){
		if (state === 1){
			for (i=0; i<size; i++){
				value[2 * i    ]	= scratch[2 * i    ];
				value[2 * i + 1]	= scratch[2 * i + 1];
			}
		}
	} else {
		if (state === 1){
			for (i=0; i<size; i++){
				value[2 * i    ]	= scratch[2 * i    ] / size;
				value[2 * i + 1]	= scratch[2 * i + 1] / size;
			}
		} else {
			for (i=0; i<size; i++){
				value[2 * i    ]	= value[2 * i    ] / size;
				value[2 * i + 1]	= value[2 * i + 1] / size;
			}
		}
	}
}

function FFT(){
	this.reset.apply(this, arguments);
}

FFT.prototype = {
	factors: null,
	scratch: null,
	bufferSize: 2048,
	reset: function(bufferSize){
		this.bufferSize	= isNaN(bufferSize) ? this.bufferSize : this.bufferSize;
		this.factors	= [2, 2, 2, 2, 2, 2, 2, 2, 2, 2];
		this.scratch	= new Float32Array(this.bufferSize);
	},
	forward: function(input){
		fft(input, this.scratch, this.factors, true);
	},
	backward: function(input){
		fft(input, this.scratch, this.factors, false);
	}
};

return FFT;

}());

(function(proto){

proto.resetFFT = proto.reset;

proto.reset = function(sampleRate, bufferSize){
	audioLib.FourierTransform.apply(this, arguments);
	this.resetBuffer.apply(this, [].slice.call(arguments, 1));
	this.resetFT.apply(this, arguments);
	this.resetFFT.apply(this, [].slice.call(arguments, 1));
};

proto.process = function(buffer){
	this[this.method](buffer || this.buffer);
	return this.calculateSpectrum();
};

proto.sampleRate	= 44100;
proto.method		= 'forward';

}(FFT.prototype));

/**
 * A Fast Fourier Transform module.
 *
 * @name FFT
 * @processor
 *
 * @arg =!sampleRate
 * @arg =!bufferSize
 *
 * @param type:UInt units:Hz default:44100 sampleRate Sample Rate the apparatus operates on.
 * @param type:UInt default:4096 bufferSize The buffer size of the FFT.
 * @param type:String min:0.0 default:forward method The direction to do the FFT to.
*/

/**
 * Forward process the buffer.
 *
 * @name forward
 * @method FFT
*/

/**
 * Backward process the buffer.
 *
 * @name backward
 * @method FFT
*/

/**
 * Calculate the spectrum for the FFT buffer.
 *
 * @name calculateSpectrum
 * @method FFT
*/

/**
 * Creates an amplitude meter, outputting the amplitude value of the input.
 *
 * @processor
 *
 * @arg =!sampleRate
 * @arg =!attack
 * @arg =!decay
 *
 * @param type:UInt units:Hz default:44100 sampleRate Sample Rate the apparatus operates on.
 * @param type:Float min:0.0 max:1.0 default:0.01 attack The speed on which the amplitude metering reacts.
 * @param type:Float min:0.0 max:1.0 default:0.01 decay The speed on which the amplitude metering cools down.
*/
function Amplitude(sampleRate, attack, decay){
	this.sampleRate		= isNaN(sampleRate) ? this.sampleRate : sampleRate;
	this.attack		= isNaN(attack) ? this.attack : attack;
	this.decay		= isNaN(decay) ? this.decay : decay;
}

Amplitude.prototype = {
	sampleRate:	44100,
	attack:		0.01,
	release:	0.01,
	/* The current output of the effect. */
	sample:		0,
/**
 * Processes a sample, moving the effect one sample further in sample-time.
 *
 * @arg {Float} sample The sample to process.
 * @arg {UInt} channel The channel on which the sample is. (Only if multi-channel)
 * @return {Float} The current output of the effect. (Only if single-channel)
*/
	pushSample: function(s){
		this.sample = Math.abs((s > this.sample ? this.attack : this.release) * (this.sample - s) + s);
		return this.sample;
	},
/**
 * Returns the current output of the effect.
 *
 * @arg {UInt} channel The channel for which to get the sample.
 * @return {Float} The current output of the effect.
*/
	getMix: function(){
		return this.sample;
	},
};
/**
 * Creates an ADSR envelope.
 *
 * @control
 *
 * @arg =!sampleRate
 * @arg =!attack
 * @arg =!decay
 * @arg =!sustain
 * @arg =!release
 * @arg =!sustainTime
 * @arg =!releaseTime
 *
 * @param type:UInt units:Hz default:44100 sampleRate Sample Rate the apparatus operates on.
 * @param type:Float min:0 default:50 attack The attack time of the envelope.
 * @param type:Float min:0 default:50 decay The decay time of the envelope.
 * @param type:Float min:0.0 max:1.0 sustain The sustain state of the envelope.
 * @param type:Float min:0 default:50 release The release time of the envelope.
 * @param type:Float min:0 units:ms default:null sustainTime The time the sustain mode should be sustained before launching release. If null, will wait for triggerGate event.
 * @param type:Float min:0 units:ms default:null releaseTime The time the release mode should be sustained before relaunching attack. If null, will wait for triggerGate event.
 * @param type:Bool default:false gate The state of the gate envelope, open being true.
 * @param type:UInt max:5 default:3 state The current state of the value, determining what the gate will do.
*/
function ADSREnvelope(sampleRate, attack, decay, sustain, release, sustainTime, releaseTime){
	this.sampleRate		= isNaN(sampleRate) ? this.sampleRate : sampleRate;
	this.attack		= isNaN(attack) ? this.attack : attack;
	this.decay		= isNaN(decay) ? this.decay : decay;
	this.sustain		= isNaN(sustain) ? this.sustain : sustain;
	this.release		= isNaN(release) ? this.release : release;
	this.sustainTime	= isNaN(sustainTime) ? null : sustainTime;
	this.releaseTime	= isNaN(releaseTime) ? null : releaseTime;
}

ADSREnvelope.prototype = {
	sampleRate:	44100,
	attack:		50,
	decay:		50,
	sustain:	1,
	release:	50,
	sustainTime:	null,
	releaseTime:	null,
	gate:		false,
	state:		3,
	/* The current value of the envelope */
	value:		0,
/* Private variable for timing the timed sustain and release. */
	_st: 0,
/**
 * Moves the envelope status one sample further in sample-time.
 *
 * @return {Number} The current value of the envelope.
*/
	generate: function(){
		this.states[this.state].call(this);
		return this.value;
	},
/**
 * Returns the current value of the envelope.
 *
 * @return {Number} The current value of the envelope.
*/
	getMix: function(){
		return this.value;
	},
/**
 * Sets the state of the envelope's gate.
 *
 * @method ADSREnvelope
 * 
 * @arg {Boolean} isOpen The new state of the gate.
*/
	triggerGate: function(isOpen){
		isOpen		= typeof isOpen === 'undefined' ? !this.gate : isOpen;
		this.gate	= isOpen;
		//this.state	= isOpen ? 0 : this.releaseTime === null ? 3 : 5;
		this.state	= 0;
		this._st	= 0;
	},
/**
 * Array of functions for handling the different states of the envelope.
*/
	states: [
		function(){ // Attack
			this.value += 1000 / this.sampleRate / this.attack;
			if (this.value >= 1){
				this.state = 1;
			}
		},
		// TODO: FIX THIS ENVELOPE MESS!!!!
		function(){ // Decay
			this.value -= 1000 / this.sampleRate / this.decay * this.sustain;
			if (this.value <= this.sustain){
				if (this.sustainTime === null){
					this.state	= 2;
				} else {
					this._st	= 0;
					this.state	= 4;
				}
			}
		},
		function(){ // Sustain
			this.value = this.sustain;
		},
		function(){ // Release
			this.value = Math.max(0, this.value - 1000 / this.sampleRate / this.release);
		},
		function(){ // Timed sustain
			this.value = this.sustain;
			if (this._st++ >= this.sampleRate * 0.001 * this.sustainTime){
				this._st	= 0;
				this.state	= this.releaseTime === null ? 3 : 5;
			}
		},
		function(){ // Timed release
			this.value = Math.max(0, this.value - 1000 / this.sampleRate / this.release);
			if (this._st++ >= this.sampleRate * 0.001 * this.releaseTime){
				console.log("RELEASING");
				this._st	= 0;
				//this.state	= 0;
				this.value = 0;
			}
		}
	]
};
/**
 * UIControl is a tool for creating smooth, latency-balanced UI controls to interact with audio.
 *
 * @control
 *
 * @arg =!sampleRate
 * @arg =!value
 *
 * @param type:UInt units:Hz default:44100 sampleRate Sample Rate the apparatus operates on.
 * @param type:Number default:1 value The value of the UI control.
*/
function UIControl(sampleRate, value){
	this.sampleRate	= isNaN(sampleRate) ? this.sampleRate : sampleRate;
	this.schedule	= [];
	this.reset(value);
}

UIControl.prototype = {
	sampleRate:	44100,
	value:		1,
	/* The internal schedule array of the UI control */
	schedule:	null,
	/* The internal clock of the UI control, indicating the previous time of a buffer callback */
	clock:		0,
/**
 * Returns the current value of the UI control
 *
 * @return {Number} The current value of the UI control
*/
	getMix:		function(){
		return this.value;
	},
	/** Moves the UI control one sample forward in the sample time */
	generate:	function(){
		var i;
		for (i=0; i<this.schedule.length; i++){
			if (this.schedule[i].t--){
				this.value = this.schedule[i].v;
				this.schedule.splice(i--, 1);
			}
		}
	},
/**
 * Sets the value of the UI control, latency balanced
 *
 * @method UIControl
 *
 * @param {Number} value The new value.
*/
	setValue:	function(value){
		this.schedule.push({
			v:	value,
			t:	~~((+new Date - this.clock) / 1000 * this.sampleRate)
		});
	},
	reset: function(value){
		this.value	= isNaN(value) ? this.value : value;
		this.clock	= +new Date;
	}
};
/**
 * Creates a StepSequencer.
 *
 * @control
 *
 * @arg =!sampleRate
 * @arg =!stepLength
 * @arg =!steps
 * @arg =!attack
 *
 * @param type:UInt units:Hz default:44100 sampleRate Sample Rate the apparatus operates on.
 * @param type:Float min:0 units:ms default:200 stepLength The time a single step of the sequencer lasts.
 * @param type:Array<Float> default:0 steps Array of steps (positive float) for the sequencer to iterate.
 * @param type:Float min:0.0 max:1.0 default:0.0 attack The time the linear transition between the steps. Measured in steps.
 * @param type:Float default:0.0 phase The current phase of the sequencer.
*/
function StepSequencer(sampleRate, stepLength, steps, attack){
	var	self	= this,
		phase	= 0;

	this.sampleRate		= isNaN(sampleRate) ? this.sampleRate : sampleRate;
	this.stepLength		= isNaN(stepLength) ? this.stepLength : stepLength;
	this.steps		= steps || [1, 0];
	this.attack		= isNaN(attack) ? this.attack : attack;
	
	console.log(this.stepLength);
}

StepSequencer.prototype = {
	sampleRate:	44100,
	stepLength:	200,
	steps:		null,
	attack:		0,
	phase:		0,
	/* The current value of the step sequencer */
	value:		0,

/**
 * Moves the step sequencer one sample further in sample time.
 *
 * @return {Number} The current value of the step sequencer.
*/
	generate: function(){
		var	self		= this,
			stepLength	= self.sampleRate / 1000 * self.stepLength,
			steps		= self.steps,
			sequenceLength	= stepLength * steps.length,
			step, overStep, prevStep, stepDiff,
			val;
		self.phase	= (self.phase + 1) % sequenceLength;
		step		= self.phase / sequenceLength * steps.length;
		//overStep	= step % 1;
		step		= Math.floor(step);
		prevStep	= (step || steps.length) - 1;
		//stepDiff	= steps[step] - steps[prevStep];
		val		= steps[step];
		if (overStep < self.attack){
			val -= stepDiff - stepDiff / self.attack * overStep;
		}
		self.value = val;
		return val;
	},
/**
 * Returns the current value of the step sequencer.
 *
 * @return {Number} The current value of the step sequencer.
*/
	getMix: function(){
		return this.value;
	},
/**
 * Triggers the gate for the step sequencer, resetting its phase to zero.
 *
 * @method StepSequencer
*/
	triggerGate: function(){
		this.phase = 0;
	}
};
/*
	wrapper-end.js
	Please note that this file is of invalid syntax if standalone.
*/

// Controls
audioLib.ADSREnvelope	= ADSREnvelope;
audioLib.StepSequencer	= StepSequencer;
audioLib.UIControl	= UIControl;

// Effects
audioLib.BiquadFilter	= BiquadFilter;
audioLib.BitCrusher	= BitCrusher;
audioLib.Chorus		= Chorus;
audioLib.CombFilter	= CombFilter;
audioLib.Compressor	= Compressor;
audioLib.Delay		= Delay;
audioLib.Distortion	= Distortion;
audioLib.GainController	= GainController;
audioLib.IIRFilter	= IIRFilter;
audioLib.LP12Filter	= LP12Filter;
audioLib.Limiter	= Limiter;
audioLib.Reverb		= Freeverb;

// Geneneration
audioLib.Noise		= Noise;
audioLib.Oscillator	= Oscillator;
audioLib.Sampler	= Sampler;

// Processing
audioLib.Amplitude	= Amplitude;
audioLib.FFT		= FFT;
audioLib.AudioProcessingUnit	= AudioProcessingUnit;


audioLib.AudioDevice	= audioLib.Sink = (function(){ return this; }()).Sink;

(function(names, i){
	function createBufferBased(channelCount){
		return new audioLib.BufferEffect(this, channelCount, [].slice.call(arguments, 1));
	}

	function effects(name, effect, prototype, argNames){
		if (effect){
			prototype	= prototype || effect.prototype;
			var	proto	= effect.prototype = new EffectClass();
			proto.name	= proto.fxid = name;
			effects[name]	= __class(name, effect, argNames);
			effects[name].createBufferBased = effect.createBufferBased = createBufferBased;
			for (argNames in prototype){
				if (prototype.hasOwnProperty(argNames)){
					proto[argNames] = prototype[argNames];
				}
			}
		}
		return effects[name];
	}



	audioLib.effects = effects;

	for (i=0; i<names.length; i++){
		audioLib[names[i]] = effects(names[i], audioLib[names[i]], audioLib[names[i]].prototype);
	}

	effects('BiquadAllPassFilter',	BiquadFilter.AllPass);
	effects('BiquadBandPassFilter',	BiquadFilter.BandPass);
	effects('BiquadHighPassFilter',	BiquadFilter.HighPass);
	effects('BiquadLowPassFilter',	BiquadFilter.LowPass);
	effects('FreeverbAllPassFilter',Freeverb.AllPassFilter);
}(['BiquadFilter', 'BitCrusher', 'Chorus', 'CombFilter', 'Compressor', 'Delay', 'Distortion', 'GainController', 'IIRFilter', 'LP12Filter', 'Limiter', 'Reverb', 'Amplitude', 'FFT']));

(function(names, i){
	function generators(name, effect, prototype, argNames){
		if (effect){
			prototype	= prototype || effect.prototype;
			var	proto	= effect.prototype = new GeneratorClass();
			proto.name	= proto.fxid = name;
			generators[name]= __class(name, effect, argNames);
			for (argNames in prototype){
				if (prototype.hasOwnProperty(argNames)){
					proto[argNames] = prototype[argNames];
				}
			}
		}
		return generators[name];
	}

	audioLib.generators = generators;

	for (i=0; i<names.length; i++){
		audioLib[names[i]] = generators(names[i], audioLib[names[i]], audioLib[names[i]].prototype);
	}
}(['Noise', 'Oscillator', 'Sampler', 'ADSREnvelope', 'StepSequencer', 'UIControl']));

Codec('wav', audioLib.PCMData);

audioLib.Automation			= Automation;
audioLib.BufferEffect			= BufferEffect;
audioLib.EffectClass			= EffectClass;
audioLib.GeneratorClass			= GeneratorClass;
audioLib.codecs				= audioLib.Codec = Codec;
audioLib.plugins			= Plugin;

audioLib.version			= '0.6.0';

audioLib.BufferEffect.prototype.addAutomation	=
audioLib.EffectClass.prototype.addAutomation	=
audioLib.GeneratorClass.prototype.addAutomation	=
function addAutomation(){
	return audioLib.Automation.apply(audioLib, [this].concat([].slice.call(arguments)));
};

return audioLib;
}).call(typeof exports === 'undefined' ? {} : this, this.window || global, Math, Object, Array);