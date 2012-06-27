requirejs.config({
    baseUrl: 'scripts/lib',
    paths: {}
});

requirejs(['external/sink-light', 'external/audiofile', 'gibberish', 'utils', 'cycle'], 
	function   (sink,  audiofile, _gibberish) {
		window.Gibberish = _gibberish;
		Gibberish.init();
		var timeout = null;
		var codeTimeout = null;
		
		window._clear_ = function() {
			clearTimeout(timeout);
			clearTimeout(codeTimeout);
			
			Gibberish.ugens.remove();
			
			Gibberish.dirty = true;
			
			// var input = document.getElementById("input");
			// input.innerHTML = "";
			// 
			// codeTimeout = setTimeout(function() { 
			// 	var codegen = document.getElementById("output");
			// 	codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
			// }, 250);
			
		};
		
		window.test = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();
						
			s = Gibberish.PolySynth({waveform:"Triangle", attack: 44100, decay: 22050, sustain: 88200, release:44100});
			s.fx.add( Gibberish.Flanger( {rate:.5, feedback:.5, amount:125} ) );
			
			s.connect(Gibberish.MASTER);
			
			s.note(440);
			timeout = setInterval(function() { 
				s.note(440);
				s.note(660);				
				s.note(880);
			}, 5000);

			var inputString = "s = Gibberish.Synth(\"Triangle\");\n"+
			"s.fx.add( Gibberish.Decimator({bitDepth: 4, sampleRate:.25}) );\n"+
			"\n"+
			"t = Gibberish.Sine(.1, .249);\n"+
			"\n"+
			"s.fx[0].mod(\"sampleRate\", t);\n"+
			"s.connect(Gibberish.MASTER);\n"+
			"\n"+
			"timeout = setInterval(function() { \n"+
			"	s.note(Math.round(150 + Math.random() * 400));\n"+
			"}, 1000);\n";

			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
			}, 250);
			
			Gibberish.dirty = true;
		};
		
		window.flangerTest = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();
						
			s = Gibberish.PolySynth({waveform:"Triangle", attack: 44100, decay: 22050, sustain: 88200, release:44100});
			s.fx.add( Gibberish.Flanger( {rate:.5, feedback:.5, amount:125} ) );
			
			s.connect(Gibberish.MASTER);
			
			s.note(440); s.note(660); s.note(880);
			timeout = setInterval(function() { 
				s.note(440);
				s.note(660);				
				s.note(880);
			}, 5000);

			var inputString = "s = Gibberish.PolySynth({waveform:\"Triangle\", attack: 44100, decay: 22050, sustain: 88200, release:44100});\n"+
			"s.fx.add( Gibberish.Flanger( {rate:.5, feedback:.5, amount:125} ) );\n"+
			"\n"+
			"s.connect(Gibberish.MASTER);\n"+
			"\n"+
			"s.note(440); s.note(660); s.note(880);\n"+
			"timeout = setInterval(function() { \n"+
			"	s.note(440);\n"+
			"	s.note(660);\n"+
			"	s.note(880);\n"+
			"}, 5000);\n";

			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
			}, 250);
			
			Gibberish.dirty = true;
			
		}
		window.decimatorTest = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();
						
			s = Gibberish.Synth("Triangle");
			s.fx.add( Gibberish.Decimator({bitDepth: 6.5, sampleRate:.3}) );
			
			t = Gibberish.Sine(.1, .25);
			u = Gibberish.Sine(.1, 6);
			
			s.fx[0].mod("sampleRate", t);
			s.fx[0].mod("bitDepth", u);			
			s.connect(Gibberish.MASTER);
			
			timeout = setInterval(function() { 
				s.note(Math.round(150 + Math.random() * 400));
			}, 1000);

			var inputString = "s = Gibberish.Synth(\"Triangle\");\n"+
			"s.fx.add( Gibberish.Decimator({bitDepth: 6.5, sampleRate:.3}) );\n"+
			"\n"+
			"t = Gibberish.Sine(.1, .25);\n"+
			"u = Gibberish.Sine(.1, 6);\n"+
			"\n"+
			"s.fx[0].mod(\"sampleRate\", t);\n"+
			"s.fx[0].mod(\"bitDepth\", u);\n"+
			"s.connect(Gibberish.MASTER);\n";

			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
			}, 250);
			
			Gibberish.dirty = true;	
		};
		
		window.ringModulatorTest = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();
						
			s = Gibberish.Sine(840, .25);
			
			s.fx.add( Gibberish.RingModulator(300, .25) );
			s.connect(Gibberish.MASTER);

			timeout = setInterval(function() { 
				s.frequency = 400 + Math.random() * 400;
			}, 500);
			
			var inputString = "s = Gibberish.Sine(840, .25);\n"+
			"\n"+
			"s.fx.add( Gibberish.RingModulator(300, .25) );\n"+
			"s.connect(Gibberish.MASTER);\n"+
            "\n"+
			"timeout = setInterval(function() { \n"+
			"	s.frequency = 400 + Math.random() * 400;\n"+
			"}, 1500);\n";

			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
			}, 250);
			
			Gibberish.dirty = true;
		};
		
		window.samplerTest = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();
						
			s = Gibberish.Sampler("http://www.charlie-roberts.com/gibberish/wilhelm.wav");
			s.connect(Gibberish.MASTER);
			
			v = [.5, 1, 2];
			i = 0;
			
			timeout = setInterval(function() { 
				s.note( v[i++ % v.length] );
			}, 1500);
			
			var inputString = "s = Gibberish.Sampler(\"http://www.charlie-roberts.com/gibberish/wilhelm.wav\");\n"+
			"s.connect(Gibberish.MASTER);\n"+
			"\n"+
			"v = [.5, 1, 2];\n"+
			"i = 0;\n"+
			"\n"+
			"timeout = setInterval(function() { \n"+
			"	s.note( v[i++ % v.length] );\n"+
			"}, 1500);\n";

			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
			}, 250);
			
			Gibberish.dirty = true;
		};
		
		window.bufferShufflingTest = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();
						
			s = Gibberish.PolyFM({
				cmRatio: 1 + Math.sqrt(2),
				index: .2,
				attack: 44,
				decay: 5900,
				maxVoices: 1,
				amp: .25,
			});
			
			v = [110, 220, 330, 440, 550, 660, 770, 880];
			i = 0;
			b = Gibberish.BufferShuffler();
			s.fx.add(b);
			s.connect(Gibberish.MASTER);
			
			timeout = setInterval(function() { 
				s.note( v[i++ % v.length] );
			}, 125);
			
			var inputString = "s = Gibberish.PolyFM({\n"+
			"	cmRatio: 1 + Math.sqrt(2),\n"+
			"	index: .2,\n"+
			"	attack: 44,\n"+
			"	decay: 5900,\n"+
			"	maxVoices: 1,\n"+
			"	amp: .25,\n"+
			"});\n"+
			"\n"+
			"v = [110, 220, 330, 440, 550, 660, 770, 880];\n"+
			"i = 0;\n"+
			"b = Gibberish.BufferShuffler();\n"+
			"s.fx.add(b);\n"+
			"s.connect(Gibberish.MASTER);\n"+
			"\n"+
			"timeout = setInterval(function() { \n"+
			"	s.note( v[i++ % v.length] );\n"+
			"}, 125);\n";

			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
			}, 250);
			
			Gibberish.dirty = true;
		};
		
		window.polyFMTest = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();
			
			s = Gibberish.PolyFM({
				cmRatio: 1 + Math.sqrt(2),
				index: .2,
				attack: 44,
				decay: 22050,
				maxVoices: 20,
				amp: .075,
			});
			s.connect(Gibberish.MASTER);
			
			timeout = setInterval(function() { 
				s.note( Math.round(200 + Math.random() * 800) );
			}, 50);
			
			var inputString = "s = Gibberish.PolyFM({\n"+
			"	cmRatio: 1 + Math.sqrt(2),\n"+
			"	index: .2,\n"+
			"	attack: 44,\n"+
			"	decay: 22050,\n"+
			"	maxVoices: 20,\n"+
			"	amp: .075,\n"+
			"});\n"+
			"s.connect(Gibberish.MASTER);\n"+
			"\n"+
			"timeout = setInterval(function() { \n"+
			"	s.note( Math.round(200 + Math.random() * 800) );\n"+
			"}, 50);\n";
			
			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
			}, 250);
			
			Gibberish.dirty = true;	
		};
		
		window.polyKarplusStrongTest = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();

			s = Gibberish.PolyKarplusStrong({maxVoices: 20});
			s.connect(Gibberish.MASTER);
			
			timeout = setInterval(function() { 
				s.note( Math.round(200 + Math.random() * 800) );
			}, 100);
			
			var inputString = "s = Gibberish.PolyKarplusStrong({maxVoices: 20});\n"+
			"s.connect(Gibberish.MASTER);\n"+
			"\n"+
			"timeout = setInterval(function() { \n"+
			"	s.note( Math.round(200 + Math.random() * 800) );\n"+
			"}, 100);\n";

			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
			}, 250);
			
			Gibberish.dirty = true;
		}
		
		window.karplusStrongTest = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();

			s = Gibberish.KarplusStrong();
			s.note(440);
			s.connect(Gibberish.MASTER);
			
			timeout = setInterval(function() { 
				s.note( Math.round(200 + Math.random() * 800) );
			}, 1000);
			
			var inputString = "s = Gibberish.KarplusStrong();\n"+
			"s.note(440);\n"+
			"s.connect(Gibberish.MASTER);\n"+
			"\n"+
			"timeout = setInterval(function() { \n"+
			"	s.note( Math.round(200 + Math.random() * 800) );\n"+
			"}, 1000);\n";

			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
			}, 250);
			
			Gibberish.dirty = true;
		};
		
		window.polySynthTest = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();

			s = Gibberish.PolySynth({waveform: "Triangle", amp: .1, attack: 44100, decay: 44100, resonance:3.5, cutoff:.025, filterMult:.35, maxVoices:20});
			s.connect(Gibberish.MASTER);
			
			timeout = setInterval(function() { 
				s.note( Math.round(200 + Math.random() * 800) );
			}, 100);
			
			var inputString = "s = Gibberish.PolySynth({\n"+
			"	waveform: \"Triangle\", \n"+
			"	amp: .1, attack: 44100, \n"+
			"	decay: 44100, \n"+
			"	resonance:3.5, \n"+
			"	cutoff:.025, \n"+
			"	filterMult:.35, \n"+
			"	maxVoices:20\n"+
			"});\n"+
			"s.connect(Gibberish.MASTER);\n" +
			"\n"+
			"timeout = setInterval(function() { \n"+
			"	s.note( Math.round(200 + Math.random() * 800) );\n"+
			"}, 6000);\n";

			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
			}, 250);
			
			Gibberish.dirty = true;
		};

		window.sineTest = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();
			
			s = Gibberish.Sine(440, .25);
			s.connect(Gibberish.MASTER);
			
			var inputString = "s = Gibberish.Sine(440, .25);\n" + "s.connect(Gibberish.MASTER);";
			
			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
			}, 250);
			
			Gibberish.dirty = true;
		};
		
		window.sineStressTest = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();
			
			var OSC_COUNT = 200;
			var oscs = [];
			
			for(var i = 0; i < OSC_COUNT; i++) {
				oscs[i] = Gibberish.Sine(440, 1/OSC_COUNT);
				oscs[i].connect(Gibberish.MASTER);
			}
			
			var inputString = "var OSC_COUNT = 200;\n"+
			"var oscs = [];\n"+
			"\n"+
			"for(var i = 0; i < OSC_COUNT; i++) {\n"+
			"	oscs[i] = Gibberish.Sine(440, 1/OSC_COUNT);\n"+
			"	oscs[i].connect(Gibberish.MASTER);\n"+
			"}\n";
			
			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
			}, 250);
			
			Gibberish.dirty = true;
		};
			
		window.vibratoTest = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();
			
			m = Gibberish.Sine(5, 15);
			
			s = Gibberish.Sine(440, .25);
			
			s.mod("frequency", m);
			
			s.connect(Gibberish.MASTER);
			
			var inputString = "s = Gibberish.Sine(440, .25);\n" +
			"m = Gibberish.Sine(5, 15);\n" +
			"\n" +
			"s.mod(\"frequency\", m);\n" +
			"\n" +
			"s.connect(Gibberish.MASTER);\n";
			
			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
			}, 250);
			
			Gibberish.dirty = true;
		};
		
		window.clipTest = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();
			
			s = Gibberish.Sine(440, .25);
			c = Gibberish.Clip(500, .1);
			s.fx.add( c );
			s.connect(Gibberish.MASTER);
			Gibberish.dirty = true;
			
			timeout = setInterval(function() { 
				c.amount = Math.random(Math.random() * 5000);
				s.frequency = Math.round(200 + Math.random() * 800);
			}, 250);
			
			var inputString = "s = Gibberish.Sine(440, .25);\n" +
			"c = Gibberish.Clip(500, .1);\n" +
			"s.fx.add( c );\n" +
			"s.connect(Gibberish.MASTER);\n" +
			"Gibberish.dirty = true;\n" +
			"\n//note : a timeout changes pitches\n" +
			"//and randomizes clip amount";

			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
			}, 250);
			
		};
		
		window.ADSRTest = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();
			
			s = Gibberish.Sine(440, .25);
			s.connect(Gibberish.MASTER);
			
			a = Gibberish.ADSR(44100, 44100, 88200, 176400);
			s.mod("amp", a, "*");
			
			var inputString = "s = Gibberish.Sine(440, .25);\n"+
			"s.connect(Gibberish.MASTER);\n"+
			"\n"+
			"a = Gibberish.ADSR(44100, 44100, 88200, 176400);\n"+
			"s.mod(\"amp\", a, \"*\");\n";
			
			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
			}, 250);
			
			Gibberish.dirty = true;
		};
		
		window.filterTest = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();
			
			s = Gibberish.Synth("Triangle");
			c = Gibberish.Filter24(.2, 4);
			s.fx.add( c );
			
			t = Gibberish.Sine(1, .15);
			c.mod("cutoff", t);
			
			s.connect(Gibberish.MASTER);
			
			timeout = setInterval(function() { 
				s.note(Math.round(150 + Math.random() * 400));
				c.isLowPass = Math.random() > .5;
			}, 1000);
			
			var inputString =
			"s = Gibberish.Synth(\"Triangle\");\n"+
			"t = Gibberish.Sine(1, .15);\n"+
			"c = Gibberish.Filter24(.2, 4);\n"+
			"c.mod(\"cutoff\", t);\n"+
			"s.fx.add( c );\n"+
			"s.connect(Gibberish.MASTER);\n"+
			"Gibberish.dirty = true;\n"+
			"\n"+
			"timeout = setInterval(function() { \n"+
			"	s.note(Math.round(150 + Math.random() * 400));\n"+
			"	c.isLowPass = Math.random() > .5;\n"+
			"}, 1000);\n";
			
			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
			}, 250);
			
		};
		
		window.delayTest = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();
			
			s = Gibberish.Sine(440, .25);
			d = Gibberish.Delay(11025, .55);
			s.fx.add( d );
			s.connect(Gibberish.MASTER);
			Gibberish.dirty = true;
			
			timeout = setInterval(function() { 
				s.frequency = Math.round(200 + Math.random() * 800);
			}, 250);
			
			var inputString = "s = Gibberish.Sine(440, .25);\n" +
			"d = Gibberish.Delay(11025, .55);\n" +
			"s.fx.add( d );\n" +
			"s.connect(Gibberish.MASTER);\n" +
			"\n//note : a timeout changes pitches\n";

			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
			}, 250);
			
		};
		
		window.allPassTest = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();
			
			sine = Gibberish.Sine(440, .25);
			sine.fx.add( Gibberish.AllPass() );
			sine.connect(Gibberish.MASTER);
			
			var inputString = "sine = Gibberish.Sine(440, .25);\n"+
			"sine.fx.add( Gibberish.AllPass() );\n"+
			"sine.connect(Gibberish.MASTER);\n";
			
			timeout = setInterval(function() {
				sine.frequency = Math.round(200 + Math.random() * 800);
			}, 500);
			
			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
			}, 250);
			
			Gibberish.dirty = true;
		};
		
		window.reverbTest = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();
			
			sine = Gibberish.Synth();
			sine.env.attack = 2000;
			sine.fx.add( Gibberish.Reverb(), Gibberish.Reverb() );
			sine.connect(Gibberish.MASTER);
			
			var inputString = "sine = Gibberish.Synth(440, .25);\n"+
			"sine.fx.add( Gibberish.Reverb(), Gibberish.Reverb() );\n"+
			"sine.connect(Gibberish.MASTER);\n";
			
			var i = 0;
			var frequencies = [440, 660, 880, 1100, 1320, 1760];
			timeout = setInterval(function() {
				var pos = Math.floor( Math.random() * frequencies.length );
				sine.note(Math.round(frequencies[pos]));
			}, 250);
			
			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
			}, 250);
			
			Gibberish.dirty = true;
		};
		
		window.FMStressTest = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();
			
			synths = [];
			NUM_SYNTHS = 65;
			reverb = Gibberish.Bus();
			reverb.fx.add(Gibberish.Reverb());
			
			for(var i = 0; i < NUM_SYNTHS; i++) {
				synths[i] = Gibberish.FMSynth(.5 + Math.random(), Math.random * 10, .05, 11025, 11025);
				synths[i].connect(reverb);
			}
			
			reverb.connect( Gibberish.MASTER );
			
			timeout = setInterval(function() {
				for(var i = 0; i < NUM_SYNTHS; i++) {
					if(Math.random() > .5)
						synths[i].note(200 + Math.round( Math.random() * 4000));
				}
			}, 1000);
			
			var inputString = "synths = [];\n"+
			"NUM_SYNTHS = 65;\n"+
			"reverb = Gibberish.Bus();\n"+
			"reverb.fx.add(Gibberish.Reverb());\n"+
			"\n"+
			"for(var i = 0; i < NUM_SYNTHS; i++) {\n"+
			"	synths[i] = Gibberish.FMSynth(.5 + Math.random(), Math.random * 10, .05, 11025, 11025);\n"+
			"	synths[i].connect(reverb);\n"+
			"}\n"+
			"\n"+
			"reverb.connect( Gibberish.MASTER );\n"+
			"\n"+
			"timeout = setInterval(function() {\n"+
			"	for(var i = 0; i < NUM_SYNTHS; i++) {\n"+
			"		if(Math.random() > .5)\n"+
			"			synths[i].note(200 + Math.round( Math.random() * 4000));\n"+
			"	}\n"+
			"}, 1000);\n\n"+
			"// 65 FMSynths + a reverb takes 75% of my two year old computer.";
			
			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
			}, 250);
			
			Gibberish.dirty = true;
		};
		
		window.reverbStressTest = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();
			
			var reverbs = [];
			var NUM_reverbs = 20;				
			
			var sine = Gibberish.Sine(440);
			
			for(var i = 0; i < NUM_reverbs; i++) {
				sine.fx.add(Gibberish.Reverb());
				//sine.fx[i].roomSize = Math.random();
			}
			
			sine.connect(Gibberish.MASTER);
			
			var inputString = "var reverbs = [];\n"+
			"var NUM_reverbs = 20;\n"+
			"\n"+
			"var sine = Gibberish.Sine(440);\n"+
			"\n"+
			"for(var i = 0; i < NUM_reverbs; i++) {\n"+
			"	sine.fx.add(Gibberish.Reverb());\n"+
			"}\n"+
			"\n"+
			"sine.connect(Gibberish.MASTER);\n";
			
			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
			}, 250);
			
			Gibberish.dirty = true;
		};
		
		window.combTest = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();
			
			sine = Gibberish.Sine(440, .25);
			sine.fx.add( Gibberish.Comb() );
			sine.connect(Gibberish.MASTER);
			
			var inputString = "sine = Gibberish.Sine(440, .25);\n"+
			"sine.fx.add( Gibberish.Comb() );\n"+
			"sine.connect(Gibberish.MASTER);\n";
			
			timeout = setInterval(function() {
				sine.frequency = Math.round(200 + Math.random() * 800);
			}, 500);
			
			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
			}, 250);
			
			Gibberish.dirty = true;
		};
		
		window.synthTest = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();
			
			s = Gibberish.Synth("Sine", .25, 44100, 44100);
			s.connect(Gibberish.MASTER);
			
			t = Gibberish.Sine(.25, 100);
			s.mod("frequency", t);
			
			timeout = setInterval(function() { 
				s.note( Math.round(200 + Math.random() * 800) );
			}, 5000);
			
			var inputString = "s = Gibberish.Synth(\"Sine\", .25);\n"+
			"s.connect(Gibberish.MASTER);\n"+
			"\n\n//note : a timeout changes pitches\n";

			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
			}, 250);	
		};
		
		window.synth2Test = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();
			
			s = Gibberish.Synth2({
				wavform:	"Triangle",
				amp: 		.75,
				attack: 	88200,
				decay:  	88200,
				sustain:	44100,
				release: 	44100,
				attackLevel:	1,
				sustainLevel: 	.5,
				cutoff:		.05,
				resonance:	 3,
				filterMult: .5,
				isLowPass:	 true,
			});
			s.connect(Gibberish.MASTER);
			
			timeout = setInterval(function() { 
				s.note( Math.round(1000 + Math.random() * 200) );
			}, 6000);

			var inputString = "s = Gibberish.Synth2({\n"+
			"	wavform:	\"Triangle\",\n"+
			"	amp: 		.75,\n"+
			"	attack: 	88200,\n"+
			"	decay:  	88200,\n"+
			"	sustain:	44100,\n"+
			"	release: 	44100,\n"+
			"	attackLevel:	1,\n"+
			"	sustainLevel: 	.5,\n"+
			"	cutoff:		.1,\n"+
			"	resonance:	 3,\n"+
			"	filterMult:	.5,\n"+
			"	isLowPass:	 true,\n"+
			"});\n"+
			"s.connect(Gibberish.MASTER);\n"+
			"\n"+
			"timeout = setInterval(function() { \n"+
			"	s.note( Math.round(1000 + Math.random() * 200) );\n"+
			"}, 6000);\n";
			
			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
			}, 250);
			
			Gibberish.dirty = true;	
		};
		
		window.FMTest = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();
			
			s = Gibberish.FMSynth();
			s.connect(Gibberish.MASTER);
			
			timeout = setInterval(function() { 
				s.note( Math.round(200 + Math.random() * 800) );
			}, 500);
			
			var inputString = "s = Gibberish.FMSynth();\n"+
			"s.connect(Gibberish.MASTER);\n"+
			"\n//note : a timeout changes pitches";

			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
			}, 250);
		};
		
		window.busTest = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();
			
			bus1 = Gibberish.Bus();
			bus2 = Gibberish.Bus();
			bus3 = Gibberish.Bus();
			
			sendBus = Gibberish.Bus();	
			
			sine1 = Gibberish.Sine(440, .25);
			sine1.connect(bus1);
			
			sine2 = Gibberish.Sine(1080, .25);
			sine2.connect(bus2);	
						
			bus1.connect(bus3); 
			bus2.connect(bus3);
			
			bus3.send(sendBus, .5); 
			sendBus.connect(Gibberish.MASTER);
			
			delay = Gibberish.Delay(11050, .75);
			sendBus.fx.add(delay);
			
			timeout = setInterval(function() {
				sine1.frequency = Math.round(200 + Math.random() * 800);
				sine2.frequency = Math.round(200 + Math.random() * 800);
				//console.log("FREQUENCIES", sine1.frequency, sine2.frequency);				
			}, 500);
			
			var inputString = "bus1 = Gibberish.Bus();\n"+
			"bus2 = Gibberish.Bus();\n"+
			"bus3 = Gibberish.Bus();\n"+
			"\n"+
			"sendBus = Gibberish.Bus();	\n"+
			"\n"+
			"sine1 = Gibberish.Sine(440, .25);\n"+
			"sine1.connect(bus1);\n"+
			"\n"+
			"sine2 = Gibberish.Sine(1080, .25);\n"+
			"sine2.connect(bus2);	\n"+
			"			\n"+
			"bus1.connect(bus3); \n"+
			"bus2.connect(bus3);\n"+
			"\n"+
			"bus3.send(sendBus, .5); \n"+
			"sendBus.connect(Gibberish.MASTER);\n"+
			"\n"+
			"delay = Gibberish.Delay(11050, .75);\n"+
			"sendBus.fx.add(delay);\n" +
			"\n//note : a timeout changes pitches\n";
			
			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
			}, 250);	

			Gibberish.dirty = true;
		};
		
		window.busFeedbackTest = function() {
			clearTimeout(timeout);
			Gibberish.ugens.remove();
			
			bus1 = Gibberish.Bus();
			bus2 = Gibberish.Bus();
			
			singleSampleDelay = Gibber.Delay(1,0);
			sine1 = Gibberish.Sine(440, .2);
			sine1.connect(bus1);
			bus1.connect(bus2);
			bus2.connect(bus1);
			bus2.connect(Gibberish.MASTER);
			
			var inputString = "bus1 = Gibberish.Bus();\n"+
			"bus2 = Gibberish.Bus();\n"+
			"\n"+
			"sine1 = Gibberish.Sine(440, .2);\n"+
			"sine1.connect(bus1);\n"+
			"bus1.connect(bus2);\n"+
			"bus2.connect(bus1);\n"+
			"bus2.connect(Gibberish.MASTER);\n\n" +
			"// this creates a stack overflow failure. damnit.";
			
			var input = document.getElementById("input");
			input.innerHTML = inputString;
			
			codeTimeout = setTimeout(function() { 
				var codegen = document.getElementById("output");
				codegen.innerHTML = "INITIALIZATION:\n\n" + Gibberish.masterInit.join("\n") + "\n\n" + "CALLBACK:\n\n" + Gibberish.callback;
			}, 250);	

			Gibberish.dirty = true;
		};
		
		Gibberish.callback = Gibberish.generateCallback( false );
		codeTimeout = setTimeout(function() { 
			var codegen = document.getElementById("output");
			codegen.innerHTML = Gibberish.callback;
		}, 250);
		
		var phase = 0;
		var sink = Sink( function(buffer, channelCount){
			//console.log("CHANNEL COUNT = ", channelCount);
		    for (var i=0; i<buffer.length; i+=2){
				//if(phase++ % 100 == 0) s.frequency = Math.round(400 + Math.random() * 400);
				if(Gibberish.dirty) {
					Gibberish.callback = Gibberish.generateCallback( false ); 
				}
				buffer[i] = buffer[i+1] = Gibberish.callback();
		    }
		}, 2, 256);
	}
);