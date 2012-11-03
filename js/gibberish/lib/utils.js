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
	
	Array.prototype.remove = function(arg, searchDeep) { // searchDeep when true removes -all- matches, when false returns first one found.
		searchDeep = typeof searchDeep === 'undefined' ? true : searchDeep;
		if(typeof arg === "undefined") { // clear all
			for(var i = 0; i < this.length; i++) {
				delete this[i];
			}
			this.length = 0;
		}else if(typeof arg === "number") {
			this.splice(arg,1);
		}else if(typeof arg === "string"){ // find named member and remove
			var removeMe = [];
			for(var i = 0; i < this.length; i++) {
				var member = this[i];
				if(member.type === arg || member.name === arg) {
					if(!searchDeep) {
						this.splice(i,1);
						return;
					}else{
						removeMe.push(i);
					}
				}
			}
			for(var i = 0; i < removeMe.length; i++) {
				this.splice( removeMe[i], 1);
			}
		}else if(typeof arg === "object") {
			var idx = this.indexOf(arg);
			while(idx > -1) {
				this.splice(idx,1);
				idx = this.indexOf(arg);
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
			var idx = this.indexOf(arg);
			if(idx > -1) {
				return this[idx];
			}
		}
		return null;
	};
	

	Array.prototype.replace = function(oldObj, newObj) {
		newObj.parent = this;
		if(typeof oldObj != "number") {
			var idx = this.indexOf(oldObj);
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
		if(Array.isArray(v)) {
			for(var i = 0; i < v.length; i++) {
				this.splice(pos + i, 0, v[i]);
			}
		}else{
			this.splice(pos,0,v);
		}
		if(this.parent) Gibberish.dirty(this.parent);
	};

	Array.prototype.add = function() {
		for(var i = 0; i < arguments.length; i++) {
			arguments[i].parent = this;
			//console.log(this.parent, this.parent.channels);
			if(typeof this.parent.channels === "number") {
				//console.log("CHANGING CHANNELS");
				arguments[i].channels = this.parent.channels;
			}
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
	
	Function.prototype.clone=function(){
	    return eval('['+this.toString()+']')[0];
	};
});