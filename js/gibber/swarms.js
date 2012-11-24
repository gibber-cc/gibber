Swarm = function(props) {
	var boids;
	if(Array.isArray(arguments[0])) {
		var boids = arguments[0];
	}else{
		boids = [];
		var isRandomX = false, isRandomY = false, isRandomZ = false;
		
		for(var i = 0; i < props.size; i++ ) {
			var _props = {
				shape: props.shape || {
					type : "Sphere",
					x : 0,
					y : 0,
					z : 0,
					scale : .25,
					shiny : 10,
				},
				sound: props.sound || {
				    type:"Sine",
				    channels:2,
				    frequency:440,
				    amp:0,
				},
			};
			if(i==0) console.log(_props);
			//delete props.shape; delete props.sound;
			
			for(var key in props) {
				if(key === "shape" || key === "sound") continue;
				if(typeof props[key] === 'function' && key !== 'update') {
					_props[key] = props[key]();
				}else if(Array.isArray(props[key])){
					var p = [];
					for(var j = 0; j<props[key].length; j++) {
						if(typeof props[key][j] === 'function') {
							p.push(props[key][j]());
						}else{
							p.push(props[key][j]);
						}
					}
					_props[key] = p;
				}else if(key !== 'sound' && key !== 'shape'){
					_props[key] = props[key];
				}
			}
			
			for(var key in _props.shape) {
				if(typeof _props.shape[key] === 'function' && key !== 'update') {
					_props.shape[key] = _props.shape[key]();
				}
			}
			
			if(typeof _props.shape.x === 'undefined') {
				_props.shape.x = rndf(-1, 1);
			}else if(typeof _props.shape.x === 'number') {
				_props.shape.x = rndf(_props.shape.x - 1, _props.shape.x + 1);
			}
			
			if(typeof _props.shape.y === 'undefined') {
				_props.shape.y = rndf(-1, 1);
			}else if(typeof _props.shape.y === 'number') {
				_props.shape.y = rndf(_props.shape.y - 1, _props.shape.y + 1);
			}
			
			if(typeof _props.shape.z === 'undefined') {
				_props.shape.z = rndf(-1, 1);
			}else if(typeof _props.shape.z === 'number') {
				_props.shape.z = rndf(_props.shape.z - 1, _props.shape.z + 1);
			}
			
			//if(i===0) console.log(_props);
			
			__update = _props.update;
			delete _props.update;
			
			var agent = {
				shape : window[_props.shape.type](_props.shape),
				update : __update || function() {},
			}
			
			if(_props.sound) {
				agent.sound = Gibberish[_props.sound.type](_props.sound);
			}
			
			boids.push(agent);
		}
	}
		
    var that = {
		separation : 3,
		position : {x:0, y:0, z:0},
		speed: 5,
		positionTendency:100,
		flockTendency: 1000,
		boids : boids,
		shouldOrient : props.shouldOrient || false,	
		findVelocity : function() {
            var pvj = {
                x: 0,
                y: 0,
                z: 0
            };

            for (var i = 0; i < boids.length; i++) {
                var _boid = boids[i];
                pvj.x += _boid.velocity.x;
                pvj.y += _boid.velocity.y;
                pvj.z += _boid.velocity.z;
            }

            pvj.x /= boids.length - 1;
            pvj.y /= boids.length - 1;
            pvj.z /= boids.length - 1;
		
			this.averageVelocity = pvj;
		},
		findCenter : function() {
			var vc = {x:0, y:0, z:0};
			
            for (var i = 0; i < boids.length; i++) {
                var _boid = boids[i];
                vc.x += _boid.shape.x;
                vc.y += _boid.shape.y;
                vc.z += _boid.shape.z;
            }
			
            vc.x /= boids.length - 1;
            vc.y /= boids.length - 1;
            vc.z /= boids.length - 1;
			
			this.averageCenter = vc;
		},
        rules: [
        function(boid) {
			var vc = that.averageCenter;
			
            var result = {
                x: (vc.x - boid.shape.x) / that.flockTendency,
                y: (vc.y - boid.shape.y) / that.flockTendency,
                z: (vc.z - boid.shape.z) / that.flockTendency,
            };
			
            return result;
        },

        function(boid) {
            var c = {
                x: 0,
                y: 0,
                z: 0
            };
            //for (var i = 0; i < boids.length; i++) {
                //var _boid = boids[i];
				var _boid = boid.id < boids.length - 2 ? boids[boid.id + 1] : boids[0];
                if (_boid.id !== boid.id) {
                    var diff = {
                        x: _boid.shape.x - boid.shape.x,
                        y: _boid.shape.y - boid.shape.y,
                        z: _boid.shape.z - boid.shape.z,
                    };

                    if (Math.sqrt(Math.pow(diff.x, 2) + Math.pow(diff.y, 2) + Math.pow(diff.z, 2)) < that.separation) {
                        c.x -= _boid.shape.x - boid.shape.x;
                        c.y -= _boid.shape.y - boid.shape.y;
                        c.z -= _boid.shape.z - boid.shape.z;
                    }
                }
			//}

            return c;
        },

        function(boid) {
            var pvj = that.averageVelocity;

            return {
                x: (pvj.x - boid.velocity.x) / 8,
                y: (pvj.y - boid.velocity.y) / 8,
                z: (pvj.z - boid.velocity.z) / 8
            }

        },
		
        function(boid) {
            return {
                x: (that.position.x - boid.shape.x) / that.positionTendency,
                y: (that.position.y - boid.shape.y) / that.positionTendency,
                z: (that.position.z - boid.shape.z) / that.positionTendency,
            }
        }, ],
		
		limit: function(boid) {
			var lim = that.speed;
			var v = Math.sqrt(Math.pow(boid.velocity.x, 2) + Math.pow(boid.velocity.y, 2) + Math.pow(boid.velocity.z, 2));
			
			if(v > lim) {
				boid.velocity.x /= Math.sqrt( Math.pow(boid.velocity.x, 2) ) * lim;
				boid.velocity.y /= Math.sqrt( Math.pow(boid.velocity.y, 2) ) * lim;
				boid.velocity.z /= Math.sqrt( Math.pow(boid.velocity.z, 2) ) * lim;
			}
		},

        update: function() {
			this.findCenter();
			this.findVelocity();
			
			var PI2 = Math.PI / 2;
			var PI4 = Math.PI / 4;
            for (var i = 0; i < boids.length; i++) {
                var boid = boids[i];
				
                for (var j = 0; j < this.rules.length; j++) {
					var v = this.rules[j](boid);
					
                    boid.velocity.x += v.x;
                    boid.velocity.y += v.y;
                    boid.velocity.z += v.z;
                }
				
				this.limit(boid);
				
				if(this.shouldOrient) {
					var length = Math.sqrt( (boid.velocity.x * boid.velocity.x) + (boid.velocity.y * boid.velocity.y) + (boid.velocity.z * boid.velocity.z) );
					var normalizedVelocity = {
						x: (boid.velocity.y / -length) ,//* Math.PI * 2 ,
						y: (boid.velocity.z / -length) ,//* Math.PI * 2 ,
						z: (boid.velocity.x / -length) ,//* Math.PI * 2,												
					}
					boid.shape.rotation = normalizedVelocity;
				}

                boid.shape.position.x += boid.velocity.x / 4;
                boid.shape.position.y += boid.velocity.y / 4;
                boid.shape.position.z += boid.velocity.z / 4;
				
				boid.update.call(boid);
            };
        },
		
		reset : function() {
			boids.all( function() {
			    this.shape.x = rndf(-100, 100);
			    this.shape.y = rndf(-100, 100);
			    this.shape.z = rndf(-100, 100);
  
			    this.velocity = {x:0, y:0, z:0};
			});
		},
		
		_update : function() {},
		kill : function() {
			for(var i = 0; i < boids.length; i++) {
				var boid = boids[i];
				boid.shape.remove();
				boid.sound.disconnect();
			}
			Graphics.graph.remove(this);
		},
		init : function() {
			for(var i = 0; i < boids.length; i++) {
				var boid = boids[i];
				boid.velocity = {x:0, y:0, z:0};
				boid.id = i;
			}
			Graphics.graph.push(this);
		},
    };
	
	var _position = that.position;
	Object.defineProperty(that, 'position', {
		get : function() { return _position; },
		set : function() {
			if(typeof arguments[0] === 'number')  {
				_position = { x:arguments[0], y:arguments[1], z:arguments[2] };
			}else if(Array.isArray(arguments[0])) {
				_position = { x:arguments[0][0], y:arguments[0][1], z:arguments[0][2] };
			}else if(typeof arguments[0] === 'object') {
				_position = arguments[0];
			}
		},
	});
	
	delete props.update;
	Gibberish.extend(that, props);

	that.__proto__ = Bus();
	boids.all( function() { this.sound.connect( that) } );
	
	that.init();
	
    return that;
};
