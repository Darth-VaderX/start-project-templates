const { src, dest, watch, parallel, series } = require('gulp');
const browserSync = require('browser-sync').create();
const concatFile = require('gulp-concat');
const clean = require('gulp-clean');
const htmlmin = require('gulp-htmlmin');
const autoprefixer = require('gulp-autoprefixer');
const sass = require('gulp-sass')(require('sass'));
const compressCSS = require('gulp-clean-css');
const compressJS = require('gulp-uglify-es').default;
const babel = require('gulp-babel');
const avif = require('gulp-avif');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const fonter = require('gulp-fonter');
const ttf2woff2 = require('gulp-ttf2woff2');

const html = () => {
    return src('src/*.html')
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(dest('dist'));
};

const styles = () => {
    return src(['src/css/*.scss', 'src/css/*.css'])
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], cascade: false }))
        .pipe(compressCSS({ compatibility: 'ie8' }))
        .pipe(concatFile('style.min.css'))
        .pipe(dest('dist/css'))
        .pipe(browserSync.stream());
};

const scripts = () => {
    return src(['src/js/index.js'])
        .pipe(concatFile('index.min.js'))
        .pipe(babel({ presets: ['@babel/env'] }))
        .pipe(compressJS())
        .pipe(dest('dist/js'))
        .pipe(browserSync.stream());
};

const watching = () => {
    browserSync.init({
        server: {
            baseDir: 'dist/',
        },
    });
    watch(['src/css/*.{css, scss}'], styles);
    watch(['src/js/*.js'], scripts);
    watch(['src/*.html']).on('change', browserSync.reload);
    watch(['src/assets/images'], images);
};

const cleanDir = () => {
    return src(['dist/*']).pipe(clean());
};

const images = () => {
    return src(['src/assets/images/*.*', '!src/assets/images/*.svg'])
        .pipe(newer('dist/assets/images'))
        .pipe(avif({ quality: 50 }))

        .pipe(src(['src/assets/images/*.*']))
        .pipe(newer('dist/assets/images'))
        .pipe(webp())

        .pipe(src(['src/assets/images/*.*']))
        .pipe(newer('dist/assets/images'))
        .pipe(imagemin())

        .pipe(dest('dist/assets/images'));
};

const fonts = () => {
    return src('src/fonts/*.*')
        .pipe(fonter({ formats: ['woff'] }))
        .pipe(dest('dist/fonts'))
        .pipe(src('dist/fonts/*.woff'))
        .pipe(ttf2woff2())
        .pipe(dest('dist/fonts'));
};

exports.clean = cleanDir;
exports.fonts = fonts;
exports.html = html;
exports.images = images;
exports.scripts = scripts;
exports.styles = styles;
exports.watching = watching;

exports.build = series(cleanDir, html, styles, scripts, fonts, images);
exports.default = parallel(html, styles, scripts, watching);
