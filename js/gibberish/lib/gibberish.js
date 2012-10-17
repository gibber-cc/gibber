define([], function() {
    var that = {
		debug : false,
		callbackCount: 0,
        init : function() { 
			var binops = {
				"+" : this.binop_generator,
				"-" : this.binop_generator,
				"*" : this.binop_generator,
				"/" : this.binop_generator,
				"=" : this.binop_generator,
				"++" : this.binop_generator,																				
			};
			this.extend(this.generators, binops);
		},
		generateCallback : function() {
			var debug = this.debug;
			this.callbackCount++;
			this.masterUpvalues = [];
			this.masterCodeblock = [];
			this.memo = {};
			
			var start = "";//function(globals) {\n";
			var upvalues = "";
			var codeblock = "function cb(input) {\nvar output = [0,0];\n";
			
			function checkBusses(_ugen, gibberish) {
				//console.log("RUNNING INSIDE CODE FOR", _ugen.symbol );
				for(var j = 0; j < _ugen.senderObjects.length; j++) {
					var __ugen = _ugen.senderObjects[j];
					if(__ugen.category === "Bus") {
						//console.log("BUS SENDER OBJECT", ugen.symbol);
						checkBusses(__ugen, gibberish);
						if(__ugen.dirty)
							gibberish.generate(__ugen);
					 	gibberish.masterUpvalues.pushUnique( __ugen.upvalues + ";\n" );
						gibberish.masterCodeblock.pushUnique(__ugen.codeblock + ";\n");					
						
						for(var k = 0; k < __ugen.fx.length; k++) {
							var fx = __ugen.fx[k];
							if(fx.dirty)
								gibberish.generate(fx);	
						}
					}else{
						if(__ugen.dirty) {
							//console.log(__ugen.symbol + " IS DIRTY");
						 	gibberish.generate(__ugen);
							__ugen.dirty = false;
						}
					 	gibberish.masterUpvalues.pushUnique( __ugen.upvalues + ";\n" );
						gibberish.masterCodeblock.pushUnique(__ugen.codeblock + ";\n");					
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
					//console.log("BUS", ugen.symbol, ugen.codeblock);
				}
				var shouldPush = true;
				if(ugen.dirty) {
					this.generate(ugen);				
					ugen.dirty = false;
					shouldPush = false;
				}
				for(var k = 0; k < ugen.fx.length; k++) {
					var fx = ugen.fx[k];
					if(fx.dirty)
						this.generate(fx);	
				}	
				
				
				this.masterUpvalues.pushUnique( ugen.upvalues + ";\n" );
				//if(shouldPush)
					this.masterCodeblock.pushUnique(ugen.codeblock +";");
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
		timeProperties : ["attack", "decay", "sustain", "release", "speed", "time"],
		
		defineProperties : function(obj, props) {
			for(var i = 0; i < props.length; i++) {
				var prop = props[i];
				(function(_obj) {
					var that = _obj;
					var propName = prop;
					var value = that[prop];
					var timeCheck = Gibberish.timeProperties.indexOf(propName) > -1;
				    Object.defineProperty(that, propName, {
						get: function() { return value; },
						set: function(_value) {
							if(timeCheck) _value = G.time(_value);
							//console.log("SETITING...", propName, _value);
							if(typeof value === "number" || typeof value === "boolean" || typeof value === "string" || value === null){
								//console.log("SETTING INDIVIDUAL", value);
								value = _value;
							}else{
								if(typeof _value.operands !== "undefined") {
									value = _value;
									//console.log("MOD", value);
								}else{
									value["operands"][0] = _value;
								}
							}
							
							if(typeof that.destinations !== "undefined") {
								if(that.destinations.length > 0) {
									for(var i = 0; i < that.destinations.length; i++) {
										that.destinations[i].dirty = true;
									}
								}
							}
							if(that === null) return;
							if(that.category === "FX" && typeof that.parent !== "undefined") {
								that.dirty = true;
								Gibberish.dirty(that.parent.parent); // that.parent is fx array, parent of fx array is ugen
							}else if (typeof that.modding !== "undefined" && that.modding !== null) {
								function checkMods(obj) {
									for(var i = 0; i < obj.modding.length; i++) {
										Gibberish.dirty(obj.modding[i].ugen);
										checkMods(obj.modding[i].ugen);
									}
								}
								
								checkMods(obj);
								
								Gibberish.dirty(that);
							}else{
								Gibberish.dirty(that);
							}
						},
					});
				})(obj);
			}
		},
		
		polyDefineProperties : function(obj, props) {
			for(var i = 0; i < props.length; i++) {
				var prop = props[i];
				(function(_obj) {
					var that = _obj;
					var propName = prop;
					var value = that[prop];

				    Object.defineProperty(that, propName, {
						get: function() { return value; },
						set: function(_value) {
							if(typeof value === "number" || typeof value === "boolean" || typeof value === "string"){
								value = _value;
							}else{
								if(typeof _value.operands !== "undefined") {
									value = _value;
									//console.log("MOD", value);
								}else{
									value["operands"][0] = _value;
								}
							}
							
							if(obj.category === "Bus") {
								for(var j = 0; j < obj.senderObjects.length; j++) {
									obj.senderObjects[j][propName] = _value;
								}
							}else{
								for(var j = 0; j < obj.children.length; j++) {
									obj.children[j][propName] = _value;
								}
							}

							if(that.category === "FX") {
								that.dirty = true;
								Gibberish.dirty(that.parent.parent); // that.parent is fx array, parent of fx array is ugen
							}else{
								Gibberish.dirty(that);
							}
						},
					});
				})(obj);
			}
		},
		
		createGenerator : function(parameters, formula) {
			var generator = function(op, codeDictionary, shouldAdd) {				
				shouldAdd = typeof shouldAdd === "undefined" ? true : shouldAdd;
				var name = op.symbol;
				
				//console.log("GENERATING WITH FORMULA", formula, "PARAMETERS", parameters);
				codeDictionary.upvalues.push("var {0} = globals.{0}".format(name));
				
				var paramNames = [name];
				for(var i = 0; i < parameters.length; i++) {
					var param = parameters[i];
					paramNames.push(Gibberish.codegen(op[parameters[i]], codeDictionary, shouldAdd));
				}
				
				var c = String.prototype.format.apply(formula, paramNames);
				
				return c;
			}
			return generator;
		},
		
		codegen : function(op, codeDictionary, shouldAdd) {
			shouldAdd = typeof shouldAdd === "undefined" ? true : shouldAdd;
			
			if(typeof op === "object" && op !== null) {

				var memo = this.memo[op.symbol];
				if(memo){
					//console.log("MEMO", memo, op);
					return memo;
				}
				
				var name = op.ugenVariable || this.generateSymbol("v");
				op.ugenVariable = name;
				
				var statement;
				if(typeof op === "object" && op instanceof Array) {
					statement = "var " + name + " = [";
					
					for(var i = 0; i < op.length; i++) {
						var objName = op[i].symbol && !op[i].dirty ? op[i].symbol : this.generators[op[i].type](op[i], codeDictionary, false);
						statement += objName + ",";
					}
						
					statement += "]";
										
					if(shouldAdd)
						codeDictionary.codeblock.push(statement);
				}else{
					var gen = this.generators[op.type];
					if(gen) {
						var objName = gen(op, codeDictionary, shouldAdd);
						
						if(shouldAdd) {
							if(op.category !== "FX") {
								//console.log("MAKING", objName);
								
								statement = "var {0} = {1}".format(name, objName);
							}else{
								statement = "{0} = {1}".format(op.source, objName);
							}
							codeDictionary.codeblock.push(statement);
						}
					}
				}
				
				if(op.symbol && !op.NO_MEMO) {
					this.memo[op.symbol] = op.ugenVariable;
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
			if(ugen.callbackCount === Gibberish.callbackCount) {
				//console.log("shouldn't be building...", Gibberish.callbackCount, ugen.callbackCount);
				//return;
			}
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
					if(output === "output" && ugen.channels === 2) {
						codeDictionary.codeblock.push( "{0}[0] = {1}[0];{0}[1] = {1}[1];\n".format( output, outputCode) );
					}else if(output === "output"){
						if(ugen.channels === 1) {
							codeDictionary.codeblock.push( "{0} = {1};\n".format( output, outputCode) );
						}else{
							codeDictionary.codeblock.push( "{0} = ({1}[0] + {1}[1]) / 2;\n".format( output, outputCode) );
						}
					}
				}
			}

			ugen.initialization	= codeDictionary.initialization;
			ugen.upvalues		= codeDictionary.upvalues.join(";\n");
			ugen.codeblock		= codeDictionary.codeblock.join(";\n");
			
			ugen.callbackCount = this.callbackCount;
		},
		
		binop_generator : function(op, codeDictionary, shouldAdd) {
			shouldAdd = typeof shouldAdd === "undefined" ? true : shouldAdd;
			if(op.type === "=") {
				//if(op.operands[0].channels === 1) { 
					return Gibberish.codegen(op.operands[1], codeDictionary, shouldAdd);
				// }else{
				// 	return "([{0}[0] = {1}, {0}[0] = {0}[1]])".format(
				// 		Gibberish.codegen(op.operands[0], codeDictionary, shouldAdd),
				// 		Gibberish.codegen(op.operands[1], codeDictionary, shouldAdd)
				// 	);
				// }
			}else if((op.type === "*" || op.type === "/") && op.operands[1] === 1) {
				return Gibberish.codegen(op.operands[0], codeDictionary, shouldAdd);
			}else if(op.type === "++") {
				return"({0} + Math.abs({2}))".format(	Gibberish.codegen(op.operands[0], codeDictionary, shouldAdd), 
												op.type,
												Gibberish.codegen(op.operands[1], codeDictionary, shouldAdd));
			}
			if(op.operands[0].channels === 2 && op.operands[1].channels !== 2) {
				//console.log("2, 1")
				
				return "([{0}[0] {1} {2}, {0}[1] {1} {2}])".format(	
						Gibberish.codegen(op.operands[0], codeDictionary, shouldAdd), 
						op.type,
						Gibberish.codegen(op.operands[1], codeDictionary, shouldAdd));
			}else if(op.operands[0].channels === 2 && op.operands[1].channels === 2) {
				//console.log("2, 2")
				
				return "([{0}[0] {1} {2}[0], {0}[1] {1} {2}[1]])".format(	
						Gibberish.codegen(op.operands[0], codeDictionary, shouldAdd), 
						op.type,
						Gibberish.codegen(op.operands[1], codeDictionary, shouldAdd));
			}else if(op.operands[0].channels !== 2 && op.operands[1].channels === 2) {
				//console.log("1, 2")
				return "({0} {1} ({2}[0] + {2}[1]) / 2)".format(	
						Gibberish.codegen(op.operands[0], codeDictionary, shouldAdd), 
						op.type,
						Gibberish.codegen(op.operands[1], codeDictionary, shouldAdd));
			
			}else{
				//console.log("1,1");
				return "({0} {1} {2})".format(	Gibberish.codegen(op.operands[0], codeDictionary, shouldAdd), 
											op.type,
											Gibberish.codegen(op.operands[1], codeDictionary, shouldAdd));
			}
			
		},
		
		mod : function(name, modulator, type) {
			var type = type || "+";
			var m = { type:type, operands:[this[name], modulator], name:name, NO_MEMO:true };
			this[name] = m;
			modulator.modding.push({ ugen:this, mod:m });
			this.mods.push(m);
			//Gibberish.dirty(this);
			return modulator;
		},
		
		polyMod : function(name, modulator, type) {			
			if(arguments[0] !== "amp") {
				for(var i = 0; i < this.children.length; i++) {
					this.children[i].mod(name, modulator, type);
				}
			}else{
				Gibberish.mod.apply(this, arguments);
			}
			Gibberish.dirty(this);
		},
		
		removeMod : function() {
			if(typeof arguments[0] !== "undefined") {
				var mod = this.mods.get(arguments[0]); 	// can be number, string, or object
				delete this[mod.name];	 				// remove property getter/setters so we can directly assign
				this.mods.remove(mod);
				var val = mod.operands[0];
			
				this[mod.name] = val;
				Gibberish.defineProperties(this, [mod.name]);				
			}else{
				for(var i = 0; i < this.mods.length; i++) {
					var mod = this.mods.get(i); 	// can be number, string, or object
					delete this[mod.name];	 		// remove property getter/setters so we can directly assign
					this.mods.remove(mod);
					var val = mod.operands[0];
			
					this[mod.name] = val;
					Gibberish.defineProperties(this, [mod.name]);
				}
			}

			Gibberish.dirty(this);
		},
		removePolyMod : function() {
			if(arguments[0] !== "amp") {
				for(var i = 0; i < this.children.length; i++) {
					Gibberish.removeMod.apply(this.children[i], arguments);
				}
			}else{
				Gibberish.removeMod.apply(this, arguments);
			}
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
				var keys = property.split(".");
				//console.log(keys);
				//if(keys.length === 1) {
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
					//}
				/*else{
					console.log("GREATER THAN 1");
					if(source[property] instanceof Array) {
			            destination[keys[0]][keys[1]] = source[property].slice(0);
						if(property === "fx") {
							destination[keys[0]][keys[1]].parent =source[property].parent;
						}
			        }else if (typeof source[property] === "object" && source[property] !== null) {
			            destination[keys[0]][keys[1]] = destination[keys[0]][keys[1]] || {};
			            arguments.callee(destination[keys[0]][keys[1]], source[property]);
			        } else {
						console.log("CALLED BLAH");
			            //destination[keys[0]][keys[1]] = source[property];
			        }					
				}*/
		    }
		    return destination;
		},
		
		NO_MEMO : function() { return "NO_MEMO"; }, 
		pan : function() { 
			var sin = Math.sin;
			var cos = Math.cos;
			var sqrtTwoOverTwo = Math.sqrt(2) / 2;
			
			return function(val, pan) {
				//pan = isNaN(pan) ? 0 : pan;
				return [
		      		val * (sqrtTwoOverTwo * (cos(pan) - sin(pan)) ),
		      		val * (sqrtTwoOverTwo * (cos(pan) + sin(pan)) ), 
	    		];
			};
		},
		dirty : function(ugen) {
			if(typeof ugen !== "undefined" && ugen !== this) {
				ugen.dirty = true;
				this.generate(ugen);
		 		//this.masterUpvalues.pushUnique( __ugen.upvalues + ";\n" );
				//this.masterCodeblock.pushUnique(__ugen.codeblock + ";\n");
			}
			this.isDirty = true;
			Master.dirty = true;
		},

		id			:  0,
		make 		: {},
		generators 	: {},
		ugens		: [],
		audioFiles	: {},
		callbackCount : 0,
		//dirty		: false,
		memo		: {},
		MASTER		: "output", // a constant to connect to master output
		masterUpvalues 	: [],
		masterCodeblock : [],
		masterInit	   	: [],	
    };
	
	that.ugen = function(parent) {
		var self = {	
			send: function(bus, amount) {
				bus.connectUgen(this, amount);
				return this;
			},
			fadeIn : function(level, time) {
				this.mod("amp", Line(0, level, time), "=");
				var me = this;
				future( function() { me.removeMod("amp"); me.amp = level;  }, time);
				return this;
			},
			fadeOut : function(time) {
				this.mod("amp", Line(this.amp, 0, time), "=");
				var me = this;
				future( function() { me.removeMod("amp"); me.amp = 0;  }, time);
				return this;
			},
			connect : function(bus) {
				this.destinations.push(bus);
				if(bus === Gibberish.MASTER) {
					Gibberish.connect(this);
				}else{
					bus.connectUgen(this, 1);
				}
				Gibberish.dirty(true);
				return this;
			},
			disconnect : function(bus) {
				if(bus === Gibberish.MASTER) {
					Gibberish.disconnect(this);
				}else if(bus){
					//console.log("CONNECTING", this.ugenVariable);
					bus.disconnectUgen(this);
					this.destinations.remove(bus);
				}else{
					for(var i = 0; i < this.destinations.length; i++) {
						this.destinations[i].disconnectUgen(this);
					}
					this.destinations.remove();
				}
				this.dirty = true;
				Gibberish.dirty(true);
				return this;
			},
		
			out : function() {
				this.connect(Gibberish.MASTER);
				return this;
			},
		
			addFX : function() {
				for(var i = 0; i < arguments.length; i++) {
					var fx = arguments[i];
					fx.parent = this;
					this.fx.push(fx);
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
			
		Gibberish.extend(this, self);
		
		this.fx.parent = parent;

		return this;
	};
	
	return that;
});