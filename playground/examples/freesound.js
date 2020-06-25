/* __--__--__--__--__--__--__--____

Fun with Freesound

The Freesound object is a Sampler that 
can query the freesound.org database 
and download samples from it. The console 
will give you messages about the querying
and downloading progress. You can query 
the Freesound database in a number of ways.
    
** __--__--__--__--__--__--__--__*/

// download a specific sound identified by an id number obtained from the 
// freesound.org website. For example, this next sound is taken from here:
// http://www.freesound.org/people/RealRhodesSounds/sounds/4048/
a = Freesound( 4048 )

// play the sample once at original speed
a.trigger( 1 )

// the note method of the Freesound object (and all Sampler objects)
// acts differently from other synths. Instead of using Gibber's theory
// system, the note value sets the sampler's .rate property in addition
// to triggering its envelope.

// twice the normal speed
a.note( 2 )
// reversed, slowed
a.note( -.5 ) 

// set the sample to loop and play again at 1.25 speed
a.loops = 1
a.rate = 1.25

// query the database for a particular term(s) and download the first response
// by default these simple queries are limited to soundfiles under 10 seconds
b = Freesound('crickets').fx.add( Freeverb() )
b.loops = 1
b.gain = .75

// sort the returned results from best to worst according to user rating; 
// the top result is picked by default.
// set the query duration to files between 0–15 seconds.
c = Freesound({ query:'atari', rating:'downloads_desc', filter:'duration:[0.0 TO 15.0]' })
c.fx.add( Delay({ time:1/16, feedback:.15 }) )
// sequence the Freesound object to trigger notes at different
// playback speeds and pan
c.note.seq( [1,.25,.5,2], [1/2,1/4,1] )
c.pan = gen( .5 + cycle(.25) * .45 )

// pick a random sample from the returned results
d = Freesound({ query:'drums 90', pick:'random', filter:'duration:[0.0 TO 15.0]' })
d.note( 1 )
d.loops = 1

// for more info about the query syntax please see http://www.freesound.org/docs/api/resources.html
