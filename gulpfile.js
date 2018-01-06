var gulp = require("gulp");
var fs = require('fs');
var http = require("http");
var svgSprite = require("gulp-svg-sprite");
var imageResize = require("gulp-image-resize");
var del = require('del');
var vinylPaths = require('vinyl-paths');
var gulpCopy = require('gulp-copy');
var uglifyJS = require('gulp-uglify');
var uglifyCSS = require('gulp-uglifycss');
var concat = require('gulp-concat');
var htmlmin = require('gulp-htmlmin');
var htmlReplace = require('gulp-html-replace');
var gls = require('gulp-live-server');
var watch = require('gulp-watch');
var url = 'http://api.calculadoraiof.com.br/v1/country';
var tinfier = require('gulp-tinifier');

function isDev(process){
  if (process.indexOf('buildServer') > 0) {
    return '.tmp';
  } else {
    return 'dist';
  }
}

/**********************************************
*
*    SVG Sprite Tasks
*
**********************************************/
gulp.task('deleteFlagSvg', function(){
  return gulp.src('source/css/svg/*')
  .pipe(vinylPaths(del));
});

gulp.task('createFlagSvg', function(){
  http.get(url, function(res){
    var statusCode = res.statusCode;
    var contentType = res.headers['content-type'];
    var rawData = '';

    if (statusCode === 200) {
      res.on("data", function(chunk){
        rawData += chunk;
      });

      res.on("end", function(){
        var response = JSON.parse(rawData);
        var flagsArray = [];

        flagsArray.push('node_modules/flag-icon-css/flags/4x3/un.svg');

        for (var i = response.length - 1; i >= 0; i--) {
          flagsArray.push('node_modules/flag-icon-css/flags/4x3/'+response[i].cabbr.toLowerCase()+'.svg');
        }

        return gulp.src(flagsArray)
        .pipe(svgSprite({
          mode:{
            css:{
              render: {
                css: true
              },
              prefix: '.flag-icon-%s',
              dimensions: '',
              layout: 'vertical'
            }
          }
        }))
        .pipe(gulp.dest('source'));
      });
    }
  });
});
/**********************************************/

/**********************************************
*
*    Compress and Concatenate
*    CSS / JS / HTML
*
**********************************************/
gulp.task('concatJS', function(cb){
  var envr = isDev(process.argv);
  return gulp.src('source/js/*.js')
  .pipe(concat('main.min.js'))
  .pipe(uglifyJS())
  .pipe(gulp.dest(envr+'/js'));
  cb(envr);
});

gulp.task('concatCSS', function(cb){
  var envr = isDev(process.argv);
  return gulp.src('source/css/*.css')
  .pipe(concat('main.min.css'))
  .pipe(uglifyCSS())
  .pipe(gulp.dest(envr+'/css'));
  cb(envr);
});

gulp.task('buildHtml', function(cb){
  var envr = isDev(process.argv);
  if (envr == ".tmp") {
    var options = {
      'css':'css/main.min.css',
      'js':'js/main.min.js'
    }
  } else {
    var options = {
      'css':'css/main.min.css',
      'js':'js/main.min.js',
      'ga': {
        src: null,
        tpl: '<script>(function(i,s,o,g,r,a,m){i["GoogleAnalyticsObject"]=r;i[r]=i[r]||function(){  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)  })(window,document,"script","https://www.google-analytics.com/analytics.js","ga");  ga("create", "UA-83265834-2", "auto");  ga("send", "pageview");</script>'
      },
      'tm': {
        src: null,
        tpl: '<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NCXZVQL" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>'
      }
    }
  }
  return gulp.src('source/index.html')
  .pipe(htmlmin({
    collapseWhitespace: true
  }))
  .pipe(htmlReplace(options))
  .pipe(gulp.dest(envr));
  cb(envr);
});

/**********************************************
*
*    Compress Image
*
**********************************************/
gulp.task("tinypng", function(done) {
  var envr = isDev(process.argv);
    gulp.src('source/images/**/*.{jpg,png,.gif}')
    .pipe(tinfier({
        key:'LI97DcUWh6QN46-hepPPmLJ3AotsLKvg',
        verbose: true
    }))
    .pipe(gulp.dest("images", {cwd:envr}))
});

/**********************************************
*
*    General Build Moving Files
*
**********************************************/
gulp.task('deleteDistFiles', function(cb){
  var envr = isDev(process.argv);
  return gulp.src(envr+'/*')
  .pipe(vinylPaths(del));
  cb(envr);
});

gulp.task('deleteFolder', function(cb){
  var envr = isDev(process.argv);
  return del(envr);
});

gulp.task('copyToDist', function(cb){
  var envr = isDev(process.argv);

  return gulp.src('source/css/svg/*.svg')
  .pipe(gulpCopy(envr, {
    prefix: 1
  }))
  .pipe(gulp.dest(envr));
  cb(envr);
});

/**********************************************/

/**********************************************
*
*    Live Development Server
*
**********************************************/
gulp.task('server', function(){
  var server = gls.static(['.tmp']);
  var promise = server.start();

  watch(['source/**/*.*'], function(file){
    gulp.start(['copyToDist', 'concatJS', 'concatCSS', 'buildHtml', 'server']);
    server.notify.apply(server,[file]);
  });
});
/**********************************************/

gulp.task('flagSvg', ['deleteFlagSvg','createFlagSvg']);
// gulp.task('build', ['deleteFolder', 'copyToDist', 'concatJS', 'concatCSS', 'buildHtml']);
gulp.task('build', ['tinypng', 'concatJS', 'concatCSS', 'buildHtml', 'copyToDist']);
gulp.task('buildServer', ['deleteFolder', 'copyToDist', 'concatJS', 'concatCSS', 'buildHtml', 'server']);


