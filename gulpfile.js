const gulp = require('gulp');
const sass = require('gulp-sass');
const useref = require('gulp-useref');
const uglify = require('gulp-uglify');
const gulpIf = require('gulp-if');
const cssnano = require('gulp-cssnano');
const imagemin = require('gulp-imagemin')
const cache = require('gulp-cache');
const runSequence = require('run-sequence');
const del = require('del');

const browserSync = require('browser-sync').create();

// gulp.src tells the Gulp task what files to use for the task,
// while gulp.dest tells Gulp where to output the files once
// the task is completed.

// Preprocessing with gulp
gulp.task('sass', function () {
	return gulp.src('app/scss/**/*.scss')
		.pipe(sass()) // Using gulp-sass
		.pipe(gulp.dest('app/css'))
		.pipe(browserSync.reload({
			stream: true
		}))
});

// Since we’re running a server, we need to let Browser 
// Sync know where the root of the server should be. 
// In our case, it’s the `app` folder:
gulp.task('browserSync', function () {
	browserSync.init({
		server: {
			baseDir: 'app'
		},
	})
});

//task to watch the changes during the development
gulp.task('watch', function () {
	gulp.watch('app/scss/**/*.scss', ['sass']);
	gulp.watch('app/*.html', browserSync.reload);
	gulp.watch('app/js/**/*.js', browserSync.reload);
})

// 1. Concatenate all JS scripts in only one to dist folder 
// 2. We’ll have to use the gulp-uglify plugin to help with minifying JavaScript files.
//We also need a second plugin called gulp-if to ensure that we only attempt to minify
//JavaScript files.
// 3. the concatenated CSS file as well. We need to use a
// package called gulp-cssnano plugin to help us with minification.
gulp.task('useref', function () {
	return gulp.src('app/*.html')
		.pipe(useref())
		// Minifies only if it's a JavaScript file
		.pipe(gulpIf('*.js', uglify()))
		// Minifies only if it's a CSS file
		.pipe(gulpIf('*.css', cssnano()))
		.pipe(gulp.dest('dist'))
});

// We can minify png, jpg, gif and even svg with the help of gulp-imagemin.
// Let’s create an images task for this optimization process.
gulp.task('images', function () {
	return gulp.src('app/images/**/*.+(png|jpg|jpeg|gif|svg)')
		// Caching images that ran through imagemin
		.pipe(cache(imagemin({
			interlaced: true
		})))
		.pipe(gulp.dest('dist/images'))
});

// Now Gulp will copy `fonts` from `app` to `dist` whenever you run gulp fonts.
gulp.task('fonts', function () {
	return gulp.src('app/fonts/**/*')
		.pipe(gulp.dest('dist/fonts'))
})

// Since we’re generating files automatically, we’ll want 
// to make sure that files that are no longer used don’t remain
// anywhere without us knowing.
gulp.task('clean:dist', function () {
	return del.sync('dist');
})

// To clear the caches off your local system, you can
// create a separate task that’s named`cache:clear`
gulp.task('cache:clear', function (callback) {
	return cache.clearAll(callback)
})

// 1. tasks that we need to run to create the production website. 
// 2. Here’s the syntax of a task sequence with run sequence
// 3. Run Sequence also allows you to run tasks simultaneously
// if you place them in an array
gulp.task('build', function (callback) {
	runSequence('clean:dist',
		['sass', 'useref', 'images', 'fonts'],
		callback
	)
})

// 1. Now, we have to run both the watch and browserSync
// tasks at the same time for live-reloading to occur.
// 2. watch method that checks to see if a file was saved
// 3. make sure sass runs before watch so the CSS will
// already be the latest whenever we run a Gulp command.
// 4. Gulp activates all tasks in the second argument simultaneously.
gulp.task('default', function (callback) {
	runSequence(['sass', 'browserSync'], 'watch',
		callback
	)
})
