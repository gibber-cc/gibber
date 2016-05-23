// note - you must install marked with npm in order to run this file and generate docs. marked converts markdown to HTML.
var marked = require( 'marked' ),
    hljs = require('highlight.js'),
    fs = require('fs'),
    audio, math, singletons, graphics, interface, sequencing;

// marked.setOptions({
//   highlight: function (code, lang) {
//     return hljs.highlight('javascript', code).value; 
//   },
//   lang:'javascript'
// })

oscillators = [
  'audio/sine',
  'audio/triangle',
  'audio/square',
  'audio/pwm',
  'audio/noise',
  'audio/saw'
]
  
synths = [ 
  'audio/sampler',
  'audio/soundfont',  
  'audio/synth',
  'audio/synth2',
  'audio/fm',
  'audio/mono',
  'audio/pluck'
]

drums = [
  'audio/drums',
  'audio/edrums',  
  'audio/kick',
  'audio/snare',
  'audio/hat',
  'audio/clave',
  'audio/cowbell',
  'audio/conga',
  'audio/tom'
]

effects = [
  'audio/flanger',
  'audio/hpf',
  'audio/lpf',
  'audio/tremolo',
  'audio/gain',
  'audio/reverb',
  'audio/delay',
  'audio/crush',
  'audio/chorus',
  'audio/vibrato',
  'audio/schizo',
  'audio/ringmod'
]

misc = [
  'audio/bus',
  'audio/input'
]

math = [
  'math/abs',
  'math/add',
  'math/clamp',
  'math/div',
  'math/merge',
  'math/mod',
  'math/mul',
  'math/pow',
  'math/sqrt',
  'math/sub'
]  
 
singletons = [
  'singletons/gibber.clock',
  'singletons/gibber'
]


shaders = [
  'graphics/film',
  'graphics/dots',
  'graphics/edge',
  'graphics/focus',
  'graphics/bleach',
  'graphics/kaleidoscope',
  'graphics/pixellate',
  'graphics/stripes',
]
graphics = [
  'graphics/geometry',
  'graphics/canvas'
]
 
interface = [
  'interface/mouse',
  'interface/slider',
  'interface/widget',
  'interface/button',
  'interface/knob',
  'interface/crossfader',
  'interface/XY',
  'interface/keyboard',
  'interface/accelerometer',
  'interface/orientation',  
  'interface/patchbay'
]
 
sequencing = [
  'sequencing/arp',
  'sequencing/pattern',
  'sequencing/seq'  
]

output = '# Audio\n'
output +='## Oscillators\n'
for( var i = 0; i < oscillators.length; i++ ) {
    var file = fs.readFileSync( __dirname + '/input/' + oscillators[i]  + '.md', 'utf8' )
    output += file
    output += '\n'
}

output +='## Synths\n'
for( var i = 0; i < synths.length; i++ ) {
    var file = fs.readFileSync( __dirname + '/input/' + synths[i]  + '.md', 'utf8' )
    output += file
    output += '\n'
}

output +='## Drums & Percussion\n'
for( var i = 0; i < drums.length; i++ ) {
    var file = fs.readFileSync( __dirname + '/input/' + drums[i]  + '.md', 'utf8' )
    output += file
    output += '\n'
}

output +='## Effects\n'
for( var i = 0; i < effects.length; i++ ) {
    var file = fs.readFileSync( __dirname + '/input/' + effects[i]  + '.md', 'utf8' )
    output += file
    output += '\n'
}


output += '## Math/Modulation\n'
for( var i = 0; i < math.length; i++ ) {
    var file = fs.readFileSync( __dirname + '/input/' + math[i]  + '.md', 'utf8' )
    output += file
    output += '\n'
}

output += '# Graphics\n'
output += '## Shaders\n'
for( var i = 0; i < shaders.length; i++ ) {
    var file = fs.readFileSync( __dirname + '/input/' + shaders[i]  + '.md', 'utf8' )
    output += file
    output += '\n'
}

output += '## Misc\n'
for( var i = 0; i < graphics.length; i++ ) {
    var file = fs.readFileSync( __dirname + '/input/' + graphics[i]  + '.md', 'utf8' )
    output += file
    output += '\n'
}

output += '# Sequencing\n'
for( var i = 0; i < sequencing.length; i++ ) {
    var file = fs.readFileSync( __dirname + '/input/' + sequencing[i]  + '.md', 'utf8' )
    output += file
    output += '\n'
}

output += '# Interface\n'
for( var i = 0; i < interface.length; i++ ) {
    var file = fs.readFileSync( __dirname + '/input/' + interface[i]  + '.md', 'utf8' )
    output += file
    output += '\n'
}

output += '# Singletons\n'
for( var i = 0; i < singletons.length; i++ ) {
    var file = fs.readFileSync( __dirname + '/input/' + singletons[i]  + '.md', 'utf8' )
    output += file
    output += '\n'
}

fs.writeFileSync(__dirname + '/docs.md', output, 'utf8');
// var converter = new Showdown.converter();
// var objs = {}
// var filenames = [
// 	"sequence.js",
// 	"synth.js",
// 	"arpeggiator.js",
// 	"drums.js",
// 	"fx.js",
// 	"grains.js",
// 	"sampler.js",
// 	"scale_seq.js",
// 	"fm_synth.js",
// 	"string.js",
// 	"envelopes.js",
// 	"input.js",
// 	"graphics.js",
// 	"shaders.js",
// 	"geometry.js",
// ];

// for (var i = 0; i < filenames.length; i++) {
// 	var text = fs.readFileSync(__dirname + "/../gibber/" + filenames[i], 'utf8');
// 	var matches = null;
// 	var reg = /(?:\/\*\*)((.|\n|\s)+?)(?:\*\*\/)/g;
// 	var matches = null;

// 	while (matches = reg.exec(text)) {
// 		if(matches[1] !== null && typeof matches[1] !== "undefined" && matches[1] != "") {
// 			var md = converter.makeHtml(matches[1]);
// 			var reg2 = /\>(.*)\</;
// 			var name = reg2.exec(md)[1];
			
// 			// split name and type
// 			var _type_name = name.split("-");
			
// 			name = _type_name[0].replace(" ", "");
			
// 			var type = _type_name[1];
			
// 			// get rid of type in header... category is only used for table of contents
// 			if(typeof type !== "undefined") {
// 				md = md.replace("-"+ type, "");
// 			}
			
// 			// there will only be dot if the match is a property or method, not a main object.
// 			var parts = name.split("."); 
// 			if(parts.length > 1) {
// 				//console.log("IS METHOD OR PROPERTY", parts[1]);
// 				if(parts[1].indexOf("method") > -1) {
// 					//console.log("METHOD");
// 					if(typeof objs[parts[0]] !== "undefined") {
// 						objs[parts[0]].methods[parts[1].split(":")[0]] = md;
// 					}
// 				}else{
// 					//console.log("PROPERTY");
// 					if(typeof objs[parts[0]] !== "undefined") {
// 						objs[parts[0]].properties[parts[1].split(":")[0]] = md;
// 					}
// 				}
// 			}else{
// 				objs[name] = {
// 					text:md,
// 					methods:{},
// 					properties:{},
// 				};
				
// 				// just in case the type isn't defined...
// 				if(typeof type !== "undefined") { 
// 					objs[name].type = type;
// 				}else{
// 					objs[name].type = "Miscellaneous";
// 				}
// 			}
// 		}
// 	}
// }

// //console.log(objs);
