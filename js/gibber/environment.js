Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
}

Gibber.Environment = {
	save : function(code) {
		var scripts;
		if(typeof localStorage.scripts === "undefined") {
			scripts = {};
		}else{
			scripts = localStorage.getObject("scripts")
		}
		var name = window.prompt("Enter name for file");
		scripts[name] = code;
		localStorage.setObject("scripts", scripts);
		Gibber.Environment.createFileList(name);
	},
	
	load : function(fileName) {
		var scripts = localStorage.getObject("scripts");
		if(scripts != null) {
			if(typeof scripts[fileName] !== "undefined") {
				return scripts[fileName];
			}
		}else if(typeof Gibber.defaultScripts[fileName] !== "undefined"){
			return Gibber.defaultScripts[fileName];
		}else{
			window.alert("The file " + fileName +" is not found");
			return null;
		}
	},
	
	loadAndSet : function(fileName) {
		var code = this.load(fileName);
		if(code != null) {
			Gibber.Environment.Editor.getSession().setValue(code);
		}	
	},
	
	
	addScriptsToList : function(scripts, defaultName) {
		var foundSection = false;
		var sectionName = null;
		var optgroup = null;
		var sel=$("#fileList");
		for(var name in scripts) {
			if(scripts[name] === "LABEL END") {
				$(sel).append(optgroup);
				break;
			}
			if(scripts[name] === "LABEL START") {
				if(foundSection) {
					$(sel).append(optgroup);
				}
				sectionName = name;
				optgroup = document.createElement("optgroup");
				optgroup.label = name;
				foundSection = true;
				continue;
			}
			var opt = document.createElement("option");
			opt.value = name;
			if(typeof defaultName === "undefined") { // on startup
				if(name === "default") {
					opt.selected = "selected";
				}
			}else{
				if(name === defaultName) {
					opt.selected = "selected";
				}
			}
			opt.innerHTML = name;
			if(foundSection) {
				$(optgroup).append(opt);
			}else{
				$(sel).append(opt);
			}
		}
	},
	createFileList : function(savedFile) {
		var sel = $("#fileList");
		$(sel).empty();
		var scripts = localStorage.getObject("scripts");
		var defaultName;
		if(typeof savedFile === "undefined") { // on startup
			defaultName = "default";
		}else{
			defaultName = savedFile;
		}
		this.addScriptsToList(scripts, defaultName);
	},
	
	init: function() {
		this.initEditor();
		this.addScriptsToList(Gibber.defaultScripts, "default");
		//this.createFileList();
	},
	
	initEditor : function() {
		Gibber.Environment.Editor = ace.edit("editor");
	    var JavaScriptMode = require("ace/mode/javascript").Mode;
	    Gibber.Environment.Editor.getSession().setMode(new JavaScriptMode());
		Gibber.Environment.Editor.setTheme("ace/theme/thecharlie");
		$('.ace_gutter').css({
			"background-color":"#000",
			"color":"#ccc",
			"border-width": "0px 1px 0px 0px",
			"border-color": "#ccc",
			"border-style": "solid", 
		});
		$(".ace_sb").css("z-index", 10);
		
		$('.quickstartsection').click(function(){				
		    $('.quickstartcontent').toggle();
		});
		
		$('.aboutsection').click(function(){
		    $('.aboutcontent').toggle();
		});
		$('.optionssection').click(function(){
		    $('.optionscontent').toggle();
		});
		$('.referencesection').click(function(){				
		    $('.referencecontent').toggle();
		});
			
		var count = document.createElement('div');
		count.id = "count";
		count.innerHTML ="<span id='n1'>1</span><span id='n2'>2</span><span id='n3'>3</span><span id='n4'>4</span></span>";
		$('.ace_scroller').append(count);
	
		Gibber.Environment.Editor.commands.addCommand({
		    name: 'toggleInfo',
		    bindKey: {
		        win: 'Ctrl-I',
		        mac: 'Command-I',
		        sender: 'Gibber.Environment.Editor'
		    },
		    exec: function(env, args, request) {
				$('#info').toggle();
				if($("#info").css("display") == "none") {
					$('#editor').css("width", "100%");
				}else{
					$('#editor').css("width", "80%");
				}
				Gibber.Environment.Editor.resize();
		    }
		});
		Gibber.Environment.Editor.commands.addCommand({
		    name: 'evaluate',
		    bindKey: {
		        win: 'Ctrl-Return',
		        mac: 'Command-Return',
		        sender: 'Gibber.Environment.Editor'
		    },
		    exec: function(env, args, request) {
				console.log(this);
		        var text = Gibber.Environment.Editor.getSession().doc.getTextRange(Gibber.Environment.Editor.getSelectionRange());
				if(text === "") {
					var pos = Gibber.Environment.Editor.getCursorPosition();
					text = Gibber.Environment.Editor.getSession().doc.getLine(pos.row);
				}
				Gibber.runScript(text);
		    }
		});
		Gibber.Environment.Editor.commands.addCommand({
		    name: 'evaluate_1',
		    bindKey: {
		        win: 'Ctrl-Shift-Return',
		        mac: 'Command-Shift-Return',
		        sender: 'Gibber.Environment.Editor'
		    },
		    exec: function(env, args, request) {
		        var text = Gibber.Environment.Editor.getSession().doc.getTextRange(Gibber.Environment.Editor.getSelectionRange());
				if(text === "") {
					var pos = Gibber.Environment.Editor.getCursorPosition();
					text = Gibber.Environment.Editor.getSession().doc.getLine(pos.row);
				}

				Gibber.callback.addCallback(text, _1);
		    }
		});
		Gibber.Environment.Editor.commands.addCommand({
		    name: 'evaluate_4',
		    bindKey: {
		        win: 'Ctrl-Shift-Alt-Return',
		        mac: 'Command-Shift-Option-Return',
		        sender: 'Gibber.Environment.Editor'
		    },
		    exec: function(env, args, request) {
		        var text = Gibber.Environment.Editor.getSession().doc.getTextRange(Gibber.Environment.Editor.getSelectionRange());
				if(text === "") {
					var pos = Gibber.Environment.Editor.getCursorPosition();
					text = Gibber.Environment.Editor.getSession().doc.getLine(pos.row);
				}

				Gibber.callback.addCallback(text, _4);
		    }
		});
			
			
		Gibber.Environment.Editor.commands.addCommand({
		    name: 'stop',
		    bindKey: {
		        win: 'Ctrl-.',
		        mac: 'Command-.',
		        sender: 'Gibber.Environment.Editor'
		    },
		    exec: function(env, args, request) {
				Gibber.active = !Gibber.active;
				if(Gibber.active) console.log("audio on"); else console.log("audio off");
		    }
		});
		Gibber.Environment.Editor.commands.addCommand({
		    name: 'deleteGenerators',
		    bindKey: {
		        win: 'Ctrl-`',
		        mac: 'Command-`',
		        sender: 'Gibber.Environment.Editor'
		    },
		    exec: function(env, args, request) {
				Gibber.clear();
				Gibber.audioInit = false;
		    }
		});
		
		Gibber.Environment.Editor.commands.addCommand({
		    name: 'save',
		    bindKey: {
		        win: 'Shift-Ctrl-s',
		        mac: 'Shift-Command-s',
		        sender: 'Gibber.Environment.Editor'
		    },
		    exec: function(env, args, request) {
		        var text = Gibber.Environment.Editor.getSession().doc.getTextRange(Gibber.Environment.Editor.getSelectionRange());
				if(text === "") {
					var pos = Gibber.Environment.Editor.getCursorPosition();
					text = Gibber.Environment.Editor.getSession().getValue();
				}
				Gibber.Environment.save(text)
		    }
		});
		Gibber.Environment.Editor.commands.addCommand({
		    name: 'load',
		    bindKey: {
		        win: 'Shift-Ctrl-l',
		        mac: 'Shift-Command-l',
		        sender: 'Gibber.Environment.Editor'
		    },
		    exec: function(env, args, request) {
				var name = prompt("Enter name of file to load.");
				
				var code = Gibber.Environment.load(name);
				if(code != null) {
					Gibber.Environment.Editor.getSession().setValue(code);
				}
		    }
		});
		
		Gibber.Environment.Editor.commands.addCommand({
		    name: 'remoteSend',
		    bindKey: {
		        win: 'Shift-Ctrl-2',
		        mac: 'Shift-Command-2',
		        sender: 'Gibber.Environment.Editor'
		    },
		    exec: function(env, args, request) {
		        var text = Gibber.Environment.Editor.getSession().doc.getTextRange(Gibber.Environment.Editor.getSelectionRange());
				if(text === "") {
					var pos = Gibber.Environment.Editor.getCursorPosition();
					text = Gibber.Environment.Editor.getSession().doc.getLine(pos.row);
				}
				socket.send(text);
		    }
		});
		
		
				
		Gibber.Environment.Editor.setShowPrintMargin(false);
	},
};