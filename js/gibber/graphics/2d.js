(function() {
  var TwoD = Gibber.Graphics.TwoD = {
    Canvas : function() {     
      var canvas = $( '<canvas>' )[0],
          ctx = canvas.getContext( '2d' ),
          GG = Gibber.Graphics,
          that = ctx,
          three = null; 

      if( Gibber.Graphics.canvas === null ) {
        Gibber.Graphics.init('2d')
      }

      three = $( '#three' )
      canvas.width = three.width()
      canvas.height = three.height()

      $( canvas ).css({ width: canvas.width, height: canvas.height })

      $.extend( that, {
        canvas: canvas,
        texture: new THREE.Texture( canvas ),
        _update: function() {
          this.draw()
          this.texture.needsUpdate = true
        },
        update : function() {},
        draw : function() {
          // this.fillStyle = '#f00'
          // this.fillRect( 0,0, canvas.width, canvas.height )
        },
        width:canvas.width,
        height:canvas.height,
      })

      that.texture.needsUpdate = true
      
      that.sprite = new THREE.Mesh(
          new THREE.PlaneGeometry( canvas.width, canvas.height, 1, 1),
          new THREE.MeshBasicMaterial({
            map:that.texture,
            affectedByDistance:false,
            useScreenCoordinates:true
          })
      )

      that.sprite.position.x = that.sprite.position.y = that.sprite.position.z = 0

      Gibber.Graphics.scene.add( that.sprite )
      Gibber.Graphics.graph.push( that )

      return that
    }
  }

  window.Canvas = TwoD.Canvas

})()
