/// <binding AfterBuild='default' Clean='clean' />
/*
This file is the main entry point for defining Gulp tasks and using Gulp plugins.
Click here to learn more. http://go.microsoft.com/fwlink/?LinkId=518007
*/

import gulp from 'gulp';
import less from 'gulp-less';
import uglify from 'gulp-uglify';
import concat from 'gulp-concat';
import cssmin from 'gulp-cssmin';
import { deleteSync } from 'del';

const { src, dest, series } = gulp;

const paths = {
  packages: './node_modules/',
  less: './Styles/',
  stylesOut: './wwwroot/css/',
  vendorJsOut: './wwwroot/lib/',
  appJsOut: './wwwroot/js/'
};

function copy_vendor(cb) {
  src(paths.packages + "bootstrap/dist/js/bootstrap.min.js")
    .pipe(dest(paths.vendorJsOut + "/bootstrap/dist/js"));
  src(paths.packages + "bootstrap/dist/css/*.min.css")
    .pipe(dest(paths.vendorJsOut + "/bootstrap/dist/css"));
  src(paths.packages + "bootstrap/dist/css/*.min.css.map")
    .pipe(dest(paths.vendorJsOut + "/bootstrap/dist/css"));
  src(paths.packages + "bootstrap/dist/fonts/*")
    .pipe(dest(paths.vendorJsOut + "/bootstrap/dist/fonts"));

  src(paths.packages + "bootstrap-datepicker/dist/js/*.min.js")
    .pipe(dest(paths.vendorJsOut + "/bootstrap-datepicker/dist/js"));
  src(paths.packages + "bootstrap-datepicker/dist/css/*.min.css")
    .pipe(dest(paths.vendorJsOut + "/bootstrap-datepicker/dist/css"));
  src(paths.packages + "bootstrap-datepicker/dist/locales/bootstrap-datepicker.ru.min.js")
    .pipe(dest(paths.vendorJsOut + "/bootstrap-datepicker/dist/locales"));

  src(paths.packages + "jquery/dist/jquery.min.js")
    .pipe(dest(paths.vendorJsOut + "/jquery/dist"));
  src(paths.packages + "jquery/dist/jquery.min.map")
    .pipe(dest(paths.vendorJsOut + "/jquery/dist"));

  src(paths.packages + "jquery-dateformat/dist/*.js")
    .pipe(dest(paths.vendorJsOut + "/jquery-dateformat/dist"));

  src(paths.packages + "jquery-sticky/jquery.sticky.js")
    .pipe(uglify())
    .pipe(dest(paths.vendorJsOut + "/jquery-sticky/jquery-sticky.min.js"));

  src(paths.packages + "bootstrap-material-design/dist/js/*.min.js")
    .pipe(dest(paths.vendorJsOut + "/bootstrap-material-design/dist/js"));
  src(paths.packages + "bootstrap-material-design/dist/js/*.js.map")
    .pipe(dest(paths.vendorJsOut + "/bootstrap-material-design/dist/js"));

  src(paths.packages + "bootstrap-material-design/dist/css/*.min.css")
    .pipe(dest(paths.vendorJsOut + "/bootstrap-material-design/dist/css"));
  src(paths.packages + "bootstrap-material-design/dist/css/*.min.css.map")
    .pipe(dest(paths.vendorJsOut + "/bootstrap-material-design/dist/css"));

  // Not used afaik, consider removing
  src(paths.packages + "jquery-validation-unobtrusive/dist/*.js")
    .pipe(dest(paths.vendorJsOut + "/jquery-validation-unobtrusive"));

  src(paths.packages + "knockout/build/output/*.js")
    .pipe(dest(paths.vendorJsOut + "/knockout/build/output"));

  src(paths.packages + "knockout.validation/dist/*.min.js")
    .pipe(dest(paths.vendorJsOut + "/knockout.validation/dist"));
  src(paths.packages + "knockout.validation/dist/*.map")
    .pipe(dest(paths.vendorJsOut + "/knockout.validation/dist"));

  src(paths.packages + "npm-modernizr/modernizr.js")
    .pipe(uglify())
    .pipe(dest(paths.vendorJsOut + "/npm-modernizr/modernizr.min.js"));

  src(paths.packages + "moment/min/moment.min.js")
    .pipe(dest(paths.vendorJsOut + "/moment/min"));
  src(paths.packages + "moment/min/moment.min.js.map")
    .pipe(dest(paths.vendorJsOut + "/moment/min"));
  src(paths.packages + "moment/dist/locale/*.js")
    .pipe(dest(paths.vendorJsOut + "/moment/dist/locale"));

  src(paths.packages + "respond.js/dest/*.min.js")
    .pipe(dest(paths.vendorJsOut + "/respond.js/dest"));

  src(paths.packages + "sammy/lib/min/sammy-latest.min.js")
    .pipe(dest(paths.vendorJsOut + "/sammy/lib/min"));

  src(paths.packages + "snackbarjs/dist/*")
    .pipe(dest(paths.vendorJsOut + "/snackbarjs/dist"));

  src(paths.packages + "underscore/underscore-min.js")
    .pipe(dest(paths.vendorJsOut + "/underscore"));
  src(paths.packages + "underscore/underscore-min.js.map")
    .pipe(dest(paths.vendorJsOut + "/underscore"));
  cb();
}

function clean(cb) {
  deleteSync([paths.vendorJsOut + '**/*', paths.stylesOut + '*.css']);
  cb();
}

function compile_less(cb) {
  src(paths.less + "site.less").pipe(less()).pipe(dest(paths.stylesOut));
  cb();
}

function min_js(cb) {
  //return gulp.src([paths.js, "!" + paths.minJs], { base: "." })
  //    .pipe(concat(paths.appJsOut))
  //    .pipe(uglify())
  //    .pipe(gulp.dest("."));
}

function min_css(cb) {
}

const build = series(copy_vendor, compile_less);

export default series(clean, build)
export { clean, build, compile_less }
