// a short demo of classic raymarching
// melding effects. Three rings and a
// plane, melting into each other. The
// rings use a stairs transition to 
// generate steps where they merge.
 
s1 = Torus82().material('red')
s2 = Torus82().material('red')
s3 = Torus82().material('red')
  
f = Fog(.25,Vec3(0))
 
RoundUnion(
  ru = StairsUnion2( s1,s2,s3, .5,15 ),
  Plane().texture('checkers')
).render(3)
 
onframe = t => {
  s1.translate( Math.sin(t), 0,  0 ).rotate(t*5,1,0,0)
  s2.translate( Math.sin(t/3), 0, Math.cos(t/4)  ).rotate(t*6,1,0,0)
  s3.translate( 0, Math.sin(t), Math.sin(t/5)  ).rotate(t*7,1,0,0)
  camera.rotation = t/10
}
 
camera.pos.z = 4
