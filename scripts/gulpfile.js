var gulp = require('gulp');
var screeps = require('gulp-screeps');
var credentials = require('../credentials.js');
// See https://github.com/screepers/gulp-screeps

gulp.task('screeps', function() {
    return gulp.src('../build/*.js')
        .pipe(screeps(credentials));
});