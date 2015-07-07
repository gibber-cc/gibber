module.exports = function( freesound ) {
  freesound.setToken('6a00f80ba02b2755a044cc4ef004febfc4ccd476')

  var Freesound = function() {
    var sampler = Sampler();

    var key = arguments[0] || 96541;
    var callback = null;
    var filename, request;

    sampler.done = function(func) {
      callback = func
    }

    var onload = function(request) {
      Gibber.log(filename + " loaded.", request )
      Gibber.Audio.Core.context.decodeAudioData(request.response, function(buffer) {
        Freesound.loaded[filename] = buffer.getChannelData(0)
        sampler.buffer = Freesound.loaded[filename];
        sampler.bufferLength = sampler.buffer.length;
        sampler.isLoaded = true;
        //sampler.end = sampler.bufferLength;
        sampler.setBuffer(sampler.buffer);
        sampler.setPhase(sampler.bufferLength);
        sampler.filename = filename;

        sampler.send(Master, 1)
        if (callback) {
          callback()
        }
      }, function(e) {
        console.log("Error with decoding audio data" + e.err)
      })
    }

    // freesound query api http://www.freesound.org/docs/api/resources.html
    if (typeof key === 'string') {
      var query = key;
      Gibber.log('searching freesound for ' + query)
      // textSearch: function(query, options, success, error){ 
        // search: function(query, page, filter, sort, num_results, fields, sounds_per_page, success, error
      //freesound.search(query, /*page*/ 0, 'duration:[0.0 TO 10.0]', 'rating_desc', null, null, null,
      freesound.textSearch( query, { page:1 },// page:0, filter: 'duration:[0.0 TO 10.0]', sort:'rating_desc' }, 
        function(sounds) {
          console.log("SOUNDS", typeof sounds, sounds )
          sounds = JSON.parse( sounds )
          filename = sounds.results[0].name
          var id = sounds.results[0].id

          if (typeof Freesound.loaded[filename] === 'undefined') {
            var request = new XMLHttpRequest();
            //Gibber.log("now downloading " + filename + ", " + sounds.sounds[0].duration + " seconds in length")
            // https://www.freesound.org/apiv2/sounds/110011/download/
            request.open('GET', 'https://www.freesound.org/apiv2/sounds/'+ id + '/download', true) //"?&api_key=" + freesound.apiKey, true);
            request.responseType = 'arraybuffer';
            //request.withCredentials = true;
            request.onload = function( v ) {
              console.log("WOO HOO", v )
              onload(request)
            };
            request.send();
            freesound.getSound( id, function( val ){ console.log( val ) }, null )
          } else {
            sampler.buffer = Freesound.loaded[filename];
            sampler.filename = filename;
            sampler.bufferLength = sampler.buffer.length;
            sampler.isLoaded = true;
            sampler.end = sampler.bufferLength;
            sampler.setBuffer(sampler.buffer);
            sampler.setPhase(sampler.bufferLength);

            sampler.send(Master, 1)
            if (callback) {
              callback()
            }
          }
        }, function() {
          displayError("Error while searching...")
        }
      );
    } else if (typeof key === 'object') {
      var query = key.query,
        filter = key.filter || "",
        sort = key.sort || 'rating_desc',
        page = key.page || 0;
      pick = key.pick || 0;

      Gibber.log('searching freesound for ' + query)

      filter += ' duration:[0.0 TO 10.0]'
      freesound.search(query, page, filter, sort, null, null, null,
        function(sounds) {
          if (sounds.num_results > 0) {
            var num = 0;

            if (typeof key.pick === 'number') {
              num = key.pick
            } else if (typeof key.pick === 'function') {
              num = key.pick();
            } else if (key.pick === 'random') {
              num = rndi(0, sounds.sounds.length);
            }

            filename = sounds.sounds[num].original_filename

            if (typeof Freesound.loaded[filename] === 'undefined') {
              request = new XMLHttpRequest();
              Gibber.log("now downloading " + filename + ", " + sounds.sounds[num].duration + " seconds in length")
              request.open('GET', sounds.sounds[num].serve + "?&api_key=" + freesound.apiKey, true);
              request.responseType = 'arraybuffer';
              request.onload = function() {
                onload(request)
              };
              request.send();
            } else {
              Gibber.log('using exising loaded sample ' + filename)
              sampler.buffer = Freesound.loaded[filename];
              sampler.bufferLength = sampler.buffer.length;
              sampler.isLoaded = true;
              sampler.end = sampler.bufferLength;
              sampler.setBuffer(sampler.buffer);
              sampler.setPhase(sampler.bufferLength);

              sampler.send(Master, 1)
              if (callback) {
                callback()
              }
            }
          } else {
            Gibber.log("No Freesound files matched your query.")
          }
        }, function() {
          console.log("Error while searching...")
        }
      );
    } else if (typeof key === 'number') {
      Gibber.log('downloading sound #' + key + ' from freesound.org')
      freesound.get_sound(key,
        function(sound) {
          request = new XMLHttpRequest();
          filename = sound.original_filename
          request.open('GET', sound.serve + "?api_key=" + freesound.apiKey, true);
          request.responseType = 'arraybuffer';
          request.onload = function() {
            onload(request)
          };
          request.send();
        }
      )
    }
    return sampler;
  }
  Freesound.loaded = {};

  return Freesound
}