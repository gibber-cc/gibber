const Gibberish = require( 'gibberish-dsp' )
const Ugen      = require( './ugen.js' )

const Busses = {
  create( Audio ) {
    const busses = {}

    const busDescription = { 
      properties:Gibberish.Bus.defaults,
      methods:null,
      name:'Bus',
      category:'misc'
    }

    busses.Bus = Ugen( Gibberish.Bus, busDescription, Audio )

    const bus2Description = { 
      properties:Gibberish.Bus2.defaults,
      methods:null,
      name:'Bus2',
      category:'misc'
    }

    busses.Bus2 = Ugen( Gibberish.Bus2, bus2Description, Audio )
    return busses
  }
}

module.exports = Busses
