requirejs.config({
    baseUrl: 'js',
    paths: { }
});

requirejs([
	'gibberish/lib/utils', 
	'gibberish/lib/gibberish',
	'gibber/gibber',
	'gibber/environment',
	"gibberish/lib/oscillators", "gibberish/lib/effects", "gibberish/lib/synths", "gibberish/lib/envelopes", 
	'gibberish/lib/external/sink-light', 	
	'gibberish/lib/external/audiofile',
	"gibberish/lib/gen", 
	],
	
	function   ( ___util, __gibberish,  __gibber, __environment, oscillators, effects,synths,envelopes) {
		window.Gibberish = __gibberish;
		window.Gibber = window.G = __gibber;
		Gibber.Environment = __environment;
		Gibberish.init();

		oscillators.init(window.Gibberish);
		effects.init(window.Gibberish);
		synths.init(window.Gibberish);
		envelopes.init(window.Gibberish);
		
		
		Gibberish.callback = Gibberish.generateCallback();
		Gibber.init();
	}
);