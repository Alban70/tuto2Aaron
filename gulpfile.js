// #####################################################################
// # ENABLE .ENV FILE SUPPORT
// #####################################################################
require('dotenv').config();

// #####################################################################
// # REQUIRE GULP
// #####################################################################
const { src, dest, task, watch, series, parallel } = require('gulp');

// #####################################################################
// # STYLES RELATED
// #####################################################################
const sass              = require('gulp-sass');
const autoprefixer      = require('gulp-autoprefixer');

// #####################################################################
// # JAVASCRIPT RELATED
// #####################################################################
const uglify            = require("gulp-uglify");
const babelify          = require("babelify");
const browserify        = require("browserify");
const source            = require("vinyl-source-stream");
const buffer            = require("vinyl-buffer");

// #####################################################################
// # UTILITIES
// #####################################################################
const rename            = require('gulp-rename');
const sourcemaps        = require('gulp-sourcemaps');
const plumber           = require('gulp-plumber');

// #####################################################################
// # BROWSER RELATED
// #####################################################################
const browserSync       = require('browser-sync').create();

// #####################################################################
// # PROJECT RELATED
// #####################################################################
const siteURL           = process.env.SITE_URL;
const externalURL       = process.env.EXTERNAL_URL;
const assetsURL         = process.env.DIST;
const assetsSRC         = process.env.SRC;

const styleSRC          = [ assetsSRC + '/scss/app.scss' ]
const styleWatch        = assetsSRC + '/scss/**/*.scss';

const scriptSRC         = 'app.js';
const scriptFolder      = assetsSRC + '/js/';
const scriptWatch       = assetsSRC + '/js/**/*.js';
const scriptFiles       = [scriptSRC];

// #####################################################################
// # FUNCTIONS
// #####################################################################
function browser_sync(done) {
    browserSync.init({
        open: false,
        proxy: siteURL,
        host: externalURL,
        port: 3000,
        notify: false
    });
    done();
}

function reload(done) {
    browserSync.reload();
    done();
}

function styles(done) {
    src(styleSRC, {allowEmpty: true})
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass({errLogToConsole: true, outputStyle: 'compressed'}))
    .on('error', console.error.bind(console))
    .pipe(autoprefixer({browsers: ['last 2 versions', '> 5%', 'Firefox ESR']}))
    .pipe(rename({extname: '.min.css'}))
    .pipe(sourcemaps.write('./'))
    .pipe(dest(assetsURL + '/css'))
    .pipe(browserSync.stream());
    done();
}

function scripts(done) {
    scriptFiles.map( function( entry ) {
        return browserify({entries: [scriptFolder + entry]})
        .transform(babelify, {presets: ['@babel/preset-env']})
        .bundle()
        .pipe(source(entry))
        .pipe(rename({extname: '.min.js'}))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(dest(assetsURL + '/js'))
        .pipe(browserSync.stream());
    });
    done();
}

function watch_files() {
    watch(styleWatch, series(styles, reload));
    watch(scriptWatch, series(scripts, reload));
}

// #####################################################################
// # GULP TASKS
// #####################################################################
task('default', parallel(styles, scripts));
task('watch', parallel(browser_sync, watch_files));