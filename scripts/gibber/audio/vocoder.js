module.exports = function( Gibber ) {
  "use strict"
  
  var Vocoder = { Presets: {} },
      Gibberish = require( 'gibberish-dsp' ),
      $ = Gibber.dollar,
      Clock = require( './clock' )( Gibber ),
      curves = Gibber.outputCurves,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC,
      mappingProperties =  {
        amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',},
        pan: { min: -1, max: 1, output: LOGARITHMIC,timescale: 'audio',},
        out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },     
      }
      
  Vocoder.Vocoder = function( carrier, modulator, numBands, startFreq, endFreq, Q ) {
    var vocoder = new Gibberish.Vocoder( carrier, modulator, numBands, startFreq, endFreq, Q ).connect( Gibber.Master )
    
    vocoder.type = 'Gen'
    
    $.extend( true, vocoder, Gibber.Audio.ugenTemplate )
    
    vocoder.fx.ugen = vocoder
    
    return vocoder
  }
  
  Vocoder.Robot = function( _options ) {
    var carrier, modulator, options = _options || {}, robot
    
    robot = Gibber.Audio.Vocoder.Vocoder( null, null, options.numBands || 16 )
    
    robot.disconnect()
    
    if( isNaN( options.maxVoices ) ) { options.maxVoices = 1 }
    if( isNaN( options.resonance ) ) { options.resonance = 4 }
    if( isNaN( options.attack    ) ) { options.attack = ms(1) }
    if( isNaN( options.decay     ) ) { options.decay = measures(8) }
    if( isNaN( options.pulsewidth) ) { options.pulsewidth = .05 }  

    robot.carrier = Gibber.Audio.Synths.Synth2( options )
    robot.note = robot.carrier.note.bind( robot )
    robot._note = robot.carrier._note.bind( robot )
    robot.chord = robot.carrier.chord.bind( robot )
    //robot._note = robot.carrier._note.bind( robot )
    robot.carrier._
    
    // in case robot.say.seq is called before module is loaded...
    var storeSayValues, storeSayDurations, storeInit = false
    robot.say = function( values, durations ) {
      if( storeInit === false ) {
        storeSayValues = values
        storeSayDurations = durations
        storeInit = true
      }
    }
    
    function initRobot() {
      robot.modulator = Speak( options )
      robot.modulator._

      robot.say = robot.modulator.say.bind( robot )
      Gibber.defineSequencedProperty( robot, 'say' )
      
      if( storeInit ) {
        robot.say.values = storeSayValues
        robot.say.durations = storeSayDurations
      }
      
      robot.connect()
    }
    
    if( ! Gibber.Modules[ 'gibber/publications/SpeakLib' ] ) {
      Gibber.import( 'gibber/publications/SpeakLib' ).done( function(speak) {
        var clear = setInterval( function() {
          if( typeof Speak !== 'undefined' ) {
            initRobot()
            clearInterval( clear )
          } 
        }, 250 )
      })
    }else{
      initRobot()
    }

    Gibber.defineSequencedProperty( robot, 'say' )
    Gibber.defineSequencedProperty( robot, 'chord' )    
    Gibber.defineSequencedProperty( robot, 'note' )
    
    $.extend( true, robot, Gibber.Audio.ugenTemplate )
    
    Gibber.createProxyProperties( robot, mappingProperties )
    
    
    return robot
  }

  return Vocoder
}
      