###Arp

The Arp object is an arpeggiator providing a variety of controls. See the Chords and Arpeggios tutorial for detailed information.

Example:
```javascript
a = Synth( 'bleep' )

// 1,4,6, and 7th scale degrees, 1/16 notes
// traveling up and down over 2 octaves
b = Arp( [0,3,5,6], 1/16, 'updown', 2)
b.target = a

c = Synth( 'bleep' )

// c-diminished-7 chord in the third octave, quarter notes, 
// traveling up over 4 octaves
d = Arp( 'c3dim7', 1/4, 'up', 4 )
d.target = c
```

#### Properties

* _speed_ : Float. Default value 1/4. Controls how fast the arpeggiator outputs notes.
* _pattern_ : String. Default value is 'up'. Controls the direction of notes. Possible values are 'up', 'down', 'updown' and 'updown2'. For 'updown2', the top and bottom notes of the arpeggio won't be repeated as it changes directions.
* _mult_ : Number. Default is 1. The number of octaves that the arpeggio will span.
* _notes_: A Gibber Pattern object that holds all the notes the arpeggiator sequences, as determined by the chord passed to it, the `mult` property and the arpeggiation `pattern` used. 
* _target_: The Synth that the arpeggiator will send note messages to.
 
#### Methods

* _chord_( String or Array:chordValue ): This method determines what pitches are sequenced by the arpeggiator. If you set this value to be an array, the values will be interpreted as scale degrees. If you set this to be a string, Gibber will attempt to interpret a chord, e.g. 'c4min7'. See the Chords and Arpeggios tutorial for more information on the types of chords that can be identified via strings.
* _shuffle_: A shorthand for `arp.notes.shuffle()`
* _reverse_: A shorthand for `arp.notes.reverse()`


