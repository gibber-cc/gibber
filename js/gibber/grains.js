// TODO: how to deal with presets?

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