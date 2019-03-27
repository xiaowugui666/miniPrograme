const gulp = require('gulp');
const less = require('gulp-less');
const cssnano = require('gulp-cssnano');
const rename = require('gulp-rename');
const clean = require('gulp-clean');
const pump = require('pump');
const preprocess = require('gulp-preprocess');

gulp.task('less', function () {
    gulp.src([ 'src/pages/**/**.less'], {base: 'src'})
        .pipe(less())
        .pipe(cssnano({autoprefixer: false}))
        .pipe(rename(function(path){
            path.extname = '.wxss';
        }))
        .pipe(gulp.dest('dist'))
});
gulp.task('less-app', function () {
    gulp.src([ 'src/app.less'], {base: 'src'})
        .pipe(less())
        .pipe(cssnano())
        .pipe(rename(function(path){
            path.extname = '.wxss';
        }))
        .pipe(gulp.dest('dist'))
});
gulp.task('pages', function() {
    return gulp.src([
        'src/app.js',
        'src/app.json',
        'src/project.config.json',
        'src/README.md',
        'src/pages/**/**.js',
        'src/pages/**/**.wxml',
        'src/pages/**/**.json',
        'src/template/**',
        'src/imgs/**',
        'src/utils/**',
        ], {base: 'src'}).pipe(gulp.dest('dist'))
})
gulp.task('auto', function () {
    gulp.watch(['src/app.wxss', 'src/pages/**/**.less'], ['less']);
    gulp.watch(['src/imgs/*', 'src/pages/**/**/*', 'src/utils/**', 'src/template/**.wxml', 'src/*'], ['pages']);
})
gulp.task('clean', function(cb) {
    pump([
        gulp.src('./dist'),
        clean()
    ], cb)
})

gulp.task('environment',function() {
    return gulp.src('src/config/environment.js')
    .pipe(preprocess({
        context: {
            NODE_ENV: process.env.NODE_ENV || 'development',
          },
    }))
    .pipe(gulp.dest('dist/config'));
})
gulp.task('ext', function() {
    let PATH = 'src/ext.false.json'
    if (process.env.NODE_ENV === 'development') {
        PATH = 'src/ext.true.json'
    }
    return gulp.src(PATH, {base: 'src'})
        .pipe(rename(function(path) {
            path.basename = 'ext'
        }))
        .pipe(gulp.dest('dist'))
})
// 使用 gulp.task('default') 定义默认任务
// 在命令行使用 gulp 启动 less 任务和 auto 任务
gulp.task('default', ['clean'], function() {
    gulp.start('environment', 'ext', 'less', 'less-app', 'pages', 'auto')
})