'use strict';
// Require our dependencies

//const autoprefixer = require( 'autoprefixer' );
const babel = require( 'gulp-babel' );
const browserSync = require( 'browser-sync' ).create();
const concat = require( 'gulp-concat' );
const del = require( 'del' );
const destFolder = 'dist/';
const eslint = require( 'gulp-eslint' );
const gulp = require( 'gulp' );
const gutil = require( 'gulp-util' );
const notify = require( 'gulp-notify' );
const pkg = require( './package.json' );
const pleeease = require( 'gulp-pleeease' );
const plumber = require( 'gulp-plumber' );
const preprocess = require( 'gulp-preprocess' );
const reload = browserSync.reload;
const rename = require( 'gulp-rename' );
const sass = require( 'gulp-sass' );
const sassdoc = require( 'sassdoc' );
const sassLint = require( 'gulp-sass-lint' );
const sourcemaps = require( 'gulp-sourcemaps' );
const stripDebug = require( 'gulp-strip-debug' );
const uglify = require( 'gulp-uglify' );
const { src, task } = require( 'gulp' );
const devBuild = ( ( process.env.NODE_ENV || 'development' )
   .trim().toLocaleLowerCase() !== 'production' );


/**
 * @description development path object
 */
const paths = {
   'css': [ 'app/css/**/*.css' ],
   'js': [ 'gulpfile.js', 'app/js/**/*.js' ],
   'scss': [ 'app/scss/**/*.scss' ],
   'tests': [ 'tests/spec/**/*.js' ],
};

const path = {
   'css': [ 'app/css/' ]
};

/**
 * @description distrobution directory, where the production code goes
 */
const dist = {
   'css': [ './dist/css/' ],
   'js': [ './dist/js/' ],
};

/**
 * @description html config object
 */
const html = {
   in: [ 'app/**/*.html' ],
   out: [ './dist/' ],
   context: {
      devBuild: devBuild,
      author: pkg.author,
      version: pkg.version,
   },
};

/**
 * @description config object
 */
const pleeeaseOpts = {
   'in': 'app/scss/style.css',
   'out': 'dist/css/style.css',
   'autoprefixer': { 'browsers': [ 'last 2 versions', '> 2%' ] },
   'rem': [ '18px' ],
   'pseudoElements': true,
   'mqpacker': true,
   'minifier': !devBuild,
};

/**
 * @description jasmine config object
 */
const jasmine = {
   'in': 'app/scss/',
   'out': 'app/css/'
};

/**
 * Handle errors and alert the user.
 */
function handleErrors() {
   const args = Array.prototype.slice.call( arguments );

   notify.onError( {
                      'title': 'Task Failed [<%= error.message %>',
                      'message': 'See console.',
                      'sound': 'Sosumi', // See: https://github.com/mikaelbr/node-notifier#all-notification-options-with-their-defaults
                   } ).apply( this, args );

   gutil.beep(); // Beep 'sosumi' again.

   // Prevent the 'watch' task from stopping.
   this.emit( 'end' );
}

/**
 * @description process and copy html files to dist
 */
gulp.task( 'html', function() {
   return gulp.src( html.in )
              // Deal with errors.
              .pipe( plumber( { 'errorHandler': handleErrors } ) )
              .pipe( preprocess( { context: html.context } ) ) // pass object with temp vars
              .pipe( gulp.dest( html.out ) );
} );


/**
 * @description sass compiler and copies files
 */
// compile Sass
gulp.task( 'styles', function( done ) {
   del( [ dist.css + 'style.css', dist.css + 'style.min.css' ] );
   gulp.src( paths.scss )
       // Deal with errors.
       .pipe( plumber(
          { 'errorHandler': handleErrors }
       ) )
       .pipe( rename( {
                         extname: '.css',
                      } ) )
       .pipe( gulp.dest( path.css ) )
       .pipe( gulp.dest( dist.css ) )
       .pipe( pleeease() )
       .pipe( rename( {
                         suffix: '.min',
                         extname: '.css',
                      } ) )
       .pipe( gulp.dest( path.css ) )
       .pipe( gulp.dest( dist.css ) )
       .pipe( browserSync.reload( { stream: true } ) );
   done();
} );

/**
 * @description create sass maps to make it easier to debug
 */
gulp.task( 'maps', function( done ) {
   gulp.src( paths.scss, { base: '.' } )
       // Deal with errors.
       .pipe( plumber( { 'errorHandler': handleErrors } ) )
       .pipe( sourcemaps.init() )
       .pipe( pleeease() )
       .pipe( sourcemaps.write() )
       .pipe( gulp.dest( './dist' ) );
   done();
} );

/**
 * Sass linting.
 *
 * https://www.npmjs.com/package/sass-lint
 */
gulp.task( 'sass:lint', () =>
   gulp.src( paths.scss )
       .pipe( sassLint() )
       .pipe( sassLint.format() )
       .pipe( sassLint.failOnError() )
);

/**
 * Sass docs.
 *
 * http://sassdoc.com/getting-started/
 */
gulp.task( 'sassdoc', function() {
   let options = {
      dest: 'docs',
      verbose: true
   };

   return gulp.src( paths.scss )
              .pipe( sassdoc( options ) );
} );

/**
 * Concatenate and transform JavaScript.
 *
 * https://www.npmjs.com/package/gulp-concat
 * https://github.com/babel/gulp-babel
 */
gulp.task( 'concat', () =>
   gulp.src( paths.js )

       // Deal with errors.
       .pipe( plumber( { 'errorHandler': handleErrors } ) )

       // Convert ES6+ to ES2015.
       .pipe( babel( {
                        presets: [ 'ES2015' ],
                     } ) )

       // Concatenate partials into a single script.
       .pipe( concat( 'app.js' ) )

       // Save the file.
       .pipe( gulp.dest( destFolder ) )
);

/**
 * Minify compiled JavaScript.
 *
 * https://www.npmjs.com/package/gulp-uglify
 */
gulp.task( 'scripts', function( done ) {
   if ( devBuild ) {
      gulp.src( paths.js )
          .pipe( plumber( { 'errorHandler': handleErrors } ) )

          // Convert ES6+ to ES2015.
          .pipe( babel( {
                           presets: [ 'ES2015' ],
                        } ) )
          .pipe( gulp.dest( dist.js ) );
   } else {
      gulp.src( paths.js )
          .pipe( concat( 'app.js' ) )
          .pipe( plumber( { 'errorHandler': handleErrors } ) )

          // Convert ES6+ to ES2015.
          .pipe( babel( {
                           presets: [ 'ES2015' ],
                        } ) )
          .pipe( stripDebug() )
          .pipe( uglify() )
          .pipe( rename( { 'suffix': '.min' } ) )
          .pipe( gulp.dest( dist.js ) );
   }
   done();
} );

/**
 * JavaScript linting.
 *
 * https://www.npmjs.com/package/gulp-eslint
 */
gulp.task( 'js:lint', () => {
   gulp.src( paths.js )
       .pipe( eslint() )
       .pipe( eslint.format() )
       .pipe( eslint.failAfterError() );
} );

gulp.task( 'browser-sync', function() {
   browserSync.init( {
                        server: {
                           serveStaticOptions: {
                              extensions: [ 'html' ],
                           },
                           baseDir: 'app/',
                           index: 'index.html',
                        },
                     } );
} );

/**
 * Process tasks and reload browsers on file changes.
 *
 * https://www.npmjs.com/package/browser-sync
 */
gulp.task( 'watch', function() {
   browserSync.init( {
                        server: {
                           serveStaticOptions: {
                              extensions: [ 'html' ],
                           },
                           baseDir: 'app/',
                           index: 'index.html',
                        },
                     } );

   // Run tasks when files change.
   gulp.watch( html.in, gulp.series( 'html', browserSync.reload ) );
   gulp.watch( paths.css, gulp.series( 'styles' ) );
   gulp.watch( paths.js, gulp.series( 'scripts', browserSync.reload ) );
   gulp.watch( paths.js, gulp.series( 'js:lint' ) );
   gulp.watch( paths.scss, gulp.series( 'sass:lint' ) );
} );

/**
 * Create individual tasks.
 */
gulp.task( 'browser-sync', gulp.series( 'browser-sync' ) );
gulp.task( 'html', gulp.series( 'html' ) );
gulp.task( 'scripts', gulp.series( 'scripts' ) );
gulp.task( 'styles', gulp.series( 'styles' ) );
gulp.task( 'maps', gulp.series( 'maps' ) );
gulp.task( 'jsLint', gulp.series( 'js:lint' ) );
gulp.task( 'sassLint', gulp.series( 'sass:lint' ) );
gulp.task( 'sassdoc', gulp.series( 'sassdoc' ) );
