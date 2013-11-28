( function() {

"use strict"

var GE = Gibber.Environment,
    doc = null,

Share = Gibber.Environment.Share = {
  docs : [],
  potentialShareNum: 0,
  prompt: null,
  open : function() {
    $script( [ 'external/channel/bcsocket-uncompressed' ],function() {
      $script( 'external/share/share.uncompressed', function() {
        $script( 'external/share/cm', function() {} )
      })
    })
  },

  createDoc : function( columnNumber, cb, sharingWith ) {
    if( GE.Account.nick !== null && typeof Share.docs[ columnNumber ] === 'undefined' ) {
        sharejs.open( GE.Account.nick + columnNumber, 'text', function(error, newDoc) {

          var column = Columns[ columnNumber ],
              val = column.value
          
          column.sharingWith = sharingWith

          Share.docs[ columnNumber ] = newDoc

          Share.docs[ columnNumber ].attach_cm( column.editor );
          
          column.editor.setValue( val )

          column.header.append( $('<span>').text( 'sharing with ' + sharingWith )
            .css({ paddingLeft:5}) )

          if( typeof cb === 'function' ) cb()
      });      
    }
  },
  openExistingDoc : function( docName, column ) {
    if( GE.Account.nick !== null ) {
      sharejs.open( docName, 'text', function(error, newDoc) {
        if( !column ) column = Columns[ 0 ]
      
        Share.docs[ column.number ]  = newDoc

        Share.docs[ column.number ].attach_cm( column.editor )
      }); 

    }
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
            Share.checkIfUserWantsToCollaborate( nick, $( div ).find( 'select' ).val() )
            $( div ).append( $('<h4>').text( 'wating for approval from ' + nick + '...' ) )
          })
    

    for( var i = 0; i < GE.Layout.columns.length; i++ ) {
      var col = GE.Layout.columns[ i ]
      if( col && col.isCodeColumn ) {
        columns .append('<option value='+ col.id + '>' + col.id + '</option>')
      }
    }
    Share.prompt = div
    div.append( hdr, info, $('<br>'), $('<br>'), collaborate, columns, shareBtn )

    GE.Message.postHTML( div )
  },
  checkIfUserWantsToCollaborate : function( username, columnNumber ) {
    Share.potentialShareNum = columnNumber

    Chat.socket.send( JSON.stringify({
      cmd: 'collaborationRequest', from:GE.Account.nick, to:username
    }) ) 
  },
  collaborationResponse : function( msg ) {
    var from = msg.from, 
        response = msg.response,
        cb = function() {
          Chat.socket.send( JSON.stringify({
            cmd: 'shareCreated', from:GE.Account.nick, to: msg.from, shareName:GE.Account.nick + Share.potentialShareNum
          }) )
        }

    if( response ) {
      Share.prompt.find( 'h4' ).text( msg.from + ' accepts your request. You are now coding together.' )
      Share.createDoc( Share.potentialShareNum, cb, msg.from )
    }else{
      Share.prompt.find( 'h4' ).text( msg.from + 'has rejected your request to code together.' )
    }
  },

  // this message is forwarded from the socket server (currently the chat socket server)
  acceptCollaborationRequest : function( data ) {
    var column = GE.Layout.addColumn({ type:'code' })
    
    column.sharingWith = data.from 

    column.header.append( $('<span>').text( 'sharing with ' + data.from ).css({ paddingLeft:5}) )

    Share.openExistingDoc( data.shareName, column )
  },
}

})()
