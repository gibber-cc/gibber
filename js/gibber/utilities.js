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

Array.prototype.remove = function(arg) {
	if(typeof arg === "undefined") { // clear all
		for(var i = 0; i < this.length; i++) {
			delete this[i];
		}
		this.length = 0;
	}else if(typeof arg === "number") {
		this.splice(arg,1);
	}else if(typeof arg === "string"){ // find named member and remove
		for(var i = 0; i < this.length; i++) {
			var member = this[i];
			if(member.name == arg) {
				this.splice(i, 1);
			}
		}
	}else if(typeof arg === "object") {
		var idx = jQuery.inArray( arg, this);
		if(idx > -1) {
			this.splice(idx,1);
		}
	}
};

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

Array.prototype.add = function() {
	for(var i = 0; i < arguments.length; i++) {
		this.push(arguments[i]);
	}
};

Array.prototype.add1 = function() {
	for(var i = 0; i < arguments.length; i++) {
		var obj = arguments[i];
		for(var j = 0; j < this.length; j++) {
			if(obj.name !== this[j].name) {
				this.push(obj);
			}
		}
	}
};


Array.prototype.clear = function() {
	for(var i = 0; i < this.length; i++) {
		delete this[i];
	}
	this.length = 0;
};

Array.prototype.all = function(func) {
    for(var i = 0; i < this.length; i++) {
        func( this[i] );
    }
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


window.fill = function() {
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



window.rndi = window.randomi = function(min, max, number) {
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
		if(typeof number === "undefined") {
			number = max || min.length;
		}
		G.log(number);
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
	}
};

window.rndf = window.randomf = function(min, max, number) {
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

window.future = function(func, when) {
	var me = func;
	me.advance = function() {
		me();
	};
	G.callback.addEvent(when, me);
};

window.getSpeed = function(div) {
	return window["_"+div];
};

window.ms = function(num) {
	return (G.sampleRate / 1000) * num;
}

window.mtof = function(midiNumber) {
 	return 440 * Math.pow(2,(midiNumber - 69) / 12); //2^((n-69)/12)
};
	
function ntof(note) {
	var n = teoria.note(note);
	return n.fq();
};

window.bzzzzzz = function() {
	if(typeof b === "undefined") {
		b = Saw();
	  	b.fx.add(HPF(1100, 5));
		b.freq(80, .2);		
	}
	b.amp = .2;
  	future(function() { b.amp = 0; }, _8);
};

window.bleep = function() {
	if(typeof a === "undefined") {
		a = FM("frog");
		a.fx.add( Ring() );		
	}
	a.note("C8");
};

window.blop = function() {
	if(typeof c === "undefined") {
		c = Env2(860, 80, _16, 400, _32).end( function() {
	      d.mod("amp", Env2(.25, 0, _64), "=");
    	});		
		d = Sine({amp:.25});
		d.mod("freq", c, "=");		
	}else{
		d.amp = .25;
		d.mods.remove();
		c = Env2(860, 80, _16, 400, _32).end( function() {
	      d.mod("amp", Env2(.25, 0, _64), "=");
    	});
		
		d.mod("freq", c, "=");		
	}
};
