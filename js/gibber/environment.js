module.exports = function( Gibber ) {

// "use strict" TODO: no strict because of eval for user code. wrap
// im function object instead?

var MT = require( 'coreh-mousetrap' )(),
    $  = require( './dollar' ),
    codeObjects = require( './code_objects' )
    
var GE = {
  // REMEMBER TO CHECK WELCOME.INIT()
  SERVER_URL : 'http://' + window.location.host,
  CodeMirror:   require( 'codemirror' ),
  CodeMirrorJS: require( 'codemirror/mode/javascript/javascript' ),
  CodeMirrorC:  require( 'codemirror/mode/clike/clike' ),  
  Layout:       require( './layout' )( Gibber ),
  Account:      require( './account' )( Gibber ),
  Console:      require( './console' )( Gibber ),
  Mousetrap:    MT,
  Keys:         require( './keys' )( Gibber, MT ),
  Keymap:       require( './keymaps' )( Gibber ),
  Browser:      require( './browser' )( Gibber ),
  Preferences:  require( './preferences' )( Gibber ),  
  Theme:        require( './theme' )( Gibber ),
  Esprima:      require( 'esprima' ),
  Docs:         require( './docs' )( Gibber ),
  Chat:         require( './chat' )( Gibber ),
  Share:        require( './share' )( Gibber ),
  Notation:     require( './notation' ),
  
  init : function() { 
    GE.Keymap.init()
    
    $( '#layoutTable' ).attr( 'height', $( window ).height() )
    $( '#contentCell' ).width( $( window ).width() )
    
    Gibber.proxy( window )
    
    if( !Gibber.isInstrument ) {
      GE.Storage.init() // load user preferences from localStorage before doing anything
            
      GE.Account.init() // must be before layout init, which opens browser and loads userfiles
      
      GE.Layout.init( GE )
      window.Layout = GE.Layout
      window.Column = GE.Layout.Column
      
      window.load = Gibber.import
      window.Graphics = Gibber.Graphics
      window.Color = Gibber.Graphics.Color
      window.Chat = GE.Chat

      // the window.module global is deprecated and will be removed at some point!
      // I don't trust using it now that Gibber has moved to browserify
      module = window.module = Gibber.import
            
      GE.Console.init()
      Gibber.log = GE.Console.log
      
      GE.Welcome.init()
      GE.Theme.init()
      GE.Share.init()
      
      GE.Menu.init()
      GE.Layout.createBoundariesForInitialLayout()
      
      GE.Metronome.init()
      GE.Metronome.on()
      Gibber.Clock.addMetronome( GE.Metronome )
      
      GE.Notation = window.Notation = GE.Notation( Gibber, GE )
      
      codeObjects( Gibber, GE.Notation )
      
      //GE.Mouse = GE.Mouse( Gibber )
      //window.Mouse = Gibber.Mouse
      
      window.Keys = GE.Keys
      
      // keymaps handles this when it occurs within codemirror instances
      Gibber.Environment.Keys.bind( 'ctrl+.', function() { Gibber.clear() } )  
      
      // attach canvases to table row instead of body
      Gibber.Graphics.defaultContainer = '#mainContent'
      
      Gibber.Audio.SoundFont.path = './resources/soundfonts/'
      
      //window.spin.stop()
    }
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
          showWelcomeMessage: true,
          showSampleCodeInNewEditors: true,
          defaultLanguageForEditors: 'javascript',
          saveSoundFonts:true,
          soundfonts:{},
        }
        this.save()
      }
      
    },
    
    save : function() {
      localStorage.setObject( "gibber2", this.values );
    },
  },

  Help : {
    open : function() {
      this.col = GE.Layout.addColumn({ header:'Help' })
      this.getIndex()
    },
    getIndex : function() {
      $( '#docs' ).empty()
      $.ajax({
        url: GE.SERVER_URL + "/help",
        dataType:'html'
      })
      .done( function( data ) {
        var help = $( data )
        GE.Help.col.bodyElement.append( help )
        GE.Layout.setColumnBodyHeight( GE.Help.col )
      }) 
    }, 
  },
  Credits : {
    open : function() {
      this.col = GE.Layout.addColumn({ header:'Credits' })      
      this.getIndex()
    },
    getIndex : function() {
      $( '#docs' ).empty()
      $.ajax({
        url: GE.SERVER_URL + "/credits",
        dataType:'html'
      })
      .done( function( data ) {
        var credits = $( data )
        GE.Credits.col.bodyElement.append( credits )
        GE.Layout.setColumnBodyHeight( GE.Credits.col )
      }) 
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
      run: function( column, script, pos, cm, shouldDelay ) { // called by Gibber.Environment.Keymap.modes.javascript
//        eval( script )
        //GE.modes[ obj.column.mode ].run( obj.column, obj.code, obj.selection, cm, false )
        var _start = pos.start ? pos.start.line : pos.line,
            tree
        
        try{
          tree = GE.Esprima.parse( script, { loc:true, range:true } )
        }catch(e) {
          console.log ( e )
          console.error( "Parse error on line " + ( _start + e.lineNumber ) + " : " + e.message.split(':')[1] )
          return
        }
        // must wrap i with underscores to avoid confusion in the eval statement with commands that use proxy i
        //console.log("TREE LENGTH", tree.body.length, tree.body, pos  )
        for( var __i__ = 0; __i__ < tree.body.length; __i__++ ) {
          var obj = tree.body[ __i__ ],
          start = { line:_start + obj.loc.start.line - 1, ch: obj.loc.start.column },
          end   = { line:_start + obj.loc.end.line - 1, ch: obj.loc.end.column },
          src   = cm.getRange( start, end ),
                  result = null
              
          if( !shouldDelay ) {
            try{
              //console.log( "SRC" + __i__, src )
              result = eval( src )
              // if( typeof result !== 'function' ) {
              //   console.log( result )
              // }
            }catch( e ) {
              //console.error( "Error evaluating expression beginning on line " + (start.line + 1) + '\n' + e.message )
              console.log( e )
            }
          }else{
// Gibber.Environment.modes[ Clock.codeToExecute[ i ].cm.doc.mode.name ].run( Clock.codeToExecute[i].cm.column, Clock.codeToExecute[ i ].code, Clock.codeToExecute[ i ].pos, Clock.codeToExecute[ i ].cm, false )
            //console.log(" DELAY SRC", src )            
            Gibber.Clock.codeToExecute.push({ code:src, pos:{ 'start':start, 'end':end }, 'cm':cm })
          }
              
          if( Gibber.scriptCallbacks.length > 0 && !shouldDelay ) {
            for( var ___i___ = 0; ___i___ < Gibber.scriptCallbacks.length; ___i___++ ) {
              Gibber.scriptCallbacks[ ___i___ ]( obj, cm, pos, start, end, src, _start )
            }
          }
        }
      },

			_run : function( column, value, position, codemirror, shouldDelay ) {
        // if( shouldDelay ) {
        //   Gibber.Clock.codeToExecute.push({ code:value, pos:position, cm:codemirror })
        // }else{
					GE.modes.javascript.run( column, value, position, codemirror, shouldDelay ) 
          //}
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
    
    confirm : function( msgText, btn1Text, btn2Text ) {
      var msgDiv = $( '<div>' ),
          _done = null
          
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
        .append( $('<p>').text( msgText ).css({ marginTop:'.5em' }) )
        .append( $( '<button>' )
          .on('click', function(e) { $( msgDiv ).remove(); if( _done !== null ) { _done( true )} })
          .html( btn2Text || 'yes' )
          .css({ float:'right', marginLeft:'1em' })
        )
        .append( $( '<button>' )
          .on('click', function(e) { $( msgDiv ).remove(); if( _done !== null ) { _done( false )} })
          .html( btn1Text || 'no' )
          .css({ float:'right' })
          .focus()
        )

      $( 'body' ).append( msgDiv )

      return { done: function( handler ) {
        _done = handler
      }}
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
      // $( '#forumButton' ).on( 'click', function(e) {
      //   GE.Forum.open()
      // })
      
      $( '#preferencesButton' ).on( 'click', function(e) {
        GE.Preferences.open()
      })
      $( '#welcomeButton' ).on( 'click', function(e) {
        GE.Welcome.init( true )
      })
    }
  },
  
  Forum : {
    open : function() {
      window.open( 'http://lurk.org/groups/gibber' )
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
    div: null,
    close: function() {
      var checkbox = $( GE.Welcome.div ).find( 'input' ),
          checked = checkbox.is(':checked')

      GE.Storage.values.showWelcomeMessage = !checked
      GE.Storage.save()
      
      GE.Welcome.div.remove(); 
      GE.Welcome.div = null;
    },
    init : function( overridePreference ) {      
      if( GE.Welcome.div !== null || !GE.Storage.values.showWelcomeMessage && !overridePreference ) return;
      
      $.ajax({
        url: GE.SERVER_URL + "/welcome",
        dataType:'html'
      })
      .done( function( data ) {
        var welcome = $( data )
        
        var div = $('<div>').html( welcome )
        
        div.css({ position:'absolute', top:0, left:0, height:'100%', width:'100%', background:'rgba(0,0,0,.9)', zIndex:100  })
        
        GE.Browser.demoColumn.bodyElement.append( div )
        
        var welcomeDivClose = $( '<button>' )
          .on( 'click', GE.Welcome.close )
          .html( 'close welcome' )
          .attr( 'title', 'close welcome' )
        
        div.find( 'h2' ).append( welcomeDivClose )
        
        GE.Welcome.div = div
      })
    },
  },
  // Preferences : {
//     div: null,
//     close: function() {
//       var showWelcomeCheckbox = $( '#preferences_showWelcomeScreen' ),
//           checked = showWelcomeCheckbox.is(':checked')
// 
//       GE.Storage.values.showWelcomeMessage = checked
//       GE.Storage.save()
//     },
//     open : function() {
//       $.ajax({
//         url: GE.SERVER_URL + "/preferences",
//         dataType:'html'
//       })
//       .done( function( data ) {
//         var preferencesHTML = $( data )
//         
//         var div = $('<div>').html( preferencesHTML )
//         
//         this.column = Layout.addColumn({ type:'form', fullScreen:false, header:'User Preferences' })
//         
//         this.column.bodyElement.append( div )
//         
//         $( '#preferences_showWelcomeScreen' ).attr( 'checked', GE.Storage.values.showWelcomeMessage ),
//         $( '#preferences_showSampleCodeInNewEditors' ).attr( 'checked', GE.Storage.values.showSampleCodeInNewEditors ),        
//         
//         this.column.onclose = this.close.bind( this )
//         
//       }.bind( this ) )
//     },
//   },
}

require( 'codemirror/addon/comment/comment' )
require( 'codemirror/addon/edit/matchbrackets' )
require( 'codemirror/addon/edit/closebrackets' )
// require( 'codemirror/addon/selection/active-line' )

return GE
}