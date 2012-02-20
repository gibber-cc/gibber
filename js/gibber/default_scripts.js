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
synth_sequence:
'// Triangle wave, .15 amplitude. Synths also have a short envelope that\n' +
'// is triggered whenever it receives a note(noteName or MIDI number) command.\n' +
's = Synth();\n' +
't = Synth();\n' +
'\n' +
'// play a note\n' +
's.note("F4")\n' +
'\n' +
'// create a sequence object by passing an array of notes and a length for each\n' +
'q = Seq(["F4", "G4", "A5", "E4"], _1);\n' +
'\n' +
'// tell the sequence object to control the synth\n' +
'q.slave(s);\n' +
'\n' +
'// if you pass a synth as the last parameter it will be slaved\n' +
'r = Seq(["A5", "A#5", "C#5", "D5"], _1, t);\n' +
'\n' +
'// create fx chains with delay and reverb\n' +
's.chain( Delay(), Reverb() )\n' +
't.chain( Delay(), Reverb() )\n' +
'\n' +
'// resequence\n' +
'q.set(["F4", "G4", "D4", "C4"]);\n' +
'r.set(["A5", "A#5", "C#5", "B5"]);',

"simple fx":
'// triangle wave at 440Hz, .15 amplitude\n'+
's = Tri(440, .15)\n'+
'\n'+
'// modulate the frequency of the triangle wave. see simple modulation for details\n'+
's.mod("freq", Step([220, 0], _2), "+")\n'+
'\n'+
'// add a Delay effect with a delay time of 1/3 a measure and a Reverb effect with default settings\n'+
's.chain( Delay(_3), Reverb() )\n'+
'\n'+
'// remove last added effect\n'+
's.fx.pop()\n'+
'\n'+
'// bit crush; reduce to 8-bits\n'+
's.chain( Trunc(8) )\n'+
'\n'+
'// remove first effect in fx chain\n'+
's.removeFX(0)\n'+
'\n'+
'// remove all fx\n'+
's.removeFX();',

drums: 
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
'd.seq("x * ")\n'+
'\n'+
'// play sequence once and then return to regular pattern\n'+
'// pass true as a second parameter to return to original sequence\n'+
'd.break("xxxx", true)\n'+
'\n'+
'// return to original sequence\n'+
'd.reset();',

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
