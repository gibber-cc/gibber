function processMods(gen) {
	//if(Gibber.debug) console.log("MODDING " + gen.mods.length);
	for(var m = 0; m < gen.mods.length; m++) {
		var mod = gen.mods[m];
		
		if(mod.mods.length != 0) {
			processMods(mod);
		}
		mod.store[mod.param] = gen[mod.param];
		
		var val = mod.out();
		
		audioLib.Automation.modes[mod.type](gen, mod.param, val);
	}		
}

function restoreMods(gen) {	
	for(var m = 0; m < gen.mods.length; m++) {
		var mod = gen.mods[m];
		if(mod.mods.length != 0) {
			restoreMods(mod);
		}
		for(var name in mod.store) {
			gen[name] = mod.store[name];
		}
	}	
}

function audioProcess(buffer, channelCount){
	var i, channel, value;
	
	if( Gibber.active ) {
		//console.log(Gibber.generators.length);
		for(var i = 0; i < buffer.length; i+= channelCount) {
			if(i === 0) Gibber.debug = true;
			
			value = 0;
			
			Gibber.callback.generate();
			for(var c = 0; c < Gibber.controls.length; c++) {
				var control = Gibber.controls[c];
				processMods(control);
				//if(Gibber.debug) console.log(control.phase);
				control.generate();
				restoreMods(control);
			}
			
			for(var g = 0; g < Gibber.generators.length; g++) {
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
				
					// run fx
					for(var e = 0; e < gen.fx.length; e++) {
						var effect = gen.fx[e];
						processMods(effect);
						genValue = effect.fxout(genValue);
						restoreMods(effect);
					}
					
					// TODO: send from any point in the fx chain?
					if(gen.sends) {
						for(var b = 0; b < gen.sends.length; b++) {
							var send = gen.sends[b];
							send.bus.value += genValue * send.amount;
						}
					}
				}
				value += genValue;
			}
			
			// Busses
			for(var b = 0; b < Gibber.busses.length; b++) {
				var bus = Gibber.busses[b];
				var busValue = bus.value;
				
				for(var e = 0; e < bus.fx.length; e++) {
					var effect = bus.fx[e];
					processMods(effect);
					busValue += effect.fxout(busValue);
					restoreMods(effect);
				}
				
				value += busValue;
				bus.value = 0;
			}
			
			// Master output
			for(var e = 0; e < Master.fx.length; e++) {
				var effect = Master.fx[e];
				processMods(effect);
				value = effect.fxout(value);
				restoreMods(effect);
			}
			buffer[i] += value;
			buffer[i + 1] = buffer[i];
			Gibber.debug = false;
		}
	}
};
