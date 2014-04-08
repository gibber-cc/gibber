( function() {
  var codeObjects = [ 'Sampler', 'Model' ]
  
  G.scriptCallbacks.push( function( obj, cm, pos, start, end, src ) {
    console.log( obj )
    if( obj.type === 'ExpressionStatement' && obj.expression.type === 'AssignmentExpression' ) {
      if( obj.expression.right.callee ) {
        var constructorName = obj.expression.right.callee.name
      }
      if( codeObjects.indexOf( constructorName ) > -1 ){
        var newObjectName = obj.expression.left.name,
            className = constructorName + '_' + newObjectName
            
        if( obj.expression.left ) {
          console.log( 'MAKING A DROP', className, newObjectName )
          
          // apparently this isn't synchronous? 
          cm.markText( start, end, { 'className': className } );
          
          future( function() {
            $( '.' + className ).on( 'drop', function( e ) { 
              console.log( 'GOT A DROP ', className, newObjectName )
              window[ newObjectName ].ondrop( e.originalEvent.dataTransfer.files )
              $( '.' + className ).css({ background:'none' })
            })
            
            $( '.' + className ).on( 'dragenter', function( e ) { 
              console.log( 'DRAGOVER', className, newObjectName )
              $( '.' + className ).css({ background:'red' })
            })
            
            $( '.' + className ).on( 'dragleave', function( e ) { 
              console.log( 'DRAGLEAVE', className, newObjectName )
              $( '.' + className ).css({ background:'none' })
            })
            
          }, 1/4)
        }
      }
    }
  })
  
  /*a = Drums()
  $('.a').off('drop')

  $('.a').on('drop', function (e) {
    //this.className = '';
    e.preventDefault();
  // 	console.log( "EVENT", e )
    var file = e.originalEvent.dataTransfer.files[0],
        reader = new FileReader();
  
    reader.onload = function (event) {
      Layout.columns[0].bodyElement.css('background', 'url(' + event.target.result + ') no-repeat center')
    };

    reader.readAsDataURL(file);
  
    return false;
  })*/

})()