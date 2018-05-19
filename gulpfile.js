const gulp = require("gulp");
const del = require("del");                              // to delete directory, file
const autoprefixer = require("autoprefixer");            // https://github.com/postcss/autoprefixer#gulp
const postcss = require("gulp-postcss");                 // here we need to autoprefix
const sass = require("gulp-sass");                       // CSS -> CSS translation
const mincss = require("gulp-clean-css");                // CSS minification
const inlinecss = require('gulp-inline-css');            // inline CSS
const minhtml = require('gulp-htmlmin');                 // HTML minification
const rename = require("gulp-rename");                   // to rename directory, file
const fileinclude = require('gulp-file-include');        // to include file
const runsequence = require("run-sequence");             // some tasks must be performed sequentially
const browsersync = require("browser-sync").create();    // server with auto-update support when files are changed

const paths = {
  src: {
    html: "./src/*.html",
    img: "./src/img/**/*.{jpg,png,svg}",
    css: "./src/css",
    scss: "./src/scss/style.scss",
    scssforwatch: "./src/scss/**/*.scss"
  },
  output: {
    html: "./build",
    img: "./build/img",
    css: "./build/css",
    minCssFilename: "bundle.min.css",
  },
  build: "./build"
};

gulp.task("clean", () => {
  return del(paths.build, {force: true});
});

gulp.task("html", () => {
  return gulp.src(paths.src.html)
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(inlinecss({
      applyStyleTags: true,
      applyLinkTags: true,
      removeStyleTags: true,
      removeLinkTags: true
    }))
    .pipe(minhtml({collapseWhitespace: true}))
    .pipe(gulp.dest(paths.output.html));
});

gulp.task("img", () => {
  return gulp.src(paths.src.img)
    .pipe(gulp.dest(paths.output.img));
});

gulp.task("css", () => {
  return gulp.src(paths.src.scss)
    .pipe(sass())                                 // SCSS -> CSS
    .pipe(postcss([autoprefixer({                 // префиксы
      browsers: ["last 2 versions", "not ie 10", "Firefox ESR"]
    })]))
    .pipe(rename(paths.output.minCssFilename))
    .pipe(mincss({                                // минификация
      level: {1: {specialComments: false}}
    }))
    .pipe(gulp.dest(paths.src.css))
    .pipe(gulp.dest(paths.output.css))
    .pipe(browsersync.stream());
});

gulp.task("syncserver", () => {
  browsersync.init({ // all init options: https://browsersync.io/docs/options
    server: {
      baseDir: paths.build
    }
  });
  gulp.watch(paths.src.html, ["html"]).on("change", browsersync.reload);
  gulp.watch(paths.src.scssforwatch, ["css", "html"]).on("change", browsersync.reload);
});

gulp.task("build", () => {
  runsequence("clean", ["img", "css", "html"]);
});

gulp.task("start", () => {
  runsequence("clean", ["img", "css", "html", "syncserver"]);
});
