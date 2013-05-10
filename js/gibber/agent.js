Agent = function(props) {
  var that = {
    _update : function() {
      this.sound.frequency = 440 + this.shape.y 
      this.sound.pan = -.75 + ( this.shape.x + 150) / 150;
      this.x += this.velocity.x;
      this.y += this.velocity.y;
      this.z += this.velocity.z;                                  
    },
    update : function() {},
  };
  
  var _velocity = that.velocity || {x:0, y:0, z:0}
  Object.defineProperty(that, 'velocity', {
    get: function() {
      return _velocity;
    },
    set: function() {
      if (typeof arguments[0] === 'number') {
        _velocity = {
          x: arguments[0],
          y: arguments[1],
          z: arguments[2]
        };
      } else if (Array.isArray(arguments[0])) {
        _velocity = {
          x: arguments[0][0],
          y: arguments[0][1],
          z: arguments[0][2]
        };
      } else if (typeof arguments[0] === 'object') {
        _velocity = arguments[0];
      }
    },
  });
  
  Object.defineProperties(that, {
		x : { get: function() { return this.shape.position.x; }, set: function(val) { this.shape.position.x = val; }, enumerable:true, },
		y : { get: function() { return this.shape.position.y; }, set: function(val) { this.shape.position.y = val; }, enumerable:true, },
		z : { get: function() { return this.shape.position.z; }, set: function(val) { this.shape.position.z = val; }, enumerable:true, },	
  })

  
  if(props.sound) {
    var soundType = props.sound.type;
    delete props.sound.type;
    that.sound = window[ soundType ]( props.sound );
  }
  if(props.shape) {
    var shapeType = props.shape.type;
    delete props.shape.type;
    that.shape = window[ shapeType ]( props.shape );
  }
  
  var _position = that.position || {x:0, y:0, z:0};
  Object.defineProperty(that, 'position', {
    get: function() {
      return _position;
    },
    set: function() {
      if (typeof arguments[0] === 'number') {
        _position = {
          x: arguments[0],
          y: arguments[1],
          z: arguments[2]
        };
      } else if (Array.isArray(arguments[0])) {
        _position = {
          x: arguments[0][0],
          y: arguments[0][1],
          z: arguments[0][2]
        };
      } else if (typeof arguments[0] === 'object') {
        _position = arguments[0];
      }
      this.shape.position = _position;
    },
  });
  
  Gibberish.extend(that, props);
  
  Graphics.graph.push( that );

  return that;
}