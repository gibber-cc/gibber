/* Soundfonts Tutorial
** Soundfonts are collections of samples that 
** typically follow the General MIDI specification:
** 
** https://pjb.com.au/muscript/gm.html#patch
**
** They're probably the best tool in gibber
** to get instruments that sound "real"... think
** an acoustic piano or bowed cello. That said
** they are not high-quality samples... really
** good sample sets are huge in filesize and not
** well-suited for the web.
**
** Gibber includes access to five different banks
** of soundfonts made by different people. Some are
** taken from the great webaudiofont repository:
**
** https://github.com/surikov/webaudiofontdata
**
** The soundfonts gibber includes are, in order,
** Asprin, Chaos, FluidR3, GeneralUserGS, and JCLive.
** Let's try them out!
*/

verb = Reverb('space').bus()

s = Soundfont('Acoustic Grand Piano').connect( verb, .25 )

s.chord( rndi(0,14,6) )

// reverb really helps soundfonts sound better. let's try
// the same sound with a different bankk for comparison.

s2 = Soundfont('Acoustic Grand Piano', { bank: 2 }).connect( verb, .25 )
s2.chord( rndi(0,14,6) )

// s2 sounds brighter to me, but I like both patches. There
// are five banks available (numbered 0-4); 0 is the default
// bank if none is specified. 

// to see a list of all soundfonts, just place single
// quotes in between the parenthesis following the 
// constructor

s3 = Soundfont( )
// put '' -----^

Clock.bpm = 140
s4 = Soundfont('String Ensemble 1', { bank:3 }).connect( verb, 1 )
s4.chord.seq( Rndi(-14,14,6), 2 )
s4.gain = .5
 
s5 = Soundfont('Timpani').connect( verb, .1 )
s5.note.tidal( '<[-14 -14*3] [-12 -12*3]>')

