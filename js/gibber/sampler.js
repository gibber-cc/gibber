/**#Sampler - Buffer Recording & Playback
Sampler allows you to playback audiofiles at different speeds. It also allows you to record the output of any 
Gibber [Bus](javascript:Gibber.Environment.displayDocs('Bus'\)). 
This could be the Master bus, or any of the polyphonic instruments that output to their own dedicated bus:  
* [Synth](javascript:Gibber.Environment.displayDocs('Synth'\))  
* [Synth2](javascript:Gibber.Environment.displayDocs('Synth2'\))  
* [FMSynth](javascript:Gibber.Environment.displayDocs('FMSynth'\))  
* [Pluck](javascript:Gibber.Environment.displayDocs('Pluck'\))  
* [Drums](javascript:Gibber.Environment.displayDocs('Drums'\))  
* [Input](javascript:Gibber.Environment.displayDocs('Input'\)) 

## Example Usage ##
`a = Drums("x*ox*xo-");  
b = Sampler();
b.amp = 2.5;
b.record(a, 2);
b.fx.add( HPF(.4, 4.5) );    
c = Seq({
  note:[4,2,.5],
  durations:[_1, _1, _1 * 4],
  slaves:b
});
`
## Constructor
**param** *input*: Optional. String. The path to an audiofile to load. You can only load samples from web servers.
**/

/**###Sampler.record : method
**param** *input*: A [Bus](javascript:Gibber.Environment.displayDocs('Bus'\)) . See the main description for info on what can be recorded.  

**param** *length*: Integer. The length of the recording, in samplers.

**description**: Start recording samples from a Gibber Bus. The Master Bus can also be recorded.
**/

/**###Sampler.note : method
**param** *playbackSpeed*: Float. The speed of the buffer playback. Can be positive or negative (for reverse playback).
**param** *amp*: Float. The amplitude of the buffer playback.

**description**: Play the buffer stored in the sampler object at a given speed and amplitude.
**/

function Sampler(pathToFile) {
	var that = Gibberish.Sampler(pathToFile);
	if(typeof pathToFile === "string") {
		that.send(Master, 1);
	}else{
		if(typeof pathToFile !== 'undefined' &&  typeof pathToFile.buffer !== 'undefined') {
      that.send( Master, 1 )
    }
  }
	return that;
}

freesound.apiKey = "4287s0onpqpp492n8snr27sp3o228nns".replace(/[a-zA-Z]/g, function(c){return String.fromCharCode((c<="Z"?90:122)>=(c=c.charCodeAt(0)+13)?c:c-26);});
function Freesound() {
  var sampler = Sampler();
  
  var key = arguments[0] || 96541;
  var callback = arguments[1];
  var filename;
  
  var onload = function() {
    G.log(filename + " LOADED !!!")
    Gibber.context.decodeAudioData(Freesound.request.response, function(buffer) {
      Freesound.loaded[ filename ] = buffer.getChannelData( 0 )
      sampler.buffer = Freesound.loaded[ filename ];
      sampler.bufferLength = sampler.buffer.length;
      sampler.isLoaded = true;
      sampler.end = 1;
			sampler.function.setBuffer( sampler.buffer );
			sampler.function.setPhase( sampler.bufferLength );
      sampler.filename = filename;
      
      sampler.send( Master, 1 )
      if(callback) { callback() }
    })
  }
  
  // freesound query api http://www.freesound.org/docs/api/resources.html
  if(typeof key === 'string') {
    var query = key;
    freesound.search(query, /*page*/0, /*filter*/null, 'rating_desc', null, null, null,
        function(sounds){
          filename = sounds.sounds[0].original_filename
          
          if(typeof Freesound.loaded[ filename ] === 'undefined') {
            Freesound.request = new XMLHttpRequest();
            G.log("now downloading " + filename + ", " + sounds.sounds[0].duration + " seconds in length" )
            Freesound.request.open('GET', sounds.sounds[0].serve + "?&api_key=" + freesound.apiKey, true);
            Freesound.request.responseType = 'arraybuffer';
            Freesound.request.onload = onload;
            Freesound.request.send();
          }else{
            sampler.buffer = Freesound.loaded[ filename ];
            sampler.filename = filename;
            sampler.bufferLength = sampler.buffer.length;
            sampler.isLoaded = true;
            sampler.end = 1;
      			sampler.function.setBuffer( sampler.buffer );
      			sampler.function.setPhase( sampler.bufferLength );
      
            sampler.send( Master, 1 )
            if(callback) { callback() }
          }
        },function(){ displayError("Error while searching...")}
    );
  }else if(typeof key === 'object') {
    var query   = key.query,
        filter  = key.filter || "",
        sort    = key.sort   || 'rating_desc',
        page    = key.page   || 0;
        pick    = key.pick   || 0;
    
    filter += ' type:wav'
    freesound.search(query, page, filter, sort, null, null, null,
        function(sounds){
          if(sounds.num_results > 0) {
            var num = 0;
            
            if(typeof key.pick === 'number') {
              num = key.pick
            }else if( typeof key.pick === 'function') {
              num = key.pick();
            }else if( key.pick === 'random') {
              num = rndi(0, sounds.sounds.length);
            }
            
            filename = sounds.sounds[ num ].original_filename

            if(typeof Freesound.loaded[ filename ] === 'undefined') {
              Freesound.request = new XMLHttpRequest();
              G.log("now downloading " + filename + ", " + sounds.sounds[ num ].duration + " seconds in length" )
              Freesound.request.open('GET', sounds.sounds[ num ].serve + "?&api_key=" + freesound.apiKey, true);
              Freesound.request.responseType = 'arraybuffer';
              Freesound.request.onload = onload;
              Freesound.request.send();
            }else{
              G.log('using exising loaded sample ' + filename)
              sampler.buffer = Freesound.loaded[ filename ];
              sampler.bufferLength = sampler.buffer.length;
              sampler.isLoaded = true;
              sampler.end = 1;
        			sampler.function.setBuffer( sampler.buffer );
        			sampler.function.setPhase( sampler.bufferLength );
      
              sampler.send( Master, 1 )
              if(callback) { callback() }
            }
          }else{
            G.log("No Freesound files matched your query.")
          }
        },function(){ displayError("Error while searching...")}
    );
  }else if(typeof key === 'number') {
    freesound.get_sound(key,
      function(sound){
        Freesound.request = new XMLHttpRequest();
        filename = sound.original_filename
        Freesound.request.open('GET', sound.serve + "?api_key=" + freesound.apiKey, true);
        Freesound.request.responseType = 'arraybuffer';
        Freesound.request.onload = onload;
        Freesound.request.send();  
      }
    )
  }
  return sampler;
}
Freesound.loaded = {};
Freesound.request = null;
/**#Looper - Buffer Recording & Playback
The Looper ugen allows you to quickly overdub multiple takes from a single sound input. It is primarily designed to work with
the [Input](javascript:Gibber.Environment.displayDocs('Input'\)) ugen to record and loop live input, however, it can record
the output of any [Bus](javascript:Gibber.Environment.displayDocs('Bus'\)) ugen.

You specify the input source, the number of loops and how long each loop should last in the constructor. The Looper creates a
[Sampler](javascript:Gibber.Environment.displayDocs('Sampler'\)) object to hold each individual loop behind the scenes;
each of these Sampler object is stored in the *children* property of the Looper object. 
## Example Usage ##
`a = Input();           // live input only works in Chrome Canary
b = Looper(a, 4, 1);   // four loops, one measure apiece
b.loop();
// wait 2 measures  
c = Seq({
  speed:[4, .5, -2],   // sequence playback speed
  durations:2
  slaves:b
});
`
## Constructor
**param** *input*: Object or String. A input Bus to record samples from.

**param** *numberOfLoops*: Integer. The number of loops the Looper should overdub on top of each other.

**param** *loopLength*: Integer. The length (in measures or samples) of each loop.
**/

/**###Looper.speed : property
Float. The speed of the loop playback. Negative speeds will play the loops in reverse. Default is 1.
**/

function Looper(input, length, numberOfLoops) {
	var that = Gibberish.Bus();
	that.children = [];
	that.input = input;
	that.length = G.time(length * 2); // TODO: THIS IS A HACK!!!
	that.numberOfLoops = numberOfLoops;
	that.seq = null;
	 
	that.currentLoop = 0;
	for(var i = 0; i < numberOfLoops; i++) {
		that.children.push( Sampler() );
		that.children[i].disconnect();
		that.children[i].send(that, 1);
	}
	that.send(Master, 1);
	
/**###Looper.loop : method
**description**: Start recording and looping samples from a Gibber Bus.
**/
	that.loop = function() {
		that.children[that.currentLoop].record(that.input, that.length);
		that.seq = Seq([2], that.length / 2);
		that.seq.slave(that.children[that.currentLoop]);
		
		future(that.nextLoop, length);
		return that;
	};
	
	that.nextLoop = function() {
		that.children[++that.currentLoop].record(that.input, that.length);
		if(that.currentLoop < that.numberOfLoops - 1) {
			future(that.nextLoop, length);
		}
		that.seq.slave(that.children[that.currentLoop]);
	};
	that.stop = function() { that.seq.stop(); }
	that.play = function() { that.seq.play(); }
	
	var _pitch = 2;
	Object.defineProperty(that, "pitch", {
		get: function() { return _pitch },
		set: function(val) { 
			_pitch = val * 2;
			that.seq.note = [_pitch];
			for(var i = 0; i < that.children.length; i++) {
				that.children[i].pitch = _pitch;
			}
		},
	});
	var _speed = 1;
	Object.defineProperty(that, "speed", {
		get: function() { return _speed },
		set: function(val) { 
			_speed = val;
			that.pitch = _speed;
			that.seq.speed = (1 / Math.abs(_speed)) * 2;
		},
	});
	
	// //var that = Gibberish.Sampler(pathToFile);
	// if(typeof pathToFile === "string") {
	// 	that.send(Master, 1);
	// }else{
	// 	console.log("NOT CONNECTING SAMPLER");
	// }
	return that;
}

