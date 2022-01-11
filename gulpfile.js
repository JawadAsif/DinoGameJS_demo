'use strict';
// Initialize modules
// Importing specific gulp API functions lets us write them below as series() instead of gulp.series()
const { src, dest, watch, series, parallel } = require('gulp');
// Importing all the Gulp-related packages we want to use
const sass = require('gulp-dart-sass');
const concat = require('gulp-concat');
const terser = require('gulp-terser');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const replace = require('gulp-replace');
const browsersync = require('browser-sync').create();


// File paths
const files = {
    scssPath: 'styles/**/*.scss',
    htmlPath: '**/*.html',
    jsPath: 'scripts/**/*.js',
    moduleJsPath: 'DinoGame/scripts/**/*.js',
    copyFilePaths: [
        'fonts/**/*.*',
        'img/**/*.*',
        'DinoGame/data/**/*.*',
        'DinoGame/examples/**/*.*',
        'DinoGame/libraries/**/*.*',
        'package.json',
        'package-lock.json',
        'favicon_package/**/*.*',
        '**/*.html'
    ]
};

function copyResourcesTask() {
    return src(files.copyFilePaths, { base: './' })
        .pipe(dest('dist'));
}

// function copyHtmlTask() {
//     return src('index.html', { base: './' })
//         .pipe(dest('dist'));
// }

// function deleteTask() {
//     return del('dist/**', { force: true });
// }

// Sass task: compiles the style.scss file into style.css
function scssTaskDist() {
    return src(files.scssPath, { sourcemaps: false, base: './' }) // set source and turn on sourcemaps
        .pipe(sass()) // compile SCSS to CSS
        .pipe(postcss([autoprefixer(), cssnano()])) // PostCSS plugins
        .pipe(dest('dist')); // put final CSS in dist folder with sourcemap
}

function scssTask() {
    return src(files.scssPath, { sourcemaps: true, base: './' }) // set source and turn on sourcemaps
        .pipe(sass()) // compile SCSS to CSS
        .pipe(postcss([autoprefixer()])) // PostCSS plugins
        .pipe(dest('.', { sourcemaps: '.' })); // put final CSS in dist folder with sourcemap
}
// JS task: concatenates and uglifies JS files to script.js
function jsTaskDist() {
    return src(
        [
            files.jsPath,
            files.moduleJsPath,
            // '!' + 'DinoGame/libraries/**/*.js', // to exclude any specific files
        ],
        { sourcemaps: false, base: './' }
    )
        .pipe(concat('all.js'))
        .pipe(terser())
        .pipe(dest('dist'));
}

function jsTask() {
    return src(
        [
            files.jsPath,
            files.moduleJsPath,
            // '!' + 'DinoGame/libraries/**/*.js', // to exclude any specific files
        ],
        { sourcemaps: true, base: './' }
    )
        .pipe(concat('all.js'))
        // .pipe(terser())
        .pipe(dest('.', { sourcemaps: '.' })); // put final CSS in dist folder with sourcemap
}

// Cachebust
function cacheBustTaskDist() {
    var cbString = new Date().getTime();
    return src('dist/**/*.html', { base: './' })
        .pipe(replace(/cb=\d+/g, 'cb=' + cbString))
        .pipe(dest('.'));
}

function cacheBustTask() {
    var cbString = new Date().getTime();
    return src(files.htmlPath, { base: './' })
        .pipe(replace(/cb=\d+/g, 'cb=' + cbString))
        .pipe(dest('.'));
}

// Browsersync to spin up a local server
function browserSyncServeDist(cb) {
    // initializes browsersync server
    browsersync.init({
        server: {
            baseDir: 'dist',
        },
        notify: {
            styles: {
                top: 'auto',
                bottom: '0',
            },
        },
    });
    cb();
}

function browserSyncServe(cb) {
    // initializes browsersync server
    browsersync.init({
        server: {
            baseDir: '.',
        },
        notify: {
            styles: {
                top: 'auto',
                bottom: '0',
            },
        },
    });
    cb();
}

function browserSyncReload(cb) {
    // reloads browsersync server
    browsersync.reload();
    cb();
}

// Watch task: watch SCSS and JS files for changes
// If any change, run scss and js tasks simultaneously
function watchTaskDist() {
    watch(
        [files.scssPath, files.jsPath, files.moduleJsPath],
        { interval: 1000, usePolling: true }, //Makes docker work
        series(parallel(scssTaskDist, jsTaskDist), cacheBustTaskDist)
    );
}

function watchTask() {
    watch(
        [files.scssPath, files.jsPath, files.moduleJsPath],
        { interval: 1000, usePolling: true }, //Makes docker work
        series(parallel(scssTask, jsTask), cacheBustTask)
    );
}

// Browsersync Watch task
// Watch HTML file for change and reload browsersync server
// watch SCSS and JS files for changes, run scss and js tasks simultaneously and update browsersync
function bsWatchTask() {
    watch(files.htmlPath, browserSyncReload);
    watch(
        [files.scssPath, files.jsPath, files.moduleJsPath],
        { interval: 1000, usePolling: true }, //Makes docker work
        series(parallel(scssTask, jsTask), cacheBustTask, browserSyncReload)
    );
}

function bsWatchTaskDist() {
    watch('index.html', series(cacheBustTaskDist, browserSyncReload));
    watch(
        [files.scssPath, files.jsPath, files.moduleJsPath],
        { interval: 1000, usePolling: true }, //Makes docker work
        series(parallel(scssTaskDist, jsTaskDist), cacheBustTaskDist, browserSyncReload)
    );
}

// Export the default Gulp task so it can be run
// Runs the scss and js tasks simultaneously
// then runs cacheBust, then watch task
exports.default = series(parallel(scssTask, jsTask), cacheBustTask, watchTask);

// Runs all of the above but also spins up a local Browsersync server
// Run by typing in "gulp bs" on the command line
exports.bsDist = series(
    copyResourcesTask,
    parallel(scssTaskDist, jsTaskDist),
    cacheBustTaskDist,
    browserSyncServeDist,
    bsWatchTaskDist
);

exports.bs = series(
    parallel(scssTask, jsTask),
    cacheBustTask,
    browserSyncServe,
    bsWatchTask
);

exports.build = series(
    copyResourcesTask,
    parallel(scssTaskDist, jsTaskDist),
    cacheBustTaskDist
);