// Sass configuration
var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('sass', function(cb) {
    gulp.src('./sass_styles/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('./styles'));
    cb();
});

gulp.task('default', gulp.series('sass', function(cb) {
    gulp.watch('./sass_styles/*.scss', gulp.series('sass'));
    cb();
}));