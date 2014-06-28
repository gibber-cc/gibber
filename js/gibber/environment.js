( function() {

"use strict"
// REMEMBER TO CHECK WELCOME.INIT() and server port in main.js!!!
//var SERVER_URL = 'http://gibber.mat.ucsb.edu'
var SERVER_URL = 'http://127.0.0.1:8080'
//var SERVER_URL = 'http://a.local:8080'

var GE = Gibber.Environment = {
  init : function() { 
    $script( ['external/codemirror/codemirror-compressed', 'external/interface', 'gibber/layout', 'gibber/notation'], 'codemirror',function() {
      $script( [/*'external/codemirror/addons/closebrackets', 
                'external/codemirror/addons/matchbrackets', 
                'external/codemirror/addons/comment',
                'external/codemirror/addons/show-hint',
                'external/codemirror/addons/javascript-hint',
                'external/codemirror/clike',*/
                'gibber/mappings',
                'gibber/gibber_interface',
                'gibber/console',
                'gibber/mouse',
                'gibber/column',
                'external/mousetrap',
                'gibber/chat',
                'gibber/share',
                'gibber/code_objects',
                ], function() {

        GE.Keymap.init()

        $( '#layoutTable' ).attr( 'height', $( window ).height() )
        $( '#contentCell' ).width( $( window ).width() )

        Gibber.proxy( window )

        if( !window.isInstrument ) {
          GE.Layout.init( GE )
          window.Layout = GE.Layout
          GE.Account.init()
          GE.Console.init()
          GE.Console.open()
          GE.Welcome.init()
          GE.Share.open()
          GE.Layout.createBoundariesForInitialLayout()
        }
        
        window.Notation = Gibber.Environment.Notation
        
        $script( 'gibber/keys', function() { Keys.bind( 'ctrl+.', Gibber.clear.bind( Gibber ) ) } )
      });
    })

    $script( ['external/color', 'external/injectCSS'], 'theme', function() {
      if( !window.isInstrument ) {
        GE.Theme.init()
        GE.Storage.init()
        GE.Menu.init()
      }
    })
    
    $script( ['gibber/graphics/graphics',  'external/spinner.min'], function() {
      Gibber.Graphics.load()
    })
  },
  selectCurrentBlock: function( editor ) { // thanks to graham wakefield
      var pos = editor.getCursor();
      var startline = pos.line;
      var endline = pos.line;
      
      while ( startline > 0 && editor.getLine( startline ) !== "" ) {
        startline--;
      }
      while( endline < editor.lineCount() && editor.getLine( endline ) !== "" ) {
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
      var str = editor.getRange( pos1, pos2 )

      return {
          start: pos1,
          end: pos2,
          text: str
      }
  },
  
  Storage : {
    values : null,
    init : function() {
      Storage.prototype.setObject = function( key, value ) { this.setItem( key, JSON.stringify( value ) ); }
      Storage.prototype.getObject = function( key ) { var value = this.getItem( key ); return value && JSON.parse( value ); }
      
      this.values = localStorage.getObject( "gibber2" )

      if ( ! this.values ) {
        this.values = {
          layouts : {}
        }
      }
    },
    
    save : function() {
      localStorage.setObject( "gibber2", this.values );
    },
  },
  
  Theme : {
    init : function() {      
      this.default = {
          comment:    Color('#888'),
          number:     Color('#69d'),
          string:     Color('#d44'),
          variable:   Color('#ccc'),
          bracket:    Color('#f8f8f2'),
          keyword:    Color('#ccc'),
          property:   Color('#ccc'),
          attribute:  Color('#ccc'),
          atom:       Color('#006600'),
          cursor:     { 'border-left':'1px solid #f00' },
          highlight : { background: '#c00' },
          'variable-2': Color('#ccc'),          
      }
      
      this.applyTheme( this.default )
      
      window.theme = this.changeThemeProperty
    },   
    
    nontext : [ 'cursor', 'selected', 'matchingbracket', 'lines', 'highlight' ],
    
    applyTheme : function( theme ) {
      var obj = {}
      for( var key in theme ) {
        var prop = theme[ key ],
            prefix = this.nontext.indexOf( key ) === -1 ? '.cm-s-gibber span.cm-' : '.CodeMirror-'
            
        if( prop.opaquer ) { // only way to test if typeof Color object...
          obj[ prefix + key ] = {
            color : prop.rgbaString()
          }
        } else if( typeof prop === 'object') {
          var obj2 = {}
          for( var key2 in prop ) {
            var prop2 = prop[ key2 ]
            obj2[ key2 ] = typeof prop2.rgbaString === 'function' ? prop2.rgbaString() : prop2; // Color object or other property / string value...
          }
          obj[ prefix + key ] = obj2
        }
      }
      
      $.injectCSS( obj )
    },
    
    changeThemeProperty : function( property, newValue ) {
      var obj = {}
      obj[ property ] = newValue
      
      GE.Theme.applyTheme( obj )
    },
  },
  Help : {
    open : function() {
      this.col = GE.Layout.addColumn({ header:'Help' })

      this.col.bodyElement.remove()
      
      this.getIndex()
    },
    getIndex : function() {
      $( '#docs' ).empty()
      $.ajax({
        url: SERVER_URL + "/help",
        dataType:'html'
      })
      .done( function( data ) {
        var help = $( data )
        $( GE.Help.col.element ).append( help )
        GE.Help.col.bodyElement = help
        GE.Layout.setColumnBodyHeight( GE.Help.col )
      }) 
    }, 


  },
  Credits : {
    open : function() {
      this.col = GE.Layout.addColumn({ header:'Credits' })

      this.col.bodyElement.remove()
      
      this.getIndex()
    },
    getIndex : function() {
      $( '#docs' ).empty()
      $.ajax({
        url: SERVER_URL + "/credits",
        dataType:'html'
      })
      .done( function( data ) {
        var credits = $( data )
        $( GE.Credits.col.element ).append( credits )
        GE.Credits.col.bodyElement = credits
        GE.Layout.setColumnBodyHeight( GE.Credits.col )
      }) 
    }, 
  },
  Docs : {
    files: {},
    open : function() {
      this.col = GE.Layout.addColumn({ header:'Reference' })

      this.col.bodyElement.remove()
      
      this.getIndex()
    },
    showTOC : function( section, btn ) {
      if( typeof btn.isShowing === 'undefined' ) {
        btn.isShowing = 0
      }
      
      btn.isShowing = !btn.isShowing
      
      var sec = $( '#'+section ).find( '.docsBody' ).toggle()
      
      $( btn ).text( btn.isShowing ? 'hide' : 'show' )
    },
    getIndex : function() {
      $( '#docs' ).empty()
      $.ajax({
        url: SERVER_URL + "/documentation",
        dataType:'html'
      })
      .done( function( data ) {
        var docs = $( data )
        $( GE.Docs.col.element ).append( docs )
        GE.Docs.col.bodyElement = docs
        GE.Layout.setColumnBodyHeight( GE.Docs.col )
      }) 
    },
    openFile : function( group, name ) {
      console.log( "OPENING", group, name )
      $.ajax({
        url:'docs/?group=' + group + '&file='+name,
        dataType:'html'
      })
      .done( function( data ) {
        var docs = $( data )
        $( '#docs' ).empty()
        $( '#docs' ).append( $('<button>').text('Back To Table of Contents')
                            .on('click', function() { $('#docs').remove(); GE.Docs.getIndex() } ) ) 
        $( '#docs' ).append( docs )
        GE.Docs.bodyElement = docs
        GE.Layout.setColumnBodyHeight( GE.Docs.col )
      }) 
    },
  }, 
  Keymap : {
    init : function() {
      // this has to be done here so that it works when no editors are focused
      $(window).on('keydown', function(e) {
          if( e.which === 70 && e.ctrlKey && e.altKey ) {
          if( e.shiftKey ) {
            if( GE.Layout.fullScreenColumn === null ) {
              GE.Layout.getFocusedColumn().fullScreen()
            }else{
              GE.Layout.fullScreenColumn.fullScreen()
            }
          }else{
            GE.Layout.fullScreen()
            e.preventDefault()
          }
        }
      })
      
      CodeMirror.keyMap.gibber = {
        fallthrough: "default",

        "Ctrl-Space" : function( cm ) { CodeMirror.showHint(cm, CodeMirror.javascriptHint ) },
        
        "Shift-Ctrl-Right" : function( cm ) {
          //console.log( GE.Layout.fullScreenColumn )
          var currentColumnNumber = GE.Layout.getFocusedColumn().id,
              nextCol = null
          
          for( var i = 0; i < GE.Layout.columns.length; i++ ) {
            var col = GE.Layout.columns[ i ]
            if( col === null || typeof col === 'undefined' ) continue;
            
            if( col.id > currentColumnNumber ) {
              nextCol = col
              break;
            }
          }
          
          if( nextCol !== null ) {
            if( GE.Layout.isFullScreen ) {
              var currentColumn = GE.Layout.getFocusedColumn() //columns[ currentColumnNumber ]
              currentColumn.editor.setValue( GE.Layout.__fullScreenColumn__.editor.getValue() )
              
              GE.Layout.__fullScreenColumn__.editor.setOption('mode', GE.modes.nameMappings[ nextCol.mode ] )
              GE.Layout.__fullScreenColumn__.editor.setValue( nextCol.editor.getValue() )
              GE.Layout.__fullScreenColumn__.mode = nextCol.mode
              GE.Layout.__fullScreenColumn__.__proto__ = nextCol              
              GE.Layout.fullScreenColumn = nextCol
              GE.Layout.focusedColumn = nextCol.id
              GE.Message.postFlash( 'Column ' + nextCol.id + ': ' + nextCol.mode, 1000, 
                { borderRadius:'.5em', fontSize:'2em', fontWidth:'bold', borderWidth:'5px' }
              )
            }else{
              nextCol.editor.focus()
            }
            
          }
        },
        
        "Shift-Ctrl-Left" : function( cm ) {
          //GE.Layout.getFocusedColumn()
          var currentColumnNumber = GE.Layout.focusedColumn,
              nextCol = null
          
          for( var i = currentColumnNumber; i >=0; i-- ) {
            var col = GE.Layout.columns[ i ]
            if( col === null || typeof col === 'undefined' ) continue;
            
            if( col.id < currentColumnNumber ) {
              nextCol = col
              break;
            }
          }
          
          if( nextCol !== null ) {
            if( GE.Layout.isFullScreen ) {
              var currentColumn = GE.Layout.getFocusedColumn() //columns[ currentColumnNumber ]
              currentColumn.editor.setValue( GE.Layout.__fullScreenColumn__.editor.getValue() )              
              
              GE.Layout.__fullScreenColumn__.editor.setOption('mode', GE.modes.nameMappings[ nextCol.mode ] )
              GE.Layout.__fullScreenColumn__.editor.setValue( nextCol.editor.getValue() )
              GE.Layout.__fullScreenColumn__.mode = nextCol.mode
              GE.Layout.__fullScreenColumn__.__proto__ = nextCol
              GE.Layout.fullScreenColumn = nextCol
              GE.Layout.focusedColumn = nextCol.id
              GE.Message.postFlash( 'Column ' + nextCol.id + ': ' + nextCol.mode, 1000, 
                { borderRadius:'.5em', fontSize:'2em', fontWidth:'bold', borderWidth:'5px' }
              )
            }else{
              nextCol.editor.focus()
            }
          }
        },        
        
        "Alt-/": CodeMirror.commands.toggleComment,

        "Ctrl-Enter": function(cm) {
					var obj = GE.getSelectionCodeColumn( cm, false )
					GE.modes[ obj.column.mode ].run( obj.column, obj.code, obj.selection, cm, false )
          return false
        },
        
        "Ctrl-S" : function(cm) {
          GE.Layout.columns[ GE.Layout.focusedColumn ].save()
        },
				
        "Shift-Ctrl-Enter": function(cm) {
					var obj = GE.getSelectionCodeColumn( cm, false )
					GE.modes[ obj.column.mode ].run( obj.column, obj.code, obj.selection, cm, true )			
        },
        
        "Alt-Enter": function(cm) {
				  var obj = GE.getSelectionCodeColumn( cm, true )
					GE.modes[ obj.column.mode ].run( obj.column, obj.code, obj.selection, cm, false )
        },
        
        "Shift-Alt-Enter": function(cm) {
					var obj = GE.getSelectionCodeColumn( cm, true )
					GE.modes[ obj.column.mode ].run( obj.column, obj.code, obj.selection, cm, true )
        },
				
				'Ctrl-2' : function( cm ) {
          if( cm.column.sharingWith ) {
						var obj = GE.getSelectionCodeColumn( cm, false )
						GE.modes[ obj.column.mode ].run( obj.column, obj.code, obj.selection, cm, false )

            if( cm.column.allowRemoteExecution ) {
              Chat.socket.send( 
                JSON.stringify({ 
                  cmd:'remoteExecution',
                  to:cm.column.sharingWith,
                  shareName: cm.column.shareName,
                  from:GE.Account.nick,
                  selectionRange: obj.selection,
                  code: obj.code,
                  shouldDelay: false,
                })
              ) 
            }else{
            	console.log( 'Remote code execution was not enabled for this shared editing session.')
            }
          }else{
          	console.log( 'This is column is not part of a shared editing session' )
          }
				},
        'Shift-Ctrl-2' : function( cm ) {
          if( cm.column.sharingWith ) {
						var obj = GE.getSelectionCodeColumn( cm, false )
						GE.modes[ obj.column.mode ].run( obj.column, obj.code, obj.selection, cm, true )

            if( cm.column.allowRemoteExecution ) {
              Chat.socket.send( 
                JSON.stringify({ 
                  cmd:'remoteExecution',
                  to:cm.column.sharingWith,
                  shareName: cm.column.shareName,
                  from:GE.Account.nick,
                  selectionRange: obj.selection,
                  code: obj.code,
                  shouldDelay: true,
                })
              ) 
            }else{
            	console.log( 'Remote code execution was not enabled for this shared editing session.')
            }
          }else{
          	console.log( 'This is column is not part of a shared editing session' )
          }
        },
        
        "Shift-Ctrl-=": function(cm) {
          var col = GE.Layout.getFocusedColumn( true )
          col.fontSize += .2
          
          col.bodyElement.css({ fontSize: col.fontSize + 'em'})
          col.editor.refresh()
        },
        
        "Shift-Ctrl--": function(cm) {
          var col = GE.Layout.getFocusedColumn( true )
          col.fontSize -= .2
          
          col.bodyElement.css({ fontSize: col.fontSize + 'em'})
          col.editor.refresh()
        },
        
        "Shift-Ctrl-Alt-=": function(cm) {
          if( GE.Layout._textBGOpacity < 1 ) {
            GE.Layout._textBGOpacity = GE.Layout._textBGOpacity + .2 > 1 ? 1 : GE.Layout._textBGOpacity + .2
            GE.Layout.textBGOpacity( GE.Layout._textBGOpacity )
          }
        },
        
        "Shift-Ctrl-Alt--": function(cm) {
          if( GE.Layout._textBGOpacity >0 ) {
            GE.Layout._textBGOpacity = GE.Layout._textBGOpacity - .2 < 0 ? 0 : GE.Layout._textBGOpacity - .2
            GE.Layout.textBGOpacity( GE.Layout._textBGOpacity )
          }          
        },
      }
    },
    flash: function(cm, pos) {
      var sel,
          cb = function() { sel.clear() }
    
      if (pos !== null) {
				if( pos.start ) { // if called from a findBlock keymap
		      sel = cm.markText( pos.start, pos.end, { className:"CodeMirror-highlight" } );
				}else{ // called with single line
	        sel = cm.markText( { line: pos.line, ch:0 }, { line: pos.line, ch:null }, { className: "CodeMirror-highlight" } )
				}
      }else{ // called with selected block
        sel = cm.markText( cm.getCursor(true), cm.getCursor(false), { className: "CodeMirror-highlight" } );
      }
    
      window.setTimeout(cb, 250);
    },
  },
	
	getSelectionCodeColumn : function( cm, findBlock ) {
		var pos = cm.getCursor(), 
				text = null,
			  column = GE.Layout.fullScreenColumn === null ? GE.Layout.columns[ GE.Layout.focusedColumn ] : GE.Layout.__fullScreenColumn__
		
    if( column.mode.indexOf('glsl') > -1 ) { // glsl always executes entire block
      var lastLine = cm.getLine( cm.lineCount() - 1 )
      pos ={ start:{ line:0, ch:0 }, end: { line:cm.lineCount() - 1, ch:lastLine.length - 1 } }
      text = column.value
    }else{
  		if( !findBlock ) {
  			text = cm.getDoc().getSelection()

  	    if ( text === "") {
  	      text = cm.getLine( pos.line )
  	    }else{
          pos = { start: cm.getCursor('start'), end: cm.getCursor('end') }
  	    	//pos = null
  	    }
  		}else{
        var startline = pos.line, 
  					endline = pos.line,
  					pos1, pos2, sel
      
        while ( startline > 0 && cm.getLine( startline ) !== "" ) { startline-- }
        while ( endline < cm.lineCount() && cm.getLine( endline ) !== "" ) { endline++ }
      
        pos1 = { line: startline, ch: 0 }
        pos2 = { line: endline, ch: 0 }
			
        text = cm.getRange( pos1, pos2 )

        pos = { start: pos1, end: pos2 }
  		}
    }
		
    GE.Keymap.flash(cm, pos)
		
		return { selection: pos, code: text, column:column }
	},
  
	//TODO : this should probably be moved to the Gibber object at some point as it's not environment specific
	modes : {
		nameMappings : {
			'javascript' : 'javascript',
			'glsl-fragment' : 'x-shader/x-fragment',
			'glsl-vertex'   : 'x-shader/x-vertex'      
		},
		javascript : {
			run : function( column, value, position, codemirror, shouldDelay ) {
				if( shouldDelay ) {
					Gibber.Clock.codeToExecute.push({ code:value, pos:position, cm:codemirror })
				}else{
					Gibber.run( value, position, codemirror ) 
				}
			},
			default: [
	      "/*To execute code, select it and hit Ctrl+Enter.",
        "* Ctrl+. stops audio. Press the help button for",
        "* more keystrokes to use in Gibber.",
        "*",
	      "* Giblet #1 - by thecharlie",
	      "* In this sketch, the mouse position drives the",
	      "* pitch of drums, the carrier to modulation",
	      "* ratio of FM synthesis, and the feedback and",
	      "* time of a delay.",
	      "*/",
	      "",
	      "a = Drums('x*o*x*o-')",
	      "a.pitch = Mouse.Y",
	      "",
	      "b = FM({ ",
	      "  attack:  ms(1),",
	      "  index:   a.Out,",
	      "  cmRatio: Mouse.X",
	      "})",
	      "",
	      "b.fx.add(",
	      "  Delay({",
	      "    time:     Mouse.X,",
	      "    feedback: Mouse.Y",
	      "  })",
	      ")",
	      "",
	      "b.play( ",
	      "  ['c2','c2','c2','c3','c4'].random(),",
	      "  [1/4,1/8,1/16].random(1/16,2) ",
	      ")"
	    ].join('\n'),
		},
		'glsl-fragment' : { 
			run: function( column, value, position, codemirror, shouldDelay ) {        
        value = Gibber.Graphics.PostProcessing.defs + value
        
	    	column.shader.material = new THREE.ShaderMaterial({
	    		uniforms: column.shader.uniforms,
	    		vertexShader: column.shader.vertexText || Gibber.Graphics.Shaders.defaultVertex,
	    		fragmentShader: value
	    	});
			},
			default: [
      "// to execute changes to shader, hit ctrl+enter",
      "// or ctrl+shift+enter to execute at next measure",
      "",
      "// defaults to .05 but should be mapped",
      "uniform float amp;",
      "// time is updated automatically at 1/60 per frame",
      "uniform float time;",
      "",
      "// texture passed to shader",
      "uniform sampler2D tDiffuse;",
      "// pixel coordinate from {0,1}",
      "varying vec2 p;",
      "",
      "void main() {",
      "  // normalize pixel coordinates to {-1,1}",
      "  vec2 uv = 2. * p - 1.;",
      "  float _out = 0.;",
      "",
      "  for( float i = 0.; i < 8.; i++ ){",
      "    uv.x += sin( uv.y + time ) * amp;",
      "    uv.x = abs( 1./uv.x ) * amp;    ",
      "    _out += abs( uv.x ) * amp;    ",
      "  }",
      "",
      "  gl_FragColor = vec4( 1.-_out );",
      "}",
			].join( '\n' ),
		},
    'glsl-vertex' : {
			run: function( column, value, position, codemirror, shouldDelay ) {
	      var shader = Gibber.Graphics.Shaders.make( column.shader.fragmentText, value )
        column.shader.vertexText = value
	    	column.shader.material = new THREE.ShaderMaterial({
	    		uniforms: column.shader.uniforms,
	    		vertexShader: value,
	    		fragmentShader: column.shader.fragmentText || Gibber.Graphics.Shaders.defaultFragment
	    	});
			},
      default : [
        "// note:varying vec3 position provides vertex position by default",
        "// as are projectionMatrix and modelViewMatrix",
        "varying vec2 p;",
        "uniform float amp;",
        "uniform float time;",
        "",
        "float rand(vec2 co){",
        "  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);",
        "}",
        "",
        "void main() {",
        "  p = uv; // pass to fragment shader",
        "  vec3 _position = position.xyz;",
        "  float amt = 10.;",
        "",
        "  // both position and amp are needed to (kindof) guarantee seeds",
        "  // that will yield random values.",
        "  _position.x += (-amt + rand(position.xy * amp) * amt * 2.) * amp;",
        "  _position.y += (-amt + rand(position.yz * amp) * amt * 2.) * amp;  ",
        "  _position.z += (-amt + rand(position.xz * amp) * amt * 2.) * amp;",
        "",
        "  gl_Position = ",
        "    projectionMatrix * ",
        "    modelViewMatrix * ",
        "    vec4( _position, 1.0 );",
        "}",
    	].join("\n"),
    }
	},
  Metronome : {
    shouldDraw: true,
    canvas: null,
    ctx: null,
    width: null,
    height: null,
    color: '#252525',
    
    draw: function( beat, beatsPerMeasure ) {
      if( this.shouldDraw && this.ctx !== null ) {
        var beatWidth = this.width / beatsPerMeasure,
            beatPos = ( beat - 1 ) * beatWidth;
      
        this.ctx.clearRect( 0, 0, this.width, this.height )
        this.ctx.fillRect(  beatPos, 0,  beatWidth, this.height )
      }
    },
    
    init: function() {
      this.canvas = $( "#header canvas" )
      this.ctx = this.canvas[0].getContext( '2d' )
    
      this.width = this.canvas.width()
      this.height = this.canvas.height()      
    
      this.canvas.attr( 'width', this.width )
      this.canvas.attr( 'height', this.height )
    
      this.ctx.fillStyle = this.color
    
      var color = this.color
      Object.defineProperty( this, 'color', {
        get: function() { return color; },
        set: function(v) { color = v; this.ctx.fillStyle = color; }
      })
      
      window.Metronome = this
    },
    
    off : function() {
      this.ctx.clearRect( 0, 0, this.width, this.height )
      this.shouldDraw = false;
    },
    
    on : function() { this.shouldDraw = true; },
  },
  
  Message: {
    post : function( msgText ) {
      var msgDiv = $( '<div>' )
      msgDiv.css({
          position:'fixed',
          display:'block',
          width:450,
          height:200,
          left: $( "thead" ).width() / 2 - 225,
          top: $( window ).height() / 2 - 100,
          backgroundColor: 'rgba(0,0,0,.85)',
          border:'1px solid #666',
          padding:'.5em',
          zIndex:1000
        })
        .addClass( 'message' )
        .append( $( '<button>' )
          .on('click', function(e) { $( msgDiv ).remove(); })
          .html('&#10005;')
        )
      
      msgDiv.append( $('<p>').text( msgText ).css({ marginTop:'.5em' }) )
      
      $( 'body' ).append( msgDiv )

      return msgDiv // return so it can be removed if needed
    },
    postFlash : function( text, time, css ) {
      var msgDiv = $( '<div>' )
      .css({
        position:'fixed',
        display:'block',
        width:450,
        height:'3em',
        left: $( "thead" ).width() / 2 - 225,
        top: $( window ).height() / 2 - 100,
        backgroundColor: 'rgba(0,0,0,.85)',
        border:'1px solid #666',
        padding:'.5em',
        zIndex:1000
      })
      .addClass( 'message' )
      
      if( css ) msgDiv.css( css )
        
      msgDiv.append( $('<p>').text( text ) )
    
      $( 'body' ).append( msgDiv )
      
      time = time || 2000
      
      msgDiv.fadeOut( time, function() { msgDiv.remove() } )
    },
    postHTML : function( html ) {
      var msgDiv = $( '<div>' )
      msgDiv.css({
          position:'fixed',
          display:'block',
          width:450,
          height:200,
          left: $( "thead" ).width() / 2 - 225,
          top: $( window ).height() / 2 - 100,
          backgroundColor: 'rgba(0,0,0,.85)',
          border:'1px solid #666',
          padding:'.5em',
          zIndex:1000
        })
        .addClass( 'message' )
        .append( $( '<button>' )
          .on('click', function(e) { $( msgDiv ).remove(); })
          .html('&#10005;')
        )
      
      msgDiv.append( html  )
      
      $( 'body' ).append( msgDiv )
      
      return msgDiv
    },
  },
  
  Menu : {
    init: function() {
      $( '#publishButton' ).on( 'click', function(e) {
        GE.Account.newPublicationForm()
      })
      $( '#browseButton' ).on( 'click', function(e) {
        GE.Browser.open()
      })
      $( '#addCodeButton' ).on( 'click', function(e) {
        GE.Layout.addColumn({ fullScreen:true, type:'code' })
      })
      $( '#consoleButton' ).on( 'click', function(e) {
        GE.Console.open()
      })
      $( '#chatButton' ).on( 'click', function(e) {
        GE.Chat.open()
      })
      $( '#helpButton' ).on( 'click', function(e) {
        GE.Help.open()
      })
      $( '#creditsButton' ).on( 'click', function(e) {
        console.log('credits!')
        GE.Credits.open()
      })
      $( '#forumButton' ).on( 'click', function(e) {
        GE.Forum.open()
      })
    }
  },
  
  Forum : {
    open : function() {
      this.col = GE.Layout.addColumn({ header:'Forums' })

      this.col.bodyElement.remove()
      
      //this.getForum()
      var iframe = $('<iframe src="'+SERVER_URL+':4567">')
      iframe.css({
        width:'98%',
        height:'100%',
        border:0
      })
      this.col.element.append( iframe ) 
            
      this.col.bodyElement = iframe
      GE.Layout.setColumnBodyHeight( this.col)

    },
    getForum : function() {
      $( '#docs' ).empty()
      $.ajax({
        url: SERVER_URL+':4567',
        dataType:'html'
      })
      .done( function( data ) {
        var help = $( data )
        $( GE.Help.col.element ).append( help )
        GE.Help.col.bodyElement = help
        GE.Layout.setColumnBodyHeight( GE.Help.col )
      }) 
    }, 
  },
  
  Spinner: {
    current : null,
    spin: function( target ) {
      $( target ).spin('small', '#fff')
      
      return function() { $( target ).spin( false ) }
    },
    remove: function() {
      this.current.stop()
    }
  },
  Welcome : {
    init : function() {
      //var col = GE.Layout.addColumn({ type:'form', fullScreen:false, header:'Welcome' })
      //col.bodyElement.remove()
      //console.log( "SERVER_URL", SERVER_URL )
      $.ajax({
        url: SERVER_URL + "/welcome",
        dataType:'html'
      })
      .done( function( data ) {
        var welcome = $( data )
        GE.Console.div.append( welcome )
        // $( col.element ).append( welcome )
        // col.bodyElement = welcome
        // GE.Layout.setColumnBodyHeight( col )
      })
    },
  }, 
  Browser : {
    setupSearchGUI : function() {
      var btns = $( '.searchOption' )

      for( var i = 0; i < btns.length; i++ ) {
        !function() {
          var num = i, btn = btns[ num ]
          
          btn.state = 0
          
          $( btn ).on( 'click', function() {
            for( var j = 0; j < btns.length; j++ ) {
              var bgColor
              
              btns[ j ].state = btns[ j ] === btn
              
              bgColor = btns[ j ].state ? '#666' : '#000'
              
              $( btns[ j ] ).css({ backgroundColor:bgColor })
            }
          })
          
        }()
      }
      
      btns[0].click()
      
      $( '.search input').on( 'keypress', function(e) { if( e.keyCode === 13 ) { $('.browserSearch').click() }})
      
      $( '.browserSearch' ).on( 'click', GE.Browser.search )
    },
    open: function() {
      var col = GE.Layout.addColumn({ header:'Browse Giblets' })
      
      //col.element.addClass( 'browser' )
      
      col.bodyElement.remove()
      
      $.ajax({
        url: SERVER_URL + "/browser",
        dataType:'html'
      })
      .done( function( data ) {
        var browser = $( data ), cells
        
        $( col.element ).append( browser[0] );
        $('head').append( browser[1] )
        $( '#search_button' ).on( 'click', GE.Browser.search )
        col.bodyElement = browser;
        GE.Layout.setColumnBodyHeight( col )
        
        cells = browser.find('td')
        
        var types = [ 'searchHEADER','search','tutorialsHEADER','audio', '_2d', '_3d', 'misc', 'userHEADER','recent', 'userfiles' ], prev
        for( var i = 0; i < cells.length; i++ ) {
          (function() {
            var cell = cells[ i ]
            if( $(cell).hasClass('browserHeader') ) return;
            
            $(cell).find('h3').on('click', function() { 
              var div = $(cell).find('div')
              div.toggle()
              if( div.is(':visible') ) {
                $(this).find('#browser_updown').html('&#9652;') 
              }else{
                $(this).find('#browser_updown').html('&#9662;') 
              }
            })
            
            var links = $(cell).find('li')
            for( var j = 0; j < links.length; j++ ) {
              (function() {
                var num = j, type = types[ i ], link = links[j]
                if( typeof Gibber.Environment.Browser.files[ type ] !== 'undefined' ) {
                  var pub = Gibber.Environment.Browser.files[ type ][ num ], obj, id
                  
                  if( typeof pub === 'undefined' ) {
                    console.log( 'UNDEFINED', type, num )
                    return;
                  }
                  
                  obj = pub.value || pub, // recently added has slightly different format
                  id = pub.id || obj._id  // see above
                      
                  $( link ).on( 'mouseover', function() {
                    $( link ).css({ background:'#444' })
                    if( prev ) {
                      $( prev ).css({ background:'transparent' })
                    }
                    prev = link
                    $( '#browser_title' ).text( id.split('/')[2].split('*')[0] )//$( link ).text() )
                    $( '#browser_notes' ).text( obj.notes )
                    $( '#browser_tags' ).text( obj.tags ? obj.tags.toString() : 'none' )
                    $( '#browser_author' ).text( id.split('/')[0] )
                  })
                }
              })()
            }
          })()
        }
        //$('#browser_audio_header').on('click', GE.Browser.updown)
        GE.Browser.setupSearchGUI()
      })
    },

    // publication name : author : rating : code fragment?
    search : function(e) {
      var btns = $( '.searchOption' ),
          btnText = [ 'tags','code','author' ],
          queryFilter = '', query = null
      
      query = $( '.browser .search input' ).val()
      
      if( query === '' ) {
        GE.Message.post( 'You must type in a search query.' )
        return
      }
      
      for( var i = 0; i < btns.length; i++ ) {
        if( btns[ i ].state ){
          queryFilter = btnText[ i ]
        }
      }
      
      var data = {
        'query': query,
        filter:  queryFilter 
      }
      
      console.log( data )
      
      $( '.searchResults' ).remove()
      
      // var sr = $('<div class="searchResults">').css({ width:'5em', height:'5em', display:'block', position:'relative', 'box-sizing': 'content-box !important' }) 
      // var spinner = GE.Spinner.spin( sr )
      
      $( '.browser .search td' ).append( $('<p class="searchResults">Getting search results...</p>'))
      
      
      //var data = { query:$( '#search_field' ).val() }
      $.post(
        SERVER_URL + '/search',
        data,
        function ( data ) {
          
          $('.searchResults').remove()
          
          var results = $( '<ul class="searchResults">' ), 
              count = 0
              
          //console.log( data )
          if( data.error ) {
            console.error( data.error )
            return  
          }
          for( var i = 0; i < data.rows.length; i++ ) {
            count++
            if( data.rows[i] === null ) continue; // sometimes things go missing...
            
            (function() {
              var d = JSON.parse( data.rows[ i ] ),
                  pubname = d._id,
                  li = $( '<li>' )
              
              $('.searchResults').remove()
                  
              li.html( pubname )
                .on( 'click', function() { 
                  GE.Browser.openCode( pubname ) 
                })
                .hover( function() { 
                  li.css({ backgroundColor:'#444'})
                  GE.Browser.displayFileMetadata( d )
                }, 
                  function() { li.css({ backgroundColor:'rgba(0,0,0,0)' })
                })
                .css({ cursor: 'pointer' })
                
              results.append( li )
            })()
          }
          
          var h4 = $('<h4 class="searchResults">Results</h4>').css({ display:'inline-block', width:'10em', marginBottom:0 }),
              clearBtn = $('<button class="searchResults">clear results</button>').on('click', function() { 
                $('.searchResults').remove()
                clearBtn.remove()
                h4.remove()
              })
              
          $( '.browser .search td' ).append( h4, clearBtn )
          
          if( data.rows.length === 0 ) {
            $( '.browser .search td' ).append( $('<p class="searchResults">No results were found for your search</p>') )
          }
          
          $( '.browser .search td' ).append( results )
        },
        'json'
      )
      
    },
    
    displayFileMetadata: function( obj ) {
      $( '#browser_title' ).text( obj._id.split('/')[2].split('*')[0] )//$( link ).text() )
      $( '#browser_notes' ).text( obj.notes )
      $( '#browser_tags' ).text( obj.tags ? obj.tags.toString() : 'none' )
      $( '#browser_author' ).text( obj._id.split('/')[0] )
    },
    
    openCode : function( addr ) {
      // console.log( "ADDR", addr )
      $.post(
        SERVER_URL + '/retrieve',
        { address:addr },
        function( d ) {
          //console.log( d )
          var data = JSON.parse( d ),
              col = GE.Layout.addColumn({ fullScreen:false, type:'code' })
              
          col.editor.setValue( data.text )
          col.fileInfo = data
          col.revision = d // retain compressed version to potentially use as attachement revision if publication is updated
          
          //if( d.author === 'gibber' && d.name.indexOf('*') > -1 ) d.name = d.name.split( '*' )[0] // for demo files with names like Rhythm*audio*
          return false
        }
      )
    },
  },
  
  Account : {
    nick: null,
    init : function() {
      $('.login a').on('click', function(e) { 
        GE.Account.createLoginWindow()
      })
      
      GE.Account.loginStatus()
    },
    
    loginStatus : function() {
      $.ajax({ 
        url: SERVER_URL + '/loginStatus',
        dataType:'json'
      }).done( function( response ) { 
        if( response.username !== null ) {
          $( '.login' ).empty()
          $( '.login' ).append( $('<span>welcome, ' + response.username + '.  </span>' ) )

          GE.Account.nick = response.username

          $( '.login' ).append( $('<a href="#">' )
            .text( ' logout ')
            .on( 'click', function(e) {
              $.ajax({
                type:"GET",
                url: SERVER_URL + '/logout', 
                dataType:'json'
              }).done( function( data ) {
                $( '.login' ).empty()
                $( '.login' ).append( $('<a href="#">' )
                  .text( 'please login' )
                  .on('click', function(e) { 
                    GE.Account.createLoginWindow()
                  })
                )
              })
            })
          )
        }
      }) 
    },
    
    createLoginWindow : function() {
      $.ajax({ 
        url:SERVER_URL + '/login',
        dataType:'html'
      }).done( function(response) { 
        $('body').append( response ); 
        $("#username").focus() 
      }) 
    },
    
    login: function() {
      $.ajax({
        type:"POST",
        url: SERVER_URL + '/login', 
        data:{ username: $("#username").val(), password: $("#password").val() }, 
        dataType:'json'
      })
      .done( function (data) {
        if( !data.error ) {
          // console.log( "LOGIN RESPONSE", data )
          $( '.login' ).empty()
          $( '.login' ).append( $('<span>welcome, ' + data.username + '.  </span>' ) )
          GE.Account.nick = data.username

          $( '.login' ).append( $('<a href="#">' )
            .text( ' logout ')
            .on( 'click', function(e) {
              $.ajax({
                type:"GET",
                url: SERVER_URL + '/logout', 
                dataType:'json'
              }).done( function(data) {
                GE.Account.nick = null

                $( '.login' ).empty()

                $( '.login' ).append( $('<a href="#">' )
                  .text( 'please login' )
                  .on('click', function(e) { 
                    GE.Account.createLoginWindow()
                  })
                )
              })
            })
          )
          $( '#loginForm' ).remove()
        }else{
          $( "#loginForm h5" ).text( "Your name or password was incorrect. Please try again." )
        }
      })
      .fail( function(error) {console.log( error )})

      return false
    },
    newAccountForm: function() {
      var col = GE.Layout.addColumn({ header:'Create an account' })
      col.bodyElement.remove()
      GE.Account.newAccountColumn = col

      $( '#loginForm' ).remove()
      $.ajax({
        url: SERVER_URL + '/snippets/create_account.ejs',
        dataType:'html'
      }).done( function( data ) {        
        col.element.append( data )
        col.bodyElement = data
        
        GE.Layout.setColumnBodyHeight( col )
        //$( col.element ).append( data ); 
      })

      return false
    },
    newPublicationForm: function() {
      if( GE.Account.nick !== null ) {
        var col = GE.Layout.addColumn({ type:'form', fullScreen:false, header:'Publish a Giblet' })
        
        GE.Account.publicationColumn = col

        col.element.addClass('publication_form')
        
        col.bodyElement.remove()
        
        $.ajax({
          url: SERVER_URL + "/create_publication",
          dataType:'html'
        })
        .done( function( data ) {
          $( col.element ).append( data ); 
          for( var i = 0; i < GE.Layout.columns.length; i++ ) {
            var _col = GE.Layout.columns[ i ]
            if( _col && _col.isCodeColumn ) {
              $('#new_publication_column').append( $( '<option>' + _col.id + '</option>' ) )
            }
          }
        })
      }else{
        GE.Message.post('You must log in before publishing. Click the link in the upper right corner of the window to login (and create an account if necessary).')
      }
    },
    processNewAccount: function() {
      var col = GE.Layout.columns[ GE.Layout.columns.length - 1],
          date = new Date(),
          data = { 
            _id: $( '#new_account_username' ).val(),
            type: 'user',
            password:  $( '#new_account_password' ).val(),
            joinDate:  [ date.getMonth() + 1, date.getDate(), date.getFullYear() ],
            website:  $('#new_account_website').val(),
            affiliation:  $('#new_account_affiliation').val(),
            email:  $('#new_account_email').val(),
            following: [],
            friends: [],
          }

      $.post(
        SERVER_URL + '/createNewUser',
        data,
        function (data, error) {
          if( data ) {
            GE.Message.post('New account created. Please login to verify your username and password.'); 
          } else { 
            GE.Message.post( 'The account could not be created. Try a different username' )
            console.log( "RESPONSE", response )
          }
          return false;
        },    
        'json'
      )

      // col.element.remove()
      GE.Layout.removeColumn( GE.Account.newAccountColumn.id )     
    },
    publish : function() {
      var url = SERVER_URL + '/publish'
      
      //GE.Spinner.spin( $('.publication_form')[0] 
      
      var columnNumber = $( '#new_publication_column' ).val()
      
      console.log( Gibber.Environment.Account.nick )
      $.ajax({
        type:"POST",
        url: SERVER_URL + '/publish',
        data: {
          name: $( '#new_publication_name' ).val(),
          code: GE.Layout.columns[ columnNumber ].editor.getValue(),
          permissions: $( '#new_publication_permissions' ).prop( 'checked' ),
          tags: $( '#new_publication_tags' ).val().split(','),
          notes: $( '#new_publication_notes' ).val(), 
          instrument: false, //$( '#new_publication_instrument' ).prop( 'checked' ),
          username: Gibber.Environment.Account.nick
         },
        dataType:'json'
      })
      .done( function ( data ) {
        if( data.error ) {
          GE.Message.post( 'There was an error writing to Gibber\'s database. Error: ' + data.error )
        }else{
          GE.Message.post( 'Your publication has been saved to: ' + SERVER_URL + '/?path=' + data.url )
        }
        GE.Layout.removeColumn( parseInt( $( '.publication_form' ).attr( 'id' ) ) )

        return false
      })
      .fail( function(e) { console.log( "FAILED TO PUBLISH", e ) } )
      
      return false 
    },
    updateDocument : function( revisions, previous, notes, column ) {
      var msg = {
        type: 'POST',
        url:  SERVER_URL + '/update',
        data: previous,
        dataType: 'json'
      }
      
      $.extend( msg.data, revisions )
      msg.data.revisionNotes = notes
      
      var promise = $.ajax( msg ).then( 
        function(d) { 
          column.fileInfo._rev = d._rev; 
          column.revision = JSON.stringify( column.fileInfo )
          GE.Message.postFlash( msg.data._id.split('/')[2] + ' has been updated.' ) 
        },
        function(d) { console.error( d.error ) }
      )
    },
  },
}

})()