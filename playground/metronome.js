let Gibber = null

const Metronome = {
  shouldDraw: true,
  canvas: null,
  ctx: null,
  width: null,
  height: null,
  color: '#252525',
  beat: 0,
  widthMod:1,
  
  draw( beat, beatsPerMeasure ) {
    if( this.shouldDraw && this.ctx !== null ) {
      const beatWidth = this.width / beatsPerMeasure / this.widthMod,
            beatPos = ( beat ) * beatWidth
    
      this.ctx.clearRect( 0, 0, this.width, this.height )
      this.ctx.globalAlpha = .75
      this.ctx.fillStyle = Gibber.Environment.theme.get('b_med')
      this.ctx.fillRect(  beatPos, 0,  beatWidth, this.height )
    }
  },

  clear() {
    this.beat = 0
    this.draw( 0, 4 )
  },

  tick( event ) {
    //const __beat =  Math.floor( (phase / (44100 / (Gibber.Audio.Clock.bpm/60))) % 4 )
    const __beat = event.data.value % 4 
    if( __beat !== Metronome.beat ) {
      Metronome.draw( __beat, 4 )
      Metronome.beat = __beat
      Gibber.publish( 'metronome.tick', __beat )
    }

  },
  
  init( __Gibber ) {
    Gibber = __Gibber
    //Gibber.Audio.Gibberish.onphaseupdate = this.tick 

    Gibber.Audio.Gibberish.utilities.workletHandlers.beat = this.tick
    this.canvas = document.querySelector( '#metronome' )
    this.ctx = this.canvas.getContext( '2d' )
  
    const header = document.querySelector('header')
    const h1 = document.querySelector('h1')
    const w = parseFloat(getComputedStyle(h1).width) + parseFloat(getComputedStyle(h1).fontSize) * 3
    this.width = this.canvas.width = w 
    this.height = this.canvas.height = header.offsetHeight      
  
    Gibber.subscribe( 'clear', this.clear.bind( this ) )
    
    this.draw( 0, 4 )
    window.Metronome = this
  },
  
  off() {
    this.ctx.clearRect( 0, 0, this.width, this.height )
    this.shouldDraw = false
  },
  
  on(){ this.shouldDraw = true },
}

module.exports = Metronome
