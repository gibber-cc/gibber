##Patchbay

A simple widget for establishing virtual connections. After creating connections via drag and drop,
users can delete them by clicking on the connection and hitting delete. TODO: how to delete for touch devices?

Example:
```javascript
a = Mono()
b = Drums('xoxo')

c = Patchbay( a.Cutoff, a.Resonance, b.Pitch, b.Amp, b.Out )
```

In the above example, connecting the patch point for b.Out to the patch point for a.Cutoff would be the equivalent
of executing the following line of code:

```
a.cutoff = b.Out
```

#### Properties
* _connections_ : Array. A list of connections that have been established.

#### Methods
* _onconnection_ : Function( start, end ). The two objects that have been connected.
* _ondisconnection_ : Function( start, end ). The two objects that are no longer connected.

