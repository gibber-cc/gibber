requirejs.config({
    baseUrl: 'js',
    paths: { }
});

requirejs([
	'gibberish/lib/gibberish', 
	'gibber/gibber',
	'gibber/environment',
	'gibberish/lib/external/sink-light', 	
	'gibberish/lib/external/audiofile', 
	'gibberish/lib/utils', 
	'gibberish/lib/cycle',
	/*'jquery',*/
	'samples/drum-samples',
	],
	
	function   ( __gibberish, __gibber, __environment) {
		window.Gibberish = __gibberish;
		window.Gibber = window.G = __gibber;
		Gibber.Environment = __environment;
		Gibberish.init();
		
		Gibberish.callback = Gibberish.generateCallback();
		Gibber.init();
	}
);