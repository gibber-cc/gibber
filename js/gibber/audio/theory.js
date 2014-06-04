(function() {
  "use strict"

var Theory = Gibber.Theory = {
  Teoria: window.teoria,
  Scale : function(_root, _mode) {
  	var that = {
  		root: typeof _root === "string" ? teoria.note(_root) : _root,
  		notes: [],
		
  		chord : function(_notes, _offset) {
  			var _chord = [];
  			_offset = _offset || 0;
			  
  			for(var i = 0; i < _notes.length; i++) {
  				_chord.push( this.notes[ _notes[i] + _offset ] );
  			}
  			return _chord;
  		},
		
  		create : function() {
        var __root = typeof that.root() === 'object' ? that.root() : teoria.note( that.root() ),
            __mode = that.mode() || mode 
            
        //console.log( __mode )
            
  			this.notes = [];
        
        // console.log( 'CREATE', __mode, __root )
  			if( Gibber.Theory.Scales[ __mode ] ) {
  				var scale = Gibber.Theory.Scales[ __mode ]( __root );
  				scale.create();
  				this.notes = scale.notes;
  			}else{
  				var _rootoctave = __root.octave;
          
  				var _scale = teoria.scale.list( __root, __mode, false );
  				for(var oct = _rootoctave, o = 0; oct < _rootoctave + 8; oct++, o++) {
  					for(var num = 0; num < _scale.length; num++) {
  						var nt = $.extend( {}, _scale[ num ] );
  						nt.octave += o;
  						this.notes.push( nt );
  					}
  				}
			
  				var negCount = -1;
  				for(var oct = _rootoctave - 2, o = -1; oct >= 0; oct--, o--) {
  				 	for(var num = _scale.length - 1; num >= 0; num--) {
  				 		var nt = $.extend( {}, _scale[ num ] );
  				 		nt.octave += o;
  				 		this.notes[ negCount-- ] = nt;
  				 	}
  				}	
  			}
  		},
		
  		set : function(_root, _mode) {
  			if(Array.isArray(arguments[0])) {
  				this.root = arguments[0][0];
  				this.mode = arguments[0][1];
  			}else{
  				this.root = _root;
  				this.mode = _mode;
  			}
  		},
  	};
	
  	var mode = _mode || "aeolian";
  	Object.defineProperty( that, "mode", {
      configurable:true,
  		get: function() { return mode; },
  		set: function( val ) { 
        mode = val; 
        that.create(); 
      }	
  	});
	
  	var root = that.root;
  	Object.defineProperty(that, "root", {
      configurable:true,
  		get: function() { return root; },
  		set: function(val) { 
  			root = typeof val === "string" ? teoria.note( val ) : val; 
  			that.create();
  		}	
  	});
	  
    //createProxyProperty: function( obj, _key, shouldSeq, shouldRamp, dict, _useMappings ) {
    
    Gibber.createProxyProperty( that, 'root', true, false, null, false, 1 )
    Gibber.createProxyProperty( that, 'mode', true, false, null, false, 1 )
    
    $.subscribe( '/gibber/clear', function() {
      that.seq.isConnected = false
      that.seq.isRunning = false
      that.seq.destinations.length = 0
    })
    
  	that.create();
    
    that.toString = function() { return 'Scale: ' + that.root() + ', ' + that.mode() }

  	return that;
  },
  
  CustomScale : function() {
    var that = {
      notes : [],
      ratios: arguments[1] || [ 1, 1.10, 1.25, 1.3333, 1.5, 1.666, 1.75 ],
	
      create : function() {
        this.notes = [];
  
        var scaleRoot = this.root;
      
        for( var octave = 0; octave < 8; octave++ ) {
          for( var num = 0; num < this.ratios.length; num++ ) {	
            this.notes.push( scaleRoot * this.ratios[num] );
          }
          scaleRoot *= 2;
        }
      
        scaleRoot = this.root;
  	    var negCount = 8;
        for(var octave = -1; octave >= -8; octave--) {
          scaleRoot /= 2;
          for( var num = 0; num < this.ratios.length; num++ ) {
  		      var noteNum = octave * this.ratios.length + num;
            this.notes[noteNum] = scaleRoot * this.ratios[num];
          }
        }	
      },
	
    	chord : function(_notes, _offset) {
    		var _chord = [];
    		_offset = _offset || 0;
			
    		for(var i = 0; i < _notes.length; i++) {
    			_chord.push( this.notes[_notes[i] + _offset] );
    		}
    		return _chord;
    	},	
    }

    var _root = arguments[0] || 440;
    Object.defineProperty(that, "root", {
      get : function() { return _root; },
      
      set : function(val) { 
    		if(typeof val === "number") {
    			_root = val;
    		}else if (typeof val === "string") {
    			_root = Theory.Teoria.note(val).fq();
    		}else if (typeof val === 'object') {
    			_root = val.fq();
    		}
        
    		this.create(_root); 
      }
    });
    
  	// var mode = _mode || "aeolian";
//     Object.defineProperty( that, "mode", {
//       get: function() { return mode; },
//       set: function( val ) { mode = val; this.create(); }  
//     });
    
    that.root = _root;                   
    that.create();
      
    return that;
  },
  
  Scales : {
    Major: function( root ) { return Theory.CustomScale( root, [1, 9/8, 5/4, 4/3, 3/2, 5/3, 15/8 ])},
    Ionian: function( root ) { return Theory.CustomScale( root, [1, 9/8, 5/4, 4/3, 3/2, 5/3, 15/8 ])},    
    Dorian: function( root ) { return Theory.CustomScale( root, [1, 9/8, 6/5, 4/3, 3/2, 5/3, 9/5 ])},
    Phrygian: function( root ) { return Theory.CustomScale( root, [1, 16/15, 6/5, 4/3, 3/2, 8/5, 9/5 ])},
    Lydian: function( root ) { return Theory.CustomScale( root, [1, 9/8, 5/4, 45/32, 3/2, 5/3, 15/8 ])},
    Mixolydian: function( root ) { return Theory.CustomScale( root, [1, 9/8, 5/4, 4/3, 3/2, 8/5, 9/5 ])},
    Minor: function( root ) { return Theory.CustomScale( root, [1, 9/8, 6/5, 4/3, 3/2, 8/5, 9/5 ])},     
    Aeolian : function( root ) { return Theory.CustomScale( root, [1, 9/8, 6/5, 4/3, 3/2, 8/5, 9/5 ])}, 
    Locrian : function( root ) { return Theory.CustomScale( root, [1, 16/15, 6/5, 4/3, 62/45, 8/5, 15/8 ])},
    MajorPentatonic : function( root ) { return Theory.CustomScale( root, [1, 9/8, 5/4, 3/2, 5/3 ] ) },
    MinorPentatonic : function( root ) { return Theory.CustomScale( root, [1, 6/5, 4/3, 3/2, 15/8] ) },
    Chromatic: function( root ) { return Theory.CustomScale( root, [1, 16/15, 9/8, 6/5, 5/4, 4/3, 45/32, 3/2, 8/5, 5/3, 15/8, 9/5 ])},
  	// Scales contributed by Luke Taylor
  	// Half-Whole or Octatonic Scale
  	//http://en.wikipedia.org/wiki/Octatonic_scale
    
  	HalfWhole : function(root) { return Theory.CustomScale( root, [ 1,1.059463,1.189207,1.259921,1.414214,1.498307,1.681793, 1.781797 ]); },

  	//Whole-Half or Octatonic Scale http://en.wikipedia.org/wiki/Octatonic_scale
  	WholeHalf : function(root) { return Theory.CustomScale( root, [ 1,1.122462,1.189207,1.334840,1.414214,1.587401,1.681793, 1.887749 ]); },

  	//Pythagorean Tuning http://en.wikipedia.org/wiki/Pythagorean_tuning

  	//Chromatic scale in Pythagorean tuning
  	Pythagorean : function(root) { return Theory.CustomScale( root, [ 1, 256/243, 9/8, 32/27, 81/64, 4/3, 729/512, 3/2, 128/81, 27/16, 16/9, 243/128 ]); },

  	//Major Pythagorean
  	PythagoreanMajor : function(root) { return Theory.CustomScale( root, [ 1, 9/8, 81/64, 4/3, 3/2, 27/16, 243/128 ]); },

  	//Major Pythagorean
  	PythagoreanMinor : function(root) { return Theory.CustomScale( root, [ 1, 9/8, 32/27, 4/3, 3/2, 128/81, 16/9 ]); },
	
  	// 5-limit Just Intonation http://en.wikipedia.org/wiki/List_of_intervals_in_5-limit_just_intonation
  	//Chromatic scale in 5-limit just intonation
  	Limit5 : function(root) { return Theory.CustomScale( root, [ 1, 16/15, 9/8, 6/5, 5/4, 4/3, 45/32, 3/2, 8/5, 5/3, 9/5, 15/8 ]); },

  	//Major scale in 5-limit
  	Limit5Major : function(root) { return Theory.CustomScale( root, [ 1, 9/8, 5/4, 4/3, 3/2, 5/3, 15/8 ]); },

  	//Minor scale in 5-limit
  	Limit5Minor : function(root) { return Theory.CustomScale( root, [ 1, 9/8, 6/5, 4/3, 3/2, 8/5, 9/5 ]); },

  	// Messiaen's modes of limited transposition http://en.wikipedia.org/wiki/Modes_of_limited_transposition
  	Mess3 : function(root) { return Theory.CustomScale( root, [1,1.122462, 1.189207, 1.259921, 1.414214, 1.498307, 1.587401, 1.781797, 1.887749 ]) },
  	Mess4 : function(root) { return Theory.CustomScale( root, [1, 1.059463, 1.122462, 1.334840, 1.414214, 1.498307, 1.587401, 1.887749 ]) },
  	Mess5 : function(root) { return Theory.CustomScale( root, [1, 1.059463, 1.334840, 1.414214, 1.498307, 1.887749 ]) },
  	Mess6 : function(root) { return Theory.CustomScale( root, [1, 1.122462, 1.259921, 1.334840, 1.414214, 1.587401, 1.781797, 1.887749 ]) },
  	Mess7 : function(root) { return Theory.CustomScale( root, [1, 1.059463, 1.122462, 1.189207, 1.334840, 1.414214, 1.498307, 1.587401, 1.681793, 1.887749 ]) },

  	//And, a personal (anthony garcia) favorite synthetic mode, lydian flat 7:
  	Adams : function(root) { return Theory.CustomScale( root, [1, 1.122462, 1.259921, 1.414214, 1.498307, 1.681793, 1.781797 ]) },

  	//5 tone equal temperament //http://en.wikipedia.org/wiki/Equal_temperament#5_and_7_tone_temperaments_in_ethnomusicology
  	Equal5Tone : function(root) { return Theory.CustomScale( root, [ 1, 1.15, 1.32, 1.35, 1.52, 1.74 ]); },

  	//7 tone equal temperament
  	//http://en.wikipedia.org/wiki/Equal_temperament#5_and_7_tone_temperaments_in_ethnomusicology
  	Equal7Tone : function(root) { return Theory.CustomScale( root, [ 1, 1.1, 1.22, 1.35, 1.49, 1.64, 1.81 ]); },

  	Just : function(root) { return Theory.CustomScale( root, [ 1, 1.0417, 1.1250, 1.2000, 1.2500, 1.3333, 1.4063, 1.5, 1.6, 1.6667, 1.8, 1.8750] ); },
    
    Shruti: function(root) { return Theory.CustomScale( root, [1,256/243,16/15,10/9,9/8,32/27,6/5,5/4,81/64,4/3,27/20,45/32,729/512,3/2,128/81,8/5,5/3,27/16,16/9,9/5,15/8,243/128,2] ); },
  },
  
	chord : function( val, volume ) {
		this.notation = val;
			
		if( typeof this.notation === "string" ) {
			var _root = this.notation.slice( 0,1 ),
          _octave, 
          _quality;
          
			if( isNaN( this.notation.charAt( 1 ) ) ) { 	// if true, then there is a sharp or flat...
				_root += this.notation.charAt( 1 );	// ... so add it to the root name
				_octave = parseInt( this.notation.slice( 2,3 ) );
				_quality = this.notation.slice( 3 );
			}else{
				_octave = parseInt( this.notation.slice( 1, 2 ) );
				_quality = this.notation.slice( 2 );
			}
		
			var _chord = teoria.note( _root + _octave ).chord( _quality );
			for( var j = 0; j < _chord.notes.length; j++ ) {
				var n = _chord.notes[ j ];
				this.note( typeof note === 'number' ? note : n.fq() );
			}
    }else{
			for( var k = 0; k < this.notation.length; k++ ) {
				var _note = this.scale ? this.scale.notes[ this.notation[k] ] : this.notation[ k ],
            note

        switch( typeof _note ) {
          case 'number':
            note = _note
            break;
          case 'object':
            note = _note.fq()
            break;
          case 'string':
            note = Theory.Teoria.note( _note ).fq();
            break;
        }

        this.note( note )
			}
		}

		if( typeof arguments[ 1 ] !== "undefined" ) {
			this.amp = arguments[ 1 ];
		}
	
		return this;
	},

}

window.Scale = Gibber.Theory.Scale

})()