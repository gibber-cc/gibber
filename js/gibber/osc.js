define([
	'gibber/environment',
	'node/socket.io.min',
], function(environment) {
	window.OSC = {
		socket : null,
		listeners : {},
		initialized : false,
		init : function() {//Gibber.Environment.OSC = io.connect('http://127.0.0.1:8080/');
			this.socket = io.connect('http://127.0.0.1:8080/'); //Gibber.Environment.startOSC();
			this.socket.on( 'OSC', this.callback );
			this.initialized = true;
		},
		callback : function(msg) {
			if(typeof OSC.listeners[msg.path] === 'function') {
				OSC.listeners[msg.path](msg);
			}
		},
		listen : function(path, callback) {
			this.listeners[path] = callback;
		},
		send: function(path, typetags, params) {
			if(typeof arguments[0] !== "object") {
				if(! Array.isArray(params)) params = [params];
				this.socket.emit('OSC', {"path":path, "typetags":typetags, "params":params });
			}else{
				this.socket.emit('OSC', arguments[0]);
			}
		},
	};
	
	window.Control = {
		id : 0,
		init : function() {
			if(!OSC.initalized) OSC.init();
		},
		clear: function() {
			OSC.send("/control/createBlankInterface", "ss", ["testing","portrait"]);
		},
		abstract : function() {
			var options = null;
			var callback = null;
			var type = arguments[arguments.length -1];
			var key = null;
			var obj = null;
			
			if(typeof arguments[0] === "function") {
				callback = arguments[0];
			}else if(typeof arguments[0] === "object") {
				options = arguments[0];
			}else if(typeof arguments[0] === "string" && arguments.length > 1) {
				key = arguments[0];
				
				if(typeof arguments[1] !== "undefined") {
					obj = arguments[1];
				}else{
					Gibber.log("you must provide a key and an object to assign");
					return;
				}
			}
			
			var hasOptions = options !== null ? true : false;
			
			if(!hasOptions) options = {};
			options.name = type + this.id++;
			options.type = type;
			
			OSC.send("/control/addWidget", "s", options);
			
			var that = { 
				name: options.name,
				type: options.type,
			};
			
			var _set = (function() {
				var v = 0;
				Object.defineProperty(that, "value", {
					get: function() { return v; },
					set: function(val) { 
						v = val;
						OSC.send("/"+options.name, 'f', v);
					},
				});
				var set = function(val) {
					v = val;
				};
				return set;
			})();
			
			if(hasOptions && options.callback) callback = options.callback;
			
			if(callback === null) {
				if(key && obj) {
					callback = function(msg) {
						_set(msg.params[0]);
						obj[key] = that.value; 
					};
				}else{
					callback = function(msg) { 
						_set(msg.params[0]);
					};
				}
			}else{
				var tmp = callback.bind({});
				callback = function(msg) {
					_set(msg.params[0]);
					tmp(msg);
				};
			}
			
			OSC.listen("/"+options.name, callback);
			
			return that;
		},
		slider : function() { 
			var args = Array.prototype.slice.call(arguments, 0);
			args.push("Slider");
			return this.abstract.apply(this, args); 
		},
		button : function() { 
			var args = Array.prototype.slice.call(arguments, 0);
			args.push("Button");
			return this.abstract.apply(this, args); 
		},
		xy : function() {
			var args = Array.prototype.slice.call(arguments, 0);
			args.push("MultiTouchXY");
			return this.abstract.apply(this, args); 
		},
	};
});