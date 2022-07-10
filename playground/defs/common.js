module.exports = [
  {
    "name": "Rndi",
    "doc": "This creates a function that outputs random integers within a given range; although the function is intended for use within sequences it can be called like any ordinary JavaScript function.",
    "properties": {
      min: {
        type: 'int',
        default: 0,
        doc: "The (inclusive) minimum number the Rndi instance will output"
      },
      max: {
        type: 'int',
        default: 1,
        doc: "The (inclusive) maximum number the Rndi instance will output"
      },
      quantity: {
        type:'int',
        default: 1,
        doc: 'The number of integers to output. If the value is more than one an array will be returned, which is useful for sequencing random chords.',
      },
      canRepeat: {
        type:'boolean',
        default: false,
        doc: 'If this value is false (the default) and quantity is higher than 1, the numbers will be unique, assuming that the range of possible integers is higher than the quantity requested.'
      }
    },
  },
  {
    "name": "Rndf",
    "doc": "This creates a function that outputs random floats within a given range; although the function is intended for use within sequences it can be called like any ordinary JavaScript function.",
    "properties": {
      min: {
        type: 'float',
        default: 0,
        doc: "The (inclusive) minimum number the Rndf instance will output"
      },
      max: {
        type: 'flaot',
        default: 1,
        doc: "The (inclusive) maximum number the Rndf instance will output"
      },
      quantity: {
        type:'int',
        default: 1,
        doc: 'The number of floats to output. If the value is more than one an array will be returned, which is useful for sequencing random chords.',
      },
      canRepeat: {
        type:'boolean',
        default: false,
        doc: 'If this value is false (the default) and quantity is higher than 1, the numbers will be unique, assuming that the range of possible floats is higher than the quantity requested.'
      }
    }
  },
  {
    "name": "rndf",
    "doc": "rndf is a function you can call to immediately output a random float (or array of floats) in a given range. As opposed to Rndf, which is intended for use in sequences, you might use rndf to randomly set a property value every time you execute the function.",
    "properties": {
      min: {
        type: 'float',
        default: 0,
        doc: "The (inclusive) minimum of the output range."
      },
      max: {
        type: 'float',
        default: 1,
        doc: "The (inclusive) maximum number of the output range."
      },
      quantity: {
        type:'int',
        default: 1,
        doc: 'The number of floats to output. If the value is more than one an array will be returned.',
      },
      canRepeat: {
        type:'boolean',
        default: false,
        doc: 'If this value is false (the default) and quantity is higher than 1, each number in the output will be unique, assuming that the range of possible floats is higher than the quantity requested.'
      }
    }
  },
  {
    "name": "rndi",
    "doc": "rndi is a function you can call to immediately output a random int (or array of ints) in a given range. As opposed to Rndi, which is intended for use in sequences, you might use rndi to randomly set a property value every time you execute the function.",
    "properties": {
      min: {
        type: 'int',
        default: 0,
        doc: "The (inclusive) minimum of the output range."
      },
      max: {
        type: 'int',
        default: 1,
        doc: "The (inclusive) maximum number of the output range."
      },
      quantity: {
        type:'int',
        default: 1,
        doc: 'The number of ints to output. If the value is more than one an array will be returned.',
      },
      canRepeat: {
        type:'boolean',
        default: false,
        doc: 'If this value is false (the default) and quantity is higher than 1, each number in the output will be unique, assuming that the range of possible ints is higher than the quantity requested.'
      }
    }
  },

]
