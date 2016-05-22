##Add

A simple unit generator to add multiple values together on a per-sample basis, primarily for use in modulation. `Add` has a constructor that accepts two values.

Example:
```javascript
drums = EDrums('x*o*x*o-')

mod = Sine( 12, .5 )._ 
add = Add( .5, mod )

drums.amp = add
```

#### Properties

* _0_ : Float or Ugen. The first operand passed to the constructor.
* _1_ : Float or Ugen. The second operand passed to the constructor.