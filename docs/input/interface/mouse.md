##Mouse

This object presents signals derived from the position of the mouse cursor in the browser window.

Example:
```javascript
a = Mono().play( Rndi(0,12), 1/4 )

a.cutoff = Mouse.X
a.resonance = Mouse.Y
```

#### Properties

* _x_ : Float. A value between 0 and 1 representing the x position of the mouse in the browser window.
* _y_ : Float. A value between 0 and 1 representing the y position of the mouse in the browser window.

#### Methods
* _on_ : Begin polling mouse position data.
* _off_ : Stop polling mouse position data.

