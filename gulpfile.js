var gbrowserify = require( 'gulp-browserify' ),
    gulp = require( 'gulp' ),
    buffer = require( 'vinyl-buffer' ),
    uglify = require( 'gulp-uglify' ),
    rename = require( 'gulp-rename' ),
    replace = require( 'gulp-replace' ),
    insert = require( 'gulp-insert' );
    gutil = require('gulp-util'),
    source = require('vinyl-source-stream'),
    watchify = require('watchify'),
    browserify = require('browserify');

gulp.task( 'client', function(){
  var out = gulp.src( './js/main.js')
    .pipe( gbrowserify({ standalone:'Gibber', bare:true }) )
    .pipe( replace(/Gibber\=/g, '_Gibber=')) // TODO get rid of this... why is browserify messing with the global Gibber object?
    .pipe( rename('index.js') )
    .pipe( gulp.dest('./js') )
    // .pipe( buffer() )
    // .pipe( uglify() )
    // .pipe( rename('gibber.lib.min.js') )
    // .pipe( gulp.dest('./build/') )
      
    return out
});

gulp.task('watch', function() {
  var bundler = watchify( browserify('./js/main.js', watchify.args ) );

  // Optionally, you can apply transforms
  // and other configuration options on the
  // bundler just as you would with browserify
  //bundler.transform('brfs');

  bundler.on('update', rebundle);

  function rebundle() {
    console.log("recompiling... ", Date.now() )
    return bundler.bundle()
      // log errors if they happen
      .on('error', gutil.log.bind(gutil, 'Browserify Error'))
      .pipe( source( 'bundle.js' ) )
      .pipe( rename( 'index.js' ) )
      .pipe( gulp.dest( './js' ) )
  }

  return rebundle();
});

gulp.task( 'default', ['client'] )