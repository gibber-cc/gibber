Gibber.defaultScripts = {
default:
'// This is a sample of what Gibber can do and isn\'t really\n'+
'// intended as a tutorial. There are many tutorials in\n'+
'// the Load menu at the top of the screen.\n'+
'//\n'+
'// Run lines in between comments one section at a time\n'+
'// by highlighting them and hitting ctrl + shift + return.\n'+
'// Or select everything at once and run it all together.\n'+
'\n'+
'G.setBPM(140)\n'+
'\n'+
'// x is a kick, o is a snare\n'+
'd = Drums("x.ox.xo.");\n'+
'd.pitch *= 2;\n'+
'\n'+
'// karplus-strong can create string or noise sounds depending on blend\n'+
'p = Pluck();\n'+
'p.amp = .3\n'+
'p.blend = .5;\n'+
'\n'+
'// sequence pluck with random 16th notes\n'+
's = ScaleSeq(fill(), _16).slave(p);\n'+
's.root = "C2";\n'+
'\n'+
'// create bass synth with 1000ms attack, 2000ms decay, .75 amp\n'+
'b = Synth(1000, 2000, .65)\n'+
'b.fx.add( Clip(50) )\n'+
'\n'+
'// sequence bass. "sequence" is positions in scale\n'+
'c = ScaleSeq({\n'+
'    root :      "C2",\n'+
'    sequence :  [0,-2,-4], \n'+
'    durations:  [_1 * 2, _1, _1],\n'+
'    slaves:     [b]\n'+
'});\n'+
'\n'+
'// add modulation changing blend of karplus-strong\n'+
'// this will move from string to noise sounds\n'+
'p.mod("blend", LFO(.25, 1), "=")\n'+
'\n'+
'// add buffer stuttering / repitching / reversing\n'+
'p.fx.add( Schizo() )\n'+
'\n'+
'// sequence drums randomizing every 4th measure and then reseting\n'+
'e = Seq( [ d.reset, d.shuffle ], [_1 * 3, _1]).slave(d)\n'+
'\n'+
'// make FM synth using glockenspiel preset. add delay and reverb\n'+
'f = FM("glockenspiel")\n'+
'f.amp = .2;\n'+
'f.fx.add( Delay(_6, .8), Reverb() )\n'+
'\n'+
'// sequence glockenspiel with random notes each lasting two measures\n'+
'g = ScaleSeq({\n'+
'    sequence :  filli(0,12,16), \n'+
'    durations : filli([_2, _1 * 2, _1 * 4], 32),\n'+
'    slaves :    [f],\n'+
'});\n'+
'\n'+
'// insert fx at start of fx chain, in this case, before delay / reverb\n'+
'f.fx.insert( Chorus(), 0)\n'+
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
's = Tri(300, .15);\n'+
'\n'+
'// change waveShape to sine\n'+
's.waveShape = "sine";\n'+
'\n'+
'// modulate the frequency of the triangle wave using a sequencer.\n'+
'// add the sequencer\'s output to the oscillators frequency\n'+
's.mod("freq", Seq([220, 0], _2), "+");\n'+
'\n'+
'// create tremolo by using a LFO to modulate the volume of the oscillator \n'+
'// (currently volume is inappropriately referred to as mix). Multiply the amplitude\n'+
'// of the oscillator times the output of the LFO\n'+
's.mod("mix",  LFO(4, 1), "*");\n'+
'\n'+
'// add a Delay effect with a delay time of 1/3 a measure and a Reverb effect with default settings\n'+
's.fx.add( Delay(_3), Reverb() );\n'+
'\n'+
'// remove last fx in fx.add\n'+
's.fx.pop();\n'+
'\n'+
'// bit crush; reduce to 8-bits\n'+
's.fx.add( Crush(8) );\n'+
'\n'+
'// remove first effect in fx fx.add\n'+
's.fx.remove(0);\n'+
'\n'+
'// remove all fx, but not mods\n'+
's.fx.remove();\n'+
'\n'+
'// low-pass filter\n'+
'f = LPF();\n'+
'\n'+
'// add ring modulator and filter\n'+
's.fx.add( Ring(), f );\n'+
'\n'+
'// change filter parameters\n'+
'f.resonance = 10\n'+
'f.cutoff = 400\n'+
'\n'+
's.fx.pop();\n'+
'\n'+
'// clear all mods\n'+
's.mods.remove();',

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
'The Drums objects is a quick way to enter beats; it uses a Seq object behind the scenes. See the\n'+
'Sequencer tutorial for more information.\n'+
'*/\n'+
'\n'+
'// x = kick, o = snare, * = hihat. hits are triggered every quarter note\n'+
'd = Drums("xoxo", _4)\n'+
'\n'+
'// add soft-clipping distortion\n'+
'd.fx.add( Clip(1000) )\n'+
'\n'+
'// raise/lower frequencies of drums; 440 is default starting value\n'+
'd.frequency = 880\n'+
'\n'+
'// pass new sequence\n'+
'd.set("x * ")\n'+
'\n'+
'// change speed of pattern\n'+
'd.speed = _8;\n'+
'\n'+
'// change the master tempo. All sequencers will update themselves to match the\n'+
'// master clock speed whenever it is changed.\n'+
'Gibber.setBPM(180);\n'+
'\n'+
'// return to original sequence\n'+
'd.reset();\n'+
'// sequence kick, snare and hat with separate sequences so they can play simultaneously\n'+
'// see sequencing tutorial for more details\n'+
'\n'+
'Gibber.clear();\n'+
'd = Drums()\n'+
'\n'+
'kick = Seq("x...x..xx..xx...", _16).slave(d);\n'+
'hat  = Seq("*.*.*.***.*.*.**", _16).slave(d);\n'+
'sn   = Seq(".o", _4).slave(d);\n'+
'\n'+
'hat.shuffle(); // randomize hat sequence',

"the sequencer":
'/* \n'+
'The Seq object is one of the basic building blocks of Gibber. It is designed\n'+
'to be completely generic; it can sequence notes for a synth to play, functions to \n'+
'be executed and values to be assigned to object parameters.\n'+
'\n'+
'Making a Seq takes the form of:\n'+
'\n'+
'Seq(\n'+
'    array   : sequenced objects / primitives, \n'+
'    num     : step speed (optional, default = _1 / length of sequence array),\n'+
'    string  : name of method or property of object to sequence (optional, default = "note" or "freq") \n'+
');\n'+
'*/\n'+
'\n'+
's = Synth();\n'+
's.fx.add( Reverb() )\n'+
'\n'+
'// create a sequence object by passing an array of notes\n'+
'// this sequence will not have a ugen slaved, but once it has one it will output note messages (default)\n'+
'q = Seq(["F4", "G4", "A4", "E4"], _4);\n'+
'\n'+
'// tell the sequence object to control the synth\n'+
'q.slave(s);\n'+
'\n'+
't = Synth();\n'+
't.fx.add( Reverb() )\n'+
'r = Seq(["A5", "A#5", "C#5", "D5"], _4).slave(t);\n'+
'\n'+
'// assign new values to the sequence\n'+
'q.set(["F4", "G4",  "D4",  "C4"]);\n'+
'r.set(["A5", "A#5", "C#5", "B5"]);\n'+
'\n'+
'// change the speed of each sequence step\n'+
'r.speed = q.speed = _16;\n'+
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
'q.play();',

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
's.attack = ss.attack = 10;\n'+
's.decay  = ss.decay  = 50;\n'+
'\n'+
'// assign a mode and root note to Gibber.\n'+
'G.mode = "lydian";\n'+
'G.root = "D4";\n'+
'\n'+
'// ScaleSeq uses whatever mode and root is currently defined in Gibber.\n'+
'// Each value in the sequence defines an offset from the root note in terms of the scale, NOT IN TERMS OF HALF / WHOLE STEPS.\n'+
'// The default is C4 aeolian; we just changed it to D4 Lydian\n'+
'q  = ScaleSeq([0,1,5,3,0,6,7,-5], _16).slave(s);\n'+
'qq = ScaleSeq([0,4,3,6,4,5,9,-3], _16).slave(ss);\n'+
'\n'+
'// We can manually change the mode of any ScaleSeq. We can also change the root.\n'+
'qq.mode = q.mode = "majorpentatonic"\n'+
'qq.root = q.root = "A4";\n'+
'\n'+
'// We can easily sequence changes to modes using the Seq object. Just pass "mode"\n'+
'// as the last parameter and it will change that property of q.\n'+
'a = Seq([ "minor", "majorpentatonic" ], _1, "mode").slave(q, qq);\n'+
'\n'+
'// We can also easily sequence the root key\n'+
'b = Seq(["D4", "E4", "F#4", "A4"], _2, "root").slave(q, qq);\n'+
'b.speed = _1\n'+
'\n'+
'// set sequence to loop through all available modes. All modes are also stored in Gibber.modes\n'+
'// major can be substituted for ionian, minor can sub for aeolian\n'+
'b.stop();\n'+
'a.set([ "ionian", "dorian",  "phrygian", "lydian", "mixolydian", "aeolian", "locrian", "majorpentatonic", "minorpentatonic", "chromatic"]);\n'+
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
'In Gibber we can use these chords with the Poly (polysynth) and the Arp (arpeggiator) objects.\n'+
'The Poly object plays all notes simultaneously, the Arp plays them sequentially.\n'+
'*/\n'+
'\n'+
'// create a poly object and give it a starting chord.\n'+
'p = Poly("C4m7");\n'+
'p.fx.add( Reverb() );\n'+
'\n'+
'// trigger the amplitude envelope to play the chord. Pass the volume you want to use.\n'+
'p.trig(.6);\n'+
'\n'+
'// we can sequence trig calls to play the chord in a pattern of different volumes\n'+
's = Seq([.5, .2, .3, .1], _8, "trig").slave(p);\n'+
'\n'+
'// change the chord using the chord message\n'+
'p.chord("D4m7");\n'+
'\n'+
'// sequence chord changes using chord calls\n'+
'ss = Seq(["C4m7", "D4m7", "Bb3maj7", "Ab3maj7"], _1, "chord").slave(p);\n'+
'\n'+
'// create a sine wave to arpeggiate\n'+
'high = Sine(440, .1);\n'+
'high.fx.add( Reverb() );\n'+
'\n'+
'// pass oscillator/synth to control, chord, note duration, direction and number of octaves\n'+
'a = Arp("C4m7", _32, "updown", 3);\n'+
'a.slave(high);     // slave oscillator to arp\n'+
'ss.slave(a);       // slave chord of arp to same sequencer that is controlling our Poly',

"sequence functions" :
'// This shows how sequencers can sequence commands in addition to notes, volumes etc.\n'+
'// There is a tutorial on the Seq object that should be read first to understand this.\n'+
'\n'+
'// create a synth and specify attack/delay/amp values, add delay + reverb\n'+
's = Synth({\n'+
'    attack: 10,\n'+
'    decay: 50,\n'+
'    amp:.25\n'+
'});\n'+
's.fx.add( Delay(_8), Reverb() );\n'+
'\n'+
'// Sequence using the default Gibber scale, C4 Aeolian\n'+
'// See scales and theory for details on the ScaleSeq object\n'+
'q = ScaleSeq([ 0,1,5,3,0,6,7,-5 ], _16).slave(s);\n'+
'\n'+
'// Every two measures, alternate between randomizing the sequence and resetting it to its original value\n'+
'// IMPORTANT: Note we do not call the functions using (), we just pass references to them\n'+
'p = Seq([ q.shuffle, q.reset ], _1 * 2);\n'+
'\n'+
'// fade out synth and stop sequence when synth volume is just about inaudible.\n'+
'v = Seq([ function() { s.amp *= .8; if(s.amp < .001) q.stop(); } ]);',

"granulation" :
'// run some drums to sample and granulate\n'+
'd = Drums("x*o*", _8);\n'+
'd.pitch *= 2;\n'+
'\n'+
'// create the granulator, 10 grains, each grain is 50ms\n'+
'// and the speed ranges from -.5 (half speed backwards) to 2\n'+
'// (double speed forwards)\n'+
'g = Grains({\n'+
'  numberOfGrains: 10,\n'+
'  grainSize: ms(50),\n'+
'  range:[-.5,2],\n'+
'});\n'+
'\n'+
'// insert the grain as an fx on the drums\n'+
'g.insert(d);\n'+
'\n'+
'// tell the granulator to play and the drums to stop\n'+
'g.play();\n'+
'd.seq.stop();\n'+
'\n'+
'// change the length of all grains\n'+
'g.set("length", ms(350));\n'+
'\n'+
'// change the speed of all grains to a new random value\n'+
'g.grains.all( function(obj) {\n'+
'  obj.speed = rndf(-.5, 2);\n'+
'});',

"algorithmic music" :
'// this tutorial shows how to use random functions to generate "music".\n'+
'// first create arrays to hold drums and sequencers\n'+
'perc = [];\n'+
'seqs = [];\n'+
'\n'+
'// set the mode and root note for all scale sequencers to use\n'+
'G.mode = "lydian"\n'+
'G.root = "D6"\n'+
'\n'+
'// create a bus with reverb to send audio to. this is much cheaper\n'+
'// than a separate reverb for every drum / sound\n'+
'b = Bus( Reverb(.3,.3) )\n'+
'\n'+
'for(var i = 0; i < 8; i++) {\n'+
'    // fill our perc array with a FM drum synth. set the amp to be low\n'+
'    // (since there will be 8) and send each to the reverb bus\n'+
'    perc[i] = FM("drum2")\n'+
'    perc[i].amp /= 8;\n'+
'    perc[i].send(b, .5)\n'+
'    \n'+
'    // create a sequencer to control each drum\n'+
'    seqs[i] = ScaleSeq( \n'+
'        filli(-12, 12, 32),   // create an array of 32 random integers ranging from -12 to 12 \n'+
'        filld([2,4,8,16], 32) // create an array of 32 random durations that are either \n'+
'                              // 1/2, 1/4, 1/8 or 16th notes\n'+
'    ).slave(perc[i]);\n'+
'    \n'+
'    seqs[i].offset = rndi(-500, 500); // set a random sample offset to "humanize" the sequence\n'+
'}\n'+
'\n'+
'// create a sequencer that will randomize the volume of each drum every quarter note\n'+
't = Seq( function() { \n'+
'    perc.all(            // use all to apply a function to each array item\n'+
'        function (obj) { // obj represents the array item\n'+
'            obj.amp = rndf(.015, .1); // set a random amp from .015 to .5        \n'+
'        } \n'+
'    );\n'+
'}, _4)\n'+
'\n'+
'seqs.all( function(obj) { obj.root = "F6" } );  // change the root for all scales\n'+
'perc.all( function(obj) { obj.fx.add( Delay(_16, .1) ) } ); // add fx to all drums',

"custom callback": 
'/*\n'+
'So, you want your own callback... don\'t like my graph? Well, here you go.\n'+
'Most ugens in Gibber have a method named "out" that advances the phase of the\n'+
'ugen and returns the output. Note that keystrokes to stop/start audio will\n'+
'not work with a custom callback, and that there is no tempo. It\'s a little\n'+
'tricky to run this and then initialize objects as new objects are automatically added to\n'+
'Gibber\'s graph, so we\'ll just create our ugens the first time the new callback is called.\n'+
'\n'+
'To disable the callback (and stop the sine wave) just run the last line of code, which\n'+
'resets the callback to Gibber\'s default\n.'+
'*/\n'+
'\n'+
'G.dev.readFn = function(buffer, channelCount){\n'+
'    var freqStore, val;\n'+
'    if(typeof __s === "undefined") {  // init oscillators\n'+
'        G.log("INIT");\n'+
'        __s = Sine();\n'+
'        __m = Sine(4, 8);\n'+
'    }\n'+
'    \n'+
'    for(var i = 0; i < buffer.length; i+= channelCount) {\n'+
'        freqStore = __s.frequency;\n'+
'        __s.frequency += __m.out();     	// modulate the frequency\n'+
'        val = __s.out();          			// get the output of s\n'+
'        __s.frequency = freqStore;    		// restore the frequency of s\n'+
'        \n'+
'        buffer[i] = val;            		// assign value to sample\n'+
'        buffer[i+1] = val;\n'+
'	}\n'+
'}\n'+
'\n'+
'G.dev.readFn = window.audioProcess;  // restore the Gibber graph',

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
'c.mod("freq", Sine(8, 4), "+");  // Vibrato - modulating frequency 8 times per second by +/- 4Hz\n'+
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
'c.mod("freq", Sine(carrierFrequency * 1.4, 190), "+"); \n'+
'\n'+
'/*\n'+
'If we use a synth for this we get an envelope that can be triggered via the note command.\n'+
'A short attack and long decay will give us some nice bell sounds. Especially if we add some reverb :)\n'+
'*/\n'+
'\n'+
'noteFrequency = ntof("F2"); // ntof is note-to-frequency\n'+
'\n'+
'c = Synth("sine", .15);\n'+
'c.fx.add( Reverb() );\n'+
'c.mod("freq", Sine( noteFrequency * 1.4, noteFrequency * .95), "+");\n'+
'c.env.attack  = 1;        // 1 ms attack time\n'+
'c.env.decay   = 6000;     // 1000 ms decay\n'+
'\n'+
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
'f = FM(1 / 1.0007, 5, 100, 100);\n'+
'f.fx.add( Reverb() );\n'+
's = Seq(["A4", "B4", "B4", "C5"], _8).slave(f);',
}