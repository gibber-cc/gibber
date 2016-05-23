###Knob

A virtual knob with a couple of different interaction modalities. Knobs are a type of [Widget][widget] and inherit its methods and properties.

Example:
```javascript
a = Knob({ centerZero: true })

b = Knob({ usesRotation:true })
```

#### Properties

* _centerZero_ : Boolean. Default : false. When true the knob functions like a pan knob typically found on an audio mixer, where the zero value is at the 12 o'clock position and the knob can be turned to the right or left. The graphics show the offset from the knobs 0 value.
* _useRotation_  : Boolean. Default : false. When true, the knob changes values as users drag around its perimeter. When false, the knob changes value based on vertical user movements.

#### Methods

See the [Widget][widget] prototype for relevant methods.

