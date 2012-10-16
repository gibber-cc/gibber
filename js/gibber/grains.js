// TODO: how to deal with presets?

/**#Grains - Buffer Recording & Playback
A granulator that operates on a buffer of samples. You can either get the samples from a [Sampler](javascript:Gibber.Environment.displayDocs('Sampler'\))
object, or directly record the output of a [Bus](javascript:Gibber.Environment.displayDocs('Bus'\)) (like the Master bus).
## Example Usage ##
`d = Drums('x*o*x*o-');  
g = Grains({input:d, amp:.8, bufferLength:2});
g.loop(.2, .8, 16);
g.mod("speedMax", Line(.1, .8, true), "=");
g.mod("speedMin", Line(-.1, -.8, 16, true), "=");  
d.stop();`
## Constructor
**param** *propertiesList*: Object. At a minimum you should define the input to granulate. See the example.
**/

/**###Grains.input : property
Object. The input Bus to granulate.
**/

/**###Grains.bufferLength : property
Float. The length, in measures or samples, of the buffer to record and granulate
**/

/**###Grains.numberOfGrains : property
Float. The number of grains in the cloud. Can currently only be set on initialization.
**/

/**###Grains.grainSize : property
Integer. The length, in samples, of each grain
**/

/**###Grains.speed : property
Float. The playback rate, in samples, of each grain
**/

/**###Grains.speedMin : property
Float. When set, the playback rate will vary on a per grain basis from (grain.speed + grain.speedMin) -> (grain.speed + grain.speedMax). This value should almost always be negative.
**/

/**###Grains.speedMax : property
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
	if(properties.grainSize) properties.grainSize = G.time(properties.grainSize);
	if(properties.input) { 
		properties.buffer = properties.input;
		delete properties.input;
	}
	properties.bufferLength = typeof properties.bufferLength === "undefined" ? G.time(1) : G.time(properties.bufferLength);
	var that = Gibberish.Grains(properties);
	that.connect(Master);
		
	var positionVariance = properties.positionVariance || 0;
	var pitchVariance = properties.pitchVariance || 0;	
	
/**###Grains.loop : method
**param** *min* Float. Default .25. The starting position for the playback loop. Measured from 0..1 where is the buffer start, 1 is the buffer end.  

**param** *max* Float. Default .75.The finishing position for the playback loop. Measured from 0..1 where is the buffer start, 1 is the buffer end.	 

**param** *time* Int. Default 1. The length of time, in samples, to travel through the loop points once.  

**param** *shouldLoop* Boolean. Default true. If set to false, the buffer will only play through the min and max values once.  
	
**description** : Tell the Grain cloud to travel between two positions in its buffer.
**/
	
	that.loop = function(min, max, time, shouldLoop) {
		min = isNaN(min) ? .25 : min;
		max = isNaN(max) ? .75 : max;
		time = isNaN(time) ? _1 : G.time(time);
		
		shouldLoop = typeof shouldLoop === "undefined" ? true : shouldLoop;
		this.mod("position", Line(min, max, time, shouldLoop), "=");
		var that = this;
		if(shouldLoop === false) {
			future( function() { that.removeMod("position"); }, time);
		}
	}
	
	that.loop(0,1,properties.bufferLength); // start looping automatically
	
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