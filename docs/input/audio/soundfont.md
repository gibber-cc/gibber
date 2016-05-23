###SoundFont

Sampled-based instruments that follow the SoundFont 2 specification. The samples for SoundFonts are loaded whenever they are first instantiated and then cached for other instances. E.g. the first time you run `a = SoundFont('piano')` all the acoustic piano samples will be downloaded; if `b = SoundFont('piano')` is subsequently run the samples will not have to be loaded again as the cached data will be used.

At the end of this reference is a list of General MIDI sounds for valid instruments that the SoundFont object supports. In addition, Gibber comes with shorthand for several soundbanks:

acoustic_grand_piano = piano  
electric_guitar_clean = guitar  
acoustic_bass = bass  
rock_organ = organ  
synth_brass_1 = brass  
synth_strings_1 = strings  
choir_aahs = choir  

Example:
```javascriptjavascript
a = SoundFont( 'piano' )
a.note.seq( [0,1,2,3],1/8 )

b = SoundFont( 'kalimba' )
b.note.seq( [14,15,16,17], 1/2 )
```

#### Properties

* _amp_ : Float. Default range: { 0, 1 }. Default value: 1.  

* _loudness_ : Float. Determines the amplitude of individual notes, while `amp` affects all output. For example:  
```javascript
a = SoundFont('piano')
  .note.seq( Rndi(0,14), 1/8 )
  .loudness.seq( Rndf() )
```
In the above example, each note will be played at a different loudness. The value of `loudness` represents a scalar with a linear output curve that the note output is multiplied by.  

* _pan_ : Float. Default range { -1, 1 }. Default value: 0. The position in the stereo spectrum for output.
 
#### Methods

* _note_( Float:pitch, Float:loudness ): Begin playback at the position determined by the start property at a rate determine by the pitch argument and at a provided loudness.  

* _kill_() : Disconnect the oscillator from whatever bus it is connected to. 

#### Complete Sound List
  
accordion  
acoustic_bass  
acoustic_grand_piano  
acoustic_guitar_nylon  
acoustic_guitar_steel  
agogo  
alto_sax  
applause  
bagpipe  
banjo  
baritone_sax  
bassoon  
bird_tweet  
blown_bottle  
brass_section  
breath_noise  
bright_acoustic_piano  
celesta  
cello  
choir_aahs  
church_organ  
clarinet  
clavinet  
contrabass  
distortion_guitar  
drawbar_organ  
dulcimer  
electric_bass_finger  
electric_bass_pick  
electric_grand_piano  
electric_guitar_clean  
electric_guitar_jazz  
electric_guitar_muted  
electric_piano_1  
electric_piano_2  
english_horn  
fiddle  
flute  
french_horn  
fretless_bass  
fx_1_rain  
fx_2_soundtrack  
fx_3_crystal  
fx_4_atmosphere  
fx_5_brightness  
fx_6_goblins  
fx_7_echoes  
fx_8_scifi  
glockenspiel  
guitar_fret_noise  
guitar_harmonics  
gunshot  
harmonica  
harpsichord  
helicopter  
honkytonk_piano  
kalimba  
koto  
lead_1_square  
lead_2_sawtooth  
lead_3_calliope  
lead_4_chiff  
lead_5_charang  
lead_6_voice  
lead_7_fifths  
lead_8_bass__lead  
marimba  
melodic_tom  
music_box  
muted_trumpet  
oboe  
ocarina  
orchestra_hit  
orchestral_harp  
overdriven_guitar  
pad_1_new_age  
pad_2_warm  
pad_3_polysynth  
pad_4_choir  
pad_5_bowed  
pad_6_metallic  
pad_7_halo  
pad_8_sweep  
pan_flute  
percussive_organ  
piccolo  
pizzicato_strings  
recorder  
reed_organ  
reverse_cymbal  
rock_organ  
seashore  
shakuhachi  
shamisen  
shanai  
sitar  
slap_bass_1  
slap_bass_2  
soprano_sax  
steel_drums  
string_ensemble_1  
string_ensemble_2  
synth_bass_1  
synth_bass_2  
synth_brass_1  
synth_brass_2  
synth_choir  
synth_drum  
synth_strings_1  
synth_strings_2  
taiko_drum  
tango_accordion  
telephone_ring  
tenor_sax  
timpani  
tinkle_bell  
tremolo_strings  
trombone  
trumpet  
tuba  
tubular_bells  
vibraphone  
viola  
violin  
voice_oohs  
whistle  
woodblock  
xylophone  
