(function() {
  var resubmitTexture = [
    'fillRect', 'strokeRect', 'fillText', 'strokeText'
  ],
  cnvs = null

  var TwoD = Gibber.Graphics.TwoD = {
    Canvas : function( column ) {
      if( cnvs !== null ) {
        three = $( '#three' )
        Gibber.Graphics.assignWidthAndHeight()
        canvas.width = three.width()
        canvas.height = three.height()
        that.top = 0 
        that.bottom = canvas.height
        that.left = 0
        that.right = canvas.width
        that.center = { x: canvas.width / 2, y : canvas.height / 2 }
        return cnvs
      }

      var canvas = $( '<canvas>' )[0],
          ctx = canvas.getContext( '2d' ),
          GG = Gibber.Graphics,
          that = ctx,
          three = null; 

      if( Gibber.Graphics.canvas === null ) {
        Gibber.Graphics.init( '2d', column )
      }

      three = $( '#three' )
      canvas.width = three.width()
      canvas.height = three.height()
      
      that.top = 0 
      that.bottom = canvas.height
      that.left = 0
      that.right = canvas.width
      that.center = { x: canvas.width / 2, y : canvas.height / 2 }

      $( canvas ).css({ width: canvas.width, height: canvas.height })
      var tex = new THREE.Texture( canvas )
      $.extend( that, {
        canvas: canvas,
        texture: tex, 
        _fill : that.fill,
        _stroke : that.stroke,
        _rotate : that.rotate,
        rotate : function( amt ) {
          this.translate( this.center.x, this.center.y )
          this._rotate( amt )
          this.translate( -this.center.x, -this.center.y )  
        },
        fill : function( color ) {
          if( typeof color !== 'undefined' ) {
            this.fillStyle = color
          }
          this._fill() 
          this.texture.needsUpdate = true
          return this
        },
        stroke: function( color, lineWidth ) {
          if( typeof color !== 'undefined' ) {
            this.strokeStyle = color
          }
          if( typeof lineWidth !== 'undefined' ) {
            this.lineWidth = lineWidth
          }
          this._stroke()
          this.texture.needsUpdate = true
          return this
        },
        _update: function() {
          this.save()
          this.draw()
          this.restore()
        },
        update : function() {},
        draw : function() {},
        clear: function() {
          this.clearRect( 0,0,this.right,this.bottom )
          this.texture.needsUpdate = true
          return this
        },
        line : function( x1,y1, x2,y2 ) {
          this.beginPath()
            this.moveTo( x1, y1 )
            this.lineTo( x2, y2 )
          this.closePath()
          return this
        },
        circle : function( x,y,radius ) {
          this.beginPath()
            this.arc( x, y, radius, 0, 360)
          this.closePath()
          return this
        },
        square : function( x,y,size ) {
          this.beginPath()
            this.moveTo( x,y )
            this.lineTo( x + size, y )
            this.lineTo( x + size, y + size )
            this.lineTo( x, y + size )
            this.lineTo( x,y )
          this.closePath()
          return this
        },
        update: function() { this.texture.needsUpdate = true; return this },
        polygon: function( x,y,radius,sides ) {
          var ca  = 360 / sides
          
          for( var i = 1; i <= sides; i++ ) {
            var angle = ca * i,
                radians = Math.PI * 2 * ( angle / 360 ),
                _x = Math.round( Math.sin( radians ) * radius ) + x,
                _y = Math.round( Math.cos( radians ) * radius ) + y
            
            if( i === 1 ) {
              this.beginPath()
              this.moveTo( _x, _y )
            }else{
              this.lineTo( _x, _y )
            }
          }
          var angle = ca,
              radians = Math.PI * 2 * ( angle / 360 ),
              _x = Math.round( Math.sin( radians ) * radius ) + x,
              _y = Math.round( Math.cos( radians ) * radius ) + y   
          
          this.lineTo( _x, _y )
          this.closePath()
          return this
        },
        randomColor : function() {
          return "#" + Math.random().toString(16).slice(2, 8)
        },
        width:canvas.width,
        height:canvas.height,
        sprite : new THREE.Mesh(
          new THREE.PlaneGeometry( canvas.width, canvas.height, 1, 1),
          new THREE.MeshBasicMaterial({
            map:tex,
            affectedByDistance:false,
            useScreenCoordinates:true
          })
        ),
      })

      that.texture.needsUpdate = true 

      that.sprite.position.x = that.sprite.position.y = that.sprite.position.z = 0

      Gibber.Graphics.scene.add( that.sprite )
      Gibber.Graphics.graph.push( that )
      
      cnvs = that

      Object.defineProperty( that, 'fps', {
        get: function() { return Gibber.Graphics.fps !== null ? Gibber.Graphics.fps : 60 },
        set: function(v) { Gibber.Graphics.fps = v }
      })

      return that
    }
  }

  window.Canvas = TwoD.Canvas

})()
