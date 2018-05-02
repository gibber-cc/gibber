const Gibberish = require( 'gibberish-dsp' )

const Seq = function( props ) { 
  const __values  = props.values
  const __timings = props.timings
  const delay     = props.delay
  const target    = props.target
  const key       = props.key

  const values  = Array.isArray( __values ) ? __values : [ __values ]
  const timings = Array.isArray( __timings ) ? __timings : [ __timings ]

  return Gibberish.Sequencer({ values, timings, target, key })
}

module.exports = Seq
