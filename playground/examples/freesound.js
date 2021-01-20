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
Clock.bpm = 90
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
// by default these simple queries are limited to soundfiles under .5 seconds,
// that are classified as single notes/sounds, and where the filename does not 
// need to include the query term (the query term can just be in metadata). 
b = Freesound('crickets').fx.add( Freeverb() )
b.loops = 1
b.trigger(1)

// here's a more complex query
c = Freesound({ 
  query:'atari -loop', // will search for atari sounds that aren't loops 
  sort:'downloads',    // will sort sounds by downloads they have received
  max:2,							 // sounds will be two seconds maximum in length
  count:5							 // get 5 sounds
})
.fx.add( Delay({ time:1/16, feedback:.15 }) )

// sequence the Freesound object to trigger notes at different
// playback speeds and pan
c.rate.seq( [1,.75,.5,2], [1/2,1/4,1] )
c.trigger.seq( 1, 1/4 )
c.pan = gen( .5 + cycle(.25) * .45 )

// the number of sounds in the instrument is stored in .length
// this line will sequence picking a sample with each trigger 
c.pick.seq( Rndi(0, c.length) )

// pick a random sample from the returned results
d = Freesound({ 
  query:'drums +90 +bpm', // search for drums, 90, and bpm
  max:5, 							    // max of five seconds in length
  single:false, 					// files do not have to contain single sounds / notes
  filename:false,   // do not require query terms to be present in filename
  count:5,								// load five samples...
  maxVoices:1							// ... but only play one at a time
})
d.pick.seq( Rndi(0,d.length), 1 )
d.trigger.seq( 1,1 )

// the Freesound object uses the properties you pass to it to
// build up a query string that is used to query the Freesound
// database. You can also construct that query string yourself
// if you want complete control over the query... there are lots
// of powerful capabilities to explore this way.

e = Freesound('query=kick&sort=rating_desc&filter=ac_single_event:true original_filename:kick duration:[0 TO .25]', { count:10 })
e.trigger.seq( 1, Euclid(9,16))   
e.pick.seq( gen( beats(8) * e.length ) )

// here's the Freesound API documentation to help you construct your own queries: 
// https://freesound.org/docs/api/resources_apiv2.html#text-search
