## Gibber ##
Gibber is a live coding environment for the web browser, using the Gibberish.js audio engine, the CodeMirror code editor library and wrapping Three.js for 3d graphics and shader support. Version 2 of Gibber features a much more efficient audio engine, some interesting mapping abstractions and a server/database backend for publishing and browsing files and collaboratively live coding.

In order of preference, Gibber runs in Chrome, Safari, and Firefox. Gibber runs best when loaded from a web server, as it relies on server affordances for loading audio samples, but there's plenty to play
around with if you don't have your own server. Or you can simply create your own web server using something like the python SimpleHTTPServer (http://www.linuxjournal.com/content/tech-tip-really-simple-http-server-python).

Version 2 is currently in beta, primarily because I'm still developing the server / database backend. That said, the current syntax used for coding should be consistent with the final version; there are several small changes from version 1.

Below is a code sample that shows off the new mapping abstractions in Gibber by mapping the the amplitude of various drum sounds to the rotation of a Cube and a shader uniform.

``` javascript
a = XOX('x*o*x*o-')

b = Cube()

// map the rotation of the cube to envelope followers
b.rotation.x = a.kick.Amp
b.rotation.y = a.snare.Amp

f = Film()

f.sCount = a.hat.Amp
```
