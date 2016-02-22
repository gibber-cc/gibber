module.exports = function( Gibber, pathToSoundFonts ) {
  var Gibberish = require( 'gibberish-dsp' ),
      curves = Gibber.outputCurves,
      teoria = require( './theory' )( Gibber ).Teoria,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC,
      mappingProperties = {
        amp: {
          min: 0, max: 1,
          hardMax:2,
          output: LOGARITHMIC,
          timescale: 'audio',
          dimensions:1
        },
        loudness: {
          min: 0, max: 1,
          hardMax:2,
          output: LOGARITHMIC,
          timescale: 'audio',
          dimensions:1
        },
        pan: {
          min:-1, max:1,
          output: LINEAR,
          timescale: 'audio',
          dimensions:1
        }
      },
      cents = function(base, _cents) {
        return base * Math.pow(2,_cents/1200)
      },
      sensibleNames;
  
  sensibleNames = {
    piano : 'acoustic_grand_piano',
    guitar: 'electric_guitar_clean',
    bass  : 'acoustic_bass',
    organ : 'rock_organ',
    brass : 'synth_brass_1',
    strings:'synth_strings_1',
    choir : 'choir_aahs',
  }
  
  var SoundFont = function( soundFontName ) {
    var obj, path = SoundFont.path

    if( Gibber.Environment ) {
      if( Gibber.Environment.Storage.values.soundfonts ) {
        if( Gibber.Environment.Storage.values.soundfonts[ soundFontName ] ) {
          path = Gibber.Environment.Storage.values.soundfonts[ soundFontName ]
        }
      }
    }
    
    if( sensibleNames[ soundFontName ] ) soundFontName = sensibleNames[ soundFontName ];

    obj = new Gibberish.SoundFont( arguments[0], path ).connect( Gibber.Master )

    $.extend( true, obj, Gibber.Audio.ugenTemplate )
    obj.fx.ugen = obj
    obj.chord = Gibber.Theory.chord
    
    Object.defineProperty(obj, '_', {
      get: function() { 
        obj.kill();
        return obj 
      },
      set: function() {}
    })
    
    obj.onload = function() {
      
      if( Gibber.Environment && Gibber.Environment.Storage.values.saveSoundFonts ) {
        if( !Gibber.Environment.Storage.values.soundfonts ) {
          Gibber.Environment.Storage.values.soundfonts = {}
        }else{
          if( Gibber.Environment.Storage.values.soundfonts[ soundFontName] ) return
        }
        
        Gibber.Environment.Storage.values.soundfonts[ soundFontName ] = Gibber.Audio.Core.SoundFont.storage[ soundFontName ]
        
        try{
          Gibber.Environment.Storage.save()
        }catch(e){
          console.log("STORAGE ERROR", e )
          
          if( e.name === 'QuotaExceededError' ) {
            console.log('Your localStorage for Gibber has been exceeded; we can\'t save the soundfile. It is still usable.')
          }
        }
      }
    }
    
    obj._note = obj.note.bind( obj ) 
    obj.note = function( name, loudness ) {
      if( typeof name === 'number' ) {
        if( name < Gibber.minNoteFrequency ) {
          var scale = this.scale || Gibber.scale,
              note  = scale.notes[ name ]
              
          if( this.octave && this.octave !== 0 ) {
            var sign = this.octave > 0 ? 1 : 0,
                num  = Math.abs( this.octave )
            
            for( var i = 0; i < num; i++ ) {
              note *= sign ? 2 : .5
            }
          }
          
          name = note
        }
        var tNote = teoria.frequency.note( name ),
            noteName, _cents = 0
        
        if( tNote.note.accidental.value === 1 && tNote.note.accidental.sign !== 'b' ) { 
          var enharmonics = tNote.note.enharmonics()
          for( var i = 0; i < enharmonics.length; i++ ) {
            var enharmonic = enharmonics[ i ]
            if( enharmonic.accidental.sign === 'b' ) {
              tNote.note = enharmonic
              break;
            }
          }
        }
        
        _cents = tNote.cents 
        
        noteName =  tNote.note.name.toUpperCase() 
        if( tNote.note.accidental.value !== 0) {
          noteName += tNote.note.accidental.sign
        }
        noteName += tNote.note.octave
        
        name = noteName
      }
      
      if( typeof loudness === 'undefined' ) loudness = this.loudness.value

      obj._note( name, loudness, cents(1, _cents) )
    }
    
    Gibber.createProxyProperties( obj, mappingProperties )
    Gibber.defineProperty( obj, 'loudness', true, true, { min: 0, max: 1, output: LOGARITHMIC, timescale: 'audio', perNote:true }, true, true )   
    Gibber.createProxyMethods( obj, [ 'note', 'chord', 'send' ] )
  
    return obj
  }
  
  SoundFont.path = pathToSoundFonts || "../../../resources/soundfonts/"
  
  return SoundFont
}
