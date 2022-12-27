/// <binding AfterBuild='default' Clean='clean' />
/*
This file is the main entry point for defining Gulp tasks and using Gulp plugins.
Click here to learn more. http://go.microsoft.com/fwlink/?LinkId=518007
*/

import gulp from 'gulp';
import less from 'gulp-less';
import { deleteAsync } from 'del';

const { src, dest, series } = gulp;
const nodeRoot = './node_modules/';
const cssTargetPath = './wwwroot/css/';
const vendorScriptsTargetPath = './wwwroot/lib/';

function copy_vendor(cb) {
    src(nodeRoot + "bootstrap/dist/js/*").pipe(dest(vendorScriptsTargetPath + "/bootstrap/dist/js"));
    src(nodeRoot + "bootstrap/dist/css/*").pipe(dest(vendorScriptsTargetPath + "/bootstrap/dist/css"));
    src(nodeRoot + "bootstrap/dist/fonts/*").pipe(dest(vendorScriptsTargetPath + "/bootstrap/dist/fonts"));

    src(nodeRoot + "bootstrap-datepicker/dist/js/*").pipe(dest(vendorScriptsTargetPath + "/bootstrap-datepicker/dist/js"));
    src(nodeRoot + "bootstrap-datepicker/dist/css/*").pipe(dest(vendorScriptsTargetPath + "/bootstrap-datepicker/dist/css"));
    src(nodeRoot + "bootstrap-datepicker/dist/locales/bootstrap-datepicker.ru.min.js").pipe(dest(vendorScriptsTargetPath + "/bootstrap-datepicker/dist/locales"));

    src(nodeRoot + "jquery/dist/jquery.js").pipe(dest(vendorScriptsTargetPath + "/jquery/dist"));
    src(nodeRoot + "jquery/dist/jquery.min.js").pipe(dest(vendorScriptsTargetPath + "/jquery/dist"));
    src(nodeRoot + "jquery/dist/jquery.min.map").pipe(dest(vendorScriptsTargetPath + "/jquery/dist"));

    src(nodeRoot + "jquery-dateformat/dist/*.js").pipe(dest(vendorScriptsTargetPath + "/jquery-dateformat/dist"));
    src(nodeRoot + "jquery-sticky/jquery.sticky.js").pipe(dest(vendorScriptsTargetPath + "/jquery-sticky"));

    src(nodeRoot + "bootstrap-material-design/dist/js/*.js").pipe(dest(vendorScriptsTargetPath + "/bootstrap-material-design/dist/js"));
    src(nodeRoot + "bootstrap-material-design/dist/js/*.js.map").pipe(dest(vendorScriptsTargetPath + "/bootstrap-material-design/dist/js"));

    src(nodeRoot + "bootstrap-material-design/dist/css/*.css").pipe(dest(vendorScriptsTargetPath + "/bootstrap-material-design/dist/css"));
    src(nodeRoot + "bootstrap-material-design/dist/css/*.css.map").pipe(dest(vendorScriptsTargetPath + "/bootstrap-material-design/dist/css"));

    // Not used afaik, consider removing
    src(nodeRoot + "jquery-validation-unobtrusive/dist/*.js").pipe(dest(vendorScriptsTargetPath + "/jquery-validation-unobtrusive"));

    src(nodeRoot + "knockout/build/output/*.js").pipe(dest(vendorScriptsTargetPath + "/knockout/build/output"));

    src(nodeRoot + "knockout.validation/dist/*.js").pipe(dest(vendorScriptsTargetPath + "/knockout.validation/dist"));
    src(nodeRoot + "knockout.validation/dist/*.map").pipe(dest(vendorScriptsTargetPath + "/knockout.validation/dist"));

    src(nodeRoot + "npm-modernizr/modernizr.js").pipe(dest(vendorScriptsTargetPath + "/npm-modernizr"));

    src(nodeRoot + "moment/min/moment.min.js").pipe(dest(vendorScriptsTargetPath + "/moment/min"));
    src(nodeRoot + "moment/min/moment.min.js.map").pipe(dest(vendorScriptsTargetPath + "/moment/min"));
    src(nodeRoot + "moment/dist/locale/*.js").pipe(dest(vendorScriptsTargetPath + "/moment/dist/locale"));

    src(nodeRoot + "respond.js/dest/*.js").pipe(dest(vendorScriptsTargetPath + "/respond.js/dest"));

    src(nodeRoot + "sammy/lib/sammy.js").pipe(dest(vendorScriptsTargetPath + "/sammy/lib"));
    src(nodeRoot + "sammy/lib/min/sammy-latest.min.js").pipe(dest(vendorScriptsTargetPath + "/sammy/lib/min"));

    src(nodeRoot + "snackbarjs/src/snackbar.js").pipe(dest(vendorScriptsTargetPath + "/snackbarjs/src"));
    src(nodeRoot + "snackbarjs/dist/*").pipe(dest(vendorScriptsTargetPath + "/snackbarjs/dist"));

    src(nodeRoot + "underscore/underscore.js").pipe(dest(vendorScriptsTargetPath + "/underscore"));
    src(nodeRoot + "underscore/underscore-min.js").pipe(dest(vendorScriptsTargetPath + "/underscore"));
    src(nodeRoot + "underscore/underscore-min.js.map").pipe(dest(vendorScriptsTargetPath + "/underscore"));
    cb();
}

async function clean(cb) {
    await deleteAsync([vendorScriptsTargetPath + '**/*', cssTargetPath + '*.css']);
    cb();
}

function compile_less(cb) {
    src(cssTargetPath + "Site.less").pipe(less()).pipe(dest(cssTargetPath));
    cb();
}

function min_js(cb) {
}

function min_css(cb) {
}

const build = series(copy_vendor, compile_less);

export default series(clean, build)
export { clean, build, compile_less }
