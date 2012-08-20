// TODO: how to deal with presets?

/**#Grains
A granulator that operates on a buffer of samples. You can either get the samples from a [Sampler](javascript:Gibber.Environment.displayDocs('Sampler'\))
object, or the output of a [Bus](javascript:Gibber.Environment.displayDocs('Bus'\)) (like the Master bus) 
using the [Record](javascript:Gibber.Environment.displayDocs('Record'\)) object.

## Example Usage ##
`d = Drums('x*o*x*o-', _8);
r = Record(d, _1 * 4);
r.startRecording();  
// wait 4 or 5 measures  
g = Grains({buffer:r.buffer, amp:.8});
g.loop(.2, .8, _1 * 16);
g.mod("speedMax", Line(.1,.8, _1 * 16, true), "=");
g.mod("speedMin", Line(-.1,-.8, _1 * 16, true), "=");  
d.stop();`
## Constructor
**param** *propertiesList*: Object. At a minimum you should define the buffer to granulate. See the example.
**/

/*
/**###Grains.grainSize : property
Integer. The length, in samples, of each grain
**/

/**###Grains.speed : property
Float. The playback rate, in samples, of each grain
**/

/**###Grains.speedMin : property
Float. When set, the playback rate will vary on a per grain basis from (grain.speed + grain.speedMin) -> (grain.speed + grain.speedMax). This value should almost always be negative.
**/

/**###Grains.speedMMax : property
Float. When set, the playback rate will vary on a per grain basis from (grain.speed + grain.speedMin) -> (grain.speed + grain.speedMax).
**/

/**###Grains.position : property
Float. The center position of the grain cloud. 0 represents the start of the buffer, 1 represents the end.
**/

/**###Grains.positionMin : property
Float. The left boundary on the time axis of the grain cloud.
**/

/**###Grains.positionMax : property
Float. The right boundary on the time axis of the grain cloud.
**/

/**###Grains.numberOfGrains : property
Float. The number of grains in the cloud. Can currently only be set on initialization.
**/

function Grains(properties) {
	// if(typeof Gibber.GrainsPresets === "undefined") GrainsPresets();
	// 
	// if(typeof arguments[0] === "string") { // if a preset
	// 	if(typeof arguments[1] === "undefined") {
	// 		that = Gibberish.PolyFM( Gibber.FMPresets[arguments[0]] );
	// 	}else{
	// 		console.log("EXTENDING WITH ", arguments[1]);
	// 		var props = Gibber.FMPresets[arguments[0]];
	// 		Gibberish.extend(props, arguments[1]);
	// 		
	// 		that = Gibberish.PolyFM( props );
	// 	}
	// }
	var that = Gibberish.Grains(properties);
	that.send(Master, that.amp);
	
/**###Grains.loop : method
**param** *min* Float. Default .25. The starting position for the playback loop. Measured from 0..1 where is the buffer start, 1 is the buffer end.  
**param** *max* Float. Default .75.The finishing position for the playback loop. Measured from 0..1 where is the buffer start, 1 is the buffer end.	 
**param** *time* Int. Default _1. The length of time, in samples, to travel through the loop points once.  
**shouldLoop** *Boolean*. Default true. If set to false, the buffer will only play through the min and max values once.  
	
**description** : Tell the Grain cloud to travel between two positions in its buffer.
**/
	
	that.loop = function(min, max, time, shouldLoop) {
		min = isNaN(min) ? .25 : min;
		max = isNaN(max) ? .75 : max;
		time = isNaN(time) ? _1 : time;
		
		shouldLoop = typeof shouldLoop === "undefined" ? true : shouldLoop;
		this.mod("position", Line(min, max, time, shouldLoop), "=");
		var that = this;
		if(shouldLoop === false) {
			future( function() { that.removeMod("position"); }, time);
		}
	}
	return that;
}

function GrainsPresets() {
	Gibber.GrainsPresets = {
		tight : {
			numberOfGrains : 10,
			grainSize : ms(25),
			positionVariance : .01,
			pitchVariance : .01,
			shouldReverse : false,
			length: 88200,
		},
		cloudy : {
			numberOfGrains : 20,
			grainSize : ms(100),
			positionVariance : .05,
			pitchVariance : .1,
			shouldReverse : true,
		}
	};
}