###Drums

A sampled drum kit with an attached sequencer for quick beat construction. The first argument to the constructor allows you to easily define beats using the following syntax:

* x : kick drum hit
* o : snare drum hit
* \* : close hihat
* \- : open hihat
* . : rest

Drums objects are basically hybrid sequencers / unit generators; this means that you can call most unit generator methods, ( such as drums.fx.add() ) as well as most sequencer methods ( such as drums.stop() and drums.start() ). By default, the constructor assumes that you want each note in your sequence to have a duration equal to one divided by the number of notes you specify. For example, if you specify a four-note sequence the Drums sequencer will assume you want each note to be a quarter note in duration. You can also specify a duration explicitly as a second parameter to the constructor.

There are a few different drum kits that come with Gibber (with hopefully more to follow). The kits are electronic (the default), original and beatbox. The example below shows how to load a different than the default electronic one.

Finally, note that each individual sound is actually an instance of the Gibber [Sampler][sampler] object. This means you can add effects to the individual sounds in addition to the kit as a whole.

Example:
```javascript
a = Drums( 'xoxo' ) // each note is a quarter note in duration  
a.fx.add( Delay( 1/64) )  

b = Drums( '***-', 1/8 ) // each note is an eighth note  
b.hat.fx.add( Distortion() )  
b.pitch = 2  

c = Drums({  
  kit:'beatbox',  
  note:'Tfk8p'  
})  
```

#### Properties

* _pitch_ : Float. default range { .25, 4 }. default value 1. The speed of sample playback.
* _amp_ : Float. default range { 0, 1 }. default value: 1.
* _pan_: Float. Default range { -1, 1 }. Default value: 0. The position in the stereo spectrum of the Drums output.
* _kick_: Ugen. The kick drum sampler.
* _snare_: Ugen. The snare drum sampler.
* _hat_: Ugen. The hihat sampler.
* _seq_: Sequencer. The built-in Seq object.

#### Methods

* _note_( Float:frequency, Float:amp(optional) ) : This method tells the drum kit to play a single note.
* _play_( Array:frequencies, Array:durations ) : This method accepts arrays of frequencies and durations as arguments to create and start a sequencer targeting the oscillator.
* _stop_() : This method stops the sequencer that is built into the oscillator if it has been started.
* _kill_() : Disconnect the Drums from whatever bus it is connected to. 

[sampler]: javascript:Gibber.Environment.Docs.openFile('audio','sampler')