var browserify = require( 'gulp-browserify' ),
    gulp = require( 'gulp' ),
    buffer = require( 'vinyl-buffer' ),
    uglify = require( 'gulp-uglify' ),
    rename = require( 'gulp-rename' ),
    replace = require( 'gulp-replace' ),
    insert = require( 'gulp-insert' );

gulp.task( 'client', function(){
  var out = gulp.src( './js/main.js')
    .pipe( browserify({ standalone:'Gibber', bare:true }) )
    .pipe( replace(/Gibber\=/g, '_Gibber=')) // TODO get rid of this... why is browserify messing with the global Gibber object?
    .pipe( rename('index.js') )
    .pipe( gulp.dest('./js') )
    // .pipe( buffer() )
    // .pipe( uglify() )
    // .pipe( rename('gibber.lib.min.js') )
    // .pipe( gulp.dest('./build/') )
    
    return out
});

gulp.task( 'default', ['client'] )