##Accelerometer
When used with sketches running on mobile devices, this widget will use the acceleration of the device as a signal.

Example:
```javascript
// map pitch and amplitude of two sine waves to XY control.

pwm = PWM()
a = Accelerometer()
pwm.frequency = a.X
pwm.amp = a.Y
pwm.pulsewidth = a.Z

```

#### Properties
See the [Widget][widget] prototype for many other relevant properties.

* _x_  : Float. Acceleration of the device along the x-axis.
* _y_  : Float. Acceleration of the device along the y-axis.
* _z_  : Float. Acceleration of the device along the z-axis.

#### Methods
* _start_ : Begin querying sensors for acceleration data. Note: this is called automatically when Accelerometer is used with Gibber's
mapping abstractions.

* _stop_ : End querying sensors for acceleration data.

See the [Widget][widget] prototype for relevant methods.
