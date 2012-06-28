requirejs.config({
    baseUrl: 'js',
    paths: { }
});

requirejs([
	'gibberish/lib/gibberish', 'codemirror/codemirror', 'gibberish/lib/external/sink-light', 'gibberish/lib/external/audiofile', 'gibberish/lib/utils', 'gibberish/lib/cycle',
	/*'jquery',*/
	'jquery.simplemodal',		
	'audiolib',
	'samples/drum-samples',
	'gibber/audio_callback',
	'gibber/gibber',
	'gibber/fx',
	'gibber/sequence',
	'gibber/scale_seq',
	'gibber/arpeggiator',
	'teoria',
	'gibber/utilities',
	'gibber/drums',
	'gibber/line',
	'gibber/beatCallback',
	'gibber/environment',
	'gibber/synth',
	'gibber/poly',
	'gibber/fm_synth',
	'gibber/string',
	'gibber/flanger',
	'gibber/recorder',
	'gibber/grains',
	'gibber/envelopes',
	'gibber/tutorials',
	'gibber/pluck2',
	'gibber/schizo',
	'gibber/crackle',
	'gibber/default_scripts',
 	'codemirror/util/loadmode',
 	'codemirror/util/overlay',
	'node/socket.io.min',
	'megamenu/jquery.hoverIntent.minified',
	'megamenu/jquery.dcmegamenu.1.3.3.min',
	],
	function   ( a, b, c, d, e) {
		window.Gibberish = a;
		Gibberish.init();
		//window.CodeMirror; //= a;
		//console.log(a);
		
		// s = Gibberish.Sine(440, .25);
		// s.connect(Gibberish.MASTER);
		// Gibberish.dirty = true;
		
		Gibberish.callback = Gibberish.generateCallback();
		
		console.log("LOADED SOME STUFF");
		Gibber.init();
	}
);