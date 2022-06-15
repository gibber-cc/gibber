# Gibber #
Gibber is a live coding environment for the web browser, combining music synthesis and sequencing with ray-marching 3d graphics.

## Playgrounds ##
No installation needed, play it on the web!

- [Version 2](https://gibber.cc/alpha/playground/)

## Start it up ##
You must have [node.js](https://nodejs.org/en/) installed to run a local copy of gibber.

1. After cloning this repo (or installing via npm), install all required modules by executing `npm i` from within the repo.
2. From the top level of the repo, run `npm start`. 
3. You can now load gibber at http://127.0.0.1:9080

## Building Gibber ##
There are three main components this repo wraps, in addition to providing the editing interface.

1. [gibber.audio.lib](https://github.com/charlieroberts/gibber.audio.lib)
2. [gibber.graphics.lib](https://github.com/charlieroberts/gibber.graphics.lib)
3. [gibber.core.lib](https://github.com/charlieroberts/gibber.core.lib)

Assuming you have node/npm installed, you can run `npm i` in the top level of this repo to get all the required modules to build the editor; you can then build the library / editor by calling `npm run build`. This will rebuild the file `playground/bundle.js` that is included in a script tag inside the playground's `index.html` page.

If you want to hack away at the individual libraries listed above, go ahead and clone any you're interested in to your computer (as opposed to installing via npm) and then run `npm link` inside of each. Then run `npm run link` inside the top level of the main repo (this one). This will link the local copies of the libraries you clone into the build pipeline.
