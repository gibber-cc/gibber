define(["gibberish/lib/oscillators", "gibberish/lib/effects", "gibberish/lib/synths", "gibberish/lib/envelopes"], function(oscillators, effects, synths, envelopes) {
    var that = {
		debug : false,
        init : function() { 
			oscillators.init(this);
			effects.init(this);
			synths.init(this);
			envelopes.init(this);			
			
			var binops = {
				"+" : this.binop_generator,
				"-" : this.binop_generator,
				"*" : this.binop_generator,
				"/" : this.binop_generator,
				"=" : this.binop_generator,																
			};
			this.extend(this.generators, binops);
		},

		generateCallback : function() {
			var debug = this.debug;
			this.masterUpvalues = [];
			this.masterCodeblock = [];
			this.memo = {};
			
			var start = "";//function(globals) {\n";
			var upvalues = "";
			var codeblock = "function cb() {\nvar output = 0;\n";
			
			function checkBusses(_ugen, gibberish) {
				//console.log("RUNNING INSIDE CODE FOR", _ugen.name );
				
				for(var j = 0; j < _ugen.senderObjects.length; j++) {
					var __ugen = _ugen.senderObjects[j];
					if(__ugen.category === "Bus") {
						//console.log("BUS SENDER OBJECT", ugen.name);
						checkBusses(__ugen, gibberish);
						gibberish.generate(__ugen);
					 	gibberish.masterUpvalues.push( __ugen.upvalues + ";\n" );
						gibberish.masterCodeblock.push(__ugen.codeblock);					
						
						for(var k = 0; k < __ugen.fx.length; k++) {
							var fx = __ugen.fx[k];
							if(fx.dirty)
								gibberish.generate(fx);	
						}
					}else{
						if(__ugen.dirty) {
							//console.log(__ugen.name + " IS DIRTY");
						 	gibberish.generate(__ugen);
							__ugen.dirty = false;
						}
					 	gibberish.masterUpvalues.push( __ugen.upvalues + ";\n" );
						gibberish.masterCodeblock.push(__ugen.codeblock);					
						for(var k = 0; k < __ugen.fx.length; k++) {
							var fx = __ugen.fx[k];
							if(fx.dirty)
								gibberish.generate(fx);	
						}
					}
				}
			}
			
			for(var i = 0; i < this.ugens.length; i++) {
				var ugen = this.ugens[i];
				
				if(ugen.category === "Bus") {
					checkBusses(ugen, this);
					//console.log("BUS", ugen.name, ugen.codeblock);
				}
				
				if(ugen.dirty) {
					this.generate(ugen);				
					ugen.dirty = false;
				}
				for(var k = 0; k < ugen.fx.length; k++) {
					var fx = ugen.fx[k];
					if(fx.dirty)
						this.generate(fx);	
				}	
				
				
				//this.masterUpvalues.push( ugen.upvalues + ";\n" );
				this.masterCodeblock.push(ugen.codeblock);
				//console.log("MASTER UGEN CODEBLOCK", ugen.codeblock);
			}
			
			codeblock += this.masterCodeblock.join("\n");
			var end = "return output;\n}\nreturn cb;";
			
			var cbgen = start + this.masterUpvalues.join("") + codeblock + end;
	
			if(debug) console.log(cbgen);
			
			this.callbackString = cbgen;
			
			this.isDirty = false;
			
			return (new Function("globals", cbgen))(window);
		},

		connect : function() {
			for(var i = 0; i < arguments.length; i++) {
				this.ugens.push(arguments[i]);
			}
			Gibberish.dirty();
		},
		
		disconnect : function() {
			for(var i = 0; i < arguments.length; i++) {
				this.ugens.remove(arguments[i]);
			}
			Gibberish.dirty();
		},
		
		defineProperties : function(obj, props) {
			for(var i = 0; i < props.length; i++) {
				var prop = props[i];
				(function(_obj) {
					var that = _obj;
					var propName = prop;
					var value = that[prop];
	
				    Object.defineProperty(that, propName, {
						get: function() { return value; },
						set: function(_value) {
							//console.log("SETITING", propName, _value);
							if(typeof value === "number" || typeof value === "boolean"){
								value = _value;
							}else{
								value["operands"][0] = _value;
							}
							
							//console.log(that);
							if(typeof that.destinations !== "undefined") {
								if(that.destinations.length > 0) {
									for(var i = 0; i < that.destinations.length; i++) {
										that.destinations[i].dirty = true;
									}
								}
							}
							Gibberish.dirty(that);
						},
					});
				})(obj);
			}
		},
		
		createGenerator : function(parameters, formula) {
			var generator = function(op, codeDictionary, shouldAdd) {
				//console.log("SHOULD ADD GEN", shouldAdd);
				
				shouldAdd = typeof shouldAdd === "undefined" ? true : shouldAdd;
				var name = op.name;
				
				//console.log("GENERATING WITH FORMULA", formula, "PARAMETERS", parameters);
				codeDictionary.upvalues.push("var {0} = globals.{0}".format(name));
				
				var paramNames = [name];
				for(var i = 0; i < parameters.length; i++) {
					var param = parameters[i];
					//console.log(param);
					paramNames.push(Gibberish.codegen(op[parameters[i]], codeDictionary, shouldAdd));
				}
				
				var c = String.prototype.format.apply(formula, paramNames);
				
				return c;
			}
			return generator;
		},
		// TODO: MUST MEMOIZE THIS FUNCTION
		codegen : function(op, codeDictionary, shouldAdd) {
			//console.log("SHOULD ADD", shouldAdd);
			shouldAdd = typeof shouldAdd === "undefined" ? true : shouldAdd;
			//if(!shouldAdd) console.log("NOT ADDING", op.ugenVariable);
			if(typeof op === "object" && op !== null) {

				var memo = this.memo[op.name];
				if(memo && op.category !== "Bus") {
					return memo;
				}
				
				var name = op.ugenVariable || this.generateSymbol("v");
				
				op.ugenVariable = name;
				if(op.name) {
					this.memo[op.name] = op.ugenVariable;
				}
				
				var statement;
				if(typeof op === "object" && op instanceof Array) {
					statement = "var " + name + " = [";
					
					for(var i = 0; i < op.length; i++) {
						var gen = this.generators[op[i].type];
						
						var _name = op[i].ugenVariable;// this.generateSymbol("v");
												
						var objName = op[i].name && !op[i].dirty ? op[i].name : gen(op[i], codeDictionary, false);
						var _statement = "var {0} = {1}".format(_name, objName);
						
						statement += objName + ",";
					}
						
					statement += "]";
					
					op.ugenVariable = name;
					if(shouldAdd)
						codeDictionary.codeblock.push(statement);
					else
						console.log("NOT ADDING;")
						
				}else{
					var gen = this.generators[op.type];
					//console.log(gen);
					if(gen) {
						var objName = gen(op, codeDictionary, true); //op.name && !op.dirty ? op.ugenVariable : gen(op, codeDictionary);
						
						if(op.category !== "FX") {
							statement = "var {0} = {1}".format(name, objName);
						}else{
							statement = "{0} = {1}".format(op.source, objName);
						}
						if(shouldAdd)
							codeDictionary.codeblock.push(statement);
					}// else{
				}
				return name;
			}
			return op;
		},
				
		generate : function(ugen) {
			var codeDictionary = {
				initialization 	: [],	// will be executed globally accessible by callback
				upvalues		: [],	// pointers to globals that will be included in callback closure
				codeblock 		: [],	// will go directly into callback
			};
			//console.log("GENERATING " + ugen.type);
			var outputCode = this.codegen(ugen, codeDictionary);
			//console.log("OUTPUT CODE", ugen.type, outputCode);
			
			if(typeof ugen.fx !== "undefined") {
				for(var i = 0; i < ugen.fx.length; i++) {
					var effect = ugen.fx[i];
					if(typeof effect.support !== "undefined") {
						effect.support(outputCode, codeDictionary);
					}
					effect.source = outputCode;
					this.codegen(effect, codeDictionary);
				}
			}
			
			if(ugen.category === "Bus") {
				for(var i = 0; i < ugen.destinations.length; i++) {
					var output = ugen.destinations[i].ugenVariable || ugen.destinations[i];
					if(output == "output")
						codeDictionary.codeblock.push( "{0} += {1};\n".format( output, outputCode) );
				}
			}

			ugen.initialization	= codeDictionary.initialization;
			ugen.upvalues		= codeDictionary.upvalues.join(";\n");
			ugen.codeblock		= codeDictionary.codeblock.join(";\n");
		},
		
		binop_generator : function(op, codeDictionary, shouldAdd) {
			shouldAdd = typeof shouldAdd === "undefined" ? true : shouldAdd;
			return "({0} {1} {2})".format(	Gibberish.codegen(op.operands[0], codeDictionary, shouldAdd), 
											Gibberish.codegen(op.type, 	codeDictionary, shouldAdd),
											Gibberish.codegen(op.operands[1],	codeDictionary, shouldAdd));
		},
		
		mod : function(name, modulator, type) {
			var type = type || "+";
			var m = { type:type, operands:[this[name], modulator], name:name };
			this[name] = m;
			modulator.modding.push({ ugen:this, mod:m });
			this.mods.push(m);
			Gibberish.generate(this);
			Gibberish.dirty(this);
			return modulator;
		},

		removeMod : function() {
			var mod = this.mods.get(arguments[0]); 	// can be number, string, or object
			delete this[mod.name]; 					// remove property getter/setters so we can directly assign
			this.mods.remove(mod);
			
			var val = mod.operands[0];
			this[mod.name] = val;

			Gibberish.defineProperties(this, ["frequency"]);
			Gibberish.generate(this);
			Gibberish.dirty(this);
		},
		
		generateSymbol : function(name) {
			return name + "_" + this.id++; 
		},
		
		// adapted from audioLib.js
		interpolate : (function() {
			var floor = Math.floor;	// who knows if this helps...
			return function(arr, pos){
				var	first	= floor(pos),
					second	= first + 1,
					frac	= pos - first;
				second		= second < arr.length ? second : 0;
				
				return arr[first] * (1 - frac) + arr[second] * frac;
			};
		})(),
		
		// modified from http://andrewdupont.net/2009/08/28/deep-extending-objects-in-javascript/ to deep copy arrays
		extend: function(destination, source) {
		    for (var property in source) {
				if(source[property] instanceof Array) {
		            destination[property] = source[property].slice(0);
					if(property === "fx") {
						destination[property].parent = source[property].parent;
					}
		        }else if (typeof source[property] === "object" && source[property] !== null) {
		            destination[property] = destination[property] || {};
		            arguments.callee(destination[property], source[property]);
		        } else {
		            destination[property] = source[property];
		        }
		    }
		    return destination;
		},
		
		NO_MEMO : function() { return "NO_MEMO"; }, 
		
		dirty : function(ugen) {
			//console.log("DIRTY", ugen);
			if(typeof ugen !== "undefined" && ugen !== this) {
				ugen.dirty = true;
			}
			this.isDirty = true;
			Master.dirty = true;
		},

		id			:  0,
		make 		: {},
		generators 	: {},
		ugens		: [],
		audioFiles:	{},
		//dirty		: false,
		memo		: {},
		MASTER		: "output", // a constant to connect to master output
		masterUpvalues : [],
		masterCodeblock : [],
		masterInit	   : [],	
    };
	
	that.ugen = function(parent) {
		var self = {	
			send: function(bus, amount) {
				bus.connectUgen(this, amount);
			},
			connect : function(bus) {
				this.destinations.push(bus);
				if(bus === Gibberish.MASTER) {
					Gibberish.connect(this);
				}else{
					console.log("CONNECTING", this.ugenVariable);
					bus.connectUgen(this, 1);
				}
				Gibberish.dirty(true);
				return this;
			},
			disconnect : function(bus) {
				console.log("DISCONNECT 1");
				if(bus === Gibberish.MASTER) {
					Gibberish.disconnect(this);
				}else if(bus){
					//console.log("CONNECTING", this.ugenVariable);
					bus.disconnectUgen(this);
					this.destinations.remove(bus);
				}else{
								console.log("DISCONNECT 2 Length ", this.destinations.length);
					for(var i = 0; i < this.destinations.length; i++) {
						this.destinations[i].disconnectUgen(this);
					}
					this.destinations.remove();
				
				}
				Gibberish.dirty(true);
				return this;
			},
		
			out : function() {
				this.connect(Gibberish.MASTER);
				return this;
			},
		
			addFX : function() {
				for(var i = 0; i < arguments.length; i++) {
					this.fx.push(arguments[i]);
				}
				Gibberish.dirty(this);
			},
		
			fx:			[],
			mods:		[],
			modding:	[],
			mod:		that.mod,
			removeMod:	that.removeMod,
			dirty:		true,
			destinations : [],
		};
		self.fx.parent = parent;
		
		Gibberish.extend(this, self);
		
		
		// var parent = this;
		// this.fx.prototype.parent = this;
		// this.fx.add = function() {
		// 	console.log("FX ADDED CALLED");
		// 	for(var i = 0; i < arguments.length; i++) {
		// 		this.push(arguments[i]);
		// 	}
		// 	Gibberish.dirty(parent);
		// };
		// console.log(this.fx.add);
		return this;
	};
	// todo: how to dirty fx bus when adding an effect?
	
	return that;
});