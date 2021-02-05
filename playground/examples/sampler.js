/* Sampler Tutorial
**
** First, we'll note that both the Freesound
** and the Drums objects use Samplers behind
** the scenes, so if you've played with Gibber
** a bit you've probably been using Samplers
** without realizing it. Samplers enable you to
** load a audiofile from a webserver and then
** play it back at different speeds. The
** Multisampler object enables you to load a 
** bunch of different samples, and then select
** the sample that you'd like to trigger on a
** per-note basis.
**
** While there are some samples sitting on 
** Gibber's server for you to use, you'll
** probably eventually want to experiment with
** your own samples. To do this, you need a 
** web server. If you're comfortable with
** JavaScript, I recommend using http-server:
**
** https://github.com/indexzero/http-server
**
** You need to turn on the CORS feature to
** load samples from a different server than
** you're loading Gibber from. You could run it
** like so after installation:
**
** http-server pathToYourSampleDirectory -p 8080 --cors true
**
** This starts the server on port 8080. Now to
** load a file (assuming its in the directory
** you specified above):
*/

s = Sampler({ filename:'http://127.0.0.1:8080/yourSammpleName.wav' })

/* Great! When you call .note on a Sampler, it
** doesn't use the default tuning system in
** gibber, instead it controls the rate the
** sample is played back at. Let's use a sample
** on Gibber's server to experiemnt.
*/

s = Sampler({ filename:'resources/audiofiles/openhat.wav' })

// playback at normal rate
s.note(1)

// playback at 3x speed
s.note(3)

// playback in reverse
s.note(-1)

// sequence
s.note.seq( [3,3,-1],[1/4,1/4,1/2] )

// we can also call .trigger and then
// control the rate property separately

Gibber.clear()
s = Sampler({ filename:'resources/audiofiles/openhat.wav' })
s.trigger.seq( 1, 1/4 )
s.rate = gen( 1 + cycle(1) * .75 )

// or sequence
s.rate.seq( [-1,1,2,-2,4,-4], Euclid(3,8) )

// samplers also have start and end properties,
// which let you control how much of the
// sample is played (range 0–1).

Gibber.clear()
s = Sampler({ filename:'resources/audiofiles/openhat.wav' })
s.trigger.seq( 1,1/4 )
s.end.seq( [.05,.1,.2,.5], 1 )

// OK, let's move on to the Multisampler, which
// lets you load multple files. Here's a quick
// example using Gibber's drums samples:

Gibber.clear()
s = Multisampler({
  files:[
    'resources/audiofiles/kick.wav',
    'resources/audiofiles/hat.wav',
    'resources/audiofiles/snare.wav',
    'resources/audiofiles/openhat.wav'
  ]
})


s.trigger.seq( 1,1/16 )
// pick lets you choose which file is triggered
// make sure you don't pick a number higher than
// then number of samples you've loaded!
s.pick.seq( Rndi(0,3) )

// We've uploaded a few fun Multisampler presets
// to play with. They are drums (same as above),
// beatbox, cr7030, bleeps, and kicks. Each preset
// has a length property that will tell you how
// many samples it contains. So, for example, if
// we want to loop through all the kicks:

Gibber.clear()
s = Multisampler('kicks')
s.trigger.seq( 1, 1/16 )
s.pick.seq( gen( beats(16) * s.length ) )

// Note that in the 'kicks' preset there are
// 90 files... this is why it makes sense
// to run your own local webserver, so that
// large directories of files can be loaded 
// quickly.

// as a shorthand, you can create a multisampler
// with multiple voices (it can play different samples
// at the same time) using the same shorthand 
// as defining polyphony on synths. For example,
// the following creates a five voice multisampler:

s = Sampler[5]( 'kicks' )
s.trigger.seq( 1, 1/16 )
s.pick.seq( gen( beats(16) * s.length ) )
