## Gibber ##
Gibber is a live coding environment for the web browser, using the Gibberish.js audio engine, the CodeMirror code editor library and wrapping Three.js for 3d graphics and shader support. Version 2 of Gibber features a much more efficient audio engine, some interesting mapping abstractions and a server/database backend for publishing and browsing files and collaboratively live coding.

In order of preference, Gibber runs in Chrome, Safari, and Firefox. Gibber runs best when loaded from a web server, as it relies on server affordances for loading audio samples, but there's plenty to play
around with if you don't have your own server. Or you can simply create your own web server using something like the python SimpleHTTPServer (http://www.linuxjournal.com/content/tech-tip-really-simple-http-server-python). The current public URL for the Gibber beta is http://gibber.mat.ucsb.edu. The older "stable" version is at http://www.charlie-roberts.com.

Version 2 is currently in beta, primarily because I'm still developing the server / database backend, but also because some additions to syntax are still being made. Since almost all of these changes are in fact additions, most of the original Gibber syntax should still work.

Below is a code sample that shows off the new mapping abstractions in Gibber by mapping the the amplitude of various drum sounds to the rotation of a Cube and a shader uniform.

``` javascript
// alternate between 440 and 880 Hz every half note
s = Sine().play( [440, 880], 1/2 )

// add vibrato at a rate of 3 Hz and a depth of 20 Hz
s.frequency = Add( 440, Sine(3, 20)._ )

// Electronic Drum synth/sequencer
a = XOX('x*o*x*o-')

// create a cube
b = Cube()

// map the rotation of the cube to envelope followers
b.rotation.x = a.kick.Amp
b.rotation.y = a.snare.Amp

// a shader that simulates film grain and video noise
f = Film()

// map the scanline count to the hihat amplitude
f.sCount = a.hat.Amp
```
