##Button

A button with variable modes. Buttons are a type of [Widget][widget] and inherit its methods and properties.

Example:
```javascript
a = Button()
a.setValue( 1 )

a = Button({ mode:'momentary' })
```

#### Properties

* _mode_ : String. Default : 'toggle'. The three modes for buttons are:
  * __toggle__ - Pressing the button once outputs its max value, pressing it again outputs its min
  * __momentary__ - Pressing the button outputs its max value, releasing it sets it outputs its min
  * __contact__ - Pressing the button sends outputs its max value; its min value is never outputted
* _value_  : Float. Default range: { 0, 1 }. Default: 0.

#### Methods

See the [Widget][widget] prototype for relevant methods.

[widget]: javascript:jump('interface-widget')