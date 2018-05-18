// npm i --save-dev gulp gulp-sass gulp-postcss autoprefixer gulp-clean-css gulp-uglify gulp-rename run-sequence del browser-sync

const gulp = require("gulp");
const del = require("del");                              // удалить директорию, файл
const autoprefixer = require("autoprefixer");            // https://github.com/postcss/autoprefixer#gulp
const postcss = require("gulp-postcss");                 // здесь нужен для автопрефиксера
const sass = require("gulp-sass");                       // трансляция SCSS -> CSS
const mincss = require("gulp-clean-css");                // минификация CSS
const minjs = require("gulp-uglify");                    // минификация JS
const rename = require("gulp-rename");                   // переименовать директорию, файл
const runsequence = require("run-sequence");             // некоторые задачи надо выполнять последовательно
const browsersync = require("browser-sync").create();    // сервер с поддержкой автообновления при изменении файлов

const paths = {
  src: {
    fonts: "./src/fonts/*.{woff2,woff}",
    html: "./src/*.html",
    img: "./src/img/**/*.{jpg,png,svg}",
    js: "./src/js/**/*.js",
    css: "./src/css",
    scss: "./src/scss/style.scss",
    scssforwatch: "./src/scss/**/*.scss"
  },
  output: {
    fonts: "./build/fonts",
    html: "./build",
    img: "./build/img",
    js: "./build/js",
    css: "./build/css",
    minCssFilename: "bundle.min.css",
  },
  build: "./build"
};

gulp.task("clean", () => {
  return del(paths.build, {force: true});
});

gulp.task("fonts", () => {
  return gulp.src(paths.src.fonts)
    .pipe(gulp.dest(paths.output.fonts));
});

gulp.task("html", () => {
  return gulp.src(paths.src.html)
    .pipe(gulp.dest(paths.output.html));
});

gulp.task("img", () => {
  return gulp.src(paths.src.img)
    .pipe(gulp.dest(paths.output.img));
});

gulp.task("js", () => {
  return gulp.src(paths.src.js)
    .pipe(minjs())
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(gulp.dest(paths.output.js))
    .pipe(browsersync.stream());
});

gulp.task("css", () => {
  return gulp.src(paths.src.scss)
    .pipe(sass())                                 // SCSS -> CSS
    .pipe(postcss([autoprefixer({                 // префиксы
      browsers: ["last 2 versions", "not ie 10", "Firefox ESR"]
    })]))
    .pipe(rename(paths.output.minCssFilename))
    .pipe(gulp.dest(paths.src.css))               // чтобы при разработке также был валидным путь до bundle в html
    .pipe(mincss({                                // минификация
      level: {1: {specialComments: false}}
    }))
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
  gulp.watch(paths.src.js, ["js"]);
  gulp.watch(paths.src.scssforwatch, ["css"]);
});

gulp.task("build", () => {
  runsequence("clean", ["fonts", "html", "img", "js", "css"]);
});

gulp.task("start", () => {
  runsequence("clean", ["fonts", "html", "img", "js", "css", "syncserver"]);
});
