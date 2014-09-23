module.exports = function( Gibber ) {
  var GE,
      $ = require( './dollar' ),
      console_footer,
      tfoot,
      nl2br  = function (str, is_xhtml) {   
        var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>'; 
        //str.replace(/ /g,'_')   
        var out = (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
        
        return out
      }
  
  var Console = {
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
      GE = Gibber.Environment
      
      console_footer = $( '#footer' )
      tfoot = $( 'tfoot' )
      
      this.div = $( '<div>' )
      //window._console = this.parent      
      // console = this;
      this.on()
      window.log = this.log
    },
    html : function( html ) {
      Console.div.append( html )
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
          text = null,
          _text = null

      if( arguments.length === 1 && ( typeof arguments[0] === 'undefined' ) || arguments[0] === null ) return
      
      text = args.join( ' ' )
      
      Console.parent.log.apply( Console.parent, arguments )

      console_footer.text( text )
      
      if( console_footer.hasClass( 'console-error' ) ) {
        console_footer.removeClass( 'console-error' )
      }
      
      // this.flash()
      //if( this.column !== null) {
        if( text === this.lastText ) {
          _text = '(' + ( ++this.duplicateCount ) + ')' + text
          Console.lastSpan.html( nl2br(_text, false) )
        }else{
          Console.lastSpan = $( '<pre>' ).html( text /*nl2br( text, false)*/ ).addClass( 'console-entry' )
          Console.div.append( Console.lastSpan )
          Console.duplicateCount = 1
          Console.lastText = text
        }
        
        Console.div.scrollTop(Console.div.height())
        
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

      Console.parent.error.apply( this.parent, arguments )
      
      console_footer.text( text )
      
      if( ! console_footer.hasClass( 'console-error' ) ) {
        console_footer.addClass( 'console-error' )
      }
      
      // this.flash()
      
      //if( this.column !== null) {
        if( text === this.lastText ) {
          _text = '(' + ( ++this.duplicateCount ) + ')' + text
          Console.lastSpan.html( nl2br( _text, false) )
        }else{
          Console.lastSpan = $( '<span>' ).html( nl2br(text, false) ).addClass( 'console-entry' ).addClass( 'console-error' )
          Console.div.append( this.lastSpan )
          Console.duplicateCount = 1
          Console.lastText = text
        }
        //}
    },
    warning: function() {
      var args = Array.prototype.slice.call( arguments, 0 )
      this.parent.error.apply( this.parent, arguments )
    },
    open: function() {
      if( Console.column === null ) {
              
        Console.column = GE.Layout.addColumn({ type:'console', header:'Console' })
        Console.column.bodyElement.remove()
        Console.column.onclose = function() { 
          Console.column = null;
        }
        
        Console.div.css({
          display:'block',
          height: Console.column.element.height() - this.column.header.outerHeight(),
          overflow:'scroll',
        })

        Console.column.element.append( Console.div )
        Console.column.bodyElement = Console.div
        
        var element = Console.column.element
        var btn = $('<button title="clear console">clear</button>')
          .on('click', function() { 
            //$( element ).find( '.console-entry' ).remove() 
            Console.div.empty()
            Console.lastText = Console.lastSpan = null
          })
          .css({ 'margin-left': '2em', background:'black', border:'1px solid #777', color:'#999' })
          
        Console.column.header.append( btn  )
        
        GE.Layout.setColumnBodyHeight( Console.column )
        
      }
    },
  }

  return Console
}