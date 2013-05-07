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

/*Array.prototype.insert = function(v, pos) {
	this.splice(pos,0,v);
};*/

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

/*Array.prototype.random = Array.prototype.rnd =  function() {
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
};*/

Array.prototype.random = Array.prototype.rnd = function() {
  var dict = {},
	    lastChosen = null;
      
	for(var i = 0; i < arguments.length; i+=2) {
    dict[ "" + arguments[i] ] = { repeat: arguments[i+1], count: 0 };
	}

	this.pick = function() {
    var value = 0;
    if(lastChosen !== null && dict[ ""+lastChosen ].count++ < dict[ ""+lastChosen ].repeat) {
      value = lastChosen;
      if( dict[ ""+lastChosen ].count >= dict[ ""+lastChosen ].repeat) {
        dict[ ""+lastChosen ].count = 0;
        lastChosen = null;
      };
    }else{
      var index = rndi(0, this.length - 1);
      value = this[index];
      if( typeof dict[ ""+value ] !== 'undefined' ) {
        dict[ ""+value ].count = 1;
        lastChosen = value;
      }else{
        lastChosen = null;
      }
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

//http://stackoverflow.com/questions/3362471/how-can-i-call-a-javascript-constructor-using-call-or-apply
function applyConstructor(ctor, args) {
    var a = [];
    for (var i = 0; i < args.length; i++)
        a[i] = 'args[' + i + ']';
    return eval('new ctor(' + a.join() + ')');
}

Bag = function(values) { 
  var notPicked = [];
  for(var i = 0; i < values.length; i++) { notPicked[i] = values[i]; }
  
	var pick = function() {    
		if(arguments.length === 0) { // just return a single value
      var idx = rndi(0, notPicked.length - 1)
			var val = notPicked[ idx ]
      notPicked.splice( idx, 1 )
		
			if(notPicked.length === 0)
        for(var i = 0; i < values.length; i++) { notPicked[i] = values[i]; }
        
			return val;
      
		}else{ // return an array of unique values
			if(arguments[0] >= values.length) {
				G.log("Bag error: You cannot return more unique values than are in the bag.");
				return values;
			}
			var out = [];
			for(var i = 0; i < arguments[0]; i++) {
				var choose = pick();
				while($.inArray(choose, out) > -1) {
					choose = pick();
				}
				out.push(choose);
			}
			return out;
		}
	};
	
  Object.defineProperties(pick, {
  	"values" : {
      get: function() {
        return values;
      },
      set: function(value) {
        values = value;
        notPicked.length = 0;
        for(var i = 0; i < values.length; i++) { notPicked[i] = values[i]; }
      }
  	},	
  });
	
	return pick;
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

window.seconds = function(num) {
  return G.sampleRate * num;
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

var soloGroup = [];
var isSoloing = false;
window.Solo = function(ugen) {
  var args = Array.prototype.slice.call(arguments);
  if(ugen) {
    if(isSoloing) { Solo(); }
    for(var i = 0; i < Master.senders.length; i++) {
      if(args.indexOf(Master.senders[i].operands[0]) === -1) {
        soloGroup.push([Master.senders[i], Master.senders[i].operands[0].amp]);
        Master.senders[i].operands[0].amp = 0;
      }
    }
    isSoloing =true;
  }else{
    for(var i = 0; i < soloGroup.length; i++) {
      soloGroup[i][0].operands[0].amp = soloGroup[i][1];
    }
    isSoloing = false;
  }
}

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
			if(Gibber.scales[this.mode]) {
				var scale = Gibber.scales[this.mode](this.root);
				scale.create();
				this.notes = scale.notes;
			}else{
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
				for(var oct = _rootoctave - 2, o = -1; oct >= 0; oct--, o--) {
				 	for(var num = _scale.length - 1; num >= 0; num--) {
				 		var nt = jQuery.extend({}, _scale[num]);
				 		nt.octave += o;
				 		this.notes[negCount--] = nt;
				 	}
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

window.CustomScale = function() {
  var that = {
    notes : [],
    ratios: arguments[1] || [1, 1.10, 1.25, 1.3333, 1.5, 1.666, 1.75],
	
    create : function() {
      this.notes = [];
  
      var scaleRoot = this.root;
      
      for( var octave = 0; octave < 8; octave++ ) {
        for( var num = 0; num < this.ratios.length; num++ ) {	
          this.notes.push( scaleRoot * this.ratios[num] );
        }
        scaleRoot *= 2;
      }
      
      scaleRoot = this.root;
	  var negCount = 8;
      for(var octave = -1; octave >= -8; octave--) {
        scaleRoot /= 2;
        for( var num = 0; num < this.ratios.length; num++ ) {
		  var noteNum = octave * this.ratios.length + num;
          this.notes[noteNum] = scaleRoot * this.ratios[num];
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
	},	
  };

  var _root = arguments[0] || 440;
  Object.defineProperty(that, "root", {
    get : function() { return _root; },
    set : function(val) { 
		if(typeof val === "number") {
			_root = val;
		}else if (typeof val === "string") {
			_root = teoria.note(val).fq();
			console.log(_root, teoria.note(val));
		}else if (typeof val === 'object') {
			_root = val.fq();
		}
		console.log()
		this.create(_root); }
  });
  
  that.root = _root;                   
  that.create();
      
  return that;
};


Gibber.scales = {
	// Scales contributed by Luke Taylor
	// Half-Whole or Octatonic Scale
	//http://en.wikipedia.org/wiki/Octatonic_scale
	HalfWhole : function(root) {
	   return CustomScale( root, [ 1,1.059463,1.189207,1.259921,1.414214,1.498307,1.681793, 1.781797 ]);
	},

	//Whole-Half or Octatonic Scale
	//http://en.wikipedia.org/wiki/Octatonic_scale
	WholeHalf : function(root) {
	   return CustomScale( root, [ 1,1.122462,1.189207,1.334840,1.414214,1.587401,1.681793, 1.887749 ]);
	},

	//Pythagorean Tuning
	//http://en.wikipedia.org/wiki/Pythagorean_tuning

	//Chromatic scale in Pythagorean tuning
	Pythagorean : function(root) {
	   return CustomScale( root, [ 1, 256/243, 9/8, 32/27, 81/64, 4/3, 729/512, 3/2, 128/81, 27/16, 16/9, 243/128 ]);
	},

	//Major Pythagorean
	PythagoreanMajor : function(root) {
	   return CustomScale( root, [ 1, 9/8, 81/64, 4/3, 3/2, 27/16, 243/128 ]);
	},

	//Major Pythagorean
	PythagoreanMinor : function(root) {
	   return CustomScale( root, [ 1, 9/8, 32/27, 4/3, 3/2, 128/81, 16/9 ]);
	},
	
	// 5-limit Just Intonation 
	//http://en.wikipedia.org/wiki/List_of_intervals_in_5-limit_just_intonation

	//Chromatic scale in 5-limit just intonation
	Limit5 : function(root) {
	   return CustomScale( root, [ 1, 16/15, 9/8, 6/5, 5/4, 4/3, 45/32, 3/2, 8/5, 5/3, 9/5, 15/8 ]);
	},

	//Major scale in 5-limit
	Limit5Major : function(root) {
	   return CustomScale( root, [ 1, 9/8, 5/4, 4/3, 3/2, 5/3, 15/8 ]);
	},

	//Minor scale in 5-limit
	Limit5Minor : function(root) {
	   return CustomScale( root, [ 1, 9/8, 6/5, 4/3, 3/2, 8/5, 9/5 ]);
	},

	// Messiaen's modes of limited transposition http://en.wikipedia.org/wiki/Modes_of_limited_transposition
	Mess3 : function(root) { return CustomScale( root, [1,1.122462, 1.189207, 1.259921, 1.414214, 1.498307, 1.587401, 1.781797, 1.887749 ]) },

	Mess4 : function(root) { return CustomScale( root, [1, 1.059463, 1.122462, 1.334840, 1.414214, 1.498307, 1.587401, 1.887749 ]) },

	Mess5 : function(root) { return CustomScale( root, [1, 1.059463, 1.334840, 1.414214, 1.498307, 1.887749 ]) },

	Mess6 : function(root) { return CustomScale( root, [1, 1.122462, 1.259921, 1.334840, 1.414214, 1.587401, 1.781797, 1.887749 ]) },

	Mess7 : function(root) { return CustomScale( root, [1, 1.059463, 1.122462, 1.189207, 1.334840, 1.414214, 1.498307, 1.587401, 1.681793, 1.887749 ]) },

	//And, a personal (anthony garcia) favorite synthetic mode, lydian flat 7:
	Adams : function(root) { return CustomScale( root, [1, 1.122462, 1.259921, 1.414214, 1.498307, 1.681793, 1.781797 ]) },

	//5 tone equal temperament
	//http://en.wikipedia.org/wiki/Equal_temperament#5_and_7_tone_temperaments_in_ethnomusicology
	Equal5Tone : function(root) {
	   return CustomScale( root, [ 1, 1.15, 1.32, 1.35, 1.52, 1.74 ]);
	},

	//7 tone equal temperament
	//http://en.wikipedia.org/wiki/Equal_temperament#5_and_7_tone_temperaments_in_ethnomusicology
	Equal7Tone : function(root) {
	   return CustomScale( root, [ 1, 1.1, 1.22, 1.35, 1.49, 1.64, 1.81 ]);
	},

	Just : function(root) {
		return CustomScale(root, [
			1, 1.0417, 1.1250, 1.2000,
			1.2500, 1.3333, 1.4063, 1.5,
			1.6, 1.6667, 1.8, 1.8750
		]);
	},
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

// window.Color = function(r,g,b) {
// 	var a = new THREE.Color(0x000000);
// 	a.setRGB(r,g,b);
// 	return a;
// };
