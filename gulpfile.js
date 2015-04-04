var gulp        = require('gulp');
var sass        = require('gulp-sass');
var pleeease    = require('gulp-pleeease');
var concat      = require('gulp-concat');
var uglify      = require('gulp-uglify');
var browserSync = require('browser-sync');
var reload      = browserSync.reload;

// Sass

gulp.task('sass', function () {
    gulp.src('src/sass/**/*.scss')
        .pipe(sass({errLogToConsole: true}))
        .pipe(pleeease({
            autoprefixer: {
                browsers: ['last 2 versions']
            }
        }))
        .pipe(gulp.dest('examples/css'))
        .pipe(reload({stream:true}));
});

// Js-concat-uglify

gulp.task('js', function() {
    gulp.src(['src/js/*.js'])
        .pipe(concat('transcroller.js'))
        // .pipe(gulp.dest('dist/js'))
        .pipe(uglify({preserveComments: 'some'}))
        .pipe(gulp.dest('dist/js'))
        .pipe(reload({stream:true}));
});

// Static server

gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: "./"
        }
    });
});

// Reload all browsers

gulp.task('bs-reload', function () {
    browserSync.reload();
});

// Task for `gulp` command

gulp.task('default',['browser-sync'], function() {
    gulp.watch('src/sass/**/*.scss',['sass']);
    gulp.watch('src/js/*.js',['js']);
    gulp.watch("*.html", ['bs-reload']);
});