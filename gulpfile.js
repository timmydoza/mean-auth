var gulp = require('gulp');
var mocha = require('gulp-mocha');
var jshint = require('gulp-jshint');

gulp.task('default', ['lint', 'test']);

gulp.task('lint', function() {
  gulp.src(['gulpfile.js', 'server.js', 'test/*test.js', 'lib/**/*.js'])
  .pipe(jshint())
  .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('test', function() {
  gulp.src('./test/*test.js')
  .pipe(mocha({reporter: 'nyan'}));
});
