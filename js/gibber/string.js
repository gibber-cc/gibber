//  Gibber.js - string.js
/**#Pluck - Physical Model
An implementation of the Karplus-Strong algorithm that can play notes or chords.
## Example Usage ##
`p = Pluck();  
p.note( "A3" );  
p = Pluck({damping:.5, blend:1, maxVoices:5});
p.chord('c4m7');  
s = ScaleSeq(rndi(-5,7,128), _32).slave(p);
s.mode = "phrygian";
s.root = "G3";
s.humanize = 200;
`
## Constructors
### syntax 1:
**param** *damping*: Float. Default = 0. The speed at which the string decays. Note that higher frequencies decay faster than lower frequencies in the (basic) Karplus-Strong implementation  

**param** *blend*: Float. Default = 1. 1 gives string sounds, .5 gives noisy sounds, 0 gives weird sounds  

**param** *amp*: Float. Default = .5. The amplitude of the string(s).
- - - -
### syntax 2: 
**param** *arguments* : Object. A dictionary of property values to set upon initialization. See the properties section and the example usage section for details.
**/

function Pluck (damping, blend, amp){
	var that = {};

	if(typeof arguments[0] === "object") {
		if(typeof arguments[0].maxVoices === "undefined") {
			arguments[0].maxVoices = 1;
		}
		that = Gibberish.PolyKarplusStrong( arguments[0] );
	}else{
		var props = {
			damping : (isNaN(damping)) ? 0 : damping / 100,
			blend	: (isNaN(blend)) ? 1 : blend,
			amp		: amp || .5,
			maxVoices: 1,
		};
		
		that = Gibberish.PolyKarplusStrong( props );
	}

	that.note = Gibber.makeNoteFunction(that);
	that.chord = Gibber.chord;

	that.send(Master, that.amp);	
	
	return that;
}

/**#Pluck2 - Physical Model
An bi-directional waveguide implementation of the Karplus-Strong algorithm that can play notes or chords.
## Example Usage ##
`p = Pluck2();  
p.note( "A3" );  
p = Pluck2({damping:.5, blend:1, maxVoices:5});
p.chord('c4m7');  
s = ScaleSeq(rndi(-5,7,128), _32).slave(p);
s.mode = "phrygian";
s.root = "G3";
s.humanize = 200;
`
## Constructors
### syntax 1:
**param** *damping*: Float. Default = 0. The speed at which the string decays. Note that higher frequencies decay faster than lower frequencies in the (basic) Karplus-Strong implementation  

**param** *blend*: Float. Default = 1. 1 gives string sounds, .5 gives noisy sounds, 0 gives weird sounds  

**param** *amp*: Float. Default = .5. The amplitude of the string(s).
- - - -
### syntax 2: 
**param** *arguments* : Object. A dictionary of property values to set upon initialization. See the properties section and the example usage section for details.
**/

function Pluck2 (damping, blend, amp, color){
	var that = {};

	if(typeof arguments[0] === "object") {
		that = Gibberish.KarplusStrong2( arguments[0] );
	}else{
		var props = {
			damping : (isNaN(damping)) ? 0 : damping / 100,
			blend	: (isNaN(blend)) ? 1 : blend,
			amp		: amp || .5,
			maxVoices: 1,
		};
		
		that = Gibberish.KarplusStrong2( props );
	}

	that.note = Gibber.makeNoteFunction(that);
	that.chord = Gibber.chord;

	that.send(Master, that.amp);	
	
	return that;
}

function Mesh (){
	var that = Gibberish.Mesh( arguments[0] );
	
	that.send(Master, that.amp);	
	
	return that;
}

