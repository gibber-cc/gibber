(function() {
  var GE = Gibber.Environment,
      console_footer = $( '#footer' ),
      tfoot  = $( 'tfoot' ),
      nl2br  = function (str, is_xhtml) {   
        var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';    
        return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
      }
  
  Gibber.Environment.Console = {
    parent : window.console,
    column : null,
    lastText : null,
    lastSpan : null,
    duplicateCount : 1,
    isOn: true,

    flash: function() {
      tfoot.css({
        background:'black',
      })
      
      setTimeout( function() { tfoot.css({ background: 'transparent' }) }, 25 )
    },
    init : function() {
      this.div = $('<div>')
      //window._console = this.parent      
      // console = this;
      this.on()
    },
    off : function() {
      this.isOn = false
      window.console = this.parent
    },
    on : function() {
      this.isOn = true
      window.console = this
    },
    log : function() {
      var args = Array.prototype.slice.call( arguments, 0 ),
          text = args.join( ' ' ),
          _text = null

      this.parent.log.apply( this.parent, arguments )
      
      console_footer.text( text )
      
      if( console_footer.hasClass( 'console-error' ) ) {
        console_footer.removeClass( 'console-error' )
      }
      
      // this.flash()
      //if( this.column !== null) {
        if( text === this.lastText ) {
          _text = '(' + ( ++this.duplicateCount ) + ')' + text
          this.lastSpan.html( nl2br(_text, false) )
        }else{
          this.lastSpan = $( '<span>' ).html( nl2br( text, false) ).addClass( 'console-entry' )
          this.div.append( this.lastSpan )
          this.duplicateCount = 1
          this.lastText = text
        }
      //}
    },
    warn : function() {
      var args = Array.prototype.slice.call( arguments, 0 ),
          text = args.join( ' ' ),
          _text = null

      this.parent.warn.apply( this.parent, arguments )
      
      console_footer.text( text )
      
      if( ! console_footer.hasClass( 'console-warn' ) ) {
        console_footer.addClass( 'console-warn' )
      }
      
      if( text === this.lastText ) {
        _text = '(' + ( ++this.duplicateCount ) + ')' + text
        this.lastSpan.html( nl2br( _text, false) )
      }else{
        this.lastSpan = $( '<span>' ).html( nl2br(text, false) ).addClass( 'console-entry' ).addClass( 'console-warn' )
        this.div.append( this.lastSpan )
        this.duplicateCount = 1
        this.lastText = text
      }
    },
    error: function() {
      var args = Array.prototype.slice.call( arguments, 0 ),
          text = args.join( ' ' ),
          _text = null

      this.parent.error.apply( this.parent, arguments )
      
      console_footer.text( text )
      
      if( ! console_footer.hasClass( 'console-error' ) ) {
        console_footer.addClass( 'console-error' )
      }
      
      // this.flash()
      
      //if( this.column !== null) {
        if( text === this.lastText ) {
          _text = '(' + ( ++this.duplicateCount ) + ')' + text
          this.lastSpan.html( nl2br( _text, false) )
        }else{
          this.lastSpan = $( '<span>' ).html( nl2br(text, false) ).addClass( 'console-entry' ).addClass( 'console-error' )
          this.div.append( this.lastSpan )
          this.duplicateCount = 1
          this.lastText = text
        }
        //}
    },
    warning: function() {
      var args = Array.prototype.slice.call( arguments, 0 )
      this.parent.error.apply( this.parent, arguments )
    },
    open: function() {
      if( this.column === null ) {
              
        this.column = GE.Layout.addColumn({ type:'console', header:'Console' })
        this.column.bodyElement.remove()
        this.column.onclose = function() { GE.Console.column = null; }
        
        this.div.css({
          display:'block',
          height: this.column.element.height() - this.column.header.outerHeight(),
          overflow:'scroll',
        })

        this.column.element.append( this.div )
        this.column.bodyElement = this.div
        
        var element = this.column.element
        var btn = $('<button title="clear console">clear</button>')
          .on('click', function() { 
            $( element ).find( '.console-entry' ).remove() 
            GE.Console.lastText = GE.Console.lastSpan = null
          })
          .css({ 'margin-left': '2em', background:'black', border:'1px solid #777', color:'#999' })
          
        this.column.header.append( btn  )
        
        GE.Layout.setColumnBodyHeight( this.column )
        
      }
    },
  }
}

)()
