##Orientation
When used in sketches running on mobile devices, this widget will use the orientation of the device as a signal.

Example:
```javascript
pwm = PWM()
o = Orientation()

pwm.frequency = o.X
pwm.amp = o.Y
pwm.pulsewidth = o.Z

```

#### Properties
* _x_  : Float. Rotation of the device along the x-axis.
* _y_  : Float. Rotation of the device along the y-axis.
* _z_  : Float. Rotation of the device along the z-axis.

#### Methods
* _start_ : Begin querying sensors for orientation data. Note: this is called automatically when Orientation is used with Gibber's
mapping abstractions.

* _stop_ : End querying sensors for orientation data.

See the [Widget][widget] prototype for relevant methods.

