var $ = require( './dollar' )

module.exports = function( Gibber ) { 
  'use strict'
  
  var GE, CodeMirror
  
  var Column = function( options ) {
    GE = Gibber.Environment
    CodeMirror = GE.CodeMirror
    
    options = options || {}

    var isCodeColumn = options.type === 'code',
        Layout = Gibber.Environment.Layout,
        lastColumnWidth = 0, 
        colNumber = Layout.columns.length,
        mode  = 'javascript',
        modeIndex = 0,
        columnWidth = options.width ? options.width : Layout.defaultColumnSize,
        col = {},
        resizeHandleSize = Layout.resizeHandleSize
        
    $.extend( col, {
      element:        $( '<div class="column">' ),
      header:         $( '<div class="columnHeader">' ),
      modeSelect:     $( '<select>' ),
      editorElement:  $( '<div class="editor">' ),
      bodyElement:    $( '<div class="columnBody">' ),
      resizeHandle:   $( '<div class="resizeHandle">' ),
      closeButton :   $( '<button>' ),
      width:          columnWidth,
      number:         Layout.columns.length,
      fontSize:       1,
      modeIndex:      0,
      isCodeColumn:   isCodeColumn,
      isFullScreen:   false,
      'resizeHandleSize'  : resizeHandleSize,
      close: function() {
        if( col.onclose ) col.onclose();
        Layout.removeColumn( colNumber );  
      }
      
      // fullScreen:     this.makeFullScreenFunction(),
    })
        
    Layout.columns.push( col )
  
    Object.defineProperty( col, 'value', {
      get: function()    { return col.editor.getValue() },
      set: function( v ) { col.editor.setValue( v ) }
    })
  
    col.element.width( columnWidth )
    col.resizeHandle.outerWidth( resizeHandleSize )
    
    col.closeButton.addClass( 'closeButton' )
      .on( 'click', function(e) { 
        if( col.onclose ) col.onclose();
        Layout.removeColumn( colNumber );  
        col.isClosed = true;  
      })
      .css({ fontSize:'.8em', borderRight:'1px solid #666', padding:'.25em', fontWeight:'bold' })
      .html( '&#10005;' )
      .attr( 'title', 'close column' )
  
    if( isCodeColumn ) {
      for( var key in GE.modes ) {
        if( key !== 'nameMappings' ) {
          col.modeSelect.append( $( '<option>' ).text( key ) )
        }
      }
      col.modeSelect
        .eq( 0 )
        .on( 'change', function( e ) {  
          var opt = $( this ).find( ':selected' ), idx = opt.index(), val = opt.text()
				
          col.modeIndex = idx
					col.mode = val
          col.editor.setOption( 'mode', GE.modes.nameMappings[ col.mode ] )

					col.editor.setValue( GE.modes[ col.mode ].default )
        })
        .attr( 'title', 'set language for column' )
      
      col.header
        .append( col.closeButton )
        .append( $( '<span>' ).html( '&nbsp;id #: ' + colNumber + '&nbsp;&nbsp;&nbsp;language:' ) )
        .append( col.modeSelect )
      
    }else{
      col.header
        .append( col.closeButton )
        .append( $( '<span>' ).html( '&nbsp;' + (options.header || '') ) )
    }
  
    col.element.append( col.header, col.resizeHandle )

    $( '#contentCell' ).append( col.element )
      
    if( typeof options.mode === 'string' ) {
      mode = options.mode
    }else if( options.mode ) {
      mode = modes[ options.mode ]
    }
    
    var shouldDisplayLoadFile = typeof window.loadFile !== 'undefined' && window.loadFile !== null && typeof window.loadFile.error === 'undefined' && Layout.columns.length === 1, // make sure it's only on the first load
        _value = shouldDisplayLoadFile ? window.loadFile.text  :  GE.modes[ mode ].default;
    
    col.bodyElement.width( columnWidth - resizeHandleSize )
    col.element.append( col.bodyElement )
    
    if( isCodeColumn ) {
      col.editorElement.width( columnWidth - resizeHandleSize )
      col.bodyElement.append( col.editorElement )
      col.editor = CodeMirror( col.editorElement[0], {
        theme:  'gibber',
        keyMap: 'gibber',
        mode:   mode !== 'javascript' ? 'x-shader/x-fragment' : 'javascript',
        autoCloseBrackets: true,
        matchBrackets: true,
        value: _value,
        lineWrapping: false,
        tabSize: 2,
        lineNumbers:false,
        cursorBlinkRate: 530,
        styleActiveLine:true,
        autofocus: options.autofocus || false,
      })
      
      col.editor.on( 'mousedown', function( cm, e ) {
        var elem = e.toElement ? e.toElement : e.target,
            classes = elem.className.split(' ')
        
        for( var i = 0; i < classes.length; i++ ) {
          if( cm.listeners[ classes[ i ] ] ) {
            cm.listeners[ classes[ i ] ]( e )
          }
        }
      })
      col.editor.on('drop', function (cm, e) { e.preventDefault(); })
      
      col.lineNumbersButton = $( '<button>' ).text('#')
        .on( 'click', function( e ) { 
          col.editor.setOption( 'lineNumbers', !col.editor.getOption('lineNumbers') )
        })
        .addClass( 'lineNumbersButton' )
        .attr( 'title', 'toggle line numbers' )

      col.fileInfoButton = $( '<button>' ).text('?')
        .on( 'click', function( e ) { 
          col.showFileInfo()
        })
        .addClass( 'lineNumbersButton' )
        .attr( 'title', 'show file info' )                
    
      col.infoDiv = null
      col.header.append( col.lineNumbersButton, col.fileInfoButton )
      col.editor.column = col    
      col.editor.on('focus', function() { 
        Layout.focusedColumn = colNumber 
      })
      
      col.editor.listeners = {}
      
      // remove event handlers on clearing Gibber
      $.subscribe('/gibber/clear', function() {
        col.editor.listeners = {}
      })
      
    }

    col.modeIndex = typeof mode === 'undefined' || mode === 'javascript' ? 0 : 1;
    col.modeSelect.eq( col.modeIndex )
    col.modeSelect.addClass( 'modeSelectDropDown' )
  
    if( isCodeColumn )
      $( col.modeSelect ).find( 'option' )[ col.modeIndex ].selected = true;
  
		col.mode = 'javascript'
    col.element.addClass( colNumber )
    col.element.attr( 'id', colNumber )
    col.id = colNumber
  
    Layout.handleResizeEventForColumn( col )
  
    Layout.resizeColumns()

    //console.log("ANIMATING", $( '#' + col.id ).offset().left, col.id )
    $( 'html,body' ).animate({ scrollLeft: $( '#' + col.id ).position().left }, 'slow' );
  
    if( window.loadFile && window.loadFile.error && Layout.columns.length === 1 ) {
      console.log( window.loadFile )
      GE.Message.post('You attempted to load a document that does not exist. Please check the URL you entered and try again.')
    }
    
    col.__proto__ = Proto
        
    return col
  }
  
  var Proto = {
    toggle:             function() { $( this.element ).toggle() },            
    toggleResizeHandle: function() { $( this.element ).find( '.resizeHandle' ).toggle() },
    
    fullScreen : function() {
      if( GE.Layout.fullScreenColumn === null ) {
        GE.Layout.toggle()
        
        GE.Layout.__fullScreenColumn__.toggle()
        GE.Layout.__fullScreenColumn__.editor.focus()        
        GE.Layout.__fullScreenColumn__.editor.setValue( this.editor.getValue() )
        
        GE.Layout.fullScreenColumn = this
        if( Gibber.Graphics ){
          Gibber.Graphics.assignWidthAndHeight() 
        }
        GE.Layout.isFullScreen = true
      }else{
        GE.Layout.toggle()
        GE.Layout.__fullScreenColumn__.toggle()
        this.editor.setValue( GE.Layout.__fullScreenColumn__.editor.getValue() )
        GE.Layout.__fullScreenColumn__.editor.setValue( '' )
        
        this.editor.focus()        

        GE.Layout.fullScreenColumn = null
        if( Gibber.Graphics ){
          Gibber.Graphics.assignWidthAndHeight() 
        }
        GE.Layout.isFullScreen = false        
      }
    },
    
    makeFullScreenFunction : function() {
      var _w = null, _h = null, fnc
      
      fnc = function() {
        //console.log( this )
        if( !this.isFullScreen ) {
          if( !Layout.isFullScreen ) {
            Layout.fullScreen()
          }
          _w = this.width - Layout.resizeHandleSize
          _h = this.bodyElement.innerHeight
          var w = $( window ).width(), h = $( window ).height()
          this.toggle()
          this.header.hide()
          this.toggleResizeHandle()
          this.element.css({ width: w, height: h, top:0, left:0 })
          this.bodyElement.css({ width: w, height: h })
          this.editorElement.css({ width: w, height: h })          
          this.editor.setSize( w,h )
          this.isFullScreen = true
          GE.Layout.fullScreenColumn = this
        }else{
          if( Layout.isFullScreen ) {
            Layout.fullScreen()
          }
          this.toggle()
          this.header.show()
          this.toggleResizeHandle()
          this.element.css({ width: _w, top:31 })
          this.bodyElement.css({ width: _w, height:_h })
          this.editorElement.css({ width: _w, height:_h })          
          this.editor.setSize( _w, _h )
          Layout.resizeColumns()
          this.isFullScreen = false
          GE.Layout.fullScreenColumn = null
        }
      }
      return fnc
    },
    
		setMode : function(mode) {
			this.mode = mode
      this.editor.setOption( 'mode', GE.modes.nameMappings[ this.mode ] )
      $( this.modeSelect ).val( this.mode )
			this.editor.setValue( GE.modes[ this.mode ].default )
		},
    
    save : function() {
      var col = this
      //    updateDocument : function( revisions, previous, notes, column ) {
      if( this.fileInfo && this.value !== this.fileInfo.text ) {
        GE.Account.updateDocument({ text: this.value }, this.fileInfo, '', this )
      }else{
        if( !this.fileInfo ) {
          var msg = [
            'You need to publish this file before you can save it.',
            'The publish button is at the top-left of the Gibber menubar.\n\n',
            'Once you have initially published the file, you can hit Ctrl+S to save future revisions.',          
          ].join(' ')
          
          GE.Message.post( msg )
        }else if( this.value === this.fileInfo.text ) {
          GE.Message.post( 'The current text is the same as what is in the database; no update was performed.')
        }
      }
    },
    
    load: function( addr ) {
      var col = this, fnc = null
      Gibber.log( 'now loading ' + addr )
      $.post(
        GE.SERVER_URL + '/retrieve',
        { address:addr },
        function( d ) {
          //console.log( d )
          var data = JSON.parse( d )

          col.editor.setValue( data.text )
          col.fileInfo = data
          col.revision = d // retain compressed version to potentially use as attachement revision if publication is updated
          
          //if( d.author === 'gibber' && d.name.indexOf('*') > -1 ) d.name = d.name.split( '*' )[0] // for demo files with names like Rhythm*audio*
          if( fnc ) { fnc() }
          
          Gibber.log( 'loading ' + addr + ' completed.' )
          
          return false
        }
      )
      
      return { done: function(_fnc) { fnc = _fnc } }
    },
    
    run: function() {
      GE.modes.javascript.run( this, this.editor.getValue(), { start:{ line:0, ch:0 }, end:{ line:this.editor.lastLine(), ch:0 }}, this.editor, true )
    },
    
    setWidth: function( w ) {
      var newWidthCandidate = w
      this.width = newWidthCandidate > 300 ? newWidthCandidate : 300
      this.element.width( this.width )

      GE.Layout.resizeColumns()
    },
    
    showFileInfo : function() {
      var html, table, col = this
  
      if( this.infoDiv !== null ) return
    
      $.extend( this, {
        infoDiv : $('<div>').css({
          height:this.bodyElement.innerHeight(),
          width:this.bodyElement.innerWidth(),
          position:'absolute',
          top:this.header.height(),
          left:0,
          display:'block',
          background:'rgba(0,0,0,.8)',
          color:'#aaa',
          zIndex:10
        }),
  
        infoDivClose : $( '<button>')
          .addClass( 'closeButton' )
          .on( 'click', function(e) { col.infoDiv.remove(); col.infoDiv = null; })
          .css({ 
            fontSize:'1em', 
            display:'inline', 
            border:'1px solid #666',
            padding:'.25em',
            background:'#191919',
            width:'80%',
            marginLeft:'10%',
            fontFamily:'Helvetica, sans-serif',
            '-moz-box-sizing': 'border-box !important',
            'box-sizing': 'border-box !important' 
          })
          .html( 'close file information view' )
          .attr( 'title', 'close file info view' ),
      })
    
      var html
      if( !this.fileInfo ) {
        html = "<h2>This file has not been published.</h2><p>If you publish the file, you will see authorship information here and a revision history.</p>"
        this.infoDiv.append( $( html ).css({ margin:'1em' }) )
        this.infoDiv.append( this.infoDivClose )
        this.bodyElement.prepend( this.infoDiv )
      
        return
      }
  
      html = [
        "<table>",
        "<tr><td><h2 style='display:inline; font-weight:normal; font-size:2em'> " + this.fileInfo.name + "</h2></td></tr>",
        "<tr><td><b>author</b>: " + this.fileInfo.author + "</td></tr>",
        "<tr><td><b>tags</b>: " + (this.fileInfo.tags || 'none') + "</td></tr>",
        "<tr><td><b>notes</b>: " + (this.fileInfo.notes || 'none') + "</td></tr>",
        "</table>"
      ].join('\n')
  
      table = $( html ).css({ margin:'1em' })
      //$( $( $( table ).find( 'tr' )[0] ).find('td')[0] ).append( col.infoDivClose )
      //console.log( "FILE INFO", col.fileInfo, col.fileInfo._revs_info.length )
      if( this.fileInfo._revs_info.length > 1 ) {
        var list = $( '<ul>' ), tr, td, a
    
        list.append( $('<li>').html('<b>revisions</b>') )
    
        for( var i = 0; i < this.fileInfo._revs_info.length; i++ ) {
          ( function() { 
            var _col = col, li = $( '<li>' ).text( _col.fileInfo._revs_info[ i ].rev )
              .on('click', ( function() {
                var rev = _col.fileInfo.author + '/publications/' + _col.fileInfo.name + '?rev=' + _col.fileInfo._revs_info[ i ].rev
                var fnc = function() {
                  GE.Browser.openCode( rev )
                }
                return fnc
              })()
              )
              .css({ cursor:'pointer', color:'#aaa' })
              .hover( function() { $( li ).css({ color:'#fff', textDecoration:'underline' } )}, function() { $( li ).css({ color:'#aaa', textDecoration:'none'} )})
              
            list.append( li )  
          })()
        }
    
        td = $('<td>').append( list )
        tr = $('<tr>').append( td )
    
        table.append( tr )
      }

      table.find( 'td' ).css({ paddingBottom:'1em' })
  
      this.infoDiv.append( table )
      this.infoDiv.append( this.infoDivClose )
      this.bodyElement.prepend( this.infoDiv )
    }
  }
  
  return Column
}