Gibber.setupEditor = function(editor) {
    var JavaScriptMode = require("ace/mode/javascript").Mode;
    editor.getSession().setMode(new JavaScriptMode());
	editor.setTheme("ace/theme/idle_fingers");
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
	
	editor.commands.addCommand({
	    name: 'toggleInfo',
	    bindKey: {
	        win: 'Ctrl-I',
	        mac: 'Command-I',
	        sender: 'editor'
	    },
	    exec: function(env, args, request) {
			$('#info').toggle();
			if($("#info").css("display") == "none") {
				$('#editor').css("width", "100%");
			}else{
				$('#editor').css("width", "80%");
			}
			editor.resize();
	    }
	});
	editor.commands.addCommand({
	    name: 'evaluate',
	    bindKey: {
	        win: 'Ctrl-Return',
	        mac: 'Command-Return',
	        sender: 'editor'
	    },
	    exec: function(env, args, request) {
	        var text = editor.getSession().doc.getTextRange(editor.getSelectionRange());
			if(text === "") {
				var pos = editor.getCursorPosition();
				text = editor.getSession().doc.getLine(pos.row);
			}
			Gibber.runScript(text);
	    }
	});
	editor.commands.addCommand({
	    name: 'evaluate_1',
	    bindKey: {
	        win: 'Ctrl-Shift-Return',
	        mac: 'Command-Shift-Return',
	        sender: 'editor'
	    },
	    exec: function(env, args, request) {
	        var text = editor.getSession().doc.getTextRange(editor.getSelectionRange());
			if(text === "") {
				var pos = editor.getCursorPosition();
				text = editor.getSession().doc.getLine(pos.row);
			}

			Gibber.callback.addCallback(text, _1);
	    }
	});
	editor.commands.addCommand({
	    name: 'evaluate_4',
	    bindKey: {
	        win: 'Ctrl-Shift-Alt-Return',
	        mac: 'Command-Shift-Option-Return',
	        sender: 'editor'
	    },
	    exec: function(env, args, request) {
	        var text = editor.getSession().doc.getTextRange(editor.getSelectionRange());
			if(text === "") {
				var pos = editor.getCursorPosition();
				text = editor.getSession().doc.getLine(pos.row);
			}

			Gibber.callback.addCallback(text, _4);
	    }
	});
			
			
	editor.commands.addCommand({
	    name: 'stop',
	    bindKey: {
	        win: 'Ctrl-.',
	        mac: 'Command-.',
	        sender: 'editor'
	    },
	    exec: function(env, args, request) {
			Gibber.active = !Gibber.active;
			if(Gibber.active) console.log("audio on"); else console.log("audio off");
	    }
	});
	editor.commands.addCommand({
	    name: 'deleteGenerators',
	    bindKey: {
	        win: 'Ctrl-`',
	        mac: 'Command-`',
	        sender: 'editor'
	    },
	    exec: function(env, args, request) {
			Gibber.clear();
			Gibber.audioInit = false;
	    }
	});
			
	editor.setShowPrintMargin(false);
};