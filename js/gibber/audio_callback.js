function processMods(gen) {
	//if(Gibber.debug) console.log("MODDING " + gen.mods.length);
	for(var m = 0; m < gen.mods.length; m++) {
		var mod = gen.mods[m];
		
		if(mod.active) {
			if(mod.mods.length != 0) {
				processMods(mod);
			}
			mod.store[mod.param] = gen[mod.param];
		
			var val = mod.out();			
		
			audioLib.Automation.modes[mod.type](gen, mod.param, val);
		}
	}		
}

function restoreMods(gen) {	
	for(var m = 0; m < gen.mods.length; m++) {
		var mod = gen.mods[m];
		
		if(mod.active) {
			if(mod.mods.length != 0) {
				restoreMods(mod);
			}
			for(var name in mod.store) {
				gen[name] = mod.store[name];
			}
		}
	}	
}

function audioProcess(buffer, channelCount){
	var i, channel, value;
	
	if( Gibber.active ) {		
		for(var i = 0, _bl = buffer.length; i < _bl; i+= channelCount) {
			if(i === 0) Gibber.debug = true;
			
			value = 0;
			
			Gibber.callback.generate();
			for(var c = 0, _cl = Gibber.controls.length; c < _cl; c++) {
				var control = Gibber.controls[c];
				processMods(control);
				control.generate();
				restoreMods(control);
			}
			
			for(var g = 0, _gl = Gibber.generators.length; g < _gl; g++) {
				var genValue = 0;
				var gen = Gibber.generators[g];
				
				if(gen.active) {					
					processMods(gen); // apply modulation changes
					if(!gen.isControl) {
						genValue += gen.out();
					}else{
						gen.generate();
					}
					
					restoreMods(gen); // reset gen values to state before modulation
				}
				
				// run fx
				for(var e = 0, _el = gen.fx.length; e < _el; e++) {
					var effect = gen.fx[e];
					processMods(effect);
					genValue = effect.fxout(genValue);
					restoreMods(effect);
				}
					
				// TODO: send from any point in the fx chain?
				if(gen.sends) {
					for(var s = 0, _sl = gen.sends.length; s < _sl ; s++) {
						var send = gen.sends[s];
						send.bus.value += genValue * send.amount;
					}
				}
				
				value += genValue;
			}
			// Busses
			for(var b = 0, _bbl = Gibber.busses.length; b < _bbl; b++) {
				var bus = Gibber.busses[b];
				var busValue = bus.value;
				
				for(var e = 0, _eel = bus.fx.length; e < _eel ; e++) {
					var effect = bus.fx[e];
					processMods(effect);
					busValue += effect.fxout(busValue);
					restoreMods(effect);
				}
				
				value += busValue;
				bus.value = 0;
			}
			
			// Master output
			for(var e = 0, _ml = Master.fx.length; e < _ml; e++) {
				var effect = Master.fx[e];
				processMods(effect);
				value = effect.fxout(value);
				restoreMods(effect);
			}
			buffer[i] = value * Master.amp;
			buffer[i + 1] = buffer[i];
			Gibber.debug = false;
		}
	}
};
