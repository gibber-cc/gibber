module.exports = function( Gibber ) { 
  "use strict"
  
  var Samplers = { Presets:{} },
      Gibberish = require( 'gibberish-dsp' ),
      $ = Gibber.dollar,
      Clock = require('./clock')( Gibber ),
      curves = Gibber.outputCurves,
      LINEAR = curves.LINEAR,
      LOGARITHMIC = curves.LOGARITHMIC

  var mappingProperties = {
    amp: {
      min: 0, max: 1,
      hardMax:2,
      output: LOGARITHMIC,
      timescale: 'audio',
      dimensions:1
    },
    start: {
      min: 0, max: 1,
      output: LINEAR,
      timescale: 'audio',
      dimensions:1
    },
    end: {
      min: 0, max: 1,
      output: LINEAR,
      timescale: 'audio',
      dimensions:1
    },
    pitch: {
      min: 1, max: 4,
      hardMin: .01, hardMax: 20,      
      output: LOGARITHMIC,
      timescale: 'audio',
    },
    out: {
      min: 0, max: 1,
      output: LINEAR,
      timescale: 'audio',
      dimensions:1
    },
    pan: { min: -1, max: 1, output: LOGARITHMIC, timescale: 'audio',},   
    note: { 
      min: .1, max: 4, 
      output: LOGARITHMIC, 
      timescale: 'audio', 
      doNotProxy:true 
    },
  }
  
  Samplers.Sampler = function() {
    var args = Array.prototype.slice.call( arguments, 0 ),
        file = args[0] && args[0].file ? args[0].file : undefined,
        oscillator, buffer, name = 'Sampler'
        
      if( args[0] && args[0].buffer ) { buffer = args[0].buffer }
      if( buffer ) {
        oscillator = new Gibberish.Sampler({ 'buffer':buffer }).connect( Gibber.Master )
      }else{
        oscillator = new Gibberish.Sampler( file ).connect( Gibber.Master )
      }

      oscillator.type = 'Gen'
      $.extend( true, oscillator, Gibber.Audio.ugenTemplate )
      
      oscillator.fx.ugen = oscillator
      
      Object.defineProperty(oscillator, '_', {
        get: function() { 
          oscillator.kill();
          return oscillator 
        },
        set: function() {}
      })
      
      if( typeof oscillator.note === 'undefined' ) {
        oscillator.note = function( pitch ) {
          var freq = this.frequency()
          if( typeof freq === 'number' || typeof freq === 'function' ) {
            this.frequency = typeof pitch === 'object' ? pitch.value : pitch
          }else{
            freq[ 0 ] = pitch
          }
        }
      }

      var oldStart = oscillator.__lookupSetter__('start').bind( oscillator ),
          __start = 0
      
      Object.defineProperty(oscillator, 'start', {
        configurable: true,
        get: function() { 
          return __start 
        },
        set: function(v) {
          if( typeof v === 'number' ) {
            // if( v <= 1 ) {
            //   __start = v * oscillator.length
            // }else{
            //   __start = v
            // }
            __start = v
          }else{ 
            __start = v
          }
          oldStart( __start )
          // oscillator.setPhase( __start ) // TODO: HACK! Why doesn't this work automatically?
          
          return __start
        }
      })
      
      var oldEnd = oscillator.__lookupSetter__('end').bind( oscillator ),
          __end = 1
      Object.defineProperty(oscillator, 'end', {
        configurable:true,
        get: function() { 
          return __end 
        },
        set: function(v) {
          if( typeof v === 'number' ) {
            __end = v
          }else{
            __end = v
          }
          oldEnd( __end )
          //oscillator.setPhase( __end ) // TODO: HACK! Why doesn't this work automatically?
          
          return __end
        }
      })
       
      Gibber.createProxyProperties( oscillator, mappingProperties )

      var proxyMethods = [ 'note', 'pickBuffer', 'switchBuffer', 'range' ]
      
      Gibber.createProxyMethods( oscillator, proxyMethods )

      Gibber.processArguments2( oscillator, args, name )
      
      oscillator.toString = function() { return name }
      
      return oscillator
  }
  
  Gibberish.Sampler.prototype.readFile = function( file ) {
    var that = this
    if( file.isFile ) {
      file.file( function( file ) {
        that.readFile( file )
      })
      return
    }
    var reader = new FileReader()
    
    reader.readAsArrayBuffer( file );

    reader.onload = function (event) {
      Gibberish.context.decodeAudioData( reader.result, function(_buffer) {
        var buffer = _buffer.getChannelData(0)
        that.setBuffer( buffer )
  			that.length = buffer.length
        that.buffers[ file.name ] = buffer
    
        that.isPlaying = true;
			
        //console.log("LOADED", file.name, buffer.length);
  			Gibberish.audioFiles[ file.name ] = buffer;
	
        if(that.onload) that.onload();
  
        if(that.playOnLoad !== 0) that.note( that.playOnLoad );
  
  			that.isLoaded = true;
      })
    }
  }
  
  Gibberish.Sampler.prototype.ondrop = function( files ) {
    for( var i = 0; i < files.length; i++ ) {
      ( function(_that) { 
        var file = files[ i ],
            reader = new FileReader(),
            that = _that, item;
        
        item = file.webkitGetAsEntry ? file.webkitGetAsEntry() : file
        
        if( item.isDirectory ) {
          var dirReader = item.createReader()
      		dirReader.readEntries( function( entries ){
      			var idx = entries.length;
      			while(idx--){
      				_that.readFile( entries[idx] );
      			}	
      		})
        }else{
          _that.readFile( item )
        }
      })( this )
    }
  }
  
  Gibberish.Sampler.prototype.pickBuffer = function() {
    this.switchBuffer( rndi( 0, this.getNumberOfBuffers() ) )
  }
  
  Gibberish.Sampler.prototype.record = function(input, recordLength) {
    this.isRecording = true;
    console.log( 'starting recording' )
    var self = this;

    this.recorder = new Gibberish.Record(input, Gibber.Clock.time( recordLength ), function() {
      console.log( 'recording finished' )
      self.setBuffer( this.getBuffer() );
      self.length = self.getBuffer().length;
      self.setPhase( self.length )
      self.isRecording = false;
    })
    .record();

    return this;
  };
  
  Gibberish.Sampler.prototype.done = function( func ) {
    this.onload =  func
    return this
  }
  
  Gibberish.Sampler.prototype.load = function( url ) {
    var xhr = new XMLHttpRequest(), initSound
        
    xhr.open( 'GET', url, true )
    xhr.responseType = 'arraybuffer'
    xhr.onload = function( e ) { initSound( this.response, url ) }
    xhr.send()
    
    //console.log("now loading sample", url )
    xhr.onerror = function( e ) { console.error( "Sampler file loading error", e )}
    
    var self = this, buffer, bufferLength = 0, phase = 0
        
    function initSound( arrayBuffer, filename ) {
      Gibber.Audio.Core.context.decodeAudioData( arrayBuffer, function( _buffer ) {
        var buffer = _buffer.getChannelData(0)
  			self.length = buffer.length
        self.setPhase( self.length )
        self.setBuffer( buffer )
        self.isPlaying = true;
  			self.buffers[ filename ] = buffer;
        self.file = filename

        //console.log("sample loaded | ", filename, " | length | ", buffer.length );
  			Gibberish.audioFiles[ filename ] = buffer;
			
        if(self.onload) self.onload();
      
        if(self.playOnLoad !== 0) self.note( self.playOnLoad );
      
  			self.isLoaded = true;
      }, function(e) {
        console.log('Error decoding file', e);
      }); 
    };
    
    return this
  }
  
  Gibberish.Sampler.prototype.loadDir = function( dir ) {
    var xhr = new XMLHttpRequest(), initSound
        
    xhr.open( 'GET', dir, true )
    xhr.responseType = 'html'
    xhr.onload = function( e ) { loadDir( this.response, dir ) }
    xhr.send()
    
    console.log("now loading directory", dir )
    xhr.onerror = function( e ) { console.error( "Error loading directory", e )}
    
    var self = this
        
    function loadDir( response, dir ) {       
        var page = $( response ),
            links = $( page ).find( 'a' )
        
        for( var i = 0; i < links.length; i++ ) {
          var link = links[ i ],
              split = link.href.split( '/' ),
              url   = split[ split.length - 1 ]
              
          if( url !== '' && url !== '.DS_Store' && url !== 'node-ecstatic' ) {
            self.load( dir + '/' + url )
          }
        }
    };
    
    return this
  }
  

  Samplers.Looper = function(input, length, numberOfLoops) {
  	var that = Bus();
    $.extend( that, {
      children : [],
      input : input,
      length : Clock.time(length),
      numberOfLoops : numberOfLoops,
      pitch : 1,
      currentLoop : 0,
      loop : function() {
        that.children[ that.currentLoop ].record( that.input, that.length );
    
        var seq = {
          target: that.children[ that.currentLoop ],
          durations: that.length,
          key:'note',
          values: [ 1 ] 
        }

        that.seq.add( seq )
        that.seq.start()
        
        future(that.nextLoop, length);

        return that;
      },
      nextLoop : function() {
    		that.children[++that.currentLoop].record(that.input, that.length);
    		if(that.currentLoop < that.numberOfLoops - 1) {
    			future(that.nextLoop, length);
    		}
        var seq = {
          target: that.children[ that.currentLoop ],
          durations: that.length,
          key:'note',
          values: [ 1 ] 
        }

        that.seq.add( seq )
    	},
    })
    
    var __pitch = 1
    Object.defineProperty( that, 'pitch', {
      configurable:true,
      get: function() {
        return __pitch
      },
      set: function(v) {
        __pitch = v
        for( var i = 0; i < that.children.length; i++ ) {
          that.children[ i ].pitch = __pitch
        }
      }
    })
    
  	for(var i = 0; i < numberOfLoops; i++) {
  		that.children.push( Sampler({ pitch:that.pitch })._ );	
  		that.children[i].send(that, 1);
  	}
    
    Gibber.createProxyProperties( that, { pitch:mappingProperties.pitch } )
        
    that.stop = function() { that.seq.stop(); }
    that.play = function() { that.seq.start(); }
	
  	return that;
  }
  
  return Samplers
}
