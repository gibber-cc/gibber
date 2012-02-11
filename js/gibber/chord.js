// as taken from http://www.benfarrell.com/2011/12/13/chords-and-arpeggiators-with-audiolib-js/

Note = {
    /* incremental tones as sharp notation */
    sharpNotations: ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"],

    /* incremental tones as flat notation */
    flatNotations: ["A", "Bb", "B", "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab"],

    /* odd notations */
    oddNotations: ["B#", "Cb", "E#", "Fb"],

    /* corrected notations */
    correctedNotations: ["C", "C", "F", "F"],

    /**
     * turn a notation into a frequency
     * @param notation
     * @return frequency
     */
    getFrequencyForNotation: function(nt) {
        var octave = 4;

        // does notation include the octave?
        if ( !isNaN( parseInt(nt.charAt(nt.length -1)) )) {
            octave = parseInt(nt.charAt(nt.length -1));
            nt = nt.substr(0, nt.length-1);
        }

        // correct any flat/sharps that resolve to a natural
        if (this.oddNotations.indexOf(nt) != -1) {
            nt = this.correctedNotations[this.oddNotations.indexOf(nt)];
        }

        var freq;
        var indx = this.sharpNotations.indexOf(nt);

        if (indx == -1) {
            indx = this.flatNotations.indexOf(nt);
        }

        if (indx != -1) {
            indx += (octave-4) * this.sharpNotations.length;
            freq = 440 * (Math.pow(2, indx/12));
        }
        return freq;
    },

    /**
     * get notes in a specific key signature
     *
     * @param key (root note)
     * @param if major key signature
     * @param octave to use (optional)
     * @return keys in key signature
     */
    notesInKeySignature: function(key, major, octave) {
        var notesToIndex;
        var notesInKey = [];
        var startPos;

        // correct any flat/sharps that resolve to a natural
        if (this.oddNotations.indexOf(key) != -1) {
            key = this.correctedNotations[this.oddNotations.indexOf(key)];
        }

        // find the correct note and notation
        if (this.sharpNotations.indexOf(key) != -1) {
            notesToIndex = this.sharpNotations.slice();
            startPos = this.sharpNotations.indexOf(key);
        } else {
            notesToIndex = this.flatNotations.slice();
            startPos = this.flatNotations.indexOf(key);
        }

        // double the array length
        var len = notesToIndex.length;
        for ( var c = 0; c < len; c++ ) {
            if (octave) {
                notesToIndex.push(notesToIndex[c] + (octave+1));
            } else {
                notesToIndex.push(notesToIndex[c]);
            }
        }

        // add octave notation to the first half of the array
        if (octave) {
            for (var c = 0; c < this.flatNotations.length; c++) {
                notesToIndex[c] += octave;
            }
        }
        // chop off the front of the array to start at the root key in the key signature
        notesToIndex.splice(0, startPos);

        // build the key signature
        if (major) {
                // MAJOR From root: whole step, whole step, half step, whole step, whole step, whole step, half step
                notesInKey.push( notesToIndex[0] );
                notesInKey.push( notesToIndex[2] );
                notesInKey.push( notesToIndex[4] );
                notesInKey.push( notesToIndex[5] );
                notesInKey.push( notesToIndex[7] );
                notesInKey.push( notesToIndex[9] );
                notesInKey.push( notesToIndex[11] );
        } else {
                // MINOR From root: whole step, half step, whole step, whole step, half step, whole step, whole step
                notesInKey.push( notesToIndex[0] );
                notesInKey.push( notesToIndex[2] );
                notesInKey.push( notesToIndex[3] );
                notesInKey.push( notesToIndex[5] );
                notesInKey.push( notesToIndex[7] );
                notesInKey.push( notesToIndex[8] );
                notesInKey.push( notesToIndex[10] );
        }
        return notesInKey;
    }
};

ChordConstants = {
    MAJOR_TRIAD: "maj",
    MINOR_TRIAD: "m",
    SEVENTH: "7",
    MINOR_SEVENTH: "m7",
    MAJOR_SEVENTH: "maj7",
    NINTH: "9",
    MINOR_NINTH: "m9",
    MAJOR_NINTH: "maj9",
    ELEVENTH: "11",
    THIRTEENTH: "13",
    SIXTH: "6",
    MINOR_SIXTH: "m6",
    SUSTAIN: "sus",
    AUGMENTED: "aug",
    DIMINISHED: "dim"
};

ChordFactory = {
    /**
     * create a list of notations from chord
     * @param chord notation
     * @param notation array (individual notes)
     */
    createNotations: function createNotations(notation, octave) {
        var chord = new _Chord(notation, octave);
        return chord.getNotations();
    },

    /**
     * create an array of note oscillators using the audiolib framework
     * @param sampleRate
     * @param notation
     */
    // createNotes: function createNotes(sampleRate, notation) {
    //     var chord = new Chord(notation);
    //     nts = chord.getNotations();
    // 
    //     var osc;
    //     var oscs = [];
    //     for (var nt in nts) {
    //         osc = audioLib.generators.Note(sampleRate, nts[nt])
    //         oscs.push(osc);
    //     }
    //     return oscs;
    // }
}

function _Chord(notation, octave) {
    var that = this;

    /** root note of chord */
    that._root = "C";

    /** octave of root */
    if (octave) {
        that._rootOctave = octave;
    } else {
        that._rootOctave = null;
    }

    /** chord notation */
    that._notation = notation ? notation : "Cmaj";

    /** notes in built chord */
    that._notes = [];

    /**
     * get notes from built chords
     *
     * @return notes
     */
    this.getNotations = function() {
        return this._notes;
    }

    /**
     * chord notation setter
     *
     * @param notation
     */
    this.setNotation = function(value) {
        this._notation = value;
        this.buildChord();
    }

    /**
     * chord notation getter
     *
     * @return notation
     */
    this.getNotation = function() {
        return this._notation;
    }

    /**
     * root note setter
     *
     * @param root
     */
    this.setRoot = function(value) {
        this._root = value;
        this.buildChord();
    }

    /**
     * root note getter
     *
     * @return root note
     */
    this.getRoot = function() {
        return this._root;
    }

    /**
     * root octave setter
     *
     * @param octave
     */
    this.setRootOctave = function(value) {
        this._rootOctave = value;
        this.buildChord();
    }

    /**
     * root octave getter
     *
     * @return root octave
     */
    this.getRootOctave = function() {
        return this._rootOctave;
    }

    /**
     * get notes in major triad
     *
     * @param root note
     * @param root octave
     * @return notes
     */
    this.majorTriad = function(root, rootOctave) {
        return this.getStandardNotesInChordMakeup(root, true, false, rootOctave).slice(0, 3);
    }

    /**
     * get notes in minor triad
     *
     * @param root note
     * @param root octave
     * @return notes
     */
    this.minorTriad = function(root, rootOctave) {
        return this.getStandardNotesInChordMakeup(root, false, false, rootOctave).slice(0, 3);
    }

    /**
     * get notes in seventh chord
     *
     * @param root note
     * @param root octave
     * @return notes
     */
    this.seventh = function(root, rootOctave) {
        return this.getStandardNotesInChordMakeup(root, true, false, rootOctave).slice(0, 4);
    }

    /**
     * get notes in major seventh chord
     *
     * @param root note
     * @param root octave
     * @return notes
     */
    this.majorSeventh = function(root, rootOctave) {
        return this.getStandardNotesInChordMakeup(root, true, false, rootOctave).slice(0, 4);
    }

    /**
     * get notes in minor seventh chord
     *
     * @param root note
     * @param root octave
     * @return notes
     */
    this.minorSeventh = function(root, rootOctave) {
        return this.getStandardNotesInChordMakeup(root, false, false, rootOctave).slice(0, 4);
    }

    /**
     * get notes in ninth chord
     *
     * @param root note
     * @param root octave
     * @return notes
     */
    this.ninth = function(root, rootOctave) {
        return this.getStandardNotesInChordMakeup(root, true, false, rootOctave).slice(0, 5);
    }

    /**
     * get notes in major ninth chord
     *
     * @param root note
     * @param root octave
     * @return notes
     */
    this.majorNinth = function(root, rootOctave) {
        return this.getStandardNotesInChordMakeup(root, true, false, rootOctave).slice(0, 5);
    }

    /**
     * get notes in minor ninth chord
     *
     * @param root note
     * @param root octave
     * @return notes
     */
    this.minorNinth = function(root, rootOctave) {
        return this.getStandardNotesInChordMakeup(root, false, false, rootOctave).slice(0, 5);
    }

    /**
     * get notes in eleventh chord
     *
     * @param root note
     * @param root octave
     * @return notes
     */
    this.eleventh = function(root, rootOctave) {
        return this.getStandardNotesInChordMakeup(root, true, false, rootOctave).slice(0, 6);
    }

    /**
     * get notes in major eleventh chord
     *
     * @param root note
     * @param root octave
     * @return notes
     */
    this.majorEleventh = function(root, rootOctave) {
        return this.getStandardNotesInChordMakeup(root, true, false, rootOctave).slice(0, 6);
    }

    /**
     * get notes in minor eleventh chord
     *
     * @param root note
     * @param root octave
     * @return notes
     */
    this.minorEleventh = function(root, rootOctave) {
        return this.getStandardNotesInChordMakeup(root, false, false, rootOctave).slice(0, 6);
    }

    /**
     * get notes in thirteenth chord
     *
     * @param root note
     * @param root octave
     * @return notes
     */
    this.thirteenth = function(root, rootOctave) {
        return this.getStandardNotesInChordMakeup(root, true, false, rootOctave).slice(0, 7);
    }

    /**
     * get notes in major thirteenth chord
     *
     * @param root note
     * @param root octave
     * @return notes
     */
    this.majorThirteenth = function(root, rootOctave) {
        return this.getStandardNotesInChordMakeup(root, true, false, rootOctave).slice(0, 7);
    }

    /**
     * get notes in minor thirteenth chord
     *
     * @param root note
     * @param root octave
     * @return notes
     */
    this.minorThirteenth = function(root, rootOctave) {
        return this.getStandardNotesInChordMakeup(root, false, false, rootOctave).slice(0, 7);
    }


    /**
     * get notes in sixth chord
     *
     * @param root note
     * @param root octave
     * @return notes
     */
    this.sixth = function(root, rootOctave) {
        var keySig = Note.notesInKeySignature(root, true, rootOctave);
        var keys = new Array();
        keys.push(keySig[0], keySig[2], keySig[4], keySig[5]);
        return keys;
    }

    /**
     * get notes in minor sixth chord
     *
     * @param root note
     * @param root octave
     * @return notes
     */
    this.minorSixth = function(root, rootOctave) {
        var keySig = Note.notesInKeySignature(root, false, rootOctave);
        var keys = new Array();
        keys.push(keySig[0], keySig[2], keySig[4], keySig[5]);
        return keys;
    }

    /**
     * sustain chord
     *
     * @param notes
     * @param direction to sustain
     * @return notes
     */
    this.sustain = function(notes, sus) {
        sus = (sus == undefined) ? 4 : sus;
        // grab the third in the chord
        var third = notes[1];
        var notations = Note.sharpNotations;
        var thirdIndex = Note.sharpNotations.indexOf(third);
        if (thirdIndex == -1) {
            notations = Note.flatNotations;
            thirdIndex = Note.flatNotations.indexOf(third);
        }

        if (sus == 2) {
            // lower the third one half step
            if (thirdIndex - 1 < 0) {
                notes[1] = notations[notations.length - 1];
            } else {
                notes[1] = notations[thirdIndex - 1];
            }
        } else { // assume sus == 4
            // raise the third one half step
            if (thirdIndex + 1 >= notations.length) {
                notes[1] = notations[0];
            } else {
                notes[1] = notations[thirdIndex + 1];
            }
        }
        return notes;
    }

    /**
     * augment chord
     *
     * @param notes
     * @return notes
     */
    this.augment = function(notes) {
        // grab the fifth in the chord
        var fifth = notes[2];
        var notations = Note.sharpNotations;
        var fifthIndex = Note.sharpNotations.indexOf(fifth);
        if (fifthIndex == -1) {
            notations = Note.flatNotations;
            fifthIndex = Note.flatNotations.indexOf(fifth);
        }

        // raise the fifth one half step
        if (fifthIndex + 1 >= notations.length) {
            notes[2] = notations[0];
        } else {
            notes[2] = notations[fifthIndex + 1];
        }
        return notes;
    }

    /**
     * get all standard notes in a chord, from triad to thirteenth
     *
     * @param root note
     * @param major key (true/false)
     * @param major chord (true/false)
     * @param root octave
     * @return notes array
     */
    this.getStandardNotesInChordMakeup = function(root, majorKey, majorChord, octave) {
        majorKey = (majorKey == undefined) ? true : majorKey;
        majorChord = (majorChord == undefined) ? false : majorChord;

        var majKeySig = Note.notesInKeySignature(root, true, octave);
        var minKeySig = Note.notesInKeySignature(root, false, octave);

        // grab the next octave if we need it
        var majKeySig2 = Note.notesInKeySignature(root, true, octave + 1);
        var minKeySig2 = Note.notesInKeySignature(root, false, octave + 1);
        var notes;
        if (majorKey && majorChord) {
            // C Major Seventh for example
            notes = [majKeySig[0], majKeySig[2], majKeySig[4], majKeySig[6], majKeySig2[1], majKeySig2[3]];
        } else if (!majorKey && majorChord) {
            // C Minor Seventh for example
            notes = [minKeySig[0], minKeySig[2], minKeySig[4], minKeySig[6], minKeySig2[1], minKeySig2[3]];
        } else if (majorKey && !majorChord) {
            // C Seventh for example
            notes = [majKeySig[0], majKeySig[2], majKeySig[4], minKeySig[6], majKeySig2[1], minKeySig2[3]];
        } else if (!majorKey && !majorChord) {
            // C Seventh for example
            notes = [majKeySig[0], minKeySig[2], majKeySig[4], minKeySig[6], majKeySig2[1], minKeySig2[3]];
        }
        return notes;
    }

    /**
     * convert notation to note list
     *
     * @param notation
     * @param use the octave in the notation
     * @return note list
     */
    this.notesFromChordNotation = function(notation, octave) {
        var root;
        var major = 0;
        var chordType;

        // find root
        if (notation.charAt(1) == "#" || notation.charAt(1) == "b") {
            root = notation.substring(0, 2);
            notation = notation.substring(2);
        } else {
            root = notation.substring(0, 1);
            notation = notation.substring(1);
        }

        // major or minor? (3 states - 1 is on, -1 is off, 0 is unspecified)
        if (notation.substr(0, 3) == "maj") {
            major = 1;
            notation = notation.substring(3);
        } else if (notation.substr(0, 1) == "m") {
            major = -1;
            notation = notation.substring(1);
        }

        // set chord type
        if (notation.charAt(0) == "6") {
            if (major == -1) {
                chordType = ChordConstants.MINOR_SIXTH;
            } else {
                chordType = ChordConstants.SIXTH;
            }
            notation = notation.substring(2);
        } else if (notation.charAt(0) == "7") {
            if (major == 0) {
                chordType = ChordConstants.SEVENTH;
            } else if (major == 1) {
                chordType = ChordConstants.MAJOR_SEVENTH;
            } else if (major == -1) {
                chordType = ChordConstants.MINOR_SEVENTH;
            }
            notation = notation.substring(1);
        } else if (notation.charAt(0) == "9") {
            if (major == 0) {
                chordType = ChordConstants.NINTH;
            } else if (major == 1) {
                chordType = ChordConstants.MAJOR_NINTH;
            } else if (major == -1) {
                chordType = ChordConstants.MINOR_NINTH;
            }
            notation = notation.substring(1);
        } else if (notation.substr(0, 2) == "11") {
            chordType = ChordConstants.ELEVENTH;
            notation = notation.substring(2);
        } else if (notation.substr(0, 2) == "13") {
            chordType = ChordConstants.THIRTEENTH;
            notation = notation.substring(2);
        } else {
            if (major == 1 || major == 0) {
                chordType = ChordConstants.MAJOR_TRIAD;
            } else {
                chordType = ChordConstants.MINOR_TRIAD;
            }
        }
        var notes = this.notesFromChordType(chordType, root, octave);

        // modify note set if needed
        var modifier = notation;
        switch (modifier.substr(0, 3)) {
        case ChordConstants.AUGMENTED:
            notes = augment(notes);
            break;

        case ChordConstants.DIMINISHED:
            // to do
            break;

        case ChordConstants.SUSTAIN:
            var param = int(modifier.charAt(3));
            notes = sustain(notes, param);
            break;
        }

        return notes;
    }

    /**
     * get notes from chord types
     *
     * @param type
     * @param chord root
     * @return notes
     */
    this.notesFromChordType = function(type, root, rootOctave) {
        switch (type) {
        case ChordConstants.SIXTH:
            return this.sixth(root, rootOctave);

        case ChordConstants.MINOR_SIXTH:
            return this.minorSixth(root, rootOctave);

        case ChordConstants.SEVENTH:
            return this.seventh(root, rootOctave);

        case ChordConstants.MINOR_SEVENTH:
            return this.minorSeventh(root, rootOctave);

        case ChordConstants.MAJOR_SEVENTH:
            return this.majorSeventh(root, rootOctave);

        case ChordConstants.NINTH:
            return this.ninth(root, rootOctave);

        case ChordConstants.MINOR_NINTH:
            return this.minorNinth(root, rootOctave);

        case ChordConstants.MAJOR_NINTH:
            return this.majorNinth(root, rootOctave);

        case ChordConstants.ELEVENTH:
            return this.eleventh(root, rootOctave);

        case ChordConstants.THIRTEENTH:
            return this.thirteenth(root, rootOctave);

        case ChordConstants.MAJOR_TRIAD:
            return this.majorTriad(root, rootOctave);

        case ChordConstants.MINOR_TRIAD:
            return this.minorTriad(root, rootOctave);

        default:
            return this.majorTriad(root, rootOctave);
        }
    }

    /**
     * build the chord given the parameters set in this class
     */
    this.buildChord = function() {
        this._notes = [];
        var notations = this.notesFromChordNotation(this._notation, this._rootOctave);
        for (var c = 0; c < notations.length; c++) {
            this._notes.push(notations[c]);
        }
    }

    // do a build based on initial params
    that.buildChord();
} 
