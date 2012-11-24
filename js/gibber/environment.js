define(['gibber/gibber', 'gibber/default_scripts', 'codemirror/codemirror', 'gibber/graphics', 'gibber/tutorials', "js/codemirror/util/loadmode.js", "js/codemirror/util/overlay.js", 'jquery.simplemodal', 'node/socket.io.min', 'megamenu/jquery.hoverIntent.minified', 'megamenu/jquery.dcmegamenu.1.3.3.min', ], function(_Gibber, defaults, CodeMirror, _graphics) {

    Storage.prototype.setObject = function(key, value) {
        this.setItem(key, JSON.stringify(value));
    }

    Storage.prototype.getObject = function(key) {
        var value = this.getItem(key);
        return value && JSON.parse(value);
    }

    _Gibber.log = function(val) {
        $(".consoletext")
            .text(val);
        window.console.log(val);
    }
    var Environment = {
        autocompleteLayer: null,
        removeFile: function(fileName) {
            var tmp = localStorage.getObject('scripts');
            if (typeof tmp[fileName] === 'undefined') {
                G.log("File " + fileName + " does not exist so I won't bother removing it. Huh?");
                return;
            }
            delete tmp[fileName];
            localStorage.setObject('scripts', tmp);
            this.createFileList();
        },
        save: function(code) {
            var scripts;
            if (typeof localStorage.scripts === "undefined") {
                scripts = {};
            } else {
                scripts = localStorage.getObject("scripts");
            }
            var name = window.prompt("Enter name for file");
            scripts[name] = code;
            localStorage.setObject("scripts", scripts);
            Gibber.Environment.createFileList(name);
        },
        startOSC: function() {
            Gibber.Environment.OSC = io.connect('http://127.0.0.1:8080/');
            //Gibber.Environment.OSC.on( 'OSC', function(msg) { console.log(msg); } );
            return Gibber.Environment.OSC;
        },
        slave: function(name, ip) {
            $("#info")
                .html("");

            console.log("Name " + name + " : ip " + ip);
            Gibber.Environment.slaveSocket = io.connect('http://' + ip + ':8080/'); // has to match port node.js is running on
            Gibber.Environment.slaveSocket.on('connect', function() {
                G.log("CONNECTED TO MASTER AS " + name);
                Gibber.Environment.slaveSocket.emit('name', {
                    "name": name
                });
            });
            Gibber.Environment.slaveSocket.on('chat', function(msg) {
                var p = $("<p>");
                $(p)
                    .css("padding", "0px 10px");
                $(p)
                    .html("<h2 style='display:inline'>" + msg.user + " :</h2>" + " " + msg.text);
                $("#info")
                    .append(p);
                $("#info")
                    .scrollTop($("#info")
                    .height());
            });
        },
        republicish: function(userName) {
            G.log("STARTING REPUBLICISH");
            $("#sidebar")
                .html("");
            Gibber.Environment.toggleSidebar();
            window.editor.refresh();

            G.E = G.Environment;
            G.E.republicish = {
                name: userName,
                users: [],
                addUser: function(userName) {
                    if (this.users.indexOf(userName) === -1) {
                        this.users.push(userName);
                    }
                },
                removeUser: function(userName) {
                    var idx = this.users.indexOf(userName);
                    if (idx !== -1) {
                        this.users.splice(idx, 1);
                    }
                },
                codeCount: 0,
            };
            G.E.R = G.E.republicish;

            G.E.R.addUser(G.E.R.name);

            if (!G.E.socket) {
                G.E.socket = io.connect('http://localhost:8080/');
            }

            G.E.socket.on('connect', function() {
                G.E.socket.emit('joinRepublic', G.E.R.name);
            });

            G.E.socket.on('userList', function(msg) {
                for (var i = 0; i < msg.users.length; i++) {
                    G.E.R.addUser(msg.users[i]);
                }
                G.E.socket.emit('addUser', G.E.R.name);
            });

            G.E.socket.on('addUser', function(msg) {
                G.E.R.addUser(msg);
            });
            G.E.socket.on('removeUser', function(msg) {
                G.E.R.removeUser(msg);
            });

            G.E.socket.on('chat', function(msg) {
                //Gibber.Environment.sessionHistory.push( { user: msg.user, text:msg.text, time: new Date() - Gibber.Environment.sessionStart} );
                var p = $("<p>");
                $(p)
                    .css("padding", "0px 10px");
                $(p)
                    .html("<h2 style='display:inline'>" + msg.user + " :</h2>" + " " + msg.text);
                $("#sidebar")
                    .append(p);
                $("#sidebar")
                    .scrollTop($("#sidebar")[0].scrollHeight);
            });

            G.E.socket.on('claimCode', function(msg) {
                $("#block" + msg.codeblockNumber)
                    .off('mouseup');
                $("#block" + msg.codeblockNumber)
                    .text(msg.name);
                $("#block" + msg.codeblockNumber)
                    .css({
                    backgroundColor: "#a00"
                });
            });
            G.E.R.code = function(msg) {
                var d = $("<div>");

                $(d).css({
                    'padding': '0px 10px',
                    marginBottom: '10px',
                });
                $(d).html("<h2 style='display:inline'>" + msg.user + " :</h2>" + " " + msg.code);

                var b = $("<button>paste code in editor</button>");
                $(b).on('mouseup', function() {
                    var code = window.editor.getValue();
                    window.editor.setValue(code + "\n" + msg.code);
                });
                $(d).append(b);

                /*
				var b2 = $("<button>claim code</button>");
                b2.codeblockNumber = msg.codeblockNumber;
                (function() {
                    var num = msg.codeblockNumber;
                    $(b2)
                        .on('mouseup', function() {
                        //console.log("CLAIMING CODE????", b2.codeblockNumber, G.E.R.name);
                        G.E.socket.emit('claimCode', {
                            name: G.E.R.name,
                            codeNumber: num
                        });
                    });
                    $(b2)
                        .attr("id", "block" + num);
                })();

                $(d).append(b2);
				*/

                $("#sidebar").append(d);
                $("#sidebar").scrollTop($("#sidebar")[0].scrollHeight);
            };

            G.E.socket.on('code', function(msg) {
                G.E.R.code(msg);
            });

            CodeMirror.keyMap.gibber["Ctrl-M"] = function(cm) {
                var msg = prompt("enter msg to send");

                if (msg != null) {
                    G.E.socket.emit('chat', {
                        user: G.E.R.name,
                        "text": msg
                    });
                }
            };

            CodeMirror.keyMap.gibber["Ctrl-S"] = function(cm) {
                var selectedUsers = [];
                for (var i = 0; i < G.E.R.users.length; i++) {
                    selectedUsers.push(G.E.R.users[i]);
                }

                var v = cm.getSelection();
                var pos = null;
                if (v === "") {
                    pos = cm.getCursor();
                    v = cm.getLine(pos.line);
                }

                G.E.socket.emit('code', {
                    recipients: selectedUsers,
                    code: v
                });
            };

            CodeMirror.keyMap.gibber["Ctrl-Alt-S"] = function(cm) {
                var v = cm.getSelection();
                var pos = null;
                if (v === "") {
                    pos = cm.getCursor();
                    v = cm.getLine(pos.line);
                }
                var d = $("<div>");
                $(d)
                    .css({
                    minWidth: '15em',
                    padding: 0,
                });
                var ul = $("<ul>");
                $(ul)
                    .css({
                    'list-style': 'none',
                    'padding': 0,
                    'margin': 0,
                    'border': '1px solid #ccc',
                });
                var allListItems = [];
                for (var i = 0; i < G.E.R.users.length; i++) {
                    (function() {
                        var l = $("<li>");
                        l._selected = false;
                        $(l)
                            .text(G.E.R.users[i]);
                        if (i !== 0) {
                            $(l)
                                .css({
                                'border-top': "1px solid #ccc",
                            });
                        }
                        $(l)
                            .css({
                            textAlign: 'center',
                            padding: '0 5px',
                        });
                        $(l)
                            .on('mousedown', function() {
                            console.log("SELECT", l._selected);
                            l._selected = !l._selected;
                            if (l._selected) {
                                $(l)
                                    .css('background-color', '#333');
                            } else {
                                $(l)
                                    .css('background-color', '#000');
                            }
                        });
                        allListItems.push(l);
                        $(ul)
                            .append(l);
                    })();
                }
                $(d)
                    .append(ul);

                var b = $('<button>Send Code</button>');
                $(b)
                    .on('mouseup', function() {
                    var selectedUsers = [];

                    for (var i = 0; i < allListItems.length; i++) {
                        if (allListItems[i]._selected === true) {
                            selectedUsers.push($(allListItems[i])
                                .text());
                        }
                    }

                    G.log("SENDING CODE TO REPUBLIC" + v);
                    G.E.socket.emit('code', {
                        recipients: selectedUsers,
                        code: v
                    });
                    $.modal.close();
                });
                $(b)
                    .css({
                    float: 'right',
                    marginTop: '1em',
                });

                var b2 = $('<button>Send Code To All</button>');
                $(b2)
                    .on('mouseup', function() {
                    var selectedUsers = [];

                    for (var i = 0; i < allListItems.length; i++) {
                        selectedUsers.push($(allListItems[i])
                            .text());
                    }

                    G.E.socket.emit('code', {
                        recipients: selectedUsers,
                        code: v
                    });
                    $.modal.close();
                });
                $(b2)
                    .css({
                    float: 'right',
                    marginTop: '1em',
                });

                $(d)
                    .append(b);
                $(d)
                    .append(b2);
                $.modal(d, {});
            };
        },
        master: function() {
            G.log("CALLING MASTER");
            $("#sidebar")
                .html("");

            Gibber.Environment.masterSocket = io.connect('http://localhost:8080/');
            Gibber.Environment.masterSocket.on('connect', function() {
                G.callback.phase = 0;
                window.editor.setValue("");
                Gibber.Environment.insert("// MASTER SESSION START\n\n");
                Gibber.Environment.sessionStart = new Date();
                Gibber.Environment.sessionHistory = [];
                Gibber.Environment.masterSocket.on('code', function(msg) {
                    Gibber.Environment.insert(msg.code);
                    Gibber.Environment.sessionHistory.push({
                        code: msg.code,
                        time: new Date() - Gibber.Environment.sessionStart
                    });
                    window.editor.scrollTo(0, $(".CodeMirror-scroll > div")
                        .outerHeight());

                    Gibber.callback.addCallback(msg.code, _1);
                });
                Gibber.Environment.masterSocket.on('chat', function(msg) {
                    Gibber.Environment.sessionHistory.push({
                        user: msg.user,
                        text: msg.text,
                        time: new Date() - Gibber.Environment.sessionStart
                    });
                    var p = $("<p>");
                    $(p)
                        .css("padding", "0px 10px");
                    $(p)
                        .html("<h2 style='display:inline'>" + msg.user + " :</h2>" + " " + msg.text);
                    $("#info")
                        .append(p);
                    $("#info")
                        .scrollTop($("#info")
                        .height());
                });

                Gibber.Environment.masterSocket.emit('master', null);
            });
        },

        saveSession: function(name) {
            var sessions = localStorage.getObject("sessions");
            if (typeof sessions === "undefined" || sessions === null) {
                sessions = {};
            }

            sessions[name] = G.Environment.sessionHistory;
            localStorage.setObject("sessions", sessions);
        },

        saveWithName: function(name) {
            var scripts;
            if (typeof localStorage.scripts === "undefined") {
                scripts = {};
            } else {
                scripts = localStorage.getObject("scripts");
            }

            var text = window.editor.getValue();

            scripts[name] = text;
            localStorage.setObject("scripts", scripts);
            Gibber.Environment.createFileList();
            G.log(name + " has been saved.")
        },

        load: function(fileName) {
            console.log("LOADING ", fileName);
            var scripts = localStorage.getObject("scripts"),
                code = null;

            if (scripts != null) {
                if (typeof scripts[fileName] !== "undefined") {
                    code = scripts[fileName];
                }
            }
            if (typeof defaults[fileName] !== "undefined") {
                code = defaults[fileName];
            }
            if (code != null) {
                //console.log(code);
                window.editor.setValue(code);
            } else {
                G.log("The file " + fileName + " is not found");
            }
        },

        loadAndSet: function(fileName) {
            /*var code = this.load(fileName);
			if(code != null) {
				window.editor.setValue(code);
			}*/
        },

        addScriptsToList: function(scripts) {
            var sel = $("#fileList");
            for (var name in scripts) {
                var opt = $("<li>");
                if (scripts[name] !== "LABEL START") {
                    var cb = function(_name) {
                        var n = _name;
                        return function() {
                            Gibber.Environment.load(n);
                        }
                    }
                    var a = $("<a>");
                    $(a)
                        .text(name);
                    $(opt)
                        .bind("click", cb(name));
                    $(opt)
                        .append(a);
                } else {
                    $(opt)
                        .text(" " + name);
                    $(opt)
                        .css({
                        "padding-left": ".5em",
                        "font-weight": "bold",
                        "margin": "1em 0",
                        "background-color": "#fff",
                        "color": "#000",
                        "text-align": "left",
                    });
                }
                $(sel)
                    .append(opt);
            }
        },
        createFileList: function(savedFile) {
            var sel = $("#fileList");
            $(sel)
                .empty();
            this.addScriptsToList(defaults);

            var userScripts = localStorage.getObject("scripts")

            var sel = $("#fileList");
            var opt = $("<li>");
            $(opt)
                .text("USER SCRIPTS");
            $(opt)
                .css({
                "padding-left": ".5em",
                "font-weight": "bold",
                "margin": "1em 0",
                "background-color": "#fff",
                "color": "#000",
                "text-align": "left",
            });
            $(sel)
                .append(opt);

            this.addScriptsToList(userScripts);
        },

        insert: function(code) {
            var endLine = window.editor.lineCount() - 1;
            window.editor.setLine(endLine, window.editor.getLine(endLine) + " \n" + code);
        },

        loadTutorial: function(name) {
            console.log("LOADING TUTORIAL " + name + name.charAt(name.length - 1));
            if (name.charAt(name.length - 1) === "_") {
                Gibber.clear();
                name = name.substring(0, name.length - 1);
            }
            window.editor.setValue(Gibber.tutorials[name]);
        },
		fullScreen : function() {
			$("#console").toggle();
			$("#header").toggle();

			$("#container").css("height", "100%");
			$("#container").css("width", "100%");
						
			$("#three").css({
				top : 0,
				height: "100%",
				width: "100%",
			});
			
			$("#three").attr("width", screen.width);
			$("#three").attr("height", screen.height);

			//$("canvas").attr({width:screen.width, height:screen.height});			
			// if($("#three").top() === 50) {
			// 	$("#three").css("top", 0);
			// }else{
			// 	$("#three").css("top", 50);
			// }
			
			//if(Graphics.initialized) {
			console.log("CALLING GRAPHICS FULL SCREEN");
			Graphics.fullScreen();
				//}
		},
        init: function() {
            $(window)
                .resize(Gibber.Environment.editorResize);
            $("#mega-menu-1")
                .dcMegaMenu({
                speed: 'fast',
            });
            this.createFileList();
            CodeMirror.modeURL = "js/codemirror/mode/%N/%N.js";
            window.editor = CodeMirror.fromTextArea(document.getElementById("code"), {
                lineNumbers: false,
                autofocus: true,
                indentUnit: 2,
                matchBrackets: true,
                tabSize: 2,
                smartIndent: true,
                onCursorActivity: function() {
                    window.editor.setLineClass(hlLine, null, null);
                    hlLine = editor.setLineClass(editor.getCursor()
                        .line, null, "activeline");
                },
            });
            var hlLine = window.editor.setLineClass(0, "activeline");

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
            $('.CodeMirror').css("display", "inline-block");
            $('.CodeMirror').delegate(".cm-link", "click", function(e) {
                var url = $(event.target).text();
                Gibber.Environment.loadTutorial(url.split(":")[1]);
            });

            CodeMirror.autoLoadMode(window.editor, "links");
            window.editor.setOption("mode", "links");

            this.load("default");
            this.editorResize();

            $.extend($.modal.defaults, {
                onOpen: function(dialog) {
                    dialog.overlay.fadeIn('fast', function() {
                        //dialog.data.hide();
                        dialog.container.fadeIn('fast', function() {
                            dialog.data.slideDown('fast');
                        });
                    });
                },
                onClose: function(dialog) {
                    dialog.data.fadeOut('slow', function() {
                        dialog.container.hide('slow', function() {
                            dialog.overlay.slideUp('slow', function() {
                                $.modal.close();
                            });
                        });
                    });
                },
                overlayClose: true,
                position: ["40px", null],
                containerCss: {
                    fontFamily: "sans-serif",
                    color: "#fff",
                    backgroundColor: "rgba(0,0,0,.75)",
                    listStyle: "none",
                    border: "1px solid #ccc",
                    padding: "10px",
                }
            });

            $("#keyCommandMenuItem")
                .bind("click", function() {
                $("#keyCommands")
                    .modal();
            });

            $("#tutorialMenuItem")
                .bind("click", function() {
                Gibber.Environment.loadTutorial("intro");
            });

            $("#quickstartMenuItem")
                .bind("click", function() {
                $("#quickstart")
                    .modal({
                    minHeight: "325px",
                    maxWidth: "500px",
                });
            });
            $("#aboutMenuItem")
                .bind("click", function() {
                $("#about")
                    .modal({
                    minHeight: "425px",
                    maxWidth: "500px",
                });
            });

            var flash = function(cm, pos) {
                if (pos !== null) {
                    v = cm.getLine(pos.line);

                    cm.setLineClass(pos.line, null, "highlightLine")

                    var cb = (function() {
                        cm.setLineClass(pos.line, null, null);
                    });

                    window.setTimeout(cb, 250);

                } else {
                    var sel = cm.markText(cm.getCursor(true), cm.getCursor(false), "highlightLine");

                    var cb = (function() {
                        sel.clear();
                    });

                    window.setTimeout(cb, 250);
                }
            };
            CodeMirror.keyMap.gibber = {
                fallthrough: "default",

                /*"Shift-Ctrl-." : function(cm) { 
					_Gibber.nextSlide();
				},
				"Shift-Ctrl-," : function(cm) { 
					_Gibber.prevSlide();
				},*/

                "Ctrl-Enter": function(cm) {
                    var v = cm.getSelection();
                    var pos = null;
                    if (v === "") {
                        pos = cm.getCursor();
                        v = cm.getLine(pos.line);
                    }
                    flash(cm, pos);
                    Gibber.runScript(v);
                },
                "Cmd-S": function(cm) {
                    var name = window.prompt("enter name for file:")
                    Gibber.Environment.saveWithName(name);
                },
                "Cmd-L": function(cm) {
                    var name = window.prompt("enter name of file to load:")
                    Gibber.Environment.load(name);
                },
				
                "Shift-Ctrl-Enter": function(cm) {
                    var v = cm.getSelection();
                    var pos = null;
                    if (v === "") {
                        pos = cm.getCursor();
                        v = cm.getLine(pos.line);
                    }
                    flash(cm, pos);
                    Gibber.callback.addCallback(v, _1);
                },
                "Shift-Alt-Enter": function(cm) {
                    var result = Gibber.Environment.selectCurrentBlock();

                    Gibber.runScript(result.text);

                    // highlight:
                    var sel = editor.markText(result.start, result.end, "highlightLine");
                    window.setTimeout(function() {
                        sel.clear();
                    }, 250);
                },
                "Shift-Ctrl-Alt-Enter": function(cm) {
                    console.log("CALLED");
                    var result = Gibber.Environment.selectCurrentBlock();

                    Gibber.callback.addCallback(result.text, _1);

                    // highlight:
                    var sel = editor.markText(result.start, result.end, "highlightLine");
                    window.setTimeout(function() {
                        sel.clear();
                    }, 250);
                },

                "Ctrl-`": function(cm) {
                    Gibber.clear();
                    Gibber.audioInit = false;
                },
                "Ctrl-I": function(cm) {
                    Gibber.Environment.toggleSidebar();
                    cm.refresh();
                },
                "Ctrl-Alt-2": function(cm) {
                    console.log("CALLING CTRL-ALT-2");
                    var v = cm.getSelection();
                    var pos = null;
                    if (v === "") {
                        pos = cm.getCursor();
                        v = cm.getLine(pos.line);
                    }
                    console.log("CALLED SLAVE SEND");
                    Gibber.Environment.slaveSocket.send(v);
                },
                "Shift-Alt-2": function(cm) {
                    var result = Gibber.Environment.selectCurrentBlock();

                    Gibber.Environment.slaveSocket.send(result.text);

                    // highlight:
                    var sel = editor.markText(result.start, result.end, "highlightLine");
                    window.setTimeout(function() {
                        sel.clear();
                    }, 250);
                },
            };

            window.editor.setOption("keyMap", "gibber");
            $.getJSON("js/gibber/documentation.js", function(data, ts, xgr) {
                Gibber.docs = data;

                var tags = [];
                Gibber.toc = {};
                for (var key in Gibber.docs) {
                    var obj = Gibber.docs[key];
                    tags.push({
                        text: key,
                        obj: key,
                        type: "object",
                        class: obj.key,
                    });
                    if (typeof Gibber.toc[obj.type] === "undefined") {
                        Gibber.toc[obj.type] = [];
                    }
                    Gibber.toc[obj.type].push(key);

                    if (typeof obj.methods !== "undefined") {
                        for (var method in obj.methods) {
                            tags.push({
                                text: method + "( " + key + " )",
                                obj: key,
                                type: "method",
                                name: method,
                            });
                        }
                    }
                    if (typeof obj.properties !== "undefined") {
                        for (var prop in obj.properties) {
                            tags.push({
                                text: prop + "( " + key + " )",
                                obj: key,
                                type: "property",
                                name: prop,
                            });
                        }
                    }
                }

                Gibber.Environment.tags = tags;
                Gibber.Environment.displayTOC();
                //Gibber.Environment.displayDocs("Seq");
            });
            $("#resizeButton")
                .on("mousedown", function(e) {
                $("body")
                    .css("-webkit-user-select", "none");
                Gibber.prevMouse = e.screenX;
                $(window)
                    .mousemove(function(e) {
                    $(".CodeMirror")
                        .width(e.pageX);
                    $("#sidebar")
                        .width($("body")
                        .width() - $(".CodeMirror")
                        .outerWidth() - 8);
                    $("#sidebar")
                        .height($(".CodeMirror")
                        .outerHeight());

                    $("#resizeButton")
                        .css({
                        position: "absolute",
                        display: "block",
                        top: $(".header")
                            .height() - 2,
                        left: Math.floor(e.pageX + 3),
                    });
                });
                $(window)
                    .mouseup(function(e) {
                    $(window)
                        .unbind("mousemove");
                    $(window)
                        .unbind("mouseup");
                    $("body")
                        .css("-webkit-user-select", "text");
                    Gibber.codeWidth = $(".CodeMirror")
                        .width();
                });
            });

            $("#searchButton")
                .on("click", function(e) {
                Gibber.Environment.displayDocs($("#docsSearchInput").val());
            });
            $("#tocButton")
                .on("click", function(e) {
                Gibber.Environment.displayTOC();
            });
            $("#closeSidebarButton")
                .on("click", function(e) {
                Gibber.Environment.toggleSidebar();
            });

            $("#docsSearchInput")
                .change(function(e) {
                if ($(e.target)
                    .is(":focus") || $(e.target)
                    .parents()
                    .has(Gibber.Environment.autocompleteLayer)) {
                    Gibber.Environment.displayDocs($("#docsSearchInput")
                        .val());
                } else {
                    $(Gibber.Environment.autocompleteLayer)
                        .remove();
                }
            });
            $("#docsSearchInput")
                .focus(function(e) {
                Gibber.Environment.autocompleteLayer = $("<div><ul>");
                $(Gibber.Environment.autocompleteLayer)
                    .css({
                    position: "absolute",
                    top: 22,
                    left: 0,
                    width: "200px",
                    display: "block",
                    backgroundColor: "rgba(30,30,30,.95)",
                    listStyle: "none",
                    padding: "0 5px 0px 5px",
                    "overflow-y": "auto",
                });
                $("#sidebar")
                    .append(Gibber.Environment.autocompleteLayer);
            });
            $("#docsSearchInput")
                .keyup(function(e) {
                var arr = [];
                var val = e.target.value;
                if (val.length !== 0) {
                    for (var i = 0; i < Gibber.Environment.tags.length; i++) {
                        if (Gibber.Environment.tags[i].text.indexOf(val) > -1) {
                            arr.push(Gibber.Environment.tags[i]);
                        }
                    }
                }
                $(Gibber.Environment.autocompleteLayer)
                    .empty();
                $(Gibber.Environment.autocompleteLayer)
                    .append("<ul>");
                for (var i = 0; i < arr.length; i++) {
                    var li = $("<li>");
                    $(li)
                        .css({
                        cursor: "pointer",
                        width: "90%",
                    });
                    if (i === arr.length - 1) {
                        $(li)
                            .css({
                            marginBottom: '10px',
                        });
                    }
                    $(li)
                        .text(arr[i].text);
                    (function() {
                        var _item = arr[i];
                        $(li)
                            .on("click", function(e) {
                            console.log(_item);
                            Gibber.Environment.displayDocs(_item.obj);
                            $(Gibber.Environment.autocompleteLayer)
                                .remove();
                            if (_item.type !== "object") {
                                $("#sidebar")
                                    .scrollTop($("*:contains(" + _item.obj + "." + _item.name + "):last")
                                    .offset()
                                    .top - 40);
                            }
                        });
                    })();
                    $(Gibber.Environment.autocompleteLayer)
                        .append(li);
                }
            });

            var scripts = localStorage.getObject("scripts");

            if (!scripts) scripts = {};

            if (typeof scripts.loadFile !== "undefined") {
                eval(scripts.loadFile);
            }

            this.graphics = _graphics;
            window.Graphics = _graphics;
			window.graphics = function(fullScreen) {
				if(fullScreen)
					Gibber.Environment.fullScreen();
				Graphics.init();
			}
            // don't create graphics until waveform is called
            window.Waveform = function() {
                Gibber.Environment.graphics.init();
                return window.Waveform(arguments[0]);
            };
        },

        selectCurrentBlock: function() { // thanks to graham wakefield
            var pos = editor.getCursor();
            var startline = pos.line;
            var endline = pos.line;
            while (startline > 0 && editor.getLine(startline) !== "") {
                startline--;
            }
            while (endline < editor.lineCount() && editor.getLine(endline) !== "") {
                endline++;
            }
            var pos1 = {
                line: startline,
                ch: 0
            }
            var pos2 = {
                line: endline,
                ch: 0
            }
            var str = editor.getRange(pos1, pos2);

            return {
                start: pos1,
                end: pos2,
                text: str
            };
        },

        displayDocs: function(obj) {
            console.log("DISPLAYING", obj)
            if (typeof Gibber.docs[obj] === "undefined") return;
            $("#docs")
                .html(Gibber.docs[obj].text);
            $("#docs")
                .append("<h2>Methods</h2>");
            var count = 0;
            for (var key in Gibber.docs[obj].methods) {
                var html = $("<div style='padding-top:5px'>" + Gibber.docs[obj].methods[key] + "</div>");
                var bgColor = count++ % 2 === 0 ? "#000" : "#222";
                $(html)
                    .css({
                    "background-color": bgColor,
                    "border-color": "#ccc",
                    "border-width": "0px 0px 1px 0px",
                    "border-style": "solid",
                });
                $("#docs")
                    .append(html);
            }
            $("#docs")
                .append("<h2>Properties</h2>");
            for (var key in Gibber.docs[obj].properties) {
                var html = $("<div style='padding-top:5px'>" + Gibber.docs[obj].properties[key] + "</div>");
                var bgColor = count++ % 2 === 0 ? "#000" : "#222";
                $(html)
                    .css({
                    "background-color": bgColor,
                    "border-color": "#ccc",
                    "border-width": "0px 0px 1px 0px",
                    "border-style": "solid",
                });
                $("#docs")
                    .append(html);
            }
        },

        displayTOC: function() {
            $("#docs")
                .empty();
            for (var key in Gibber.toc) {
                var cat = Gibber.toc[key];
                if (cat.length > 0) {
                    var ul = $("<ul style='list-style:none; padding: 0px 5px;'>");
                    var h2 = $("<h2>" + key + "</h2>");
                    //var ul = $("<ul>");
                    for (var i = 0; i < cat.length; i++) {
                        var li = $("<li>");
                        var a = $("<a style='cursor:pointer'>");
                        (function() {
                            var text = cat[i];
                            a.text(text);
                            a.click(function() {
                                Gibber.Environment.displayDocs(text);
                            });
                        })();
                        $(li)
                            .append(a);
                        $(ul)
                            .append(li);
                    }
                    $("#docs")
                        .append(h2);
                    $("#docs")
                        .append(ul);
                }
            }

        },


        toggleSidebar: function() {
            console.log("TOGGLING");
            $('#sidebar').toggle();
            $('#resizeButton').toggle();
            //header
            //$('#sidebar').css("display", "inline");
            if ($("#sidebar").css("display") == "none") {
                $('.CodeMirror').css("width", "100%");
                //$('.CodeMirror-scroll').css("width", "100%");
                $('#console').css("width", "100%");
            } else {
                if (typeof Gibber.codeWidth !== "undefined") { //if docs/editor split has not been resized
                    $(".CodeMirror").width(Gibber.codeWidth);
                    $("#sidebar").width($("body").width() - $(".CodeMirror").outerWidth() - 8);
                    $("#sidebar").height($(".CodeMirror").outerHeight());

                    $("#resizeButton")
                        .css({
                        position: "absolute",
                        display: "block",
                        top: $(".header").height(),
                        left: Gibber.codeWidth,
                    });
                } else {
                    $("#resizeButton")
                        .css({
                        position: "absolute",
                        display: "block",
                        top: $(".header")
                            .height(),
                        left: "70%",
                    });
                    $('#console')
                        .css("width", "70%");
                    //$('.CodeMirror-scroll').css("width", "80%");
                    $('.CodeMirror')
                        .css("width", "70%");
                    $('.CodeMirror')
                        .css("margin", "0");
                    $("#sidebar")
                        .width($("body")
                        .width() - $(".CodeMirror")
                        .outerWidth() - 8);
                    //$("#sidebar").width($("body").width() - $(".CodeMirror").outerWidth() - 8);
                    $("#sidebar")
                        .height($(".CodeMirror")
                        .outerHeight());
                }
            }
        },

        editorResize: function() {
            var one = $('#console')
                .outerHeight();
            var remaining_height = parseInt($(window)
                .height() - one - $("#mega-menu-1")
                .outerHeight() - 1);

            var scroll = window.editor.getScrollerElement();
            $(scroll)
                .height(remaining_height);

            window.editor.refresh();
        },
    };
    window.republicish = Environment.republicish;
    return Environment;
});
