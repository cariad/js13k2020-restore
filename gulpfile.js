const gulp = require("gulp");
const { parallel, series } = require('gulp');
const htmlmin = require("gulp-htmlmin");
var micro = require('gulp-micro');
var size = require('gulp-size');
var zip = require('gulp-zip');
var rimraf = require('rimraf');
var cssmin = require('gulp-cssmin');
const terser = require('gulp-terser');
var inject = require('gulp-inject');

function clean(cb) {
  rimraf.sync('build');
  cb();
}

function lintMarkdown(cb) {
  const markdownlint = require("markdownlint");

  const options = {
    "files": ["README.md", "README.md"],
  };

  markdownlint(options, function callback(err, result) {
    cb(err || result.toString());
  });
}

function minifyCss() {
  return gulp
    .src(`src/style.css`)
    .pipe(cssmin())
    .pipe(gulp.dest(`build`));
}

function minifyJs() {
  return gulp.src(`src/game.js`)
    .pipe(terser({
      toplevel: true,
      compress: {
        passes: 100,
        unsafe: true,
        pure_getters: true
      },
      mangle: { toplevel: true }
    }))
    .pipe(gulp.dest(`build`));
}

function readFile(filename, file) {
  return file.contents.toString('utf8');
}

function bundle() {
  return gulp
    .src('src/index.html')
    .pipe(inject(gulp.src(['build/game.js']), {
      starttag: '<!-- inject:js -->',
      transform: readFile,
      removeTags: true
    }))
    .pipe(inject(gulp.src(['build/style.css']), {
      starttag: '<!-- inject:css -->',
      transform: readFile,
      removeTags: true
    }))
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeAttributeQuotes: true,
      removeComments: true,
    }))
    .pipe(gulp.dest('.'));
}



function pack() {
  return gulp.src('index.html')
    .pipe(zip('remote.zip'))
    .pipe(size())
    .pipe(micro({ limit: 13 * 1024 }))
    .pipe(gulp.dest('.'));
}

function watch() {
  gulp.watch('src/*.*', build);
}

const build = series(
  clean,
  parallel(lintMarkdown),
  series(
    parallel(minifyJs, minifyCss),
    bundle,
  ),
  pack,
);

exports.default = series(build, watch);
exports.build = build;
