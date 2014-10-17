// must be global! no way to fix this that I can think of...
AudioContext = require('web-audio-api').AudioContext

// must be global! this should be fixable.
Gibber = require('../gibber/gibber.js')

console.log( 'This is a test of using gibber.audio.lib in node (gibber.audio.lib also works in the browser). If you hear beats, the test passed. ctrl+c to exit.' )

Gibber.init()

Gibber.scale.root.seq( ['c4','eb4'], 2)

a = Mono('bass').note.seq( [0,7], 1/8 )

b = EDrums('xoxo')
b.snare.snappy = 1

b.fx.add( Reverb() )

c = Mono('easyfx')
  .note.seq( Rndi(0,12), [1/4,1/8,1/2,1,2].rnd( 1/8,4 ) )
  
future( function() {
  d = Pluck({ amp:.85 })
    .note.seq( Rndi(200,600), 1/16 )
    .blend.seq( Rndf() )
    .pan.seq( Rndf(-1,1) )
    .fx.add( Schizo('paranoid') )
}, 8 )