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

Array.prototype.clear = function() {
	for(var i = 0; i < this.length; i++) {
		delete this[i];
	}
	this.length = 0;
};

// http://snippets.dzone.com/posts/show/849
Array.prototype.shuffle = function() {
		for(var j, x, i = this.length; i; j = parseInt(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
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
	for(var i = 0; i < number; i++) {
		output.push(randomi(min, max));
	}
	return output;
};

window.fillf = function(min, max, number) {
	var output = [];
	for(var i = 0; i < number; i++) {
		output.push(randomf(min, max));
	}
	return output;
};

// fill durations
window.filld = function(min, max, number) {
	var output = [];
	for(var i = 0; i < number; i++) {
		output.push(window["_" + randomi(min, max)]);
	}
	
	return output;
};


window.fill = function() {
	return window.filli(0, 20, 16);
};




window.rndi = window.randomi = function() {
	var min, max;
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
};

window.getSpeed = function(div) {
	return window["_"+div];
};

window.rndf = 	window.randomf = function(min, max) {
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
}

// mtof : function(midiNumber) {
// 	return 440 * Math.pow(2,(midiNumber - 69) / 12); //2^((n-69)/12)
// },
	
function ntof(note) {
	var n = teoria.note(note);
	return n.fq();
};