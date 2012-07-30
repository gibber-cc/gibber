define([
	'gibber/gibber',
	'gibber/default_scripts',
	'codemirror/codemirror',
	'gibber/tutorials',
	"js/codemirror/util/loadmode.js",
	"js/codemirror/util/overlay.js",
	'jquery.simplemodal',
	'node/socket.io.min',
	'megamenu/jquery.hoverIntent.minified',
	'megamenu/jquery.dcmegamenu.1.3.3.min',
], function(_Gibber, defaults, CodeMirror) {
	
	Storage.prototype.setObject = function(key, value) {
	    this.setItem(key, JSON.stringify(value));
	}

	Storage.prototype.getObject = function(key) {
	    var value = this.getItem(key);
	    return value && JSON.parse(value);
	}

	_Gibber.log = function(val) {
		$(".consoletext").text(val);
		window.console.log(val);
	}
	var Environment = {
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
	
		slave : function(name, ip) {
			$("#info").html("");

			console.log("Name " + name + " : ip " + ip);
			Gibber.Environment.slaveSocket = io.connect('http://' + ip + ':8080/'); // has to match port node.js is running on
			Gibber.Environment.slaveSocket.on('connect', function () {
				G.log("CONNECTED TO MASTER AS " + name);
				Gibber.Environment.slaveSocket.emit('name', {"name":name});
			});
			Gibber.Environment.slaveSocket.on('chat', function(msg) {
				var p = $("<p>");
				$(p).css("padding", "0px 10px");
				$(p).html("<h2 style='display:inline'>"+msg.user+" :</h2>" + " " + msg.text);
				$("#info").append(p);
				$("#info").scrollTop( $("#info").height() );
			});
		},
	
		master : function() {
			$("#info").html("");
			Gibber.Environment.masterSocket = io.connect('http://localhost:8080/');
			Gibber.Environment.masterSocket.on('connect', function () {
				G.callback.phase = 0;
				window.editor.setValue("");
				Gibber.Environment.insert("// MASTER SESSION START\n\n");
				Gibber.Environment.sessionStart = new Date();
				Gibber.Environment.sessionHistory = [];
				Gibber.Environment.masterSocket.on('code', function (msg) {
					Gibber.Environment.insert(msg.code);
					Gibber.Environment.sessionHistory.push( { code: msg.code, time: new Date() - Gibber.Environment.sessionStart} );
					window.editor.scrollTo(0, $(".CodeMirror-scroll > div").outerHeight());
				
					Gibber.callback.addCallback(msg.code, _1);
				});
				Gibber.Environment.masterSocket.on('chat', function(msg) {
					Gibber.Environment.sessionHistory.push( { user: msg.user, text:msg.text, time: new Date() - Gibber.Environment.sessionStart} );
					var p = $("<p>");
					$(p).css("padding", "0px 10px");
					$(p).html("<h2 style='display:inline'>"+msg.user+" :</h2>" + " " + msg.text);
					$("#info").append(p);
					$("#info").scrollTop( $("#info").height() );
				});
			
				Gibber.Environment.masterSocket.emit('master', null);
			});	
		},
	
	    saveSession : function(name) { 
	    	var sessions = localStorage.getObject("sessions");
			if(typeof sessions === "undefined" || sessions === null) {
				sessions = {};
			}
		
			sessions[name] = G.Environment.sessionHistory ;
			localStorage.setObject("sessions", sessions);
		},
	
		saveWithName : function(name) {
			var scripts;
			if(typeof localStorage.scripts === "undefined") {
				scripts = {};
			}else{
				scripts = localStorage.getObject("scripts");
			}
		
	        var text = window.editor.getValue();
		
			scripts[name] = text;
			localStorage.setObject("scripts", scripts);
			Gibber.Environment.createFileList();
			G.log(name + " has been saved.")
		},
	
		load : function(fileName) {
			var scripts = localStorage.getObject("scripts");
			if(scripts != null) {
				if(typeof scripts[fileName] !== "undefined") {
					return scripts[fileName];
				}
			}
			if(typeof defaults[fileName] !== "undefined"){
				return defaults[fileName];
			}else{
				window.alert("The file " + fileName +" is not found");
				return null;
			}
		},
	
		loadAndSet : function(fileName) {
			var code = this.load(fileName);
			if(code != null) {
				window.editor.setValue(code);
			}	
		},
	
		addScriptsToList : function(scripts) {
			var sel=$("#fileList");
			for(var name in scripts) {
				var opt = $("<li>");
				if(scripts[name] !== "LABEL START") {
					var cb = function(_name) {
						var n = _name;
						return function() {
							console.log(n);
							Gibber.Environment.loadAndSet(n);
						}
					}
					var a = $("<a>");
					$(a).text(name);
					$(opt).bind("click", cb(name));
					$(opt).append(a);
				}else{
					$(opt).text(" " + name);
					$(opt).css({
						"padding-left": ".5em", 
						"font-weight" : "bold",
						"margin": "1em 0",
						"background-color": "#fff",
						"color": "#000",
						"text-align": "left", 
					});
				}
				$(sel).append(opt);
			}
		},
		createFileList : function(savedFile) {
			var sel = $("#fileList");
			$(sel).empty();
			this.addScriptsToList(defaults);
		
			var userScripts = localStorage.getObject("scripts")
		
			var sel=$("#fileList");
			var opt = $("<li>");
			$(opt).text("USER SCRIPTS");
			$(opt).css({
				"padding-left": ".5em", 
				"font-weight" : "bold",
				"margin": "1em 0",
				"background-color": "#fff",
				"color": "#000",
				"text-align": "left", 
			});
			$(sel).append(opt);
		
			this.addScriptsToList(userScripts);
		},
	
		insert: function(code) {
			var endLine = window.editor.lineCount()-1;
			window.editor.setLine(endLine, window.editor.getLine(endLine) + " \n" + code);
		},
	
		loadTutorial : function(name) {
			console.log("LOADING TUTORIAL " + name + name.charAt(name.length - 1)  );
			if(name.charAt(name.length - 1) === "_") {
				Gibber.clear();
				name = name.substring(0, name.length-1);
			}
			window.editor.setValue(Gibber.tutorials[name]);
		},
	
		init: function() {
			try{
			    Gibber.OSC = io.connect('http://localhost:8080/');
			}catch(e){
				console.log("No OSC server running");
			}
			
			$(window).resize(Gibber.Environment.editorResize);
			$("#mega-menu-1").dcMegaMenu({
				speed : 'fast',
			});
			this.createFileList();
			CodeMirror.modeURL = "js/codemirror/mode/%N/%N.js";
			window.editor = CodeMirror.fromTextArea(document.getElementById("code"), {
	  		  lineNumbers: false,
	  		  autofocus: true,
			  indentUnit : 2,
	  		  smartIndent: true,
			});
			CodeMirror.autoLoadMode(window.editor, "javascript");	
			window.CodeMirror = CodeMirror;	
		    window.editor.setOption("mode", "javascript");
			window.editor.setOption("theme", "thecharlie");
		
			CodeMirror.defineMode("links", function(config, parserConfig) { 
			    var linksOverlay = { 
				    token: function(stream, state) { 
					    if (stream.match(/^\b(next\ tutorial:([^\s]+))\b/)) {
					        return "link"; 
						}
					    stream.skipToEnd(); 
				    }
				};
				return CodeMirror.overlayParser(CodeMirror.getMode(config, parserConfig.backdrop || "javascript"), linksOverlay);				
			});
		
		    $('.CodeMirror').delegate(".cm-link", "click", function(e) {
		    	var url = $(event.target).text();
				console.log(url);
	        	Gibber.Environment.loadTutorial(url.split(":")[1]);
		    });
	       
			CodeMirror.autoLoadMode(window.editor, "links");
		    window.editor.setOption("mode", "links");
		
		
			this.loadAndSet("default");
			this.editorResize();
			$.extend($.modal.defaults, {
				onOpen: function (dialog) {
					dialog.overlay.fadeIn('fast', function () {
						//dialog.data.hide();
						dialog.container.fadeIn('fast', function () {
							dialog.data.slideDown('fast');
						});
					});
				},
				onClose: function (dialog) {
					dialog.data.fadeOut('slow', function () {
						dialog.container.hide('slow', function () {
							dialog.overlay.slideUp('slow', function () {
								$.modal.close();
							});
						});
					});
				},
				overlayClose: true,
				position: ["40px", null],
				containerCss: {
					fontFamily: "sans-serif",
					color:"#fff",
					backgroundColor: "rgba(0,0,0,.75)",
					listStyle: "none",
					border: "1px solid #ccc",
					padding: "10px",
				} 
			});
		
			$("#keyCommandMenuItem").bind("click", function() {
				$("#keyCommands").modal();
			});
		
			$("#tutorialMenuItem").bind("click", function() {
				Gibber.Environment.loadTutorial("intro");
			});
		
			$("#quickstartMenuItem").bind("click", function() {
				$("#quickstart").modal({
					minHeight: "325px",
					maxWidth: "500px",
				});
			});
			$("#aboutMenuItem").bind("click", function() {
				$("#about").modal({
					minHeight: "425px",
					maxWidth: "500px",
				});
			});

			var flash = function(cm, pos) {
				if(pos !== null) {
					v = cm.getLine(pos.line);
					
					cm.setLineClass(pos.line, null, "highlightLine")
					
					var cb = (function() { 
						cm.setLineClass(pos.line, null, null);
					});
					
					window.setTimeout(cb, 250);
					
				}else{
					var sel = cm.markText(cm.getCursor(true), cm.getCursor(false), "highlightLine");
					
					var cb = (function() { 
						sel.clear();
					});
					
					window.setTimeout(cb, 250);
				}
			};
			CodeMirror.keyMap.gibber = {
				fallthrough : "default",
				"Ctrl-Enter" : function(cm) { 
					var v = cm.getSelection();
					var pos = null;
					if(v === "") {
						pos = cm.getCursor();
						v = cm.getLine(pos.line);
					}
					flash(cm, pos);			
					Gibber.runScript(v);		
				},
				"Cmd-S":function(cm) {
					//console.log("BLANLSH");
				},
				"Shift-Ctrl-Enter" : function(cm) { 
					var v = cm.getSelection();
					var pos = null;
					if(v === "") {
						pos = cm.getCursor();
						v = cm.getLine(pos.line);
					}
					flash(cm, pos);			
					Gibber.callback.addCallback(v, _1);		
				},
				"Shift-Alt-Enter" : function(cm) { // thanks to graham wakefield
					// search up & down for nearest empty line:
					var pos = editor.getCursor();
					var startline = pos.line;
					var endline = pos.line;
					while (startline > 0 && editor.getLine(startline) !== "") {
						startline--;
					}
					while (endline < editor.lineCount() && editor.getLine(endline) !== "") {
						endline++;
					}
					var pos1 = { line: startline, ch: 0 }
					var pos2 = { line: endline, ch: 0 }
					var str = editor.getRange(pos1, pos2);
	
					Gibber.runScript(str);
	
					// highlight:
					var sel = editor.markText(pos1, pos2, "highlightLine");
					window.setTimeout(function() { sel.clear(); }, 250);
				},
				"Ctrl-`" : function(cm) {
					Gibber.clear();
					Gibber.audioInit = false;
				},
				"Ctrl-I" : function(cm) {
					$('#info').toggle();
					if($("#info").css("display") == "none") {
						$('#code').css("width", "100%");
						$('#console').css("width", "100%");					
					}else{
						$('#code').css("width", "80%");
					}
					cm.refresh();
				},
				"Ctrl-Alt-2" : function(cm) {
					var v = cm.getSelection();
					var pos = null;
					if(v === "") {
						pos = cm.getCursor();
						v = cm.getLine(pos.line);
					}
				
					Gibber.Environment.slaveSocket.send(v);
				},
			};
		
			window.editor.setOption("keyMap", "gibber");
		},
	
		editorResize : function() {
			var one = $('#console').outerHeight();
			var remaining_height = parseInt($(window).height() - one - $("#mega-menu-1").outerHeight() - 1); 

			var scroll = window.editor.getScrollerElement();
			$(scroll).height(remaining_height);

			window.editor.refresh();
		},	
	};
	return Environment;
});