###Schizo

A buffer-shuffling / stuttering effect with reversing and pitch-shifting.

Example:
```javascript
d = XOX( 'x*o*x*o-' )

s = Schizo({ chance:.5, rate:ms(250), length:ms(1000) })

d.fx.add( s )

```


#### Properties

* _chance_ : Default range { 0, 1 }. The likelihood that stuttering will occur at given intervals.
* _rate_ : Default 11025. Measured in samples. How often Schizo randomly determines whether or not it should begin stuttering.
* _length_ : Default 22050. Measured in samples. The length of time that stuttered audio plays when stuttering is triggered.
* _reverseChance_ : Float { 0 , 1 }, default .5. The chance that a particular stutter will play in reverse.
* _pitchChance_ : Float { 0,1 }, default.5. The chance that a particular stutter will be repitched.
* _pitchMin_ : Float, default: .25. The lowest playback rate for repitched stuttering.
* _pitchMax_ : Float, default: 2. The highest playback rate for repitched stuttering.
* _wet_ : Float { 0,1 }, default 1. When shuffling, the amplitude of the stuttered audio.
* _dry_ : Float { 0,1 }, default 0. When shuffling, the amplitude of the un-stuttered audio.

#### Methods

None worth mentioning.
