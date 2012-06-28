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
			
			for(var i = 0; i < this.ugens.length; i++) {
				var ugen = this.ugens[i];
				
				if(ugen.dirty) {
					Gibberish.generate(ugen);				
					ugen.dirty = false;
				}
				
				this.masterUpvalues.push( ugen.upvalues + ";\n" );
				this.masterCodeblock.push(ugen.codeblock);
			}
	
			codeblock += this.masterCodeblock.join("\n");
			var end = "return output;\n}\nreturn cb;";
			
			var cbgen = start + this.masterUpvalues.join("") + codeblock + end;
	
			if(debug) console.log(cbgen);
			
			this.dirty = false;
			
			return (new Function("globals", cbgen))(window);
		},

		connect : function() {
			for(var i = 0; i < arguments.length; i++) {
				this.ugens.push(arguments[i]);
			}
			Gibberish.dirty = true;
		},
		
		disconnect : function() {
			for(var i = 0; i < arguments.length; i++) {
				this.ugens.remove(arguments[i]);
			}
			Gibberish.dirty = true;
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
							
							if(propName !== "dirty") {
								that.dirty = true;
							}
							//console.log(that);
							if(typeof that.destinations !== "undefined") {
								if(that.destinations.length > 0) {
									for(var i = 0; i < that.destinations.length; i++) {
										that.destinations[i].dirty = true;
									}
								}
							}
							Gibberish.dirty = true;
						},
					});
				})(obj);
			}
		},
		
		createGenerator : function(parameters, formula) {
			var generator = function(op, codeDictionary) {
				var name = op.name;
				
				//console.log("GENERATING WITH FORMULA", formula, "PARAMETERS", parameters);
				codeDictionary.upvalues.push("var {0} = globals.{0}".format(name));
				
				var paramNames = [name];
				for(var i = 0; i < parameters.length; i++) {
					var param = parameters[i];
					//console.log(param);
					paramNames.push(Gibberish.codegen(op[parameters[i]], codeDictionary));
				}
				
				var c = String.prototype.format.apply(formula, paramNames);
				
				return c;
			}
			return generator;
		},
		// TODO: MUST MEMOIZE THIS FUNCTION
		codegen : function(op, codeDictionary) {
			if(typeof op === "object" && op !== null) {

				var memo = this.memo[op.name];
				if(memo && op.category !== "FX" && op.category !== "Bus") {
					return memo;
				}
				
				var name = op.ugenVariable || this.generateSymbol("v");
				
				op.ugenVariable = name;
				if(op.name) {
					this.memo[op.name] = op.ugenVariable;
				}
				
				//console.log("OP : ", op);
				// if(typeof op === "object" && op instanceof Array) {
				// 	for(var i = 0; i < op.length; i++) {
				// 		var gen = this.generators[op[i].type];
				// 		statement = "{0} = {1}".format(op[i].source, gen(op[i], codeDictionary));
				// 	}
				// }else{
					var gen = this.generators[op.type];
					//console.log(gen);
					if(gen) {
						if(op.category !== "FX") {
							statement = "var {0} = {1}".format(name, gen(op, codeDictionary));
						}else{
							statement = "{0} = {1}".format(op.source, gen(op, codeDictionary));
						}
						codeDictionary.codeblock.push(statement);
					}// else{
					// 						statement = "var {0} = {1}".format(name, JSON.stringify(op));
					// 					}
					//}
				return name;
			}else{
				return op;
			}
		},
				
		generate : function(ugen) {
			var codeDictionary = {
				initialization 	: [],	// will be executed globally accessible by callback
				upvalues		: [],	// pointers to globals that will be included in callback closure
				codeblock 		: [],	// will go directly into callback
			};
			//console.log("GENERATING " + ugen.type);
			var outputCode = this.codegen(ugen, codeDictionary);
			
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
			
			if(ugen.destinations.length > 0) { // mods don't have an output
				for(var i = 0; i < ugen.destinations.length; i++) {
					var output = ugen.destinations[i].ugenVariable || ugen.destinations[i];
					codeDictionary.codeblock.push( "{0} += {1};\n".format( output, outputCode) );
				}
			}

			ugen.initialization	= codeDictionary.initialization;
			ugen.upvalues		= codeDictionary.upvalues.join(";\n");
			ugen.codeblock		= codeDictionary.codeblock.join(";\n");
		},
		
		binop_generator : function(op, codeDictionary) {
			return "({0} {1} {2})".format(	Gibberish.codegen(op.operands[0], codeDictionary), 
											Gibberish.codegen(op.type, 	codeDictionary),
											Gibberish.codegen(op.operands[1],	codeDictionary));
		},
		
		mod : function(name, modulator, type) {
			var type = type || "+";
			var m = { type:type, operands:[this[name], modulator], name:name };
			this[name] = m;
			modulator.modding.push({ ugen:this, mod:m });
			this.mods.push(m);
			Gibberish.generate(this);
			Gibberish.dirty = true;
			this.dirty = true;
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
			Gibberish.dirty = true;
			this.dirty = true;
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

		id			:  0,
		make 		: {},
		generators 	: {},
		ugens		: [],
		dirty		: false,
		memo		: {},
		MASTER		: "output", // a constant to connect to master output
		masterUpvalues : [],
		masterCodeblock : [],
		masterInit	   : [],	
    };
	
	that.ugen = {	
		send: function(bus, amount) {
			bus.connectUgen(this, amount);
		},
		connect : function(bus) {
			this.destinations.push(bus);
			if(bus === Gibberish.MASTER) {
				Gibberish.connect(this);
			}else{
				//console.log("CONNECTING", this.ugenVariable);
				bus.connectUgen(this, 1);
			}
			Gibberish.dirty = true;
		},
		out : function() {
			this.connect(Gibberish.MASTER);
			return this;
		},
		fx:			[],
		mods:		[],
		modding:	[],
		mod:		that.mod,
		removeMod:	that.removeMod,
		dirty:		true,
		destinations : [],
	};
	// todo: how to dirty fx bus when adding an effect?
	
	return that;
});