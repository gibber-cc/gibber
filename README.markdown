# NOTE THE MASTER BRANCH IS CURRENTLY BROKEN. PLEASE USE THE DEVELOP BRANCH #

## Gibber ##

Gibber is a live coding environment for the web browser, built on top of audiolib.js and using the ACE code editor. I've only tested it in Chrome.

Below is a code sample. To test out Gibber, visit http://www.charlie-roberts.com/gibber

``` javascript
Gibber.setBPM(180);     // default = 120. You can also refer to Gibber as _g.

s = Sine(240, .25);      // Sine wave with freq 240, amp .5.

s.chain(                // create an fx chain for oscillator                   
    Dist(),             // Distortion
    Delay(_g.beat / 4)  // Delay with delay time set to 1/4 of a beat (1/16th note)
);

a = Arp(s, "Cm7", 2, _g.beat / 4, "updown"); // Arpeggiator: Cminor7 chord, 2nd octave, 16th notes, up then down

d = Drums("x*o*x*o*",8);
d.chain( Trunc(6) );
d.frequency = 660;     // 440 is base frequency

s.mod("freq", LFO(8, 4), "+");  // Vibrato - modulating frequency by +/- 4Hz 8 times per second
s.removeMod(1);                 // mod 0 is the arp, I know, confusing...

a.shuffle();        // randomize arpeggio
a.reset();          // reset arpeggio

Master.chain( Reverb() );     // Master FX are applied to summed signal of all generators
Master.removeFX(0);           // remove first effect in chain. don't pass a argument to remove all fx.
```
