( function() { 
  'use strict'
  
  var Column = function( options, Layout ) {
    options = options || {}
    
    var GE = Gibber.Environment,
        isCodeColumn = options.type === 'code',
        lastColumnWidth = 0, 
        colNumber = Layout.columnID++,
        mode  = 'javascript',
        modeIndex = 0,
        columnWidth = options.width ? options.width : Layout.defaultColumnSize,
        col = this,
        resizeHandleSize = Layout.resizeHandleSize
        
    $.extend( this, {
      element:        $( '<div class="column">' ),
      header:         $( '<div class="columnHeader">' ),
      modeSelect:     $( '<select>' ),
      bodyElement:    $( '<div class="editor">' ),
      resizeHandle:   $( '<div class="resizeHandle">' ),
      close :         $( '<button>' ),
      width:          columnWidth,
      number:         Layout.columns.length,
      fontSize:       1,
      modeIndex:      0,
      isCodeColumn:   isCodeColumn,
      toggle:         function() { $( this.element ).toggle() },            
      toggleResizeHandle: function() { $( this.element ).find( '.resizeHandle' ).toggle() },
      isFullScreen: false,
      fullScreen: ( function() {
        var _w = null, _h = null,
            fnc = function() {
              //console.log( this )
              if( !this.isFullScreen ) {
                if( !Layout.isFullScreen ) {
                  Layout.fullScreen()
                }
                _w = this.width - resizeHandleSize 
                _h = this.bodyElement.innerHeight
                var w = $( window ).width(), h = $( window ).height()
                this.toggle()
                this.header.hide()
                this.toggleResizeHandle()
                this.element.css({ width: w, height: h, top:0, left:0 })
                this.bodyElement.css({ width: w, height: h })
                this.editor.setSize( w,h )
                this.isFullScreen = true
              }else{
                if( Layout.isFullScreen ) {
                  Layout.fullScreen()
                }
                this.toggle()
                this.header.show()
                this.toggleResizeHandle()
                this.element.css({ width: _w, top:31 })
                this.bodyElement.css({ width: w, height:_h })
                this.editor.setSize( _w - resizeHandleSize, _h )
                Layout.resizeColumns()
                this.isFullScreen = false
              }
            }
        return fnc
      })()
    })
        
    Layout.columns.push( col )
  
    Object.defineProperty( col, 'value', {
      get: function()    { return col.editor.getValue() },
      set: function( v ) { col.editor.setValue( v ) }
    })
  
    col.element.width( columnWidth )
    col.resizeHandle.width( resizeHandleSize )
  
    col.close.addClass( 'closeButton' )
      .on( 'click', function(e) { Layout.removeColumn( colNumber );  if( col.onclose ) col.onclose(); })
      .css({ fontSize:'.8em', borderRight:'1px solid #666', padding:'.25em', fontWeight:'bold' })
      .html( '&#10005;' )
      .attr( 'title', 'close column' )
	
		col.setMode = function(mode) {
			col.mode = mode
      col.editor.setOption( 'mode', GE.modes.nameMappings[ col.mode ] )
      $( col.modeSelect ).val( col.mode )
			col.editor.setValue( GE.modes[ col.mode ].default )
		}
  
    if( isCodeColumn ) {
      for( var key in GE.modes ) {
        if( key !== 'nameMappings' ) {
          col.modeSelect.append( $( '<option>' ).text( key ) )
        }
      }
      col.modeSelect
        // .append(
        //   $( '<option>' ).text( 'javascript' ),
        //   $( '<option>' ).text( 'glsl-fragment' )
        // )
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
    var shouldDisplayLoadFile = typeof window.loadFile !== 'undefined' && window.loadFile !== null && typeof window.loadFile.error === 'undefined' && Layout.columns.length === 1, // make sure it's only on the first load
        _value = shouldDisplayLoadFile ? window.loadFile.text  :  GE.modes[ mode ].default;

    if( isCodeColumn ) {
      col.bodyElement.width( columnWidth - resizeHandleSize )
      col.element.append( col.bodyElement )
      col.editor = CodeMirror( col.bodyElement[0], {
        theme:  'gibber',
        keyMap: 'gibber',
        mode:   mode !== 'javascript' ? 'x-shader/x-fragment' : 'javascript',
        autoCloseBrackets: true,
        matchBrackets: true,
        value: _value,
        lineWrapping: false,
        tabSize: 2,
        lineNumbers:false,
        autofocus: options.autofocus || false,
      })
    
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
      col.editor.on('focus', function() { Layout.focusedColumn = colNumber } )
    
      col.save = function() {
        //    updateDocument : function( revisions, previous, notes, column ) {
        if( col.fileInfo && col.value !== col.fileInfo.text ) {
          GE.Account.updateDocument({ text: col.value }, col.fileInfo, '', col )
        }else{
          if( !col.fileInfo ) {
            GE.Message.post( 'You need to publish this file before you can save it. The publish button is at the top of the Gibber menubar.')
          }else if( col.value === col.fileInfo.text ) {
            GE.Message.post( 'The current text is the same as what is in the database; no update was performed.')
          }
        }
      }
    }else{
      col.bodyElement.width( columnWidth - resizeHandleSize )
      col.element.append( col.bodyElement )
    }
  
    col.showFileInfo = function() {
      var html, table
    
      if( col.infoDiv !== null ) return
    
      col.infoDiv = $('<div>')
      col.infoDiv.css({
        height:col.bodyElement.innerHeight(),
        width:col.bodyElement.innerWidth(),
        position:'absolute',
        top:col.header.height(),
        left:0,
        display:'block',
        background:'rgba(0,0,0,.8)',
        color:'#aaa',
        zIndex:10
      })
    
      col.infoDivClose = $( '<button>')
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
        .attr( 'title', 'close file info view' )
    
      html = [
        "<table>",
        "<tr><td><h2 style='display:inline; font-weight:normal; font-size:2em'> " + col.fileInfo.name + "</h2></td></tr>",
        "<tr><td><b>author</b>: " + col.fileInfo.author + "</td></tr>",
        "<tr><td><b>tags</b>: " + (col.fileInfo.tags || 'none') + "</td></tr>",
        "<tr><td><b>notes</b>: " + (col.fileInfo.notes || 'none') + "</td></tr>",
        "</table>"
      ].join('\n')
    
      table = $( html ).css({ margin:'1em' })
      //$( $( $( table ).find( 'tr' )[0] ).find('td')[0] ).append( col.infoDivClose )
      //console.log( "FILE INFO", col.fileInfo, col.fileInfo._revs_info.length )
      if( col.fileInfo._revs_info.length > 1 ) {
        var list = $( '<ul>' ), tr, td, li, a
      
        list.append( $('<li>').html('<b>revisions</b>') )
      
        for( var i = 0; i < col.fileInfo._revs_info.length; i++ ) {
          li = $( '<li>' ).text( col.fileInfo._revs_info[ i ].rev )
            .on('click', ( function() {
              var rev = col.fileInfo.author + '/publications/' +col.fileInfo.name + '?rev=' + col.fileInfo._revs_info[ i ].rev
              var fnc = function() {
                GE.Browser.openCode( rev )
              }
              return fnc
            })()
            )
            .css({ cursor:'pointer', color:'#aaa' })
            .hover( function() { $(this).css({ color:'#fff', textDecoration:'underline'} )}, function() { $(this).css({ color:'#aaa', textDecoration:'none'} )})
          
          list.append( li )
        }
      
        td = $('<td>').append( list )
        tr = $('<tr>').append( td )
      
        table.append( tr )
      }

      table.find( 'td' ).css({ paddingBottom:'1em' })
    
      col.infoDiv.append( table )
      col.infoDiv.append( col.infoDivClose )
      col.bodyElement.prepend( col.infoDiv )
    }

    col.modeIndex = typeof mode === 'undefined' || mode === 'javascript' ? 0 : 1;
    col.modeSelect.eq( col.modeIndex )
  
    if( isCodeColumn )
      $( col.modeSelect ).find( 'option' )[ col.modeIndex ].selected = true;
  
		col.mode = 'javascript'
    col.element.addClass( colNumber )
    col.element.attr( 'id', colNumber )
    col.id = colNumber
  
    Layout.handleResizeEventForColumn( col )
  
    Layout.resizeColumns()

    $( 'html,body' ).animate({ scrollLeft: $( '#' + col.id ).offset().left }, 'slow' );
  
    if( window.loadFile && window.loadFile.error && Layout.columns.length === 1 ) {
      console.log( window.loadFile )
      GE.Message.post('You attempted to load a document that does not exist. Please check the URL you entered and try again.')
    }
  }
  
  Gibber.Environment.Layout.Column = Column
})()