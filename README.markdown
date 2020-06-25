## Gibber ##
Gibber is a live coding environment for the web browser, combining music synthesis and sequencing with ray-marching 3d graphics.

Version 1 of gibber can be found at https://gibber.cc. The `main` branch of this repo is for Version 2, and there is also a [playground for version 2 in the gh-pages branch](https://gibber-cc.github.io/gibber/playground).

### Building Gibber ###
There are three main components this repo wraps, in addition to providing the editing interface.

1. gibber.audio.lib
2. gibber.graphics.lib
3. gibber.core.lib

Assuming you have node/npm installed, you can run `npm i` in the top level of this repo to get all the required modules. You can then build the library / editor using `gulp` (or `gulp watch` to run a continuous build). This creates the file `playground/bundle.js` that is included in a script tag inside the playground's `index.html` page.

Gibber loads an audio worklet that is currently assumed to be at `node_modules/gibberish-dsp/dist/gibberish_worklet.js`. If your node installation places that worklet somewhere else you can edit the location in the `environment.js` file and then run gulp again... just do a search for `gibberish_worklet` to find the relevant section of the code.
