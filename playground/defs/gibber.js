module.exports = {
  prototypes:  {
    graphics:  require('../../node_modules/gibber.graphics.lib/defs/prototypes_defs.js'),
    audio:     require('../../node_modules/gibber.audio.lib/defs/audio/prototypes_defs.js'),
  },
  effects:     require('../../node_modules/gibber.audio.lib/defs/audio/effects_defs.js'),
  instruments: require('../../node_modules/gibber.audio.lib/defs/audio/instruments_defs.js'),
  mixins:      require('../../node_modules/gibber.audio.lib/defs/mixins_defs.js'),
  misc:        require('../../node_modules/gibber.graphics.lib/defs/misc_defs.js'),
  geometries:  require('../../node_modules/gibber.graphics.lib/defs/geometries_defs.js'),
  postprocessing:  require('../../node_modules/gibber.graphics.lib/defs/postprocessing.js'),
}
