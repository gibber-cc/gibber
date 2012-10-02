// GIBBER
// by Charlie Roberts
// 2011
// MIT License
define(['gibber/audio_callback'], function() {
	var Gibber = {
		active : true,
		bpm : 120,
		MAX_MEASURES : 22,
		audioInit : false,
		root : "C4",
		mode : "aeolian",
		busses : [],
		presets : [],
		modes :[ "major", "ionian", "dorian",  "phrygian", "lydian", "mixolydian", "minor", "aeolian", "locrian", "majorpentatonic", "minorpentatonic", "chromatic"],
		
		time : function(val) {
			if(val < this.MAX_MEASURES) {
				val = Math.round(val * _1);
			}
			return val;
		},
		
		initDurations : function() {
			for(var i = 0; i <= 64; i++) {
				window["_"+i] = this.measure / i;
			}
		},
		
		make : function(objName) {
			return Gibberish.new(objName);
		},
	
		meta: function(obj) {
			var letters = "abcdefghijklmnopqrstuvwxyz";
			for(var l = 0; l < letters.length; l++) {
				var lt = letters.charAt(l);
				(function() {
					var ltr = lt;
					Object.defineProperty(obj, ltr, {
						get:function() { return obj["____"+ltr];},
						set:function(newObj) {
							if(newObj !== null) {	// replace
								var endString = " created";
								 if(typeof obj["____"+ltr] !== "undefined" && obj["____"+ltr] != null) {
									 var variable = obj["____"+ltr];
									 //console.log(variable);
									 switch(variable.category) {
										 case "Gen": case "Bus":
											 if(typeof variable.replace === "undefined") {
												 Gibber.genReplace(variable, newObj);
											 }else{
											 	 variable.replace(newObj);
											 }
										 break;
										 case "Mod":
											 Gibber.modReplace(variable, newObj);
										 break;
										 case "FX":
											 Gibber.fxReplace(variable, newObj);
										 break;
										 case "control":
											 Gibber.controlReplace(variable, newObj);
											 break;
										 case "complex":
											//console.log("Replacing " + variable.name);
											variable.replace(newObj); // rely on object prototype to handle removing members
										 break;
										 default: break;
									 }
								 }
								 if(newObj.name != undefined)
								 	G.log(newObj.name + endString);
							 
							 }else{		// kill
								 //console.log("killing");
								 if(typeof obj["____"+ltr] !== "undefined") {
									 var variable = obj["____"+ltr];
									 if(variable != null) {
										 if(variable.kill != undefined) {
											 variable.kill();
										 }
									 }
								 }
							 }
						 	 obj["____"+ltr] = newObj;
						},
					})
				})();
			}
		
			obj.kill = function() {
				for(var n in obj) {
					if(typeof obj[n].kill === "function") {
						obj[n].kill();
					}
				}
			};
		},
	
		killSingles : function(obj) {	// kill all single letter variables
			var letters = "abcdefghijklmnopqrstuvwxyz";
			for(var l = 0; l < letters.length; l++) {
				var ltr = letters.charAt(l);
				window[ltr] = null;
			}
		},
		
		applyPreset : function(name, args) {
			var props;
			if(typeof args[0] === "string") { // if a preset
				if(typeof args[1] === "undefined") {
					props = Gibber.presets[name][args[0]];
				}else{
					props = Gibber.presets[name][args[0]];
					if(typeof props !== 'undefined')
						Gibberish.extend(props, args[1]);			
				}
			}else if(typeof args[0] === "object") {
				props = args[0];		
			}
	
			return props;
		},
	
		// wraps Gibberish note function to _note and calls it after calculating frequency
		makeNoteFunction : function(targetObj) {
			if(typeof targetObj.note === "undefined") {
				targetObj.note = function(freq, amp) { 
					this.frequency = freq;
					if(typeof amp !== "undefined") {
						this.amp = amp;
					}
				}
			}
			eval("targetObj._note = " + targetObj.note.toString()); // create the copy
				
			return function(note) {
				switch(typeof note) {
					case "number" : break;
					case "string" :
						note = teoria.note(note).fq();
					break;
					default:
						note = note.fq();
						break;
				}
				this._note(note);
			};
		},
			
		chord : function(val, volume, shouldTrigger) {
			this.notation = val;
				
			if(typeof this.notation === "string") {
				var _root = this.notation.slice(0,1);
				var _octave, _quality;
				if(isNaN(this.notation.charAt(1))) { 	// if true, then there is a sharp or flat...
					_root += this.notation.charAt(1);	// ... so add it to the root name
					_octave = parseInt( this.notation.slice(2,3) );
					_quality = this.notation.slice(3);
				}else{
					_octave = parseInt( this.notation.slice(1,2) );
					_quality = this.notation.slice(2);
				}
			
				//console.log(_root + " : " + _octave + " : " + _quality);
				var _chord = teoria.note(_root + _octave).chord(_quality);
				for(var j = 0; j < _chord.notes.length; j++) {
					var n = _chord.notes[j];
					//console.log(n, this);
					this.note(n);
				}
			}else{
				for(var k = 0; k < this.notation.length; k++) {
					var note = this.notation[k];
					this.note(note);
				}
			}

			if(typeof arguments[1] !== "undefined") {
				this.amp = arguments[1];
			}
		
			return this;
		},
	
		init : function() {
			//this.dev = Sink(audioProcess, 2, 4096);
			this.sampleRate = 44100;//this.dev.sampleRate;
			
			this.context = new webkitAudioContext();//sinks.webaudio.getContext(),
			console.log("BEFORE GETTING AUDIO...");
			this.node = this.context.createJavaScriptNode(4096, 2, 2);
			console.log("ADGAING");
		    navigator.webkitGetUserMedia(
				{audio:true}, 
				function (stream) {
					console.log("INIT AUDIO");
				    //var context = new webkitAudioContext();
    		
				    /*Gibber.analyser = Gibber.context.createAnalyser();
				    Gibber.analyser.fftSize = 2048;
			
				    Gibber.jsnode = Gibber.context.createJavaScriptNode(2048, 1, 1);
					Gibber.jsnode.onaudioprocess = function(e) {
						var data = e.inputBuffer.getChannelData(0);
						var sum = 0;
						for(var i = 0; i < data.length; i++) {
							sum += data[i];
						}
						sum /= data.length;
						//console.log("AVG = " + sum);
					};*/
	
				    Gibber.mediaStreamSource = Gibber.context.createMediaStreamSource(stream);    
				    Gibber.mediaStreamSource.connect(Gibber.node);
					//Gibber.analyser.connect(Gibber.jsnode);
				    //Gibber.jsnode.connect(Gibber.context.destination);
				},
				function(e) { console.log("EIRHIEHR", e); });
			
			this.node.onaudioprocess = audioProcess;
			this.node.connect(this.context.destination);
			
			this.beat = (60000 / this.bpm) * (this.sampleRate / 1000);
			this.measure = this.beat * 4;
		
			this.initDurations();
			
			window.Master = Gibberish.Bus();
			Master.channels = 2;
			Master.connect(Gibberish.MASTER);
			
			require([	
				'gibber/fx',
				'gibber/sequence',
				'gibber/scale_seq',
				'gibber/arpeggiator',
				'teoria',
				'gibber/utilities',
				'gibber/drums',
				'gibber/beatCallback',
				'gibber/synth',
				'gibber/fm_synth',
				'gibber/string',
				'gibber/sampler',
				'gibber/grains',
				'gibber/envelopes',
			], function() {
				if(typeof Gibber.Environment !== "undefined") { // if we are using with the Gibber editing environment
					Gibber.Environment.init();
				}

				Gibber.callback = new Callback();

				window.loop = function(cb, time) {
					var l = Gibber.callback.addCallback(cb, time, true);
					l.end = function() {
						Gibber.callback.callbacks = Gibber.callback.callbacks.removeObj(Gibber);
					};
					return l;
				};
		
				Gibber.meta(window);
			});
		},
	
		observers : {
			"bpm": [],
		},
	
		genReplace : function(gen, newGen) {
			//console.log("GEN REPLACE");
			Master.disconnectUgen(gen); // disconnect from output if connected
			//console.log(Master.senders);
			Master.senders.remove(gen);
			// if old gen is modulating another gen...
			for(var i = 0; i < gen.modding.length; i++) {
				var mod = gen.modding[i];
				mod.ugen.removeMod(mod.mod);
				mod.ugen.mod(mod.mod.name, newGen, mod.mod.type);
			}
		
			// if gen is being modulated...
			for(var i = 0; i < gen.mods.length; i++) {
				var mod = gen.mods[i];
				newGen.mod(mod.name, mod.operands[1], mod.type);
			}
		
			// if gen is slaved to sequencer...
			if(typeof gen.masters !== "undefined") {
				for(var i = 0; i < gen.masters.length; i++) {
					var master = gen.masters[i];
					master.slaves.remove(gen);
					master.slave(newGen);
				}
			}
		
			// if gen has fx...
			for(var i = 0; i < gen.fx.length; i++) {
				newGen.fx.add(gen.fx[i]);
			}
		},
	
		modReplace : function(oldMod, newMod) {
		// loop through ugens / fx that the mods influence and replace with new value
		// also push ugens that are modded into the mods "modded" array for future reference
			var modToReplace = oldMod;
			for(var i = 0; i < modToReplace.modded.length; i++) {
				var moddedGen = modToReplace.modded[i];
				for(var j = 0; j < moddedGen.mods.length; j++) {
					var modCheck = moddedGen.mods[j].gen;
					if(modCheck == modToReplace) {
						if(newMod.type == "mod") {
							moddedGen.mods[j].gen =  newMod;
						}
						newMod.modded.push(moddedGen);
					}
				}
			}
		},
		
		fxReplace : function(oldFX, newFX) {
		// loop through gens affected by effect (for now, this should almost always be 1)
		// replace with new effect and add the gen to the gens array of the new effect
			var fxToReplace = oldFX;
			for(var i = 0; i < fxToReplace.gens.length; i++) {
				var fxgen = fxToReplace.gens[i];
				var idx = jQuery.inArray( fxToReplace, fxgen.fx );
				if(idx > -1) {
					fxgen.fx.splice(idx,1,newFX);
					newFX.gens.push(fxgen);
				}
			}
		},
	
		controlReplace: function(oldControl, newControl) {
			var controlToReplace = oldControl;

			if(controlToReplace.slaves !== null && typeof controlToReplace.slaves !== "undefined") {

				for(var i = 0; i < controlToReplace.slaves.length; i++) {
					var slave = controlToReplace.slaves[i];
					newControl.slave(slave);
				}
				controlToReplace.slaves.length = 0;
			}
			if(controlToReplace.mods !== null && typeof controlToReplace.mods !== "undefined") {		
				for(var i = 0; i < controlToReplace.mods.length; i++) {
					var mod = controlToReplace.mods[i];
					newControl.mods.push(mod);
				}
				controlToReplace.mods.length = 0;
			}
			
			oldControl.kill();
		},
	
		registerObserver : function(name, fn) {
			//console.log("Registering " + fn);
			this.observers[name].push(fn);
		},
	
		setBPM : function(_bpm) {
			var oldbpm = this.bpm;
			this.bpm = _bpm;
			this.beat = 60000 / this.bpm * (this.sampleRate / 1000);
			this.measure = Math.floor(this.beat * 4);
		
			for(var j = 0; j <= 64; j++) {
				window["_"+j] = Math.floor(this.measure / j);
			}
		
			var bpmObservers = Gibber.observers.bpm;

			var percentChange = this.bpm / oldbpm; //oldbpm / this.bpm;
			for(var i = 0; i < bpmObservers.length; i++) {
				bpmObservers[i](percentChange); 	// all observers are callback functions to be called
			}
		},
	
		clear : function() {
			for(var cc = 0; cc < Gibber.callback.slaves.length; cc++) {
				Gibber.callback.slaves[cc].kill();
			}
			Gibber.callback.sequence = [];
		
			Gibber.killSingles();

			Master.senderObjects.remove();
			Master.senders.remove();
			Master.fx.remove();

			Gibber.log("Cleared Gibber graph.");	
		},
	
		stop : function() {
			this.active = false;
		},
		start : function() {
			this.active = true;
		},

		runScript : function(script) {
			try {
				eval(script);
			}catch(e) {
				G.log(e.toString());
				console.log(e);
			}
		},

	}
	return Gibber; 
});

function LFO(freq, amp, waveform) {
	if(typeof waveform === "undefined") waveform = "Sine";
	//var that = Gibberish[waveform](freq, amp);
	//that.channels = 1;
	var that = Gibberish.LFO(freq, amp);
	return that;
};

function Sine(freq, volume) {	
	var that = Gibberish.Sine(freq, volume).connect(Master);
	that.note = Gibber.makeNoteFunction(that);
	return that;
}

function Triangle(freq, volume) {	
	var that = Gibberish.Triangle(freq, volume).connect(Master);
	that.note = Gibber.makeNoteFunction(that);
	return that;
}

function Square(freq, volume) {
	var that = Gibberish.Square(freq, volume).connect(Master);
	that.note = Gibber.makeNoteFunction(that);
	return that;
}

function Saw(freq, volume) {	
	var that = Gibberish.Saw(freq, volume).connect(Master);
	that.note = Gibber.makeNoteFunction(that);
	return that;
}

function Pulse(freq, volume) {	
	var that = Osc.apply(null,arguments);
	that.name = "Pulse";
	that.waveShape = 'pulse';
	
	that.amp *= .7;
	
	return that;
}

function InvSaw(freq, volume) {	
	var that = Osc.apply(null,arguments);
	that.name = "InvSaw";	
	that.waveShape = 'invSawtooth';
	
	that.amp *= .55;
	
	return that;
}
