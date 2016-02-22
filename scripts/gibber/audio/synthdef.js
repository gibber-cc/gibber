module.exports = function( Gibber ) {

var SynthDef = function( props ) {
  var properties = props.properties,
      init = props.init || null
  
  mysynth = {
    osc: Sine(),
    note: function( freq ) {
      this.osc.frequency = freq
    },
    init: function() {
      $.extend( true, this, Gibber.Audio.ugenTemplate )
      this.fadeIn = this.fadeIn.bind( this.osc )
      this.fadeOut = this.fadeOut.bind( this.osc )
      this.fx.ugen = this.osc
      this.connections = [ Master ]
      Gibber.defineSequencedProperty( this, 'note' )
      return this
    }
  }.init()
}  
  
return SynthDef

}