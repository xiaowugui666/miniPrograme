const less = require('gulp-less');
const cssnano = require('gulp-cssnano');
const rename = require('gulp-rename');
const clean = require('gulp-clean');
const pump = require('pump');
const preprocess = require('gulp-preprocess');

const gulp = require('gulp');
const { series, parallel, watch } = gulp;
console.log(series, parallel)

function lessPages() {
    return gulp.src([ 'src/pages/**/**.less', 'src/components/**/**.less'], {base: 'src'})
        .pipe(less())
        .pipe(cssnano({autoprefixer: false}))
        .pipe(rename(function(path){
            path.extname = '.wxss';
        }))
        .pipe(gulp.dest('dist'))
};

function lessApp() {
    return gulp.src([ 'src/app.less'], {base: 'src'})
        .pipe(less())
        .pipe(cssnano())
        .pipe(rename(function(path){
            path.extname = '.wxss';
        }))
        .pipe(gulp.dest('dist'))
};

function pages() {
    return gulp.src([
        'src/app.js',
        'src/app.json',
        'src/project.config.json',
        'src/components/**/**.js',
        'src/components/**/**.wxml',
        'src/components/**/**.json',
        'src/pages/**/**.js',
        'src/pages/**/**.wxml',
        'src/pages/**/**.json',
        'src/template/**',
        'src/imgs/**',
        'src/utils/**',
        ], {base: 'src'}).pipe(gulp.dest('dist'))
}

function auto() {
    gulp.watch(['src/app.wxss', 'src/pages/**/**.less', 'src/components/**/**.less'], lessPages);
    gulp.watch(['src/imgs/*', 'src/pages/**/**/*', 'src/components/**/**/*', 'src/utils/**', 'src/template/**.wxml', 'src/*'], pages);
}

function cleanDist(cb) {
    pump([
        gulp.src('./dist',{allowEmpty: true}),
        clean()
    ], cb)
}

function depleyPages(cb) {
    setTimeout(function(){
        cb()
    }, 500);
}

function environment() {
    return gulp.src('src/config/environment.js')
    .pipe(preprocess({
        context: {
            NODE_ENV: process.env.NODE_ENV || 'development',
          },
    }))
    .pipe(gulp.dest('dist/config'));
}

function ext() {
    let PATH = 'src/ext.false.json'
    if (process.env.NODE_ENV === 'development') {
        PATH = 'src/ext.true.json'
    }
    return gulp.src(PATH, {base: 'src'})
        .pipe(rename(function(path) {
            path.basename = 'ext'
        }))
        .pipe(gulp.dest('dist'))
};

// 使用 gulp.task('default') 定义默认任务
// 在命令行使用 gulp 启动 less 任务和 auto 任务
// gulp.task('default', ['clean'], function() {
//     gulp.start('environment', 'less', 'less-app', 'pages', 'auto')
// })

exports.default = series(
    cleanDist,
    ext,
    environment,
    parallel(lessPages, lessApp),
    depleyPages,
    pages,    
    auto
)


// // 使用 gulp.task('default') 定义默认任务
// // 在命令行使用 gulp 启动 less 任务和 auto 任务
// gulp.task('default', ['clean'], function() {
//     gulp.start('environment', 'ext', 'less', 'less-app', 'pages', 'auto')
// })
