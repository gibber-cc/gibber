##Delay

Simple echo effect with variable delay time and feedback.

Example:
```javascript
a = Pluck().play( Rndi(100,1000), 1/4 )

d = Delay()

q = Seq({
  time: Rndi( ms(2), ms(500) ),
  durations:1/2,
  target: d 
})

a.fx.add( d )
```

#### Properties

* _time_ : Default range: { 50, 88200 }. The time between echoes, measured in samples. 
* _feedback_  : Default range: { 0, 1 }. How much output is fed back into the input of the delay. 

#### Methods

None worth mentioning.
