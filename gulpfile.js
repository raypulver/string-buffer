var gulp = require('gulp'), uglify = require('gulp-uglify'), rename = require('gulp-rename');
gulp.task('default', [], function () {
  gulp.src('./string-buffer.js').pipe(uglify()).pipe(rename('string-buffer.min.js')).pipe(gulp.dest('./'));
});
