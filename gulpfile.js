var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    jshint = require('gulp-jshint'),
    cleanCSS = require('gulp-clean-css'),
    sourcemaps = require('gulp-sourcemaps');

var jsFiles = [
  "src/version-compare.js",
  "src/je.category.model.js",
  "src/je.category.view.js",
  "src/je.issue.model.js",
  "src/je.issue.view.js",
  "src/je.occurrence.model.js",
  "src/je.occurrence.view.js",
  "src/je.assist.model.js",
  "src/je.assist.view.js",
  "src/je.router.js",
  "src/je.utils.js",
  "src/je.rest.service.js",
  "src/main.js"
];

var cssFiles = [
  "src/compassweb.css"
];

gulp.task('minify-js', function () {
  return gulp.src(jsFiles)
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
      .pipe(sourcemaps.init())
      .pipe(concat('compassweb.js'))
      .pipe(gulp.dest('build'))
      .pipe(rename({
          suffix: '.min'
      }))
      .pipe(uglify())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('build'));
});

gulp.task('minify-css', function() {
  return gulp.src(cssFiles)
    .pipe(sourcemaps.init())
    .pipe(cleanCSS())
    .pipe(rename({
        suffix: '.min'
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('build'));
});

gulp.task('watch', function() {
  gulp.watch(jsFiles.concat(cssFiles), ['build']);
});

gulp.task('build', ['minify-js', 'minify-css']);

gulp.task('default', ['build', 'watch']);
