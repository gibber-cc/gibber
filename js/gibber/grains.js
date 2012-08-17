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
g.mod("position", Line(.2,.8, _1 * 16, true), "=");
g.mod("speedMax", Line(.1,.8, _1 * 16, true), "=");
g.mod("speedMin", Line(-.1,-.8, _1 * 16, true), "=");  
d.stop();`
## Constructor
**param** *propertiesList*: Object. At a minimum you should define the buffer to granulate. See the example.
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