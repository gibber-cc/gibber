/**#Sampler
Sampler allows you to playback audiofiles at different speeds. It also allows you to record the output of any Gibber bus. 
This could be the Master bus, or any of the polyphonic instruments that output to their own dedicated bus:
+ [Synth](javascript:Gibber.Environment.displayDocs('Synth'\))  
+ [Synth](javascript:Gibber.Environment.displayDocs('Synth2'\))  
+ [FMSynth](javascript:Gibber.Environment.displayDocs('FMSynth'\))  
+ [Pluck](javascript:Gibber.Environment.displayDocs('Pluck'\))  
+ [Drums](javascript:Gibber.Environment.displayDocs('Drums'\))  

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

## Constructor
**param** *input*: Object. A input Bus to record samples from
**param** *length*: Integer. The length of recording to make in samples.
**param** *shouldStart*: Boolean. If true, the Record object starts recording immediately.
**/

/**###Sampler.startRecording : method
**param** *length*: Integer. The length of the recording, in samplers.

**description**: Start recording samples from the Record objects input buffer.
**/

/**###Sampler.note : method
**param** *playbackSpeed*: Float. The speed of the buffer playback.
**param** *amp*: Float. The amplitude of the buffer playback.

**description**: Play the buffer stored in the sampler object at a given speed and amplitude.
**/

function Record(input, length, shouldStart) {
	var that = Gibberish.Record(input, length, shouldStart, speed);
	that.send(Master, that.amp);
	if(typeof shoudldStart === "undefined" || shouldStart) {
		that.startRecording();
	}
	return that;
}

function Sampler(pathToFile) {
	var that = Gibberish.Sampler(pathToFile);
	that.send(Master, 1);
	return that;
}
