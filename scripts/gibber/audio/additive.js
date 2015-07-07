module.exports = function( Gibber ) {

/*
XXX = Ugen({
  name:'Vox',
  inputs:{ 
    frequency:{ min:50, max:3000, default:440 },
    amp: { min:0, max:1, default:.1 }
  },
  callback: function( frequency, amp ) {
    this.out = this.sin( this.PI2 * (this.phase++ * frequency / 44100) ) * amp
    
    // if stereo, make this.out an array an fill appropriately
    // do not create a new array for every sample
    return this.out
  },
  init: function() {
    this.sin = Math.sin
    this.PI2 = Math.PI * 2
    this.phase = 0
    this.out =  0
  }
})
*/
    var Additive = Gibber.Audio.Ugen({
      name:'additive',
      inputs: {
        frequency:{ min:50, max:3000, default:440 },
        amp: { min:0, max:1, default:.5 }
        //pan: { min:0, max:1, default:-1 }
      },
      callback: function( frequency, amp, pan ) {
        var sines = this.sines, sine, harmonics = this.harmonics
        
        this.out = 0
        
        for( var i = 0, l = sines.length; i < l; i++  ) {
          sine = sines[ i ]
          this.out += sine( frequency * sine.harmonic, sine.amp )
          // if ( phase++ % 88200 === 0 ) console.log( frequency, sine.amp, this.out )
        }
      
        return this.out * amp
      },
      init: function() {
        this.sines = []
        //this.frequency = 440
        //if( typeof this.harmonics === 'undefined' ) this.harmonics = [1,1]
        
        for( var i = 0, j = 0; i < this.harmonics.length / 2; i++, j+=2 ) {
          var harmonicIndex = i * 2
          this.sines[ i ] = Gibber.Audio.Oscillators.Sine(440,1)._.callback
          this.sines[ i ].harmonic = this.harmonics[ j ]
          this.sines[ i ].amp = this.harmonics[ j + 1 ]
        }
        
        this.out = 0
        console.log( this.sines )
      }
    })
  
  //  return Additive
    //}
  
  return Additive
}

/*Sine = Ugen({
  name:'Vox',
  inputs:{ 
    frequency:{ min:50, max:3000, default:440 },
    amp: { min:0, max:1, default:.1 }
  },
  callback: function( frequency, amp ) {
    this.out = this.sin( this.PI2 * (this.phase++ * frequency / 44100) ) * amp
    return this.out
  },
  init: function() {
    this.sin = Math.sin
    this.PI2 = Math.PI * 2
    this.phase = 0
    this.out =  0
  }
})

Sine.connect()
Sine.frequency.seq( [440,880], 1/2 )
*/