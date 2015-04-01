module.exports = function( Gibber ) {
  var GE, $ = require( './dollar' );
  
  var Account = {
    nick: null,
    init : function() {
      GE = Gibber.Environment
      
      $('.login a').on('click', function(e) { 
        Account.createLoginWindow()
      })
      
      Account.loginStatus()
    },
    
    loginStatus : function() {
      $.ajax({ 
        url: GE.SERVER_URL + '/loginStatus',
        dataType:'json'
      }).done( function( response ) { 
        if( response.username !== null ) {
          $( '.login' ).empty()
          $( '.login' ).append( $('<span>welcome, ' + response.username + '.  </span>' ) )
          
          $.publish('/account/login', response.username )
          
          Account.nick = response.username
                    
          $( '.login' ).append( $('<a href="#">' )
            .text( ' logout ')
            .on( 'click', function(e) {
              $.ajax({
                type:"GET",
                url: GE.SERVER_URL + '/logout', 
                dataType:'json'
              }).done( function( data ) {
                $( '.login' ).empty()
                
                Account.nick = null
                $.publish( '/account/logout', response.username )
                
                $( '.login' ).append( $('<a href="#">' )
                  .text( 'please login' )
                  .on('click', function(e) { 
                    Account.createLoginWindow()
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
        url:GE.SERVER_URL + '/login',
        dataType:'html'
      }).done( function(response) { 
        $('body').append( response ); 
        $("#username").focus() 
      }) 
    },
    
    login: function() {
      $.ajax({
        type:"POST",
        url: GE.SERVER_URL + '/login', 
        data:{ username: $("#username").val(), password: $("#password").val() }, 
        dataType:'json'
      })
      .done( function (data) {
        if( !data.error ) {
          // console.log( "LOGIN RESPONSE", data )
          $( '.login' ).empty()
          $( '.login' ).append( $('<span>welcome, ' + data.username + '.  </span>' ) )
          Account.nick = data.username
          
          $.publish('/account/login', data.username )
          
          console.log("I am logged in", Account.nick, data.username )
          $( '.login' ).append( $('<a href="#">' )
            .text( ' logout ')
            .on( 'click', function(e) {
              $.ajax({
                type:"GET",
                url: GE.SERVER_URL + '/logout', 
                dataType:'json'
              }).done( function(_data) {
                Account.nick = null
                $.publish( '/account/logout', data.username )

                $( '.login' ).empty()

                $( '.login' ).append( $('<a href="#">' )
                  .text( 'please login' )
                  .on('click', function(e) { 
                    Account.createLoginWindow()
                  })
                )
              })
            })
          )
          $( '#loginForm' ).remove()
        }else{
          $( "#loginForm h5" ).html( "Your name or password was incorrect. Please try again. ")
          var passwordRequest = $('<span>Click here if you\'ve forgotten your password.</span>')
          
          passwordRequest.on( 'click', function( e ) {
            $.ajax({
              url: GE.SERVER_URL + '/requestPassword',
              dataType:'json',
              type:'POST',
              data: { username: $("#username").val() }
            }).done( function( data, error ) {
              var msg = data.msg
              
              if( data ) {
                if( data.result === 'success' ) {
                  msg += '. Please check your email for the password reminder and then try to login again.'
                }

                $( "#loginForm h5" ).html( msg )
              }
            })
          })
          
          passwordRequest.css({ textDecoration:'underline' })
          
          $( "#loginForm h5" ).append( passwordRequest )
        }
      })
      .fail( function(error) {console.log( error )})

      return false
    },
    newAccountForm: function() {
      var col = GE.Layout.addColumn({ header:'Create an account' })
      col.bodyElement.remove()
      Account.newAccountColumn = col

      $( '#loginForm' ).remove()
      $.ajax({
        url: GE.SERVER_URL + '/snippets/create_account.ejs',
        dataType:'html'
      }).done( function( data ) {        
        col.element.append( data )
        col.bodyElement = data
        
        GE.Layout.setColumnBodyHeight( col )
        //$( col.element ).append( data ); 
      })

      return false
    },
    newPublicationForm: function() {
      if( Account.nick !== null ) {
        var col = GE.Layout.addColumn({ type:'form', fullScreen:false, header:'Publish a Giblet' })
        
        Account.publicationColumn = col

        col.element.addClass('publication_form')
        
        col.bodyElement.remove()
        
        $.ajax({
          url: GE.SERVER_URL + "/create_publication",
          dataType:'html'
        })
        .done( function( data ) {
          $( col.element ).append( data ); 
          for( var i = 0; i < GE.Layout.columns.length; i++ ) {
            var _col = GE.Layout.columns[ i ]
            if( _col && _col.isCodeColumn ) {
              $('#new_publication_column').append( $( '<option>' + _col.id + '</option>' ) )
            }
          }
        })
      }else{
        GE.Message.post('You must log in before publishing. Click the link in the upper right corner of the window to login (and create an account if necessary).')
      }
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

      $.ajax({
        type:"POST",
        url: GE.SERVER_URL + '/createNewUser', 
        'data':data, 
        dataType:'json'
      }).done(
        function (data, error) {
          if( data ) {
            GE.Message.post('New account created. Please login to verify your username and password.'); 
          } else { 
            GE.Message.post( 'The account could not be created. Try a different username' )
            console.log( "RESPONSE", response )
          }
          return false;
      })    
      // col.element.remove()
      GE.Layout.removeColumn( Account.newAccountColumn.id )     
    },
    publish : function() {
      var url = GE.SERVER_URL + '/publish'
      
      //GE.Spinner.spin( $('.publication_form')[0] 
      
      var columnNumber = $( '#new_publication_column' ).val(),
          column = GE.Layout.columns[ columnNumber ]
      
      $.ajax({
        type:"POST",
        url: GE.SERVER_URL + '/publish',
        data: {
          name: $( '#new_publication_name' ).val(),
          code: column.editor.getValue(),
          language: column.mode,
          permissions: $( '#new_publication_permissions' ).prop( 'checked' ),
          tags: $( '#new_publication_tags' ).val().split(','),
          notes: $( '#new_publication_notes' ).val(), 
          instrument: false,
          username: Gibber.Environment.Account.nick
         },
        dataType:'json'
      })
      .done( function ( data ) {        
        if( data.error ) {
          GE.Message.post( 'There was an error writing to Gibber\'s database. Error: ' + data.error )
        }else{
          GE.Message.post( 'Your publication has been saved to: ' + GE.SERVER_URL + '/?path=' + data._id )
        }
        GE.Layout.removeColumn( parseInt( $( '.publication_form' ).attr( 'id' ) ) )
        
        column.fileInfo = data
        column.revision = JSON.stringify( data )
        
        return false
      })
      .fail( function(e) { console.log( "FAILED TO PUBLISH", e ) } )

      return false
    },
    updateDocument : function( revisions, previous, notes, column ) {
      if( Account.nick !== null && Account.nick === column.fileInfo.author ) {
        var msg = {
          type: 'POST',
          url:  GE.SERVER_URL + '/update',
          data: previous,
          dataType: 'json'
        }
      
        $.extend( msg.data, revisions )
        msg.data.revisionNotes = notes
      
        var promise = $.ajax( msg ).then( 
          function(d) { 
            column.fileInfo._rev = d._rev; 
            column.revision = JSON.stringify( column.fileInfo )
            GE.Message.postFlash( msg.data._id.split('/')[2] + ' has been updated.' ) 
          },
          function(d) { console.error( d.error ) }
        )
      }else{
        var msg = [
        'This file can only be updated by gibberer ' + column.fileInfo.author + '.',
        ' If this is your account, please log in. Otherwise, create a new publication to save the data to your account.'
        ]
        GE.Message.post( msg.join('') )
      }
    },
    deleteUserFile: function( fileData ) {

    },
  }
    
  return Account
}
