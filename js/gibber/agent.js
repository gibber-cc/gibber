Agent = function(props) {
  var that = {
    _update : function() {
      this.sound.frequency = 440 + this.shape.y 
      this.sound.pan = -.75 + ( this.shape.x + 150) / 150;
    },
    update : function() { 

    },
  };
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
  
  var _position = that.position || [0,0,0];
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