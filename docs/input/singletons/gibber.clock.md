###Gibber.Clock

The clock controls Gibber's master tempo and meter.

Example:
```javascript
drums = EDrums('x*o*x*o-')

// half tempo
Clock.rate = .5

// gradually speed up to original tempo
Clock.rate = Line( .5,1,8 )

// change time signature
Clock.timeSignature = '3/4'
```

#### Properties

* _maxMeasures_ : Float. Default value is 44. When using any indicator of time in Gibber, a number below this value is measured in terms of measures; higher numbers are measured in samples. For example, if Gibber.Clock.maxMeasures is 20 and the attack parameter of a synth is set to 2, that synth will have a two measure attack. If it's set to 50 it will have a 50 sample attack.
* _rate_ : Float. Default value 1. Controls the rate at which time advances. Doubling this value means all events occur twice as quickly. All sequencers in Gibber use this value as a base point for determining their individual rates, hence, changing this will affect all sequencers relative to their individual `rate` property values.
* _timeSignature_ : String. Use this to change Gibber's time signature, which defaults to `4/4`. 
 
#### Methods

* _time_( Float:timeValue ): This method returns a duration measured in sampled. If the arguments is less than `Gibber.Clock.maxMeasures`, it returns the argument * the number of samples per measure. If the argument is greater, it simply returns the argument.
* _Time_( Float:timeValue ): Returns a function that returns a time value using the provided argument. This is primarily used in sequencing. 
* _beat_( Float:timeValue ): Returns the argument number of beats as a duration measured in samples.
* _Beat_( Float:timeValue ): Returns a function returning the argument number of beats as a duration measured in samples.