/* fractal fun
 * this demo maps glitch sounds from the freesound database
 * to control geometric parameters (including the folding
 * of a Mandelbulb fractal) and two post-processing effects.
 * use ctrl+h to hide / unhide the code for better viewing.
*/ 
 
// create blur and inversion post-processing fx.
blur = Blur(0)
inv = Invert(0)
 
// create the intersection of a sphere and
// a repeated mandelbulb, and round the points of 
// intersection. render using the 'fractal.low'
// preset... try changing to fractal.med or fractal.high
// if you have a good graphics card.
ri = RoundIntersection(
  Sphere(3).material('white'),
  Repeat( 
    s = Mandelbulb().material('white').scale(.25), 
    .5 
  ), .05
).render('fractal.low') 
 
verb = Reverb('space').bus()
 
// see the freesound tutorial! 
glitch = Freesound[5]({ query:'glitch', max:.5 })
  .connect( verb, .05 )
  .spread(1) // pan voices full stereo
 
// pick and play a random sample
// nine times distributed over sixteen slots,
// where each slot is a 1/16th note.
glitch.pickplay.seq(
  Rndi(0,14),
  Euclid(9,16)
)
  
kick = Kick('deep')
  .connect( verb, .5 )
  .trigger.seq( 1, 4 )
  
// start FFT
FFT.start()
// use short windows to capture transients. default
// window is 512 samples, which is converted to 128 below. 
FFT.windowSize *= .25
 
onframe = t => {
  // rotate entire geometry
  ri.rotate( t,0,1,0)
  // set blur to decrease when glitch is loud
  blur.amount = glitch.out(10,0,512)
  // fold mandelbulb based on frequency content
  // between 150-1400 Hz 
  s.fold = 2 + FFT.mid * 5
  // map high frequencies (above 1400 Hz) to control
  // the "rounding" (aka smoothness) of the points
  // where the mandelbulb meets its surrounding sphere.
  ri.c = FFT.high / 2
  // invert video based on analysis of low frequency signals
  inv.threshold = FFT.low > .95 ? 1 : 0
}
