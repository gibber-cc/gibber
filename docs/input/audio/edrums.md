###EDrums

A synthesized drum kit, carefully designed to simulate a Roland TR-808 drum machine, with an attached sequencer for quick beat construction. The first
argument to the constructor allows you to easily define beats using the following syntax:

* x : kick drum hit
* o : snare drum hit
* \* : close hihat
* \- : open hihat
* . : rest

EDrums are basically hybrid sequencers / unit generators; this means that you can call most unit generator methods,
( such as drums.fx.add() ) as well as some sequencer methods ( such as xox.stop() and xox.start() ). By default, the constructor
assumes that you want each note in your sequence to have a duration equal to one divided by the number of notes you specify. For example, if you
specify a four-note sequence the XOX sequencer will assume you want each note to be a quarter note in duration. You can also specify a duration
explicitly as a second parameter to the constructor.

Unlike the Drums object, each sound in the XOX object is a synthesis unit generator. The parameters for each ugen are different. Basically the XOX 
consists of a Bus object that the individual synthesizers are attached to, and a sequencer to control them.

Example:
```javascript
a = EDrums( 'xoxo' ) // each note is a quarter note in duration  
a.fx.add( Delay( 1/64) )  
a.snare.snappy = 1.5  
  
b = EDrums( '***-', 1/8 ) // each note is an eighth note
b.hat.fx.add( Distortion() )  
b.kick.decay = 1  
  
b.seq.note = 'xoxx**-o'  
```

#### Properties
* _amp_ : Float. default range { 0, 1 }. default value: 1.
* _pan_: Float. Default range { -1, 1 }. Default value: 0. The position in the stereo spectrum of the Synth output.
* _kick_: Ugen. The kick drum unit generator.
* _snare_: Ugen. The snare drum unit generator.
* _hat_: Ugen. The hihat unit generator.
* _seq_: Sequencer. The built-in Seq object.

#### Methods

* _note_( Float:frequency, Float:amp(optional) ) : This method tells the drum kit to play a single note.
* _play_( Array:frequencies, Array:durations ) : This method accepts arrays of frequencies and durations as arguments to create and start a sequencer targeting the oscillator.
* _stop_() : This method stops the sequencer that is built into the oscillator if it has been started.
* _kill_() : Disconnect the Drums from whatever bus it is connected to. 
