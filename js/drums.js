module.exports = function( Audio ) {

  const Drums = function( score, time, props ) { 
    // XXX what url prefix should I be using?
    const k  = Audio.instruments.Sampler({ filename:'http://127.0.0.1:10000/resources/kick.wav' })
    const s  = Audio.instruments.Sampler({ filename:'http://127.0.0.1:10000/resources/snare.wav' })
    const ch = Audio.instruments.Sampler({ filename:'http://127.0.0.1:10000/resources/hat.wav' })
    const oh = Audio.instruments.Sampler({ filename:'http://127.0.0.1:10000/resources/openHat.wav' })

    const drums = Audio.Ensemble({
      'x': { target:k,  method:'trigger', args:[1], name:'kick' },
      'o': { target:s,  method:'trigger', args:[1], name:'snare' },
      '*': { target:ch, method:'trigger', args:[1], name:'closedHat' },
      '-': { target:oh, method:'trigger', args:[1], name:'openHat' },
    })

    drums.seq = Audio.Seq({
      target:drums,
      key:'play',
      values:score.split(''),
      timings:time === undefined ? 1 / score.length : time
    }).start()

    return drums
  }

  const EDrums = function( score, time, props ) { 
    const k = Audio.instruments.Kick()
    const s = Audio.instruments.Snare()
    const ch = Audio.instruments.Hat({ decay:.1, gain:.2 })
    const oh = Audio.instruments.Hat({ decay:.5, gain:.2 })

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

    return drums
  }

  return { Drums, EDrums }
}
