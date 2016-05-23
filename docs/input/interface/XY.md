###XY
A multitouch XY controller with optional built-in physics. The XY widget acts as an
array of children, each one representing a X and a Y position. Thus to access the X
property of the first child (using a zero-index array), we use my\_xy\_widget[0].x.

Example:
```javascript
// map pitch and amplitude of two sine waves to XY control.

xy = XY({ numChildren:2 })
sine1 = Sine( xy[ 0 ].X, xy[ 0 ].Y )
sine2 = Sine( xy[ 1 ].X, xy[ 1 ].Y )
```

#### Properties
See the [Widget][widget] prototype for many other relevant properties.

* _value_  : Float. Default range: { 0, 1 }. Default: 0.

* _childWidth_ : Float. The size of the children, currently in pixels. TODO: use relative values when the panel is using relative sizes and positions.

* _usePhysics_ : Boolean. Default false. Whether or not the physics engine should be turned on.

* _friction_ : Float. Default .9. The amount of friction in the physics system. High values mean children will decelerate quicker.

* _maxVelocity_ Float. Default 10. The maximum velocity for each child.

* _detectCollisions_ : Boolean. Default false. When false, children bounce off one another.

#### Methods
See the [Widget][widget] prototype for relevant methods.
