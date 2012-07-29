define(["gibberish/lib/gibberish"], function() {
    String.prototype.format = function(i, safe, arg) {

        function format() {
            var str = this,
                len = arguments.length + 1;

            for (i = 0; i < len; arg = arguments[i++]) {
                safe = arg; //typeof arg === 'object' ? JSON.stringify(arg) : arg;
                str = str.replace(RegExp('\\{' + (i - 1) + '\\}', 'g'), safe);
            }
            return str;
        }

        format.native = String.prototype.format;

        return format;
    }();
	
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
				if(member.type === arg || member.name === arg) {
					this.splice(i,1);
				}
				// if(member.symbol === arg) {
				// 	this.splice(i, 1);
				// }
			}
		}else if(typeof arg === "object") {
			var idx = jQuery.inArray( arg, this);
			if(idx > -1) {
				this.splice(idx,1);
			}
		}
		if(this.parent) Gibberish.dirty(this.parent);
	};
	
	Array.prototype.get = function(arg) {
		if(typeof arg === "number") {
			return this[arg];
		}else if(typeof arg === "string"){ // find named member and remove
			for(var i = 0; i < this.length; i++) {
				var member = this[i];

				if(member.name === arg) {
					return member;
				}
			}
		}else if(typeof arg === "object") {
			var idx = jQuery.inArray( arg, this);
			if(idx > -1) {
				return this[idx];
			}
		}
	};
	

	Array.prototype.replace = function(oldObj, newObj) {
		newObj.parent = this;
		if(typeof oldObj != "number") {
			var idx = jQuery.inArray( oldObj, this);
			if(idx > -1) {
				this.splice(idx, 1, newObj);
			}
		}else{
			this.splice(oldObj, 1, newObj);
		}
		if(this.parent) Gibberish.dirty(this.parent);
	};

	Array.prototype.insert = function(v, pos) {
		v.parent = this;
		this.splice(pos,0,v);
		if(this.parent) Gibberish.dirty(this.parent);
	};

	Array.prototype.add = function() {
		for(var i = 0; i < arguments.length; i++) {
			arguments[i].parent = this;
			this.push(arguments[i]);
		}
		//console.log("ADDING ::: this.parent = ", this.parent)
		if(this.parent) Gibberish.dirty(this.parent);
	};
	
	Array.prototype.pushUnique = function() {
		for(var i = 0; i < arguments.length; i++) {
			var obj = arguments[i];
			var shouldAdd = true;
			for(var j = 0; j < this.length; j++) {
				if(obj === this[j]) {
					shouldAdd = false;
					break;
				}
			}
			if(shouldAdd) {
				this.push(obj);
			}
		}
	};

	Array.prototype.replace = function(oldObj, newObj) {
		if(typeof oldObj != "number") {
			var idx = this.indexOf( oldObj );
			if(idx > -1) {
				this.splice(idx, 1, newObj);
			}
		}else{
			this.splice(oldObj, 1, newObj);
		}
		if(this.parent) Gibberish.dirty(this.parent);
	};
	
	String.prototype.hashCode = function(){
	    var hash = 0;
	    if (this.length == 0) return hash;
	    for (i = 0; i < this.length; i++) {
	        char = this.charCodeAt(i);
	        hash = ((hash<<5)-hash)+char;
	        hash = hash & hash; // Convert to 32bit integer
	    }
	    return hash;
	};
	
	window.rndf = function(min, max, number) {
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
});
