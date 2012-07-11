function Schizo(props) {
	if(typeof Gibber.SchizoPresets === "undefined") {
		Gibber.SchizoPresets = {
			sane: {
				chance			: .1,
				reverseChance 	: 0,
				pitchChance		: .5,
				mix				:.5,
			},
			borderline: {
				chance			: .1,		
				pitchChance		: .25,
				reverseChance	: .5,
				mix				: 1,
			},
			paranoid: {
				chance			: .2,
				reverseChance 	: .5,
				pitchChance		: .5,
				mix				: 1,
			},
		};
	}

	var that = {
		type:		"BufferShuffler",
		category:	"FX",
		chance: 	.25,		
		rate: 		11025,
		length:		22050,
		reverseChance : .5,
		pitchChance : .5,
		pitchMin : .25,
		pitchMax : 2,
		mix : 1,
	};

	if(typeof arguments[0] === "object") {
		$.extend(that, arguments[0]);
	}else if(typeof arguments[0] === "string") {
		$.extend(that, Gibber.SchizoPresets[arguments[0]]);
	}

	that = Gibberish.BufferShuffler( that );
	
	return that;
}