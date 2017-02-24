var gulp = require('gulp'),
sass = require('gulp-sass'),
autoprefixer = require('gulp-autoprefixer'),
plumber = require('gulp-plumber'),
fileinclude = require('gulp-file-include'),
uglify = require('gulp-uglify'),
browserSync = require('browser-sync'),
htmlmin = require('gulp-htmlmin'),
changed = require('gulp-changed');

gulp.task('sass', function() {
	gulp.src(['src/scss/main.scss'])
	.pipe(plumber())
	.pipe(sass({ outputStyle: 'compressed', }))
	.pipe(autoprefixer())
	.pipe(gulp.dest('app/css/'))
	.pipe(browserSync.reload({ stream: true }));
});

gulp.task('js', function() {
	gulp.src(['src/js/main.js'])
	.pipe(fileinclude({
		prefix: '@@',
		basepath: '@file'
	}))
	.pipe(gulp.dest('app/js/'))
	.pipe(browserSync.reload({ stream: true }));
});

gulp.task('html', function () {
	gulp.src(['src/**/*.html'])
	.pipe(fileinclude({ prefix: '@@', basepath: '@file' }))
	.pipe(changed('app/'))
	.pipe(htmlmin({collapseWhitespace: true}))
	.pipe(plumber())
	.pipe(gulp.dest('app/'))
	.pipe(browserSync.reload({ stream: true }));
});

gulp.task('fileinclude', function() {
	return gulp.src('src/**/*.html')
	.pipe(changed('app/', {hasChanged: changed.compareSha1Digest}))
	.pipe(fileinclude())
	.pipe(gulp.dest('app/'))
	.pipe(browserSync.reload({ stream: true }));
});

gulp.task('browserSync', function() {
	browserSync({
		server: 'app',
		notify: false,
		ghostMode: false
	});
});

gulp.task('watch', function() {
	gulp.watch(['src/scss/**/*.scss', 'src/scss/modules/**/*.scss', 'src/scss/utility/**/*.scss'], ['sass']);
	gulp.watch(['src/**/*.html', 'src/modules/**/*.html'], ['html']);
	gulp.watch(['src/js/**/*.js'], ['js']);
	gulp.watch(['src/img/*'], ['browserSync']);
	gulp.watch('src/modules/**/*.html', ['fileinclude']);
});

gulp.task('default', ['sass', 'html', 'watch', 'browserSync', 'fileinclude']);
