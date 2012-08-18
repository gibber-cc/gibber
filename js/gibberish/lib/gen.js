window.gen = function(objName) { // this returns a function that gets called when the upvalues are created, then returning a new function instance 
	var name = objName; 
	return function(obj) {
		return Gibberish.make[name](obj); // TODO: how to assign upvalues to object via me(that)?
	}
};

window.Gen = function(obj) {
	Gibberish.make[obj.name] = function(me) { 
		
		if(typeof obj.upvalues !== "undefined") {
			var str = "(function() {"; // must wrap in (function(){}) to ensure closure is scoped locally!!!
			var fcns = {};
			for(var key in obj.upvalues) {
				if(typeof obj.upvalues[key] === "string" || typeof obj.upvalues[key] === "number") {
					//eval("var " + key + " = " + obj.upvalues[key]);
					str += "var " + key + " = " + obj.upvalues[key] +';';
					//console.log(str);
				}else{
					// hack to defer codegen of properties until instance creation
					var tmp = obj.upvalues[key];	
					if(typeof tmp === "function") {
						var _tmp = tmp;
						tmp = tmp(obj);
						// check to see if this is a codegen function, if not, use original function
						if(typeof tmp !== "function") tmp = _tmp;
						fcns[key] = tmp;
					}
					//eval("var " + key + "= tmp");
					str += "var " + key + "= fcns."+key+";";
					//console.log(str);
				}
				if(typeof me !== "undefined") {
					str += "me." + key + "= " + key + ";";
					//eval("me[key] = " + key);
				}
			}			
			str += "var _newFunc = " + obj.callback.toString() +";";
			
			for(var key in obj.upvalues) {	// assign getters and setters for upvalues
				var letter0 = key.slice(0,1).toUpperCase();
				var _key = key.slice(1);
				_key = letter0 + _key;
				//eval("_newFunc.set" + _key + "= function(val) { " + key + "= val; }");
				str += "_newFunc.set" + _key + "= function(val) { " + key + "= val; };";
				//eval("_newFunc.get" + _key + "= function() { return " + key + "; }");				
				str += "_newFunc.get" + _key + "= function() { return " + key + "; };";
			}
			
			str += "return _newFunc;})();";
			//console.log(str);
			
			_newFunc = eval(str);
		}else{
			_newFunc = obj.callback;
		}

		return _newFunc;
	};
		
	var type = typeof obj.name === "undefined" ? "Gen" : obj.name;
		
	obj.acceptsInput = typeof obj.acceptsInput === "undefined" ? false : obj.acceptsInput;
		
	var category = obj.acceptsInput ? "FX" : "Gen";
		
	var genString = obj.acceptsInput ? "{0}( {1}, " : "{0}(";
	var genArray = obj.acceptsInput ? ["source"] : [];
	var count = obj.acceptsInput;
		
	var counter = 0;
	for(var key in obj.props) {
		genString += "{" + ++count + "},";
		genArray.push(key);
	}
	if(genString.charAt(genString.length - 1) === ",") {
		genString = genString.slice(0, genString.length - 1);
	}
	genString += ")";
	Gibberish.generators[obj.name] = Gibberish.createGenerator(genArray, genString);
	
	var args = obj.args;
		
	var f = function(_obj) {
		var that = {};
		that.addToGraph = true;
		
		that.category = category;
			
		Gibberish.extend(that, obj.props);
		Gibberish.extend(that, obj);			
		Gibberish.extend(that, new Gibberish.ugen(that));
			
		if(typeof that.init === "function") that.init();
			
		var propsArray = [];
		for(var key in obj.props) {
			propsArray.push(key);
		}
		Gibberish.defineProperties( that, propsArray );
			
		for(var key in obj.setters) {
			(function() {
				var propName = key;
				var value = that[propName];
				var setter = obj.setters[propName];
				Object.defineProperty(that, propName, {
					get: function() { console.log("PROP", propName, value); return value; },
					set: function(_value) {
						value = _value;
						setter.call(that, value);
					},
				});
			})();
		}
		
		if(arguments.length > 1 || typeof arguments[0] !== "object") {
			for(var i = 0; i < arguments.length; i++) {
				that[propsArray[i]] = arguments[i];
			}
		}else{
			Gibberish.extend(that, _obj); // after setters are defined
		}
			
		that.type = type;
		that.symbol = Gibberish.generateSymbol(that.type);

		Gibberish.masterInit.push(that.symbol + " = Gibberish.make[\"" + that.genName + "\"]();");

		window[that.symbol] = Gibberish.make[that.type](that);
		that.function = window[that.symbol];
		
		if(that.category === "Gen" && that.addToGraph) {
			that.send(Master, 1);
			Gibberish.dirty(that);
		}
		return that;
	};
	return f;
};
