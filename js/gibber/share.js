module.exports = function( Gibber ) {

"use strict"

// TODO: get browserify to work with these files... for now their included in the index.ejs template

//require( '../external/sharenew/share.uncompressed' )
//require( 'share' ).client
//var sharejs = window.sharejs = require( 'share/lib/client' )
//require( '../external/sharenew/text' )
//require( '../external/sharenew/share-codemirror' )

var GE,
    sharejs,
    Layout,

Share = {
  docs : [],
  potentialShareNum: 0,
  prompt: null,
  socket: null,
  documentCount: 0,
  init : function() {
    GE = Gibber.Environment
    Layout = GE.Layout
    sharejs = window.sharejs
  },

  createDoc : function( columnNumber, cb, sharingWith, shareName ) {
    var ctx
    if( GE.Account.nick !== null && typeof Share.docs[ columnNumber ] === 'undefined' ) {
      
      if( Share.socket === null ) {
        Share.socket = new WebSocket( 'ws' + GE.SERVER_URL.split( 'http' )[1] )
      }
      
      var sjs = Share.sjs = new sharejs.Connection( Share.socket )
      
      //sjs.debug = true
      // sjs.on( 'connecting', function( e ) { 
      //   console.log("CONNECTING TO SHARE.JS")
      // })
      
      // sjs.on( 'connected', function( e ) { 
      //   console.log("CONNECTED TO SHARE.JS")
      // })
      // sjs.on( 'error', function( e ) { 
      //   console.log("SHARE.JS CONNECTION ERROR")
      // })
      //console.log( "SOCKET", GE.Chat.socket )
      if( typeof shareName === 'undefined' ) shareName = GE.Account.nick + columnNumber
      
      var doc = sjs.get( 'users', shareName )

      doc.subscribe();
      
      doc.whenReady( function () {  
        var column = Layout.columns[ columnNumber ],
            val = column.value
                  
        if ( !doc.type ) doc.create( 'text', val )

        if ( doc.type && doc.type.name === 'text' ) {      
          column.shareName = shareName
          column.sharingWith = sharingWith
      
          Share.docs[ columnNumber ] = doc
                    
          doc.attachCodeMirror( column.editor )

          //column.editor.setValue( val )
      
          if( sharingWith !== null ) column.header.append( $('<span>').text( 'sharing with ' + sharingWith ).css({ paddingLeft:5 }) )
      
          if( typeof cb === 'function' ) {
            cb()
          }
        }
      });  
      
    }
  },
  
  shareEditor: function( editor, name ) {
    if( Share.socket === null ) {
      Share.socket = new WebSocket( 'ws' + GE.SERVER_URL.split( 'http' )[1] )
    }
    
    var sjs = Share.sjs = new sharejs.Connection( Share.socket )
    
    sjs.debug = true
    sjs.on( 'connecting', function( e ) { 
      console.log("CONNECTING TO SHARE.JS")
    })
    
    sjs.on( 'connected', function( e ) { 
      console.log("CONNECTED TO SHARE.JS")
    })
    sjs.on( 'error', function( e ) { 
      console.log("SHARE.JS CONNECTION ERROR")
    })
    
    var doc = sjs.get( 'users', name )

    doc.subscribe();
    
    var _value = editor.getValue()
    
    doc.whenReady( function () {        
      if ( !doc.type ) doc.create( 'text' )

      if ( doc.type && doc.type.name === 'text' ) {    
        Share.docs.push( doc )
        
        doc.attachCodeMirror( editor )

        editor.setValue( _value )
    
        if( typeof cb === 'function' ) {
          cb()
        }
      }
    }); 
  },
  
  openExistingDoc : function( docName, column ) {
    if( Share.socket === null ) {
      Share.socket = new WebSocket( 'ws' + GE.SERVER_URL.split( 'http' )[1] )
    }
    
    var sjs = new sharejs.Connection( Share.socket )
    
    if( Share.willAcceptRemoteExecution ) {
      column.allowRemoteExecution = true
      Share.willAcceptRemoteExecution = false
    }
    
    var doc = sjs.get( 'users', docName )

    doc.subscribe();

    doc.whenReady( function () {
      if ( !doc.type) doc.create( 'text' )
      if ( doc.type && doc.type.name === 'text' ) {        
      
        column.shareName = docName
        // column.sharingWith = sharingWith
    
        //Share.docs[ columnNumber ] = doc
        doc.attachCodeMirror( column.editor )
      }
    });
  },
  
  openDocGabber: function( docName, element ) {
    var doc = Share.sjs.get( 'users', docName )
    
    
    console.log("GABBER ELEMENT", element )
    doc.subscribe();

    doc.whenReady( function () {
      if ( !doc.type) doc.create( 'text' )
      if ( doc.type && doc.type.name === 'text' ) {        
        doc.attachCodeMirror( element )
      }
    });
  },
  
  promptToShareWith : function( nick ) {
    var div = $('<div>'),
        hdr = $('<h3>').text( 'User : ' + nick ).css({ display:'inline' }),
        info = $('<button>').text( 'Display User Info' ).css({ marginLeft:'2em' }),
        columns = $('<select>'),
        collaborate = $('<span>').text( 'Collaborate on Column ID#: ' ),
        shareBtn = $('<button>')
          .text( 'Share' )
          .on( 'click', function() {
            Share.checkIfUserWantsToCollaborate( nick, $( div ).find( 'select' ).val(), enableRemoteExecution.is(':checked') )
            $( div ).append( $('<h4>').text( 'wating for approval from ' + nick + '...' ) )
          }),
        enableRemoteExecution = $('<input type="checkbox">')
    

    for( var i = 0; i < GE.Layout.columns.length; i++ ) {
      var col = GE.Layout.columns[ i ]
      if( col && col.isCodeColumn ) {
        columns .append('<option value='+ col.id + '>' + col.id + '</option>')
      }
    }
    Share.prompt = div
    div.append( hdr, info, $('<br>'), $('<br>'),
                collaborate, columns, $('<br>'), 
                $('<span>').text('Enable remote code execution?'), enableRemoteExecution, '<br>',
                shareBtn )


    GE.Message.postHTML( div )
  },
  checkIfUserWantsToCollaborate : function( username, columnNumber, remoteExecution ) {
    Share.potentialShareNum = columnNumber

    GE.Chat.socket.send( JSON.stringify({
      cmd: 'collaborationRequest', from:GE.Account.nick, to:username, enableRemoteExecution:remoteExecution
    }) ) 
  },
  collaborationResponse : function( msg ) {
    var from = msg.from, 
        response = msg.response,
        cb = function() {
          GE.Chat.socket.send( JSON.stringify({
            cmd: 'shareCreated', from:GE.Account.nick, to: msg.from, shareName:GE.Account.nick + Share.potentialShareNum
          }) )
        }
    
    if( response !== 'no' ) {
      Share.prompt.find( 'h4' ).text( msg.from + ' accepts your request. You are now coding together.' )
      Share.createDoc( Share.potentialShareNum, cb, msg.from )
      Layout.columns[ Share.potentialShareNum ].allowRemoteExecution = response === 'editandexecute'
    }else{
      Share.prompt.find( 'h4' ).text( msg.from + 'has rejected your request to code together.' )
    }
  },

  // this message is forwarded from the socket server (currently the chat socket server)
  acceptCollaborationRequest : function( data ) {
    var column = GE.Layout.addColumn({ type:'code' })
    
    column.allowRemoteExecution = data.allowRemoteExecution  
    column.sharingWith = data.from 

    column.header.append( $('<span>').text( 'sharing with ' + data.from ).css({ paddingLeft:5}) )

    Share.openExistingDoc( data.shareName, column )
  },
}

return Share 

}
