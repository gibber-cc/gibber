### Canvas

The canvas object provides a 2d drawing surface for Gibber. There is only one
canvas allowed on the screen at a time (currently). The canvas object basically
wraps the 2d context of the HTML canvas tag. Any method or property that works
with the HTML canvas context should work with Gibbers canvas object.

Under the hood, the HTML canvas object is used to draw a texture which is then
rendered to a full-screen WebGL quad. This allows shaders to be used in
conjunction with 2d drawing, which is not typical of graphics programming
environments.

For a reference on the HTML canvas context methods and properties, see :  
http://blog.nihilogic.dk/2009/02/html5-canvas-cheat-sheet.html  

Gibber adds some sugar to the canvas object to make it a little more fluid to
use. These extra methods and properties are described below. You should also check out
the various 2d drawing tutorials / demos found by pressing the browse button in
the Gibber menu bar.

####Properties

* _alpha_. This is a slight shorthand for the globalAlpha property
built-in to the HTML canvas context. Not sure why they added the global prefix
but I thought it was confusing, since there is no other alpha that can be set.
* _left_. The lefthand boundary of the canvas; this is almost always 0.
* _right_. The righthand boundary of the canvas measured in pixels.
* _top_. The top of the canvas. This is almost always 0.
* _bottom_. The bottom of the canvas measured in pixels. This is equivalent to
the height of the canvas.
* _center_. Center is an object with { x,y } properties. It can be used to
easily draw a shape at the center of the canvas.
* _width_. The width of the canvas. Should always return the same value as
right.
* _height_. The height of the canvas. Should always return the same value as
bottom.
* _sprite_. The THREE.js Mesh object that the canvas textures.

####Methods

* _draw_(): A user defined method that is called once per frame. Use this to
create animations.
* _clear_(): Clears the canvas of all content.
* _fill_( CSS Color ): Fill a path with the argument color. In HTML you
typically use two steps to accomplish this: first set the fillStyle property of
the canvas object and then calling the fill method. Here we allow you to do both
in one step.
* _stroke_( CSS Color, lineWidth ): Stroke a path with a provided color and
provided lineWidth.
* _circle_( centerx, centery, radius ): Create a circle path with a provided radius
at the provided center coordinates. Call fill or stroke after calling this
method to see the results.
* _polygon_( centerx, centery, raidus, numberOfSides ): Create a polygon at the
provided center point with the provided number of sides. You must call fill or
stroke after this to see the results.
* _square_( x, y, size ): Draw a square with the provided size. The x and
y coordinates mark the top left corner; use a polygon with four sides if you
want a centered square. You must call fill or stroke after this to see results.
* _rotate_( radians ): Rotate the canvas by the provided number of radians. If
you call this method from within the canvas draw function it will only last for
the duration of that frame; otherwise it will affect all future drawing.
* _line_( x1,y1,x2,y2 ): Draw a line from one point to another. You must call
stroke after this to see the result.
* _show_(): Show the canvas.
* _hide()_: Hide the canvas.
