##Widget

Most interactive elements in Gibber (but not all) have a [Widget](javascript:Gibber.Environment.Docs.openFile("graphics", "geometry")) as their object prototype. You never create a widget directly, but other elements that you create will use its methods and properties.

#### Properties

* _background_ : CSS color. Default : '##000'. The background color for the widget. If a background color is not assigned to the widget, the widget will
use the background of its containing panel.
* _fill_  : CSS color. Default: '##999'. If a fill color is not assigned to the widget, the widget will
use the fill of its parent panel.
* _stroke_  : CSS color. Default: '##ccc'. If a stroke color is not assigned to the widget, the widget will
use the stroke of its containing panel.
* _x_ : Float. The x-coordinate for the upper-lefthand corner of the widget, expressed as a multiple of the parent panel's width. For example, a x value of .5 will place the left edge of the widget at the horizontal center of the panel.
* _y_ : Float. The y-coordinate for the upper-lefthand corner of the widget, expressed as a multiple of the parent panel's height. For example, a x value of .5 will place the top edge of the widget at the vertical center of the panel.
* _width_ : Float. The width of a widget is expressed as a percentage of the parent panel's width. For example, a widget value of .5 means the widget will be half the width of the panel.
* _height_ : Float. The height of a widget is expressed as a percentage of the parent panel's height. For example, a widget value of .5 means the widget will be half the height of the panel.
* _bounds_ : Array. A shorthand for assigning x,y,width and height simultaneously. For example, Button({ bounds:[0,0,1,1] }) creates a button that
fills the entire panel.
* _min_ : Float. Default value: 0. The minimum value the widget outputs. Note that if you use Gibber's 
automatic mapping system (such as in the example), changing this will have no effect. See the Interface Tutorial
under Browse > Miscellaneous for more information.
* _max_ : Float. Default value: 1. The maximum value the widget outputs.

#### Methods
* _onmousedown_ :  An event handler for handling mousedown events. This only works with trackpads and mice, see ontouchmousedown for a version that works with touch as well. An event object is passed to this function providing the x and y offset of the widget from the panel origin, in pixels.
* _onmousemove_ : Occurs whenever the mouse moves over a widget if the widget already has focus. An event object is passed to this function providing the x and y offset of the widget from the panel origin, in pixels.
* _onmouseup_   : Occurs whenever a user releases the mouse after it has been used to provide a particular widget focus. An event object is passed to this function providing the x and y offset of the widget from the panel origin, in pixels.
* _ontouchstart_ :  An event handler for handling mousedown events. This only works with trackpads and mice, see ontouchmousedown for a version that works with touch as well. An event object is passed to this function providing the x and y offset of the widget from the panel origin, in pixels.
* _ontouchmove_ : Occurs whenever the mouse moves over a widget if the widget already has focus. An event object is passed to this function providing the x and y offset of the widget from the panel origin, in pixels.
* _ontouchend_   : Occurs whenever a user releases the mouse after it has been used to provide a particular widget focus. An event object is passed to this function providing the x and y offset of the widget from the panel origin, in pixels.
* _ontouchmousedown_ : Function. An event handler that handles both mousedown and touchstart events. An event object is passed to this function providing the x and y offset of the widget from the panel origin, in pixels.
* _ontouchmousemove_ :  Event handler for both ontouchmove and onmousemove events.  An event object is passed to this function providing the x and y offset of the widget from the panel origin, in pixels.
* _ontouchmouseup_   :  Event handler for both ontouchend and onmouseup events. An event object is passed to this function providing the x and y offset of the widget from the panel origin, in pixels.
* _\_x_ : Returns the x-position of the widget, always in pixels, as an offset from the parent panel's left edge. Note that even if relative layouts are being used, using this method will return a value in pixels. Access the property value directly to obtain the value relative to the panel's dimensions.
* _\_y_ : Returns the y-position of the widget, always in pixels, as an offset from the parent panel's top edge. See \_x() for more information.
* _\_width_ : Returns the width of the widget in pixels.
* _\_height_ : Returns the width of the widget in pixels.
* _setValue_ : Change the current value displayed by the widget.
