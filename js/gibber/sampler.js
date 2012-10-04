/**#Sampler - Buffer Playback
Sampler allows you to playback audiofiles at different speeds. It also allows you to record the output of any 
Gibber [Bus](javascript:Gibber.Environment.displayDocs('Bus'\)). 
This could be the Master bus, or any of the polyphonic instruments that output to their own dedicated bus:  
* [Synth](javascript:Gibber.Environment.displayDocs('Synth'\))  
* [Synth2](javascript:Gibber.Environment.displayDocs('Synth2'\))  
* [FMSynth](javascript:Gibber.Environment.displayDocs('FMSynth'\))  
* [Pluck](javascript:Gibber.Environment.displayDocs('Pluck'\))  
* [Drums](javascript:Gibber.Environment.displayDocs('Drums'\))  

## Example Usage ##
`a = Drums("x*ox*xo-");  
b = Sampler({input:a, amp:2.5});
b.startRecording(_1 * 2);    
// wait 2 measures  
b.fx.add( HPF(.4, 4.5) );  
c = Seq({
  note:[4,2,.5],
  durations:[_1, _1, _1 * 4],
  slaves:b
});
`
## Constructor
**param** *input*: Object or String. A input Bus to record samples from or an audiofile to load.
**/

/**###Sampler.record : method
**param** *input*: A [Bus](javascript:Gibber.Environment.displayDocs('Bus'\)) . See the main description for info on what can be recorded.
**param** *length*: Integer. The length of the recording, in samplers.

**description**: Start recording samples from a Gibber Bus. The Master Bus can also be recorded.
**/

/**###Sampler.note : method
**param** *playbackSpeed*: Float. The speed of the buffer playback. Can be positive or negative (for reverse playback).
**param** *amp*: Float. The amplitude of the buffer playback.

**description**: Play the buffer stored in the sampler object at a given speed and amplitude.
**/

function Sampler(pathToFile) {
	var that = Gibberish.Sampler(pathToFile);
	if(typeof pathToFile === "string") {
		that.send(Master, 1);
	}else{
		console.log("NOT CONNECTING SAMPLER");
	}
	return that;
}

function Looper(input, length, numberOfLoops) {
	var that = Gibberish.Bus();
	that.children = [];
	that.input = input;
	that.length = G.time(length * 2); // TODO: THIS IS A HACK!!!
	that.numberOfLoops = numberOfLoops;
	that.seq = null;
	 
	that.currentLoop = 0;
	for(var i = 0; i < numberOfLoops; i++) {
		that.children.push( Gibberish.Sampler() );
		that.children[i].send(that, 1);
	}
	that.send(Master, 1);
	that.loop = function() {
		that.children[that.currentLoop].record(that.input, that.length);
		that.seq = Seq({note:[2], durations:length});
		that.seq.slave(that.children[that.currentLoop]);
		
		future(that.nextLoop, length);
		return that;
	};
	
	that.nextLoop = function() {
		that.children[++that.currentLoop].record(that.input, that.length);
		if(that.currentLoop < that.numberOfLoops - 1) {
			future(that.nextLoop, length);
		}
		that.seq.slave(that.children[that.currentLoop]);
	};
	that.stop = function() { that.seq.stop(); }
	that.play = function() { that.seq.play(); }
	// //var that = Gibberish.Sampler(pathToFile);
	// if(typeof pathToFile === "string") {
	// 	that.send(Master, 1);
	// }else{
	// 	console.log("NOT CONNECTING SAMPLER");
	// }
	return that;
}

