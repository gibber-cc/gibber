Gibber.defaultScripts = {
default:
's = Sine(240, .1);                  // Sine wave with freq 240, amp .5.\n' +
's.fx.add( Delay( _3 ), Reverb() );  // create fx chain with delay and reverb. delay time (_3) is a triplet.\n' +
'\n' +
'a = Arp(s, "C4m7", _16, "updown");  // Arpeggiator: control s, Cminor7 (4 is octave) chord, 16th notes, up then down\n' +
'a.shuffle();                        // randomize arpeggio\n' +
'a.reset();                          // reset arpeggio\n' +
'\n' +
'd = Drums("x...o..*", _8);			// kick on 1, snare on 5, "hat" on 8... each note is an eighth note (_8) \n' +
'd.fx.add( Trunc(6), Delay(_8) );\n' +
'd.frequency = 880;                  // 440 is base frequency; this lines doubles the pitch of all drum samples\n' +
'\n' +
's.mod("freq", LFO(8, 10), "+");     // Vibrato - modulating frequency by +/- 10Hz 8 times per second\n' +
's.mods.remove();                    // removes all mods, pass a number or parameter name to remove a particular mod\n' +
'\n' +
'Master.chain( Reverb() );           // Master FX are applied to summed signal of all generators\n' +
'Master.fx.remove(0);                // remove first effect in chain. do not pass a argument to remove all fx.',

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
'// modulate the frequency of the triangle wave using a step sequencer.\n'+
'// add the step sequencers output to the oscillators frequency\n'+
's.mod("freq", Step([220, 0], _2), "+");\n'+
'\n'+
'// create tremolo by using a LFO to modulate the volume of the oscillator \n'+
'// (currently volume is inappropriately referred to as mix). Multiply the amplitude\n'+
'// of the oscillator times the output of the LFO\n'+
's.mod("mix",  LFO(4, 1), "*");\n'+
'\n'+
'// add a Delay effect with a delay time of 1/3 a measure and a Reverb effect with default settings\n'+
's.fx.add( Delay(_3), Reverb() );\n'+
'\n'+
'// remove last fx in chain\n'+
's.fx.pop();\n'+
'\n'+
'// bit crush; reduce to 8-bits\n'+
's.fx.add( Trunc(8) );\n'+
'\n'+
'// remove first effect in fx chain\n'+
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
'// crush to six bits\n'+
'd.chain( Trunc(6) )\n'+
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
'// change the master tempo. All sequencers will update themselves to run match the\n'+
'// master clock speed whenever it is changed.\n'+
'Gibber.setBPM(180);\n'+
'\n'+
'// return to original sequence\n'+
'd.reset();',

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
'    object  : object to apply sequence to (optional),\n'+
'    string  : name of method or property of object to sequence (optional, default = "note" or "freq") \n'+
');\n'+
'*/\n'+
'\n'+
's = Synth();\n'+
'\n'+
'// create a sequence object by passing an array of notes\n'+
'// this sequence will not have a ugen slaved, but once it has one it will output note messages (default)\n'+
'q = Seq(["F4", "G4", "A4", "E4"], _1);\n'+
'\n'+
'// tell the sequence object to control the synth\n'+
'q.slave(s);\n'+
'\n'+
'// if you pass a synth as the last parameter it will be slaved automatically\n'+
't = Synth();\n'+
'r = Seq(["A5", "A#5", "C#5", "D5"], _1, t);\n'+
'\n'+
'// assign new values to the sequence\n'+
'q.set(["F4", "G4",  "D4",  "C4"]);\n'+
'r.set(["A5", "A#5", "C#5", "B5"]);\n'+
'\n'+
'// change the speed of each sequence step\n'+
'r.speed = q.speed = _8;\n'+
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
's = Synth().chain( Reverb() );\n'+
'ss = Synth().chain( Reverb() );\n'+
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
'q  = ScaleSeq([0,1,5,3,0,6,7,-5], _16, s);\n'+
'qq = ScaleSeq([0,4,3,6,4,5,9,-3], _16, ss);\n'+
'\n'+
'// We can manually change the mode of any ScaleSeq. We can also change the root.\n'+
'qq.mode = q.mode = "majorpentatonic"\n'+
'qq.root = q.root = "A4";\n'+
'\n'+
'// We can easily sequence changes to modes using the Seq object. Just pass "mode"\n'+
'// as the last parameter and it will change that property of q.\n'+
'qq.stop();\n'+
'a = Seq([ "minor", "majorpentatonic" ], _1, q, "mode");\n'+
'\n'+
'// We can also easily sequence the root key\n'+
'b = Seq(["D4", "E4", "F#4", "A4"], _2, q, "root");\n'+
'b.speed = _1\n'+
'\n'+
'// set sequence to loop through all available modes. All modes are also stored in Gibber.modes\n'+
'b.stop();\n'+
'a.set([ "major", "ionian", "dorian",  "phrygian", "lydian", "mixolydian", "minor", "aeolian", "locrian", "majorpentatonic", "minorpentatonic"]);\n'+
'\n'+
'// change q to play each note in scale (with some extra notes on the pentatonic ones)\n'+
'q.set([0,1,2,3,4,5,6,7]);',

"chords + arp":
'/*\n'+
'Chords\n'+
'Chords are created in Gibber using the teoria.js library. Teoria does not\n'+
'provide a means for specifying octaves, so Gibber\'s format is slightly different. Here are\n'+
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
'p = Poly("C4m7").chain( Reverb() );\n'+
'\n'+
'// trigger the amplitude envelope to play the chord. Pass the volume you want to use.\n'+
'p.trig(.6);\n'+
'\n'+
'// we can sequence trig calls to play the chord in a pattern of different volumes\n'+
's = Seq([.5, .2, .3, .1], _8, p, "trig")\n'+
'\n'+
'// change the chord using the chord message\n'+
'p.chord("D4m7");\n'+
'\n'+
'// sequence chord changes using chord calls\n'+
'ss = Seq(["C4m7", "D4m7", "Bb3maj7", "Ab3maj7"], _1, p, "chord");\n'+
'\n'+
'// create a sine wave to arpeggiate\n'+
'high = Sine(440, .1).chain( Reverb() );\n'+
'\n'+
'// pass oscillator/synth to control, chord, note duration, direction and number of octaves\n'+
'aa = Arp(high, "C4m7", _32, "updown", 3);\n'+
'\n'+
'aa.shuffle(); // shuffle notes in arpeggiator\n'+
'aa.reset();   // reset to original chord',

"sequence functions" :
'// This shows how sequencers can sequence commands in addition to notes, volumes etc.\n'+
'// There is a tutorial on the Seq object that should be read first to understand this.\n'+
'\n'+
'// create a synth, add delay + reverb, adjust attack/delay times\n'+
's = Synth().chain( Delay(_8), Reverb() );\n'+
's.attack = 10;\n'+
's.decay = 50;\n'+
'\n'+
'// Sequence using the default Gibber scale, C4 Aeolian\n'+
'// See scales and theory for details on the ScaleSeq object\n'+
'q = ScaleSeq([ 0,1,5,3,0,6,7,-5 ], _16, s);\n'+
'\n'+
'// Every two measures, alternate between randomizing the sequence and resetting it to its original value\n'+
'// IMPORTANT: Note we do not call the functions using (), we just pass references to them\n'+
'p = Seq([ q.shuffle, q.reset ], _1 * 2);\n'+
'\n'+
'// fade out synth (hello pops!) and stop sequence when synth volume is just about inaudible.\n'+
'v = Seq([ function() { s.mix *= .8; if(s.mix < .001) q.stop(); } ]);',

"custom callback": 
'/*\n'+
'So, you want your own callback... don\'t like my graph? Well, here you go.\n'+
'Most ugens in Gibber have a method named "out" that advances the phase of the\n'+
'ugen and returns the output. Note that keystrokes to stop/start audio will\n'+
'not work with a custom callback, and that there is no tempo. It\'s a little\n'+
'tricky to run this and then initialize objects, so we\'ll just create our ugens\n'+
'the first time the new callback is called.\n'+
'*/\n'+
'\n'+
'this.dev.readFn = function(buffer, channelCount){\n'+
'    var freqStore, val;\n'+
'    if(typeof s === "undefined") {  // init oscillators\n'+
'        console.log("INIT");\n'+
'        s = Sine();\n'+
'        m = Sine(4, 8);\n'+
'    }\n'+
'    \n'+
'    for(var i = 0; i < buffer.length; i+= channelCount) {\n'+
'        freqStore = s.frequency;\n'+
'        s.frequency += m.out();     // modulate the frequency\n'+
'        val = s.out();          	// get the output of s\n'+
'        s.frequency = freqStore;    // restore the frequency of s\n'+
'        \n'+
'        buffer[i] = val;            // assign value to sample\n'+
'        buffer[i+1] = val;\n'+
'	}\n'+
'}\n'+
'\n'+
'this.dev.readFn = window.audioProcess;  // restore the Gibber graph',

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
'amplitude is 1/5th the amplitude of the fundamental, etc.\n'+
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
'c = Synth("sine", .15).chain( Reverb() );\n'+
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
'f.chain( Reverb() );\n'+
's = Seq(["A4", "B4", "B4", "C4"], _8, f);',
}

/* this is broken unfortunately...
'// play sequence once and then return to regular pattern\n'+
'// pass true as a second parameter to return to original sequence\n'+
'd.break("xxxx", true)\n'+
*/
