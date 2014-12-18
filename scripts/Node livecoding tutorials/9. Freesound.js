// **NOTE**
// This functionality is not currently available in standalone gibber.audio.lib!!
// **NOTE**

AudioContext = require('web-audio-api').AudioContext
Gibber = require('../../build/gibber.audio.lib.js')
Gibber.init()

// thanks to the freesound.js library: https://github.com/g-roma/freesound.js

// first, we import the freesound module from the Gibber database
module('gibber/publications/freesound')

Clock.bpm = 90

// The Freesound object is a Sampler
// that can query the freesound.org database and download samples from it.
// The status bar will give you messages about the querying and downloading progress.
// You can use the Freesound object in a number of ways.

// download a specific sound identified by an id number obtained from the
// freesound.org website. For example, this next sound is taken from here:
// http://www.freesound.org/people/RealRhodesSounds/sounds/4048/
a = Freesound(4048);

// play the sample once at original speed
a.note(1)

// set the sample to loop and play again at 1.25 speed
a.loops = true
a.note(1.25)

// query the database for a particular term(s) and download the first response
// by default these simple queries are limited to soundfiles under 10 seconds
b = Freesound('crickets').fx.add(Reverb())
b.loops = true
b.note(1)
b.amp = .25

// query for the term 90, which will most likely return a file at 90bpm.
// sort the returned results from best to worst, the top result is picked by default
// set the duration to be 0 to 15 seconds.
c = Freesound({ query:'90 voice', rating:'downloads_desc', filter:'duration:[0.0 TO 15.0]' });
c.fx.add(Delay(1/16, .15), Schizo('paranoid', {mix:.25}))

// sequence the Freesound object to trigger notes at different
// playback speeds and pan
c.note.seq([1,1.25,1.5,.5,2].rnd(), [1/2,1/4,1/8,1,1/6].rnd(1/8,4,1/12,6))
c.pan.seq(Rndf(-1,1))

// pick a random sample from the returned results
d = Freesound({ query:'drum 90', pick:'random', filter:'duration:[0.0 TO 15.0]' });
d.note(1)
d.loops =true;

// for more info about the query syntax please see http://www.freesound.org/docs/api/resources.html
