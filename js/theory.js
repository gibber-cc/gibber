const Gibberish = require( 'gibberish-dsp' )
const serialize = require( 'serialize-javascript' )
const Tune      = require( './external/tune-api-only.js' )

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
    
    marion:{"frequencies":[261.6255653006,271.31540105247,279.06726965397,284.8811711051,293.02063313667,303.87324917877,305.22982618403,310.07474405997,325.57848126297,334.88072358477,341.85740532612,348.83408706747,366.27579142084,379.84156147346,390.69417751556,406.97310157871,418.60090448096,427.32175665765,434.10464168396,455.80987376816,465.11211608996,474.80195184183,488.36772189445,512.78610798918,523.2511306012],"description":"Marion's 7-limit Scale # 26"}

  },  

  store:function() { 
    Gibberish.Theory = this

    this.Tune.TuningList = this.__tunings
    //this.init()
    //this.Tune = new this.__Tune()
    //this.Tune.TuningList = this.__tunings
  },

  init:function() {
    this.Tune = new this.__Tune()
    this.Tune.TuningList = this.__tunings

    if( Gibberish.mode === 'worklet' ) {
      this.id = Gibberish.utilities.getUID()
      console.log( 'initializing theory...' )

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
    }
  },

  loadScale: function( name ) {
    if( Gibberish.mode === 'worklet' ) {
      // if the scale is already loaded...
      if( this.__tunings[ name ] !== undefined ) return

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
        })
    }else{
      this.Tune.loadScale( name )
    }
  },

  note: function( idx, octave=0 ) {
    return this.Tune.note( idx, octave )
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
        Gibberish.worklet.port.postMessage({
          address:'set',
          object:this.id,
          name:'root',
          value:this.__root
        }) 
      }
    }else{
      return this.__root
    }

    return this
  },

  tuning: function( tuning ) {
    if( tuning !== undefined ) {
      this.__tuing = tuning
      if( Gibberish.mode === 'worklet' ) {
        Gibberish.worklet.port.postMessage({
          address:'set',
          object:this.id,
          name:'tuning',
          value:this.__tuning
        }) 
      }
    }else{
      return this.__tuning
    }

    return this
  }
}

module.exports = Theory
