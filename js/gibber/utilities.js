jQuery.fn.aPosition = function() {
    thisLeft = this.offset().left;
    thisTop  = this.offset().top;
    thisParent = this.parent();
    parentLeft = thisParent.offset().left;
    parentTop = thisParent.offset().top;
    return {
        left: thisLeft - parentLeft,
        top: thisTop - parentTop
    }
};

Array.prototype.removeObj = function(value) {
    return jQuery.grep(this, function(elem, index) {
        return elem !== value;
    });
};

Array.prototype.mul = function(operand) {
	for(var i = 0; i < this.length; i++) {
		this[i] *= operand;
	}
};

Array.prototype.mod = function(func) {
    for(var i = 0; i < this.length; i++) {
        this[i] = func( this[i] );
    }
};

// Array.prototype.remove = function(arg) {
// 	console.log("REMOVING");
// 	if(typeof arg === "undefined") { // clear all
// 		for(var i = 0; i < this.length; i++) {
// 			delete this[i];
// 		}
// 		this.length = 0;
// 	}else if(typeof arg === "number") {
// 		this.splice(arg,1);
// 	}else if(typeof arg === "string"){ // find named member and remove
// 		console.log("SEARCHING");
// 		for(var i = 0; i < this.length; i++) {
// 			var member = this[i];
// 			if(member.name === arg) {
// 				console.log("FOUND");
// 				this.splice(i, 1);
// 			}
// 		}
// 	}else if(typeof arg === "object") {
// 		var idx = jQuery.inArray( arg, this);
// 		if(idx > -1) {
// 			this.splice(idx,1);
// 		}
// 	}
// };

Array.prototype.replace = function(oldObj, newObj) {
	if(typeof oldObj != "number") {
		var idx = jQuery.inArray( oldObj, this);
		if(idx > -1) {
			this.splice(idx, 1, newObj);
		}
	}else{
		this.splice(oldObj, 1, newObj);
	}
};

Array.prototype.insert = function(v, pos) {
	this.splice(pos,0,v);
};

// Array.prototype.add = function() {
// 	for(var i = 0; i < arguments.length; i++) {
// 		this.push(arguments[i]);
// 	}
// };

Array.prototype.add1 = function() {
	for(var i = 0; i < arguments.length; i++) {
		var obj = arguments[i];
		var shouldAdd = true;
		for(var j = 0; j < this.length; j++) {
			if(obj.name === this[j].name) {
				shouldAdd = false;
				break;
			}
		}
		if(shouldAdd) {
			this.push(obj);
		}
	}
};

Array.prototype.clear = function() {
	for(var i = 0; i < this.length; i++) {
		delete this[i];
	}
	this.length = 0;
};

Array.prototype.all = Array.prototype.foreach = function(func) {
    for(var i = 0; i < this.length; i++) {
        func.call(this[i]);
    }
};

Array.prototype.random = Array.prototype.rnd =  function() {
	this.pick = surpriseMe();
	return this;
};

Array.prototype.random2 = Array.prototype.rnd2 = function() {
	var lastValue = 0;
	var playTwice = [];
	for(var i = 0; i < arguments.length; i++) {
		playTwice.push(arguments[i]);
	}
	
	this.pick = function() { 
		var value = 0;
		if(playTwice.indexOf(lastValue) > -1) {
			value = lastValue;
			lastValue = 0;
		}else{
			var index = rndi(0, this.length - 1);
			value = this[index];
			lastValue = value;
		}
		return value;
	};
	
	return this;
};


Array.prototype.weight = function() {
	this.pick = weight.call(this, arguments);
	return this;
};


// http://snippets.dzone.com/posts/show/849
Array.prototype.shuffle = function() {
		for(var j, x, i = this.length; i; j = parseInt(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
}

Bag = function(values) { 
	var that = {
		values : values,
		picked : [],
	
		pick : function() {
			if(arguments.length === 0) { // just return a single value
				var val = this.values[rndi(0, this.values.length - 1)];
				if($.inArray(val, this.picked) > -1) {
					return this.pick();
				}
			
				this.picked.push(val);
				if(this.picked.length === this.values.length) {
					this.picked = [];
				}
				return val;
			}else{ // return an array of unique values
				if(arguments[0] >= this.values.length) {
					G.log("Bag error: You cannot return more unique values than are in the bag.");
					return this.values;
				}
				var out = [];
				for(var i = 0; i < arguments[0]; i++) {
					var choose = this.pick();
					while($.inArray(choose, out) > -1) {
						choose = this.pick();
					}
					out.push(choose);
				}
				return out;
			}
		},
	};
	
	(function(obj) {
	    Object.defineProperties(obj, {
			"values" : {
		        get: function() {
		            return values;
		        },
		        set: function(value) {
		            values = value;
					picked = [];
		        }
			},	
	    });
	})(that);
	
	
	return that;
}


window.toggle = function(obj, val, value1, value2) {
	if(obj[val] == value1) {
		obj[val] = value2;
	}else{
		obj[val] = value1;
	}
};

window.copy = function(obj) {
	return $.extend(true, {}, obj);
};

window.select = function(objects) {
	var selectionNumber = $.isArray(objects) ? rndi(0, objects.length) : rndi(0, arguments.length);
	var selection = $.isArray(objects) ? objects[selectionNumber] : arguments[selectionNumber];
	
	return selection;
}
window.filli = function(min, max, number) {
	var output = [];
	if(typeof number === "undefined") {
		number = max || min.length;
	}
	for(var i = 0; i < number; i++) {
		var num;
		if(typeof arguments[0] === "object") {
			num = arguments[0][randomi(0, arguments[0].length - 1)];
		}else{
			num = randomi(min, max);
		}
		output.push(num);
	}

	return output;
};

window.fillf = function(min, max, number) {
	var output = [];
	if(typeof number === "undefined") {
		number = max || min.length;
	}
	for(var i = 0; i < number; i++) {
		var num;
		if(typeof arguments[0] === "object") {
			num = arguments[0][randomi(0, arguments[0].length - 1)];
		}else{
			num = randomf(min, max);
		}
		output.push(num);
	}
	
	return output;
};

// fill durations
window.filld = function(min, max, number) {
	var output = [];
	if(typeof number === "undefined") {
		number = max || min.length;
	}
	for(var i = 0; i < number; i++) {
		var num;
		if(typeof arguments[0] === "object") {
			num = arguments[0][randomi(0, arguments[0].length - 1)];
		}else{
			num = randomi(min, max);
		}
		output.push(window["_" + num]);
	}
	
	return output;
};


window.fill = window.notes = function() {
	return window.filli(0, 20, 16);
};

window.rndd = window.randomd = function(min, max, number) {
	if(typeof number === "undefined" && typeof min != "object") {
		if(arguments.length == 1) {
			min = 0, max = arguments[0];
		}else if(arguments.length == 2) {
			min = arguments[0];
			max = arguments[1];
		}else{
			min = 0;
			max = 100;
		}

		var diff = max - min;
		var r = Math.random();
		var rr = diff * r;
		var rrr = Math.round(rr);
	
		return Math.round(window[ "_" + (min + rrr) ]);
	}else{
		var output = [];
		var num;
		if(typeof number === "undefined") {
			num = max || min.length;
		}else{
			num = number;
		}
		if(num !== 1) {
			for(var i = 0; i < num; i++) {
				var choice;
				if(typeof arguments[0] === "object") {
					choice = arguments[0][randomi(0, arguments[0].length - 1)];
				}else{
					choice = randomi(min, max);
				}
				output.push(Math.round(window["_" + choice]));
			}
		}else{
			output = Math.round(window[ "_" + arguments[0][randomi(0, arguments[0].length - 1)]]);
		}
	
		return output;
		
	}
};

window.rndi = window.randomi = function(min, max, number, canRepeat) {
	canRepeat = typeof canRepeat === "undefined" ? true : canRepeat;
	if(typeof number === "undefined" && typeof min !== "object") {
		if(arguments.length == 1) {
			min = 0, max = arguments[0];
		}else if(arguments.length == 2) {
			min = arguments[0];
			max = arguments[1];
		}else{
			min = 0;
			max = 100;
		}

		var diff = max - min;
		var r = Math.random();
		var rr = diff * r;
		var rrr = Math.round(rr);
	
		return min + rrr;
	}else{
		var output = [];
		var tmp = [];
		if(typeof number === "undefined") {
			number = max || min.length;
		}
		for(var i = 0; i < number; i++) {
			var num;
			if(typeof arguments[0] === "object") {
				num = arguments[0][randomi(0, arguments[0].length - 1)];
			}else{
				if(canRepeat) {
					num = randomi(min, max);
				}else{
					num = randomi(min, max);
					while(tmp.indexOf(num) > -1) {
						num = randomi(min, max);
					}
					tmp.push(num);
				}
				
			}
			output.push(num);
		}

		return output;
	}
};

window.rndf = window.randomf = function(min, max, number, canRepeat) {
	canRepeat = typeof canRepeat === "undefined" ? true : canRepeat;
	if(typeof number === "undefined" && typeof min != "object") {
		if(arguments.length == 1) {
			min = 0, max = arguments[0];
		}else if(arguments.length == 2) {
			min = arguments[0];
			max = arguments[1];
		}else{
			min = 0;
			max = 1;
		}
	
		var diff = max - min;
		var r = Math.random();
		var rr = diff * r;
	
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
				num = arguments[0][randomi(0, arguments[0].length - 1)];
			}else{
				if(canRepeat) {
					num = randomf(min, max);
				}else{
					num = randomf(min, max);
					while(tmp.indexOf(num) > -1) {
						num = randomf(min, max);
					}
					tmp.push(num);
				}
			}
			output.push(num);
		}
		return output;
	}
}

/* returns function that randomly picks from an array using the provided weights. Example:
a = [1,2,3,4]
a.pick = weight([.5,.25,.1,.15])
a.pick();

TODO: Figure out an algorithm(s) to automatically create weights with different schemes
*/
window.weight = function(weights) {
    var w = (typeof weights === "object") ? weights : arguments;
    var returnValue = this[0];
    function pick() {
        var total = 0;
        var r = rndf();
        for(var i = 0; i < w.length; i++) {
            total += w[i];
            if(r < total) { 
                returnValue = this[i];
                break;
            }
        }
        return returnValue;
    }
    
    return pick;
}

window.whocares = window.doesItEvenMatter = window.surpriseMe = window.makeMeHappy = function() {
	function pick() {
		var n = rndi(0, this.length - 1);
		return this[n];
	}
	
	return pick;
}

window.future = function(func, when) {
	var me = func;
	me.advance = function() {
		try{
			me();
		}catch(err) {
			G.log("error in function called using future().");
		}
	};
	G.callback.addEvent(G.time(when), me);
};

window.getSpeed = function(div) {
	return window["_"+div];
};

window.ms = function(num) {
	return (G.sampleRate / 1000) * num;
}

window.mtof = function(midiNumber) {
 	return 440 * Math.pow(2,(midiNumber - 69) / 12);
};
	
window.ntof = function(note) {
	var n = teoria.note(note);
	return n.fq();
};

window.btof = function(beat) {
  return 44100 / ( (G.bpm / 60) * (beat * 44100) );
};

window.bzzzzzz = function() {
	if(typeof buzz === "undefined") {
		buzz = Saw();
	  	buzz.fx.add(HPF(1100, 5));
		buzz.freq(80, .2);		
	}
	buzz.amp = .2;
  	future(function() { buzz.amp = 0; }, _8);
};

window.bleep = function() {
	if(typeof frog === "undefined") {
		frog = FM("frog");
		frog.amp = .15;
		frog.fx.add( Ring() );		
	}
	frog.note("C8");
};

window.blop = function() {
	if(typeof env === "undefined") {
		env = Env2(860, 80, _16, 400, _32).end( function() {
	      sine.mod("amp", Env2(.25, 0, _64), "=");
    	});		
		sine = Sine({amp:.25});
		sine.mod("freq", env, "=");		
	}else{
		sine.amp = .25;
		sine.mods.remove();
		env = Env2(860, 80, _16, 400, _32).end( function() {
	      sine.mod("amp", Env2(.25, 0, _64), "=");
    	});
		
		sine.mod("freq", env, "=");		
	}
};

window.Group = function() {
	var that = Gibberish.Bus();
	that.children = [];
	that.release = function() {
		if(arguments.length === 0) {
			for(var i = 0; i < that.children.length; i++) {
				that.children[i].disconnect();
				that.children[i].connect(Master);
			}
			that.children = [];
		}else{
			for(var i = 0; i < arguments.length; i++) {
				that.children.remove(arguments[i]);
				arguments[i].disconnect();
				arguments[i].connect(Master);
			}
		}
	};
	
	that.ungroup = function() {
		that.store = that.children.slice(0);
		that.release();
	};
	
	that.regroup = function() { that.add.apply(that, that.store); };
	
	that.add = function() {
		for(var i = 0; i < arguments.length; i++) {
			if(that.children.indexOf(arguments[i]) === -1) {
				that.children.push(arguments[i]);
				arguments[i].disconnect();
				arguments[i].connect(that);
			}
		}
	};
	for(var i = 0; i < arguments.length; i++) {
		arguments[i].disconnect();
		that.children.push(arguments[i]);
		arguments[i].connect(that);
	}
	that.connect(Master);
	return that;
};

window.Scale = function(_root, _mode) {
	that = {
		root: typeof _root === "string" ? teoria.note(_root) : _root,
		notes: [],
		
		chord : function(_notes, _offset) {
			var _chord = [];
			_offset = _offset || 0;
			
			for(var i = 0; i < _notes.length; i++) {
				_chord.push(this.notes[_notes[i] + _offset].fq());
			}
			return _chord;
		},
		
		create : function() {
			this.notes = [];
			var _rootoctave = this.root.octave;

			var _scale = teoria.scale.list(this.root, this.mode, false);
			for(var oct = _rootoctave, o = 0; oct < _rootoctave + 8; oct++, o++) {
				for(var num = 0; num < _scale.length; num++) {
					var nt = jQuery.extend({}, _scale[num]);
					nt.octave += o;
					this.notes.push(nt);
				}
			}
			
			var negCount = -1;
			for(var oct = _rootoctave -1, o = -1; oct >= 0; oct--, o--) {
			 	for(var num = _scale.length - 1; num >= 0; num--) {
			 		var nt = jQuery.extend({}, _scale[num]);
			 		nt.octave += o;
			 		this.notes[negCount--] = nt;
			 	}
			}	
		},
		
		set : function(_root, _mode) {
			if(Array.isArray(arguments[0])) {
				this.root = arguments[0][0];
				this.mode = arguments[0][1];
			}else{
				this.root = _root;
				this.mode = _mode;
			}
		},
	};
	
	var mode = _mode || "aeolian";
	Object.defineProperty(that, "mode", {
		get: function() { return mode; },
		set: function(val) { mode = val; this.create(); }	
	});
	
	var root = that.root;
	Object.defineProperty(that, "root", {
		get: function() { return root; },
		set: function(val) { 
			root = typeof val === "string" ? teoria.note(val) : val; 
			this.create();
		}	
	});
	
	that.create();

	return that;
};

// wrap a function call in a function.
window._f = window.func = function() {
	var func = Array.prototype.splice.call(arguments, 0, 1)[0];
  	var args = Array.prototype.slice.call(arguments,0);
	
	return function() { return func.apply(this, args); };
}

window._rndf = function() {
	var args = Array.prototype.slice.call(arguments,0);
	return function() { return rndf.apply(this, args); };
};

window._rndi = function() {
	var args = Array.prototype.slice.call(arguments,0);
	return function() { return rndi.apply(this, args); };
};

window.list = function() {
	var arr = [];
	for(var i = 0; i < arguments.length; i++) {
		var val = arguments[i];
		if($.isArray(val)) {
			console.log("VAL IS ARRAY");
			for(j = 0; j < val[1]; j++) {
				arr.push(val[0]);
			}
		}else{
			arr.push(val);
		}
	}
	return arr;
};

window.Color = function(r,g,b) {
	var a = new THREE.Color(0x000000);
	a.setRGB(r,g,b);
	return a;
};
