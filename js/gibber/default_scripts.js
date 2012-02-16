Gibber.defaultScripts = {
	default:
'// default \n'+
's = Sine(240, .15);      // Sine wave with freq 240, amp .5.\n'+
'\n'+
's.chain(                // create an fx chain for oscillator\n'+
'    Dist(),             // Distortion\n'+
'    Delay( _3 )  		// Delay with delay time set to 1/4 of a beat (1/16th note)\n'+
');\n'+
'\n'+
'a = Arp(s, "Cm7", 2, _16, "updown"); // Arpeggiator: Cminor7 chord, 2nd octave, 16th notes, up then down\n'+
'\n'+
'd = Drums("x*o*x*o*",_8);\n'+
'd.chain( Trunc(6) );\n'+
'd.frequency = 880; 	// 440 is base frequency\n'+
'\n'+
's.mod("freq", LFO(8, 4), "+");  // Vibrato - modulating frequency by +/- 4Hz 8 times per second\n'+
's.removeMod(1);                 // mod 0 is the arp, I know, confusing...\n'+
'\n'+
'a.shuffle();        // randomize arpeggio\n'+
'a.reset();          // reset arpeggio\n'+
'\n'+
'Master.chain( Reverb() );     // Master FX are applied to summed signal of all generators\n'+
'Master.removeFX(0);           // remove first effect in chain. do not pass a argument to remove all fx.\n',

synth_sequence:
'// synth sequence \n'+
'// triangle wave, .15 amplitude, four note sequence, each note lasts a measure\n'+
's = Synth("triangle", .15, ["F4", "G4", "A5", "E4"], _1)\n'+
'\n'+
'// add delay and reverb to an fx chain\n'+
's.chain( Delay(), Reverb() )\n'+
'\n'+
'// resequence synth\n'+
's.seq(["F4", "G4", "D4", "C4"]);',


frequency_mod:'// Sine wave at 240Hz with an amplitude of .15\n' +
's = Sine(240, .15);\n'+
'\n'+
'/*\n'+
'modulate the frequency of s with an LFO.\n'+
'\n'+
'An LFO with an amplitude of four creates values in the range {-4, 4}\n'+
'After adding this mod the frequency of s will fluctate between 236 and 244\n'+
'*/\n'+
'\n'+
's.mod("freq", LFO(8, 4), "+");  // Vibrato - modulating frequency 8 times per second by +/- 4Hz\n'+
'\n'+
'/*\n'+
'There are (currently) four modulation modes:\n'+
'    +   : add the modulator value to the parameter value\n'+
'    ++  : add the absolute value of the modulator to the parameter value\n'+
'    *   : multiply the value of the modulator by the parameter value\n'+
'    =   : assign the value of the modulator to the parameter value\n'+
'*/\n'+
'\n'+
'// end the modulation\n'+
's.removeMod();\n'+
'\n'+
'/*\n'+ 
'Create a StepSequencer to modulate frequency\n'+
'We will assign the value of the StepSequencer to the frequency of our sine wave\n'+
'The frequency values will be 440,550 and 660 and they will shift every quarter note\n'+
'*/\n'+
'\n'+
't = Step([440, 550, 660], _4);\n'+
'\n'+
's.mod("freq", t, "=");',

simple_fx: '// triangle wave at 440Hz, .15 amplitude\n'+
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

drums: '// x = kick, o = snare, * = hihat. hits are triggered every quarter note\n'+
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
}
