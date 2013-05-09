define(["gibber/gibber"], function(_Gibber) {	
return {
default: '// This is a sample of what Gibber can do and isn\'t really\n'+
'// intended as a tutorial. There are many tutorials in\n'+
'// the Load menu at the top of the screen.\n'+
'//\n'+
'// Run lines in between comments one section at a time\n'+
'// by highlighting them and hitting ctrl + shift + return.\n'+
'// Or select everything at once and run it all together.\n'+
'\n'+
'G.setBPM(140);\n'+
'\n'+
'// x is a kick, o is a snare\n'+
'd = Drums("x.ox.xo.");\n'+
'd.amp = .55;\n'+
'\n'+
'// karplus-strong can create string or noise sounds depending on blend\n'+
'p = Pluck({\n'+
'	amp : .75,\n'+
'	blend : .5,\n'+
'	channels: 2,\n'+
'});\n'+
'p.mod("pan", LFO(2, .75));\n'+
'\n'+
'// sequence pluck with random 16th notes\n'+
's = ScaleSeq(rndi(0,16,31), 1/16).slave(p);\n'+
's.root = "C2";\n'+
'\n'+
'// create bass monosynth with a half-note attack, a whole-note decay\n'+
'b = Mono({\n'+
'	attack:1/2,\n'+
'	decay: 1,\n'+
'	amp: .35,\n'+
'  octave3 : 0,\n'+
'  cutoff: .2,\n'+
'  resonance: 2.5,\n'+
'});\n'+
'\n'+
'// sequence bass. "note" is positions in scale where 0 is the root\n'+
'c = ScaleSeq({\n'+
'  note :      [0,-2,-4], \n'+
'  durations:  [2, 1, 1],\n'+
'  root :      "C2",\n'+
'  slaves:     b\n'+
'});\n'+
'\n'+
'// add modulation changing blend of karplus-strong\n'+
'// this will move from string to noise sounds\n'+
'p.mod("blend", LFO(.25, 1), "=");\n'+
'\n'+
'// add buffer stuttering / repitching / reversing\n'+
'p.fx.add( Schizo() );\n'+
'\n'+
'// sequence drums randomizing every 4th measure and then reseting\n'+
'e = Seq( [ d.reset, d.shuffle ], [3, 1]);\n'+
'\n'+
'// make FM synth using glockenspiel preset. add chorus and delay.\n'+
'f = FM("glockenspiel", {\n'+
'  maxVoices:1, \n'+
'  amp: .225,\n'+
'  fx: [ Chorus(), Delay(_6, .8) ],\n'+
'});\n'+
'\n'+
'// sequence glockenspiel with random notes and random durations\n'+
'g = ScaleSeq({\n'+
'  note :      rndi(0,12,16), 		// 0-12 in the scale, generate 16 notes \n'+
'  durations : rndi([1/2, 2, 4], 32), // half note, two measures or four measures duration per note\n'+
'  slaves :    f,\n'+
'});\n'+
'\n'+
'// add fx to Master channel; this affects all sounds\n'+
'Master.fx.add( Flanger() );',

"GIBBER TUTORIALS":"LABEL START",
"synthesis + fx" :
'/*\n'+
'Synthesis + FX\n'+
'\n'+
'Here are some quick ways to get started with synthesis and fx in Gibber. For more\n'+
'details on synthesis, see the synthesis tutorials.\n'+
'\n'+
'The fx with Gibber all have default settings which will mostly be used here. Please\n'+
'view the (forthcoming!) documentation for details on all fx.\n'+
'*/\n'+
'\n'+
'// triangle wave at 440Hz, .15 amplitude\n'+
'// possible waveShapes are sine, tri, saw, square, pulse\n'+
's = Triangle(300, .15);\n'+
'\n'+
'// modulate the frequency of the triangle wave using a sequencer.\n'+
'// add the sequencer\'s output to the oscillators frequency\n'+
's.mod("frequency", Step([220, 0], _2), "+");\n'+
'\n'+
'// create tremolo by using a LFO to modulate the volume of the oscillator \n'+
'// (currently volume is inappropriately referred to as mix). Multiply the amplitude\n'+
'// of the oscillator times the output of the LFO\n'+
's.mod("amp",  LFO(4, 1), "*");\n'+
'\n'+
'// add a Delay effect with a delay time of 1/3 a measure and a Reverb effect with default settings\n'+
's.fx.add( Delay(_3), Reverb() );\n'+
'\n'+
'// bit crush / sample rate reduce; reduce to 8-bits and 8khz\n'+
's.fx.add( Crush(8, 8000) );\n'+
'\n'+
'// remove first effect in fx fx.add\n'+
's.fx.remove(0);\n'+
'\n'+
'// remove all fx, but not mods\n'+
's.fx.remove();\n'+
'\n'+
'// low-pass filter : 0..1 cutoff, 0..5 resonance \n'+
'f = LPF();\n'+
'\n'+
'// add ring modulator and filter\n'+
's.fx.add( Ring(), f );\n'+
'\n'+
'// change filter parameters\n'+
'f.resonance = 0\n'+
'f.cutoff = .4\n'+
'\n'+
'// remove frequency mod\n'+
's.removeMod("frequency");',

"rhythm + drums": 
'/*\n'+
'Rhythm + Drums\n'+
'\n'+
'Gibber is geared towards rhythmic music. The numbers at the top right show the current\n'+
'beat number of the Gibber transport. In order to sync to this transport, we use variables\n'+
'such as _1, _2, _4, _8. These variables represent a whole-note, half-note, quarter-note and\n'+
'eighth-note respectively. Any variable from _1 to _64 can be used to represent a time; the actual\n'+
'value stored in these variables is the number of samples each subdivision of a measure lasts.\n'+
'\n'+
'For example, at 120 BPM each measure lasts for two seconds, therefore _1 = 88200, _2 = 44100,\n'+
'_4 = 22050, _8 - 11025.\n'+
'\n'+
'You can also use more traditional notation: 1/8 for an eighth note, 1/2 for a half note, 3/8 for three eighth notes etc.\n'+
'\n'+
'The Drums objects is a quick way to enter beats; it uses a Seq object behind the scenes. See the\n'+
'Sequencer tutorial for more information.\n'+
'*/\n'+
'\n'+
'// x = kick, o = snare, * = closed hihat, - = open hihat. hits are triggered every quarter note\n'+
'd = Drums("xoxo", 1/4)\n'+
'\n'+
'// add soft-clipping distortion to entire kit\n'+
'd.fx.add( Clip(1000) )\n'+
'\n'+
'// pitches range from 0.001 to however high you want to go. \n'+
'd.pitch = 2;\n'+
'\n'+
'// pitch snare back down to original value\n'+
'd.snare.pitch = .5;\n'+
'\n'+
'// add delay fx to snare only\n'+
'd.snare.fx.add( Delay(1/6, .25) );\n'+
'\n'+
'\n'+
'// pass new sequence\n'+
'd.set("x -*")\n'+
'\n'+
'// change speed of pattern\n'+
'd.speed = 1/8;\n'+
'\n'+
'// change the master tempo. All sequencers will update themselves to match the\n'+
'// master clock speed whenever it is changed.\n'+
'Gibber.setBPM(100);\n'+
'\n'+
'// return to original sequence\n'+
'd.reset();\n'+
'\n'+
'// sequence kick, snare and hat with separate sequences so they can play simultaneously\n'+
'// see sequencing tutorial for more details\n'+
'Gibber.clear();\n'+
'd = Drums();\n'+
'\n'+
'kick = Seq("x...x..xx..xx...", 1/16).slave(d);\n'+
'hat  = Seq("*.*.*-***.*-*.**", 1/16).slave(d);\n'+
'sn   = Seq(".o", 1/4).slave(d);\n'+
'\n'+
'hat.shuffle(); // randomize hat sequence',

"the sequencer":
'/* \n'+
'The Seq object is one of the basic building blocks of Gibber. It is designed\n'+
'to be completely generic; it can sequence notes for a synth to play, functions to \n'+
'be executed and values to be assigned to object parameters.\n'+
'\n'+
'You can sequence as many parameters as you want from a single Seq object. The two unifying\n'+
'factors for all of these parameters are the "durations" (when the parameters will change) and\n'+
'the "slaves" (which objects will they be changed on). For ScaleSeq objects, "mode" and "root" are also \n'+
'used by the ScaleSeq object and not directly used to control slaves. \n'+
'\n'+
'When you create a Seq you give a bunch of arrays for properties you want to sequence. For example,\n'+
'if we want to sequence notes and change the amplitude for each note:\n'+
'\n'+
'a = Synth();\n'+
'b = Seq({\n'+
'  note: ["A4", "Bb4", "C5", "G4"],\n'+
'  amp:  [ .2 ,   .3 ,   .4,  .1 ],\n'+
'  slaves: a,\n'+
'  durations: 1/4,\n'+
'});\n'+
'\n'+
'The above Seq object slaves one synth and advances through the various sequences it contains\n'+
'every 1/4 note. The arrays holding the values are stored as properties of the Seq object. So, to\n'+
'access the array of amplitudes in the above sequence you would use b.amp.\n'+
'\n'+
'There is another special keyword, "function", that allows you to sequence calls to functions instead\n'+
'of controlling objects.\n'+
'\n'+
'c = Seq({\n'+
'  function: [ function() { G.setBPM(180); }, function() { G.setBPM(100); } ],\n'+
'  durations: 2,\n'+
'});\n'+
'\n'+
'\n'+
'There is also a shorthand version that we\'ll use in this tutorial. It takes the form of:\n'+
'\n'+
'Seq(\n'+
'    array   : sequenced objects / primitives, \n'+
'    num     : step speed (optional, default = _1 / length of sequence array),\n'+
'    string  : name of method or property of object to sequence (optional, default = "note" or "function") \n'+
');\n'+
'*/\n'+
'\n'+
's = Synth();\n'+
's.fx.add( Reverb() )\n'+
'\n'+
'// create a sequence object by passing an array of notes\n'+
'// this sequence will not have a ugen slaved, but once it has one it will output note messages (default)\n'+
'q = Seq(["F4", "G4", "A4", "E4"], 1/4);\n'+
'\n'+
'// tell the sequence object to control the synth\n'+
'q.slave(s);\n'+
'\n'+
't = Synth();\n'+
't.fx.add( Reverb() )\n'+
'r = Seq(["A5", "A#5", "C#5", "D5"], 1/4).slave(t);\n'+
'\n'+
'// assign new values to the note sequence\n'+
'q.note = ["F4", "G4",  "D4",  "C4"];\n'+
'r.note = ["A5", "A#5", "C#5", "B5"];\n'+
'\n'+
'// change the speed of each sequence step\n'+
'r.speed = q.speed = 1/8;\n'+
'\n'+
'// randomize the sequences\n'+
'q.shuffle();\n'+
'r.shuffle();\n'+
'\n'+
'// reset them to their original values\n'+
'q.reset();\n'+
'r.reset();\n'+
'\n'+
'// stop, pause and play sequences. stop resets the phase of the sequence to 0, pause does not.\n'+
'q.stop();\n'+
'q.play();\n'+
'q.pause();\n'+
'q.play();\n'+
'\n'+
'// Sequences can also be applied to graphics...\n'+
'graphics();\n'+
'\n'+
'a = Cube({ fill:[1,0,0], stroke:[.5,0,0] });\n'+
'a.scale = 2;\n'+
'\n'+
'b = Seq({\n'+
'  scale : [ .5, 2, 1, .1, 6 ],\n'+
'  rotation : _rndf( 0, 6.28, 3 ), // return a random array of three values between 0 and 2PI\n'+
'  durations: 1/2,\n'+
'  slaves:a\n'+
'});',

"audio input, sampling, looping":
'/* Audio Input, Sampling and Looping\n'+
'\n'+
'First, you must follow the instructions here:\n'+
'http://www.html5audio.org/2012/09/live-audio-input-comes-to-googles-chrome-canary.html\n'+
'\n'+
'... which include using Chrome Canary, the experimental build of Chrome. Canary can live\n'+
'peacefully on your computer next to a stable version of Chrome. If the demo at the link\n'+
'above works, you can bring audio into Gibber with the following : \n'+
'\n'+
'(WARNING, feedback very possible if you are using a built-in laptop mic and laptop speakers, \n'+
'use headphones!!!)\n'+
'*/\n'+
'\n'+
'a = Input();\n'+
'\n'+
'/* now you can apply fx to the input like any other synth and monitor them live */\n'+
'\n'+
'a.fx.add( Delay(1/4), Schizo() );\n'+
'\n'+
'/* to sample it we create a Sampler and tell it to record the input for a number of measures */\n'+
'\n'+
'b = Sampler();\n'+
'b.record(a, 2);\n'+
'\n'+
'/* you can disconnect the input from the output bus at any time */\n'+
'\n'+
'a.disconnect();\n'+
'\n'+
'/* to playback the recording, trigger a note message on the sampler. Pass a playback speed as\n'+
'an option to the method; negative speeds will play in reverse*/\n'+
'\n'+
'b.note(2);\n'+
'b.note(-1);\n'+
'\n'+
'/* and of course we can sequence it... */\n'+
'\n'+
'c = Seq({\n'+
'	note:[.5,1,-1,-2,4],\n'+
'  durations:1,\n'+
'  slaves:b\n'+
'});\n'+
'\n'+
'/* you can also apply fx to the sampler. We can also create a Looper to overdub parts. The syntax is:\n'+
'\n'+
'l = Looper( audioToLoop, howLongPerLoop, howManyLoops);\n'+
'\n'+
'... and give it the loop() command to start looping. So to record 4 overdubs of our \n'+
'mic input for two measures each: */\n'+
'\n'+
'd = Input();\n'+
'e = Looper(d, 1, 4).loop();\n'+
'\n'+
'/* Looper has start and stop methods and you can attach fx to it. The loops are each a Sampler object;\n'+
'all loops are stored in the children array. Thus, to pan the loops we could do this: */\n'+
'\n'+
'd.disconnect();\n'+
'e.children.all( function() { this.pan = rndf(-.75, .75); } );\n'+
'\n'+
'/* you can also apply fx to individual loops */\n'+
'\n'+
'e.children[1].fx.add( Delay(1/8), Schizo(\'paranoid\') );\n'+
'\n'+
'/* and change the pitch of the looper (but not the individual loops (yet)) */\n'+
'\n'+
'e.pitch = 2;\n'+
'e.pitch = -2;',

"scales + theory":
'// shows how to use Gibber.mode, Gibber.root and the ScaleSeq object\n'+
'// scales come from teoria.js\n'+
'\n'+
'// first, create a pair of synths, add reverb and adjust attack/delay times\n'+
's = Synth();\n'+
's.fx.add( Reverb() )\n'+
'ss = Synth();\n'+
'ss.fx.add( Reverb() )\n'+
'\n'+
's.attack = ss.attack = ms(10);\n'+
's.decay  = ss.decay  = ms(50);\n'+
'\n'+
'// assign a mode and root note to Gibber.\n'+
'G.mode = "lydian";\n'+
'G.root = "D4";\n'+
'\n'+
'// ScaleSeq uses whatever mode and root is currently defined in Gibber.\n'+
'// Each value in the sequence defines an offset from the root note in terms of the scale, NOT IN TERMS OF HALF / WHOLE STEPS.\n'+
'// The default is C4 aeolian; we just changed it to D4 Lydian\n'+
'q  = ScaleSeq([0,1,5,3,0,6,7,-5], 1/16).slave(s);\n'+
'qq = ScaleSeq([0,4,3,6,4,5,9,-3], 1/16).slave(ss);\n'+
'\n'+
'// We can manually change the mode of any ScaleSeq. We can also change the root.\n'+
'qq.mode = q.mode = "majorpentatonic"\n'+
'qq.root = q.root = "A4";\n'+
'\n'+
'// We can easily sequence changes to modes using the Seq object. Just pass "mode"\n'+
'// as the last parameter and it will change that property of q.\n'+
'a = Seq([ "minor", "majorpentatonic" ], 1, "mode").slave(q, qq);\n'+
'\n'+
'// We can also easily sequence the root key\n'+
'b = Seq(["D4", "E4", "F#4", "A4"], 1/2, "root").slave(q, qq);\n'+
'b.speed = _1\n'+
'\n'+
'// set sequence to loop through all available modes. All modes are also stored in Gibber.modes\n'+
'// major can be substituted for ionian, minor can sub for aeolian\n'+
'b.stop();\n'+
'a.mode = [ "ionian", "dorian",  "phrygian", "lydian", "mixolydian", "aeolian", "locrian", "majorpentatonic", "minorpentatonic", "chromatic"];\n'+
'\n'+
'// change q to play each note in scale (with some extra notes on the pentatonic ones)\n'+
'q.set( [0,1,2,3,4,5,6,7]);\n'+
'qq.set([3,4,5,6,7,1,2,3]);',

"chords + arp":
'/*\n'+
'Chords\n'+
'Chords are created in Gibber using the teoria.js library. Gibber\'s format is slightly different;\n'+
'it lets you specify the octave in addition to the tonic note and the chord sonority. Here are\n'+
'some examples:\n'+
'\n'+
'C3M7 - C major chord, dominant 7th, root is C3.\n'+
'C3m7 - C minor chord, dominant 7th, root is C3.\n'+
'Db4dim - Db diminished chord, root is Db4\n'+
'A#3Maj7 - A# major seventh chord\n'+
'F3M9b5 - F major 9 flat 5 chord\n'+
'G3aug  - G augmented chord\n'+
'\n'+
'In Gibber we can use these chords with the Synth, FM and Pluck objects assuming we tell these\n'+
'to be polyphonic using the maxVoices parameter. The Arp (arpeggiator) object also accepts chords\n'+
'that it then sequences... you can slave a synth to an arp just like you would a Seq object.\n'+
'*/\n'+
'\n'+
'// create a poly object and assign five note polyphony\n'+
'p = Synth( {maxVoices: 5, attack: ms(1000), decay: ms(1000) } );\n'+
'p.fx.add( Reverb() );\n'+
'\n'+
'// play a chord at .5 amplitude\n'+
'p.chord("C4m7", .5);\n'+
'\n'+
'// play a chord at .25 amplitude\n'+
'p.chord("Bb3maj7", .25);\n'+
'\n'+
'// sequence chord changes using chord calls\n'+
's = Seq(["C4m7", "D4m7", "Bb3maj7", "Ab3maj7"], 1, "chord").slave(p);\n'+
'\n'+
's.stop();\n'+
'\n'+
'// also sequence amplitudes, long form\n'+
's = Seq({\n'+
'  chord: [["C4m7", .15], ["D4m7", .025], ["Bb3maj7", .1], ["Ab3maj7", .3]],\n'+
'  speed: 1,\n'+
'  slaves: p,\n'+
'});\n'+
'\n'+
'\n'+
'// create a sine wave to arpeggiate\n'+
'high = Sine(440, .1);	\n'+
'high.fx.add( Reverb() );\n'+
'\n'+
'// create arpeggiator with chord, note duration, direction and number of octaves\n'+
'a = Arp("C4m7", 1/32, "updown", 3);\n'+
'a.slave(high);	// slave oscillator to arp\n'+
'\n'+
's.slave(a);		// slave chord of arp to same sequencer that is controlling our Poly',

"sequence functions" :
'// This shows how sequencers can sequence commands in addition to notes, volumes etc.\n'+
'// There is a tutorial on the Seq object that should be read first to understand this.\n'+
'\n'+
'// create a synth and specify attack/delay/amp values, add delay + reverb\n'+
's = Synth({\n'+
'    attack: ms(10),\n'+
'    decay: ms(50),\n'+
'    amp:.25\n'+
'});\n'+
's.fx.add( Delay(1/8), Reverb() );\n'+
'\n'+
'// Sequence using the default Gibber scale, C4 Aeolian\n'+
'// See scales and theory for details on the ScaleSeq object\n'+
'q = ScaleSeq([ 0,1,5,3,0,6,7,-5 ], 1/16).slave(s);\n'+
'\n'+
'// Every two measures, alternate between randomizing the sequence and resetting it to its original value\n'+
'// IMPORTANT: Note we do not call the functions using (), we just pass references to them\n'+
'p = Seq([ q.shuffle, q.reset ], 2);\n'+
'\n'+
'// fade out synth and stop sequence when synth volume is just about inaudible.\n'+
'v = Seq([ function() { s.amp *= .8; if(s.amp < .001) q.stop(); } ]);',

"granulation" :
'// create a synth to sample and sequence it\n'+
'u = Drums(\'x*o*x*o-\');\n'+
'\n'+
'// Create the granulator sampling our drums, 20 grains, each grain is 50ms\n'+
'// The minimum speed for grain playback is .5, the max is 1.5. Record a buffer\n'+
'// of two measures in length from the input to granulate.\n'+
'g = Grains({\n'+
'	input           : u,\n'+
'	bufferSize      : 2,\n'+
'	numberOfGrains  : 20,\n'+
'	speedMin        : .5,\n'+
'	speedMax        : 1.5,\n'+
'	amp	            : .35,\n'+
'});\n'+
'g.fx.add( Reverb() );\n'+
'\n'+
'// stop the drums if desired\n'+
'u.stop();\n'+
'g.amp = 1;\n'+
'\n'+
'// Loop the start and end positions of the buffer that the granulator loops through.\n'+
'// Tell the granulator how long (in measures) it should take to travel through the buffer.\n'+
'g.loop(.25, .75, 4)\n'+
'// change the speed so grains can play in revers\n'+
'g.speedMin = -2;\n'+
'\n',

"graphics" :
'// initialize graphics. pass false (or nothing) to not enter fullscreen mode\n'+
'Graphics.init({ fullScreen:true });\n'+
'\n'+
'// set the background color. Can also use color names, a single value (grayscale) or three numbers as a shorthand\n'+
'Graphics.background({ r:0, g:.25, b:0 });\n'+
'\n'+
'// also try Cube, Sphere, Torus, Knot, Cylinder, Octahedron, Tetrahedron \n'+
'a = Icosahedron({\n'+
'	fill: "black",	// or [0,0,0] or {r:0, g:0, b:0} or 0\n'+
'  stroke: "white",\n'+
'});\n'+
'a.spin( .01,.01,.01 );\n'+
'\n'+
'// alternatively use a.scale.x etc.\n'+
'a.scale = 1.5;\n'+
'\n'+
'// film grain effect\n'+
'c = Film();\n'+
'// number of scanlines\n'+
'c.sCount = 12;\n'+
'Graphics.fx.add( c );\n'+
'\n'+
'd = Drums( "x*o*x*o*" );\n'+
'\n'+
'// create envelope= follower tracking drums\n'+
'f = Follow( d );\n'+
'\n'+
'e = Blur();\n'+
'Graphics.fx.add( e );\n'+
'\n'+
'// mod horizontal blur amount based on envelope follower\n'+
'e.mod( "h", f, "=", .1 );',

"randomness and algorithms" :
'/* Randomness and Algorithms\n'+
'\n'+
'There are some simple mechanisms for creating generative music. First, there are \n'+
'two random methods, one for floats and one for ints: rndf and rndi. These two methods\n'+
'are heavily overloaded.\n'+
'\n'+
'rndf(); Generate a random float between 0 and 1\n'+
'rndf(10); Generate a random float between 0 and 10\n'+
'rndi(5, 10); Generate an integer between 5 and 10\n'+
'rndi(0, 10, 150); Return an array of 150 integers between 0 and 10\n'+
'rndf([.2, .4, .7, .9], 25); Return an array of 25 numbers either .2, .4, .7 or .9\n'+
'\n'+
'With that in mind, here\'s a simple randomized sequencer: */\n'+
'\n'+
'a = Synth();\n'+
'b = Seq( function() { a.note( rndi(440, 880) ) }, 1/2).slave(a);\n'+
'\n'+
'// and here\'s one with an array of 5 set random values:\n'+
'\n'+
'c = Synth();\n'+
'd = Seq( rndf(440, 880, 5), 1/4).slave(c);\n'+
'\n'+
'/* Whenever a sequencer advances through an array of values, it checks to see if that\n'+
'array has a pick function. If a pick function exists then it uses that function to pick\n'+
'out an item from the array instead of linearly advancing through it. Notice how once we\n'+
'add a pick function to the note array the same note is always returned: */\n'+
'\n'+
'e = Synth();\n'+
'f = Seq( rndf(440, 880, 10), 1/4).slave(e);\n'+
'\n'+
'// wait a few seconds, then run the line below\n'+
'f.note.pick = function() { return 660; };\n'+
'\n'+
'/* Gibber includes a couple of functions to help define pick functions for you. One simple\n'+
'example is the surpriseMe() function, which will return a function that randomly selects an\n'+
'element from the array each time the sequencer advances. */\n'+
'\n'+
'g = Synth();\n'+
'h = Seq( rndf(440, 880, 4), 1/4).slave(g);\n'+
'\n'+
'// wait a few seconds, then run the line below\n'+
'h.note.pick = surpriseMe();\n'+
'\n'+
'/* Another useful function to generate a pick is weight(). Weight allows you to weight the\n'+
'likelihood of each note being picked in an array. For example, if we wanted to stress the\n'+
'root of a scale and eighth note durations we could do the following: */\n'+
'\n'+
'i = Synth( { attack:ms(10), decay:ms(500) } );\n'+
'j = ScaleSeq({\n'+
'  note:[0,2,3,5,7,8],\n'+
'  durations:[1/8, 1/4, 1/2],\n'+
'  slaves:[i],\n'+
'  root:"C2",\n'+
'});\n'+
'\n'+
'// wait a few seconds and then run the line below\n'+
'j.note.pick = weight(.7, .1, .1, .05, .05); // weights should add up to 1\n'+
'\n'+
'// wait a while and then run this to emphasize eighth notes\n'+
'j.durations.pick = weight(.8, .1, .1);',

"agents" :
"// Agents have a shape and a sound. By default when they move vertically their pitch changes, when the move\n"+
"// left to right their panning changes.\n"+
"Graphics.init(true);\n"+
"\n"+
"a = Agent({\n"+
"  shape: { type:'Icosahedron', scale:1 },\n"+
"  sound: { type:'Triangle', amp:.025 },\n"+
"});\n"+
"\n"+
"b = Seq({\n"+
"  position: _rndf(-100,100,3),\n"+
"  durations:1/4,\n"+
"  slaves:a\n"+
"});",

"SYNTHESIS TUTORIALS":"LABEL START",

"Additive":
'/* \n'+
'Complex tones can often be represented by a combination of sine waves. This synthesis\n'+
'technique is termed "additive synthesis". Harmonic sounds are created when the frequency\n'+
'of every sine wave is a multiple of the lowest component. The lowest component is referred\n'+
'to as the fundamental. Example:\n'+
'*/\n'+
'\n'+
'Sine(220, .15)  // fundamental\n'+
'Sine(440, .075) // first harmonic\n'+
'Sine(660, .025) // second harmonic\n'+
'\n'+
'/*\n'+
'Many of the classic waveforms of electronic music can be reconstructed using additive\n'+
'synthesis techniques. For example, a square wave only contains odd numbered harmonics.\n'+
'The amplitude of each harmonic is the inverse of its number in the harmonic series...\n'+
'thus the 3rd harmonic has 1/3rd the amplitude of the fundamental, the 5th harmonic\n'+
'amplitude is 1/5th the amplitude of the fundamental, etc. Make sure you run the first line\n'+
'below before attempting to create the sine waves.\n'+
'*/\n'+
'\n'+
'fundamentalAmplitude = .15\n'+
'Sine(110, fundamentalAmplitude)     // fundamental\n'+
'Sine(330, fundamentalAmplitude / 3) // 3rd harmonic\n'+
'Sine(550, fundamentalAmplitude / 5) // 5th harmonic\n'+
'Sine(770, fundamentalAmplitude / 7) // 7th harmonic\n'+
'Sine(990, fundamentalAmplitude / 9) // 9th harmonic\n'+
'\n'+
'/*\n'+
'We can also create inharmonic partials (a partial is any component of a spectrum) to\n'+
'create more interesting timbres. In the example below, the inharmonic relationships\n'+
'create a grittier sound with a beating effect stemming from phase cancellation.\n'+
'*/\n'+
'\n'+
'fundamentalAmplitude = .15\n'+
'Sine(110, fundamentalAmplitude)     // fundamental\n'+
'Sine(335, fundamentalAmplitude / 3) // 3rd harmonic\n'+
'Sine(550, fundamentalAmplitude / 5) // 5th harmonic\n'+
'Sine(871, fundamentalAmplitude / 4) // 7th harmonic\n'+
'Sine(973, fundamentalAmplitude / 9) // 9th harmonic',

FM:
'/* (skip to the bottom if you want to see the simplest way to do FM synthesis in Gibber)\n'+
'\n'+
'FM (frequency modulation) synthesis refers to rapidly changing the frequency of an\n'+
'oscillator according to the output of another oscillator. The main oscillator whose \n'+
'frequency is changed is termed the "carrier". The modulating oscillator is the "modulator".\n'+
'\n'+
'When the modulator frequency is in the sub-audio domain vibrato is created. In the example below,\n'+
'the modulating sine wave has an amplitude of 4. This means it will create values in the range {-4, 4}.\n'+
'After adding this modulation the frequency of the carrier sine wave (c) will fluctate between 236 and 244.\n'+
'*/\n'+
'\n'+
'c = Sine(240, .15);\n'+
'\n'+
'c.mod("frequency", LFO(4, 10), "+");  // Vibrato - modulating frequency 8 times per second by +/- 4Hz\n'+
'\n'+
'/*\n'+
'The mod command in Gibber simply modulates the named parameter ("freq") using the provided\n'+
'modulation source. In FM synthesis, we add the modulator output to the carrier frequency, so\n'+
'the third parameter is simply "+".\n'+
'\n'+
'Sub-audio modulation is not typically referred to as FM; FM more commonly refers to using a\n'+
'modulator in the audio range to mod the frequency of the carrier. Below is an example of a "bell"\n'+
'recipe for FM synthesis. In this recipe:\n'+
'\n'+
'modulator frequency = 1.4 * carrier frequency\n'+
'modulator amplitude < carrier frequency\n'+
'\n'+
'*/\n'+
'\n'+
'carrierFrequency = 200;\n'+
'c = Sine(carrierFrequency, .15);\n'+
'\n'+
'c.mod("frequency", LFO(carrierFrequency * 1.4, 190), "+"); \n'+
'\n'+
'/*\n'+
'If we use a synth for this we get an envelope that can be triggered via the note command.\n'+
'A short attack and long decay will give us some nice bell sounds. Especially if we add some reverb :)\n'+
'*/\n'+
'\n'+
'noteFrequency = ntof("F3"); // ntof is note-to-frequency\n'+
'\n'+
'c = Synth("Sine", .15);\n'+
'c.fx.add( Reverb() );\n'+
'c.mod("frequency", LFO( noteFrequency * 1.4, noteFrequency * .95), "+");\n'+
'c.attack  = ms(1);        // 1 ms attack time\n'+
'c.decay   = ms(6000);     // 1000 ms decay\n'+
'\n'+
'c.amp = .5;\n'+
'c.note(noteFrequency);\n'+
'\n'+
'/*\n'+
'Note that, in the above code snippet, the amplitude of the modulator changes proportionally to the\n'+
'carrier frequency. John Chowning, inventor of FM synthesis, refers to this as the "index" of the\n'+
'synthesis algorithm. We have taken the carrier : modulation ratio, the index, an attack and decay envelope\n'+
'and wrapped it up into a synth for use in Gibber. Here is the syntax:\n'+
'\n'+
'FM(carrierToModulatorRatio, index, attack, decay)\n'+
'\n'+
'And below is a code sample that creates a "brassy" sound (depending on how forgiving you are).\n'+
'*/\n'+
'\n'+
'f = FM(1 / 1.0007, 5, ms(100), ms(100));\n'+
'f.fx.add( Reverb() );\n'+
's = Seq(["A4", "B4", "B4", "C5"], _8).slave(f);\n'+
'\n'+
'/* Finally, there are a number of presets that can be called with the FM object; the algorithm given above\n'+
'is the "brass" preset. Other presets include glockenspiel, gong, clarinet, frog, drum and drum2. Hopefully\n'+
'more will be added in the future. */\n'+
'\n'+
'g = FM("clarinet");\n'+
'g.note("A5");\n',
};
});