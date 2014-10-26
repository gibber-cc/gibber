!function() {

var Gibber = require( 'gibber.core.lib' )
Gibber.Audio = require( './audio.js')( Gibber )
//Gibber.mappings  = require( 'gibber.core.lib/scripts/mappings' )( Gibber, Gibber.Audio.Core )//require( './mappings' )( Gibber, Gibber.Audio.Core )

module.exports = Gibber

}()