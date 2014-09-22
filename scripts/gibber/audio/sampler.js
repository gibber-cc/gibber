!function() { 
  "use strict"
  
  var Samplers = { Presets:{} },
      Gibberish = require( 'gibberish-dsp' ),
      Gibber,
      $ = require( '../dollar' ),
      Clock = require('../clock')(),
      curves = require('../mappings').outputCurves,
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
      min: 50, max: 3200, 
      hardMin:.01, hardMax:22050,
      output: LOGARITHMIC, 
      timescale: 'audio', 
      doNotProxy:true 
    },
  }
  
  Samplers.Sampler = function() {
    var oscillator = new Gibberish.Sampler().connect( Gibber.Master ),
        args = Array.prototype.slice.call( arguments, 0 ),
        name = 'Sampler'
         
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
            this.frequency = typeof pitch === 'function' ? pitch() : pitch
          }else{
            freq[ 0 ] = pitch
          }
        }
      }
      
      Gibber.createProxyProperties( oscillator, mappingProperties )

      var proxyMethods = [ 'note', 'pickBuffer' ]
      
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
  			that.length = that.end = buffer.length
        that.buffers[ file.name ] = buffer
    
        that.isPlaying = true;
			
  			console.log("LOADED", file.name, buffer.length);
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
        
        item = file.webkitGetAsEntry()
        
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
      self.length = self.end = self.getBuffer().length;
      self.setPhase( self.length )
      self.isRecording = false;
    })
    .record();

    return this;
  };
  

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
          target: that.children[ that.currentLoop],
          durations: that.length,
          key:'note',
          values: [ null ] 
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
          values: [ null ] 
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
    that.play = function() { that.seq.play(); }
	
  	return that;
  }
  
  module.exports = function( __Gibber ) { if( typeof Gibber === 'undefined' ) { Gibber = __Gibber; } return Samplers }  
}()