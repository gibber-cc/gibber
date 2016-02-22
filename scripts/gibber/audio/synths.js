module.exports = function( Gibber ) {
  "use strict"
  
  function isInt(value) { return !isNaN(value) && (function(x) { return (x | 0) === x; })(parseFloat(value)) }
  
  var Synths = { Presets: {} },
      Gibberish = require( 'gibberish-dsp' ),
      $ = Gibber.dollar,
      Clock = require( './clock' )( Gibber ),
      curves = Gibber.outputCurves,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC

  var types = [
    [ 'PolySynth', 'Synth' ],
    [ 'PolyFM', 'FM' ],
    [ 'PolySynth2', 'Synth2' ],
    [ 'MonoSynth', 'Mono' ],
    [ 'PolyKarplusStrong', 'Pluck' ],
  ],
  _mappingProperties = {
    Synth: {
      note: { min: 50, max: 3200, output: LOGARITHMIC, timescale: 'audio', doNotProxy:true },
      frequency: { min: 50, max: 3200, output: LOGARITHMIC, timescale: 'audio' },
      amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',},
      pulsewidth :{ min: 0.01, max: .99, output: LINEAR, timescale: 'audio', perNote:true },
      attack: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio', perNote:true},
      decay: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio', perNote:true},
      sustain: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio', perNote:true},
      release: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio', perNote:true},
      pan: { min: -1, max: 1, output: LOGARITHMIC,timescale: 'audio', perNote:true,},
      sustainLevel: { min:.01, max: 1, output: LOGARITHMIC, timescale:'audio', perNote:true},
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },   
    },
    Synth2: {
      note: { min: 50, max: 3200, output: LOGARITHMIC, timescale: 'audio', doNotProxy:true },
      frequency: { min: 50, max: 3200, output: LINEAR, timescale: 'audio' },
      amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',},
      pulsewidth :{ min: 0.01, max: .99, output: LINEAR, timescale: 'audio', perNote:true },
      attack: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio', perNote:true},
      decay: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio', perNote:true},
      sustain: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio', perNote:true},
      release: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio', perNote:true},
      sustainLevel: { min:.01, max: 1, output: LOGARITHMIC, timescale:'audio', perNote:true},
      cutoff : { min: 0, max: .7, output: LINEAR, timescale: 'audio', perNote:true },
      resonance: { min: 0, max: 5.5, output: LINEAR, timescale: 'audio', perNote:true },
      pan: { min: -1, max: 1, output: LOGARITHMIC,timescale: 'audio', perNote:true,},
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },                
    },
    Mono: {
      note: { min: 50, max: 3200, output: LOGARITHMIC, timescale: 'audio', doNotProxy:true },
      frequency: { min: 50, max: 3200, output: LINEAR, timescale: 'audio' },
      amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',},
      pulsewidth :{ min: 0.01, max: .99, output: LINEAR, timescale: 'audio' },
      attack: { min:Clock.maxMeasures + 1, max: 176400, output: LOGARITHMIC, timescale:'audio'},
      decay: { min:Clock.maxMeasures + 1, max: 176400, output: LOGARITHMIC, timescale:'audio'},
      cutoff : { min: 0, max: .7, output: LINEAR, timescale: 'audio' },
      detune2: { min: 0, max: .15, output: LINEAR, timescale: 'audio' },
      detune3: { min: 0, max: .15, output: LINEAR, timescale: 'audio' },
      glide: { min:.99, max:.999995, output: LINEAR, timescale: 'audio'},
      resonance: { min: 0, max: 5.5, output: LINEAR, timescale: 'audio' },
      pan: { min: -1, max: 1, output: LOGARITHMIC,timescale: 'audio',},
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },
    },
    FM: {
      note: { min: 50, max: 3200, output: LOGARITHMIC, timescale: 'audio', doNotProxy:true },
      frequency: { min: 50, max: 3200, output: LINEAR, timescale: 'audio' },
      amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',},
      attack: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio', perNote:true},
      decay: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio', perNote:true},
      sustain: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio', perNote:true},
      release: { min:Clock.maxMeasures + 1, max: 176400, output: LINEAR, timescale:'audio', perNote:true},
      sustainLevel: { min:.01, max: 1, output: LOGARITHMIC, timescale:'audio', perNote:true},  
      cmRatio : { min:.1, max:50, output:LINEAR, timescale:'audio', perNote:true },
      index: { min:.1, max:50, output:LINEAR, timescale:'audio', perNote:true },
      pan: { min: -1, max: 1, output: LOGARITHMIC,timescale: 'audio', perNote:true,},
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },     
    },
    Pluck: {
      note: { min: 50, max: 3200, output: LOGARITHMIC, timescale: 'audio', doNotProxy:true },    
      frequency: { min: 50, max: 3200, output: LINEAR, timescale: 'audio' },
      amp: { min: 0, max: 1, output: LOGARITHMIC,timescale: 'audio',},
      blend :{ min: 0, max: 1, output: LINEAR, timescale: 'audio', perNote:true },
      damping :{ min: 0, max: 1, output: LINEAR, timescale: 'audio', perNote:true },
      pan: { min: -1, max: 1, output: LOGARITHMIC,timescale: 'audio', perNote:true,},
      out: { min: 0, max: 1, output: LINEAR, timescale: 'audio', dimensions:1 },     
    }
  }

  for( var i = 0; i < types.length; i++ ) {
  
    (function() {
      var type = Array.isArray( types[ i ] ) ? types[ i ][ 0 ] : types[ i ],
          name = Array.isArray( types[ i ] ) ? types[ i ][ 1 ] : types[ i ]

      Synths[ name ] = function() {
        var args = Array.prototype.slice.call( arguments, 0 ),
            obj,
            mv = 1,
            adsr = false,
            scale,
            requireReleaseTrigger = false,
            opts = {},
            optionsNum = typeof args[0] === 'string' ? 1 : 0
        
        Gibber.processArguments2( opts, args, name )
        
        for( var key in opts ) {
          if( Gibber.Audio.Clock.timeProperties.indexOf( key ) > -1 ) {
            opts[ key ] = Gibber.Clock.time( opts[key] )
          }
        }
        
        obj = new Gibberish[ type ]( opts ).connect( Gibber.Master )
        obj.type = 'Gen'
        
        $.extend( true, obj, Gibber.Audio.ugenTemplate )

        obj.fx.ugen = obj
        
        //Gibber.processArguments2( obj, args, name )        
        
        if( name === 'Vocoder' ) return obj
        
        if( name === 'Mono' ) {
          obj.note = function( _frequency, amp ) {
            if( typeof _frequency === 'undefined' ) return // rest
            if(typeof amp !== 'undefined' && amp !== 0) this.amp = amp;
              
            if( amp !== 0 ) {
              if(typeof this.frequency !== 'object' ){
                this.frequency = _frequency;
              }else{
                if( this.frequency.type !== 'property' ) {
                  this.frequency[0] = _frequency;
                  Gibberish.dirty(this);
                }else{
                  this.frequency = _frequency
                }
              }
              
              this.lastFrequency = this.frequency
              
              if( obj.envelope.getState() > 0 ) obj.envelope.run();
            }
          }
        }
        // override note method to allow note names
        obj._note = obj.note.bind( obj )
        obj.note = function() {
          var args = Array.prototype.slice.call( arguments, 0 ),
              freq
          
          if( typeof args[0] === 'undefined' ) return
          
          if( Array.isArray( args[0] ) ) {
            freq = args[0][0]
            freq = Gibber.Theory.processFrequency( obj, freq )
            args[0][0] = freq
          }else{
            args[0] = Gibber.Theory.processFrequency( obj, args[0] )
          }

          if( typeof args[1] === 'undefined' ) args[1] = this.loudness.value
          
          this._note.apply( this, args )
          this.processChildProperties()

          return this 
        }
        
        var propertyKeys = Object.keys( _mappingProperties[ name ] ), voiceIncr = 0
        obj.processChildProperties = function() {
          for( var i = 0; i < propertyKeys.length; i++ ) {
            var key = propertyKeys[ i ], name = key +'V', val
            if( this[ name ] && typeof this[ name ].value !== 'undefined' ) {
              if( Array.isArray( this[ name ].value ) ) {
                var propIndex = voiceIncr % this[ name ].value.length
                val = this[ name ].value[ propIndex ]
              }else if( typeof this[ name ].value === 'function' ) {
                val = this[ name ].value()   
              }else{
                val = this[ name ].value
              }

              this.children[ this.lastChild ][ key ] = val
            }
          }
          voiceIncr++
        }
        
        obj.chord = Gibber.Theory.chord.bind( obj )
      
        Object.defineProperty(obj, '_', {
          get: function() { obj.kill(); return obj },
          set: function() {}
        })
        
        //obj, _key, shouldSeq, shouldRamp, dict, _useMappings, priority
        Gibber.createProxyProperties( obj, _mappingProperties[ name ] )
        Gibber.defineProperty( obj, 'loudness', true, true, { min: 0, max: 1, output: LOGARITHMIC, timescale: 'audio'}, true, true )
        
        obj.trig = function() {
          this.note( this.lastFrequency )
        }
        
        Gibber.createProxyMethods( obj, [ 'note', 'chord', 'send', 'trig' ] )
                
        obj.name = name 
        

        //console.log( "PROCESS", args, _mappingProperties[ name ] )
        
        //Gibber.processArguments2( obj, args, obj.name )
        
        obj.toString = function() { return name }
        
        // define a continuous frequency mapping abstraction for all synths with children
        if( name !== 'Mono' ) {
          var __frequency = obj._frequency
          Object.defineProperty( obj, 'frequency', {
            configurable: true,
            get: function() { return this._frequency },
            set: function(v) { 
               __frequency = v;
               if( this.children ) {
                 for( var i = 0; i < this.children.length; i++ ) {
                   if( typeof this.children[i].frequency === 'number' ) {
                     this.children[i].frequency = __frequency
                   }else{
                     this.children[i].frequency[0] = __frequency // for binops
                   }
                 }
               }
            }
          })
        }
         
        var __scale = obj.scale;
        
        if( obj.scale ) obj.seq.scale = __scale
        
        Object.defineProperty(obj, 'scale', {
          get: function() { return __scale },
          set: function(v) {
            __scale = v;
            obj.seq.scale = __scale
          }
        })
        
        if( obj.presetInit ) obj.presetInit() 
        return obj
      }
    })()
  
  }
  
  Synths.Presets.Synth = {
  	short:  { attack: 44, decay: 1/16, },
  	bleep:  { waveform:'Sine', attack:44, decay:1/16 },
    bleepEcho: { waveform:'Sine', attack:44, decay:1/16, presetInit:function() { this.fx.add( Delay(1/6,.85 ) ) } },
    cascade: { waveform:'Sine', maxVoices:10, attack:Clock.maxMeasures, decay:Clock.beats(1/32),
      presetInit: function() { 
        this.fx.add( Gibber.Audio.FX.Delay(1/9,.2), Gibber.Audio.FX.Flanger() )
        this.pan = Sine( .25, 1 )._
      }
    },
    rhodes: { waveform:'Sine', maxVoices:4, attack:44, decay:1, 
      presetInit: function() { this.fx.add( Gibber.Audio.FX.Tremolo(2, .2) ) },
    },
    calvin: { waveform:'PWM',  maxVoices:4, amp:.075, attack:Clock.maxMeasures, decay:1/4,
      presetInit: function() { this.fx.add( Gibber.Audio.FX.Delay(1/6,.5), Gibber.Audio.FX.Vibrato() ) }  
    },
    warble: { waveform:'Sine', attack:Clock.maxMeasures,
      presetInit: function() { this.fx.add( Gibber.Audio.FX.Vibrato(2), Gibber.Audio.FX.Delay( 1/6, .75 ) ) } 
    },
  }
  
  Synths.Presets.Synth2 = {
    pad2: { waveform:'Saw', maxVoices:4, attack:1.5, decay:1/2, cutoff:.3, filterMult:.35, resonance:4.5, amp:.2, 
      presetInit: function() { this.fx.add( Gibber.Audio.FX.Delay( 1/9, .75 ) ) } 
    },
    pad4: { waveform:'Saw', maxVoices:4, attack:2, decay:2, cutoff:.3, filterMult:.35, resonance:4.5, amp:.2,
      presetInit: function() { this.fx.add( Gibber.Audio.FX.Delay( 1/9, .75 ) ) }
    },     
  }
  
  Synths.Presets.Mono = {
  	short : { attack: 44, decay: 1/16 },
  
  	lead : {
  		presetInit : function() { this.fx.add( Gibber.Audio.FX.Delay(1/4, .35), Gibber.Audio.FX.Reverb() ) },
  		attack: 1/8,
  		decay:1/2,
  		octave3:0,
  		cutoff:.2,
  		filterMult:.5,
  		resonance:5,
  		isLowPass: false,
  	},

  	winsome : {
  		presetInit : function() { 
        this.lfo = Gibber.Audio.Oscillators.Sine( 2, .075 )._
        this.cutoff = this.lfo
        this.detune2 = this.lfo
      },
  		attack: Clock.maxMeasures,
  		decay:1,
  		cutoff:.2,
  	},
  	bass : { 
      attack: Clock.maxMeasures,
  		decay:	1/8 - Clock.maxMeasures,
      octave: -2,
  		octave2 : -1,
  		cutoff: .5,
  		filterMult:.2,
  		resonance:1,
  	},
    bass2 : {
      attack: Clock.maxMeasures,
  		decay:	1/6,
      octave: -2,
  		octave2 : 0,
  		octave3 : 0,      
  		cutoff: .5,
  		filterMult:.2,
  		resonance:1,
      amp:.65
    },
    
    edgy: {
      presetInit: function() {
        this.decay = 1/8
        this.attack = ms(1)
      },
      octave: -2,
  		octave2 : -1,
  		cutoff: .5,
  		filterMult:.2,
      resonance:1, 
      waveform:'PWM', 
      pulsewidth:.2,
      detune2:0,
      amp:.2,
    },
  
  	easy : {
  		attack: Clock.maxMeasures,
  		decay:2,
  		octave2:0,
  		octave3:0,
  		cutoff:.3,
      glide:.9995,
  	},
    
  	easyfx : {
  		attack: Clock.maxMeasures,
  		decay:2,
      presetInit: function() {
        this.fx.add( Gibber.Audio.FX.Delay( Clock.time(1/6), .3) )
      },
      amp:.3,
  		octave2:0,
  		octave3:0,
  		cutoff:.3,
      glide:.9995,
  	},
  
    dark : {
      resonance:0,
      attack:44,
      cutoff:.075,
      amp:.35,
      filterMult:0
    },

    dark2 : {
      filterMult:.1,
      attack: Clock.maxMeasures,
      octave2:0,
      octave3:0,
      decay:1/4,
      amp:.45,
    },
    
    noise: {
      resonance:20,
      decay:1/2,
      cutoff:.3,
      glide:.99995,
      detune3:0,
      detune2:0,
      filterMult:0,
      presetInit: function() { this.fx.add( Gibber.Audio.FX.Gain(.1), Gibber.Audio.FX.Delay(1/6,.35) ) }
    },
  }
  
  Synths.Presets.FM = {
    stabs:{
      maxVoices:4,
			cmRatio : 1 / 1.0007,
			index	: 5,
			attack: Clock.maxMeasures,
			decay	: 1/8,
      amp:.1,
      presetInit: function() {
        this.bus = Gibber.Audio.Busses.Bus().fx.add( Gibber.Audio.FX.Delay(1/8,.75), Gibber.Audio.FX.LPF({ resonance:4 }) )
        this.bus.fx[1].cutoff = Gibber.Audio.Core.Binops.Add(.25, Gibber.Audio.Oscillators.Sine(.1,.2)._ )
        this.send( this.bus, .65 )
      },
    },
    bass : {
      cmRatio:1,
      index:3,
      presetInit: function() { this.attack = ms(1); },
      decay:1/16,
      octave:-2
    },
		glockenspiel : {
			cmRatio	: 3.5307,
			index 	: 1,
			attack	: 44,
			decay	: 44100,
		},
		radio : { //ljp
			cmRatio	: 1,
			index	: 40,
			attack	: 300 * 44.1,
			decay	: 500 * 44.1,
		},
		noise : { //ljp
			cmRatio	: 0.04,
			index	: 1000,
			attack	: 1 * 44.1,
			decay	: 100 * 44.1,
		},
		frog : { //ljp
			cmRatio	: 0.1,
			index	: 2.0,
			attack	: 300 * 44.1,
			decay	: 5 * 44.1,
		},
		gong : {
			cmRatio : 1.4,
			index	: .95,
			attack	: 44.1,
			decay	: 5000 * 44.1,
		},
		drum : {
			cmRatio : 1.40007,
			index	: 2,
			attack	: 44,
			decay	: 44100,
		},
		drum2 : {
			cmRatio: 1 + Math.sqrt(2),
			index: .2,
			attack: 44,
			decay: 20 * 44.1,
		},
		brass : {
      maxVoices:4,
			cmRatio : 1 / 1.0007,
			index	: 5,
			attack	: 4100,
			decay	: 1,
		},
		clarinet : {
			cmRatio	: 3 / 2,
			index	: 1.5,
			attack	: 50 * 44.1,
			decay	: 200 * 44.1,
		}
	};
  
  return Synths

}
