  (function() {
  "use strict"
  
  Gibber.FX = {}
  
  // TODO: should this be completely moved into Gibberish? Is it useful inside there instead of just using Mul?
  Gibberish.Gain = function() {
  	Gibberish.extend(this, {
    	name: 'gain',
      type: 'effect',
    
      properties : {
        input  : 0,
        amount : 1, 
      },

      callback : function(input, amount) {
        if( isNaN(input) ) {
          input[0] *= amount
          input[1] *= amount
        }else{
          input *= amount
        }
    
        return input;
      }
    })
    .init()
    .processProperties(arguments);
  };
  Gibberish.Gain.prototype = Gibberish._effect;
  
  var types = [
    'Reverb',
    'Delay',
    'Flanger',
    'Vibrato',
    'Distortion',
    'Biquad',
    'Gain',
    'Filter24',    
    [ 'RingModulation', 'RingMod' ],
    [ 'BufferShuffler', 'Schizo' ],
    [ 'Decimator', 'Crush' ],
    'Tremolo',
  ],
  _mappingProperties = {
    Reverb: {
      roomSize: {
        min: .5, max: .995,
        output: Gibber.LINEAR,
        timescale: 'audio',
      },
      damping: {
        min: 0, max: 1,
        output: Gibber.LINEAR,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: Gibber.LINEAR, timescale: 'audio', dimensions:1 },
    },
    Delay : {
      feedback: {
        min: 0, max: 1,
        output: Gibber.LINEAR,
        timescale: 'audio',
      },
      time : {
        min: 50, max: 88200, // TODO: Fix... problem with loading order, should be : Gibberish.context.sampleRate * 2,
        output: Gibber.LINEAR,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: Gibber.LINEAR, timescale: 'audio', dimensions:1 },
    },
    RingMod : {
      frequency : {
        min: 20, max: 3000,
        output: Gibber.LINEAR,
        timescale: 'audio',
      },
      amp: {
        min: 0, max: 1,
        output: Gibber.LINEAR,
        timescale: 'audio',
      },
      mix: {
        min: 0, max: 1,
        output: Gibber.LINEAR,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: Gibber.LINEAR, timescale: 'audio', dimensions:1 },
    },
    Flanger : {
      rate : {
        min: .01, max: 20,
        output: Gibber.LOGARITHMIC,
        timescale: 'audio',
      },
      feedback: {
        min: 0, max: .99,
        output: Gibber.LINEAR,
        timescale: 'audio',
      },
      amount: {
        min: 25, max: 300,
        output: Gibber.LINEAR,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: Gibber.LINEAR, timescale: 'audio', dimensions:1 },
    },
    Gain : {
      amount: {
        min: 0, max: 1,
        output: Gibber.LINEAR,
        timescale: 'audio',
      },
    },
    Vibrato : {
      rate : {
        min: .2, max: 8,
        output: Gibber.LOGARITHMIC,
        timescale: 'audio',
      },
      amount: {
        min: 25, max: 300,
        output: Gibber.LINEAR,
        timescale: 'audio',
      },
      feedback: {
        min: .45, max: .55,
        output: Gibber.LINEAR,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: Gibber.LINEAR, timescale: 'audio', dimensions:1 },
    },
    Filter24 : {
      cutoff : {
        min: 0, max: .7,
        output: Gibber.LINEAR,
        timescale: 'audio',
      },
      resonance: {
        min: 0, max: 5.5,
        output: Gibber.LINEAR,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: Gibber.LINEAR, timescale: 'audio', dimensions:1 },
    },
    LPF : {
      cutoff : {
        min: 0.05, max: .7,
        output: Gibber.LINEAR,
        timescale: 'audio',
      },
      resonance: {
        min: 0, max: 5.5,
        output: Gibber.LINEAR,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: Gibber.LINEAR, timescale: 'audio', dimensions:1 },
    },
    HPF : {
      cutoff : {
        min: 0, max: .7,
        output: Gibber.LINEAR,
        timescale: 'audio',
      },
      resonance: {
        min: 0, max: 5.5,
        output: Gibber.LINEAR,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: Gibber.LINEAR, timescale: 'audio', dimensions:1 },
    },
    Crush : {
      bitDepth : {
        min: 1, max: 16,
        output: Gibber.LINEAR,
        timescale: 'audio',
      },
      sampleRate: {
        min: 0, max: 1,
        output: Gibber.LINEAR,
        timescale: 'audio',
      },
      amp: {
        min: 0, max: 1,
        output: Gibber.LOGARITHMIC,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: Gibber.LINEAR, timescale: 'audio', dimensions:1 },
    },
    Schizo: {
      amp: {
        min: 0, max: 1,
        output: Gibber.LOGARITHMIC,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: Gibber.LINEAR, timescale: 'audio', dimensions:1 },
    },
    Tremolo: {
      amp: {
        min: 0, max: 1,
        output: Gibber.LOGARITHMIC,
        timescale: 'audio',
      },
      frequency : {
        min: .05, max: 20,
        output: Gibber.LOGARITHMIC,
        timescale: 'audio',
      },
      out: { min: 0, max: 1, output: Gibber.LINEAR, timescale: 'audio', dimensions:1 },
    }
  };
  
  for( var i = 0; i < types.length; i++ ) {
  
    (function() {
      var type = Array.isArray( types[ i ] ) ? types[ i ][ 0 ] : types[ i ],
          name = Array.isArray( types[ i ] ) ? types[ i ][ 1 ] : types[ i ]
     
      Gibber.FX[ name ] = function() {
        var args = Array.prototype.slice.call(arguments, 0),
            obj
            
        obj = new Gibberish[ type ]()
        obj.type = 'FX'
        obj.name = name
      
        $.extend( true, obj, Gibber.ugen )
        
        Gibber.createProxyProperties( obj, _mappingProperties[ name ] ) 
        
        Gibber.processArguments2( obj, args, obj.name )
        
        args.input = 0
        
        console.log( name + ' is created.' )
        return obj
      }
    })()
  }
  
  Gibber.FX.Chorus = function( rate, feedback, amount ) {
  	var _rate = rate || 1, 
    	  _amount = amount || ms( 1 ),
        _feedback = feedback || 0,
    	  that = Flanger( _rate, _feedback, _amount, ms( 1 ) * 30 )
      
  	that.name = 'Chorus'
    that.type = 'FX'
    
  	return that
  }
  
  Gibber.FX.LPF = function( cutoff, resonance ) {
    var _cutoff = isNaN(cutoff) ? .2 : cutoff,
        _resonance = isNaN( resonance ) ? 3.5 : resonance, 
        that = Filter24( _cutoff, _resonance, true )
    
  	that.name = 'LPF'
    that.type = 'FX'
    
  	return that
  }
  
  Gibber.FX.HPF = function( cutoff, resonance ) {
  	var _cutoff = isNaN( cutoff ) ? .25 : cutoff,
        _resonance = isNaN( resonance ) ? 3.5 : resonance, 
        that = Filter24( _cutoff, _resonance, true )
    
    that.isLowPass = false
  	that.name = 'HPF'
    that.type = 'FX'
    
  	return that
  }
  
  Gibber.Presets.Schizo = {
		sane: {
			chance: .1,
			reverseChance: 0,
			pitchChance: .5,
			mix:.5,
		},
		borderline: {
			chance: .1,		
			pitchChance: .25,
			reverseChance: .5,
			mix: 1,
		},
		paranoid: {
			chance: .2,
			reverseChance: .5,
			pitchChance: .5,
			mix: 1,
		},
	};
  
  Gibber.Presets.Reverb = {
  	space : {
  		roomSize: .99,
  		damping: .23,
  		wet: .75,
  		dry: .25,
  	},
    small : {
      roomSize: .6,
      damping: .75,
      wet: .15,
      dry: .85,
    },
    medium: {
      roomSize: .8,
      damping: .5,
      wet: .35,
      dry: .65,
    },
    large: {
      roomSize: .85,
      damping: .3,
      wet: .55,
      dry: .45,
    }
  }
})()
