const Presets = {
  process( description, args, Audio ) {
    let output

    // if the constructor arugment is not a string then no preset is being used
    if( typeof args[ 0 ] !== 'string' ) {
      output = args[ 0 ]  
    }else{
      output = {}
      const preset = Presets[ description.category ][ description.name ][ args[0] ]

      if( preset !== undefined ) {
        for( let key in preset ) {
          if( key === 'presetInit' ) continue
          let value = preset[ key ]

          // if a value is a function, run the function to get the new value. these
          // preset functions are passed the main audio object, which they can typically
          // use, for example, to query the current sample rate.
          output[ key ] = typeof value === 'function' ? value( Audio ) : value
        }

        // if there is an extra argument to modify the preset...
        if( args.length > 1 ) {
          Object.assign( output, args[1] )
        }

        if( preset.presetInit !== undefined ) {
          output.__presetInit__ = preset.presetInit 
        } 
      }
    }

    return output
  },

  instruments: {
    Synth: require( './presets/synth_presets.js' ),
    FM:    require( './presets/fm_presets.js' ),
    Monosynth: require( './presets/monosynth_presets.js' ),
    PolyMono: require( './presets/monosynth_presets.js' ),
    Snare: require( './presets/snare_presets.js' ),
    Kick: require( './presets/kick_presets.js' ),

    EDrums: require( './presets/edrums_presets.js' ),
  },

  effects: {
    Chorus: require( './presets/chorus_presets.js' ),
    Distortion: require( './presets/distortion_presets.js' ),
  },

  misc: {
    Bus2: require( './presets/bus2_presets.js' )
  }

}

Presets.instruments.PolySynth = Presets.instruments.Synth
Presets.instruments.PolyFM = Presets.instruments.FM

module.exports = Presets
