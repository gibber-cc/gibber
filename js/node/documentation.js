// note - you must install showdown with npm in order to run this file and generate docs. Showdown converts markdown to HTML.
var Showdown = require('showdown');
var fs = require('fs');

var converter = new Showdown.converter();
var objs = {}
var filenames = [
	"sequence.js",
	"synth.js",
	"arpeggiator.js",
	"drums.js",
	"fx.js",
	"grains.js",
	"sampler.js",
	"scale_seq.js",
	"fm_synth.js",
	"string.js",
	"envelopes.js",
	"input.js",
	"graphics.js"
];

for (var i = 0; i < filenames.length; i++) {
	var text = fs.readFileSync(__dirname + "/../gibber/" + filenames[i], 'utf8');
	var matches = null;
	var reg = /(?:\/\*\*)((.|\n|\s)+?)(?:\*\*\/)/g;
	var matches = null;

	while (matches = reg.exec(text)) {
		if(matches[1] !== null && typeof matches[1] !== "undefined" && matches[1] != "") {
			var md = converter.makeHtml(matches[1]);
			var reg2 = /\>(.*)\</;
			var name = reg2.exec(md)[1];
			
			// split name and type
			var _type_name = name.split("-");
			
			name = _type_name[0].replace(" ", "");
			
			var type = _type_name[1];
			
			// get rid of type in header... category is only used for table of contents
			if(typeof type !== "undefined") {
				md = md.replace("-"+ type, "");
			}
			
			// there will only be dot if the match is a property or method, not a main object.
			var parts = name.split("."); 
			if(parts.length > 1) {
				//console.log("IS METHOD OR PROPERTY", parts[1]);
				if(parts[1].indexOf("method") > -1) {
					//console.log("METHOD");
					if(typeof objs[parts[0]] !== "undefined") {
						objs[parts[0]].methods[parts[1].split(":")[0]] = md;
					}
				}else{
					//console.log("PROPERTY");
					if(typeof objs[parts[0]] !== "undefined") {
						objs[parts[0]].properties[parts[1].split(":")[0]] = md;
					}
				}
			}else{
				objs[name] = {
					text:md,
					methods:{},
					properties:{},
				};
				
				// just in case the type isn't defined...
				if(typeof type !== "undefined") { 
					objs[name].type = type;
				}else{
					objs[name].type = "Miscellaneous";
				}
			}
		}
	}
}

//console.log(objs);
fs.writeFileSync(__dirname + "/../gibber/documentation.js", JSON.stringify(objs), 'utf8');
