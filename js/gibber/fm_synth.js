// d = FM("glockenspiel").out();
// d.amp = .1;
// 
// a = ScaleSeq(rndi(-2, 7, 64), _16).slave(d);
// aa = ScaleSeq(rndi(0, 9, 65), _16).slave(d);
// 
// aaa = ScaleSeq(rndi(-3, 6, 66), _16).slave(d);
// aaa.root = "C3";
// 
// aaaa = ScaleSeq(rndi(2, 9, 67), _16).slave(d);
// aaaa.root = "C5";
// 
// a.humanize = aa.humanize = aaa.humanize = aaaa.humanize = 150;

function FM(cmRatio, index, attack, decay, shouldUseModulatorEnvelope){
	var that;
	if(typeof Gibber.FMPresets === "undefined") FMPresets();
	
	if(typeof arguments[0] === "string") { // if a preset
		if(typeof arguments[1] === "undefined") {
			that = Gibberish.PolyFM( Gibber.FMPresets[arguments[0]] );
		}else{
			var props = Gibber.FMPresets[arguments[0]];
			Gibberish.extend(props, arguments[1]);
			
			that = Gibberish.PolyFM( props );
		}
	}else if(typeof arguments[0] === "object") {
		that = Gibberish.PolyFM( arguments[0] );
	}else{
		props = {
			cmRatio : isNaN(cmRatio) ?  2 	: cmRatio,
			index  	: isNaN(index)	 ? .9 	: index,
			attack 	: isNaN(attack)  ? 4100 : attack,
			decay  	: isNaN(decay)   ? 4100 : decay,
		};
		
		that = Gibberish.PolyFM( props );
	}
	
	that.note = Gibber.makeNoteFunction(that);
	that.chord = Gibber.chord;	
	
	return that;
}

function FMPresets() {
	Gibber.FMPresets = {
		glockenspiel : {
			cmRatio	: 3.5307,
			index 	: 1,
			attack	: 44,
			decay	: 44100,
		},
		//ljpfrog lp.f = FM(0.1, 2.0, 300, 5);
		//ljpradio lp.f = FM(1, 40.0, 300, 500); lp.f.amp = 0.2;
		//ljpnoise lp.f = FM(0.04, 1000.0, 1, 100);
		frog : {
			cmRatio	: 0.1,
			index	: 2.0,
			attack	: 300 * 44.1,
			decay	: 5 * 44.1,
		},
		gong : {
			cmRatio : 1.4,
			index	: .95,
			attack	: 44.1,
			decay	: 5000 * 44.1,
		},
		drum : {
			cmRatio : 1.40007,
			index	: 2,
			attack	: 44,
			decay	: 44100,
		},
		drum2 : {
			cmRatio: 1 + Math.sqrt(2),
			index: .2,
			attack: 441,
			decay: 20 * 44.1,
		},
		brass : {
			cmRatio : 1 / 1.0007,
			index	: 5,
			attack	: 4100,
			decay	: 4100,
		},
		clarinet : {
			cmRatio	: 3 / 2,
			index	: 1.5,
			attack	: 50 * 44.1,
			decay	: 200 * 44.1,
		}
	};
}