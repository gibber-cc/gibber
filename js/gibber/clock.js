(function() {
  
"use strict"

var Clock = Gibber.Clock = {
  seq : null, 
  bpm : null,
  maxMeasures: 20,
  metronome : null,
  currentBeat : 1,
  beatsPerMeasure : 4,
  codeToExecute : [],
  timeProperties : [ 'attack', 'decay', 'sustain', 'release', 'offset', 'time' ],
  
  callback : function() {
    Clock.currentBeat = Clock.currentBeat === Clock.beatsPerMeasure ? 1 : Clock.currentBeat + 1
    
    if( Clock.currentBeat === 1 && Clock.codeToExecute.length > 0) {
      
      for( var i = 0; i < Clock.codeToExecute.length; i++ ) {
        Gibber.run( Clock.codeToExecute[ i ].code, Clock.codeToExecute[ i ].pos, Clock.codeToExecute[ i ].code.cm )
      }
      
      Clock.codeToExecute.length = 0
    }
    
    if( typeof Clock.metronome === 'object' ) {
      Clock.metronome.draw( Clock.currentBeat, Clock.beatsPerMeasure )
    }
  },
  
  init : function() {
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

//Gibberish.Time.export( Clock )

})()