module.exports = function( Gibber ) {
  
"use strict"

var times = [],
    $ = Gibber.dollar,
    Gibberish = require( 'gibberish-dsp' ),
    Audio

Audio = {
  // can't name export as Gibberish has the same name
  export: function( target ) {
    $.extend( target, Audio.Busses )       
    $.extend( target, Audio.Oscillators )
    $.extend( target, Audio.Synths )
    $.extend( target, Audio.Percussion )
    $.extend( target, Audio.Envelopes )
    $.extend( target, Audio.FX )
    $.extend( target, Audio.Seqs )    
    $.extend( target, Audio.Samplers )
    $.extend( target, Audio.PostProcessing )
    $.extend( target, Audio.Vocoder )
    
    target.Theory = Audio.Theory
    $.extend( target, Audio.Analysis ) 
    
    // target.future = Gibber.Utilities.future
    // target.solo = Gibber.Utilities.solo    
    target.Score = Audio.Score
		target.Clock = Audio.Clock
    target.Seq = Audio.Seqs.Seq
    target.Arp = Audio.Arp // move Arp to sequencers?
    target.ScaleSeq = Audio.Seqs.ScaleSeq
    target.SoundFont = Audio.SoundFont
    target.Speak = Audio.Speak
    target.Additive = Audio.Additive
    target.Ugen = Audio.Ugen
    
    target.Rndi = Audio.Core.Rndi
    target.Rndf = Audio.Core.Rndf     
    target.rndi = Audio.Core.rndi
    target.rndf = Audio.Core.rndf
    
    target.Input = Audio.Input
    
    target.Freesound = Audio.Freesound
    target.Freesound2 = Audio.Freesound2
    target.Freesoundjs2 = Audio.Freesoundjs2
    
    target.Scale = Audio.Theory.Scale
    
    target.Ensemble = Audio.Ensemble

		target.module = Gibber.import
    // target.ms = Audio.Time.ms
    // target.seconds = target.sec = Audio.Time.seconds
    // target.minutes = target.min = Audio.Time.minutes
    Audio.Core.Time.export( target )
    Audio.Clock.export( target )
    //target.sec = target.seconds
    Audio.Core.Binops.export( target )
    
    target.Master = Audio.Master    
  },
  init: function() {
    // post-processing depends on having context instantiated
    var __onstart = null
    if( Audio.onstart ) __onstart = Audio.onstart
    
    if( !Audio.context ) { Audio.context = { sampleRate:44100 } }
    
    Audio.Core.onstart = function() {
      Audio.Clock.start( true )
              
      if( __onstart !== null ) { __onstart() }
    }
    
    Audio.Score = Audio.Score( Gibber )
    Audio.Additive = Audio.Additive( Gibber )
    Gibber.Clock = Audio.Clock
          
    Gibber.Theory = Audio.Theory
    
    Gibber.Theory.scale = Gibber.scale = Gibber.Audio.Theory.Scale( 'c4','Minor' )
    
    Audio.Core._init()
    
    $.extend( Gibber.Binops, Audio.Binops )
    
    Audio.Master = Audio.Busses.Bus().connect( Audio.Core.out )

    Audio.Master.type = 'Bus'
    Audio.Master.name = 'Master'

    $.extend( true, Audio.Master, Audio.ugenTemplate ) 
    Audio.Master.fx.ugen = Audio.Master
    
    Audio.ugenTemplate.connect = 
      Audio.Core._oscillator.connect =
      Audio.Core._synth.connect =
      Audio.Core._effect.connect =
      Audio.Core._bus.connect =
      Audio.connect;
      
    Audio.Core.defineUgenProperty = Audio.defineUgenProperty
    
    $.extend( Gibber.Presets, Audio.Synths.Presets )
    $.extend( Gibber.Presets, Audio.Percussion.Presets )
    $.extend( Gibber.Presets, Audio.FX.Presets )
    
    //$.extend( Audio, Audio.Core )
  },
  
  Time : {
    ms: function( num ) {
      return {
        mode: 'absolute',
        value: (Gibber.Audio.Core.context.sampleRate / 1000) * num,
        valueOf: function() { return this.value }
      }
    },
    seconds: function( num ) {
      return {
        mode: 'absolute',
        value: Gibber.Audio.Core.context.sampleRate * num,
        valueOf: function() { return this.value }
      }
    },
    minutes: function( num ) {
      return {
        mode: 'absolute',
        value: Gibber.Audio.Core.context.sampleRate * 60 * num,
        valueOf: function() { return this.value }
      }
    }
  },
  // override for Gibber.Audio.Core method
  defineUgenProperty : function(key, initValue, obj) {
    var isTimeProp = Audio.Clock.timeProperties.indexOf( key ) > -1,
        prop = obj.properties[ key ] = {
          value:  isTimeProp ? Audio.Clock.time( initValue ) : initValue,
          binops: [],
          parent : obj,
          name : key,
        },
        mappingName = key.charAt(0).toUpperCase() + key.slice(1);
    
    Object.defineProperty(obj, key, {
      configurable: true,
      get: function() { return prop.value },
      set: function(val) { 
        if( obj[ mappingName ] && obj[ mappingName ].mapping ) {
          if( obj[ mappingName ].mapping.remove )
            obj[ mappingName ].mapping.remove( true ) // pass true to avoid setting property inside of remove method
        }
        
        // if( isTimeProp ) {
        //   if( typeof val === 'object' && val.mode ==='absolute' ) { // ms, seconds
        //     prop.value = val.value
        //   }else{
        //     prop.value = Audio.Core.Binops.Mul( Audio.Clock.time( val ), Audio.Core.Binops.Div( 1, Audio.Clock.rate ) ) 
        //   }
        // }else{
        //   prop.value = val
        // }
        // 
        prop.value = isTimeProp ? Audio.Clock.time( val ) : val
        
        Audio.Core.dirty( obj )
        
        return prop.value
      },
    });

    obj[key] = prop.value
  },
  
  // override for Gibber.Audio method
  polyInit : function(ugen) {
    ugen.mod = ugen.polyMod;
    ugen.removeMod = ugen.removePolyMod;
    
    for( var key in ugen.polyProperties ) {
      (function( _key ) {
        var value = ugen.polyProperties[ _key ],
            isTimeProp = Audio.Clock.timeProperties.indexOf( _key ) > -1

        Object.defineProperty(ugen, _key, {
          get : function() { return value; },
          set : function( val ) { 
            for( var i = 0; i < ugen.children.length; i++ ) {
              ugen.children[ i ][ _key ] = isTimeProp ? Audio.Clock.time( val ) : val;
            }
          },
        });
        
      })( key );
    }
  },
  // override for Gibber.Audio method to use master bus
  connect : function( bus, position ) {
    if( typeof bus === 'undefined' ) bus = Audio.Master
    
    if( this.destinations.indexOf( bus ) === -1 ){
      bus.addConnection( this, 1, position )
      if( position !== 0 ) {
        this.destinations.push( bus )
      }
    }
    
    return this
  },
  clear: function() {
    // Audio.analysisUgens.length = 0
    // Audio.sequencers.length = 0
    var args = Array.prototype.slice.call( arguments, 0 )
    
    for( var i = 0; i < Audio.Master.inputs.length; i++ ) {
      if( args.indexOf( Audio.Master.inputs[ i ].value) === -1 ) {
        Audio.Master.inputs[ i ].value.disconnect()
      }
    }
  
    Audio.Master.inputs.length = arguments.length
    
    if( Audio.Clock.shouldResetOnClear !== false ) {
      Audio.Clock.reset()
    }
  
    Audio.Master.fx.remove()
  
    Audio.Master.amp = 1
    
    Audio.Core.clear()
    
    Audio.Clock.seq.connect()
    
    Audio.Core.out.addConnection( Audio.Master, 1 );
    Audio.Master.destinations.push( Audio.Core.out );
  
    console.log( 'Audio stopped.')
  },
  ugenTemplate: {
    sequencers : [],
    mappings: [],
    fx: $.extend( [], {
      add: function() {
        var end = this.length === 0 ? this.ugen : this[ this.length - 1 ]
        end.disconnect()
        for( var i = 0; i < arguments.length; i++ ) {
          var fx = arguments[ i ]
          fx.input = end
          
          end = fx
          
          this.push( fx )
        }
        if( this.ugen !== Audio.Master ) {
          end.connect()
        }else{
          end.connect( Audio.Core.out )
        }
        return this.ugen
      },
      
      remove: function() {
        if( arguments.length > 0 ) {
          for( var i = 0; i < arguments.length; i++ ) {
            var arg = arguments[ i ];
						
						if( typeof arg === 'string' ) { // if identified using the fx name
							for( var j = 0; j < this.length; j++ ) {
								if( this[ j ].name === arg ) {
									this.remove( j )
								}
							}
							continue;
						}else if( typeof arg === 'object' ) {
							for( var j = 0; j < this.length; j++ ) {
								if( this[ j ] === arg ) {
									this.remove( j )
								}
							}
							continue;
						}
						
            if( typeof arg === 'number' ) { // if identified via position in fx chain
							var ugenToRemove = this[ arg ]
							ugenToRemove.disconnect()
              this.splice( arg, 1 )
							
              if( typeof this[ arg ] !== 'undefined') {
								
								// reset input for current position in chain
								var newConnectionNumber = arg - 1
								if( newConnectionNumber !== -1 ) {
									this[ arg ].input = this[ newConnectionNumber ]
								}else{
									this[ arg ].input = this.ugen
								}
								
								// reset input for next position in chain, or connect to Master bus
                if( typeof this[ arg + 1 ] !== 'undefined' ) { // if there is another fx ahead in chain...
                  this[ arg + 1 ].input = arg === 0 ? this.ugen : this[ arg ]
                }else{
                  if( this.ugen !== Audio.Master ) {
                    this.ugen.connect( Audio.Master )
                  }else{
                    this.ugen.connect( Audio.Core.out )
                  }
                }
              }else{
                if( this.length > 0 ) { // if there is an fx behind in chain
                  this[ arg - 1 ].connect( Audio.Master )
                }else{
                  if( this.ugen !== Audio.Master ) {
                    this.ugen.connect( Audio.Master ) // no more fx
                  }else{
                    this.ugen.connect( Audio.Core.out )
                  }
                }
              }
            }
          }
        }else{ // remove all fx
          if( this.length > 0) {
            this[ this.length - 1 ].disconnect()
            if( this.ugen !== Audio.Master ) {
              this.ugen.connect( Audio.Master )
            }else{
              this.ugen.connect( Audio.Core.out )
            }
            this.ugen.codegen()
            this.length = 0
          }else{
            console.log( this.ugen.name + ' does not have any fx to remove. ')
          }
        }
      },
    }),
      
    replaceWith: function( replacement ) {
      if( replacement.connect ) {
        for( var i = 0; i < this.destinations.length; i++ ) {
          replacement.connect( this.destinations[i] )
        }
      
        for( var i = 0; i < this.sequencers.length; i++ ) {
          this.sequencers[ i ].target = replacement
          replacement.sequencers.push( this.sequencers[i] )
        }
      
        for( var i = 0; i < this.mappingObjects.length; i++ ) {
          var mapping = this.mappingObjects[ i ]
        
          if( mapping.targets.length > 0 ) {
            for( var j = 0; j < mapping.targets.length; j++ ) {
              var _mapping = mapping.targets[ j ]
            
              if( replacement.mappingProperties[ mapping.name ] ) {
                _mapping[ 0 ].mapping.replace( replacement, mapping.name, mapping.Name )
              }else{ // replacement object does not have property that was assigned to mapping
                _mapping[ 0 ].mapping.remove()
              }
            }
          }
        }
      }
  
      this.kill()
    },

    kill: function() { 
      var end = this.fx.length !== 0 ? this.fx[ this.fx.length - 1 ] : this
      if( this.seq.isRunning ) this.seq.disconnect()
      end.disconnect()
      
      for( var i = 0; i < this.fx.length; i++ ) {
        var fx = this.fx[ i ]
        if( fx.seq.isRunning ) fx.seq.disconnect()
      }
      
      this.disconnect()
      
      for( var i = 0; i < this.mappings.length; i++ ) {
        this.mappings[ i ].remove() 
      }
      
      if( this.clearMarks ) // check required for modulators
        this.clearMarks()
      
      console.log( this.name + " has been terminated.")
    },

    play: function( notes, durations, repeat ) {
      if( this.note ) {
        this.note.seq( notes, durations )
      }else if( this.frequency ) {
        this.frequency.seq( notes, durations )
      }
      
      return this
    },

    // stop : function() {
    //   if( this.seq ) this.seq.stop()
    // },
    // start : function() {
    //   if( this.seq ) this.seq.start()
    // },
    
    fadeIn : function( _time, endLevel ) {
      if( isNaN( endLevel ) ) {
        endLevel = 1
      }

      var time = Audio.Clock.time( _time ),
          decay = new Audio.Core.ExponentialDecay({ decayCoefficient:.05, length:time }),
          //ramp = Mul( Sub(1,decay), endLevel )
          line = new Audio.Core.Line( 0, endLevel, time )
          
      this.amp = line
      
      future( function() { this.amp = endLevel }.bind( this ), time)
      
      return this
    },
    
    fadeOut : function( _time ) {
      var time = Audio.Clock.time( _time ),
          curve = Gibber.Audio.Envelopes.Curve( 0, 1, time, .05, .95, false )
          
      this.amp = curve
      
      future( function() { this.amp = 0 }.bind( this ), time )
      
      return this
    },
    fadeOut2 : function( _time ) {
      var time = Audio.Clock.time( _time ),
          curve = Gibber.Audio.Envelopes.Curve( 0, 1, time, .05, .95, false )
          
      this.amp = curve
      
      future( function() { 
        this.amp = 0
        this.kill()
      }.bind( this ), time )
      
      return this
    },
  }
}

Audio.Core = require( 'gibberish-dsp' )
Audio.Core._init = Audio.Core.init.bind( Audio.Core )
delete Audio.Core.init

Audio.Clock =          require( './audio/clock' )( Gibber )
Audio.Freesoundjs =    require( '../external/freesound' )
Audio.Freesound =      require( './audio/gibber_freesound' )( Audio.Freesoundjs )
Audio.Freesoundjs2 =   require( '../external/freesound2' )
Audio.Freesound2 =     require( './audio/gibber_freesound2' )( Audio.Freesoundjs2 )
Audio.Seqs =           require( './audio/seq')( Gibber )
Audio.Theory =         require( './audio/theory' )( Gibber )
Audio.FX =             require( './audio/fx' )( Gibber )
Audio.Oscillators =    require( './audio/oscillators' )( Gibber )
Audio.Synths =         require( './audio/synths' )( Gibber )
Audio.Busses =         require( './audio/bus' )( Gibber )
Audio.Analysis =       require( './audio/analysis' )( Gibber )
Audio.Envelopes =      require( './audio/envelopes' )( Gibber )
Audio.Percussion =     require( './audio/drums' )( Gibber )
Audio.Input =          require( './audio/audio_input' )( Gibber )
Audio.Samplers =       require( './audio/sampler' )( Gibber )
// Audio.Speak =          require( './audio/speak' )( Gibber )
Audio.Vocoder =        require( './audio/vocoder' )( Gibber )
Audio.PostProcessing = require( './audio/postprocessing' )( Gibber )
Audio.Arp =            require( './audio/arp' )( Gibber )
Audio.SoundFont =      require( './audio/soundfont' )( Gibber )
Audio.Score =          require( './audio/score' )
Audio.Ensemble =       require( './audio/ensemble' )( Gibber )
Audio.Ugen =           require( './audio/ugen')( Gibber )
Audio.Additive =       require( './audio/additive' )

return Audio

}