(function() {
  
  Gibber.Synths = {}

  var types = [
    [ 'PolySynth', 'Synth' ],
    [ 'PolyFM', 'FM' ],
    [ 'PolySynth2', 'Synth2' ],
    [ 'MonoSynth', 'Mono' ],
    [ 'PolyKarplusStrong', 'Pluck' ],
  ],
  _mappingProperties = {
    Synth: {
      frequency: { min: 50, max: 3200, output: Gibber.LINEAR, timescale: 'audio' },
      amp: { min: 0, max: 1, output: Gibber.LOGARITHMIC,timescale: 'audio',},
      pulsewidth :{ min: 0.01, max: .99, output: Gibber.LINEAR, timescale: 'audio' },
      attack: { min:Gibber.Clock.maxMeasures + 1, max: 44100, output: Gibber.LOGARITHMIC, timescale:'audio'},
      decay: { min:Gibber.Clock.maxMeasures + 1, max: 44100, output: Gibber.LOGARITHMIC, timescale:'audio'},      
    },
    Synth2: {
      frequency: { min: 50, max: 3200, output: Gibber.LINEAR, timescale: 'audio' },
      amp: { min: 0, max: 1, output: Gibber.LOGARITHMIC,timescale: 'audio',},
      pulsewidth :{ min: 0.01, max: .99, output: Gibber.LINEAR, timescale: 'audio' },
      attack: { min:Gibber.Clock.maxMeasures + 1, max: 44100, output: Gibber.LOGARITHMIC, timescale:'audio'},
      decay: { min:Gibber.Clock.maxMeasures + 1, max: 44100, output: Gibber.LOGARITHMIC, timescale:'audio'},
      cutoff : { min: 0, max: .7, output: Gibber.LINEAR, timescale: 'audio' },
      resonance: { min: 0, max: 5.5, output: Gibber.LINEAR, timescale: 'audio' }
    },
    Mono: {
      frequency: { min: 50, max: 3200, output: Gibber.LINEAR, timescale: 'audio' },
      amp: { min: 0, max: 1, output: Gibber.LOGARITHMIC,timescale: 'audio',},
      pulsewidth :{ min: 0.01, max: .99, output: Gibber.LINEAR, timescale: 'audio' },
      attack: { min:Gibber.Clock.maxMeasures + 1, max: 44100, output: Gibber.LOGARITHMIC, timescale:'audio'},
      decay: { min:Gibber.Clock.maxMeasures + 1, max: 44100, output: Gibber.LOGARITHMIC, timescale:'audio'},
      cutoff : { min: 0, max: .7, output: Gibber.LINEAR, timescale: 'audio' },
      detune2: { min: 0, max: .15, output: Gibber.LINEAR, timescale: 'audio' },
      detune3: { min: 0, max: .15, output: Gibber.LINEAR, timescale: 'audio' },
      glide: { min:.99, max:.999995, output: Gibber.LINEAR, timescale: 'audio'},
      resonance: { min: 0, max: 5.5, output: Gibber.LINEAR, timescale: 'audio' }
    },
    FM: {
      frequency: { min: 50, max: 3200, output: Gibber.LINEAR, timescale: 'audio' },
      amp: { min: 0, max: 1, output: Gibber.LOGARITHMIC,timescale: 'audio',},
      attack: { min:Gibber.Clock.maxMeasures + 1, max: 44100, output: Gibber.LOGARITHMIC, timescale:'audio'},
      decay: { min:Gibber.Clock.maxMeasures + 1, max: 44100, output: Gibber.LOGARITHMIC, timescale:'audio'},
      cmRatio : { min:.1, max:50, output:Gibber.LINEAR, timescale:'audio' },
      index: { min:.1, max:50, output:Gibber.LINEAR, timescale:'audio' }
    },
    Pluck: {
      frequency: { min: 50, max: 3200, output: Gibber.LINEAR, timescale: 'audio' },
      amp: { min: 0, max: 1, output: Gibber.LOGARITHMIC,timescale: 'audio',},
      blend :{ min: 0, max: 1, output: Gibber.LINEAR, timescale: 'audio' },
      damping :{ min: 0, max: 1, output: Gibber.LINEAR, timescale: 'audio' },
    },
  }

  for( var i = 0; i < types.length; i++ ) {
  
    (function() {
      var type = Array.isArray( types[ i ] ) ? types[ i ][ 0 ] : types[ i ],
          name = Array.isArray( types[ i ] ) ? types[ i ][ 1 ] : types[ i ]
     
      Gibber.Synths[ name ] = function() {
        var args = Array.prototype.slice.call(arguments),
            obj,
            mv = 1
        
        if( typeof args[0] === 'object' && typeof args[0].maxVoices === 'undefined') { 
          args[0].maxVoices = mv = 1
        }else if( typeof args[0] === 'undefined') {
          args[0] = { maxVoices:1 }
          mv = 1
        }else{
          if( args[0].maxVoices ) mv = args[0].maxVoices
        }
        
        obj = new Gibberish[ type ]({maxVoices: mv}).connect( Gibber.Master )
        obj.type = 'Gen'
        
        $.extend( true, obj, Gibber.ugen )
        
        obj.fx.ugen = obj
        
        // override note method to allow note names
        obj._note = obj.note.bind( obj )
        obj.note = function() {
          var args = Array.prototype.splice.call( arguments, 0 )
        
          if( typeof args[0] === 'string' ) {
            args[0] = Gibber.Theory.Teoria.note( args[0] ).fq()
          }
          this._note.apply( this, args )
        }
        
        obj.chord = Gibber.Theory.chord
      
        Object.defineProperty(obj, '_', {
          get: function() { obj.kill(); return obj },
          set: function() {}
        })
        
        Gibber.createProxyProperties( obj, _mappingProperties[ name ] )
        
        Gibber.createProxyMethods( obj, [ 'note', 'chord' ] )
                
        obj.name = name 
        
        Gibber.processArguments2( obj, args, obj.name )
        
        console.log( name + ' is created.' )
        return obj
      }
    })()
  
  }
  
  Gibber.Presets.Synth = {
  	short : { attack: 44, decay: 1/16, },
  	bleep: { waveform:'Sine', attack:44, decay:1/16 },
    rhodes: { waveform:'Sine', maxVoices:4, /*fx:[ Tremolo(2, .2) ],*/ attack:44, decay:1, cutoff:.1, filterMult:.4, resonance:1.5 }
  }
  
  Gibber.Presets.Mono = {
  	short : { attack: 44, decay: 1/16,},
  
  	lead : {
  		//fx : [ Delay(1/4, .35), Reverb() ],
  		attack: 1/8,
  		decay:1/2,
  		octave3:0,
  		cutoff:.2,
  		filterMult:.5,
  		resonance:5,
  		isLowPass: false,
  	},
  
  	bass : { 
      attack: Gibber.Clock.maxMeasures,
  		decay:	1/8 - Gibber.Clock.maxMeasures,
  		octave2 : -1,
  		cutoff: 0,
  		filterMult:.2,
  		resonance:4,
  	},
  
  	easy : {
  		attack:44,
  		decay:2,
  		octave2:0,
  		octave3:0,
  		cutoff:.3,
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
      attack:44,
      octave2:0,
      octave3:0
    },
  }
})()
