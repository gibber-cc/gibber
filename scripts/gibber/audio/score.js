/*
Score is a Seq(ish) object, with pause, start / stop, rewind, fast-forward.
It's internal phase is 

Score has start() method to start it running. next() advances to next element,
regardless of whether or not the score is running, and stats the transport running.
rewind() moves the score index to the first position.
*/

/*
Passed Timing           Result
=============           ======
Numeric literal         place function in timeline and store reference
a Function              callback. register to receive and advance. must use pub/sub.
Score.wait             pause until next() method is called
*/

module.exports = function( Gibber ) {

"use strict"

var Gibberish = require( 'gibberish-dsp' )

var ScoreProto = {
  start: function() { 
    if( !this.codeblock ) {
      this.connect()
    }
    this.isPaused = false
  
    return this
  },
  stop:  function() { 
    this.isPaused = true  
    return this
  },
  
  loop: function( loopPause ) {
    this.loopPause = loopPause || 0
    this.shouldLoop = !this.shouldLoop
    
    return this
  },
  
  pause: function() {
    this.isPaused = true
    
    return this
  },
  
  next: function() {
    if( !this.codeblock ) {
      this.connect()
    }
    this.isPaused = false
    
    return this
  },
}

var proto = new Gibberish.ugen()

$.extend( proto, ScoreProto )

var Score = function( data, opts ) {
  if( ! ( this instanceof Score ) ) {
    var args = Array.prototype.slice.call( arguments, 0 )
    return Gibber.construct( Score, args )
  }
  
  if( typeof opts === 'undefined' ) opts = {}
  
  this.timeline = []
  this.schedule = []
  this.shouldLoop = false
  this.loopPause = 0
  
  for( var i = 0; i < data.length; i+=2 ) {
    this.schedule.push( data[ i ] )
    this.timeline.push( data[ i+1 ] )    
  }
  
  var phase = 0, 
      index = 0,
      timeline = this.timeline,
      schedule = this.schedule,
      self = this,
      loopPauseFnc = function() {
        self.nextTime = phase = 0
        index = -1
        self.timeline.pop()
      }
      
  $.extend( this, {
    properties: { rate: 1, isPaused:true, nextTime:0  },
    name:'score',
    getIndex: function() { return index },
    callback : function( rate, isPaused, nextTime ) {
      if( !isPaused ) {
        if( phase >= nextTime && index < timeline.length ) {
          
          var fnc = timeline[ index ],
              shouldExecute = true
                    
          index++
          
          if( index <= timeline.length - 1 ) {
            var time = schedule[ index ]
            
            if( typeof time === 'number' && time !== Score.wait ) {
              self.nextTime = phase + time
            }else{
              if( time === Score.wait ) {
                self.isPaused = true
              }else if( time.owner instanceof Score ) {
                self.isPaused = true
                time.owner.oncomplete.listeners.push( self )
                // shouldExecute = false // doesn't do what I think it should do... 
              }
            }
          }else{
            if( self.shouldLoop ) {
              if( timeline[ timeline.length - 1 ] !== loopPauseFnc ) {
                timeline.push( loopPauseFnc )
              }
              self.nextTime = phase + self.loopPause
            }else{
              self.isPaused = true
            }
            self.oncomplete()
          }
          if( shouldExecute && fnc ) {
            if( fnc instanceof Score ) {
              if( !fnc.codeblock ) {
                fnc.start()
              }else{
                fnc.rewind().next()
              }
            }else{
              fnc()
            }
          }
        }
        phase += rate
      }
      return 0
    },
    rewind : function() { 
      phase = index = 0 
      this.nextTime = this.schedule[ 0 ]
      return this
    },
    oncomplete: function() {
      // console.log("ON COMPLETE", this.oncomplete.listeners )
      var listeners = this.oncomplete.listeners
      for( var i = listeners.length - 1; i >= 0; i-- ) {
        var listener = listeners[i]
        if( listener instanceof Score ) {
          listener.next()
        }
      }
    }
  })
  
  this.oncomplete.listeners = []
  this.oncomplete.owner = this
  
  this.init()
  
  this.nextTime = this.schedule[ 0 ]
  
  var _rate = this.rate,
      oldRate  = this.__lookupSetter__( 'rate' )
   
  Object.defineProperty( this, 'rate', {
    get : function() { return _rate },
    set : function(v) {
      _rate = Mul( Gibber.Clock, v )
      oldRate.call( this, _rate )
    }
  })
  
  this.rate = this.rate // trigger meta-programming tie to master clock
  
  Gibber.createProxyProperties( this, {
    rate : { min: .1, max: 2, output: 0, timescale: 'audio' },
  })
}

Score.wait = -987654321
Score.combine = function() {
  var score = [ 0, arguments[ 0 ] ]
  
  for( var i = 1; i < arguments.length; i++ ) {
    var timeIndex = i * 2,
        valueIndex = timeIndex +  1,
        previousValueIndex = timeIndex - 1

    score[ timeIndex  ] = score[ previousValueIndex ].oncomplete
    score[ valueIndex ] = arguments[ i ]
  }
  
  return Score( score )
}

Score.prototype = proto

return Score

}

/*
a = Score([
  0, console.log.bind( null, 'test1'),
  seconds(.5),console.log.bind( null, 'test2'),
  Score.wait, null,
  seconds(.5),console.log.bind( null, 'test3'),
  seconds(.5),console.log.bind( null, 'test4'),
  seconds(.5),function() { a.rewind(); a.next() }
])

b = Score([
  100, console.log.bind(null,"B"),
  100, console.log.bind(null,"F"),  
  a.oncomplete, function() {
  	console.log("C")
  }
])
.start()

a.start()

-----
a = Score([
  0, console.log.bind( null, 'test1'),
  seconds(.5),console.log.bind( null, 'test2'),
  
  Score.wait, null,
  
  seconds(.5),console.log.bind( null, 'test3'),
  
  seconds(.5), Score([
    0, console.log.bind(null,"A"),
    beats(2), console.log.bind(null,"B")
  ]),
  
  Score.wait, null,
  
  seconds(.5),function() { a.rewind(); a.next() }
]).start()

-----
synth = Synth('bleep')
synth2 = Synth('bleep', {maxVoices:4})

// you need to uncomment the line below after the kick drum comes in
// and execute it

score.next()

score = Score([
  0, synth.note.score( 'c4', 1/4 ),
  
  measures(1), synth.note.score( ['c4','c5'], 1/8 ),
  
  measures(1), synth.note.score( ['c2','c3','c4','c5'], 1/16 ),
  
  measures(1), function() {
    kick = Kick().note.seq( 55,1/4 )
  },
  
  Score.wait, null,
  
  0, synth2.note.score('bb4',1/4 ),
  
  measures(1), synth2.chord.score( [['bb4','g4']], 1/4 ),
  
  measures(2), synth2.chord.score( [['c5','f4']], 1/4 ),
  
  measures(2), function() {
    synth2.chord.seq( [['eb4','bb4','d5']], 1/6 )
    synth2.note.seq.stop()
    synth2.fx.add( Delay(1/9,.35) )
    
    synth2.fadeOut(32)
  },
  
  measures(4), function() {
    ks = Pluck()
    	.note.seq( Rndi(100,600), 1/16 )
    	.blend.seq( Rndf() )
    	.fx.add( Schizo('paranoid') )
    
    Clock.rate = Line( 1, 1.1, 8 )
  },
  
  measures(8), function() {
		Master.fadeOut( 8 )
  },
  
  measures(8), Gibber.clear
  
]).start()

------

synth = Synth('bleep')

verse =  Score([ beats(1/2), synth.note.bind( synth, 'c4' ) ])
chorus = Score([ beats(1/2), synth.note.bind( synth, 'd4' ) ])
bridge = Score([ beats(1/2), synth.note.bind( synth, 'e4' ) ])

song = Score([
  0,                 verse,
  verse.oncomplete,  chorus,
  chorus.oncomplete, verse,
  verse.oncomplete,  chorus,
  chorus.oncomplete, bridge,
  bridge.oncomplete, chorus  
])

song.start()

*/