###Keyboard

A piano-style keyboard that is a collection of buttons. Keyboard is a type of [Widget][widget] and inherits its methods and properties.

Example:
```javascript
fm = FM( 'brass' )
keys = Keyboard({ startoctave:4, endoctave:5 })

keys.target = fm
```

#### Properties
See the [Widget][widget] prototype for many other relevant properties.

* _target_  : Ugen. When assigned, the keyboard will send noteon / off messages to its target ugen.
* _startoctave_ : Int, constructor property only. Determines the starting octave of the keyboard's range. TODO: make dynamic.
* _endoctave_ : Int, constructor property only. Determines the ending octave of the keyboard's range. TODO: make dynamic.

#### Methods

See the [Widget][widget] prototype for relevant methods.

