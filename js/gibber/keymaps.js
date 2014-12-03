module.exports = function( Gibber ) {
  var GE, CodeMirror
  var $ = require( './dollar' )
  
  var Keymap = {
    init : function() {
      GE = Gibber.Environment
      CodeMirror = GE.CodeMirror
      
      // this has to be done here so that it works when no editors are focused
      $( window ).on( 'keydown', function( e ) {
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
            
            if( col.id < currentColumnNumber && col.isCodeColumn ) {
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
        
        "Ctrl-.": function(cm) {
          Gibber.clear()
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
              GE.Chat.socket.send( 
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
            
            // console.log( obj.code, obj.selection, cm.column.shareName, cm.column.sharingWith )
            
            if( cm.column.allowRemoteExecution ) {
              GE.Chat.socket.send( 
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
  }
  
  return Keymap
}

