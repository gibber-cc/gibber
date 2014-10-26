var browserify = require( 'gulp-browserify' ),
    gulp = require( 'gulp' ),
    buffer = require( 'vinyl-buffer' ),
    uglify = require( 'gulp-uglify' ),
    rename = require( 'gulp-rename' );

gulp.task( 'client', function(){
  var out = gulp.src( './scripts/gibber/audio.lib.js' )//gulp.src( './node_modules/gibber.core.lib/scripts/gibber.js')
    .pipe( browserify({ 
      standalone:'Gibber',
      bare:true, 
      ignore:[
        'gibber.graphics.lib/scripts/gibber/graphics/graphics',
        'gibber.interface.lib/scripts/gibber/interface/interface',
        'gibber.audio.lib/scripts/gibber/audio'
      ]
    }) )
    .pipe( rename('gibber.audio.lib.js') )
    .pipe( gulp.dest('./build/') )
    .pipe( buffer() )
    .pipe( uglify() )
    .pipe( rename('gibber.audio.lib.min.js') )
    .pipe( gulp.dest('./build/') )
    
    return out
});

/*
Gibber.Graphics  = require( 'gibber.graphics.lib/scripts/gibber/graphics/graphics' )( Gibber )
Gibber.Interface = require( 'gibber.interface.lib/scripts/gibber/interface/interface' )( Gibber )
*/

gulp.task( 'p5', ['client'], function() {
  var out = gulp.src( './build/gibber.audio.lib.js'  )
    .pipe( gulp.dest('/www/p5.gibber.js/node_modules/gibber.lib/build/') )
    .pipe( buffer() )
    .pipe( uglify() )
    .pipe( rename('gibber.audio.lib.min.js') )
    .pipe( gulp.dest('/www/p5.gibber.js/node_modules/gibber.lib/build/') )
    return out
})

gulp.task( 'default', ['client'] )