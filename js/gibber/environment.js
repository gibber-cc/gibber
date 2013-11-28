(function() {

"use strict"
var SERVER_URL = 'http://gibber.mat.ucsb.edu',//'http://127.0.0.1:3000',
//var SERVER_URL = 'http://127.0.0.1:8080', 
    modes = [ 'javascript', 'glsl' ]

var GE = Gibber.Environment = {
  modes: ['javascript', 'x-shader/x-fragment'],
  init : function() { 
    $script( ['external/codemirror/codemirror-compressed', 'external/interface' ], 'codemirror',function() {
      $script( ['external/codemirror/addons/closebrackets', 
                'external/codemirror/addons/matchbrackets', 
                'external/codemirror/addons/comment',
                'external/codemirror/addons/show-hint',
                'external/codemirror/addons/javascript-hint',
                'external/codemirror/clike',
                'gibber/gibber_interface',
                'gibber/console',
                'gibber/mouse',
                'external/mousetrap',
                'gibber/help',
                'gibber/chat',
                'gibber/share',
                ], function() {
                  
        GE.Keymap.init()
        
        $( '#layoutTable' ).attr( 'height', $( window ).height() )
        $( '#contentCell' ).width( $( window ).width() )
        GE.Layout.init()
        window.Layout = GE.Layout
        GE.Account.init()
        Gibber.proxy( window )
        GE.Console.init()
        GE.Welcome.init()
        GE.Share.open()
        $script( 'gibber/keys', function() { Keys.bind( 'ctrl+.', Gibber.clear.bind( Gibber ) ) } )
      });
    })

    $script( ['external/color', 'external/injectCSS'], 'theme', function() {
      GE.Theme.init()
      GE.Storage.init()
      GE.Menu.init()
    })
    
    $script( ['gibber/graphics/graphics',  'external/spinner.min'], function() {
      Gibber.Graphics.load()
    } )
    
    window.Columns = GE.Layout.columns
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
          number:     Color('#779'),
          string:     Color('#933'),
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
  
  Keymap : {
    init : function() {
      // this has to be done here so that it works when no editors are focused
      $(window).on('keydown', function(e) {
        if( e.which === 84 && e.altKey ) {
          GE.Layout.toggle()
          e.preventDefault()
        }
      })
      
      CodeMirror.keyMap.gibber = {
        fallthrough: "default",

        "Ctrl-Space" : function( cm ) { CodeMirror.showHint(cm, CodeMirror.javascriptHint ) },
        
        "Alt-/": CodeMirror.commands.toggleComment,
        
        "Ctrl-Enter": function(cm) {
          var v = cm.getDoc().getSelection(),
              pos = null

          if (v === "") {
              pos = cm.getCursor()
              v = cm.getLine( pos.line )
          }
          
          GE.Keymap.flash(cm, pos)
          
          var col = GE.Layout.columns[ GE.Layout.focusedColumn ]
          
          if( GE.modes[ col.modeIndex ] !== 'x-shader/x-fragment' ) {
            Gibber.run( v, pos, cm )  
          }else{
            var shader = Gibber.Graphics.makeFragmentShader( v )
          	col.shader.material = new THREE.ShaderMaterial({

          		uniforms: col.shader.uniforms,
          		vertexShader: shader.vertexShader,
          		fragmentShader: shader.fragmentShader

          	});
          }
          
        },
        
        "Alt-Enter": function(cm) {          
          var col = GE.Layout.columns[ GE.Layout.focusedColumn - 1],
              v = col.value
          
          if( GE.modes[ col.modeIndex % GE.modes.length ] !== 'x-shader/x-fragment' ) {
            Gibber.run( v, pos, cm )  
          }else{
            var shader = Gibber.Graphics.makeFragmentShader( v )
          	col.shader.material = new THREE.ShaderMaterial({

          		uniforms: col.shader.uniforms,
          		vertexShader: shader.vertexShader,
          		fragmentShader: shader.fragmentShader

          	});
          }
          
        },
                
        "Ctrl-L": function(cm) {
          var name = window.prompt("layout to load:")
        
          GE.Layout.load( name )
        },
        "Ctrl-F": function(cm) {
          var result = Gibber.Environment.selectCurrentBlock( cm );
        
          var sel = cm.markText( result.start, result.end, { className:"CodeMirror-highlight" } );
          
          window.setTimeout(function() {
              sel.clear();
          }, 250);

        },
        
        "Ctrl-M": function(cm) {
          var colIndex = GE.Layout.focusedColumn,
              col = GE.Layout.columns[ colIndex ]
               
          col.editor.setOption( 'mode', GE.modes[ ++col.modeIndex % GE.modes.length ] )
        },
        
        "Shift-Ctrl-Enter": function(cm) {
          var v = cm.getDoc().getSelection(),
              pos = null

          if (v === "") {
              pos = cm.getCursor()
              v = cm.getLine( pos.line )
          }
          
          GE.Keymap.flash(cm, pos)
          
          Gibber.Clock.codeToExecute.push( { code:v, pos:pos, cm:cm } )
        },
        
        "Shift-Alt-Enter": function(cm) {
            var result = Gibber.Environment.selectCurrentBlock( cm );
            
            Gibber.run( result.text, cm.getCursor(), cm );
            
            var sel = cm.markText( result.start, result.end, { className:"CodeMirror-highlight" } );
            window.setTimeout(function() {
                sel.clear();
            }, 250);
        },
        
        "Shift-Ctrl-Alt-Enter": function(cm) {
            var result = Gibber.Environment.selectCurrentBlock( cm );

            Gibber.Clock.codeToExecute.push( { code:result.text, pos:cm.getCursor(), cm:cm } );

            var sel = cm.markText( result.start, result.end, { className:"CodeMirror-highlight" } );
            window.setTimeout(function() {
                sel.clear();
            }, 250);
        },
        
        // "Ctrl-.": Gibber.clear.bind( Gibber ),

        "Shift-Ctrl-=": function(cm) {
          var col = GE.Layout.columns[ GE.Layout.focusedColumn ]
          col.fontSize += .2
          
          col.bodyElement.css({ fontSize: col.fontSize + 'em'})
          col.editor.refresh()
        },
        
        "Shift-Ctrl--": function(cm) {
          var col = GE.Layout.columns[ GE.Layout.focusedColumn ]
          col.fontSize -= .2
          
          col.bodyElement.css({ fontSize: col.fontSize + 'em'})
          col.editor.refresh()
        },
      }
    },
    flash: function(cm, pos) {
      var sel,
          cb = function() { sel.clear() }
    
      if (pos !== null) {
        sel = cm.markText( { line: pos.line, ch:0 }, { line: pos.line, ch:null }, { className: "CodeMirror-highlight" } )
      } else {
        sel = cm.markText( cm.getCursor(true), cm.getCursor(false), { className: "CodeMirror-highlight" } );
      }
    
      window.setTimeout(cb, 250);
    },
  },
  
  Metronome : {
    shouldDraw: true,
    canvas: null,
    ctx: null,
    width: null,
    height: null,
    color: '#444',
    
    draw: function( beat, beatsPerMeasure ) {
      if( this.shouldDraw ) {
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
      
    },
    
    off : function() {
      this.ctx.clearRect( 0, 0, this.width, this.height )
      this.shouldDraw = false;
    },
    
    on : function() { this.shouldDraw = true; },
  },
  
  Layout: {
    focusedColumn : null,
    dragging : null,
    columns : [],
    defaultColumnSize : 500,
    resizeHandleSize  : 8,
    columnID : 0,
    textBGOpacity : function( v ) {
      var color = 'rgba( 0, 0, 0, '+v+' )'
      $.injectCSS({ '.CodeMirror-lines pre': {background:color} })
    },
    
    init : function() {
      GE.Layout.addColumn({ fullScreen:false, type:'code', autofocus:true })
      var opacityDiv = $('#opacity')

      opacityDiv.css({
        background:'transparent',
        position:'relative',
        width:150,
        height:18,
        display:'inline-block',
        top:5,

      })
      opacityDiv.p = new Interface.Panel({ container:opacityDiv })
      
      $( opacityDiv.p.canvas ).css({ width:150, height: 18, zIndex:1  })
      opacityDiv.p.add(
        new Interface.Slider({
          isVertical:false,
          bounds:[0,0,.95,.95],
          value:0,
          max:.8,
          target:Gibber.Environment.Layout, key:'textBGOpacity',
          label:'text bg opacity',
          background:'#000',
          fill:'#333',
          stroke:'#999'
      }))

      window.Layout = this
    },
        
    emsToPixels : function( ems, element ) {
      var pixelsPerEm = Number(getComputedStyle( element, "").fontSize.match(/(\d*(\.\d*)?)px/)[1])
      
      return pixelsPerEm * ems
    },
    
    toggleHeader : function( onOrOff ) {
      if(typeof onOrOff !== 'undefined') {
        if( onOrOff ) {
          $( '#header' ).show()
        } else {
          $( '#header' ).hide()
        }
      }else{
        $( '#header' ).toggle()
      }
    },
    
    toggleFooter : function( onOrOff ) {
      if(typeof onOrOff !== 'undefined') {
        if( onOrOff ) {
          $( '#footer' ).show()
        } else {
          $( '#footer' ).hide()
        }
      }else{
        $( '#footer' ).toggle()
      }
    },
    
    toggleAllResizeHandles : function() { $( '.resizeHandle' ).toggle() },
    
    toggleAllColumns : function() {
      for( var i = 0; i < GE.Layout.columns.length; i++ ) {
        GE.Layout.columns[ i ].toggle()
      }
    },
    
    toggle : function() {
      this.toggleHeader()
      this.toggleFooter()
      this.toggleAllColumns()
    },
    
    addColumn : function( options ) {
      options = options || {}
      var isCodeColumn = options.type === 'code',
          lastColumnWidth = 0, 
          colNumber = this.columnID++,
          mode  = 'javascript',
          modeIndex = 0
      
      for( var i = 0; i < this.columns.length; i++) {
        var col = this.columns[ i ]
        if( col !== null ) lastColumnWidth = col.element.width()
      }    

      var columnWidth = options.width ? options.width : /*lastColumnWidth ||*/ this.defaultColumnSize,
          col = {
            element:        $( '<div class="column">' ),
            header:         $( '<div class="columnHeader">' ),
            modeSelect:     $( '<select>'),
            bodyElement:    $( '<div class="editor">' ),
            resizeHandle:   $( '<div class="resizeHandle">' ),
            close :         $( '<button>' ),
            width:          columnWidth,
            number:         this.columns.length,
            fontSize:       1,
            modeIndex:      0,
            isCodeColumn:   isCodeColumn,
            toggleResizeHandle : function() { $( this.element ).find( '.resizeHandle' ).toggle() },
            toggle : function() { $( this.element ).toggle() },
          },
          resizeHandleSize = this.resizeHandleSize
          
      this.columns.push( col )
      
      Object.defineProperty( col, 'value', {
        get: function()    { return col.editor.getValue() },
        set: function( v ) { col.editor.setValue( v ) }
      })
      
      col.element.width( columnWidth )
      col.resizeHandle.width( resizeHandleSize )
      
      col.close.addClass( 'closeButton' )
        .on( 'click', function(e) { GE.Layout.removeColumn( colNumber );  if( col.onclose ) col.onclose(); })
        .css({ fontSize:'.8em', borderRight:'1px solid #666', padding:'.25em', fontWeight:'bold' })
        .html('&#10005;')

      if( isCodeColumn ) {
        col.modeSelect
          .append(
            $( '<option>' ).text( 'javascript' ),
            $( '<option>' ).text( 'glsl' )
          )
          .eq( 0 )
          .on( 'change', function( e ) {
            var idx = $( this ).find( ':selected' ).index()
            col.editor.setOption( 'mode', GE.modes[ idx ] )
            col.modeIndex = idx
          })
          
        col.header
          .append( col.close )
          .append( $( '<span>' ).html( '&nbsp;id #: ' + colNumber + '&nbsp;&nbsp;language:' ) )
          .append( col.modeSelect )
          
      }else{
        col.header
          .append( col.close )
          .append( $( '<span>' ).html( '&nbsp;' + (options.header || '') ) )
      }
      
      col.element.append( col.header, col.resizeHandle )

      $( '#contentCell' ).append( col.element )
          
      if( typeof options.mode === 'string' ) {
        mode = options.mode
      }else if( options.mode ) {
        mode = modes[ options.mode ]
      }
      
      if( isCodeColumn ) {
        col.bodyElement.width( columnWidth - resizeHandleSize )
        col.element.append( col.bodyElement )
        col.editor = CodeMirror( col.bodyElement[0], {
          theme:  'gibber',
          keyMap: 'gibber',
          mode:   mode !== 'javascript' ? 'x-shader/x-fragment' : 'javascript',
          autoCloseBrackets: true,
          matchBrackets: true,
          value:[
            "/*",
            "Giblet #1 - by thecharlie",
            "In this sketch, the mouse position drives the",
            "pitch of drums, the carrier to modulation",
            "ratio of FM synthesis, and the feedback and",
            "time of a delay.",
            "*/",
            "",
            "a = Drums('x*o*x*o-')",
            "a.pitch = Mouse.Y",
            "",
            "b = FM({ attack:ms(1) })",
            "b.index = a.Amp",
            "b.cmRatio = Mouse.X",
            "",
            "b.play( ",
            "  ['c2','c2','c2','c3','c4'].random(),",
            "  [1/4,1/8,1/16].random(1/16,2) ",
            ")",
            "",
            "d = Delay({ time: Mouse.X, feedback: Mouse.Y })",
            "",
            "b.fx.add( d )",
          ].join('\n'),
          lineWrapping: false,
          tabSize: 2,
          autofocus: options.autofocus || false,
        })
    
        col.editor.on('focus', function() { GE.Layout.focusedColumn = colNumber } )
      }
   
      col.modeIndex = typeof mode === 'undefined' || mode === 'javascript' ? 0 : 1;
      col.modeSelect.eq( col.modeIndex )
      
      if( isCodeColumn )
        $( col.modeSelect ).find( 'option' )[ col.modeIndex ].selected = true;
      
      col.element.addClass( colNumber )
      col.element.attr( 'id', colNumber )
      col.id = colNumber
           
      this.handleResizeEventForColumn( col )
      
      this.resizeColumns()
      
      return col
    },
    
    load : function( name ) {       
      var layout = GE.Storage.values.layouts[ name ];
      
      this.removeAllColumns()
      
      for( var i = 0; i < layout.columns.length; i++) {
        // this.addColumn( false, layout.columns[i].width, GE.modes[ layout.columns[i].mode ] )
        this.addColumn({ width:layout.columns[ i ].width, fullScreen:false, mode:layout.columns[i].mode, type:'code' })
        this.columns[i].editor.setValue( layout.columns[i].value )
      }
    },
    
    save : function() {
      var name = window.prompt("Enter name for layout");
      
      var layout = {
        header: $( '#header' ).css( 'display' ) === 'none' ? false : true,
        footer: $( '#footer' ).css( 'display' ) === 'none' ? false : true,
        columns: []
      }
    
      for( var i = 0; i < this.columns.length; i++ ) {
        if( this.columns[i] === null ) return

        layout.columns.push({
          width: $( this.columns[i].element ).width(),
          value: this.columns[i].editor.getValue(),
          mode: $( this.columns[i].modeSelect ).find(':selected').index()//this.columns[i].editor.mode//this.columns[i].modeIndex % GE.modes.length,
        })
      }
      
      GE.Storage.values.layouts[ name ] = layout
      GE.Storage.save()
    },
    
    getColumnByID : function( id ) {
      for( var i = 0; i < this.columns.length; i++ ) {
        var col = this.columns[ i ]

        if( col === null ) continue;

        if( col.id === id ) {
          return col;
        }
      }
      return null;
    },
    
    removeAllColumns : function() {
      for( var i = this.columns.length - 1; i >= 0; i-- ) {
        var col = this.columns[ i ]

        if( col === null ) continue;

        col.element.remove()
      }
      this.columns.length = 0
    },
    
    removeColumn : function( columnNumber ) {
      var col = this.getColumnByID( columnNumber )
      
      if( col === null ) return
        
      if( col.element ) col.element.remove()
      
      this.columns[ this.columns.indexOf( col ) ] = null
      // this.columns.splice( this.columns.indexOf( col ), 1 )
      
      this.resizeColumns()
    },
    
    handleResizeEventForColumn : function(col) {
    	col.resizeHandle.mousedown( function(e) {
    		$( "body" ).css( "-webkit-user-select", "none" );

    		$( window ).mousemove( function( e ) {
          var newWidthCandidate = e.pageX - col.element.position().left
          col.width = newWidthCandidate > 300 ? newWidthCandidate : 300
          col.element.width( col.width )

          GE.Layout.resizeColumns()
    		});

    		$( window ).mouseup( function(e) {
    			$( window ).unbind( "mousemove" );
    			$( window ).unbind( "mouseup" );
    			$( "body ").css( "-webkit-user-select", "text" );
    		});
      })
    },
    setColumnBodyHeight : function( col ) {
      var headerHeight = $('thead').height(),
          columnHeight = $(window).height() - headerHeight - $('tfoot').height() - col.header.outerHeight()
      
      col.bodyElement.css({ height: columnHeight })
    },
    
    resizeColumns : function() {
      var totalWidth   = 0, // also used to determine x coordinate of each column
          headerHeight = $('thead').height(),
          columnHeight = $(window).height() - headerHeight - $('tfoot').height()

      for( var i = 0; i < this.columns.length; i++ ) {
        if( this.columns[ i ] === null ) continue 

        this.columns[ i ].element.css({ 
          top:headerHeight,
          left: totalWidth,
          height: $(window).height() - headerHeight - $('tfoot').height()
        })
                
        $( this.columns[ i ].bodyElement ).css({
          width : this.columns[i].width - this.resizeHandleSize, 
          height: columnHeight - this.columns[i].header.outerHeight()
        })
        // console.log( this.columns[i].bodyElement.width() ) 
        $( this.columns[ i ].header ).width( this.columns[i].width - this.resizeHandleSize )
        
        if( this.columns[ i ].editor )
          this.columns[ i ].editor.refresh()        
        
        totalWidth += this.columns[ i ].width
      }

      $( '#contentCell' ).width( totalWidth )
    },
    
    scrollToColumnNumber : function( columnNumber ) { },
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
        GE.Browser.newBrowser()
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
    }
  },
  
  Spinner: {
    current : null,
    spin: function( target ) {
      var spinner = new Spinner({ color:'#ccc', lines:18,length:0,width:8,radius:30,corners:1.0,rotate:0,trail:42,speed:1,direction:1 })
      spinner.spin( target )
      this.current = spinner
    },
    remove: function() {
      this.current.stop()
    }
  },
  Welcome : {
    init : function() {
      var col = GE.Layout.addColumn({ type:'form', fullScreen:false, header:'Welcome' })
      location.href = '#'
      location.href = '#' + col.id
      
      col.bodyElement.remove()

      $.ajax({
        url: SERVER_URL + "/welcome",
        dataType:'html'
      })
      .done( function( data ) {
        var welcome = $( data )
        $( col.element ).append( welcome )
        col.bodyElement = welcome
        GE.Layout.setColumnBodyHeight( col )
      })
    },
  }, 
  Browser : {
    newBrowser: function() {
      var col = GE.Layout.addColumn({ type:'form', fullScreen:false, header:'Browse Giblets' })
      
      //col.element.addClass( 'browser' )
      
      location.href = '#'
      location.href = '#' + col.id
      
      col.bodyElement.remove()
      
      $.ajax({
        url: SERVER_URL + "/browser",
        dataType:'html'
      })
      .done( function( data ) {
        $( col.element ).append( data );
        $( '#search_button' ).on( 'click', GE.Browser.search )
      })
    },
    
    // publication name : author : rating : code fragment?
    search : function(e) {
      var data = { query:$( '#search_field' ).val() }
      $.post(
        SERVER_URL + '/search',
        data,
        function ( data ) {
          console.log( "Search Data:", data )
          
          var results = $( '<ul>' ), count = 0
          
          for( var key in data ) {
            count++
            (function() {
              var d = data[ key ],
                  pubname = key,
                  li = $( '<li>' )
              
              li
              .html( pubname )
              .on( 'click', function() { GE.Browser.openCode( d ) } )
              .css( 'cursor', 'pointer' )
              results.append( li )
            })()
          }
          console.log( count )
          $( '.browser' ).append( results )
        },
        'json'
      )
    },
    
    openCode : function( addr ) {
      $.post(
        SERVER_URL + '/retrieve',
        { address:addr },
        function( d ) {
          d = JSON.parse(d)
          var col = GE.Layout.addColumn({ fullScreen:false, type:'code' })
          col.editor.setValue( d.text )
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
        url:'./loginStatus',
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
        url:'./login',
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
          console.log( "LOGIN RESPONSE", data )
          $( '.login' ).empty()
          $( '.login' ).append( $('<span>welcome, ' + data.username + '.  </span>' ) )
          GE.Account.nick = data.username

          $( '.login' ).append( $('<a href="#">' )
            .text( ' logout ')
            .on( 'click', function(e) {
              $.ajax({
                type:"GET",
                url:'http://127.0.0.1:3000/logout', 
                dataType:'json'
              }).done( function(data) {
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
      .fail( function(error) { console.log("FAILED FUCK"); console.log( error )})

    },
    newAccountForm: function() {
      var col = GE.Layout.addColumn({ type:'form', fullScreen:false, header:'Create an account' })
      location.href = '#'
      location.href = '#' + col.id
      //col.bodyElement.remove()
      $( '#loginForm' ).remove()
      $.ajax({
        url:'./snippets/create_account.ejs',
        dataType:'html'
      }).done( function( data ) { console.log( data ); $( col.element ).append( data ); } )
    },
    newPublicationForm: function() {
      var col = GE.Layout.addColumn({ type:'form', fullScreen:false, header:'Publish a Giblet' })
      
      col.element.addClass('publication_form')
      
      location.href = '#'
      location.href = '#' + col.id
      
      col.bodyElement.remove()
      
      $.ajax({
        url: SERVER_URL + "/create_publication",
        dataType:'html'
      })
      .done( function( data ) {
        $( col.element ).append( data ); 
        for( var i = 0; i < GE.Layout.columns.length; i++ ) {
          var _col = GE.Layout.columns[ i ]
          if( _col.isCodeColumn ) {
            $('#new_publication_column').append( $( '<option>' + _col.id + '</option>' ) )
          }
        }
      })
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
            console.log( "RESPONSE", response )
          }
        },    
        'json'
      )

      col.element.remove()
      location.href = '#'
      location.href = '#' + GE.Layout.columns[ GE.Layout.columns.length - 1].id      
    },
    publish : function() {
      var url = SERVER_URL + '/publish'
      
      //GE.Spinner.spin( $('.publication_form')[0] )
        
      $.ajax({
        type:"POST",
        url: SERVER_URL + '/publish',
        data: {
          name: $( '#new_publication_name' ).val(),
          code: GE.Layout.columns[0].editor.getValue(),
          tags: $( '#new_publication_tags' ).val().split(','),
          notes: $( '#new_publication_notes' ).val() 
         },
        dataType:'json'
      })
      .done( function ( data ) {
        GE.Message.post( 'Your publication has been saved to: ' + SERVER_URL + '/gibber/' + data.url )
        GE.Layout.removeColumn( parseInt( $( '.publication_form' ).attr( 'id' ) ) )
      })
      .fail( function(e) { console.log( "FAILED TO PUBLISH", e ) } )
    }
  },
}

})()
