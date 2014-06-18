( function() { 
  'use strict'
  
  var GE;
  
  var Layout = {
    focusedColumn : null,
    dragging : null,
    columns : [],
    defaultColumnSize : 500,
    resizeHandleSize  : 8,
    columnID : 0,
    isFullScreen: false,
    _textBGOpacity : 0,
    __fullScreenColumn__: null,
    fullScreenColumn: null,
    getFocusedColumn: function( allowFullScreen ) {
      if( allowFullScreen ) {
        if( Layout.fullScreenColumn === null ) {
          return Layout.columns[ Layout.focusedColumn ]
        }else{
          return Layout.__fullScreenColumn__
        }
      }else{
        return Layout.columns[ Layout.focusedColumn ]
      }
    },
    textBGOpacity : function( v ) {
      this._textBGOpacity = v
      var color = 'rgba( 0, 0, 0, '+v+' )'
      $.injectCSS({ '.CodeMirror-lines pre': {background:color} })
    },
    createBoundariesForInitialLayout : function() {
      var windowWidth = $( window ).width(),
          width0 = windowWidth * .75,
          width1 = windowWidth * .25
          
      Layout.columns[0].setWidth( width0 )
      Layout.columns[1].setWidth( width1 )
      
      Layout.resizeColumns()
    },
    init : function( _GE ) {
      GE = _GE
      $( '#contentCell' ).empty()
    
      this.addColumn({ fullScreen:false, type:'code', autofocus:true })
      // var opacityDiv = $('#opacity')
      //     
      // opacityDiv.css({
      //   background:'transparent',
      //   position:'relative',
      //   width:150,
      //   height:18,
      //   display:'inline-block',
      //   top:5,
      // })
      // opacityDiv.p = new Interface.Panel({ container:opacityDiv })
      //     
      // $( opacityDiv.p.canvas ).css({ width:150, height: 18, zIndex:1  })
      // opacityDiv.p.add(
      //   new Interface.Slider({
      //     isVertical:false,
      //     bounds:[0,0,.95,.95],
      //     value:0,
      //     max:.8,
      //     target:Gibber.Environment.Layout, key:'textBGOpacity',
      //     label:'text bg opacity',
      //     background:'#000',
      //     fill:'#333',
      //     stroke:'#999'
      // }))

      window.Columns = this.columns
    
      $( window ).resize( this.onResizeWindow )
      $.subscribe( '/layout/resizeWindow', function( e,dict ) { Layout.resize( dict.w, dict.h ) } )
      
      this.__fullScreenColumn__ = GE.Layout.addColumn({ type:'code' })
      var w = $( window ).width(), h = $( window ).height()
      this.__fullScreenColumn__.header.hide()
      this.__fullScreenColumn__.toggleResizeHandle()
      this.__fullScreenColumn__.element.css({ display:'none', width: w, height: h, top:0, left:0 })
      this.__fullScreenColumn__.bodyElement.css({ width: w, height: h })
      this.__fullScreenColumn__.editor.setSize( w,h )
      this.__fullScreenColumn__.isFullScreen = true
      this.__fullScreenColumn__.editor._handlers.focus.length = 0
      
      GE.Layout.columns.splice( GE.Layout.columns.indexOf( this.__fullScreenColumn__ ) )
    },
    
    onResizeWindow : (function() {
      var w = 0, h = 0, handler = function( e ) {
        var _w = $( window ).width(), _h = $( window ).height()
        if( w !== _w || h !== _h ) {
          $.publish('/layout/resizeWindow', { w:_w, h:_h } )
          w = _w
          h = _h
        }
      }
    
      return handler
    })(),
  
    resize : function( w,h ) {
      $( 'table' ).height( $( window ).height() )
      Layout.resizeColumns( w,h )
    },
  
    fullScreen : function() {
      Layout.isFullScreen = !Layout.isFullScreen
      for( var i = 0; i < Layout.columns.length; i++ ) {
        if( Layout.columns[i] ) Layout.columns[i].toggle()
      }
      //Layout.toggleHeader()
      //Layout.toggleFooter()
      $( 'thead' ).toggle()
      $( 'tfoot' ).toggle()
    
      if( Layout.isFullScreen ) {
        $( 'tbody' ).css({ height:'100%', width:'100%', margin:0 })
        $( '#contentCell' ).height( $( window ).height() )
        $.publish( '/layout/contentResize', { w: $( window ).width(), h:$( window ).height(), offset:0 } )
      }else{
        var height = $( window ).height()  - $( 'thead' ).height() - $('tfoot').height()
        $( 'tbody' ).css({ height:height, width:'100%', margin:0 })
        $( '#contentCell' ).height( height )
        $.publish( '/layout/contentResize', { w: $( window ).width(), h:height, offset: $('thead').height() } )
      }
    },
  
    emsToPixels : function( ems, element ) {
      var pixelsPerEm = Number(getComputedStyle( element, "").fontSize.match(/(\d*(\.\d*)?)px/)[1])
    
      return pixelsPerEm * ems
    },
  
    toggleHeader : function( onOrOff ) {
      if(typeof onOrOff !== 'undefined') {
        if( onOrOff ) {
          $( 'thead' ).show()
        } else {
          $( 'thead' ).hide()
        }
      }else{
        $.publish('/layout/toggleHeader', {} )
      
        $( 'thead' ).toggle()
      }
    },
  
    toggleFooter : function( onOrOff ) {
      if(typeof onOrOff !== 'undefined') {
        if( onOrOff ) {
          $( 'tfoot' ).show()
        } else {
          $( 'tfoot' ).hide()
        }
      }else{
        $.publish('/layout/toggleFooter', {} )
      
        $( 'tfoot' ).toggle()
      }
    },
  
    toggleAllResizeHandles : function() { $( '.resizeHandle' ).toggle() },
  
    toggleAllColumns : function() {
      for( var i = 0; i < GE.Layout.columns.length; i++ ) {
        if( GE.Layout.columns[i] !== null )
          GE.Layout.columns[ i ].toggle()
      }
    },
  
    toggle : function() {
      this.toggleHeader()
      this.toggleFooter()
      this.toggleAllColumns()
    },

    addColumn : function( options ) {
      return new this.Column( options, this )
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
  
    handleResizeEventForColumn : function(_col) {
      ( function() {
        var col = _col,
        columnResizeHandler = function(e) {
          var newWidthCandidate = e.pageX - col.element.position().left
          col.width = newWidthCandidate > 300 ? newWidthCandidate : 300
          col.element.width( col.width )
          
          if( col.onresize ) col.onresize( col.width )
          
          GE.Layout.resizeColumns()
        },
        columnResizeEndHandler = function(e) {
          $( window ).unbind( "mousemove", columnResizeHandler );
          $( window ).unbind( "mouseup", columnResizeEndHandler );
          $( "body ").css( "-webkit-user-select", "text" );
        };

        col.resizeHandle.on( 'mousedown', function(e) {
          $( "body" ).css( "-webkit-user-select", "none" );

          $( window ).on( 'mousemove', columnResizeHandler )

          $( window ).on( 'mouseup',  columnResizeEndHandler )
        })
      })()
    },
    setColumnBodyHeight : function( col ) {
      var headerHeight = $('thead').height(),
          columnHeight = $(window).height() - headerHeight - $('tfoot').height() - col.header.outerHeight()
    
      col.bodyElement.css({ height: columnHeight })
    },
  
    resizeColumns : function( windowWidth, windowHeight ) {
      if( isNaN(windowHeight) ) windowHeight = $( window ).height()
    
      var totalWidth   = 0, // also used to determine x coordinate of each column
          headerHeight = $('thead').height(),
          columnHeight = windowHeight - headerHeight - $('tfoot').height()

      for( var i = 0; i < this.columns.length; i++ ) {
        if( this.columns[ i ] === null ) continue 

        this.columns[ i ].element.css({ 
          top:headerHeight,
          left: totalWidth,
          height: $(window).height() - headerHeight - $('tfoot').height()
        })
      
        var colHeight = columnHeight - this.columns[i].header.outerHeight()
        $( this.columns[ i ].bodyElement ).css({
          width : this.columns[i].width - this.resizeHandleSize, 
          height: colHeight
        })
        // console.log( this.columns[i].bodyElement.width() ) 
        $( this.columns[ i ].header ).width( this.columns[i].width - this.resizeHandleSize )
      
        if( this.columns[ i ].editor ) {
          this.columns[ i ].editor.setSize( null, colHeight )
        }
      
        totalWidth += this.columns[ i ].width
      }

      $( '#contentCell' ).width( $( window ).width() )
    },
  
    scrollToColumnNumber : function( columnNumber ) { },
  }
  
  Gibber.Environment.Layout = window.Layout = Layout
})()