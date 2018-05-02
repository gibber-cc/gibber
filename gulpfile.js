// XXX this needs to be refactored... pretty old stuff in here.

const gulp = require( 'gulp' ),
      buffer = require( 'vinyl-buffer' ),
      uglify = require( 'gulp-uglify' ),
      watchify = require( 'watchify' ),
      browserify = require( 'browserify' ),
      source = require('vinyl-source-stream'),
      rename = require( 'gulp-rename' );

gulp.task( 'client', function(){
  //var out = gulp.src( './js/audio.js' )//gulp.src( './node_modules/gibber.core.lib/scripts/gibber.js')
  const out = browserify({ standalone:'Gibber' })
    .require( './js/audio.js', { entry: true })
    .bundle()
    //ignore:[
    //  'gibber.graphics.lib/scripts/gibber/graphics/graphics',
    //  'gibber.interface.lib/scripts/gibber/interface/interface',
    //  'gibber.audio.lib/scripts/gibber/audio'
    //]
    .pipe( source('gibber.audio.js' ) )
    .pipe( gulp.dest('./dist/') )
/*    .pipe( buffer() )
    .pipe( uglify() )
    .pipe( rename('gibber.audio.lib.min.js') )
    .pipe( gulp.dest('./build/') )
*/    
    return out
});

gulp.task('watch', function() {
  var bundler = watchify( browserify('./scripts/gibber/audio.lib.js', { standalone:'Gibber', cache: {}, packageCache: {}, fullPaths: true } ) );

  bundler.on('update', rebundle);

  function rebundle() {
    console.log("recompiling... ", Date.now() )
    return bundler.bundle()
      // log errors if they happen
      .on('error', gutil.log.bind(gutil, 'Browserify Error'))
      .pipe( source( 'bundle.js' ) )
      .pipe( rename( 'gibber.audio.lib.js' ) )
      .pipe( gulp.dest( './build' ) )
      // .pipe( uglify() )
      // .pipe( rename('gibber.audio.lib.min.js') )
      // .pipe( gulp.dest('./build/') )
  }

  return rebundle();
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
