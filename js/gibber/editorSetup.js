Gibber.Environment = {
	save : function(file) {
		if(typeof localStorage.Gibber.scripts === "undefined") {
			localStorage.Gibber.scripts = {};
			
		}
	},
	
	init: function() {
		this.initEditor();
	},
	
	initEditor : function() {
		this.Editor = ace.edit("editor");
	    var JavaScriptMode = require("ace/mode/javascript").Mode;
	    this.Editor.getSession().setMode(new JavaScriptMode());
		this.Editor.setTheme("ace/theme/idle_fingers");
		$('.ace_gutter').css({
			"background-color":"#000",
			"color":"#ccc",
			"border-width": "0px 1px 0px 0px",
			"border-color": "#ccc",
			"border-style": "solid", 
		});
		$(".ace_sb").css("z-index", 10);
	
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
	
		this.Editor.commands.addCommand({
		    name: 'toggleInfo',
		    bindKey: {
		        win: 'Ctrl-I',
		        mac: 'Command-I',
		        sender: 'this.Editor'
		    },
		    exec: function(env, args, request) {
				$('#info').toggle();
				if($("#info").css("display") == "none") {
					$('#this.Editor').css("width", "100%");
				}else{
					$('#this.Editor').css("width", "80%");
				}
				Gibber.Environment.Editor.resize();
		    }
		});
		this.Editor.commands.addCommand({
		    name: 'evaluate',
		    bindKey: {
		        win: 'Ctrl-Return',
		        mac: 'Command-Return',
		        sender: 'this.Editor'
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
		this.Editor.commands.addCommand({
		    name: 'evaluate_1',
		    bindKey: {
		        win: 'Ctrl-Shift-Return',
		        mac: 'Command-Shift-Return',
		        sender: 'this.Editor'
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
		this.Editor.commands.addCommand({
		    name: 'evaluate_4',
		    bindKey: {
		        win: 'Ctrl-Shift-Alt-Return',
		        mac: 'Command-Shift-Option-Return',
		        sender: 'this.Editor'
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
			
			
		this.Editor.commands.addCommand({
		    name: 'stop',
		    bindKey: {
		        win: 'Ctrl-.',
		        mac: 'Command-.',
		        sender: 'this.Editor'
		    },
		    exec: function(env, args, request) {
				Gibber.active = !Gibber.active;
				if(Gibber.active) console.log("audio on"); else console.log("audio off");
		    }
		});
		this.Editor.commands.addCommand({
		    name: 'deleteGenerators',
		    bindKey: {
		        win: 'Ctrl-`',
		        mac: 'Command-`',
		        sender: 'this.Editor'
		    },
		    exec: function(env, args, request) {
				Gibber.clear();
				Gibber.audioInit = false;
		    }
		});
			
		this.Editor.setShowPrintMargin(false);
	},
};