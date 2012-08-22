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
];

/*for (var i = 0; i < filenames.length; i++) {
	var text = fs.readFileSync(__dirname + "/../gibber/" + filenames[i], 'utf8');

	var reg = /\/\*\*((.|\n)*)\*\*\//;
	var matches = reg.exec(text);
	//console.log("MATCHES LENGTH", matches.length, matches[2]);
	for(var j = 1; j < matches.length - 1; j++ ) {
		if(matches[j] !== null && typeof matches[j] !== "undefined" && matches[j] != "") {
			var md = converter.makeHtml(matches[j]);
			var reg2 = /\>(.*)\</;
			var name = reg2.exec(md);
			//console.log("NAME = " + name[1]);
			objs[name[1]] = md;
		}
	}
}*/

for (var i = 0; i < filenames.length; i++) {
	var text = fs.readFileSync(__dirname + "/../gibber/" + filenames[i], 'utf8');
	//text = "/** testing **/";
	var matches = null;
	//var reg = /\/\*\*(.|\n)*\*\*\//g;    ///\*\*(.|\s)+\*\*/
	//var reg = /(?:\/\*\*)+(.|\n)*(?:\*\*\/)+/g;
	//var reg = /(?:\/\*\*)(.|\n)+(?:\*\*\/)/gm;   
	//var reg = /[/\*\*]+(.|\s)+[\*\*/]+/g;// 
	var reg = /(?:\/\*\*)((.|\n|\s)+?)(?:\*\*\/)/g;
	var matches = null;
	//
	while (matches = reg.exec(text)) {
		console.log("MATCHES LENGTH", matches.length, matches[1]);
		if(matches[1] !== null && typeof matches[1] !== "undefined" && matches[1] != "") {
			var md = converter.makeHtml(matches[1]);
			var reg2 = /\>(.*)\</;
			var name = reg2.exec(md);
			var parts = name[1].split(".");
			if(parts.length > 1) {
				console.log("IS METHOD OR PROPERTY", parts[1]);
				if(parts[1].indexOf("method") > -1) {
					console.log("METHOD");
					if(typeof objs[parts[0]] !== "undefined") {
						objs[parts[0]].methods[parts[1].split(":")[0]] = md;
					}
				}else{
					console.log("PROPERTY");
					if(typeof objs[parts[0]] !== "undefined") {
						objs[parts[0]].properties[parts[1].split(":")[0]] = md;
					}
				}
			}else{
				objs[name[1]] = {
					text:md,
					methods:{},
					properties:{},
				};
			}
			//objs["test"] = md;
		}
	}
}


//console.log(objs);
fs.writeFileSync(__dirname + "/../gibber/documentation.js", JSON.stringify(objs), 'utf8');
