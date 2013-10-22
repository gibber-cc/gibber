## Gibber ##
NOTE: This branch is a very very alpha version 2 of Gibber. It features a much more efficient audio engine, some interesting mapping abstractions and
a server/database backend for publishing and browsing files and collaboratively live coding.

Gibber is a live coding environment for the web browser, using the Gibberish audio engine and the CodeMirror code editor.
It runs in Chrome, Firefox (for this branch) and also runs in the nightly versions of Webkit.
Gibber runs best when loaded from a web server, as it relies on server affordances for loading audio samples, but there's plenty to play
around with if you don't have your own server. Or you can simply create your own web server using something like the python SimpleHTTPServer (http://www.linuxjournal.com/content/tech-tip-really-simple-http-server-python).

Below is a code sample that shows off the new mapping abstractions in Gibber, as well as the new TR-808 emulation.

``` javascript
a = XOX('x*o*x*o-')

b = Cube()

// map the rotation of the cube to envelope followers
b.rotation.x = a.kick.Amp
b.rotation.y = a.snare.Amp

f = Film()

f.sCount = a.hat.Amp
```
