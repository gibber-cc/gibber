requirejs.config({
    baseUrl: 'js',
    paths: { }
});

requirejs([
	'gibberish/lib/utils', 
	'gibberish/lib/gibberish',
	'gibber/gibber',
	'gibber/environment',
	"gibberish/lib/gen", 
	"gibberish/lib/oscillators", "gibberish/lib/effects", "gibberish/lib/synths", "gibberish/lib/envelopes", "gibberish/lib/drums",
	'gibberish/lib/external/sink-light', 	
	'gibberish/lib/external/audiofile',
  'interface/interface',
  'js/freesound.js-master/freesound.js',
	],
	
	function   ( ___util, __gibberish,  __gibber, __environment, __gen, oscillators, effects,synths,envelopes, drums) {
		window.Gibberish = __gibberish;
		window.Gibber = window.G = __gibber;
		Gibber.Environment = __environment;
		Gibberish.init();

		oscillators.init(window.Gibberish);
		effects.init(window.Gibberish);
		synths.init(window.Gibberish);
		envelopes.init(window.Gibberish);
		drums.init(window.Gibberish);		
		
		Gibberish.callback = Gibberish.generateCallback();
		Gibber.init();
	}
);