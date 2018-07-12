const Ugen = require( './ugen.js' )

module.exports = function( Audio ) {

  const Drums = function( score, time, props ) { 
    // XXX what url prefix should I be using?

    const temp = Audio.autoConnect
    Audio.autoConnect = false
    const k  = Audio.instruments.Sampler({ filename:'http://127.0.0.1:10000/resources/kick.wav' })
    const s  = Audio.instruments.Sampler({ filename:'http://127.0.0.1:10000/resources/snare.wav' })
    const ch = Audio.instruments.Sampler({ filename:'http://127.0.0.1:10000/resources/hat.wav' })
    const oh = Audio.instruments.Sampler({ filename:'http://127.0.0.1:10000/resources/openHat.wav' })
    Audio.autoConnect = temp

    const drums = Audio.Ensemble({
      'x': { target:k,  method:'trigger', args:[1], name:'kick' },
      'o': { target:s,  method:'trigger', args:[1], name:'snare' },
      '*': { target:ch, method:'trigger', args:[1], name:'closedHat' },
      '-': { target:oh, method:'trigger', args:[1], name:'openHat' },
    })

    if( Audio.autoConnect === true ) drums.connect()

    drums.seq = Audio.Seq({
      target:drums,
      key:'play',
      values:score.split(''),
      timings:time === undefined ? 1 / score.length : time
    }).start()

    drums.samplers = [ k,s,ch,oh ]

    drums.__sequencers = [ drums.seq ]

    const obj = drums
    let __value = 1
    drums.__pitch = { 
      value: __value,
      isProperty:true,
      sequencers:[],
      mods:[],
      name:'pitch',

      seq( values, timings, number = 0, delay = 0 ) {
        let prevSeq = obj.__pitch.sequencers[ number ] 
        if( prevSeq !== undefined ) { 
          prevSeq.stop(); prevSeq.clear(); 
          let idx = obj.__sequencers.indexOf( prevSeq )
          obj.__sequencers.splice( idx, 1 )
        }

        // XXX you have to add a method that does all this shit on the worklet. crap.
        obj.__pitch.sequencers[ number ] = obj.__pitch[ number ] = Audio.Seq({ 
          values, 
          timings, 
          target:drums.__wrapped__, 
          key:'pitch'
        })
        .start( Audio.Clock.time( delay ) )

        obj.__sequencers.push( obj.__pitch[ number ] )

        // return object for method chaining
        return obj
      },
    }

    Audio.Gibberish.worklet.port.postMessage({
      address:'addMethod',
      key:'pitch',
      function:`function( pitch ) {
        for( let input of this.inputs ) {
          if( typeof input === 'object' ) input.rate = pitch
        }
      }`,
      id:drums.id,
      delay:Audio.shouldDelay
    })

    Object.defineProperty( drums, 'pitch', {
      configurable:true,
      get() { return this.__pitch },
      set(v){ 
        this.__pitch.value = v
        for( let sampler of this.samplers ) sampler.rate = this.__pitch.value 
      }
    })

    //Ugen.createProperty( drums, 'pitch', drums.__wrapped__, [], Audio )

    return drums
  }

  const EDrums = function( score, time, props ) { 
    const temp = Audio.autoConnect
    Audio.autoConnect = false
    
    const k = Audio.instruments.Kick()
    const s = Audio.instruments.Snare()
    const ch = Audio.instruments.Hat({ decay:.1, gain:.2 })
    const oh = Audio.instruments.Hat({ decay:.5, gain:.2 })
    
    Audio.autoConnect = temp
    
    const drums = Audio.Ensemble({
      'x': { target:k, method:'trigger', args:[1], name:'kick' },
      'o': { target:s, method:'trigger', args:[1], name:'snare' },
      '*': { target:ch, method:'trigger', args:[.2], name:'closedHat' },
      '-': { target:oh, method:'trigger', args:[.2], name:'openHat' },
    })

    drums.seq = Audio.Seq({
      target:drums,
      key:'play',
      values:score.split(''),
      timings:time === undefined ? 1 / score.length : time
    }).start()

    if( Audio.autoConnect === true ) drums.connect()

    return drums
  }

  return { Drums, EDrums }
}
