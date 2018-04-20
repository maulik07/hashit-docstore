var gulp = require("gulp")
var ts = require("gulp-typescript")
var tsProject = ts.createProject("tsconfig.json")
var sourcemaps = require('gulp-sourcemaps')
var spawn = require('child_process').spawn
var del = require('del')
var node;

gulp.task("default", ['clean','js','server'])

gulp.task('clean', function() {
    del('dist')
})

gulp.task('server',['js'], function() {
    if (node) node.kill()
    node = spawn('node', ['dist/index.js'], {stdio: 'inherit'})
    node.on('close', function (code) {
      if (code === 8) {
        gulp.log('Error detected, waiting for changes...');
      }
    });
  })

gulp.task("js", function () {
    var reporter = ts.reporter.fullReporter();
    var tsResult = tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject(reporter));
    return tsResult.js
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("dist"));
});

gulp.task("watch", ['clean',"watch-js",'server']);

gulp.task("watch-js", /* run the "js" task at the beginning */ ["js"], function () {
    return gulp.watch(["./src/**/*.ts"], ["js","server"]); // run the "js" task when a file is modified
});


process.on('exit', function() {
    if (node) node.kill()
})