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
	}else{ // find named member and remove
		for(var i = 0; i < this.length; i++) {
			var member = this[i];
			if(member.name == arg) {
				this.splice(i, 1);
			}
		}
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
	console.log(obj[val]);
	obj[val] = (obj[val] === value1) ? value2 : value1;
	console.log(obj[val]);
};

window.copy = function(obj) {
	return $.extend(true, {}, obj);
};

window.randomi = function() {
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
}

window.randomf = function(min, max) {
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
