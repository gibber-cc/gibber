const gulp        = require( 'gulp' ),
      buffer      = require( 'vinyl-buffer' ),
      uglify      = require( 'gulp-uglify' ),
      replace     = require( 'gulp-replace' ),
      watchify    = require( 'watchify' ),
      browserify  = require( 'browserify' ),
      source      = require( 'vinyl-source-stream' ),
      fs          = require( 'fs' ),
      dotenv      = require( 'dotenv' ),
      envify      = require( 'envify' )

dotenv.config({ path:'./playground/.env' })

gulp.task( 'client', function(){
  const out = browserify({ transform:['envify'] })
    .require( './playground/environment.js', { entry: true })
    .bundle()
    .on( 'error', console.log )
    .pipe( source( 'bundle.js' ) )
    .pipe( gulp.dest( './playground' ) )
/*    .pipe( buffer() )
    .pipe( uglify() )
    .pipe( rename('gibber.audio.lib.min.js') )
    .pipe( gulp.dest('./build/') )
*/    
    return out
});

gulp.task('watch', function() {
  var bundler = watchify( browserify( './playground/environment.js', { entry:true, transform:['envify'] } ) );

  bundler.on('update', rebundle);

  function rebundle() {
    const date = new Date()
    console.log("recompiling... ", date.getHours(), date.getMinutes(), date.getSeconds() )
    return bundler.bundle()
      // log errors if they happen
      .on( 'error', console.log ) 
      .pipe( source( 'bundle.js' ) )
      .pipe( gulp.dest( './playground/' ) )
      // .pipe( uglify() )
      // .pipe( rename('gibber.audio.lib.min.js') )
      // .pipe( gulp.dest('./build/') )
  }

  return rebundle();
});

gulp.task( 'default', ['client'] )
