##Gibber

The main object of the library. 

Example:
```javascript
Gibber.init({ globalize: false })

sine = Gibber.Oscillators.Sine()

// half speed
Gibber.Clock.rate = .5
```

#### Properties

* _Clock_ : Object. Controls time and meter. See Gibber.Clock for details.
* _Audio_ : Object. The main synthesis library for Gibber is named *Gibberish*; this property wraps that library.
* _Master_ : Object. The master output bus for Gibber. Any FX placed on this bus will affect all sound coming out of Gibber. See the Bus reference for more detail.
* _Scale_ : Object. This determines the default root and mode used by Gibber's synthesis objects when sequencing. It can be overridden on individual ugen's by assigning them their own unique scale objects. See the Scale reference for details.
 
#### Methods

* _clear_(): This method removes all unit generators from the audio graph. It also resets the tempo to 120 BPM and the amplitude of the Master bus to 1.
* _log_( String: msg ): Print a message to Gibber's console.
* _init_( Object: options ): Start Gibber. The most important option is `globalize`. When `globalize` is set to false (as in the example at the top of this page) the constructors for Gibber's unit generators will not be placed in the global namespace. The default value for globalize is `true`.