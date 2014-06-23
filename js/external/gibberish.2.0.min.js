/**#Gibberish - Miscellaneous
Gibberish is the main object used to manage the audio graph and perform codegen functions. All constructors are also inside of the Gibberish object. Gibberish can automatically generate an appropriate web audio callback for you; if you want to use this you must execute the Gibberish.init() command before creating any Gibberish ugens.

## Example Usage##
`// make a sine wave  
Gibberish.init();  
a = new Gibberish.Sine().connect();`
## Constructor
**param** *bufferSize*: Integer. Default 1024. The size of the buffer to be calculated. Since JavaScript is single-threaded, setting exceedingly large values for this will yield to stuttering in graphics and user interface performance.
- - - -
**/
/**###Gibberish.audioFiles : property  
Array. Anytime an audiofile is loaded (normally using the Sampler ugen) the resulting sample buffer is stored in this array so that it can be immediately recalled.
**/
/**###Gibberish.callback : property
String. Whenever Gibberish performs code generation the resulting callback is stored here.
**/
/**###Gibberish.out : property
Object. The is the 'master' bus that everything eventually gets routed to if you're using the auto-generated calback. This bus is initialized in the call to Gibberish.init.
**/
/**###Gibberish.dirtied : property
Array. A list of objects that need to be codegen'd
**/
/**###Gibberish.isDirty : property
Booelan. Whether or codegen should be performed.
**/
/**###Gibberish.codeblock : property
Array. During codegen, each ugen's codeblock is inserted into this array. Once all the ugens have codegen'd, the array is concatenated to form the callback.
**/
/**###Gibberish.upvalues : property
Array. Each ugen's callback function is stored in this array; the contents of the array become upvalues to the master callback function when it is codegen'd.
**/
/**###Gibberish.debug : property
Boolean. Default false. When true, the callbackString is printed to the console whenever a codegen is performed
**/
/**###Gibberish.memo : property
Object. Used in the codegen process to make sure codegen for each ugen is only performed once.
**/


Gibberish = {
  memo              : {},
  codeblock         : [],
  analysisCodeblock : [],
  analysisUgens     : [],
  dirtied           : [],
  id                : 0,
  isDirty           : false,  // whether or not callback needs to codegen'd
  out               : null,   // main output bus
  debug             : false,
  callback          : '',
  audioFiles        : {},
  sequencers        : [],
  callbackArgs      : ['input'], // names of function arguments for main audio callback
  callbackObjects   : [],        // ugen function callbacks used in main audio callback
  analysisCallbackArgs    : [],
  analysisCallbackObjects : [],
  
/**###Gibberish.createCallback : method
Perform codegen on all dirty ugens and re-create the audio callback. This method is called automatically in the default Gibberish sample loop whenever Gibberish.isDirty is true.
**/
  createCallback : function() {
    this.memo = {};
    
    this.codeblock.length = 0;
    
    this.callbackArgs.length = 0;
    this.callbackObjects.length = 0;
    this.analysisCallbackArgs.length = 0;
    
    /* generate code for dirty ugens */
    /*for(var i = 0; i < this.dirtied.length; i++) {
      this.dirtied[i].codegen();
    }*/
    this.dirtied.length = 0;
    
    this.codestring = ''
    
    this.args = ['input']
    
    this.memo = {};
    
    this.out.codegen()
    
    var codeblockStore = this.codeblock.slice(0)
    
    // we must push these here because the callback arguments are at the start of the string, 
    // but we have to wait to codegen the analysis ugens until after their targets have been codegen'd
    if(this.analysisUgens.length > 0) { 
      this.analysisCodeblock.length = 0;
      for(var i = 0; i < this.analysisUgens.length; i++) {
        this.analysisCallbackArgs.push( this.analysisUgens[i].analysisSymbol )
      }
    }
    
    this.args = this.args.concat( this.callbackArgs )
    
    this.args = this.args.concat( this.analysisCallbackArgs )

    /* concatenate code for all ugens */
    //this.memo = {};
    
    this.codestring += codeblockStore.join('\t') //this.codeblock.join("\t");
    this.codestring += "\n\t";
    
    /* analysis codeblock */
    if(this.analysisUgens.length > 0) {
      this.analysisCodeblock.length = 0;
      for(var i = 0; i < this.analysisUgens.length; i++) {
        this.codeblock.length = 0;
        this.analysisUgens[i].analysisCodegen();
        /*
        if(this.codestring !== 'undefined' ) {
          this.codestring += this.codeblock.join("");
          this.codestring += "\n\t";
          this.analysisCodeblock.push ( this.analysisUgens[i].analysisCodegen() );
        }
        */
      }
      this.codestring += this.analysisCodeblock.join('\n\t');
      this.codestring += '\n\t';
    }
    this.codestring += 'return ' + this.out.variable +';\n';
    
    this.callbackString = this.codestring;
    if( this.debug ) console.log( this.callbackString );
    
    return [this.args, this.codestring];
  },

/**###Gibberish.audioProcess : method
The default audio callback used in Webkit browsers. This callback starts running as soon as Gibberish.init() is called.  
  
param **Audio Event** : Object. The HTML5 audio event object.
**/ 
  audioProcess : function(e){
		var bufferL = e.outputBuffer.getChannelData(0),
		    bufferR = e.outputBuffer.getChannelData(1),	
		    input = e.inputBuffer.getChannelData(0),
        me = Gibberish,
        callback = me.callback,
        sequencers = me.sequencers,
        out = Gibberish.out.callback,
        objs = me.callbackObjects.slice(0),
        callbackArgs, callbackBody, _callback, val

        objs.unshift(0)
        
		for(var i = 0, _bl = e.outputBuffer.length; i < _bl; i++){
      
      for(var j = 0; j < sequencers.length; j++) { sequencers[j].tick(); }
      
      if(me.isDirty) {
        _callback = me.createCallback();
        
        try{
          callback = me.callback = new Function( _callback[0], _callback[1] )
        }catch( e ) {
          console.error( "ERROR WITH CALLBACK : \n\n", _callback )
        }
        
        me.isDirty = false;
        objs = me.callbackObjects.slice(0)
        objs.unshift(0)
      }
      
      //console.log( "CB", callback )
      objs[0] = input[i]
      val = callback.apply( null, objs );
      
			bufferL[i] = val[0];
			bufferR[i] = val[1];      
		}
  },
/**###Gibberish.audioProcessFirefox : method
The default audio callback used in Firefox. This callback starts running as soon as Gibberish.init() is called.  
  
param **Sound Data** : Object. The buffer of audio data to be filled
**/   
  audioProcessFirefox : function(soundData) { // callback for firefox
    var me = Gibberish,
        callback = me.callback,
        sequencers = me.sequencers,
        objs = me.callbackObjects.slice(0),
        _callback
        
    objs.unshift(0)
    for (var i=0, size=soundData.length; i<size; i+=2) {
      
      for(var j = 0; j < sequencers.length; j++) { sequencers[j].tick(); }
      
      if(me.isDirty) {
        _callback = me.createCallback();
        
        try {
          callback = me.callback = new Function( _callback[0], _callback[1] )
        }catch( e ) {
          console.error( 'ERROR WITH CALLBACK : \n\n', callback )
        }
        me.isDirty = false;
        objs = me.callbackObjects.slice(0)
        objs.unshift(0)       
      }      
      
			var val = callback.apply(null, objs);
      
			soundData[i] = val[0];
      soundData[i+1] = val[1];
    }
  },
/**###Gibberish.clear : method
Remove all objects from Gibberish graph and perform codegen... kills all running sound and CPU usage.
**/   
  clear : function() {
    this.out.inputs.length = 0;
    this.analysisUgens.length = 0;
    this.sequencers.length = 0;
    
    this.callbackArgs.length = 2
    this.callbackObjects.length = 1
    
    Gibberish.dirty(this.out);
  },

/**###Gibberish.dirty : method
Tell Gibberish a ugen needs to be codegen'd and mark the entire callback as needing regeneration  
  
param **Ugen** : Object. The ugen that is 'dirtied'... that has a property value changed.
**/     
	dirty : function(ugen) {
    if(typeof ugen !== 'undefined') {
      var found = false;
      for(var i = 0; i < this.dirtied.length; i++) {
        if(this.dirtied[i].variable === ugen.variable) found = true;
      }
    
      if(!found) {
        this.isDirty = true;
        this.dirtied.push(ugen);
      }
    }else{
      this.isDirty = true;
    }
	},

/**###Gibberish.generateSymbol : method
Generate a unique symbol for a given ugen using its name and a unique id number.  
  
param **name** : String. The name of the ugen; for example, reverb, delay etc.
**/       
	generateSymbol : function(name) {
		return name + "_" + this.id++; 
	},
  
  // as taken from here: https://wiki.mozilla.org/Audio_Data_API#Standardization_Note
  // only the number of channels is changed in the audio.mozSetup() call
  
/**###Gibberish.AudioDataDestination : method
Used to generate callback for Firefox.  
  
param **sampleRate** : String. The sampleRate for the audio callback to run at. NOT THE BUFFER SIZE.  
param **readFn** : Function. The audio callback to use.
**/ 
  AudioDataDestination : function(sampleRate, readFn) { // for Firefox Audio Data API
    // Initialize the audio output.
    var audio = new Audio();
    audio.mozSetup(2, sampleRate);

    var currentWritePosition = 0;
    var prebufferSize = sampleRate / 2; // buffer 500ms
    var tail = null, tailPosition;

    // The function called with regular interval to populate 
    // the audio output buffer.
    setInterval(function() {
      var written;
      // Check if some data was not written in previous attempts.
      if(tail) {
        written = audio.mozWriteAudio(tail.subarray(tailPosition));
        currentWritePosition += written;
        tailPosition += written;
        if(tailPosition < tail.length) {
          // Not all the data was written, saving the tail...
          return; // ... and exit the function.
        }
        tail = null;
      }

      // Check if we need add some data to the audio output.
      var currentPosition = audio.mozCurrentSampleOffset();
      var available = currentPosition + prebufferSize - currentWritePosition;
      if(available > 0) {
        // Request some sound data from the callback function.
        var soundData = new Float32Array(available);
        readFn(soundData);

        // Writting the data.
        written = audio.mozWriteAudio(soundData);
        currentPosition = audio.mozCurrentSampleOffset();
        if(written < soundData.length) {
          // Not all the data was written, saving the tail.
          tail = soundData;
          tailPosition = written;
        }
        currentWritePosition += written;
      }
    }, 100);
  },
/**###Gibberish.AudioDataDestination : method
Create a callback and start it running. Note that in iOS audio callbacks can only be created in response to user events. Thus, in iOS this method assigns an event handler to the HTML body that creates the callback as soon as the body is touched; at that point the event handler is removed. 
**/   
  init : function() {
    Gibberish.out = new Gibberish.Bus2();
    Gibberish.out.codegen(); // make sure bus is first upvalue so that clearing works correctly
    Gibberish.dirty(Gibberish.out);
    
    var bufferSize = typeof arguments[0] === 'undefined' ? 1024 : arguments[0], audioContext
    
    if( typeof webkitAudioContext !== 'undefined' ) {
      audioContext = webkitAudioContext
    }else if ( typeof AudioContext !== 'undefined' ) {
      audioContext = AudioContext
    }

    // we will potentially delay start of audio until touch of screen for iOS devices
    start = function() {
      
      if( typeof audioContext !== 'undefined' ) {
        document.getElementsByTagName('body')[0].removeEventListener('touchstart', start);
        Gibberish.context = new audioContext();
        Gibberish.node = Gibberish.context.createScriptProcessor(bufferSize, 2, 2, Gibberish.context.sampleRate);	
        Gibberish.node.onaudioprocess = Gibberish.audioProcess;
        Gibberish.node.connect(Gibberish.context.destination);
    
        if('ontouchstart' in document.documentElement){ // required to start audio under iOS 6
          var mySource = Gibberish.context.createBufferSource();
          mySource.connect(Gibberish.context.destination);
          mySource.noteOn(0);
        }
      }else if( navigator.userAgent.indexOf( 'Firefox' ) === -1 ){
        Gibberish.AudioDataDestination(44100, Gibberish.audioProcessFirefox);
        Gibberish.context = { sampleRate: 44100 } // needed hack to determine samplerate in ugens
      }else{
        alert('Your browser does not support javascript audio synthesis. Please download a modern web browser that is not Internet Explorer.')
      }
      if( Gibberish.onstart ) Gibberish.onstart()
    }
    
    if('ontouchstart' in document.documentElement) {
      document.getElementsByTagName('body')[0].addEventListener('touchstart', start);
    }else{
      start();
    }
    
    return this;
  },
  
/**###Gibberish.makePanner : method
Create and return an object that can be used to pan a stereo source.
**/ 
  //   makePanner : function() {
  //   var sin = Math.sin;
  //   var cos = Math.cos;
  //   var sqrtTwoOverTwo = Math.sqrt(2) / 2;
  //     
  //   var f = function(val, pan, array) {
  //       var isObject = typeof val === 'object';
  //       var l = isObject ? val[0] : val;
  //       var r = isObject ? val[1] : val;
  //           
  //       array[0] = l * (sqrtTwoOverTwo * (cos(pan) - sin(pan)) );
  //       array[1] = r * (sqrtTwoOverTwo * (cos(pan) + sin(pan)) );
  //           
  //     return array;
  //   };
  //         
  //   return f;
  // },
  
makePanner : function() {
  // thanks to grrrwaaa for this
  // create pan curve arrays (once-only): 
	var panTableL = [], panTableR = [];
	var sqrtTwoOverTwo = Math.sqrt(2) / 2;

	for( var i = 0; i < 1024; i++ ) { 
		var pan = -1 + ( i / 1024 ) * 2;
		panTableL[i] = (sqrtTwoOverTwo * (Math.cos(pan) - Math.sin(pan)) );
		panTableR[i] = (sqrtTwoOverTwo * (Math.cos(pan) + Math.sin(pan)) );
	}

  return function(val, pan, output) {
    var isObject = typeof val === 'object',
        l = isObject ? val[0] : val,
        r = isObject ? val[1] : val,
        _index, index, frac, index2, val1, val2;
      
    _index  = ((pan + 1) * 1023) / 2
    index   = _index | 0
    frac    = _index - index;
    index   = index & 1023;
    index2  = index === 1023 ? 0 : index + 1;
    
    val1    = panTableL[index];
    val2    = panTableL[index2];
    output[0] = ( val1 + ( frac * (val2 - val1) ) ) * l;
    
    val1    = panTableR[index];
    val2    = panTableR[index2];
    output[1] = ( val1 + ( frac * (val2 - val1) ) ) * r;
    
    return output;
	}
},
  // IMPORTANT: REMEMBER THIS IS OVERRIDDEN IN GIBBER
  defineUgenProperty : function(key, initValue, obj) {
    var prop = obj.properties[key] = {
      value:  initValue,
      binops: [],
      parent : obj,
      name : key,
    };

    Object.defineProperty(obj, key, {
      configurable: true,
      get: function() { return prop.value },
      set: function(val) { 
        prop.value = val;
        Gibberish.dirty(obj);
      },
    });
  },
/**###Gibberish.polyInit : method
For ugens with polyphony, add metaprogramming that passes on property changes to the 'children' of the polyphonic object. Polyphonic ugens in Gibberish are just single instances that are routed into a shared bus, along with a few special methods for voice allocation etc.  
  
param **Ugen** : Object. The polyphonic ugen
**/ 
  polyInit : function(ugen) {
    ugen.mod = ugen.polyMod;
    ugen.removeMod = ugen.removePolyMod;
    
    ugen.voicesClear = function() {
      if( ugen.children.length > 0 ) {
        for( var i = 0; i < ugen.children.length; i++ ) {
          ugen.children[ i ].disconnect()
        }
        ugen.children.length = 0
        ugen.voiceCount = 0
      }
    }
    
    for(var key in ugen.polyProperties) {
      (function(_key) {
        var value = ugen.polyProperties[_key];
        
        Object.defineProperty(ugen, _key, {
          configurable: true,
          get : function() { return value; },
          set : function(val) { 
            value = val;
            for(var i = 0; i < ugen.children.length; i++) {
              ugen.children[i][_key] = value;
            }
          },
        });
        
      })(key);
    }
    
    var maxVoices = ugen.maxVoices
    Object.defineProperty( ugen, 'maxVoices', {
      get: function() { return maxVoices },
      set: function(v) { maxVoices = v; this.voicesClear(); this.initVoices() }
    })
  },
  
/**###Gibberish.interpolate : method
Similiar to makePanner, this method returns a function that can be used to linearly interpolate between to values. The resulting function takes an array and a floating point position index and returns a value.
**/   
	interpolate : function(arr, phase){
		var	index	  = phase | 0, // round down
        index2  = index + 1 > arr.length - 1 ? 0 : index + 1;
				frac	  = phase - index;
    				
    return arr[index] + frac * (arr[index2] - arr[index]);
	},
  
  pushUnique : function(item, array) {
		var obj = item;
		var shouldAdd = true;
    
		for(var j = 0; j < array.length; j++) {
			if(obj === array[j]) {
				shouldAdd = false;
				break;
			}
		}
    
		if(shouldAdd) {
			array.push(obj);
		}
  },
  
  export : function(key, obj) {
    for(var _key in Gibberish[key]) {
      //console.log("exporting", _key, "from", key);
      obj[_key] = Gibberish[key][_key];
    }
  },

/**###Gibberish.ugen : method
Creates a prototype object that is used by all ugens.
**/    
  ugen : function() {
    Gibberish.extend(this, {
  
/**#Ugen - Miscellaneous
The prototype object that all ugens inherit from
**/
/**###Ugen.processProperties : method
Used to assign and process arguments passed to the constructor functions of ugens.  
  
param **argumentList** : Array. A list of arguments (may be a single dictionary) passed to a ugen constructor.
**/     

      processProperties : function(args){
        if(typeof arguments[0][0] === 'object' && typeof arguments[0][0].type === 'undefined' && !Array.isArray(arguments[0][0]) && arguments[0][0].name !== 'op') {
          var dict = arguments[0][0];
          for(var key in dict) {
            if(typeof dict[key] !== 'undefined') {
              if(typeof this.properties[key] === 'object' && typeof this.properties[key].binops !== 'undefined') {
                this.properties[key].value = dict[key];
              }else{
                this[key] = dict[key];
              } 
            }
          }
        }else{
          var i = 0;
          for(var key in this.properties) {
            if(typeof this.properties[key] === 'object' && typeof this.properties[key].binops !== 'undefined') {
              if(typeof arguments[0][i] !== 'undefined'){
                this.properties[key].value = arguments[0][i++];
              }
            }else{
              if(typeof arguments[0][i] !== 'undefined') {
                this.properties[key] = arguments[0][i++];
              }
            }
          }
        }
        return this;
      },
      
      valueOf: function() {
        this.codegen()
        //console.log( "VALUEOF", this.variable )
        return this.variable
      },
/**###Ugen.codegen : method
Generates output code (as a string) used inside audio callback
**/   
      codegen : function() {
        var s = '', 
            v = null,
            initialized = false;
        
        if(Gibberish.memo[this.symbol]) {
          //console.log("MEMO" + this.symbol);
          return Gibberish.memo[this.symbol];
        }else{
          // we generate the symbol and use it to create our codeblock, but only if the ugen doesn't already have a variable assigned. 
          // since the memo is cleared every time the callback is created, we need to check to see if this exists. 
          v = this.variable ? this.variable : Gibberish.generateSymbol('v');
          Gibberish.memo[this.symbol] = v;
          this.variable = v;
        }

        s += 'var ' + v + " = " + this.symbol + "(";

        for(var key in this.properties) {
          var property = this.properties[key];
          var value = '';
          //if(this.name === "single_sample_delay") { console.log( "SSD PROP" + key ); }
          if( Array.isArray( property.value ) ) {
            if(property.value.length === 0) value = 0;  // primarily for busses
            
            for(var i = 0; i < property.value.length; i++) {
              var member = property.value[i];
              if( typeof member === 'object' ) {
            		value += member !== null ? member.valueOf() : 'null';
              }else{
                if(typeof property.value === 'function') {
                  value += property.value();
                }else{
                  value += property.value;
                }
              }
              value += i < property.value.length - 1 ? ', ' : '';
            }
            
          }else if( typeof property.value === 'object' ) {
            if( property.value !== null) {
              value = property.value.codegen ? property.value.valueOf() : property.value
            }
          }else if( property.name !== 'undefined'){
            if(typeof property.value === 'function') {
              value = property.value();
            }else{
              value = property.value;
            }
          }
          

          if(property.binops.length != 0) {
            for( var k = 0; k < property.binops.length; k++) {
              s += '(' // all leading parenthesis...
            }
            for(var j = 0; j < property.binops.length; j++) {
              var op = property.binops[j],
                  val;
                  
              if( typeof op.ugen === 'number') {
                  val = op.ugen;
              }else{
                  val = op.ugen !== null ? op.ugen.valueOf() : 'null';
              }
              
              if(op.binop === "=") {
                s = s.replace(value, "");
                s += val;
              }else if(op.binop === "++"){
                s += ' + Math.abs(' + val + ')';
              }else{
                if( j === 0) s+= value
                s += " " + op.binop + " " + val + ")";
              }
              
            }
          }else{
            s += value
          }

          s += ", ";
        }
        
        if(s.charAt(s.length - 1) === " ")
          s = s.slice(0, -2); // remove trailing spaces
      
        s += ");\n";
        
        this.codeblock = s;
        
        if( Gibberish.codeblock.indexOf( this.codeblock ) === -1 ) Gibberish.codeblock.push( this.codeblock )
        if( Gibberish.callbackArgs.indexOf( this.symbol ) === -1 && this.name !== 'op') { Gibberish.callbackArgs.push( this.symbol ) }
        if( Gibberish.callbackObjects.indexOf( this.callback ) === -1 && this.name !== 'op' ) { Gibberish.callbackObjects.push( this.callback ) }
        
        this.dirty = false;        
        
        return v;
      },

/**###Ugen.defineUgenProperty : method
Creates getters and setters for ugen properties that automatically dirty the ugen whenever the property value is changed.  
  
param **key** : String. The name of a property to add getter / setters for.  
param **value** : Any. The initival value to set the property to
**/       
      
/**###Ugen.init : method
Initialize ugen by calling defineUgenProperty for every key in the ugen's properties dictionary, generating a unique id for the ugen and various other small tasks.
**/             
      init : function() {
        if(!this.initalized) {
          this.symbol = Gibberish.generateSymbol(this.name);
          this.codeblock = null;
          this.variable = null;
        }
        
        if(typeof this.properties === 'undefined') {
          this.properties = {};
        }
        
        if(!this.initialized) {
          this.destinations = [];
          for(var key in this.properties) {
            Gibberish.defineUgenProperty(key, this.properties[key], this);
          }
        }
        
        if(arguments.length > 0 && typeof arguments[0][0] === 'object' && arguments[0][0].type === 'undefined') {
          var options = arguments[0][0];
          for(var key in options) {
            this[key] = options[key];
          }
        }
                        
        this.initialized = true;
        
        return this;
      },
/**###Ugen.mod : method
Modulate a property of a ugen on a per-sample basis.  
  
param **key** : String. The name of the property to modulate  
param **value** : Any. The object or number value to modulate the property with  
param **op** : String. Default "+". The operation to perform. Can be +,-,*,/,= or ++. ++ adds and returns the absolute value.
**/            
      mod : function(name, value, op) {
        var property = this.properties[ name ];
        var mod = { ugen:value, binop:op };
       	property.binops.push( mod );
        
        Gibberish.dirty( this );
      },
/**###Ugen.removeMod : method
Remove a modulation from a ugen.  
  
param **key** : String. The name of the property to remove the modulation from  
param **arg** : Number or Object. Optional. This determines which modulation to remove if more than one are assigned to the property. If this argument is undefined, all modulations are removed. If the argument is a number, the number represents a modulation in the order that they were applied (an array index). If the argument is an object, it removes a modulation that
is using a matching object as the modulator.
**/                  
      removeMod : function(name, arg) {
        if(typeof arg === 'undefined' ) {
          this.properties[name].binops.length = 0;
        }else if(typeof arg === 'number') {
          this.properties[name].binops.splice(arg, 1);
        }else if(typeof arg === 'object') {
          for(var i = 0, j = this.properties[name].binops.length; i < j; i++) {
            if(this.properties[name].binops[i].ugen === arg) {
              this.properties[name].binops.splice(i, 1);
            }
          }
        };
        
        Gibberish.dirty( this );
      },

/**###Ugen.polyMod : method
Applies a modulation to all children of a polyphonic ugen  
  
param **key** : String. The name of the property to modulate  
param **value** : Any. The object or number value to modulate the property with  
param **op** : String. Default "+". The operation to perform. Can be +,-,*,/,= or ++. ++ adds and returns the absolute value.
**/       
  		polyMod : function(name, modulator, type) {
  			for(var i = 0; i < this.children.length; i++) {
  				this.children[i].mod(name, modulator, type);
  			}
  			Gibberish.dirty(this);
  		},

/**###Ugen.removePolyMod : method
Removes a modulation from all children of a polyphonic ugen. The arguments  
  
param **arg** : Number or Object. Optional. This determines which modulation to remove if more than one are assigned to the property. If this argument is undefined, all modulations are removed. If the argument is a number, the number represents a modulation in the order that they were applied (an array index). If the argument is an object, it removes a modulation that
is using a matching object as the modulator.
**/       
  		removePolyMod : function() {
  			var args = Array.prototype.slice.call(arguments, 0);
        
  			if(arguments[0] !== "amp" && arguments[0] !== "pan") {
  				for(var i = 0; i < this.children.length; i++) {
  					this.children[i].removeMod.apply(this.children[i], args);
  				}
  			}else{
  				this.removeMod.apply(this, args);
  			}
        
  			Gibberish.dirty(this);
  		},
      
      smooth : function(property, amount) {
        var op = new Gibberish.OnePole();
        this.mod(property, op, "=");
      },
/**###Ugen.connect : method
Connect the output of a ugen to a bus.  
  
param **bus** : Bus ugen. Optional. The bus to connect the ugen to. If no argument is passed the ugen is connect to Gibberish.out. Gibberish.out is automatically created when Gibberish.init() is called and can be thought of as the master stereo output for Gibberish.
**/      
      connect : function(bus, position) {
        if(typeof bus === 'undefined') bus = Gibberish.out;
        
        if(this.destinations.indexOf(bus) === -1 ){
          bus.addConnection( this, 1, position );
          this.destinations.push( bus );
        }
        return this;
      },
/**###Ugen.send : method
Send an arbitrary amount of output to a bus  
  
param **bus** : Bus ugen. The bus to send the ugen to.  
param **amount** : Float. The amount of signal to send to the bus. 
**/      
      send : function(bus, amount) {
        if(this.destinations.indexOf(bus) === -1 ){
          bus.addConnection( this, amount );
          this.destinations.push( bus );
        }else{
          bus.adjustSendAmount(this, amount);
        }
        return this;
      },
/**###Ugen.disconnect : method
Disconnect a ugen from a bus (or all busses). This stops all audio and signal processing for the ugen.  
  
param **bus** : Bus ugen. Optional. The bus to disconnect the ugen from. If this argument is undefined the ugen will be disconnected from all busses.
**/      
      disconnect : function(bus, tempDisconnect ) { // tempDisconnect is used to do a short disconnect and reconnect
        var idx
        
        if( !tempDisconnect ) {
          /*if( this.children ) {
            for(var i = 0; i < this.children.length; i++) {
              this.children[i].disconnect( this )
            }
          }else if( typeof this.input === 'object' ) {
            this.input.disconnect( null, tempDisconnect )
          }*/
          
          /*var idx = Gibberish.callbackArgs.indexOf( this.symbol )
          Gibberish.callbackArgs.splice(idx, 1)
        
          idx = Gibberish.callbackObjects.indexOf( this.callback )        
          Gibberish.callbackObjects.splice(idx, 1)*/
        }
        
        if( !bus ) {
          for(var i = 0; i < this.destinations.length; i++) {
            this.destinations[i].removeConnection( this );
          }
          this.destinations = [];
        }else{
          idx = this.destinations.indexOf(bus);
          if(idx > -1) {
            this.destinations.splice(idx, 1);
          }
          bus.removeConnection( this );
        }
        
        Gibberish.dirty( this )
        return this;
      },
    });
  },
};


Array2 = function() { 
  this.length = 0;
};

Array2.prototype = [];
	
Array2.prototype.remove = function(arg, searchDeep) { // searchDeep when true removes -all- matches, when false returns first one found.
	searchDeep = typeof searchDeep === 'undefined' ? true : searchDeep;
	if(typeof arg === "undefined") { // clear all
		for(var i = 0; i < this.length; i++) {
			delete this[i];
		}
		this.length = 0;
	}else if(typeof arg === "number") {
		this.splice(arg,1);
	}else if(typeof arg === "string"){ // find named member and remove
		var removeMe = [];
		for(var i = 0; i < this.length; i++) {
			var member = this[i];
			if(member.type === arg || member.name === arg) {
				if(!searchDeep) {
					this.splice(i,1);
					return;
				}else{
					removeMe.push(i);
				}
			}
		}
		for(var i = 0; i < removeMe.length; i++) {
			this.splice( removeMe[i], 1);
		}
	}else if(typeof arg === "object") {
		var idx = this.indexOf(arg);
		while(idx > -1) {
			this.splice(idx,1);
			idx = this.indexOf(arg);
		}
	}
	if(this.parent) Gibberish.dirty(this.parent);
};
	
Array2.prototype.get = function(arg) {
	if(typeof arg === "number") {
		return this[arg];
	}else if(typeof arg === "string"){ // find named member and remove
		for(var i = 0; i < this.length; i++) {
			var member = this[i];

			if(member.name === arg) {
				return member;
			}
		}
	}else if(typeof arg === "object") {
		var idx = this.indexOf(arg);
		if(idx > -1) {
			return this[idx];
		}
	}
	return null;
};
	

Array2.prototype.replace = function(oldObj, newObj) {
	newObj.parent = this;
  newObj.input = oldObj.input;
  
	if(typeof oldObj != "number") {
		var idx = this.indexOf(oldObj);
		if(idx > -1) {
			this.splice(idx, 1, newObj);
		}
	}else{
		this.splice(oldObj, 1, newObj);
	}
	if(this.parent) Gibberish.dirty(this.parent);
};

Array2.prototype.insert = function(v, pos) {
	v.parent = this;
  this.input = this.parent;
  
	if(Array.isArray(v)) {
		for(var i = 0; i < v.length; i++) {
			this.splice(pos + i, 0, v[i]);
		}
	}else{
		this.splice(pos,0,v);
	}
	if(this.parent) Gibberish.dirty(this.parent);
};

Array2.prototype.add = function() {
	for(var i = 0; i < arguments.length; i++) {
		arguments[i].parent = this;
    arguments[i].input = this.parent;
		//console.log(this.parent, this.parent.channels);
		//if(typeof this.parent.channels === "number") {
			//console.log("CHANGING CHANNELS");
			//arguments[i].channels = this.parent.channels;
    //}
		this.push(arguments[i]);
	}
	//console.log("ADDING ::: this.parent = ", this.parent)
	if(this.parent) {  
    console.log("DIRTYING");
  	Gibberish.dirty(this.parent);
  }
		
};
	
var rnd = Math.random;
Gibberish.rndf = function(min, max, number, canRepeat) {
  canRepeat = typeof canRepeat === "undefined" ? true : canRepeat;
	if(typeof number === "undefined" && typeof min != "object") {
		if(arguments.length == 1) {
			max = arguments[0]; min = 0;
		}else if(arguments.length == 2) {
			min = arguments[0];
			max = arguments[1];
		}else{
			min = 0;
			max = 1;
		}

		var diff = max - min,
		    r = Math.random(),
		    rr = diff * r
	
		return min + rr;
	}else{
		var output = [];
		var tmp = [];
		if(typeof number === "undefined") {
			number = max || min.length;
		}
		
		for(var i = 0; i < number; i++) {
			var num;
			if(typeof arguments[0] === "object") {
				num = arguments[0][rndi(0, arguments[0].length - 1)];
			}else{
				if(canRepeat) {
					num = Gibberish.rndf(min, max);
				}else{
          num = Gibberish.rndf(min, max);
          while(tmp.indexOf(num) > -1) {
            num = Gibberish.rndf(min, max);
          }
					tmp.push(num);
				}
			}
			output.push(num);
		}
		return output;
	}
};
  
Gibberish.Rndf = function() {
  var _min, _max, quantity, random = Math.random, canRepeat;
    
  if(arguments.length === 0) {
    _min = 0; _max = 1;
  }else if(arguments.length === 1) {
    _max = arguments[0]; _min = 0;
  }else if(arguments.length === 2) {
    _min = arguments[0]; _max = arguments[1];
  }else if(arguments.length === 3) {
    _min = arguments[0]; _max = arguments[1]; quantity = arguments[2];
  }else{
    _min = arguments[0]; _max = arguments[1]; quantity = arguments[2]; canRepeat = arguments[3];
  }    
  
  return function() {
    var value, min, max, range;
    
    min = typeof _min === 'function' ? _min() : _min
    max = typeof _max === 'function' ? _max() : _max
      
    if( typeof quantity === 'undefined') {
      value = Gibberish.rndf( min, max )
    }else{
      value = Gibberish.rndf( min, max, quantity, canRepeat )
    }
    
    return value;
  }
};

Gibberish.rndi = function( min, max, number, canRepeat ) {
  var range;
    
  if(arguments.length === 0) {
    min = 0; max = 1;
  }else if(arguments.length === 1) {
    max = arguments[0]; min = 0;
  }else if( arguments.length === 2 ){
    min = arguments[0]; max = arguments[1];
  }else{
    min = arguments[0]; max = arguments[1]; number = arguments[2]; canRepeat = arguments[3];
  }    
  
  range = max - min
  if( range < number ) canRepeat = true
  
  if( typeof number === 'undefined' ) {
    range = max - min
    return Math.round( min + Math.random() * range );
  }else{
		var output = [];
		var tmp = [];
		
		for(var i = 0; i < number; i++) {
			var num;
			if(canRepeat) {
				num = Gibberish.rndi(min, max);
			}else{
				num = Gibberish.rndi(min, max);
				while(tmp.indexOf(num) > -1) {
					num = Gibberish.rndi(min, max);
				}
				tmp.push(num);
			}
			output.push(num);
		}
		return output;
  }
};

Gibberish.Rndi = function() {
  var _min, _max, quantity, random = Math.random, round = Math.round, canRepeat, range;
    
  if(arguments.length === 0) {
    _min = 0; _max = 1;
  }else if(arguments.length === 1) {
    _max = arguments[0]; _min = 0;
  }else if(arguments.length === 2) {
    _min = arguments[0]; _max = arguments[1];
  }else if(arguments.length === 3) {
    _min = arguments[0]; _max = arguments[1]; quantity = arguments[2];
  }else{
    _min = arguments[0]; _max = arguments[1]; quantity = arguments[2]; canRepeat = arguments[3];
  }  
  
  range = _max - _min
  if( typeof quantity === 'number' && range < quantity ) canRepeat = true
  
  return function() {
    var value, min, max, range;
    
    min = typeof _min === 'function' ? _min() : _min
    max = typeof _max === 'function' ? _max() : _max
    
    if( typeof quantity === 'undefined') {
      value = Gibberish.rndi( min, max )
    }else{
      value = Gibberish.rndi( min, max, quantity, canRepeat )
    }
    
    return value;
  }
};

Gibberish.extend = function(destination, source) {
    for (var property in source) {
			var keys = property.split(".");
			if(source[property] instanceof Array && source[property].length < 100) { // don't copy large array buffers
		    destination[property] = source[property].slice(0);
				if(property === "fx") {
					destination[property].parent = source[property].parent;
				}
      }else if (typeof source[property] === "object" && source[property] !== null && !(source[property] instanceof Float32Array) ) {
          destination[property] = destination[property] || {};
          arguments.callee(destination[property], source[property]);
      } else {
          destination[property] = source[property];
      }
    }
    return destination;
};
	
Function.prototype.clone=function(){
    return eval('['+this.toString()+']')[0];
};

String.prototype.format = function(i, safe, arg) {
    function format() {
        var str = this,
            len = arguments.length + 1;

        for (i = 0; i < len; arg = arguments[i++]) {
            safe = arg; //typeof arg === 'object' ? JSON.stringify(arg) : arg;
            str = str.replace(RegExp('\\{' + (i - 1) + '\\}', 'g'), safe);
        }
        return str;
    }

    format.native = String.prototype.format;

    return format;
}();

Gibberish.future = function(func, time) { 
  var seq = new Gibberish.Sequencer({
    values:[
      function(){},
      function() {
        func();
        seq.stop();
        seq.disconnect();
      }
    ],
    durations:[ time ]
  }).start()
  
  seq.cancel = function() {
    seq.stop();
    seq.disconnect();
  }
  
  return seq
}
Gibberish.Proxy = function() {
  var value = 0;
      
	Gibberish.extend(this, {
  	name: 'proxy',
    type: 'effect',
    
    properties : {},
    
    callback : function() {
      return value;
    },
  }).init();
  
  this.input = arguments[0];
  
  value = this.input.parent[ this.input.name ];
  delete this.input.parent[ this.input.name ];
    
  this.input.parent.properties[ this.input.name ].value = this;
  
  Object.defineProperty( this.input.parent, this.input.name, {
    get : function(){ return value; },
    set : function(_value) { value = _value; }
  });
  Gibberish.dirty(this.input.parent);
};
Gibberish.Proxy.prototype = new Gibberish.ugen();

Gibberish.Proxy2 = function() {
  var input = arguments[0],
      name = arguments[1],
      phase = 0
      
	Gibberish.extend( this, {
  	name: 'proxy2',
    type: 'effect',
    
    properties : { },
    
    callback : function() {
      var v = input[ name ]
      // if( phase++ % 44100 === 0 ) console.log( v, input, name)
      return Array.isArray( v ) ? ( v[0] + v[1] + v[2] ) / 3 : v
    },
  }).init();
  
  this.getInput = function() { return input }
  this.setInput = function( v ) { input = v }
  this.getName = function() { return name }
  this.setName = function( v ) { name = v }
};
Gibberish.Proxy2.prototype = new Gibberish.ugen();

Gibberish.Proxy3 = function() {
  var input = arguments[0],
      name = arguments[1],
      phase = 0
      
	Gibberish.extend( this, {
  	name: 'proxy3',
    type: 'effect',
    
    properties : { },
    
    callback : function() {
      var v = input[ name ]
      //if( phase++ % 44100 === 0 ) console.log( v, input, name)
      return v || 0
    },
  })
  
  this.init();
  
  this.codegen = function() {
    // if(Gibberish.memo[this.symbol]) {
    //   return Gibberish.memo[this.symbol];
    // }
    
    console.log(" CALLED ")
    if( ! this.variable ) this.variable = Gibberish.generateSymbol('v');
    Gibberish.callbackArgs.push( this.symbol )
    Gibberish.callbackObjects.push( this.callback )

    this.codeblock = "var " + this.variable + " = " + this.symbol + "(" + input.properties[ name ].codegen() + ");\n"
  }
  
};
Gibberish.Proxy3.prototype = new Gibberish.ugen();
Gibberish.oscillator = function() {
  this.type = 'oscillator';
  
  this.oscillatorInit = function() {
    this.fx = new Array2; 
    this.fx.parent = this;
    
    return this;
  }
};
Gibberish.oscillator.prototype = new Gibberish.ugen();
Gibberish._oscillator = new Gibberish.oscillator();

/**#Gibberish.Table - Oscillator
An wavetable oscillator.

## Example Usage##
`// fill the wavetable with random samples
Gibberish.init();  
a = new Gibberish.Table();  
var t = []  
for( var i = 0; i < 1024; i++ ) { t[ i ] = Gibberish.rndf(-1,1) }  
a.setTable( t )  
a.connect()  
`
- - - -
**/
/**###Gibberish.Table.frequency : property  
Number. From 20 - 20000 hz.
**/
/**###Gibberish.Table.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/

Gibberish.Wavetable = function() {
  var phase = 0,
      table = null,
      tableFreq = Gibberish.context.sampleRate / 1024,
      signHistory = 0,
      flip = 0;
  
  this.properties = {
    frequency : 440,
    amp : .25,
    sync: 0
  };
  
/**###Gibberish.Wavetable.setTable : method  
Assign an array representing one cycle of a waveform to use.  

param **table** Float32Array. Assign an array to be used as the wavetable.
**/     
  this.getTable = function() { return table; }
  this.setTable = function(_table) { table = _table; tableFreq = Gibberish.context.sampleRate / table.length }
  
  this.getTableFreq = function() { return tableFreq }
  this.setTableFreq = function( v ) { tableFreq = v;  }  
  
  this.getPhase = function()  { return phase }
  this.setPhase = function(v) { phase = v }

/**###Gibberish.Wavetable.callback : method  
Returns a single sample of output.  

param **frequency** Number. The frequency to be used to calculate output.  
param **amp** Number. The amplitude to be used to calculate output.  
**/   
  this.callback = function(frequency, amp, sync) { 
    var index, frac, index2, val1, val2, sign;
            
    phase += frequency / tableFreq;
    while(phase >= 1024) phase -= 1024;  
    
    index   = phase | 0;
    frac    = phase - index;
    index   = index & 1023;
    index2  = index === 1023 ? 0 : index + 1;
    val1    = table[index];
    val2    = table[index2];
    
    // sign = typeof sync == 'number' ? sync ? sync < 0 ? -1 : 1 : isNaN(sync) ? NaN : 0 : NaN;
    // if( sign !== signHistory && sign !== 0) {
    //   flip++
    //   
    //   if( flip === 2 ){
    //     phase = 0
    //     flip = 0
    //   }
    //   //console.log( "FLIP", sign, signHistory, count, sync )
    // }
    if( sign !== 0 ) signHistory = sign
    
    return ( val1 + ( frac * (val2 - val1) ) ) * amp;
  }
}
Gibberish.Wavetable.prototype = Gibberish._oscillator;

Gibberish.Table = function( table ) {
  this.__proto__ = new Gibberish.Wavetable();
  
  this.name = 'table';
  
  var pi_2 = Math.PI * 2
  
  if( typeof table === 'undefined' ) { 
    table = new Float32Array(1024);
    for(var i = 1024; i--;) { table[i] = Math.sin( (i / 1024) * pi_2); }
  }
  
  this.setTable( table );

  this.init();
  this.oscillatorInit();
  //this.processProperties( arguments );
}

Gibberish.asmSine = function (stdlib, foreign, heap) {
    "use asm";

    var sin = stdlib.Math.sin;
    var phase = 0.0;
    var out = new stdlib.Float32Array(heap);
    var floor = stdlib.Math.floor;
    var tableFreq = 0.0;
    
    function init() {
      var i = 1024;
      var j = 1024.0;
      var test = 0.0;
      for (;  i = (i - 1) | 0; ) {
        j = j - 1.0;
        out[i >> 2] = +(sin( +(j / 1024.0) * 6.2848));
      }  
      tableFreq = 44100.0 / 1024.0;
    }
    
    function gen(freq, amp, sr) {
      freq = +freq;
      amp = +amp;
      sr = +sr;
      
      var index = 0.0,
          index1 = 0,
          index2 = 0,
          frac = 0.0,
          val1 = 0.0,
          val2 = 0.0;
      
      phase = +(phase + freq / tableFreq);
      if(phase >= 1024.0) phase = +(phase - 1024.0);
          
      index = +floor(phase);
      frac = phase - index;
      
      index1 = (~~index);
      if((index1 | 0) == (1024 | 0)) {
        index2 = 0
      } else { 
        index2 = (index1 + 1) | 0;
      }
      
      val1 = +out[ index1 >> 2 ];
      val2 = +out[ index2 >> 2 ];
          
      return +((val1 + (frac * (val2 - val1))) * amp);
    }
    
    function get(idx) {
      idx = idx|0;
      return +out[idx >> 2];
    }

    return {
      init:init,
      gen: gen,
      get: get,
    }
};

/*
    phase += frequency / tableFreq;
    while(phase >= 1024) phase -= 1024;  
    
    index   = phase | 0;
    frac    = phase - index;
    index   = index & 1023;
    index2  = index === 1023 ? 0 : index + 1;
    val1    = table[index];
    val2    = table[index2];
        
    return ( val1 + ( frac * (val2 - val1) ) ) * amp;
*/





/*function gen (freq, amp, sr) {
    freq = +freq;
    amp  = +amp;
    sr = +sr;
    
    phase = +(phase + +(+(freq / sr) * 3.14159 * 2.0));
    
    return +(+sin(phase) * amp);
}*/
//var pi_2 = (3.14159 * 2.0);


Gibberish.asmSine2 = function () {    
    this.properties = { frequency:440.0, amp:.5, sr: Gibberish.context.sampleRate }
    this.name = 'sine'
    var buf = new ArrayBuffer(4096);
    var asm = Gibberish.asmSine(window, null, buf);
    asm.init();
    
    this.getTable = function() { return buf; }
    this.get = asm.get;
    this.callback = asm.gen;
    this.init();
    this.oscillatorInit();
    this.processProperties( arguments );
    
    return  this;
}
Gibberish.asmSine2.prototype = Gibberish._oscillator;
/**#Gibberish.Sine - Oscillator
A sinewave calculated on a per-sample basis.

## Example Usage##
`// make a sine wave  
Gibberish.init();  
a = new Gibberish.Sine().connect();`
- - - -
**/
/**###Gibberish.Sine.frequency : property  
Number. From 20 - 20000 hz.
**/
/**###Gibberish.Sine.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/

Gibberish.Sine = function() {
  this.__proto__ = new Gibberish.Wavetable();
  
  this.name = 'sine';
  
  var pi_2 = Math.PI * 2, 
      table = new Float32Array(1024);
      
  for(var i = 1024; i--;) { table[i] = Math.sin( (i / 1024) * pi_2); }
  
  this.setTable( table );

  this.init( arguments );
  this.oscillatorInit();
  this.processProperties( arguments );
};

/**#Gibberish.Sine2 - Oscillator
A sinewave calculated on a per-sample basis that can be panned.

## Example Usage##
`// make a sine wave  
Gibberish.init();  
a = new Gibberish.Sine2(880, .5, -.25).connect();`
- - - -
**/
/**###Gibberish.Sine2.frequency : property  
Number. From 20 - 20000 hz.
**/
/**###Gibberish.Sine2.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/
/**###Gibberish.Sine2.pan : property  
Number. -1..1. The position of the sinewave in the stereo spectrum
**/
Gibberish.Sine2 = function() {
  this.__proto__ = new Gibberish.Sine();
  this.name = "sine2";
    
  var sine = this.__proto__.callback,
      panner = Gibberish.makePanner(),
      output = [0,0];

/**###Gibberish.Sine2.callback : method  
Returns a stereo sample of output as an array.  
  
param **frequency** Number. The frequency to be used to calculate output.  
param **amp** Number. The amplitude to be used to calculate output.  
param **pan** Number. The position in the stereo spectrum of the signal.
**/  
  this.callback = function(frequency, amp, pan) {
    var out = sine(frequency, amp);
    output = panner(out, pan, output);
    return output;
  }

  this.init();
  this.oscillatorInit();
  Gibberish.defineUgenProperty('pan', 0, this);
  this.processProperties(arguments);  
};

Gibberish.Square = function() {
  this.__proto__ = new Gibberish.Wavetable();
  
  this.name = 'square';
  
  var pi_2 = Math.PI * 2, 
      table = new Float32Array(1024);
      
  for(var i = 1024; i--;) { 
    table[i] = i / 1024 > .5 ? 1 : -1;
  }
  
  this.setTable( table );

  this.init( arguments );
  this.oscillatorInit();
  this.processProperties( arguments );
};

/**#Gibberish.Saw - Oscillator
A non-bandlimited saw wave calculated on a per-sample basis.

## Example Usage##
`// make a saw wave  
Gibberish.init();  
a = new Gibberish.Saw(330, .4).connect();`
- - - -
**/
/**###Gibberish.Saw.frequency : property  
Number. From 20 - 20000 hz.
**/
/**###Gibberish.Saw.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/
Gibberish.Saw = function() {
  this.__proto__ = new Gibberish.Wavetable();
  
  this.name = 'saw';
  
  var table = new Float32Array(1024);
      
  for(var i = 1024; i--;) { table[i] = (((i / 1024) / 2 + 0.25) % 0.5 - 0.25) * 4; }
  
  this.setTable( table );

  this.init( arguments );
  this.oscillatorInit();
  this.processProperties( arguments );
};

/**#Gibberish.Saw2 - Oscillator
A stereo, non-bandlimited saw wave calculated on a per-sample basis.

## Example Usage##
`// make a saw wave  
Gibberish.init();  
a = new Gibberish.Saw2(330, .4).connect();`
- - - -
**/
/**###Gibberish.Saw.frequency : property  
Number. From 20 - 20000 hz.
**/
/**###Gibberish.Saw.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/
Gibberish.Saw2 = function() {
  this.__proto__ = new Gibberish.Saw();
  this.name = "saw2";
  
  var saw = this.__proto__.callback,
      panner = Gibberish.makePanner(),
      output = [0,0];

/**###Gibberish.Saw2.callback : method  
Returns a stereo sample of output as an array.  
  
param **frequency** Number. The frequency to be used to calculate output.  
param **amp** Number. The amplitude to be used to calculate output.  
param **pan** Number. The position in the stereo spectrum of the signal.
**/    
  this.callback = function(frequency, amp, pan) {
    var out = saw(frequency, amp);
    output = panner(out, pan, output);
    return output;
  };

  this.init();
  Gibberish.defineUgenProperty('pan', 0, this);
  
};

/**#Gibberish.Triangle - Oscillator
A triangle calculated on a per-sample basis.

## Example Usage##
`// make a triangle wave  
Gibberish.init();  
a = new Gibberish.Triangle({frequency:570, amp:.35}).connect();`
- - - -
**/
/**###Gibberish.Triangle.frequency : property  
Number. From 20 - 20000 hz.
**/
/**###Gibberish.Triangle.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/

Gibberish.Triangle = function() {
  this.__proto__ = new Gibberish.Wavetable();
  
  this.name = 'triangle';
  
  var table = new Float32Array(1024),
      abs = Math.abs;
      
  for(var i = 1024; i--;) { table[i] = 1 - 4 * abs(( (i / 1024) + 0.25) % 1 - 0.5); }
  
  this.setTable( table );

  this.init( arguments );
  this.oscillatorInit();
  this.processProperties( arguments );
};

/**#Gibberish.Triangle2 - Oscillator
A triangle calculated on a per-sample basis that can be panned.

## Example Usage##
`Gibberish.init();  
a = new Gibberish.Triangle2(880, .5, -.25).connect();`
- - - -
**/
/**###Gibberish.Triangle2.frequency : property  
Number. From 20 - 20000 hz.
**/
/**###Gibberish.Triangle2.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/
/**###Gibberish.Triangle2.pan : property  
Number. -1..1. The position of the triangle wave in the stereo spectrum
**/
 
Gibberish.Triangle2 = function() {
  this.__proto__ = new Gibberish.Triangle();
  this.name = "triangle2";
    
  var triangle = this.__proto__.callback,
      panner = Gibberish.makePanner(),
      output = [0,0];

/**###Gibberish.Triangle2.callback : method  
Returns a stereo sample of output as an array.  
  
param **frequency** Number. The frequency to be used to calculate output.  
param **amp** Number. The amplitude to be used to calculate output.  
param **pan** Number. The position in the stereo spectrum of the signal.
**/    
  this.callback = function(frequency, amp, pan) {
    var out = triangle(frequency, amp);
    return panner(out, pan, output);
  };

  this.init();
  this.oscillatorInit();
  Gibberish.defineUgenProperty('pan', 0, this);
  this.processProperties(arguments);
};

/**#Gibberish.Saw3 - Oscillator
A bandlimited saw wave created using FM feedback, see http://scp.web.elte.hu/papers/synthesis1.pdf.  
  
## Example Usage##
`// make a saw wave  
Gibberish.init();  
a = new Gibberish.Saw3(330, .4).connect();`
- - - -
**/
/**###Gibberish.Saw3.frequency : property  
Number. From 20 - 20000 hz.
**/
/**###Gibberish.Saw3.amp : property  
Number. A linear value specifying relative ampltiude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/

Gibberish.Saw3 = function() {
  var osc = 0,
      phase = 0,
      a0 = 2.5,
      a1 = -1.5,
      history = 0,
      sin = Math.sin,
      scale = 11;
      pi_2 = Math.PI * 2,
      flip = 0,
      signHistory = 0,
      ignore = false,
      sr = Gibberish.context.sampleRate;
      
  Gibberish.extend(this, {
    name: 'saw',
    properties : {
      frequency: 440,
      amp: .15,
      sync:0,
      sr: Gibberish.context.sampleRate,
    },
/**###Gibberish.Saw3.callback : method  
Returns a single sample of output.  
  
param **frequency** Number. The frequency to be used to calculate output.  
param **amp** Number. The amplitude to be used to calculate output.  
**/    
    callback : function(frequency, amp, sync) {
      var w = frequency / sr,
          n = .5 - w,
          scaling = scale * n * n * n * n,
          DC = .376 - w * .752,
          norm = 1 - 2 * w,
          out = 0,
          sign;
          
      phase += w;
      phase -= phase > 1 ? 2 : 0;
      
      osc = (osc + sin(pi_2 * (phase + osc * scaling))) * .5;
      out = a0 * osc + a1 * history;
      history = osc;
      out += DC;
      out *= norm;

      // sign = typeof sync == 'number' ? sync ? sync < 0 ? -1 : 1 : isNaN(sync) ? NaN : 0 : NaN;
      // if( sign !== signHistory && sign !== 0) {
      //   flip++
      //   
      //   if( flip === 2 ){
      //     phase = 0
      //     flip = 0
      //   }
      //   //console.log( "FLIP", sign, signHistory, count, sync )
      // }
      // if( sign !== 0 ) signHistory = sign
      
      return out;
    }
  });
  
  /*
    .1 : 1 1
    0  : 0 1   // ignored
  -.1  : -1 1  // flip
  -.2  : -1 -1 
  */
  
  Object.defineProperty(this, 'scale', {
    get : function() { return scale; },
    set : function(val) { scale = val; }
  });
  
  this.init();
  this.oscillatorInit();
  this.processProperties(arguments);
}
Gibberish.Saw3.prototype = Gibberish._oscillator;

/**#Gibberish.PWM - Oscillator
A bandlimited pulsewidth modulation wave created using FM feedback, see http://scp.web.elte.hu/papers/synthesis1.pdf.
  
## Example Usage##
`// make a pwm wave  
Gibberish.init();  
a = new Gibberish.PWM(330, .4, .9).connect();`
- - - -
**/
/**###Gibberish.PWM.frequency : property  
Number. From 20 - 20000 hz.
**/
/**###Gibberish.PWM.amp : property  
Number. A linear value specifying relative ampltiude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/
/**###Gibberish.PWM.pulsewidth : property  
Number. 0..1. The width of the waveform's duty cycle.
**/
Gibberish.PWM = function() {
  var osc = 0,
      osc2= 0,
      _osc= 0,
      _osc2=0,
      phase = 0,
      a0 = 2.5,
      a1 = -1.5,
      history = 0,
      sin = Math.sin,
      scale = 11;
      pi_2 = Math.PI * 2,
      test = 0,
      sr = Gibberish.context.sampleRate;

  Gibberish.extend(this, {
    name: 'pwm',
    properties : {
      frequency: 440,
      amp: .15,
      pulsewidth: .05,
      sr: Gibberish.context.sampleRate,
    },
/**###Gibberish.PWM.callback : method  
Returns a single sample of output.  
  
param **frequency** Number. The frequency to be used to calculate output.  
param **amp** Number. The amplitude to be used to calculate output.  
param **pulsewidth** Number. The duty cycle of the waveform
**/    
    callback : function(frequency, amp, pulsewidth) {
      var w = frequency / sr,
          n = .5 - w,
          scaling = scale * n * n * n * n,
          DC = .376 - w * .752,
          norm = 1 - 2 * w,
          out = 0;
          
      phase += w;
      phase -= phase > 1 ? 2 : 0;
      
      osc = (osc  + sin( pi_2 * (phase + osc  * scaling ) ) ) * .5;
      osc2 =(osc2 + sin( pi_2 * (phase + osc2 * scaling + pulsewidth) ) ) * .5;
      out = osc2 - osc;
      
      out = a0 * out + a1 * (_osc - _osc2);
      _osc = osc;
      _osc2 = osc2;

      return out * norm * amp;
    },
  });
  
  Object.defineProperty(this, 'scale', {
    get : function() { return scale; },
    set : function(val) { scale = val; }
  });
  
  this.init();
  this.oscillatorInit();
  this.processProperties(arguments);  
};
Gibberish.PWM.prototype = Gibberish._oscillator;

/**#Gibberish.Noise - Oscillator
A white noise oscillator

## Example Usage##
`// make some noise
Gibberish.init();  
a = new Gibberish.Noise(.4).connect();`
- - - -
**/
/**###Gibberish.Noise.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/
Gibberish.Noise = function() {
  var rnd = Math.random;
  
  Gibberish.extend(this, {
    name:'noise',
    properties: {
      amp:1,
    },
    
    callback : function(amp){ 
      return (rnd() * 2 - 1) * amp;
    },
  });
  
  this.init();
  this.oscillatorInit();
  this.processProperties(arguments);  
};
Gibberish.Noise.prototype = Gibberish._oscillator;
// this file is dependent on oscillators.js

/**#Gibberish.KarplusStrong - Physical Model
A plucked-string model.  
  
## Example Usage##
`Gibberish.init();  
a = new Gibberish.KarplusStrong({ damping:.6 }).connect();  
a.note(440);
`
- - - -
**/
/**###Gibberish.KarplusStrong.blend : property  
Number. 0..1. The likelihood that the sign of any given sample will be flipped. A value of 1 means there is no chance, a value of 0 means each samples sign will be flipped. This introduces noise into the model which can be used for various effects.
**/
/**###Gibberish.KarplusStrong.damping : property  
Number. 0..1. Higher amounts of damping shorten the decay of the sound generated by each note.
**/
/**###Gibberish.KarplusStrong.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/
/**###Gibberish.KarplusStrong.channels : property  
Number. Default 2. If two channels, the signal may be panned.
**/
/**###Gibberish.KarplusStrong.pan : property  
Number. Default 0. The position in the stereo spectrum for the sound, from -1..1.
**/
Gibberish.KarplusStrong = function() {
  var phase   = 0,
      buffer  = [0],
      last    = 0,
      rnd     = Math.random,
      panner  = Gibberish.makePanner(),
      sr      = Gibberish.context.sampleRate,
      out     = [0,0];
      
  Gibberish.extend(this, {
    name:"karplus_strong",
    frequency : 0,
    properties: { blend:1, damping:0, amp:1, channels:2, pan:0  },
  
    note : function(frequency) {
      var _size = Math.floor(sr / frequency);
      buffer.length = 0;
    
      for(var i = 0; i < _size; i++) {
        buffer[i] = rnd() * 2 - 1; // white noise
      }
      
      this.frequency = frequency;
    },

    callback : function(blend, damping, amp, channels, pan) { 
      var val = buffer.shift();
      var rndValue = (rnd() > blend) ? -1 : 1;
				
  	  damping = damping > 0 ? damping : 0;
				
      var value = rndValue * (val + last) * (.5 - damping / 100);

      last = value;

      buffer.push(value);
				
      value *= amp;
      return channels === 1 ? value : panner(value, pan, out);
    },
  })
  .init()
  .oscillatorInit()
  .processProperties(arguments);
};
Gibberish.KarplusStrong.prototype = Gibberish._oscillator;

Gibberish.PolyKarplusStrong = function() {
  this.__proto__ = new Gibberish.Bus2();
  
  Gibberish.extend(this, {
    name:     "poly_karplus_strong",
    maxVoices:    5,
    voiceCount:   0,
    _frequency: 0,
    
    polyProperties : {
  		blend:			1,
      damping:    0,
    },

    note : function(_frequency, amp) {
      var synth = this.children[this.voiceCount++];
      if(this.voiceCount >= this.maxVoices) this.voiceCount = 0;
      synth.note(_frequency, amp);
      this._frequency = _frequency;
    },
    initVoices: function() {
      for(var i = 0; i < this.maxVoices; i++) {
        var props = {
          blend:   this.blend,
          damping: this.damping,
          channels: 2,
          amp:      1,
        };
        var synth = new Gibberish.KarplusStrong(props).connect(this);

        this.children.push(synth);
      }
    }
  });
  
  this.amp = 1 / this.maxVoices;
  this.children = [];
  
  if(typeof arguments[0] === 'object') {
    this.maxVoices = arguments[0].maxVoices ? arguments[0].maxVoices : this.maxVoices
  }
  
  Gibberish.polyInit(this);
  this.initVoices()
  
  this.processProperties(arguments);
  
  this.initialized = false
  Gibberish._synth.oscillatorInit.call(this);
  Gibberish.dirty( this )
};
/**#Gibberish.Bus - Miscellaneous
Create a mono routing bus. A bus callback routes all it's inputs and scales them by the amplitude of the bus.  
  
For a stereo routing bus, see [Bus2](javascript:displayDocs('Gibberish.Bus2'\))

##Example Usage##    
`a = new Gibberish.Bus();  
b = new Gibberish.Sine(440).connect(a);  
c = new Gibberish.Sine(880).connect(a);  
a.amp = .1;  
a.connect();`
  
## Constructor     
**param** *properties*: Object. A dictionary of property values (see below) to set for the bus on initialization.
**/
/**###Gibberish.Bus.amp : property  
Array. Read-only. Relative volume for the sum of all ugens connected to the bus.
**/
Gibberish.bus = function(){
  this.type = 'bus';
  
  this.inputCodegen = function() {
    //console.log( this, this.value, this.value.valueOf() )
    var val = this.value.valueOf();
    var str;
    
    /*if( this.value.name === 'Drums' ) {
      str = '[ ' + val + '[0] * ' + this.amp + ', ' + val + '[1] * ' + this.amp + ']'  // works!
    }else{
      str = this.amp === 1 ? val : val + ' * ' + this.amp;
    }*/
      
    str = val + ', ' + this.amp 
    this.codeblock = str;
    return str;
  };

  this.addConnection = function() {
    var position = arguments[2]
    var arg = { 
      value:	      arguments[0], 
      amp:		      arguments[1], 
      codegen:      this.inputCodegen,
      valueOf:      function() { return this.codegen() }
    };
    
    if( typeof position !== 'undefined' ) {
      this.inputs.splice( position,0,arg );
    }else{
      this.inputs.push( arg );
    }

    Gibberish.dirty( this );
  };
  
  this.removeConnection = function(ugen) {
    for(var i = 0; i < this.inputs.length; i++) {
      if(this.inputs[i].value === ugen) {
        this.inputs.splice(i,1);
        Gibberish.dirty(this);
        break;
      }
    }
  };
  
  this.adjustSendAmount = function(ugen, amp) {
    for(var i = 0; i < this.inputs.length; i++) {
      if(this.inputs[i].value === ugen) {
        this.inputs[i].amp = amp;
        Gibberish.dirty(this);
        break;
      }
    }
  };
  
  this.callback = function() {
    var amp = arguments[arguments.length - 2]; // use arguments to accommodate arbitray number of inputs without using array
    var pan = arguments[arguments.length - 1];
    
    output[0] = output[1] = 0;
    
    for(var i = 0; i < arguments.length - 2; i+=2) {
      var isObject = typeof arguments[i] === 'object',
          _amp = arguments[i + 1]
          
      output[0] += isObject ? arguments[i][0] * _amp :arguments[i] * _amp;
      output[1] += isObject ? arguments[i][1] * _amp: arguments[i] * _amp;
    }
    
    output[0] *= amp;
    output[1] *= amp;
    
    return panner(output, pan, output);
  };
};

Gibberish.bus.prototype = new Gibberish.ugen();
Gibberish._bus = new Gibberish.bus();

Gibberish.Bus = function() {
  Gibberish.extend(this, {
    name : 'bus',
        
    properties : {
      inputs :  [],
      amp :     1,
    },

    callback : function() {
      var out = 0;
      var length = arguments.length - 1;
      var amp = arguments[length]; // use arguments to accommodate arbitray number of inputs without using array
      
      for(var i = 0; i < length; i++) {
        out += arguments[i];
      }
      out *= amp;
      
      return out;
    },
  });

  this.init();
  this.processProperties(arguments);
  
  return this;
};
Gibberish.Bus.prototype = Gibberish._bus;

/**#Gibberish.Bus2 - Miscellaneous
Create a stereo outing bus. A bus callback routes all it's inputs and scales them by the amplitude of the bus.

##Example Usage##    
`a = new Gibberish.Bus2();  
b = new Gibberish.Sine(440).connect(a);  
c = new Gibberish.Sine(880).connect(a);  
  
d = new Gibberish.Sequencer({ target:a, key:'pan', values:[-.75,.75], durations:[ 22050 ] }).start();
a.connect();`
  
## Constructor     
**param** *properties*: Object. A dictionary of property values (see below) to set for the bus on initialization.
**/
/**###Gibberish.Bus.amp : property  
Array. Read-only. Relative volume for the sum of all ugens connected to the bus.
**/
Gibberish.Bus2 = function() {
  this.name = 'bus2';
  this.type = 'bus';
  
  this.properties = {
    inputs :  [],
    amp :     1,
    pan :     0,
  };
  
  var output = [0,0],
      panner = Gibberish.makePanner(),
      phase = 0;
  
  this.callback = function() {
    // use arguments to accommodate arbitray number of inputs without using array    
    var args = arguments,
        length = args.length,
        amp = args[length - 2], 
        pan = args[length - 1]
    
    output[0] = output[1] = 0;
    
    //if(phase++ % 44100 === 0) console.log(args)
    for(var i = 0, l = length - 2; i < l; i+= 2) {
      var isObject = typeof args[i] === 'object',
          _amp = args[i + 1]
          
      output[0] += isObject ? args[i][0] * _amp || 0 : args[i] * _amp || 0;
      output[1] += isObject ? args[i][1] * _amp || 0 : args[i] * _amp || 0;
    }
    
    output[0] *= amp;
    output[1] *= amp;
    
    return panner(output, pan, output);
  };
  
  this.show = function() { console.log(output, args) }
  this.getOutput = function() { return output }
  this.getArgs = function() { return args }
  
  //this.initialized = false;
  this.init( arguments );
  this.processProperties( arguments );
};
Gibberish.Bus2.prototype = Gibberish._bus;
Gibberish.envelope = function() {
    this.type = 'envelope';
};
Gibberish.envelope.prototype = new Gibberish.ugen();
Gibberish._envelope = new Gibberish.envelope();

Gibberish.ExponentialDecay = function(){
	var pow = Math.pow,
      value = 0,
      phase = 0;
      
  Gibberish.extend(this, {
  	name:"ExponentialDecay",
  	properties: { decay:.5, length:11050 },

  	callback: function( decay, length ) {
  		value = pow( decay, phase );
  		phase += 1 / length;

  		return value;
  	},
    
    trigger : function() {
      phase = typeof arguments[0] === 'number' ? arguments[0] : 0;
    },
  })
  .init()
};
Gibberish.ExponentialDecay.prototype = Gibberish._envelope;

Gibberish.Line = function(start, end, time, loops) {
	var that = { 
		name:		'line',

    properties : {
  		start:	start || 0,
  		end:		isNaN(end) ? 1 : end,
  		time:		time || Gibberish.context.sampleRate,
  		loops:	loops || false,
    },
    
    retrigger: function( end, time ) {
      phase = 0;
      this.start = out
      this.end = end
      this.time = time
      
      incr = (end - out) / time
    }
	};

	var phase = 0,
	    incr = (end - start) / time,
      out
  
	this.callback = function(start, end, time, loops) {
		out = phase < time ? start + ( phase++ * incr) : end;
				
		phase = (out >= end && loops) ? 0 : phase;
		
		return out;
	};
  
  Gibberish.extend(this, that);
  this.init();

  return this;
};
Gibberish.Line.prototype = Gibberish._envelope;

Gibberish.AD = function(_attack, _decay) {
  var phase = 0,
      state = 0;
      
  Gibberish.extend( this,{
    name : "AD",
  	properties : {
      attack :	_attack || 10000,
  	  decay  :	_decay  || 10000,
    },

  	run : function() {
  		state = 0;
      phase = 0;
  		return this;			
    },
  	callback : function(attack,decay) {
  		attack = attack < 0 ? 22050 : attack;
  		decay  = decay  < 0 ? 22050 : decay;				
  		if(state === 0){
  			var incr = 1 / attack;
  			phase += incr;
  			if(phase >=1) {
  				state++;
  			}
  		}else if(state === 1){
  			var incr = 1 / decay;
  			phase -= incr;
  			if(phase <= 0) {
  				phase = 0;
  				state++;;
  			}			
  		}
  		return phase;
    },
    getState : function() { return state; },
  })
  .init()
  .processProperties(arguments);
};
Gibberish.AD.prototype = Gibberish._envelope;

Gibberish.ADSR = function(attack, decay, sustain, release, attackLevel, sustainLevel, requireReleaseTrigger) {
	var that = { 
    name:   "adsr",
		type:		"envelope",
    'requireReleaseTrigger' : typeof requireReleaseTrigger !== 'undefined' ? requireReleaseTrigger : false,
    
    properties: {
  		attack:		isNaN(attack) ? 10000 : attack,
  		decay:		isNaN(decay) ? 10000 : decay,
  		sustain: 	isNaN(sustain) ? 22050 : sustain,
  		release:	isNaN(release) ? 10000 : release,
  		attackLevel:  attackLevel || 1,
  		sustainLevel: sustainLevel || .5,
      releaseTrigger: 0,
    },

		run: function() {
			this.setPhase(0);
			this.setState(0);
		},
    stop : function() {
      this.releaseTrigger = 1
    }
	};
	Gibberish.extend(this, that);
	
	var phase = 0,
	    state = 0,
      rt  = 0,
      obj = this;
      
  this.callback = function(attack,decay,sustain,release,attackLevel,sustainLevel,releaseTrigger) {
		var val = 0;
    rt = rt === 1 ? 1 : releaseTrigger;
		if(state === 0){
			val = phase / attack * attackLevel;
			if(++phase / attack === 1) {
				state++;
				phase = decay;
			}
		}else if(state === 1) {
			val = phase / decay * (attackLevel - sustainLevel) + sustainLevel;
			if(--phase <= 0) {
				if(sustain !== null){
					state += 1;
					phase = sustain;
				}else{
					state += 2;
					phase = release;
				}
			}
		}else if(state === 2) {
			val = sustainLevel;
      if( obj.requireReleaseTrigger && rt ){
        state++;
        phase = release;
        obj.releaseTrigger = 0;
        rt = 0;
      }else if(phase-- === 0 && !obj.requireReleaseTrigger) {
				state++;
				phase = release;
			}
		}else if(state === 3) {
      phase--;
			val = (phase / release) * sustainLevel;
			if(phase <= 0) {
        state++;
      }
		}
		return val;
	};
  this.call = function() {
    return this.callback( this.attack, this.decay, this.sustain, this.release, this.attackLevel, this.sustainLevel, this.releaseTrigger )
  };
	this.setPhase = function(newPhase) { phase = newPhase; };
	this.setState = function(newState) { state = newState; phase = 0; };
	this.getState = function() { return state; };		
	
  this.init();
  
	return this;
};
Gibberish.ADSR.prototype = Gibberish._envelope;

Gibberish.ADR = function(attack, decay, release, attackLevel, releaseLevel) {
	var that = { 
    name:   "adr",
		type:		"envelope",
    
    properties: {
  		attack:		isNaN(attack) ? 11025 : attack,
  		decay:		isNaN(decay) ? 11025 : decay,
  		release:	isNaN(release) ? 22050 : release,
  		attackLevel:  attackLevel || 1,
  		releaseLevel: releaseLevel || .2,
    },

		run: function() {
			this.setPhase(0);
			this.setState(0);
		},
	};
	Gibberish.extend(this, that);
	
	var phase = 0;
	var state = 0;
  
	this.callback = function(attack,decay,release,attackLevel,releaseLevel) {
		var val = 0;
		if(state === 0){
			val = phase / attack * attackLevel;
			if(++phase / attack === 1) {
				state++;
				phase = decay;
			}
		}else if(state === 1) {
			val = (phase / decay) * (attackLevel - releaseLevel) + releaseLevel;
			if(--phase <= 0) {
					state += 1;
					phase = release;
			}
		}else if(state === 2){
      phase--;
      
			val = (phase / release) * releaseLevel;
			if(phase <= 0) {
        state++;
      }
		}
		return val;
	};
	this.setPhase = function(newPhase) { phase = newPhase; };
	this.setState = function(newState) { state = newState; phase = 0; };
	this.getState = function() { return state; };		
	
  this.init();
  
	return this;
};
Gibberish.ADR.prototype = Gibberish._envelope;
/*
Analysis ugens have two callbacks, one to perform the analysis and one to output the results.
This allows the analysis to occur at the end of the callback while the outback can occur at
the beginning, in effect using a single sample delay.

Because of the two callbacks, there are also two codegen methods. The default codegens used by
the analysis prototype object should be fine for most applications.
*/

Gibberish.analysis = function() {
  this.type = 'analysis';
  
  this.codegen = function() {
    if(Gibberish.memo[this.symbol]) {
      return Gibberish.memo[this.symbol];
    }else{
      var v = this.variable ? this.variable : Gibberish.generateSymbol('v');
      Gibberish.memo[this.symbol] = v;
      this.variable = v;
      Gibberish.callbackArgs.push( this.symbol )
      Gibberish.callbackObjects.push( this.callback )
    }
        
    this.codeblock = "var " + this.variable + " = " + this.symbol + "();\n";
    
    if( Gibberish.codeblock.indexOf( this.codeblock ) === -1 ) Gibberish.codeblock.push( this.codeblock )
    return this.variable;
  }
  
  this.analysisCodegen = function() {
    // TODO: can this be memoized somehow?
    //if(Gibberish.memo[this.analysisSymbol]) {
    //  return Gibberish.memo[this.analysisSymbol];
    //}else{
    // Gibberish.memo[this.symbol] = v;
    // console.log( this.input )
    
    var input = 0;
    if(this.input.codegen){
      input = this.input.codegen()
      //console.log( "PROPERTY UGEN", input)
      if(input.indexOf('op') > -1) console.log("ANALYSIS BUG")
    }else if( this.input.value ){
      input = typeof this.input.value.codegen !== 'undefined' ? this.input.value.codegen() : this.input.value
    }else{
      input = 'null'
    }
    
    var s = this.analysisSymbol + "(" + input + ",";
    for(var key in this.properties) {
      if(key !== 'input') {
        s += this[key] + ",";
      }
    }
    s = s.slice(0, -1); // remove trailing comma
    s += ");";
  
    this.analysisCodeblock = s;
    
    if( Gibberish.analysisCodeblock.indexOf( this.analysisCodeblock ) === -1 ) Gibberish.analysisCodeblock.push( this.analysisCodeblock )
    
    if( Gibberish.callbackObjects.indexOf( this.analysisCallback) === -1 ) Gibberish.callbackObjects.push( this.analysisCallback )
    
    //console.log( this.analysisCallback )
        
    return s;
  };
  
  this.remove = function() {
    Gibberish.analysisUgens.splice( Gibberish.analysisUgens.indexOf( this ), 1 )
  }
  
  this.analysisInit = function() {
    this.analysisSymbol = Gibberish.generateSymbol(this.name);
    Gibberish.analysisUgens.push( this );
    Gibberish.dirty(); // dirty in case analysis is not connected to graph, 
  };
  
};
Gibberish.analysis.prototype = new Gibberish.ugen();
Gibberish._analysis = new Gibberish.analysis();

Gibberish.Follow = function() {
  this.name = 'follow';
    
  this.properties = {
    input : 0,
    bufferSize : 4410,
    mult : 1,
    useAbsoluteValue:true // for amplitude following, false for other values
  };
    
  var abs = Math.abs,
      history = [0],
      sum = 0,
      index = 0,
      value = 0,
      phase = 0;
      
  this.analysisCallback = function(input, bufferSize, mult, useAbsoluteValue ) {
    if( typeof input === 'object' ) input = input[0] + input[1]
    
  	sum += useAbsoluteValue ? abs(input) : input;
  	sum -= history[index];
    
  	history[index] = useAbsoluteValue ? abs(input) : input;
    
  	index = (index + 1) % bufferSize;
			
    // if history[index] isn't defined set it to 0 
    // TODO: does this really need to happen here? I guess there were clicks on initialization...
    history[index] = history[index] ? history[index] : 0;
  	value = (sum / bufferSize) * mult;
  };
    
  this.callback = this.getValue = function() { return value; };
    
  this.init();
  this.analysisInit();
  this.processProperties( arguments );
  
  var oldBufferSize = this.__lookupSetter__( 'bufferSize' ),
      bs = this.bufferSize
      
  Object.defineProperty( this, 'bufferSize', {
    get: function() { return bs },
    set: function(v) { bs = v; sum = 0; history = [0]; index = 0; }
  })
};
Gibberish.Follow.prototype = Gibberish._analysis;

Gibberish.SingleSampleDelay = function() {
  this.name = 'single_sample_delay';
  
  this.properties = {
    input : arguments[0] || 0,
    amp   : arguments[1] || 1,
  };
  
  var value = 0,
      phase = 0;
  
  this.analysisCallback = function(input, amp) {
    /*if(typeof input === 'object') {
      value = typeof input === 'object' ? [input[0] * amp, input[1] * amp ] : input * amp;
    }else{
      value = input * amp;
    }*/
    value = input
    //if(phase++ % 44100 === 0) console.log(value, input, amp)
  };
  
  this.callback = function() {
    //if(phase % 44100 === 0) console.log(value)
    
    return value;
  };
  
  this.getValue = function() { return value }
  this.init();
  this.analysisInit();
  this.processProperties( arguments );
  
};
Gibberish.SingleSampleDelay.prototype = Gibberish._analysis;

Gibberish.Record = function(_input, _size, oncomplete) {
  var buffer      = new Float32Array(_size),
      phase       = 0,
      isRecording = false,
      self        = this;

  Gibberish.extend(this, {
    name: 'record',
    'oncomplete' :  oncomplete,
    
    properties: {
      input:   0,
      size:    _size || 0,
    },
    
    analysisCallback : function(input, length) {
      if(isRecording) {
        buffer[phase++] = typeof input === 'object' ? input[0] + input[1] : input;
        
        if(phase >= length) {
          isRecording = false;
          self.remove();
        }
      }
    },
    
    record : function() {
      phase = 0;
      isRecording = true;
      return this;
    },
    
    getBuffer : function() { return buffer; },
    getPhase : function() { return phase; },
    
    remove : function() {
      if(typeof this.oncomplete !== 'undefined') this.oncomplete();
      
      for(var i = 0; i < Gibberish.analysisUgens.length; i++) {
        var ugen = Gibberish.analysisUgens[i];
        if(ugen === this) {
          if( Gibberish.callbackArgs.indexOf( this.analysisSymbol) > -1 ) {
            Gibberish.callbackArgs.splice( Gibberish.callbackArgs.indexOf( this.analysisSymbol), 1 )
          }
          if( Gibberish.callbackObjects.indexOf( this.analysisCallback ) > -1 ) {
            Gibberish.callbackObjects.splice( Gibberish.callbackObjects.indexOf( this.analysisCallback ), 1 )
          }
          Gibberish.analysisUgens.splice(i, 1);
          return;
        }
      }
    },
  });
  // cannot be assigned within extend call
  this.properties.input = _input;

  this.init();
  this.analysisInit();
  
  Gibberish.dirty(); // ugen is not attached to anything else
};
Gibberish.Record.prototype = Gibberish._analysis;
Gibberish.effect = function() {
    this.type = 'effect';
};
Gibberish.effect.prototype = new Gibberish.ugen();
Gibberish._effect = new Gibberish.effect();

/**#Gibberish.Distortion - FX
A simple waveshaping distortion that adaptively scales its gain based on the amount of distortion applied.
  
## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 });  
b = new Gibberish.Distortion({ input:a, amount:30 }).connect();  
a.note(440);  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Distortion.amount : property  
Number. The amount of distortion to apply. This number cannot be set lower than 2.
**/
Gibberish.Distortion = function() {
  var abs = Math.abs, 
      log = Math.log, 
      ln2 = Math.LN2;
  
  Gibberish.extend(this, {
    name : 'distortion',
    
    properties : {
      input  : 0,
      amount : 50,
    },
    
    callback : function(input, amount) {
      var x;
      amount = amount > 2 ? amount : 2;
      if(typeof input === 'number') {
    		x = input * amount;
    		input = (x / (1 + abs(x))) / (log(amount) / ln2); //TODO: get rid of log / divide
      }else{
        x = input[0] * amount;
        input[0] = (x / (1 + abs(x))) / (log(amount) / ln2); //TODO: get rid of log / divide
        x = input[1] * amount;
        input[1] = (x / (1 + abs(x))) / (log(amount) / ln2); //TODO: get rid of log / divide      
      }
  		return input;
    },
  })
  .init()
  .processProperties(arguments);
};
Gibberish.Distortion.prototype = Gibberish._effect;

/**#Gibberish.Delay - FX
A simple echo effect.
  
## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 });  
b = new Gibberish.Delay({ input:a, time:22050, feedback:.35 }).connect();  
a.note(440);  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Delay.time : property  
Number. The delay time as measured in samples
**/
/**###Gibberish.Delay.feedback : property  
Number. The amount of feedback that the delay puts into its buffers.
**/
Gibberish.Delay = function() {
  var buffers = [],
      phase = 0;
  
  buffers.push( new Float32Array(Gibberish.context.sampleRate * 2) );
  buffers.push( new Float32Array(Gibberish.context.sampleRate * 2) );
  
  Gibberish.extend(this, {
  	name:"delay",
  	properties:{ input:0, time: 22050, feedback: .5, wet:1, dry:1 },
				
  	callback : function(sample, time, feedback, wet, dry) {
      var channels = typeof sample === 'number' ? 1 : 2;
      
  		var _phase = phase++ % 88200;
      
  		var delayPos = (_phase + (time | 0)) % 88200;
      if(channels === 1) {
  			buffers[0][delayPos] =  ( sample + buffers[0][_phase] ) * feedback;
        sample = (sample * dry) + (buffers[0][_phase] * wet);
      }else{
  			buffers[0][delayPos] =  (sample[0] + buffers[0][_phase]) * feedback;
        sample[0] = (sample[0] * dry) + (buffers[0][_phase] * wet);
  			buffers[1][delayPos] =  (sample[1] + buffers[1][_phase]) * feedback;
        sample[1] = (sample[1] * dry) + (buffers[1][_phase] * wet);
      }
      
  		return sample;
  	},
  });
  
  var time = Math.round( this.properties.time );
  Object.defineProperty(this, 'time', {
    configurable: true,
    get: function() { return time; },
    set: function(v) { time = Math.round(v); Gibberish.dirty( this ) }
  });
  
  this.init();
  this.processProperties(arguments);
  
};
Gibberish.Delay.prototype = Gibberish._effect;

/**#Gibberish.Decimator - FX
A bit-crusher / sample rate reducer. Adapted from code / comments at http://musicdsp.org/showArchiveComment.php?ArchiveID=124

## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 });  
b = new Gibberish.Decimator({ input:a, bitDepth:4.2, sampleRate:.33 }).connect();  
a.note(440);  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Decimator.bitDepth : property  
Float. 0..16. The number of bits the signal is truncated to. May be a floating point number.
**/
/**###Gibberish.Decimator.sampleRate : property  
Number. 0..1. The sample rate to use where 0 is 0 Hz and 1 is nyquist.
**/
Gibberish.Decimator = function() {
  var counter = 0,
      hold = [],
      pow = Math.pow,
      floor = Math.floor;
      
  Gibberish.extend(this, {
  	name:"decimator",
  	properties:{ input:0, bitDepth: 16, sampleRate: 1 },
				
  	callback : function(sample, depth, rate) {
  		counter += rate;
      var channels = typeof sample === 'number' ? 1 : 2;
      
      if(channels === 1) {
  			if(counter >= 1) {
  				var bitMult = pow( depth, 2.0 );
  				hold[0]  = floor( sample * bitMult ) / bitMult;
  				counter -= 1;
  			}
  			sample = hold[0];
      }else{
  			if(counter >= 1) {
  				var bitMult = pow( depth, 2.0 );
  				hold[0]  = floor( sample[0] * bitMult ) / bitMult;
  				hold[1]  = floor( sample[1] * bitMult ) / bitMult;          
  				counter -= 1;
  			}
  			sample = hold;
      }
					
  		return sample;
  	},
  })
  .init()
  .processProperties(arguments);
};
Gibberish.Decimator.prototype = Gibberish._effect;

/**#Gibberish.RingModulation - FX
The name says it all. This ugen also has a mix property to control the ratio of wet to dry output.

## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 });  
b = new Gibberish.RingModulation({ input:a, frequency:1000, amp:.4, mix:1 }).connect();  
a.note(440);  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.RingModulation.frequency : property  
Float. The frequency of the ring modulation modulator wave.
**/
/**###Gibberish.RingModulation.amp : property  
Float. The amplitude of the ring modulation modulator wave.
**/
/**###Gibberish.RingModulation.mix : property  
Float. 0..1. The wet/dry output ratio. A value of 1 means a completely wet signal, a value of 0 means completely dry.
**/
Gibberish.RingModulation = function() {
  var sin = new Gibberish.Sine().callback,
      output = [0,0];
      
  Gibberish.extend( this, { 
  	name : "ringmod",
  
	  properties : { input:0, frequency:440, amp:.5, mix:.5 },

    callback : function(sample, frequency, amp, mix) {
      var channels = typeof sample === 'number' ? 1 : 2;
      var output1 = channels === 1 ? sample : sample[0];
      
      var mod = sin(frequency, amp);
      
      output1 = output1 * (1-mix) + (output1 * mod) * mix;
      
      if(channels === 2) {
        var output2 = sample[1];
        output2 = output2 * (1-mix) + (output2 * mod) * mix;

        output[0] = output1;
        output[1] = output2;
        return output;
      }
      
		  return output1; // return mono
  	},
  })
  .init()
  .processProperties(arguments); 
};
Gibberish.RingModulation.prototype = Gibberish._effect;


/**#Gibberish.DCBlock - FX
A one-pole filter for removing bias.

## Example Usage##
` `  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.DCBlock.input : property  
Float. The input ugen to remove bias from.
**/

Gibberish.DCBlock = function() {
  var x1 = 0, y1 = 0

	Gibberish.extend(this, {
  	name: 'dcblock',
    type: 'effect',
    
    properties : {
      input : 0, 
    },
    
    reset : function() {
      x1 = 0;
      y1 = 0;
    },
    
    callback : function(input) {
      var y = input - x1 + y1 * .9997
      x1 = input
      y1 = y
    
      return y;
    }
  })
  .init()
  .processProperties(arguments);
};
Gibberish.DCBlock.prototype = Gibberish._effect;

/**#Gibberish.Tremolo - FX
A basic amplitude modulation effect.

## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 }).connect();  
b = new Gibberish.Tremolo({input:a, frequency:4, amp:1});   
a.note(880);   
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Tremolo.input : property  
Float. The input to apply the tremolo effect to
**/
/**###Gibberish.Tremolo.frequency : property  
Float. The speed of the tremolo effect, measured in Hz
**/
/**###Gibberish.Tremolo.amp : property  
Float. The magnitude of the tremolo effect.
**/

Gibberish.Tremolo = function() {
  var modulationCallback = new Gibberish.Sine().callback
  
	Gibberish.extend(this, {
  	name: 'tremolo',
    type: 'effect',
    
    properties : {
      input : 0,
      frequency:2.5,
      amp:.5,
    },
  
    callback : function( input, frequency, amp ) {
      var channels = typeof input === 'number' ? 1 : 2,
          modAmount = modulationCallback( frequency, amp )
      
      if(channels === 1) {
        input *= modAmount
      }else{
        input[0] *= modAmount
        input[1] *= modAmount
      }
      
      return input;
    }
  })
  .init()
  .processProperties(arguments);
};
Gibberish.Tremolo.prototype = Gibberish._effect;

/**#Gibberish.OnePole - FX
A one-pole filter for smoothing property values. This is particularly useful when the properties are being controlled interactively. You use the smooth method to apply the filter.

## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 }).connect();  
b = new Gibberish.OnePole({input:a.properties.frequency, a0:.0001, b1:.9999});  
b.smooth('frequency', a);  
a.note(880);  
a.note(440);  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.OnePole.input : property  
Float. The property to smooth. You should always refer to this property through the properties dictionary of the ugen. In general it is much easier to use the smooth method of the OnePole than to set this property manually.
**/
/**###Gibberish.OnePole.a0 : property  
Float. The value the input is multiplied by.
**/
/**###Gibberish.OnePole.b1 : property  
Float. The value this pole of the filter is multiplied by.
**/
Gibberish.OnePole = function() {
  var history = 0,
      phase = 0;
      
	Gibberish.extend(this, {
  	name: 'onepole',
    type: 'effect',
    
    properties : {
      input : 0,
      a0 : .15,           
      b1 : .85, 
    },
    
    callback : function(input, a0, b1) {
      var out = input * a0 + history * b1;
      history = out;
    
      return out;
    },

/**###Gibberish.OnePole.smooth : method  
Use this to apply the filter to a property of an object.

param **propertyName** String. The name of the property to smooth.  
param **object** Object. The object containing the property to be smoothed
**/    
    smooth : function(property, obj) {
      this.input = obj[ property ]
      history = this.input
      obj[ property ] = this
      
      this.obj = obj
      this.property = property
      
      this.oldSetter = obj.__lookupSetter__( property )
      this.oldGetter = obj.__lookupGetter__( property )
      
      var op = this
      Object.defineProperty( obj, property, {
        get : function() { return op.input },
        set : function(v) { 
          op.input = v
        }
      })
    },

/**###Gibberish.OnePole.remove : method  
Remove OnePole from assigned ugen property. This will effectively remove the filter from the graph and return the normal target ugen property behavior.
**/      
    remove : function() {
      Object.defineProperty( this.obj, this.property, {
        get: this.oldGetter,
        set: this.oldSetter
      })
      
      this.obj[ this.property ] = this.input
    }
  })
  .init()
  .processProperties(arguments);
};
Gibberish.OnePole.prototype = Gibberish._effect;

/**#Gibberish.Filter24 - FX
A four pole ladder filter. Adapted from Arif Ove Karlsne's 24dB ladder approximation: http://musicdsp.org/showArchiveComment.php?ArchiveID=141.

## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 });  
b = new Gibberish.Filter24({input:a, cutoff:.2, resonance:4}).connect();  
a.note(1760);   
a.note(440);  
a.isLowPass = false;  
a.note(220);  
a.note(1760);  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Filter24.input : property  
Object. The ugen that should feed the filter.
**/
/**###Gibberish.Filter24.cutoff : property  
Number. 0..1. The cutoff frequency for the synth's filter.
**/
/**###Gibberish.Filter24.resonance : property  
Number. 0..50. Values above 4.5 are likely to produce shrieking feedback. You are warned.
**/
/**###Gibberish.Filter24.isLowPass : property  
Boolean. Default true. Whether to use a low-pass or high-pass filter.
**/
Gibberish.Filter24 = function() {
  var poles  = [0,0,0,0],
      poles2 = [0,0,0,0],
      output = [0,0],
      phase  = 0,
      _cutoff = isNaN(arguments[0]) ? .1 : arguments[0],
      _resonance = isNaN(arguments[1]) ? 3 : arguments[1]
      _isLowPass = typeof arguments[2] !== 'undefined' ? arguments[2] : true;
      
  Gibberish.extend( this, { 
  	name : "filter24",
  
	  properties : { input:0, cutoff:_cutoff, resonance:_resonance, isLowPass:_isLowPass },

    callback : function(sample, cutoff, resonance, isLowPass) {
      var channels = typeof sample === 'number' ? 1 : 2;
      var output1 = channels === 1 ? sample : sample[0];
      
			var rezz = poles[3] * resonance; 
			rezz = rezz > 1 ? 1 : rezz;
						
			cutoff = cutoff < 0 ? 0 : cutoff;
			cutoff = cutoff > 1 ? 1 : cutoff;
						
			output1 -= rezz;

			poles[0] = poles[0] + ((-poles[0] + output1) * cutoff);
			poles[1] = poles[1] + ((-poles[1] + poles[0])  * cutoff);
			poles[2] = poles[2] + ((-poles[2] + poles[1])  * cutoff);
			poles[3] = poles[3] + ((-poles[3] + poles[2])  * cutoff);

			output1 = isLowPass ? poles[3] : output1 - poles[3];
      
      if(channels === 2) {
        var output2 = sample[1];

  			rezz = poles2[3] * resonance; 
  			rezz = rezz > 1 ? 1 : rezz;

  			output2 -= rezz;

  			poles2[0] = poles2[0] + ((-poles2[0] + output2) * cutoff);
  			poles2[1] = poles2[1] + ((-poles2[1] + poles2[0])  * cutoff);
  			poles2[2] = poles2[2] + ((-poles2[2] + poles2[1])  * cutoff);
  			poles2[3] = poles2[3] + ((-poles2[3] + poles2[2])  * cutoff);

  			output2 = isLowPass ? poles2[3] : output2 - poles2[3];
        output[0] = output1;
        output[1] = output2;
        
        return output;
      }
      
		  return output1; // return mono
  	},
  })
  .init()
  .processProperties(arguments);
};
Gibberish.Filter24.prototype = Gibberish._effect;

/**#Gibberish.SVF - FX
A two-pole state variable filter. This filter calculates coefficients on a per-sample basis, so that you can easily modulate cutoff and Q. Can switch between low-pass, high-pass, band and notch modes.

## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 });  
b = new Gibberish.SVF({input:a, cutoff:200, Q:4, mode:0});  
a.note(1760);   
a.note(440);  
a.mode = 2;
a.note(220);  
a.note(1760);  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.SVF.input : property  
Object. The ugen that should feed the filter.
**/
/**###Gibberish.SVF.cutoff : property  
Number. 0..22050. The cutoff frequency for the synth's filter. Note that unlike the Filter24, this is measured in Hz.
**/
/**###Gibberish.SVF.resonance : property  
Number. 0..50. Values above 4.5 are likely to produce shrieking feedback. You are warned.
**/
/**###Gibberish.SVF.mode : property  
Number. 0..3. 0 = lowpass, 1 = highpass, 2 = bandpass, 3 = notch.
**/
Gibberish.SVF = function() {
	var d1 = [0,0], d2 = [0,0], pi= Math.PI, out = [0,0];
  
  Gibberish.extend( this, {
  	name:"SVF",
  	properties : { input:0, cutoff:440, Q:2, mode:0, sr: Gibberish.context.sampleRate },
				
  	callback: function(sample, frequency, Q, mode, sr) {
      var channels = typeof sample === 'number' ? 1 : 2;
      var output1 = channels === 1 ? sample : sample[0];
      
  		var f1 = 2 * pi * frequency / sr;
  		Q = 1 / Q;
					
			var l = d2[0] + f1 * d1[0];
			var h = output1 - l - Q * d1[0];
			var b = f1 * h + d1[0];
			var n = h + l;
						
			d1[0] = b;
			d2[0] = l;
      
			if(mode === 0) 
				output1 = l;
			else if(mode === 1)
				output1 = h;
			else if(mode === 2)
				output1 = b;
			else
				output1 = n;
        
      if(channels === 2) {
        var output2 = sample[1];
  			var l = d2[1] + f1 * d1[1];
  			var h = output2 - l - Q * d1[1];
  			var b = f1 * h + d1[1];
  			var n = h + l;
						
  			d1[1] = b;
  			d2[1] = l;
      
  			if(mode === 0) 
  				output2 = l;
  			else if(mode === 1)
  				output2 = h;
  			else if(mode === 2)
  				output2 = b;
  			else
  				output2 = n;
          
        out[0] = output1; out[1] = output2;
      }else{
        out = output1;
      }

  		return out;
  	},
  })
  .init()
  .processProperties(arguments);
};
Gibberish.SVF.prototype = Gibberish._effect;

/**#Gibberish.Biquad - FX
A two-pole biquad filter. Currently, you must manually call calculateCoefficients every time mode, cutoff or Q changes; thus this filter isn't good for samplerate modulation.

## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 });  
b = new Gibberish.Biquad({input:a, cutoff:200, Q:4, mode:"LP"}).connect();  
a.note(1760);   
a.note(440);  
a.mode = "HP";
a.note(220);  
a.note(1760);  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Biquad.input : property  
Object. The ugen that should feed the filter.
**/
/**###Gibberish.Biquad.cutoff : property  
Number. 0..22050. The cutoff frequency for the synth's filter. Note that unlike the Filter24, this is measured in Hz.
**/
/**###Gibberish.Biquad.Q : property  
Number. 0..50. Values above 4.5 are likely to produce shrieking feedback. You are warned.
**/
/**###Gibberish.Biquad.mode : property  
Number. 0..3. "LP" = lowpass, "HP" = highpass, "BP" = bandpass
**/
Gibberish.Biquad = function() {
  var _x1 = [0,0],
      _x2 = [0,0],
      _y1 = [0,0],
      _y2 = [0,0],
      x1 = x2 = y1 = y2 = 0,
      out = [0,0],
	    b0 = 0.001639,
	    b1 = 0.003278,
	    b2 = 0.001639,
	    a1 = -1.955777,
	    a2 = 0.960601,
      _mode = "LP",
    	_cutoff = 2000,
      _Q = .5,
      sr = Gibberish.context.sampleRate,
      _phase = 0;
      
	Gibberish.extend(this, {
		name: "biquad",

	  properties: {
      input: null,
	  },

	  calculateCoefficients: function() {
      switch (_mode) {
	      case "LP":
           var w0 = 2 * Math.PI * _cutoff / sr,
               sinw0 = Math.sin(w0),
               cosw0 = Math.cos(w0),
               alpha = sinw0 / (2 * _Q);
           b0 = (1 - cosw0) / 2,
           b1 = 1 - cosw0,
           b2 = b0,
           a0 = 1 + alpha,
           a1 = -2 * cosw0,
           a2 = 1 - alpha;
           break;
	       case "HP":
           var w0 = 2 * Math.PI * _cutoff / sr,
               sinw0 = Math.sin(w0),
               cosw0 = Math.cos(w0),
               alpha = sinw0 / (2 * _Q);
           b0 = (1 + cosw0) / 2,
           b1 = -(1 + cosw0),
           b2 = b0,
           a0 = 1 + alpha,
           a1 = -2 * cosw0,
           a2 = 1 - alpha;
           break;
	       case "BP":
           var w0 = 2 * Math.PI * _cutoff / sr,
               sinw0 = Math.sin(w0),
               cosw0 = Math.cos(w0),
               toSinh = Math.log(2) / 2 * _Q * w0 / sinw0,
               alpha = sinw0 * (Math.exp(toSinh) - Math.exp(-toSinh)) / 2;
           b0 = alpha,
           b1 = 0,
           b2 = -alpha,
           a0 = 1 + alpha,
           a1 = -2 * cosw0,
           a2 = 1 - alpha;
           break;
	       default:
           return;
       }

       b0 = b0 / a0;
       b1 = b1 / a0;
       b2 = b2 / a0;
       a1 = a1 / a0;
       a2 = a2 / a0;
       
    },

    callback: function( x ) {
      var channels = typeof x === 'number' ? 1 : 2,
          outL = 0,
          outR = 0,
          inL = channels === 1 ? x : x[0];
      
      //outL = b0 * inL + b1 * x1[0] + b2 * x2[0] - a1 * y1[0] - a2 * y2[0];
      outL = b0 * inL + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
      
      // x2[0] = x1[0];
      // x1[0] = x[0];
      // y2[0] = y1[0];
      // y1[0] = outL;
      
      x2 = x1;
      x1 = x;
      y2 = y1;
      y1 = outL;
            
      if(channels === 2) {
        inR = x[1];
        outR = b0 * inR + b1 * x1[1] + b2 * x2[1] - a1 * y1[1] - a2 * y2[1];
        x2[1] = x1[1];
        x1[1] = x[1];
        y2[1] = y1[1];
        y1[1] = outR;
        
        out[0] = outL;
        out[1] = outR;
      }
      return channels === 1 ? outL : out;
    },
	})
  .init();

  Object.defineProperties(this, {
    mode : {
      get: function() { return _mode; },
      set: function(v) { _mode = v; this.calculateCoefficients(); }
    },
    cutoff : {
      get: function() { return _cutoff; },
      set: function(v) { _cutoff = v; this.calculateCoefficients(); }
    },
    Q : {
      get: function() { return _Q; },
      set: function(v) { _Q = v; this.calculateCoefficients(); }
    },
  })
  
  this.processProperties(arguments);
  
  this.calculateCoefficients();
};
Gibberish.Biquad.prototype = Gibberish._effect;

/**#Gibberish.Flanger - FX
Classic flanging effect with feedback.

## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 });  
b = new Gibberish.Flanger({input:a, rate:.5, amount:125, feedback:.5}).connect();  
a.note(440);  
a.feedback = 0;  
a.note(440);  
a.rate = 4;
a.note(440);
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Flanger.input : property  
Object. The ugen that should feed the flagner.
**/
/**###Gibberish.Flanger.rate : property  
Number. The speed at which the delay line tap position is modulated.
**/
/**###Gibberish.Flanger.amount : property  
Number. The amount of time, in samples, that the delay line tap position varies by.
**/
/**###Gibberish.Flanger.feedback : property  
Number. The amount of output that should be fed back into the delay line
**/
/**###Gibberish.Flanger.offset : property  
Number. The base offset of the delay line tap from the current time. Large values (> 500) lead to chorusing effects.
**/

Gibberish.Flanger = function() {
	var buffers =	        [ new Float32Array(88200), new Float32Array(88200) ],
	    bufferLength =    88200,
	    delayModulation =	new Gibberish.Sine().callback,
	    interpolate =		  Gibberish.interpolate,
	    readIndex =			  -100,
	    writeIndex = 		  0,
	    phase =				    0;
      
	Gibberish.extend(this, {
    name:"flanger",
    properties:{ input:0, rate:.25, feedback:0, amount:125, offset:125 },
    
    callback : function(sample, delayModulationRate, feedback, delayModulationAmount, offset) {
      var channels = typeof sample === 'number' ? 1 : 2;
      
  		var delayIndex = readIndex + delayModulation( delayModulationRate, delayModulationAmount * .95 );

  		if(delayIndex > bufferLength) {
  			delayIndex -= bufferLength;
  		}else if(delayIndex < 0) {
  			delayIndex += bufferLength;
  		}
					
			var delayedSample = interpolate(buffers[0], delayIndex);
			buffers[0][writeIndex] = channels === 1 ? sample + (delayedSample * feedback): sample[0] + (delayedSample * feedback);
				
      if(channels === 2) {
        sample[0] += delayedSample;
        
  			delayedSample = interpolate(buffers[1], delayIndex);
  			buffers[1][writeIndex] = sample[1] + (delayedSample * feedback);
        
        sample[1] += delayedSample;
      }else{
        sample += delayedSample;
      }
			
  		if(++writeIndex >= bufferLength) writeIndex = 0;
  		if(++readIndex  >= bufferLength) readIndex  = 0;

  		return sample;
  	},	
  })
  .init()
  .processProperties(arguments);

	readIndex = this.offset * -1;
};
Gibberish.Flanger.prototype = Gibberish._effect;

/**#Gibberish.Vibrato - FX
Delay line vibrato effect.

## Example Usage##
`a = new Gibberish.Synth({ attack:44, decay:44100 });  
b = new Gibberish.Vibrato({input:a, rate:4, amount:125 }).connect();  
a.note(440);  
a.rate = .5;
a.note(440);
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Vibrato.input : property  
Object. The ugen that should feed the vibrato.
**/
/**###Gibberish.Vibrato.rate : property  
Number. The speed at which the delay line tap position is modulated.
**/
/**###Gibberish.Vibrato.amount : property  
Number. The size of the delay line modulation; effectively the amount of vibrato to produce, 
**/
/**###Gibberish.Vibrato.offset : property  
Number. The base offset of the delay line tap from the current time.
**/
Gibberish.Vibrato = function() {
	var buffers =	        [ new Float32Array(88200), new Float32Array(88200) ],
	    bufferLength =    88200,
	    delayModulation =	new Gibberish.Sine().callback,
	    interpolate =		  Gibberish.interpolate,
	    readIndex =			  -100,
	    writeIndex = 		  0,
	    phase =				    0;
      
	Gibberish.extend(this, {
    name:"vibrato",
  	properties:{ input:0, rate:5, amount:.5, offset:125 },
    
  	callback : function(sample, delayModulationRate, delayModulationAmount, offset) {
      var channels = typeof sample === 'number' ? 1 : 2;
      
  		var delayIndex = readIndex + delayModulation( delayModulationRate, delayModulationAmount * offset - 1 );

  		if(delayIndex > bufferLength) {
  			delayIndex -= bufferLength;
  		}else if(delayIndex < 0) {
  			delayIndex += bufferLength;
  		}
					
			var delayedSample = interpolate(buffers[0], delayIndex);
			buffers[0][writeIndex] = channels === 1 ? sample : sample[0];
				
      if(channels === 2) {
        sample[0] = delayedSample;
        
  			delayedSample = interpolate(buffers[1], delayIndex);
  			buffers[1][writeIndex] = sample[1];
        
        sample[1] = delayedSample;
      }else{
        sample = delayedSample;
      }
			
  		if(++writeIndex >= bufferLength) writeIndex = 0;
  		if(++readIndex  >= bufferLength) readIndex  = 0;

  		return sample;
  	},	
  })
  .init()
  .processProperties(arguments);

	readIndex = this.offset * -1;
};
Gibberish.Vibrato.prototype = Gibberish._effect;

/**#Gibberish.BufferShuffler - FX
A buffer shuffling / stuttering effect with reversing and pitch-shifting

## Example Usage##
`a = new Gibberish.Synth({ attack:88200, decay:88200 });  
b = new Gibberish.BufferShuffler({input:a, chance:.25, amount:125, rate:44100, pitchMin:-4, pitchMax:4 }).connect();  
a.note(440);
`  
##Constructor##
**param** *properties* : Object. A dictionary of property keys and values to assign to the Gibberish.BufferShuffler object
- - - - 
**/
/**###Gibberish.BufferShuffler.chance : property
Float. Range 0..1. Default .25. The likelihood that incoming audio will be shuffled.
**/
/**###Gibberish.BufferShuffler.rate : property
Integer, in samples. Default 11025. How often Gibberish.BufferShuffler will randomly decide whether or not to shuffle.
**/
/**###Gibberish.BufferShuffler.length : property
Integer, in samples. Default 22050. The length of time to play stuttered audio when stuttering occurs.
**/
/**###Gibberish.BufferShuffler.reverseChance : property
Float. Range 0..1. Default .5. The likelihood that stuttered audio will be reversed
**/
/**###Gibberish.BufferShuffler.pitchChance : property
Float. Range 0..1. Default .5. The likelihood that stuttered audio will be repitched.
**/
/**###Gibberish.BufferShuffler.pitchMin : property
Float. Range 0..1. Default .25. The lowest playback speed used to repitch the audio
**/
/**###Gibberish.BufferShuffler.pitchMax : property
Float. Range 0..1. Default 2. The highest playback speed used to repitch the audio.
**/
/**###Gibberish.BufferShuffler.wet : property
Float. Range 0..1. Default 1. When shuffling, the amplitude of the wet signal
**/
/**###Gibberish.BufferShuffler.dry : property
Float. Range 0..1. Default 0. When shuffling, the amplitude of the dry signal
**/

Gibberish.BufferShuffler = function() {
	var buffers = [ new Float32Array(88200), new Float32Array(88200) ],
    	bufferLength = 88200,  
  		readIndex = 0,
  		writeIndex = 0,
  		randomizeCheckIndex = 0,
  		shuffleTimeKeeper = 0,
  		isShuffling = 0,
  		random = Math.random,
  		fadeIndex = 0,
  		fadeAmount = 1,
  		isFadingWetIn = false,
  		isFadingDryIn = false,
  		reversed = false,
  		interpolate = Gibberish.interpolate,
  		pitchShifting = false,
  		speed = 1,
  		isBufferFull = false,
      rndf = Gibberish.rndf,
      _output = [0,0];
	
	Gibberish.extend(this, {
    name:"buffer_shuffler",
	
  	properties: { input:0, chance:.25, rate:11025, length:22050, reverseChange:.5, pitchChance:.5, pitchMin:.25, pitchMax:2, wet:1, dry:0 },

  	callback : function(sample, chance, rate, length, reverseChance, pitchChance, pitchMin, pitchMax, wet, dry) {
      var channels = typeof sample === 'number' ? 1 : 2;
      
  		if(!isShuffling) {
        buffers[0][writeIndex] = channels === 1 ? sample : sample[0];
        buffers[1][writeIndex] = channels === 1 ? sample : sample[1]; // won't be used but with one handle but probably cheaper than an if statement?
                
  			writeIndex++
  			writeIndex %= bufferLength;

  			isBufferFull = writeIndex === 0 ? 1 : isBufferFull; // don't output buffered audio until a buffer is full... otherwise you just get a gap
						
  			randomizeCheckIndex++;

  			if(randomizeCheckIndex % rate == 0 && random() < chance) {
  				reversed = random() < reverseChance;
  				isShuffling = true;
  				if(!reversed) {
  					readIndex = writeIndex - length;
  					if(readIndex < 0) readIndex = bufferLength + readIndex;
  				}
  				pitchShifting = random() < pitchChance;
  				if(pitchShifting) {
  					speed = rndf(pitchMin, pitchMax);
  				}
  				fadeAmount = 1;
  				isFadingWetIn = true;
  				isFadingDryIn = false;
  			}
  		}else if(++shuffleTimeKeeper % (length - 400) === 0) {
  			isFadingWetIn = false;
  			isFadingDryIn = true;
  			fadeAmount = 1;
  			shuffleTimeKeeper = 0;
  		}
					
  		readIndex += reversed ? speed * -1 : speed;
  		if(readIndex < 0) {
  			readIndex += bufferLength;
  		}else if( readIndex >= bufferLength ) {
  			readIndex -= bufferLength;
  		}	
  		var outSampleL = interpolate(buffers[0], readIndex);
			
      var outL, outR, shuffle, outSampleR;			
			if(isFadingWetIn) {						
				fadeAmount -= .0025;
        
        shuffle = (outSampleL * (1 - fadeAmount));
				outL = channels === 1 ? shuffle + (sample * fadeAmount) : shuffle + (sample[0] * fadeAmount);
        
        if(channels === 2) {
          outSampleR = interpolate(buffers[1], readIndex);
          shuffle = (outSampleR * (1 - fadeAmount));
          outR = channels === 1 ? outL : shuffle + (sample[1] * fadeAmount);
        }

				if(fadeAmount <= .0025) isFadingWetIn = false;
			}else if(isFadingDryIn) {						
				fadeAmount -= .0025;
        
        shuffle = outSampleL * fadeAmount;
				outL = channels === 1 ? shuffle + (sample * fadeAmount) : shuffle + (sample[0] * (1 - fadeAmount));
        
        if(channels === 2) {
          outSampleR = interpolate(buffers[1], readIndex);
          shuffle = outSampleR * fadeAmount;
          outR = shuffle + (sample[1] * (1 - fadeAmount));
        }
        
				if(fadeAmount <= .0025) { 
					isFadingDryIn = false;
					isShuffling = false;
					reversed = false;
					speed = 1;
					pitchShifting = 0;
				}
			}else{
        if(channels === 1) {
          outL = isShuffling && isBufferFull ? (outSampleL * wet) + sample * dry : sample;
        }else{
          outSampleR = interpolate(buffers[1], readIndex);
          outL = isShuffling && isBufferFull ? (outSampleL * wet) + sample[0] * dry : sample[0];
          outR = isShuffling && isBufferFull ? (outSampleR * wet) + sample[1] * dry : sample[1];          
        }
			}
      _output = [outL, outR];
  		return channels === 1 ? outL : _output;
  	},
  })
  .init()
  .processProperties(arguments);
};
Gibberish.BufferShuffler.prototype = Gibberish._effect;

Gibberish.AllPass = function(time, feedback) {
	var index  = -1,
    	buffer =	new Float32Array(time || 500),
      bufferLength = buffer.length;
  
  Gibberish.extend(this, {
		name:		"allpass",
    properties: {
      input   : 0,
    },
    callback : function(sample) {
  		index = ++index % bufferLength;
  		var bufferSample = buffer[index];
  		var out = -1 * sample + bufferSample;

  		buffer[index] = sample + (bufferSample * .5);
  		return out;
  	},
	});
  
};
/*
adapted from audioLib.js, in turn adapted from Freeverb source code
this is actually a lowpass-feedback-comb filter (https://ccrma.stanford.edu/~jos/pasp/Lowpass_Feedback_Comb_Filter.html)
*/
Gibberish.Comb = function(time) {
	var buffer = new Float32Array(time || 1200),
    	bufferLength = buffer.length,
    	index = 0,
    	store = 0;
      
	Gibberish.extend(this, {
		name:		"comb",
    properties : {
      input : 0,
      feedback : .84,
      damping: .2,
  		//time:		time || 1200,
    },
    
    /*
		self.sample	= self.buffer[self.index];
		self.store	= self.sample * self.invDamping + self.store * self.damping;
		self.buffer[self.index++] = s + self.store * self.feedback;
    */
    
  	callback: function(sample, feedback, damping) {
  		var currentPos = ++index % bufferLength;
			var out = buffer[currentPos];
						
			store = (out * (1 - damping)) + (store * damping);
						
			buffer[currentPos] = sample + (store * feedback);

  		return out;
  	},
	});
  
};

/**#Gibberish.Reverb - FX
based off audiolib.js reverb and freeverb
 
## Example Usage##
`a = new Gibberish.Synth({ attack:88200, decay:88200 });  
b = new Gibberish.Reverb({input:a, roomSize:.5, wet:1, dry;.25}).connect();
a.note(440);
`  
##Constructor
**param** *properties* : Object. A dictionary of property keys and values to assign to the Gibberish.BufferShuffler object
**/
/**###Gibberish.Reverb.roomSize : property
Float. 0..1. The size of the room being emulated.
**/	
/**###Gibberish.Reverb.damping : property
Float. Attenuation of high frequencies that occurs.
**/	
/**###Gibberish.Reverb.wet : property
Float. Default = .75. The amount of processed signal that is output.  
**/	
/**###Gibberish.Reverb.dry : property
Float. Default = .5. The amount of dry signal that is output
**/	

Gibberish.Reverb = function() {
  var tuning =	{
		    combCount: 		    8,
		    combTuning: 	    [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617],
                          
		    allPassCount: 	  4,
		    allPassTuning: 	  [556, 441, 341, 225],
		    allPassFeedback:  0.5,
                          
		    fixedGain: 		    0.015,
		    scaleDamping: 	  0.4,
                          
		    scaleRoom: 		    0.28,
		    offsetRoom: 	    0.7,
                          
		    stereoSpread: 	  23
		},
    feedback = .84,
    combs = [],
    apfs  = [],
    output   = [0,0],
    phase  = 0;
    
	Gibberish.extend(this, {
		name:		"reverb",
    
		roomSize:	.5,
    
    properties: {
      input:    0,
  		wet:		  .5,
  		dry:		  .55,
      roomSize: .84,
      damping:  .5,
    },
    
    callback : function(sample, wet, dry, roomSize, damping) {
      var channels = typeof sample === 'object' ? 2 : 1;
      
			var input = channels === 1 ? sample : sample[0] + sample[1]; // converted to fake stereo

			var _out = input * .015;
      var out = _out;
						
			for(var i = 0; i < 8; i++) {
				var filt = combs[i](_out, roomSize * .98, (damping * .4)); // .98 is scaleRoom + offsetRoom, .4 is scaleDamping
				out += filt;				
			}
							
			for(var i = 0; i < 4; i++) {
				out = apfs[i](out);	
			}
      
      output[0] = output[1] = (input * dry) + (out * wet);

  		return output;
  	},
	})  
  .init()
  .processProperties(arguments);
      
  this.setFeedback = function(v) { feedback = v }
  
	for(var i = 0; i < 8; i++){
		combs.push( new Gibberish.Comb( tuning.combTuning[i] ).callback );
	}
  
	for(var i = 0; i < 4; i++){
		apfs.push( new Gibberish.AllPass(tuning.allPassTuning[i], tuning.allPassFeedback ).callback );
	}

};
Gibberish.Reverb.prototype = Gibberish._effect;

/**#Gibberish.Granulator - FX
A granulator that operates on a buffer of samples. You can get the samples from a [Sampler](javascript:displayDocs('Gibberish.Sampler'\))
object.

## Example Usage ##
`a = new Gibberish.Sampler('resources/trumpet.wav');  
// wait until sample is loaded to create granulator  
a.onload = function() {  
  b = new Gibberish.Granulator({  
    buffer:a.getBuffer(),  
    grainSize:1000,  
    speedMin: -2,  
    speedMax: 2,  
  });  
  b.mod('position', new Gibberish.Sine(.1, .45), '+');  
  b.connect();  
};`
## Constructor
**param** *propertiesList*: Object. At a minimum you should define the input to granulate. See the example.
**/
/**###Gibberish.Granulator.speed : property
Float. The playback rate, in samples, of each grain
**/
/**###Gibberish.Granulator.speedMin : property
Float. When set, the playback rate will vary on a per grain basis from (grain.speed + grain.speedMin) -> (grain.speed + grain.speedMax). This value should almost always be negative.
**/
/**###Gibberish.Granulator.speedMax : property
Float. When set, the playback rate will vary on a per grain basis from (grain.speed + grain.speedMin) -> (grain.speed + grain.speedMax).
**/
/**###Gibberish.Granulator.grainSize : property
Integer. The length, in samples, of each grain
**/
/**###Gibberish.Granulator.position : property
Float. The center position of the grain cloud. 0 represents the start of the buffer, 1 represents the end.
**/
/**###Gibberish.Granulator.positionMin : property
Float. The left boundary on the time axis of the grain cloud.
**/
/**###Gibberish.Granulator.positionMax : property
Float. The right boundary on the time axis of the grain cloud.
**/
/**###Gibberish.Granulator.buffer : property
Object. The input buffer to granulate.
**/
/**###Gibberish.Granulator.numberOfGrains : property
Float. The number of grains in the cloud. Can currently only be set on initialization.
**/

Gibberish.Granulator = function(properties) {
	var grains      = [];
	    buffer      = null,
	    interpolate = Gibberish.interpolate,
      panner      = Gibberish.makePanner(),
      bufferLength= 0,
	    debug       = 0,
	    write       = 0,
      self        = this,
      out         = [0,0],
      _out        = [0,0],
      rndf        = Gibberish.rndf,
      numberOfGrains = properties.numberOfGrains || 20;
      
	Gibberish.extend(this, { 
		name:		        "granulator",
		bufferLength:   88200,
		reverse:	      true,
		spread:		      .5,
    
    properties : {
      speed: 		    1,
      speedMin:     -0,
      speedMax: 	  .0,
      grainSize: 	  1000,
      position:	    .5,
      positionMin:  0,
      positionMax:  0,
      amp:		      .2,
      fade:		      .1,
      pan:		      0,
      shouldWrite:  false,
    },
    
    setBuffer : function(b) { buffer = b; bufferLength = b.length },
    
    callback : function(speed, speedMin, speedMax, grainSize, positionMin, positionMax, position, amp, fade, pan, shouldWrite) {
    		for(var i = 0; i < numberOfGrains; i++) {
    			var grain = grains[i];
					
    			if(grain._speed > 0) {
    				if(grain.pos > grain.end) {
    					grain.pos = (position + rndf(positionMin, positionMax)) * buffer.length;
    					grain.start = grain.pos;
    					grain.end = grain.start + grainSize;
    					grain._speed = speed + rndf(speedMin, speedMax);
    					grain._speed = grain._speed < .1 ? .1 : grain._speed;
    					grain._speed = grain._speed < .1 && grain._speed > 0 ? .1 : grain._speed;							
    					grain._speed = grain._speed > -.1 && grain._speed < 0 ? -.1 : grain._speed;							
    					grain.fadeAmount = grain._speed * (fade * grainSize);
    					grain.pan = rndf(self.spread * -1, self.spread);
    				}
						
    				var _pos = grain.pos;
    				while(_pos > buffer.length) _pos -= buffer.length;
    				while(_pos < 0) _pos += buffer.length;
						
    				var _val = interpolate(buffer, _pos);
					
    				_val *= grain.pos < grain.fadeAmount + grain.start ? (grain.pos - grain.start) / grain.fadeAmount : 1;
    				_val *= grain.pos > (grain.end - grain.fadeAmount) ? (grain.end - grain.pos)   / grain.fadeAmount : 1;
						
    			}else {
    				if(grain.pos < grain.end) {
    					grain.pos = (position + rndf(positionMin, positionMax)) * buffer.length;
    					grain.start = grain.pos;
    					grain.end = grain.start - grainSize;
    					grain._speed = speed + rndf(speedMin, speedMax);
    					grain._speed = grain._speed < .1 && grain._speed > 0 ? .1 : grain._speed;							
    					grain._speed = grain._speed > -.1 && grain._speed < 0 ? -.1 : grain._speed;	
    					grain.fadeAmount = grain._speed * (fade * grainSize);							
    				}
						
    				var _pos = grain.pos;
    				while(_pos > buffer.length) _pos -= buffer.length;
    				while(_pos < 0) _pos += buffer.length;
					
    				var _val = interpolate(buffer, _pos);
					
    				_val *= grain.pos > grain.start - grain.fadeAmount ? (grain.start - grain.pos) / grain.fadeAmount : 1;
    				_val *= grain.pos < (grain.end + grain.fadeAmount) ? (grain.end - grain.pos) / grain.fadeAmount : 1;
    			}
					
    			_out = panner(_val * amp, grain.pan, _out);
          out[0] += _out[0];
          out[1] += _out[1];
    			
          grain.pos += grain._speed;
    		}
				
    		return panner(out, pan, out);
    	},
	})
  .init()
  .processProperties(arguments);
  
	for(var i = 0; i < numberOfGrains; i++) {
		grains[i] = {
			pos : self.position + Gibberish.rndf(self.positionMin, self.positionMax),
			_speed : self.speed + Gibberish.rndf(self.speedMin, self.speedMax),
		}
		grains[i].start = grains[i].pos;
		grains[i].end = grains[i].pos + self.grainSize;
		grains[i].fadeAmount = grains[i]._speed * (self.fade * self.grainSize);
		grains[i].pan = Gibberish.rndf(self.spread * -1, self.spread);
	}
			
	/*if(typeof properties.input !== "undefined") { 
			this.shouldWrite = true;
      
			this.sampler = new Gibberish.Sampler();
			this.sampler.connect();
			this.sampler.record(properties.buffer, this.bufferLength);
      
			buffer = this.sampler.buffer;
	}else*/ if(typeof properties.buffer !== 'undefined') {
	  buffer = properties.buffer;
    bufferLength = buffer.length;
	}

};
Gibberish.Granulator.prototype = Gibberish._effect;
Gibberish.synth = function() {
  this.type = 'oscillator';
    
  this.oscillatorInit = function() {
    this.fx = new Array2; 
    this.fx.parent = this;
  };
};
Gibberish.synth.prototype = new Gibberish.ugen();
Gibberish._synth = new Gibberish.synth();

/**#Gibberish.Synth - Synth
Oscillator + attack / decay envelope.
  
## Example Usage##
`Gibberish.init();  
a = new Gibberish.Synth({ attack:44, decay:44100 }).connect();  
a.note(880);  
a.waveform = "Triangle";  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Synth.frequency : property  
Number. The frequency for the carrier oscillator. This is normally set using the note method but can also be modulated.
**/
/**###Gibberish.Synth.pulsewidth : property  
Number. The duty cycle for PWM synthesis
**/
/**###Gibberish.Synth.attack : property  
Number. The length of the attack portion of the envelope in samples. Note that the synth's envelope affects both amplitude and the index of the synth.
**/
/**###Gibberish.Synth.decay : property  
Number. The length of the decay portion of the envelope in samples. Note that the synth's envelope affects both amplitude and the index of the synth.
**/
/**###Gibberish.Synth.glide : property  
Number. The synth has a one-pole filter attached to the carrier frequency. Set glide to a value between .999 and 1 to get pitch sweep between notes.
**/
/**###Gibberish.Synth.amp : property  
Number. The relative amplitude level of the synth.
**/
/**###Gibberish.Synth.channels : property  
Number. Default 2. Mono or Stereo synthesis.
**/
/**###Gibberish.Synth.pan : property  
Number. Default 0. If the synth has two channels, this determines its position in the stereo spectrum.
**/
/**###Gibberish.Synth.waveform : property  
String. The type of waveform to use. Options include 'Sine', 'Triangle', 'PWM', 'Saw' etc.
**/
		
Gibberish.Synth = function(properties) {
	this.name =	"synth";

	this.properties = {
	  frequency:0,
    pulsewidth:.5,
	  attack:		22050,
	  decay:		22050,
    sustain:  22050,
    release:  22050,
    attackLevel: 1,
    sustainLevel: .5,
    releaseTrigger: 0,
    glide:    .15,
    amp:		  .25,
    channels: 2,
	  pan:		  0,
    sr:       Gibberish.context.sampleRate,
  };
/**###Gibberish.Synth.note : method  
Generate an enveloped note at the provided frequency  
  
param **frequency** Number. The frequency for the oscillator.  
param **amp** Number. Optional. The volume to use.  
**/    
	this.note = function(frequency, amp) {
    if( amp !== 0 ) {
  		if( typeof this.frequency !== 'object' ){
        if( useADSR && frequency === lastFrequency ) {
          this.releaseTrigger = 1;
          return;
        }
        
        this.frequency = lastFrequency = frequency;
        this.releaseTrigger = 0;
      }else{
        this.frequency[0] = lastFrequency = frequency;
        this.releaseTrigger = 0;
        Gibberish.dirty(this);
      }
					
  		if( typeof amp !== 'undefined') this.amp = amp;
	  
      _envelope.run();
    }else{
      this.releaseTrigger = 1;
    }
	};
  
  properties = properties || {}
  
	var useADSR     = typeof properties.useADSR === 'undefined' ? false : properties.useADSR,
      _envelope   = useADSR ? new Gibberish.ADSR() : new Gibberish.AD(),
      envstate    = _envelope.getState,
      envelope    = _envelope.callback,
      _osc        = new Gibberish.PWM(),
	    osc         = _osc.callback,
      lag         = new Gibberish.OnePole().callback,
    	panner      = Gibberish.makePanner(),
      obj         = this,
      lastFrequency = 0,
      phase = 0,
    	out         = [0,0];
      
  _envelope.requireReleaseTrigger = properties.requireReleaseTrigger || false;
      
  this.callback = function(frequency, pulsewidth, attack, decay, sustain,release,attackLevel,sustainLevel,releaseTrigger, glide, amp, channels, pan, sr) {
    glide = glide >= 1 ? .99999 : glide;
    frequency = lag(frequency, 1-glide, glide);
    
    var env, val
    if( useADSR ) {
      env = envelope( attack, decay, sustain, release, attackLevel, sustainLevel, releaseTrigger );
      if( releaseTrigger ) {
        obj.releaseTrigger = 0
      }

      if( envstate() < 4 ) {
  			val = osc( frequency, 1, pulsewidth, sr ) * env * amp;
    
  			return channels === 1 ? val : panner(val, pan, out);
      }else{
  		  val = out[0] = out[1] = 0;
        return channels === 1 ? val : out
      }
    }else{
  		if(envstate() < 2) {
        env = envelope(attack, decay);
  			val = osc( frequency, 1, pulsewidth, sr ) * env * amp;
      
  			return channels === 1 ? val : panner(val, pan, out);
      }else{
  		  val = out[0] = out[1] = 0;
        return channels === 1 ? val : out
      }
    }
	};
  
  this.getEnv = function() { return _envelope; }
  this.getOsc = function() { return _osc; };
  this.setOsc = function(val) { _osc = val; osc = _osc.callback };
  
  var waveform = "PWM";
  Object.defineProperty(this, 'waveform', {
    get : function() { return waveform; },
    set : function(val) { this.setOsc( new Gibberish[val]() ); }
  });
  
  this.init();
  this.oscillatorInit();
	this.processProperties(arguments);
};
Gibberish.Synth.prototype = Gibberish._synth;

/**#Gibberish.PolySynth - Synth
A polyphonic version of [Synth](javascript:displayDocs('Gibberish.Synth'\)). There are two additional properties for the polyphonic version of the synth. The polyphonic version consists of multiple Synths being fed into a single [Bus](javascript:displayDocs('Gibberish.Bus'\)) object.
  
## Example Usage ##
`Gibberish.init();  
a = new Gibberish.PolySytn({ attack:88200, decay:88200, maxVoices:10 }).connect();  
a.note(880);  
a.note(1320); 
a.note(1760);  
`  
## Constructor   
One important property to pass to the constructor is the maxVoices property, which defaults to 5. This controls how many voices are allocated to the synth and cannot be changed after initialization.  
  
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.PolySynth.children : property  
Array. Read-only. An array holding all of the child FMSynth objects.
**/
/**###Gibberish.PolySynth.maxVoices : property  
Number. The number of voices of polyphony the synth has. May only be set in initialization properties passed to constrcutor.
**/
Gibberish.PolySynth = function() {
  this.__proto__ = new Gibberish.Bus2();
  
  Gibberish.extend(this, {
    name:     "polysynth",
    maxVoices:    5,
    voiceCount:   0,
    frequencies:  [],
    _frequency: 0,
    
    polyProperties : {
      frequency: 0,
  		glide:			0,
      attack: 22050,
      decay:  22050,
      pulsewidth:.5,
      waveform:"PWM",
    },

/**###Gibberish.PolySynth.note : method  
Generate an enveloped note at the provided frequency using a simple voice allocation system where if all children are active, the one active the longest cancels its current note and begins playing a new one.    
  
param **frequency** Number. The frequency for the oscillator. 
param **amp** Number. Optional. The volume to use.  
**/  
    note : function(_frequency, amp) {
      var lastNoteIndex = this.frequencies.indexOf( _frequency ),
          idx = lastNoteIndex > -1 ? lastNoteIndex : this.voiceCount++,
          synth = this.children[ idx ];
      
      synth.note( _frequency, amp);
            
      if( lastNoteIndex === -1) {
        this.frequencies[ idx ] = _frequency;
        this._frequency = _frequency
        if(this.voiceCount >= this.maxVoices) this.voiceCount = 0;
      }else{
        delete this.frequencies[ idx ]
      }
    },
    
    initVoices: function() {
      for(var i = 0; i < this.maxVoices; i++) {
        var props = {
          waveform: this.waveform,
          attack:   this.attack,
          decay:    this.decay,
          pulsewidth: this.pulsewidth,
          channels: 2,
          amp:      1,
          useADSR : this.useADSR || false,
          requireReleaseTrigger: this.requireReleaseTrigger || false,
        },
        synth = new Gibberish.Synth( props ).connect( this );

        this.children.push(synth);
      }
    },
  });
  
  this.amp = 1 / this.maxVoices;
    
  this.children = [];
  
  if(typeof arguments[0] === 'object') {
    this.maxVoices = arguments[0].maxVoices ? arguments[0].maxVoices : this.maxVoices
    this.useADSR = typeof arguments[0].useADSR !== 'undefined' ? arguments[ 0 ].useADSR : false
    this.requireReleaseTrigger = typeof arguments[0].requireReleaseTrigger !== 'undefined' ? arguments[ 0 ].requireReleaseTrigger : false    
  }
  
  Gibberish.polyInit(this);
  this.initVoices()
  
  this.processProperties(arguments);
  
  Gibberish._synth.oscillatorInit.call(this);
};

/**#Gibberish.Synth2 - Synth
Oscillator + attack / decay envelope + 24db ladder filter. Basically the same as the [Synth](javascript:displayDocs('Gibberish.Synth'\)) object but with the addition of the filter. Note that the envelope controls both the amplitude of the oscillator and the cutoff frequency of the filter.
  
## Example Usage##
`Gibberish.init();  
a = new Gibberish.Synth2({ attack:44, decay:44100, cutoff:.2, resonance:4 }).connect();  
a.note(880);  
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.Synth2.frequency : property  
Number. The frequency for the carrier oscillator. This is normally set using the note method but can also be modulated.
**/
/**###Gibberish.Synth2.pulsewidth : property  
Number. The duty cycle for PWM synthesis
**/
/**###Gibberish.Synth2.attack : property  
Number. The length of the attack portion of the envelope in samples. Note that the synth's envelope affects both amplitude and the index of the synth.
**/
/**###Gibberish.Synth2.decay : property  
Number. The length of the decay portion of the envelope in samples. Note that the synth's envelope affects both amplitude and the index of the synth.
**/
/**###Gibberish.Synth2.cutoff : property  
Number. 0..1. The cutoff frequency for the synth's filter.
**/
/**###Gibberish.Synth2.resonance : property  
Number. 0..50. Values above 4.5 are likely to produce shrieking feedback. You are warned.
**/
/**###Gibberish.Synth2.useLowPassFilter : property  
Boolean. Default true. Whether to use a high-pass or low-pass filter.
**/
/**###Gibberish.Synth2.glide : property  
Number. The synth has a one-pole filter attached to the carrier frequency. Set glide to a value between .999 and 1 to get pitch sweep between notes.
**/
/**###Gibberish.Synth2.amp : property  
Number. The relative amplitude level of the synth.
**/
/**###Gibberish.Synth2.channels : property  
Number. Default 2. Mono or Stereo synthesis.
**/
/**###Gibberish.Synth2.pan : property  
Number. Default 0. If the synth has two channels, this determines its position in the stereo spectrum.
**/
/**###Gibberish.Synth2.waveform : property  
String. The type of waveform to use. Options include 'Sine', 'Triangle', 'PWM', 'Saw' etc.
**/
Gibberish.Synth2 = function(properties) {
	this.name =	"synth2";

	this.properties = {
	  frequency:0,
    pulsewidth:.5,
	  attack:		22050,
	  decay:		22050,
    sustain:  22050,
    release:  22050,
    attackLevel: 1,
    sustainLevel: .5,
    releaseTrigger: 0,
    cutoff:   .25,
    resonance:3.5,
    useLowPassFilter:true,
    glide:    .15,
    amp:		  .25,
    channels: 1,
	  pan:		  0,
    sr:       Gibberish.context.sampleRate,
  };
/**###Gibberish.Synth2.note : method  
Generate an enveloped note at the provided frequency  
  
param **frequency** Number. The frequency for the oscillator.  
param **amp** Number. Optional. The volume to use.  
**/      
	this.note = function(frequency, amp) {
    if( amp !== 0 ) {
  		if(typeof this.frequency !== 'object'){
        if( useADSR && frequency === lastFrequency ) {
          this.releaseTrigger = 1;
          return;
        }
        
        this.frequency = lastFrequency = frequency;
        this.releaseTrigger = 0;
      }else{
        this.frequency[0] = lastFrequency = frequency;
        this.releaseTrigger = 0;
        Gibberish.dirty(this);
      }
					
  		if( typeof amp !== 'undefined') this.amp = amp;
	  
      _envelope.run();
    }else{
      this.releaseTrigger = 1;
    }
	};
  
  properties = properties || {}
  
	var useADSR     = typeof properties.useADSR === 'undefined' ? false : properties.useADSR,
      _envelope   = useADSR ? new Gibberish.ADSR() : new Gibberish.AD(),
      envstate    = _envelope.getState,
      envelope    = _envelope.callback,
      _osc        = new Gibberish.PWM(),
	    osc         = _osc.callback,      
      _filter     = new Gibberish.Filter24(),
      filter      = _filter.callback,
      lag         = new Gibberish.OnePole().callback,
    	panner      = Gibberish.makePanner(),
      lastFrequency = 0,
      obj         = this,
    	out         = [0,0];
      
  _envelope.requireReleaseTrigger = properties.requireReleaseTrigger || false;
        
  this.callback = function(frequency, pulsewidth, attack, decay, sustain, release, attackLevel, sustainLevel, releaseTrigger, cutoff, resonance, isLowPass, glide, amp, channels, pan, sr) {
    glide = glide >= 1 ? .99999 : glide;
    frequency = lag(frequency, 1-glide, glide);
    
    var env, val
    if( useADSR ) {
      env = envelope( attack, decay, sustain, release, attackLevel, sustainLevel, releaseTrigger );
      if( releaseTrigger ) {
        obj.releaseTrigger = 0
      }

      if( envstate() < 4 ) {
  			val = filter ( osc( frequency, .15, pulsewidth, sr ), cutoff * env, resonance, isLowPass ) * env * amp;
    
  			return channels === 1 ? val : panner(val, pan, out);
      }else{
  		  val = out[0] = out[1] = 0;
        return channels === 1 ? val : out
      }
    }else{
      if( envstate() < 2) {
			  env = envelope(attack, decay);
			  val = filter ( osc( frequency, .15, pulsewidth, sr ), cutoff * env, resonance, isLowPass ) * env * amp;
      
    		return channels === 1 ? val : panner(val, pan, out);
      }else{
    	  val = out[0] = out[1] = 0;
        return channels === 1 ? val : out;
      }
    }
	};
  this.getUseADSR = function() { return useADSR; }
  this.getEnv = function() { return _envelope; };
  this.getOsc = function() { return _osc; };
  this.setOsc = function(val) { _osc = val; osc = _osc.callback };
  
  var waveform = "PWM";
  Object.defineProperty(this, 'waveform', {
    get : function() { return waveform; },
    set : function(val) { this.setOsc( new Gibberish[val]() ); }
  });
  
  this.init();
  this.oscillatorInit();
	this.processProperties(arguments);
};
Gibberish.Synth2.prototype = Gibberish._synth;

/**#Gibberish.PolySynth2 - Synth
A polyphonic version of [Synth2](javascript:displayDocs('Gibberish.Synth2'\)). There are two additional properties for the polyphonic version of the synth. The polyphonic version consists of multiple Synths being fed into a single [Bus](javascript:displayDocs('Gibberish.Bus'\)) object.
  
## Example Usage ##
`Gibberish.init();  
a = new Gibberish.PolySynth2({ attack:88200, decay:88200, maxVoices:10 }).connect();  
a.note(880);  
a.note(1320); 
a.note(1760);  
`  
## Constructor   
One important property to pass to the constructor is the maxVoices property, which defaults to 5. This controls how many voices are allocated to the synth and cannot be changed after initialization.  
  
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.PolySynth2.children : property  
Array. Read-only. An array holding all of the child FMSynth objects.
**/
/**###Gibberish.PolySynth2.maxVoices : property  
Number. The number of voices of polyphony the synth has. May only be set in initialization properties passed to constrcutor.
**/

Gibberish.PolySynth2 = function() {
  this.__proto__ = new Gibberish.Bus2();
  
  Gibberish.extend(this, {
    name:     "polysynth2",
    maxVoices:    5,
    voiceCount:   0,
    frequencies:  [],
    _frequency: 0,
    
    polyProperties : {
      frequency: 0,
      glide:			0,
      attack: 22050,
      decay:  22050,
      pulsewidth:.5,
      resonance: 3.5,
      cutoff:.25,
      useLowPassFilter:true,
      waveform:"PWM",
    },

/**###Gibberish.PolySynth2.note : method  
Generate an enveloped note at the provided frequency using a simple voice allocation system where if all children are active, the one active the longest cancels its current note and begins playing a new one.    
  
param **frequency** Number. The frequency for the oscillator. 
param **amp** Number. Optional. The volume to use.  
**/  
    note : function(_frequency, amp) {
      var lastNoteIndex = this.frequencies.indexOf( _frequency ),
          idx = lastNoteIndex > -1 ? lastNoteIndex : this.voiceCount++,
          synth = this.children[ idx ];
      
      synth.note(_frequency, amp);
            
      if( lastNoteIndex === -1) {
        this.frequencies[ idx ] = _frequency;
        this._frequency = _frequency
        if(this.voiceCount >= this.maxVoices) this.voiceCount = 0;
      }else{
        delete this.frequencies[ idx ]
      }
    },
    
    initVoices: function() {
      this.dirty = true;
      for(var i = 0; i < this.maxVoices; i++) {
        var props = {
          attack:   this.attack,
          decay:    this.decay,
          pulsewidth: this.pulsewidth,
          channels: 2,
          amp:      1,
          useADSR:  this.useADSR || false,
          requireReleaseTrigger: this.requireReleaseTrigger || false,
        },
        synth = new Gibberish.Synth2( props ).connect( this );

        this.children.push(synth);
      }
    },
  });
  
  this.amp = 1 / this.maxVoices;
    
  this.children = [];
  
  if(typeof arguments[0] === 'object') {
    this.maxVoices = arguments[0].maxVoices ? arguments[0].maxVoices : this.maxVoices
    this.useADSR = typeof arguments[0].useADSR !== 'undefined' ? arguments[ 0 ].useADSR : false
    this.requireReleaseTrigger = typeof arguments[0].requireReleaseTrigger !== 'undefined' ? arguments[ 0 ].requireReleaseTrigger : false
  }
  
  Gibberish.polyInit(this);
  
  this.initVoices()

  this.processProperties(arguments);
  Gibberish._synth.oscillatorInit.call(this);
};

/**#Gibberish.FMSynth - Synth
Classic 2-op FM synthesis with an attached attack / decay envelope.
  
## Example Usage##
`Gibberish.init();  
a = new Gibberish.FMSynth({ cmRatio:5, index:3 }).connect();
a.note(880);`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.FMSynth.frequency : property  
Number. The frequency for the carrier oscillator. This is normally set using the note method but can also be modulated.
**/
/**###Gibberish.FMSynth.cmRatio : property  
Number. The carrier-to-modulation ratio. A cmRatio of 2 means that the carrier frequency will be twice the frequency of the modulator.
**/
/**###Gibberish.FMSynth.attack : property  
Number. The length of the attack portion of the envelope in samples. Note that the synth's envelope affects both amplitude and the index of the synth.
**/
/**###Gibberish.FMSynth.decay : property  
Number. The length of the decay portion of the envelope in samples. Note that the synth's envelope affects both amplitude and the index of the synth.
**/
/**###Gibberish.FMSynth.glide : property  
Number. The synth has a one-pole filter attached to the carrier frequency. Set glide to a value between .999 and 1 to get pitch sweep between notes.
**/
/**###Gibberish.FMSynth.amp : property  
Number. The relative amplitude level of the synth.
**/
/**###Gibberish.FMSynth.channels : property  
Number. Default 2. Mono or Stereo synthesis.
**/
/**###Gibberish.FMSynth.pan : property  
Number. Default 0. If the synth has two channels, this determines its position in the stereo spectrum.
**/
Gibberish.FMSynth = function(properties) {
	this.name =	"fmSynth";

	this.properties = {
	  frequency:0,
	  cmRatio:	2,
	  index:		5,			
	  attack:		22050,
	  decay:		22050,
    sustain:  22050,
    release:  22050,
    attackLevel: 1,
    sustainLevel: .5,
    releaseTrigger: 0,
    glide:    .15,
    amp:		  .25,
    channels: 2,
	  pan:		  0,
  };
/**###Gibberish.FMSynth.note : method  
Generate an enveloped note at the provided frequency  
  
param **frequency** Number. The frequency for the carrier oscillator. The modulator frequency will be calculated automatically from this value in conjunction with the synth's carrier to modulation ratio  
param **amp** Number. Optional. The volume to use.  
**/

	this.note = function(frequency, amp) {
    if( amp !== 0 ) {
  		if(typeof this.frequency !== 'object'){
        if( useADSR && frequency === lastFrequency ) {
          this.releaseTrigger = 1;
          return;
        }
        
        this.frequency = lastFrequency = frequency;
        this.releaseTrigger = 0;
      }else{
        this.frequency[0] = lastFrequency = frequency;
        this.releaseTrigger = 0;
        Gibberish.dirty(this);
      }
					
  		if( typeof amp !== 'undefined') this.amp = amp;
	  
      _envelope.run();
    }else{
      this.releaseTrigger = 1;
    }
	};
  
  properties = properties || {}
  
	var useADSR     = typeof properties.useADSR === 'undefined' ? false : properties.useADSR,
      _envelope   = useADSR ? new Gibberish.ADSR() : new Gibberish.AD(),
      envstate    = _envelope.getState,
      envelope    = _envelope.callback,
	    carrier     = new Gibberish.Sine().callback,
	    modulator   = new Gibberish.Sine().callback,
      lag         = new Gibberish.OnePole().callback,
    	panner      = Gibberish.makePanner(),
    	out         = [0,0],
      obj         = this,
      lastFrequency = 0,
      phase = 0,
      check = false;

  _envelope.requireReleaseTrigger = properties.requireReleaseTrigger || false;

  this.callback = function(frequency, cmRatio, index, attack, decay, sustain, release, attackLevel, sustainLevel, releaseTrigger, glide, amp, channels, pan) {
    var env, val, mod
        
    if(glide >= 1) glide = .9999;
    frequency = lag(frequency, 1-glide, glide);
    
    if( useADSR ) {
      env = envelope( attack, decay, sustain, release, attackLevel, sustainLevel, releaseTrigger );
      if( releaseTrigger ) {
        obj.releaseTrigger = 0
      }

      if( envstate() < 4 ) {
        mod = modulator(frequency * cmRatio, frequency * index) * env;
  			val = carrier( frequency + mod, 1 ) * env * amp;
    
  			return channels === 1 ? val : panner(val, pan, out);
      }else{
  		  val = out[0] = out[1] = 0;
        return channels === 1 ? val : out
      }
    }else{
      if( envstate() < 2 ) {
  			env = envelope(attack, decay);
  			mod = modulator(frequency * cmRatio, frequency * index) * env;
  			val = carrier( frequency + mod, 1 ) * env * amp;

        //if( phase++ % 44105 === 0 ) console.log( panner(val, pan, out) channels )
  			return channels === 1 ? val : panner(val, pan, out);
      }else{
  		  val = out[0] = out[1] = 0;
        return channels === 1 ? val : out;
      }
    }
	};
  
  this.init();
  this.oscillatorInit();
	this.processProperties(arguments);
};
Gibberish.FMSynth.prototype = Gibberish._synth;
/**#Gibberish.PolyFM - Synth
A polyphonic version of [FMSynth](javascript:displayDocs('Gibberish.FMSynth'\)). There are two additional properties for the polyphonic version of the synth. The polyphonic version consists of multiple FMSynths being fed into a single [Bus](javascript:displayDocs('Gibberish.Bus'\)) object.
  
## Example Usage ##
`Gibberish.init();  
a = new Gibberish.PolyFM({ cmRatio:5, index:3, attack:88200, decay:88200 }).connect();  
a.note(880);  
a.note(1320);  
`  
## Constructor   
One important property to pass to the constructor is the maxVoices property, which defaults to 5. This controls how many voices are allocated to the synth and cannot be changed after initialization.  
  
**param** *properties*: Object. A dictionary of property values (see below) to set for the synth on initialization.
- - - -
**/
/**###Gibberish.PolyFM.children : property  
Array. Read-only. An array holding all of the child FMSynth objects.
**/
/**###Gibberish.PolyFM.maxVoices : property  
Number. The number of voices of polyphony the synth has. May only be set in initialization properties passed to constrcutor.
**/


Gibberish.PolyFM = function() {
  this.__proto__ = new Gibberish.Bus2();
  
	Gibberish.extend(this, {
    name:     "polyfm",
		maxVoices:		5,
		voiceCount:		0,
    children: [],
    frequencies: [],
    _frequency: 0,
    
    polyProperties : {
      glide:		 0,
      attack: 22050,
      decay:  22050,
      index:  5,
      cmRatio:2,
    },
/**###Gibberish.PolyFM.note : method  
Generate an enveloped note at the provided frequency using a simple voice allocation system where if all children are active, the one active the longest cancels its current note and begins playing a new one.    
  
param **frequency** Number. The frequency for the carrier oscillator. The modulator frequency will be calculated automatically from this value in conjunction with the synth's  
param **amp** Number. Optional. The volume to use.  
**/
    note : function(_frequency, amp) {
      var lastNoteIndex = this.frequencies.indexOf( _frequency ),
          idx = lastNoteIndex > -1 ? lastNoteIndex : this.voiceCount++,
          synth = this.children[ idx ];
      
      synth.note(_frequency, amp);
      
      if( lastNoteIndex === -1) {
        this.frequencies[ idx ] = _frequency;
        this._frequency = _frequency
        if(this.voiceCount >= this.maxVoices) this.voiceCount = 0;
      }else{
        delete this.frequencies[ idx ]
      }
    },
    
    initVoices : function() {
    	for(var i = 0; i < this.maxVoices; i++) {
    		var props = {
    			attack: 	this.attack,
    			decay:		this.decay,
    			cmRatio:	this.cmRatio,
    			index:		this.index,
          channels: 2,
          useADSR : this.useADSR || false,      
          requireReleaseTrigger: this.requireReleaseTrigger || false,
    			amp: 		  1,
    		};

    		var synth = new Gibberish.FMSynth(props);
    		synth.connect(this);

    		this.children.push(synth);
    	}
    },
	}); 
     
  this.amp = 1 / this.maxVoices;
    
  this.children = [];
  
  if(typeof arguments[0] === 'object') {
    this.maxVoices = arguments[0].maxVoices ? arguments[0].maxVoices : this.maxVoices
    this.useADSR = typeof arguments[0].useADSR !== 'undefined' ? arguments[ 0 ].useADSR : false    
    this.requireReleaseTrigger = typeof arguments[0].requireReleaseTrigger !== 'undefined' ? arguments[ 0 ].requireReleaseTrigger : false    
  }
  
  Gibberish.polyInit(this);
  this.initVoices()
  
	this.processProperties(arguments);
  Gibberish._synth.oscillatorInit.call(this);
};
// this file is dependent on oscillators.js

/**#Gibberish.Sampler - Oscillator
Sample recording and playback.
  
## Example Usage##
`Gibberish.init();  
a = new Gibberish.Sampler({ file:'resources/snare.wav' }).connect();  
// wait until sample has downloaded  
a.note(2);  
a.note(1);  
a.note(-.5);  
b = new Gibberish.Sampler().connect();  
b.record(a, 88200); // record two seconds of a playing  
a.note(8);  
// wait a bit    
b.note(1);`
`
## Constructor
###syntax 1  
**param** *filepath*: String. A path to the audiofile to be opened by the sampler.  
###syntax 2    
**param** *properties*: Object. A dictionary of property values (see below) to set for the sampler on initialization.
- - - -
**/
/**###Gibberish.Sampler.pitch : property  
Number. The speed that the sample is played back at. A pitch of 1 means the sample plays forward at speed it was recorded at, a pitch of -4 means the sample plays backwards at 4 times the speed it was recorded at.
**/
/**###Gibberish.Sampler.amp : property  
Number. A linear value specifying relative amplitude, ostensibly from 0..1 but can be higher, or lower when used for modulation.
**/
/**###Gibberish.Sampler.playOnLoad : property  
Number. If this value is set to be non-zero, the sampler will trigger a note at the provided pitch as soon as the sample is downloaded. 
**/
/**###Gibberish.Sampler.isRecording : property  
Boolean. Tells the sample to record into it's buffer. This is handled automatically by the object; there is no need to manually set this property.
**/
/**###Gibberish.Sampler.isPlaying : property  
Number. 0..1. Tells the sample to record into it's buffer. This is handled automatically by the object; there is no need to manually set this property.
**/
/**###Gibberish.Sampler.input : property  
Object. The object the sampler is tapping into and recording.
**/
/**###Gibberish.Sampler.length : property  
Number. The length of the Sampler's buffer.
**/
/**###Gibberish.Sampler.start : property  
Number. When the Sampler's note method is called, sample playback begins at this sample.
**/
/**###Gibberish.Sampler.end : property  
Number. When the Sampler's note method is called, sample playback ends at this sample.
**/
/**###Gibberish.Sampler.loops : property  
Boolean. When true, sample playback loops continuously between the start and end property values.
**/
/**###Gibberish.Sampler.pan : property  
Number. -1..1. Position of the Sampler in the stereo spectrum.
**/

Gibberish.Sampler = function() {
	var phase = 1,
	    interpolate = Gibberish.interpolate,
	    write = 0,
	    panner = Gibberish.makePanner(),
	    debug = 0 ,
	    shouldLoop = 0,
	    out = [0,0],
      buffer = null,
      bufferLength = 1,
      self = this;
      
	Gibberish.extend(this, {
		name: 			"sampler",
    
		file: 			null,
		isLoaded: 	false,
    playOnLoad :  0,
    buffers: {},
    properties : {
    	pitch:			  1,
  		amp:			    1,
  		isRecording: 	false,
  		isPlaying : 	true,
  		input:	 		  0,
  		length : 		  0,
      start :       0,
      end :         1,
      loops :       0,
      pan :         0,
    },
    
/**###Gibberish.Sampler.onload : method  
This is an event handler that is called when a sampler has finished loading an audio file.
Use this to trigger a set of events upon downloading the sample. 
  
param **buffer** Object. The decoded sampler buffers from the audio file
**/ 
		_onload : 		function(decoded) {
			buffer = decoded.channels[0]; 
			bufferLength = decoded.length;
					
			self.end = bufferLength;
      self.length = phase = bufferLength;
      self.isPlaying = true;
					
			//console.log("LOADED ", self.file, bufferLength);
			Gibberish.audioFiles[self.file] = buffer;
			self.buffers[ self.file ] = buffer;
      
      if(self.onload) self.onload();
      
      if(self.playOnLoad !== 0) self.note(self.playOnLoad);
      
			self.isLoaded = true;
		},
    
    switchBuffer: function( bufferID ) { // accepts either number or string
      if( typeof bufferID === 'string' ) {
        if( typeof self.buffers[ bufferID ] !== 'undefined' ) {
          buffer = self.buffers[ bufferID ]
          bufferLength = self.end = self.length = buffer.length
        }
      }else if( typeof bufferID === 'number' ){
        var keys = Object.keys( self.buffers )
        if( keys.length === 0 ) return 
        //console.log( "KEY", keys, keys[ bufferID ], bufferID )
        buffer = self.buffers[ keys[ bufferID ] ]
        bufferLength = self.end = self.length = buffer.length
      }
    },
    
    floatTo16BitPCM : function(output, offset, input){
      //console.log(output.length, offset, input.length )
      for (var i = 0; i < input.length - 1; i++, offset+=2){
        var s = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      }
    },
    encodeWAV : function(){
      //console.log("BUFFER LENGTH" + _buffer.length);
      var _buffer = this.getBuffer(),
          wavBuffer = new ArrayBuffer(44 + _buffer.length * 2),
          view = new DataView(wavBuffer),
          sampleRate = Gibberish.context.sampleRate;
      
      function writeString(view, offset, string){
        for (var i = 0; i < string.length; i++){
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      }

      /* RIFF identifier */
      writeString(view, 0, 'RIFF');
      /* file length */
      view.setUint32(4, 32 + _buffer.length * 2, true);
      /* RIFF type */
      writeString(view, 8, 'WAVE');
      /* format chunk identifier */
      writeString(view, 12, 'fmt ');
      /* format chunk length */
      view.setUint32(16, 16, true);
      /* sample format (raw) */
      view.setUint16(20, 1, true);
      /* channel count */
      view.setUint16(22, 1, true);
      /* sample rate */
      view.setUint32(24, sampleRate, true);
      /* byte rate (sample rate * block align) */
      view.setUint32(28, sampleRate * 4, true);
      /* block align (channel count * bytes per sample) */
      view.setUint16(32, 2, true);
      /* bits per sample */
      view.setUint16(34, 16, true);
      /* data chunk identifier */
      writeString(view, 36, 'data');
      /* data chunk length */
      view.setUint32(40, _buffer.length * 2, true);

      this.floatTo16BitPCM(view, 44, _buffer);

      return view;
    },
/**###Gibberish.Sampler.download : method  
Download the sampler buffer as a .wav file. In conjunction with the record method, this enables the Sampler
to record and downlaod Gibberish sessions.
**/  
    download : function() {
      var blob = this.encodeWAV();
      var audioBlob = new Blob( [ blob ] );

      var url =  window.webkitURL.createObjectURL( audioBlob );
      var link = window.document.createElement('a');
      link.href = url;
      link.download = 'output.wav';
      
      var click = document.createEvent("Event");
      click.initEvent("click", true, true);
      
      link.dispatchEvent(click);
    },

/**###Gibberish.Sampler.note : method  
Trigger playback of the samplers buffer
  
param **pitch** Number. The speed the sample is played back at.  
param **amp** Number. Optional. The volume to use.
**/    
		note: function(pitch, amp) {
      
      switch( typeof pitch ) {
        case 'number' :
          this.pitch = pitch
          break;
        case 'function' :
          this.pitch = pitch()
          break;
        case 'object' :
          if( Array.isArray(pitch) ) {
            this.pitch = pitch[ 0 ]
          }
          break;
      }
      // if(typeof this.pitch === 'number' || typeof this.pitch === 'function' ){
      //   this.pitch = pitch;
      // }else if(typeof this.pitch === 'object'){
      //   this.pitch[0] = pitch;
      //   Gibberish.dirty(this);
      // }
      
			if(typeof amp === 'number') this.amp = amp;
					
			if(this.function !== null) {
				this.isPlaying = true;	// needed to allow playback after recording
        
        var __pitch;// = typeof this.pitch === 'number' || typeof this.pitch === 'function' ? this.pitch : this.pitch[0];  // account for modulations
        
        switch( typeof this.pitch ) {
          case 'number' :
            __pitch = this.pitch
            break;
          case 'function' :
            __pitch = this.pitch()
            break;
          case 'object' :
            __pitch = Array.isArray( this.pitch ) ? this.pitch[ 0 ] : this.pitch
            if( typeof __pitch === 'function' ) __pitch = __pitch()
            break;
        }

        if( __pitch > 0 || typeof __pitch === 'object' ) {
          phase = this.start;
				}else{
          phase = this.end;
				}
        
        //this.pitch = __pitch;
			}
		},
/**###Gibberish.Sampler.record : method  
Record the output of a Gibberish ugen for a given amount of time
  
param **ugen** Object. The Gibberish ugen to be recorded.
param **recordLength** Number (in samples). How long to record for.
**/     
    // record : function(input, recordLength) {
    //       this.isRecording = true;
    //       
    //       var self = this;
    //       
    //       this.recorder = new Gibberish.Record(input, recordLength, function() {
    //         self.setBuffer( this.getBuffer() );
    //         self.end = bufferLength = self.getBuffer().length;
    //         self.setPhase( self.end )
    //         self.isRecording = false;
    //       })
    //       .record();
    //       
    //       return this;
    // },

/**###Gibberish.Sampler.getBuffer : method  
Returns a pointer to the Sampler's internal buffer.  
**/
    getBuffer : function() { return buffer; },
    setBuffer : function(b) { buffer = b },
    getPhase : function() { return phase },
    setPhase : function(p) { phase = p },
    getNumberOfBuffers: function() { return Object.keys( self.buffers ).length - 1 },
    
/**###Gibberish.Sampler.callback : method  
Return a single sample. It's a pretty lengthy method signature, they are all properties that have already been listed:  

_pitch, amp, isRecording, isPlaying, input, length, start, end, loops, pan
**/    
  	callback :function(_pitch, amp, isRecording, isPlaying, input, length, start, end, loops, pan) {
  		var val = 0;
  		phase += _pitch;				

  		if(phase < end && phase > 0) {
  			if(_pitch > 0) {
					val = buffer !== null && isPlaying ? interpolate(buffer, phase) : 0;
  			}else{
  				if(phase > start) {
  					val = buffer !== null && isPlaying ? interpolate(buffer, phase) : 0;
  				}else{
  					phase = loops ? end : phase;
  				}
  			}
  			return panner(val * amp, pan, out);
  		}
  		phase = loops && _pitch > 0 ? start : phase;
  		phase = loops && _pitch < 0 ? end : phase;
				
  		out[0] = out[1] = val;
  		return out;
  	},
	})
  .init()
  .oscillatorInit()
  .processProperties(arguments);

	if(typeof arguments[0] !== "undefined") {
		if(typeof arguments[0] === "string") {
			this.file = arguments[0];
      this.pitch = 0;
			//this.isPlaying = true;
		}else if(typeof arguments[0] === "object") {
			if(arguments[0].file) {
				this.file = arguments[0].file;
				//this.isPlaying = true;
			}
		}
	}
  
  //console.log(this);
  		
	/*var _end = 1;
	Object.defineProperty(that, "end", {
		get : function() { return _end; },
		set : function(val) {
			if(val > 1) val = 1;
			_end = val * that.bufferLength - 1;
			Gibberish.dirty(that);
		}
	});
	var _start = 0;
	Object.defineProperty(that, "start", {
		get : function() { return _start; },
		set : function(val) {
			if(val < 0) val = 0;
			_start = val * that.bufferLength - 1;
			Gibberish.dirty(that);
		}
	});
	var _loops = 0;
	Object.defineProperty(that, "loops", {
		get : function() { return _loops; },
		set : function(val) {
			_loops = val;
			that.function.setLoops(_loops);
		}
	});
  */
  
	if(typeof Gibberish.audioFiles[this.file] !== "undefined") {
		buffer =  Gibberish.audioFiles[this.file];
		this.end = this.bufferLength = buffer.length;
		this.buffers[ this.file ] = buffer;
    
    phase = this.bufferLength;
    Gibberish.dirty(this);
    
    if(this.onload) this.onload();
	}else if(this.file !== null){
    var xhr = new XMLHttpRequest(), initSound
        
    xhr.open( 'GET', this.file, true )
    xhr.responseType = 'arraybuffer'
    xhr.onload = function( e ) { initSound( this.response ) }
    xhr.send()
    
    function initSound( arrayBuffer ) {
      Gibberish.context.decodeAudioData(arrayBuffer, function(_buffer) {
        buffer = _buffer.getChannelData(0)
  			self.length = phase = self.end = bufferLength = buffer.length
        self.isPlaying = true;
  			self.buffers[ self.file ] = buffer;

  			//console.log("LOADED", self.file, bufferLength);
  			Gibberish.audioFiles[self.file] = buffer;
			
        if(self.onload) self.onload();
      
        if(self.playOnLoad !== 0) self.note( self.playOnLoad );
      
  			self.isLoaded = true;
      }, function(e) {
        console.log('Error decoding file', e);
      }); 
    }
	}else if(typeof this.buffer !== 'undefined' ) {
		this.isLoaded = true;
					
		buffer = this.buffer;
    this.end = this.bufferLength = buffer.length || 88200;
		    
		phase = this.bufferLength;
		if(arguments[0] && arguments[0].loops) {
			this.loops = 1;
		}
    Gibberish.dirty(this);
    
    if(this.onload) this.onload();
	}
};
Gibberish.Sampler.prototype = Gibberish._oscillator;
Gibberish.Sampler.prototype.record = function(input, recordLength) {
  this.isRecording = true;
  
  var self = this;
  
  this.recorder = new Gibberish.Record(input, recordLength, function() {
    self.setBuffer( this.getBuffer() );
    self.end = bufferLength = self.getBuffer().length;
    self.setPhase( self.end )
    self.isRecording = false;
  })
  .record();
  
  return this;
};
/**#Gibberish.MonoSynth - Synth
A three oscillator monosynth for bass and lead lines. You can set the octave and tuning offsets for oscillators 2 & 3. There is a 24db filter and an envelope controlling
both the amplitude and filter cutoff.
## Example Usage##
`  
t = new Gibberish.Mono({  
	cutoff:0,  
	filterMult:.5,  
	attack:_8,  
	decay:_8,  
	octave2:-1,  
	octave3:-1,  
	detune2:.01,  
	glide:_12,  
}).connect();  
t.note("C3");  `
## Constructors
  param **arguments** : Object. A dictionary of property values to set upon initialization. See the properties section and the example usage section for details.
**/
/**###Gibberish.MonoSynth.waveform : property
String. The primary oscillator to be used. Can currently be 'Sine', 'Square', 'Noise', 'Triangle' or 'Saw'. 
**/
/**###Gibberish.MonoSynth.attack : property
Integer. The length, in samples, of the attack of the amplitude envelope.
**/
/**###Gibberish.MonoSynth.decay : property
Integer. The length, in samples, of the decay of the amplitude envelope.
**/
/**###Gibberish.MonoSynth.amp : property
Float. The peak amplitude of the synth, usually between 0..1
**/
/**###Gibberish.MonoSynth.cutoff : property
Float. The frequency cutoff for the synth's filter. Range is 0..1.
**/
/**###Gibberish.MonoSynth.filterMult : property
Float. As the envelope on the synth progress, the filter cutoff will also change by this amount * the envelope amount.
**/
/**###Gibberish.MonoSynth.resonance : property
Float. The emphasis placed on the filters cutoff frequency. 0..50, however, GOING OVER 5 IS DANGEROUS TO YOUR EARS (ok, maybe 6 is all right...)
**/
/**###Gibberish.MonoSynth.octave2 : property
Integer. The octave difference between oscillator 1 and oscillator 2. Can be positive (higher osc2) or negative (lower osc 2) or 0 (same octave).
**/
/**###Gibberish.MonoSynth.detune2 : property
Float. The amount, from -1..1, the oscillator 2 is detuned. A value of -.5 means osc2 is half an octave lower than osc1. A value of .01 means osc2 is .01 octaves higher than osc1.
**/
/**###Gibberish.MonoSynth.octave3 : property
Integer. The octave difference between oscillator 1 and oscillator 3. Can be positive (higher osc3) or negative (lower osc 3) or 0 (same octave).
**/
/**###Gibberish.MonoSynth.detune3 : property
Float. The amount, from -1..1, the oscillator 3 is detuned. A value of -.5 means osc3 is half an octave lower than osc1. A value of .01 means osc3 is .01 octaves higher than osc1.
**/
/**###Gibberish.MonoSynth.glide : property
Integer. The length in time, in samples, to slide in pitch from one note to the next.
**/
Gibberish.MonoSynth = function() {  
	Gibberish.extend(this, { 
    name:       'monosynth',
    
    properties: {
  		attack:			10000,
  		decay:			10000,
  		cutoff:			.2,
  		resonance:	2.5,
  		amp1:			  1,
  		amp2:			  1,
  		amp3:			  1,
  		filterMult:	.3,
  		isLowPass:	true,
      pulsewidth: .5,
  		amp:		    .6,
  		detune2:		.01,
  		detune3:		-.01,
  		octave2:		1,
  		octave3:		-1,
      glide:      0,
  		pan:			  0,
  		frequency:	0,
      channels:   2,
    },
    
		waveform:		"Saw3",
/**###Gibberish.MonoSynth.note : method
param **note or frequency** : String or Integer. You can pass a note name, such as "A#4", or a frequency value, such as 440.
param **amp** : Optional. Float. The volume of the note, usually between 0..1. The main amp property of the Synth will also affect note amplitude.
**/				
		note : function(_frequency, amp) {
      if(typeof amp !== 'undefined' && amp !== 0) this.amp = amp;
      
      if( amp !== 0 ) {
    		if(typeof this.frequency !== 'object'){
      
          this.frequency = _frequency;
        }else{
          this.frequency[0] = _frequency;
          Gibberish.dirty(this);
        }
        
  			if(envstate() > 0 ) _envelope.run();
      }
		},
  	_note : function(frequency, amp) {
  		if(typeof this.frequency !== 'object'){
        if( useADSR && frequency === lastFrequency && amp === 0) {
          this.releaseTrigger = 1;
          return;
        }
        if( amp !== 0 ) {
          this.frequency = lastFrequency = frequency;
        }
        this.releaseTrigger = 0;
      }else{
        if( amp !== 0 ) {
          this.frequency[0] = lastFrequency = frequency;
        }
        this.releaseTrigger = 0;
        Gibberish.dirty(this);
      }
					
  		if(typeof amp !== 'undefined' && amp !== 0) this.amp = amp;
	  
      if( amp !== 0 ) { _envelope.run(); }
  	},
	});
  
	var waveform = this.waveform;
	Object.defineProperty(this, "waveform", {
		get: function() { return waveform; },
		set: function(value) {
			if(waveform !== value) {
				waveform = value;
						
				osc1 = new Gibberish[value]().callback;
				osc2 = new Gibberish[value]().callback;
				osc3 = new Gibberish[value]().callback;
			}
		},
	});
  
	var _envelope = new Gibberish.AD(this.attack, this.decay),
      envstate  = _envelope.getState,
      envelope  = _envelope.callback,
      filter    = new Gibberish.Filter24().callback,
    	osc1      = new Gibberish[this.waveform](this.frequency,  this.amp1).callback,
    	osc2      = new Gibberish[this.waveform](this.frequency2, this.amp2).callback,
    	osc3      = new Gibberish[this.waveform](this.frequency3, this.amp3).callback,
      lag       = new Gibberish.OnePole().callback,      
    	panner    = Gibberish.makePanner(),
    	out       = [0,0];
    
  this.callback = function(attack, decay, cutoff, resonance, amp1, amp2, amp3, filterMult, isLowPass, pulsewidth, masterAmp, detune2, detune3, octave2, octave3, glide, pan, frequency, channels) {
		if(envstate() < 2) {
      if(glide >= 1) glide = .9999;
      frequency = lag(frequency, 1-glide, glide);
      
			var frequency2 = frequency;
			if(octave2 > 0) {
				for(var i = 0; i < octave2; i++) {
					frequency2 *= 2;
				}
			}else if(octave2 < 0) {
				for(var i = 0; i > octave2; i--) {
					frequency2 /= 2;
				}
			}
					
			var frequency3 = frequency;
			if(octave3 > 0) {
				for(var i = 0; i < octave3; i++) {
					frequency3 *= 2;
				}
			}else if(octave3 < 0) {
				for(var i = 0; i > octave3; i--) {
					frequency3 /= 2;
				}
			}
				
			frequency2 += detune2 > 0 ? ((frequency * 2) - frequency) * detune2 : (frequency - (frequency / 2)) * detune2;
			frequency3 += detune3 > 0 ? ((frequency * 2) - frequency) * detune3 : (frequency - (frequency / 2)) * detune3;
							
			var oscValue = osc1(frequency, amp1, pulsewidth) + osc2(frequency2, amp2, pulsewidth) + osc3(frequency3, amp3, pulsewidth);
			var envResult = envelope(attack, decay);
			var val = filter( oscValue, cutoff + filterMult * envResult, resonance, isLowPass, 1) * envResult;
			val *= masterAmp;
			out[0] = out[1] = val;
			return channels === 1 ? out : panner(val, pan, out);
		}else{
			out[0] = out[1] = 0;
			return out;
		}
	}; 
  
  this.init();
  this.oscillatorInit();     
	this.processProperties(arguments);
};
Gibberish.MonoSynth.prototype = Gibberish._synth; 
/**#Gibberish.Binops - Miscellaneous
These objects create binary operations - mathematical operations taking two arguments - and create signal processing functions using them. They are primarily used for
modulation purposes. You can export the constructors for easier use similar to the [Time](javascript:displayDocs('Gibberish.Time'\)) constructors.

Add, Sub, Mul and Div can actually take as many arguments as you wish. For example, Add(1,2,3,4) will return an object that outputs 10. You can stack multiple oscillators this way as well.

##Example Usage   
`// This example creates a tremolo effect via amplitude modulation  
Gibberish.Binops.export(); // now all constructors are also part of the window object  
mod = new Gibberish.Sine(4, .25);  
sin = new Gibberish.Sine( 440, add( .5, mod ) ).connect();  
`
**/

Gibberish.Binops = {
/**###Gibberish.Binops.export : method  
Use this to export the constructor methods of Gibberish.Binops so that you can tersely refer to them.

param **target** object, default window. The object to export the Gibberish.Binops constructors into.
**/  
  export: function(target) {
    Gibberish.export("Binops", target || window);
  },
  
  operator : function () {
    var me = new Gibberish.ugen(),
        op = arguments[0],
        args = Array.prototype.slice.call(arguments, 1);
    
    me.name = 'op';
    me.properties = {};
    for(var i = 0; i < args.length; i++) { 
      me.properties[i] = args[i]; 
    }
    me.init.apply( me, args );
    
    me.codegen = function() {
      var keys, out = "( ";
      
      //if(typeof Gibberish.memo[this.symbol] !== 'undefined') { return Gibberish.memo[this.symbol]; }
      
      keys = Object.keys(this.properties);

      for(var i = 0; i < keys.length; i++) {
        var isObject = typeof this[i] === 'object';
        
        var shouldPush = false;
        if(isObject) {
          //if(!Gibberish.memo[ this[i].symbol ]) {
          //  shouldPush = true;
            out += this[i].codegen();
            //}else{
          //  out += Gibberish.memo[ this[i].symbol ];
          //}
        }else{
          out += this[i];
        }
        
        if(i < keys.length - 1) { out += " " + op + " "; }
        
        //if( isObject && shouldPush ) Gibberish.codeblock.push(this[i].codeblock); 
      }
      
      out += " )";
      
      this.codeblock = out;
      //Gibberish.memo[this.symbol] = out;
      
      return out;
    };
    
    me.valueOf = function() { return me.codegen() }
        
    //me.processProperties.apply( me, args );

    return me;
  },
  
/**###Gibberish.Binops.Add : method  
Create an object that sums all arguments at audio rate. The arguments may be unit generators, numbers, or any mix of the two.
**/
  Add : function() {
    var args = Array.prototype.slice.call(arguments, 0);
    args.unshift('+');
    
    return Gibberish.Binops.operator.apply(null, args);
  },

/**###Gibberish.Binops.Sub : method  
Create an object that starts with the first argument and subtracts all subsequent arguments at audio rate. The arguments may be unit generators, numbers, or any mix of the two.
**/
  Sub : function() {
    var args = Array.prototype.slice.call(arguments, 0);
    args.unshift('-');
    
    return Gibberish.Binops.operator.apply(null, args);
  },

/**###Gibberish.Binops.Mul : method  
Create an object that calculates the product of all arguments at audio rate. The arguments may be unit generators, numbers, or any mix of the two.
**/
  Mul : function() {
    var args = Array.prototype.slice.call(arguments, 0);
    args.unshift('*');
    
    return Gibberish.Binops.operator.apply(null, args);
  },

/**###Gibberish.Binops.Div : method  
Create an object that takes the first argument and divides it by all subsequent arguments at audio rate. The arguments may be unit generators, numbers, or any mix of the two.
**/
  Div : function() {
    var args = Array.prototype.slice.call(arguments, 0);
    args.unshift('/');
    
    return Gibberish.Binops.operator.apply(null, args);
  },

/**###Gibberish.Binops.Mod : method  
Create an object that takes the divides the first argument by the second and returns the remainder at audio rate. The arguments may be unit generators, numbers, or any mix of the two.
**/  
  Mod : function() {
    var args = Array.prototype.slice.call(arguments, 0);
    args.unshift('%');
    
    return Gibberish.Binops.operator.apply(null, args);

  },

/**###Gibberish.Binops.Abs : method  
Create an object that returns the absolute value of the (single) argument. The argument may be a unit generator or number.
**/  
  Abs : function() {
    var args = Array.prototype.slice.call(arguments, 0),
    me = {
      name : 'abs',
      properties : {},
      callback : Math.abs.bind( me ),
    };
    me.__proto__ = new Gibberish.ugen();
    me.properties[0] = args[0];
    me.init();

    return me;
  },
/**###Gibberish.Binops.Sqrt : method  
Create an object that returns the square root of the (single) argument. The argument may be a unit generator or number.
**/    
  Sqrt : function() {
    var args = Array.prototype.slice.call(arguments, 0),
    me = {
      name : 'sqrt',
      properties : {},
      callback : Math.sqrt.bind(me),
    };
    me.__proto__ = new Gibberish.ugen();    
    me.properties[i] = arguments[0];
    me.init();

    return me;
  },

/**###Gibberish.Binops.Pow : method  
Create an object that returns the first argument raised to the power of the second argument. The arguments may be a unit generators or numbers.
**/      
  Pow : function() {
    var args = Array.prototype.slice.call(arguments, 0),
    me = {
      name : 'pow',
      properties : {},
      callback : Math.pow.bind(me),
    };
    me.__proto__ = new Gibberish.ugen();
  
    for(var i = 0; i < args.length; i++) { me.properties[i] = args[i]; }
    me.init();
    
    console.log( me.callback )
    return me;
  },
  
  Clamp : function() {
    var args = Array.prototype.slice.call(arguments, 0),
    me = {
      name : 'clamp',
      properties : { input:0, min:0, max:1 },
      callback : function( input, min, max ) {
        if( input < min ) {
          input = min
        }else if( input > max ) {
          input = max
        }
        return input
      },
    };
    me.__proto__ = new Gibberish.ugen();

    me.init();
    me.processProperties( args );

    return me;
  },
  
  Merge : function() {
    var args = Array.prototype.slice.call(arguments, 0),
    me = {
      name : 'merge',
      properties : {},
      callback : function(a) {
        return a[0] + a[1];
      },
    };
    me.__proto__ = new Gibberish.ugen();
  
    for(var i = 0; i < args.length; i++) {
      me.properties[i] = args[i];
    }
    me.init();

    return me;
  },
            
  Map : function( prop, _outputMin, _outputMax, _inputMin, _inputMax, _curve, _wrap) {
    var pow = Math.pow,
    LINEAR = 0,
    LOGARITHMIC = 1,
    base = 0,
    phase = 0,
    _value = 0,
    me = {
      name : 'map',
      properties : { input:prop, outputMin:_outputMin, outputMax:_outputMax, inputMin:_inputMin, inputMax:_inputMax, curve:_curve || LINEAR, wrap: _wrap || false },
      callback : function( v, v1Min, v1Max, v2Min, v2Max, curve, wrap ) {
        var range1 = v1Max-v1Min,
            range2 = v2Max - v2Min,
            percent = (v - v2Min) / range2,
            val 
        
        if( percent > 1 ) {
          percent = wrap ? percent % 1 : 1
        }else if( percent < 0 ) {
          percent = wrap ? 1 + (percent % 1) : 0
        }
        
        val = curve === 0 ? v1Min + ( percent * range1 ) : v1Min + pow( percent, 1.5 ) * range1
        
        _value = val
        // if(phase++ % 22050 === 0 ) console.log( _value, percent, v )
        return val
      },
      // map_22(v_28, 0, 255, -1, 1, 0, false);
      getValue: function() { return _value },
      invert: function() {
        var tmp = me.outputMin
        me.outputMin = me.outputMax
        me.outputMax = tmp
      }
    }
  
    me.__proto__ = new Gibberish.ugen()
  
    me.init()

    return me
  },
};
/**#Gibberish.Time - Miscellaneous
This object is used to simplify timing in Gibberish. It contains an export function to place its methods in another object (like window)
so that you can code more tersely. The methods of the Time object translate ms, seconds and beats into samples. The default bpm is 120.

##Example Usage   
`Gibberish.Time.export(); // now all methods are also part of the window object
a = new Gibberish.Sine(440).connect();  
b = new Gibberish.Sequencer({ target:a, key:'frequency', durations:[ seconds(1), ms(500), beats( .5 ) ], values:[220,440,880] }).start()  
`
**/

/**###Gibberish.Time.bpm : property  
Number. Default 120. The beats per minute setting used whenever a call to the beats method is made.
**/

/**###Gibberish.Time.export : method  
Use this to export the methods of Gibberish.Time so that you can tersely refer to them.

param **target** object, default window. The object to export the Gibberish.Time methods into.
**/  

/**###Gibberish.Time.ms : method  
Convert the parameter from milliseconds to samples.

param **ms** number. The number of milliseconds to convert.
**/  

/**###Gibberish.Time.seconds : method  
Convert the parameter from seconds to samples.

param **seconds** number. The number of seconds to convert.
**/  

/**###Gibberish.Time.beats : method  
Return a function that converts the parameter from beats to samples. This method uses the bpm property of the Gibberish.Time object to determine the duration of a sample.
You can use the function returned by this method in a Sequencer; if Gibberish.Time.bpm is changed before the function is executed the function will use the updated value.

param **seconds** number. The number of seconds to convert.
**/  

Gibberish.Time = {
  bpm: 120,
  
  export: function(target) {
    Gibberish.export("Time", target || window);
  },
  
  ms : function(val) {
    return val * Gibberish.context.sampleRate / 1000;
  },
  
  seconds : function(val) {
    return val * Gibberish.context.sampleRate;
  },
  
  beats : function(val) {
    return function() { 
      var samplesPerBeat = Gibberish.context.sampleRate / ( Gibberish.Time.bpm / 60 ) ;
      return samplesPerBeat * val ;
    }
  },
};
/**#Gibberish.Sequencer - Miscellaneous
A sample-accurate sequencer that can sequence changes to properties, method calls or anonymous function calls.
  
## Example Usage##
`Gibberish.init();  
a = new Gibberish.Synth({ attack:44, decay:44100 }).connect();  
b = new Gibberish.Sequencer({ target:a, key:'note', durations:[11025, 22050], values:[440, 880] }).start()
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the sequencer on initialization.
- - - -
**/
/**###Gibberish.Sequencer.target : property  
Object. An object for the sequencer to control. May be null if you are sequencing anonymous functions.
**/
/**###Gibberish.Sequencer.key : property  
String. The name of the method or property you would like to sequnce on the Sequencer's target object.
**/
/**###Gibberish.Sequencer.durations : property  
Array. The number of samples between each advancement of the Sequencer. Once the Sequencer arrives at the end of this list, it loops back to the beginning
**/
/**###Gibberish.Sequencer.keysAndValues : property  
Object. A dictionary holding a set of values to be sequenced. The keys of the dictionary determine which methods and properties to sequence on the Sequencer's target object and
each key has an array of values representing the sequence for that key.
  
`Gibberish.init();  
a = new Gibberish.Synth({ attack:44, decay:44100 }).connect();  
b = new Gibberish.Sequencer({ target:a, durations:[11025, 22050], keysAndValues:{ 'note':[440,880], 'amp':[.2,.4] } }).start()
`
**/

Gibberish.Sequencer2 = function() {
  var that = this,
      phase = 0;
  
  Gibberish.extend(this, {
    target        : null,
    key           : null,
    values        : null,
    valuesIndex   : 0,
    durations     : null,
    durationsIndex: 0,
    nextTime      : 0,
    playOnce      : false,
    repeatCount   : 0,
    repeatTarget  : null,
    isConnected   : true,
    keysAndValues : null,
    counts        : {},
    properties    : { rate: 1, isRunning:false, nextTime:0 },
    offset        : 0,
    name          : 'seq',
    
    callback : function(rate, isRunning, nextTime) {
      if(isRunning) {
        if(phase >= nextTime) {
          if(that.values !== null) {
            if(that.target) {
              var val = that.values[ that.valuesIndex++ ];
              
              if(typeof val === 'function') { val = val(); }
              
              if(typeof that.target[that.key] === 'function') {
                that.target[that.key]( val );
              }else{
                that.target[that.key] = val;
              }
            }else{
              if(typeof that.values[ that.valuesIndex ] === 'function') {
                that.values[ that.valuesIndex++ ]();
              }
            }
            if(that.valuesIndex >= that.values.length) that.valuesIndex = 0;
          }else if(that.keysAndValues !== null) {
            for(var key in that.keysAndValues) {
              var index = that.counts[key]++;
              var val = that.keysAndValues[key][index];
              
              if(typeof val === 'function') { val = val(); }
              
              if(typeof that.target[key] === 'function') {
                that.target[key]( val );
              }else{
                that.target[key] = val;
              }
              if(that.counts[key] >= that.keysAndValues[key].length) {
                that.counts[key] = 0;
              }
              if( that.chose ) that.chose( key, index )
            }
          }else if(typeof that.target[that.key] === 'function') {
            that.target[that.key]();
          }
          
          phase -= nextTime;
        
          if(Array.isArray(that.durations)) {
            var next = that.durations[ that.durationsIndex++ ];
            that.nextTime = typeof next === 'function' ? next() : next;
            if( that.chose ) that.chose( 'durations', that.durationsIndex - 1 )
            if( that.durationsIndex >= that.durations.length) {
              that.durationsIndex = 0;
            }
          }else{
            var next = that.durations;
            that.nextTime = typeof next === 'function' ? next() : next;
          }
          
          if(that.repeatTarget) {
            that.repeatCount++;
            if(that.repeatCount === that.repeatTarget) {
              that.isRunning = false;
              that.repeatCount = 0;
            }
          }
          
          return 0;
        }
      
        phase += rate; //that.rate;
      }
      return 0;
    },
    
/**###Gibberish.Sequencer.start : method  
Start the sequencer running.

param **shouldKeepOffset** boolean, default false. If true, the phase of the sequencer will not be reset when calling the start method.
**/     
    start : function(shouldKeepOffset) {
      if(!shouldKeepOffset) {
        phase = 0;
      }
      
      this.isRunning = true;
      return this;
    },

/**###Gibberish.Sequencer.stop : method  
Stop the sequencer.
**/     
    stop: function() {
      this.isRunning = false;
      return this;
    },
    
/**###Gibberish.Sequencer.repeat : method  
Play the sequencer a certain number of times and then stop it.

param **timesToRepeat** number. The number of times to repeat the sequence.
**/        
    repeat : function(times) {
      this.repeatTarget = times;
      return this;
    },
    
    shuffle : function() {
      for( key in this.keysAndValues ) {
        this.shuffleArray( this.keysAndValues[ key ] )
      }
    },
    
    shuffleArray : function( arr ) {
  		for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
    },
/**###Gibberish.Sequencer.disconnect : method  
Each sequencer object has a tick method that is called once per sample. Use the disconnect method to stop the tick method from being called.
**/     
    /*disconnect : function() {
      var idx = Gibberish.sequencers.indexOf( this );
      Gibberish.sequencers.splice( idx, 1 );
      this.isConnected = false;
    },*/
/**###Gibberish.Sequencer.connect : method  
Each sequencer object has a tick method that is called once per sample. Use the connect method to start calling the tick method. Note that the connect
method is called automatically when the sequencer is first created; you should only need to call it again if you call the disconnect method at some point.
**/    
    /*connect : function() {
      if( Gibberish.sequencers.indexOf( this ) === -1 ) {
        Gibberish.sequencers.push( this );
      }
      Gibberish.dirty( this )
    },*/
  });
  
  this.init( arguments );
  this.processProperties( arguments );
  
  for(var key in this.keysAndValues) {
    this.counts[key] = 0;
  }
  
  this.oscillatorInit();
  
  phase += this.offset
  
  this.connect();
};
Gibberish.Sequencer2.prototype = Gibberish._oscillator
/**#Gibberish.Sequencer - Miscellaneous
A sample-accurate sequencer that can sequence changes to properties, method calls or anonymous function calls.
  
## Example Usage##
`Gibberish.init();  
a = new Gibberish.Synth({ attack:44, decay:44100 }).connect();  
b = new Gibberish.Sequencer({ target:a, key:'note', durations:[11025, 22050], values:[440, 880] }).start()
`  
## Constructor   
**param** *properties*: Object. A dictionary of property values (see below) to set for the sequencer on initialization.
- - - -
**/
/**###Gibberish.Sequencer.target : property  
Object. An object for the sequencer to control. May be null if you are sequencing anonymous functions.
**/
/**###Gibberish.Sequencer.key : property  
String. The name of the method or property you would like to sequnce on the Sequencer's target object.
**/
/**###Gibberish.Sequencer.durations : property  
Array. The number of samples between each advancement of the Sequencer. Once the Sequencer arrives at the end of this list, it loops back to the beginning
**/
/**###Gibberish.Sequencer.keysAndValues : property  
Object. A dictionary holding a set of values to be sequenced. The keys of the dictionary determine which methods and properties to sequence on the Sequencer's target object and
each key has an array of values representing the sequence for that key.
  
`Gibberish.init();  
a = new Gibberish.Synth({ attack:44, decay:44100 }).connect();  
b = new Gibberish.Sequencer({ target:a, durations:[11025, 22050], keysAndValues:{ 'note':[440,880], 'amp':[.2,.4] } }).start()
`
**/

Gibberish.Sequencer = function() {  
  Gibberish.extend(this, {
    target        : null,
    key           : null,
    values        : null,
    valuesIndex   : 0,
    durations     : null,
    durationsIndex: 0,
    nextTime      : 0,
    phase         : 0,
    isRunning     : false,
    playOnce      : false,
    repeatCount   : 0,
    repeatTarget  : null,
    isConnected   : true,
    keysAndValues : null,
    counts        : {},
    offset        : 0,
    name          : 'seq',
    
    tick : function() {
      if(this.isRunning) {
        if(this.phase >= this.nextTime) {
          if(this.values !== null) {
            if(this.target) {
              var val = this.values[ this.valuesIndex++ ];
              
              if(typeof val === 'function') { 
                try {
                  val = val(); 
                }catch(e) {
                  console.error('ERROR: Can\'t execute function triggered by Sequencer:\n' + val.toString() )
                  this.values.splice( this.valuesIndex - 1, 1)
                  this.valuesIndex--;
                }
              }
              
              if(typeof this.target[this.key] === 'function') {
                this.target[this.key]( val );
              }else{
                this.target[this.key] = val;
              }
            }else{
              if(typeof this.values[ this.valuesIndex ] === 'function') {
                try {
                  this.values[ this.valuesIndex++ ]();
                }catch(e) {
                  console.error('ERROR: Can\'t execute function triggered by Sequencer:\n' + this.values[ this.valuesIndex - 1 ].toString() )
                  this.values.splice( this.valuesIndex - 1, 1)
                  this.valuesIndex--;
                }
              }
            }
            if(this.valuesIndex >= this.values.length) this.valuesIndex = 0;
          }else if(this.keysAndValues !== null) {
            for(var key in this.keysAndValues) {
              var index = typeof this.keysAndValues[ key ].pick === 'function' ? this.keysAndValues[ key ].pick() : this.counts[key]++;
              var val = this.keysAndValues[key][index];
              
              if(typeof val === 'function') { 
                try {
                  val = val(); 
                }catch(e) {
                  console.error('ERROR: Can\'t execute function triggered by Sequencer:\n' + val.toString() )
                  this.keysAndValues[key].splice( index, 1)
                  if( typeof this.keysAndValues[ key ].pick !== 'function' ) {
                    this.counts[key]--;
                  }
                }
              }
              
              if(typeof this.target[key] === 'function') {
                this.target[key]( val );
              }else{
                this.target[key] = val;
              }
              if(this.counts[key] >= this.keysAndValues[key].length) {
                this.counts[key] = 0;
              }
            }
          }else if(typeof this.target[this.key] === 'function') {
            this.target[this.key]();
          }
          
          this.phase -= this.nextTime;
        
          if(Array.isArray(this.durations)) {
            var next = typeof this.durations.pick === 'function' ? this.durations[ this.durations.pick() ] : this.durations[ this.durationsIndex++ ];
            this.nextTime = typeof next === 'function' ? next() : next;
            if( this.durationsIndex >= this.durations.length) {
              this.durationsIndex = 0;
            }
          }else{
            var next = this.durations;
            this.nextTime = typeof next === 'function' ? next() : next;
          }
          
          if(this.repeatTarget) {
            this.repeatCount++;
            if(this.repeatCount === this.repeatTarget) {
              this.isRunning = false;
              this.repeatCount = 0;
            }
          }
          
          return;
        }
      
        this.phase++
      }
    },

/**###Gibberish.Sequencer.start : method  
Start the sequencer running.

param **shouldKeepOffset** boolean, default false. If true, the phase of the sequencer will not be reset when calling the start method.
**/     
    start : function(shouldKeepOffset) {
      if(!shouldKeepOffset) {
        this.phase = this.offset;
      }
      
      this.isRunning = true;
      return this;
    },

/**###Gibberish.Sequencer.stop : method  
Stop the sequencer.
**/     
    stop: function() {
      this.isRunning = false;
      return this;
    },
    
/**###Gibberish.Sequencer.repeat : method  
Play the sequencer a certain number of times and then stop it.

param **timesToRepeat** number. The number of times to repeat the sequence.
**/        
    repeat : function(times) {
      this.repeatTarget = times;
      return this;
    },
    
    shuffle : function() {
      for( key in this.keysAndValues ) {
        this.shuffleArray( this.keysAndValues[ key ] )
      }
    },
    
    shuffleArray : function( arr ) {
  		for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
    },

/**###Gibberish.Sequencer.disconnect : method  
Each sequencer object has a tick method that is called once per sample. Use the disconnect method to stop the tick method from being called.
**/     
    disconnect : function() {
      var idx = Gibberish.sequencers.indexOf( this );
      Gibberish.sequencers.splice( idx, 1 );
      this.isConnected = false;
    },
/**###Gibberish.Sequencer.connect : method  
Each sequencer object has a tick method that is called once per sample. Use the connect method to start calling the tick method. Note that the connect
method is called automatically when the sequencer is first created; you should only need to call it again if you call the disconnect method at some point.
**/    
    connect : function() {
      if( Gibberish.sequencers.indexOf( this ) === -1 ) {
        Gibberish.sequencers.push( this );
      }
      
      this.isConnected = true
      
      return this
    },
  });
  
  for(var key in arguments[0]) {
    this[key] = arguments[0][key];
  }
  
  for(var key in this.keysAndValues) {
    this.counts[key] = 0;
  }
  
  this.connect();
  
  this.phase += this.offset
  
  //this.init( arguments );
  //this.oscillatorInit();
  //this.processProperties( arguments );
};
Gibberish.Sequencer.prototype = Gibberish._oscillator
// TODO: must fix scale seq

/*
c = new Gibberish.Synth({ pan:-1 }).connect();
b = new Gibberish.Synth({ pan:1 }).connect(); 
a = new Gibberish.PolySeq({ 
  seqs:[
    { key:'note', target:b, values:[440,880], durations:22050 },
    { key:'note', target:c, values:[220,1320], durations:[11025, 22050, 5512.5] },
  ] 
}).start()
*/
Gibberish.PolySeq = function() {
  var that = this,
      phase = 0,
      sort = function(a,b) { if( a < b ) return -1; if( a > b ) return 1; return 0; } ;
  
  Gibberish.extend(this, {
    seqs          : [],
    timeline      : {},
    playOnce      : false,
    repeatCount   : 0,
    repeatTarget  : null,
    isConnected   : false,
    properties    : { rate: 1, isRunning:false, nextTime:0 },
    offset        : 0,
    autofire      : [],
    name          : 'polyseq',
    getPhase      : function() { return phase },
    add           : function( seq ) {
      seq.valuesIndex = seq.durationsIndex = 0
      that.seqs.push( seq )
      
      //console.log("PRIORITY", seq.priority )
      
      if( seq.durations === null ) {
        that.autofire.push( seq )
      }
      
      if( typeof that.timeline[ phase ] !== 'undefined' ) {
        if( seq.priority ) {
          that.timeline[ phase ].unshift( seq )
        }else{
          that.timeline[ phase ].push( seq )
        }
      }else{
        that.timeline[ phase ] = [ seq ]
      }
      
      // for Gibber... TODO: remove from Gibberish
      if( that.scale && (seq.key === 'frequency' || seq.key === 'note') ) {
        if( that.applyScale ) {
          that.applyScale()
        }
      }
      
      that.nextTime = phase
      seq.shouldStop = false
    },
    
    callback : function(rate, isRunning, nextTime) {
      var newNextTime;
      
      if(isRunning) {
        if(phase >= nextTime) {
          var seqs = that.timeline[ nextTime ],
              phaseDiff = phase - nextTime
              
          if( typeof seqs === 'undefined') return
          
          if( that.autofire.length ) seqs = seqs.concat( that.autofire )
          
          for( var j = 0; j < seqs.length; j++ ) {
            var seq = seqs[ j ]
            if( seq.shouldStop ) continue;

            var idx = seq.values.pick ? seq.values.pick() : seq.valuesIndex++ % seq.values.length,
                val = seq.values[ idx ];
    
            if(typeof val === 'function') { val = val(); } // will also call anonymous function
    
            if( seq.target ) {
              if(typeof seq.target[ seq.key ] === 'function') {
                seq.target[ seq.key ]( val );
              }else{
                seq.target[ seq.key ] = val;
              }
            }
            
            if( that.chose ) that.chose( seq.key, idx )
            
            if( seq.durations !== null ) { 
              if( Array.isArray( seq.durations ) ) {
                var idx = seq.durations.pick ? seq.durations.pick() : seq.durationsIndex++,
                    next = seq.durations[ idx ]

                newNextTime = typeof next === 'function' ? next() : next;
                if( seq.durationsIndex >= seq.durations.length ) {
                  seq.durationsIndex = 0;
                }
                if( that.chose ) that.chose( 'durations', idx )
              }else{
                var next = seq.durations;
                newNextTime = typeof next === 'function' ? next() : next;
              }
          
              var t;
            
              if( typeof Gibber !== 'undefined' ) {
                t = Gibber.Clock.time( newNextTime ) + phase // TODO: remove Gibber link... how?
              }else{
                t = newNextTime + phase
              }
            
              t -= phaseDiff
              newNextTime -= phaseDiff
            
              if( typeof that.timeline[ t ] === 'undefined' ) {
                that.timeline[ t ] = [ seq ]
              }else{
                if( seq.priority ) {
                  that.timeline[ t ].unshift( seq )
                }else{
                  that.timeline[ t ].push( seq )
                }
              }
            }
          }
          
          delete that.timeline[ nextTime ]
          
          var times = Object.keys( that.timeline ),
              timesLength = times.length;
          
          if( timesLength > 1 ) {
            for( var i = 0; i < timesLength; i++ ) {
              times[ i ] = parseFloat( times[i] )
            }
          
            times = times.sort( sort )
            that.nextTime = times[0]
          }else{
            that.nextTime = parseFloat( times[0] )
          }
          
          // if(that.repeatTarget) {
          //   that.repeatCount++;
          //   if(that.repeatCount === that.repeatTarget) {
          //     that.isRunning = false;
          //     that.repeatCount = 0;
          //   }
          // }  
        }
        
        // TODO: If you set the phase to 0, it will be lower than nextTime for many many samples in a row, causing it to quickly skip
        // through lots of key / value pairs.
        
        phase += rate;
      }
      return 0;
    },
  
    start : function(shouldKeepOffset, priority) {
      if(!shouldKeepOffset || ! this.offset ) {
        phase = 0;
        this.nextTime = 0;
        
        this.timeline = { 0:[] }
        for( var i = 0; i < this.seqs.length; i++ ) {
          var _seq = this.seqs[ i ]
    
          _seq.valuesIndex = _seq.durationsIndex = _seq.shouldStop = 0
    
          this.timeline[ 0 ].push( _seq )
        }
      }else{
        phase = 0;
        this.nextTime = this.offset;
        
        var ___key = ''+this.offset
        
        this.timeline = {}
        this.timeline[ ___key ] = []

        for( var i = 0; i < this.seqs.length; i++ ) {
          var _seq = this.seqs[ i ]
    
          _seq.valuesIndex = _seq.durationsIndex = _seq.shouldStop = 0
    
          this.timeline[ ___key ].push( _seq )
        }
      }
      
      if( !this.isConnected ) {
        this.connect( Gibberish.Master, priority )
        this.isConnected = true
      }
      
      this.isRunning = true;
      return this;
    },
    
    stop: function() {
      this.isRunning = false;
      
      if( this.isConnected ) {
        this.disconnect()
        this.isConnected = false
      }
      return this;
    },
       
    repeat : function(times) {
      this.repeatTarget = times;
      return this;
    },
    
    shuffle : function( seqName ) {
      if( typeof seqName !== 'undefined' ) {
        for( var i = 0; i < this.seqs.length; i++ ) {
          if( this.seqs[i].key === seqName ) {
            this.shuffleArray( this.seqs[i].values )
          }
        }
      }else{
        for( var i = 0; i < this.seqs.length; i++ ) {
          this.shuffleArray( this.seqs[i].values )
        }
      }
    },
    
    shuffleArray : function( arr ) {
  		for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
    },

  });
  
  this.init( arguments );
  this.processProperties( arguments );
  
  this.oscillatorInit();
};
Gibberish.PolySeq.prototype = Gibberish._oscillator
var _hasInput = false; // wait until requested to ask for permissions so annoying popup doesn't appear automatically

function createInput() {
  console.log("connecting audio input...");
  
  navigator.webkitGetUserMedia(
		{audio:true}, 
		function (stream) {
      console.log( 'audio input connected' )
	    Gibberish.mediaStreamSource = Gibberish.context.createMediaStreamSource( stream );
	    Gibberish.mediaStreamSource.connect( Gibberish.node );
			_hasInput = true;
		},
    function() { 
      console.log( 'error opening audio input')
    }
	)
}
/**#Gibberish.Input - Oscillator
Accept input from computer's line-in or microphone input. Use headphones and beware feedback! Reading the audio input is currently only supported by Google Chrome.

## Example Usage##
`
Gibberish.init();  
a = new Gibberish.Input()  
b = new Gibberish.Delay( a ).connect()  
- - - -
**/
/**###Gibberish.Input.amp : property  
Number. A gain multiplier for the input
**/

Gibberish.Input = function() {
  var out = [], phase = 0;
  
	if(!_hasInput) { 
		createInput(); 
	}
  
  this.type = this.name = 'input'
  
  this.fx = new Array2() 
  this.fx.parent = this
  
  this.properties = {
    input : 'input',
    amp : .5,  
    channels : 1,
  }
  
  this.callback = function(input, amp, channels) {
    if(channels === 1) {
      out = input * amp;
    }else {
      out[0] = input[0] * amp;
      out[1] = input[1] * amp;      
    }
    return out;
  }
  
  this.init( arguments )
  this.processProperties( arguments )
};
Gibberish.Input.prototype = new Gibberish.ugen();
Gibberish.Kick = function() {
  var trigger = false,
    	bpf = new Gibberish.SVF().callback,
    	lpf = new Gibberish.SVF().callback,
      _decay = .2,
      _tone = .8;
      
  Gibberish.extend(this, {
  	name:		"kick",
    properties:	{ pitch:50, __decay:20, __tone: 1000, amp:2, sr: Gibberish.context.sampleRate },
	
  	callback: function(pitch, decay, tone, amp, sr) {					
  		var out = trigger ? 60 : 0;
			
  		out = bpf( out, pitch, decay, 2, sr );
  		out = lpf( out, tone, .5, 0, sr );
		
  		out *= amp;
		
  		trigger = false;
		
  		return out;
  	},

  	note : function(p, d, t, amp) {
  		if(typeof p === 'number') this.pitch = p;
  		if(typeof d === 'number') this.decay = d;
  		if(typeof t === 'number') this.tone = t;
  		if(typeof amp === 'number') this.amp = amp;
		
      trigger = true;
  	},
  })
  .init()
  .oscillatorInit();
  
  Object.defineProperties(this, {
    decay :{
      get: function() { return _decay; },
      set: function(val) { _decay = val > 1 ? 1 : val; this.__decay = _decay * 100; }
    },
    tone :{
      get: function() { return _tone; },
      set: function(val) { _tone = val > 1 ? 1 : val; this.__tone = 220 + val * 1400;  }
    },
  });
  
  this.processProperties(arguments);
};
Gibberish.Kick.prototype = Gibberish._oscillator;

// congas are bridged t-oscillators like kick without the low-pass filter
Gibberish.Conga = function() {
  var trigger = false,
    	bpf = new Gibberish.SVF().callback,
      _decay = .5;
      
  Gibberish.extend(this, {
  	name:		"conga",
    properties:	{ pitch:190, /*__decay:50,*/ amp:2, sr:Gibberish.context.sampleRate },
	
  	callback: function(pitch, /*decay,*/ amp, sr) {					
  		var out = trigger ? 60 : 0;
			
  		out = bpf( out, pitch, 50, 2, sr );
		
  		out *= amp;
		
  		trigger = false;
		
  		return out;
  	},

  	note : function(p, amp) {
  		if(typeof p === 'number') this.pitch = p;
  		if(typeof amp === 'number') this.amp = amp;
		
      trigger = true;
  	},
  })
  .init()
  .oscillatorInit();

  // Object.defineProperties(this, {
  //   decay :{
  //     get: function() { return _decay; },
  //     set: function(val) { _decay = val > 1 ? 1 : val; this.__decay = _decay * 100; }
  //   }
  // });
  // 
  this.processProperties(arguments);
}
Gibberish.Conga.prototype = Gibberish._oscillator;

// clave are also bridged t-oscillators like kick without the low-pass filter
Gibberish.Clave = function() {
  var trigger = false,
    	_bpf = new Gibberish.SVF(),
      bpf = _bpf.callback,
      _decay = .5;
      
  Gibberish.extend(this, {
  	name:		"clave",
    properties:	{ pitch:2500, /*__decay:50,*/ amp:1, sr:Gibberish.context.sampleRate },
	
  	callback: function(pitch, /*decay,*/ amp, sr) {					
  		var out = trigger ? 2 : 0;
			
  		out = bpf( out, pitch, 5, 2, sr );
		
  		out *= amp;
		
  		trigger = false;
		
  		return out;
  	},

  	note : function(p, amp) {
  		if(typeof p === 'number') this.pitch = p;
  		if(typeof amp === 'number') this.amp = amp;
		
      trigger = true;
  	},
  })
  .init()
  .oscillatorInit();
  
  this.bpf = _bpf;
  // Object.defineProperties(this, {
  //   decay :{
  //     get: function() { return _decay; },
  //     set: function(val) { _decay = val > 1 ? 1 : val; this.__decay = _decay * 100; }
  //   }
  // });
  // 
  this.processProperties(arguments);
}
Gibberish.Clave.prototype = Gibberish._oscillator;

// tom is tbridge with lpf'd noise
Gibberish.Tom = function() {
  var trigger = false,
    	bpf = new Gibberish.SVF().callback,
    	lpf = new Gibberish.SVF().callback,
      _eg = new Gibberish.ExponentialDecay(),
      eg  = _eg.callback,
      rnd = Math.random,
      _decay = .2,
      _tone = .8;
      
  Gibberish.extend(this, {
  	name:		"tom",
    properties:	{ pitch:80, amp:.5, sr:Gibberish.context.sampleRate },
	
  	callback: function(pitch, amp, sr) {					
  		var out = trigger ? 60 : 0,
          noise;
			
  		out = bpf( out, pitch, 30, 2, sr );
      
      noise = rnd() * 16 - 8
		  noise = noise > 0 ? noise : 0;
      
      noise *= eg(.05, 11025);
      
  		noise = lpf( noise, 120, .5, 0, sr );
      
      out += noise;
  		out *= amp;
		
  		trigger = false;
		
  		return out;
  	},

  	note : function(p, amp) {
  		if(typeof p === 'number') this.pitch = p;
  		if(typeof amp === 'number') this.amp = amp;
		  
      _eg.trigger();
      trigger = true;
  	},
  })
  .init()
  .oscillatorInit();
  
  _eg.trigger(1)
  
  this.processProperties(arguments);
}
Gibberish.Tom.prototype = Gibberish._oscillator;

// http://www.soundonsound.com/sos/Sep02/articles/synthsecrets09.asp
Gibberish.Cowbell = function() {
  var _s1 = new Gibberish.Square(),
      _s2 = new Gibberish.Square(),
      s1 = _s1.callback,
      s2 = _s2.callback,                              

      _bpf = new Gibberish.SVF({ mode:2 }),
      bpf   = _bpf.callback,

      _eg   = new Gibberish.ExponentialDecay( .0025, 10500 ),
      eg    = _eg.callback;
  
  Gibberish.extend(this, {
  	name: "cowbell",
  	properties : { amp: 1, pitch: 560, bpfFreq:1000, bpfRez:3, decay:22050, decayCoeff:.0001, sr:Gibberish.context.sampleRate },
	
  	callback : function(amp, pitch, bpfFreq, bpfRez, decay, decayCoeff, sr) {
  		var val;
      
  		val =  s1( pitch, 1, 1, 0 );
  		val += s2( 845, 1, 1, 0 );
		
      val  = bpf(  val, bpfFreq, bpfRez, 2, sr );
      		
      val *= eg(decayCoeff, decay);
  
  		val *= amp;
		  
  		return val;
  	},
	
  	note : function(_decay, _decay2) {
      _eg.trigger()
  		if(_decay)
  			this.decay = _decay;
  	}
  })
  .init()
  .oscillatorInit()
  .processProperties(arguments);
  
  this.bpf = _bpf;
  this.eg = _eg;
  
  _eg.trigger(1);
};
Gibberish.Cowbell.prototype = Gibberish._oscillator;

Gibberish.Snare = function() {
  var bpf1      = new Gibberish.SVF().callback,
      bpf2      = new Gibberish.SVF().callback,
      noiseHPF  = new Gibberish.SVF().callback,
      _eg       = new Gibberish.ExponentialDecay( .0025, 11025 ),
      eg        = _eg.callback,            
      rnd       = Math.random,
      phase  = 11025,      
      out    = 0,
      envOut = 0;
      
  Gibberish.extend(this, {
  	name: "snare",
  	properties: { cutoff:1000, decay:11025, tune:0, snappy:.5, amp:1, sr:Gibberish.context.sampleRate },

  	callback: function(cutoff, decay, tune, snappy, amp, sr) {
  		var p1, p2, noise = 0, env = 0, out = 0;

  		env = eg(.0025, decay);
		
  		if(env > .005) {	
  			out = ( rnd() * 2 - 1 ) * env ;
  			out = noiseHPF( out, cutoff + tune * 1000, .5, 1, sr );
  			out *= snappy;
        
        // rectify as per instructions found here: http://ericarcher.net/devices/tr808-clone/
        out = out > 0 ? out : 0;
        
  			envOut = env;
			
  			p1 = bpf1( envOut, 180 * (tune + 1), 15, 2, sr );
  			p2 = bpf2( envOut, 330 * (tune + 1), 15, 2, sr );
		
  			out += p1; 
  			out += p2 * .8;
  			out *= amp;
  		}

  		return out;
  	},

  	note : function(t, amp, s, c) {
      if(typeof t === 'number')   this.tune = t;					      
  		if(typeof c === 'number')   this.cutoff = c;					
  		if(typeof s === 'number')   this.snappy = s; 
  		if(typeof amp === 'number') this.amp = amp;
		
  		_eg.trigger()
  	},
  })
  .init()
  .oscillatorInit()
  .processProperties(arguments);
  
  _eg.trigger(1);
}
Gibberish.Snare.prototype = Gibberish._oscillator;

Gibberish.Hat = function() {
  var _s1 = new Gibberish.Square(),
      _s2 = new Gibberish.Square(),
      _s3 = new Gibberish.Square(),
      _s4 = new Gibberish.Square(),
      _s5 = new Gibberish.Square(),
      _s6 = new Gibberish.Square(),
      s1 = _s1.callback,
      s2 = _s2.callback,
      s3 = _s3.callback,
      s4 = _s4.callback,
      s5 = _s5.callback,
      s6 = _s6.callback,                              
      //_bpf = new Gibberish.Biquad({ mode:'BP' }),
      _bpf = new Gibberish.SVF({ mode:2 }),
      bpf   = _bpf.callback,
      _hpf  = new Gibberish.Filter24(),
      hpf   = _hpf.callback,
      _eg   = new Gibberish.ExponentialDecay( .0025, 10500 ),
      eg    = _eg.callback,
      _eg2   = new Gibberish.ExponentialDecay( .1, 7500 ),
      eg2    = _eg2.callback;        
  
  Gibberish.extend(this, {
  	name: "hat",
  	properties : { amp: 1, pitch: 325, bpfFreq:7000, bpfRez:2, hpfFreq:.975, hpfRez:0, decay:3500, decay2:3000, sr:Gibberish.context.sampleRate },
	
  	callback : function(amp, pitch, bpfFreq, bpfRez, hpfFreq, hpfRez, decay, decay2, sr) {
  		var val;
      
  		val =  s1( pitch, 1, .5, 0 );
  		val += s2( pitch * 1.4471, .75, 1, 0 );
  		val += s3( pitch * 1.6170, 1, 1, 0 );
  		val += s4( pitch * 1.9265, 1, 1, 0 );
  		val += s5( pitch * 2.5028, 1, 1, 0 );
  		val += s6( pitch * 2.6637, .75, 1, 0 );
		
      val  = bpf(  val, bpfFreq, bpfRez, 2, sr );
      		
  		val  *= eg(.001, decay);
      
      // rectify as per instructions found here: http://ericarcher.net/devices/tr808-clone/
      // val = val > 0 ? val : 0;
        		
  		//sample, cutoff, resonance, isLowPass, channels
  		val 	= hpf(val, hpfFreq, hpfRez, 0, 1 );
  
  		val *= amp;
		  
  		return val;
  	},
	
  	note : function(_decay, _decay2) {
  		_eg.trigger()
  		_eg2.trigger()
  		if(_decay)
  			this.decay = _decay;
  		if(_decay2)
  			this.decay2 = _decay2;
		
  	}
  })
  .init()
  .oscillatorInit()
  .processProperties(arguments);
  
  this.bpf = _bpf;
  this.hpf = _hpf;
  
  _eg.trigger(1);
  _eg2.trigger(1);
};
Gibberish.Hat.prototype = Gibberish._oscillator;
