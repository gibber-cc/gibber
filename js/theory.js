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
  __tuning:'just',
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
        493.883301
      ],
      description:'equal tempered (edo)'
    }
  },  

  store:function() { 
    Gibberish.Theory = this

    this.Tune.TuningList = this.__tunings
    this.Tune.loadScale('et')
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

  note: function( idx, octave=0 ) {
    const note = this.Tune.note( idx, octave )
    return note
  },

  mode: function( mode ) {
    if( mode !== undefined ) {
      this.__mode = mode
      if( Gibberish.mode === 'worklet' ) {
        Gibberish.worklet.port.postMessage({
          address:'set',
          object:this.id,
          name:'mode',
          value:this.__mode
        }) 
      }
    }else{
      return mode
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
