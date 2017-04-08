## Gibber ##
Gibber is a live coding environment for the web browser, using the Gibberish.js audio engine, the CodeMirror code editor library and wrapping Three.js for 3d graphics and shader support. Version 2 of Gibber features a much more efficient audio engine, some interesting mapping abstractions and a server/database backend for publishing and browsing files and collaboratively live coding.

In order of preference, Gibber runs in Chrome, Safari, and Firefox. The current public URL for the Gibber environment is http://gibber.mat.ucsb.edu. Below is a code sample that shows off the mapping abstractions in Gibber by mapping the output envelope of various drum sounds to the rotation of a Cube and a shader uniform.

``` javascript
// Electronic Drum synth/sequencer
a = EDrums('x*o*x*o-')

// create a cube
b = Cube()

// map the rotation of the cube
// continuously follow the amplitude of drums

b.rotation.x = a.kick.Out
b.rotation.y = a.snare.Out

// a shader that simulates film grain and video noise
f = Film()

// map the scanline count to the hihat output
f.sCount = a.hat.Out
```

### Running Gibber Locally

In order to run Gibber locally, you need to clone the gibber.server repo:<http://github.com/charlieroberts/gibber.server>. There are instructions for running the server in its README file.

### Building Gibber
You need to grab the following npm modules / github repos:

1. gibber.audio.lib
2. gibber.graphics.lib
3. gibber.core.lib
4. gibber.interface.lib
5. gibber.communication.lib

You can place all of theses repos in the node_modules folder and then run `gulp watch` to start the watching system. However, I find it is easier to clone each repo into its own location separate from the main Gibber repo, and then use `npm link` <http://docs.npmjs.com/cli/link> to link them all together when building. 


