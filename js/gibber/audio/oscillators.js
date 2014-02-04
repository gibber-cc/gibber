(function() { 
  "use strict"
  
  Gibber.Oscillators = {}
  
  var types = [
    'Sine',
    'Triangle',
    'Saw',
    'Square',
    'Noise',
    'PWM',
    'Sampler',
  ],
  mappingProperties = {
    frequency: {
      min: 50, max: 3200,
      output: Gibber.LINEAR,
      timescale: 'audio',
    },
    amp: {
      min: 0, max: 1,
      output: Gibber.LOGARITHMIC,
      timescale: 'audio',
    },
    // pulsewidth :{
    //   min: 0.01, max: .99,
    //   output: Gibber.LINEAR,
    //   timescale: 'audio',
    // },
    // pitch: {
    //   min: 1, max: 4,
    //   output: Gibber.LOGARITHMIC,
    //   timescale: 'audio',
    // },
  }
  
  for( var i = 0; i < types.length; i++ ) {
    (function() {
      var type = types[ i ]

      Gibber.Oscillators[ type ] = function() {
        var oscillator = new Gibberish[ type ]().connect( Gibber.Master ),
            args = Array.prototype.slice.call( arguments, 0 )
           
        oscillator.type = 'Gen'

        $.extend( true, oscillator, Gibber.ugen )

        oscillator.fx.ugen = oscillator
        
        Object.defineProperty(oscillator, '_', {
          get: function() { 
            oscillator.kill(); 
            return oscillator 
          },
          set: function() {}
        })
        
        oscillator.note = function( pitch ) {
          var freq = this.frequency()
          if( typeof freq === 'function' ) {
            this.frequency = pitch
          }else{
            freq[ 0 ] = pitch
          }
        }
        
        Gibber.createProxyProperties( oscillator, mappingProperties )
        
        Gibber.createProxyMethods( oscillator, ['note'] )
        
        Gibber.processArguments2( oscillator, args, type )
        
        console.log( type + ' is created.', oscillator )
        return oscillator
      }
    })()
  }
  
  $script.ready('gibber', function() {
    Gibberish.Sampler.prototype.record = function(input, recordLength) {
      this.isRecording = true;
      console.log( 'starting recording' )
      var self = this;
  
      this.recorder = new Gibberish.Record(input, Gibber.Clock.time( recordLength ), function() {
        console.log( 'recording finished' )
        self.setBuffer( this.getBuffer() );
        self.length = self.end = self.getBuffer().length;
        self.setPhase( self.length )
        self.isRecording = false;
      })
      .record();
  
      return this;
    };
  })
  
  Gibber.Oscillators.Grains = function() {
    var props = typeof arguments[0] === 'object' ? arguments[0] : arguments[1],
        bufferLength = props.bufferLength || 88200,
        a = Sampler().record( props.input, bufferLength ),
        oscillator
  
    if(typeof arguments[0] === 'string') {
      var preset = Gibber.Presets.Grains[ arguments[0] ]
      if( typeof props !== 'undefined') $.extend( preset, props )
      oscillator = new Gibberish.Granulator( preset )
    }else{
      oscillator = new Gibberish.Granulator( props )
    }
  
    oscillator.loop = function(min, max, time, shouldLoop) {
      var curPos = this.position
  		min = isNaN(min) ? .25 : min;
  		max = isNaN(max) ? .75 : max;
  		time = isNaN(time) ? Gibber.Clock.time( 1 ) : Gibber.Clock.time( time );
	
  		shouldLoop = typeof shouldLoop === "undefined" ? true : shouldLoop;
    
      this.position = new Gibberish.Line( min, max, time, shouldLoop )
  
  		var mappingObject = this;
  		if(shouldLoop === false) {
  			future( function() { mappingObject.position = curPos }, Gibber.Clock.time( time ) );
  		}
  	}

    future( function() {
  	  oscillator.setBuffer( a.getBuffer() );
      oscillator.connect()
  	  oscillator.loop( 0, 1, bufferLength ); // min looping automatically
    
      a.disconnect()
    }, bufferLength + 1)
    
    oscillator.type = 'Gen'

    $.extend( true, oscillator, Gibber.ugen )

    oscillator.fx.ugen = oscillator

    Object.defineProperty(oscillator, '_', {
      get: function() { 
        oscillator.disconnect(); 
        return oscillator 
      },
      set: function() {}
    })
    
    console.log( 'Grains is created.' )
    return oscillator
  }
  
  Gibber.Presets.Grains = {
  	tight : {
  		numberOfGrains : 10,
  		grainSize : 44 * 25,
  		positionMin : -.05,
      positionMax : .05,
      speedMin : -.1,
      speedMax : .1,
  		shouldReverse : false,
  	},
  	cloudy : {
  		numberOfGrains : 20,
  		positionMin : -.25,
      positionMax : .25,
      speedMin : -.1,
      speedMax : 4,
  		grainSize : 44 * 100,
  		shouldReverse : true,
  	},
    flurry : {
      speed:2,
      speedMin:-2,
      speedMax:2,
      position:0,
      positionMin:0,
      positionMax:0,
      numberOfGrains:20,
      grainSize : 44 * 25,
    },  
  }
})()


