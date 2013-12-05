(function() {
  
"use strict"
var times = []

var Clock = Gibber.Clock = {
  seq : null, 
  bpm : null,
  maxMeasures: 20,
  metronome : null,
  currentBeat : 1,
  beatsPerMeasure : 4,
  codeToExecute : [],
  timeProperties : [ 'attack', 'decay', 'sustain', 'release', 'offset', 'time' ],
  phase : 0,
  
  callback : function() {
    Clock.currentBeat = Clock.currentBeat === Clock.beatsPerMeasure ? 1 : Clock.currentBeat + 1
    
    if( Clock.currentBeat === 1 && Clock.codeToExecute.length > 0) {
      
      for( var i = 0; i < Clock.codeToExecute.length; i++ ) {
				console.log ( "CODE TO EXECUTE", Clock.codeToExecute[i] )
        try {
					if( typeof Clock.codeToExecute[ i ].function === 'function' ) {
						Clock.codeToExecute[ i ].function()
					}else{
	          Gibber.run( Clock.codeToExecute[ i ].code, Clock.codeToExecute[ i ].pos, Clock.codeToExecute[ i ].code.cm )
					}
        }catch( e ) {
          console.error( "FAILED TO EXECUTE CODE:\n", Clock.codeToExecute[ i ].code )
        }
      }
      
      Clock.codeToExecute.length = 0
    }
    
    if( typeof Clock.metronome === 'object' ) {
      Clock.metronome.draw( Clock.currentBeat, Clock.beatsPerMeasure )
    }
    
    Clock.phase += beats( 1 )()
  },
  
  getTimeSinceStart : function() {
    return Clock.phase + Clock.seq.phase
  },
  
  init : function() {
    Gibberish.Time.clock = function() {
      $.extend( this, {
        properties: { rate: 1 },
        callback : function( rate ) {
          return rate
        }
      })
      this.init()
    }
    Gibberish.Time.clock.prototype = new Gibberish.ugen()

    var bpm = 120
    Object.defineProperty(this, 'bpm', {
      get: function() { return bpm },
      set: function(v) { bpm = v; Gibberish.Time.bpm = bpm }
    })
    
    this.seq = new Gibberish.Sequencer({
      values: [ this.callback ],
      durations:[ beats(1) ],
    }).start()
    
  },
  
  tap : function() {
    var time = Gibber.Clock.getTimeSinceStart()
    if( times[2] && time - times[2] > 88200 ) {
      times.length = 0
    }
    times.unshift( time )
  
    while( times.length > 3 ) times.pop()
  
    if( times.length === 3) {
    	var average = ((times[0] + times[1]) - times[2] * 2) / 3.,
          bps = 44100 / average,
          bpm = bps * 60
    
      Gibber.Clock.bpm = bpm
    }
  },
  
  start : function() {    
    
    this.seq = new Gibberish.Sequencer({
      values: [ this.callback ],
      durations:[ beats(1) ],
    }).start()
    
  },
  
  addMetronome: function( metronome ) {
    this.metronome = metronome
    this.metronome.init()
  },
  
  time : function(v) {
    var timeInSamples, beat;
    
    if( v < this.maxMeasures ) {
      beat = (44100 * 60) / this.bpm
      timeInSamples = v * (beat * 4)
    }else{
      timeInSamples = v
    }
    
    return timeInSamples
  },
  
  beats : function(val) {
    return function() { 
      var samplesPerBeat = Gibberish.context.sampleRate / ( Clock.bpm / 60 ) ;
      return samplesPerBeat * ( val * 4 );
    }
  }
  
}

})()
