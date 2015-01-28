gibber.audio.lib
==========

This library provides the audio capabilities of Gibber without the code editing environment.

## Building (for development)

You can simply download the repo and skip straight to the **Usage** section if you don't need to modify the library. If you want to modify gibber.lib, here's how to build it:

1. If you don't have it, install `npm` (the Node.js package manager) from [npmjs.org][].
2. Inside the top level of the repo, run `npm install` in a terminal.
3. Run `gulp` (`gulp` is a build module which is installed in step 2).

The build outputs a UMD file, gibber.audio.lib.js, and a minified version.

## Usage
The library can be used with plain script tags, or CommonJS-/ AMD- style includes. Below is an example HTML file which plays a simple drum beat, bass line, and random melody.

```html
<html>

<head>
  <script src='./build/gibber.audio.lib.js'></script>
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

##Using Drum Samples
Gibber will look for a folder named 'resources' that lives in the same directory as your index.html and sketch.js files. Inside this folder is where you should place any audio samples you'd like to use or the Gibber drum samples. So, a sample directory that uses the standard Gibber Drums object might look like this:


    yourProjectDirectory
      > resources
        > audiofiles
          > electronic 
            kick.wav
            hat.wav
            snare.wav
            openhat.wav
      index.html
      sketch.js

Audio resources *can only be loaded from a running webserver*, as HTTP is used to transfer the files. There is always the EDrums object to use if such a server
is unavailable... it provides synthetic drums that are tweakable instead of the sample-based drums used by the Drums object.

## Using SoundFonts
In a similar fashion to the drum and audio samples, soundfonts must be placed in a directory named 'soundfonts' inside a directory named 'resources' that lives in your project directory.

    yourProjectDirectory
      > resources
        > soundfonts
        accordion-mp3.js
        acoustic-bass-mp3.js
        acoustic-grand-piano-mp3.js
        ... etc.
      index.html
      sketch.js

The actual soundfont used has been converted by Benjamin Gleitzman at the following repo: https://github.com/gleitz/midi-js-soundfonts

You only need the .js files to be stored on your server, the actual .mp3s aren't needed. As with the Drums samples, the SoundFont object only works if you load the .html file from a running web server.

## Using in Node.js
Thanks to Sebastien Piquemal's excellent [web-audio-api][] Node.js plugin you can run `gibber.audio.lib` code directly inside of Node.js. Try running `npm install` and then `npm test` from the top level of the repo to hear this in action.

`web-audio-api` has a dependency on `speaker`; `speaker` tries to compile a blob specific to the OS it's running on. On Windows 7 with VS2012, you will likely need to run `npm config set msvs_version 2012` from a command prompt prior to running `npm install`.

You need to include `web-audio-api` at the start of your code. So, to run code in Node.js your file should start with something like (make sure the path to `gibber.audio.lib.js` is correct):

```javascript
// must be global! no way to fix this that I can think of...
AudioContext = require('web-audio-api').AudioContext

// must be global! this should be fixable.
Gibber = require('./build/gibber.audio.lib.js')
Gibber.init()
```

See the file in `scripts/tests` for more detail.

  [npmjs.org]: http://npmjs.org
  [web-audio-api]: https://github.com/sebpiq/node-web-audio-api
