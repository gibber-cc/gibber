gibber.audio.lib
==========

This library provides the audio capabilities of Gibber without the code editing environment.

## Building (for development)

You can simply download the repo and skip straight to the usage section if you don't need to modify the library. If you want to modify gibber.lib, here's how to build it:

1. If you don't have it, install npm (the node.js package manager) from http://npmjs.org
2. Inside the top level of the repo, run `npm install` in the terminal.
3. Run `gulp`. This is a build module that is installed in step 2.

The build outputs a UMD file, gibber.audio.lib.js, and a minified version.

## Usage
The library can be used with plain script tags, CommonJS or AMD style includes. Below is an example HTML file that plays a simple drum beat, bass line, and random melody.

```html
<html>

<head>
  <script src='build/gibber.lib.js'></script>
</head>

<body></body>

<script>
Gibber.init() // REQUIRED!

// change root of global scale every other measure
// this will affect both bass and lead parts
Gibber.scale.root.seq( ['c4','eb4'], 2)

// create bass monosynth and sequence 1/8 note octaves
a = Mono('bass').note.seq( [0,7], 1/8 )

// simple kick / snare drum pattern
b = EDrums('xoxo')
b.snare.snappy = 1

// create lead synth and sequence with random notes/durations
c = Mono('easyfx')
  .note.seq( Rndi(0,12), [1/4,1/8,1/2,1,2].rnd( 1/8,4 ) )
</script>

</html>
```

If you want to use CommonJS (node or browserify), just use the following to start things off (assuming you have the module installed):

```js
Gibber = require( 'gibber.lib' )
Gibber.init()
``` 

## Notes
Note that `Drums` do not work because I haven't figured out resource management yet and `Drums` uses audio samples. However, `EDrums` (which uses synthesis) works fine. 