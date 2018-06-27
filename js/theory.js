const Gibberish = require( 'gibberish-dsp' )
const serialize = require( 'serialize-javascript' )
const Tune      = require( './external/tune-api-only.js' )

let Gibber = null

const Theory = {
  // needed to force library to be serialized for transport to 
  // worklet processor
  __Tune:Tune,

  Tune:null,
  id:null,
  nogibberish:true,
  __tuning:'et',
  __mode: 'aeolian',
  __root:440,
  __tunings:{
    et: {
      frequencies:[
        261.62558,
        277.182617,
        293.664764,
        311.126984,
        329.627563,
        349.228241,
        369.994415,
        391.995422,
        415.304688,
        440,
        466.163757,
        493.883301,
        523.251083727363
      ],
      description:'equal tempered (edo)'
    }
  },  

  modes: {
    ionian:     [0,2,4,5,7,9,11],
    dorian:     [0,2,3,5,7,9,10],
    phrygian:   [0,1,3,5,7,8,10],
    lydian:     [0,2,4,6,7,9,11],
    mixolydian: [0,2,4,5,7,9,10],
    aeolian:    [0,2,3,5,7,8,10],
    locrian:    [0,1,3,5,6,8,10],
    melodicminor:[0,2,3,5,7,8,11],
    wholeHalf:  [0,2,3,5,6,8,9,11],
    halfWhole:  [0,1,3,4,6,7,9,10],
    chromatic:  [0,1,2,3,4,5,6,7,8,9,10,11],
  },

  store:function() { 
    Gibberish.Theory = this

    this.Tune.TuningList = this.__tunings
  },

  init:function( __Gibber ) {
    Gibber = __Gibber

    this.Tune = new this.__Tune()
    this.Tune.TuningList = this.__tunings

    if( Gibberish.mode === 'worklet' ) {
      this.id = Gibberish.utilities.getUID()

      // can't send prototype methods of Tune over processor
      // so they need to be explicitly assigned
      this.Tune.loadScale = this.Tune.__proto__.loadScale
      this.Tune.note = this.Tune.__proto__.note
      this.Tune.frequency = this.Tune.__proto__.frequency
      this.Tune.tonicize = this.Tune.__proto__.tonicize
      this.Tune.ratio = this.Tune.__proto__.ratio
      this.Tune.MIDI = this.Tune.__proto__.MIDI
      
      Gibberish.worklet.port.postMessage({
        address:'add',
        properties:serialize( Theory ),
        id:this.id,
        post:'store'
      })

      Gibber.addSequencing( this, 'root' )
      Gibber.addSequencing( this, 'tuning' )
      Gibber.addSequencing( this, 'mode' )

      this.tuning('et')
    }
  },

  loadScale: function( name ) {
    if( Gibberish.mode === 'worklet' ) {
      // if the scale is already loaded...
      if( this.__tunings[ name ] !== undefined ) {
        this.Tune.loadScale( name )
        Gibberish.worklet.port.postMessage({
          address:'method',
          object:this.id,
          name:'loadScale',
          args:[name]
        })
        return
      }

      fetch( 'js/external/tune.json/' + name + '.js' )
        .then( data => data.json() )
        .then( json => {
          Gibberish.worklet.port.postMessage({
            address:'addToProperty',
            object:this.id,
            name:'__tunings',
            key:name,
            value:json
          })

          Gibberish.worklet.port.postMessage({
            address:'method',
            object:this.id,
            name:'loadScale',
            args:[name]
          })

          this.__tunings[ name ] = json
          this.Tune.loadScale( name )
        })
    }else{
      this.Tune.loadScale( name )
    }
  },

  note: function( idx ) {
    let finalIdx, octave = 0, mode = null

    if( this.mode() !== null ) {
      mode = this.modes[ this.mode() ]
      octave = Math.floor( idx / mode.length )
      // XXX this looks ugly but works with negative note numbers...
      finalIdx = idx < 0 ? mode[ (mode.length - (Math.abs(idx) % mode.length)) % mode.length ] : mode[ Math.abs( idx ) % mode.length ]
    }else{
      finalIdx = idx
    }

    let freq = this.Tune.note( finalIdx, octave )

    // clamp maximum frequency to avoid filter havoc and mayhem
    if( freq > 4000 ) freq = 4000

    //console.log( idx, finalIdx, mode, mode.length, note, octave )

    return freq
  },

  mode: function( mode ) {
    if( mode !== undefined ) {
      this.__mode = mode
      if( Gibberish.mode === 'worklet' ) {
        Gibberish.worklet.port.postMessage({
          address:'method',
          object:this.id,
          name:'mode',
          args:[this.__mode]
        }) 
      }
    }else{
      return this.__mode
    }

    return this
  },

  root: function( root ) {
    if( root !== undefined ) {
      this.__root = root
      if( Gibberish.mode === 'worklet' ) {
        this.Tune.tonicize( this.__root )
        Gibberish.worklet.port.postMessage({
          address:'method',
          object:this.id,
          name:'root',
          args:[this.__root]
        }) 
      }else{
        this.Tune.tonicize( root )
      }
    }else{
      return this.__root
    }

    return this
  },

  tuning: function( tuning ) {
    if( tuning !== undefined ) {
      this.__tuning = tuning
      this.loadScale( this.__tuning )
    }else{
      return this.__tuning
    }

    return this
  }
}

module.exports = Theory
