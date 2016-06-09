using System.Web;
using System.Web.Optimization;

namespace DoggyFriction
{
    public class BundleConfig
    {
        // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                "~/Scripts/jquery-{version}.js",
                "~/Scripts/jquery.dateformat-1.0.js"));

            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at http://modernizr.com to pick only the tests you need.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                "~/Scripts/modernizr-*"));

            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                "~/Scripts/bootstrap.js",
                "~/Scripts/respond.js",
                "~/Scripts/Material/material.min.js",
                "~/Scripts/Material/ripples.min.js",
                "~/Scripts/moment.min.js",
                "~/Scripts/bootstrap-datepicker.min.js",
                "~/Scripts/locales/bootstrap-datepicker.ru.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/scripts").Include(
                "~/Scripts/Plugins/snackbar.min.js",
                "~/Scripts/Util.js",
                "~/Scripts/knockout-3.4.0.js",
                "~/Scripts/knockout.validation.min.js",
                "~/Scripts/ko-extensions.js",
                "~/Scripts/sammy-0.7.5.min.js",
                "~/Scripts/underscore.min.js",
                "~/Scripts/Plugins/sticky.js",
                "~/Scripts/Plugins/sticky-header.js",
                "~/Scripts/PagedGridModel.js",
                "~/Scripts/Models.js",
                "~/Scripts/Start.js"));

            bundles.Add(new StyleBundle("~/Content/css").Include(
                "~/Content/bootstrap.min.css",
                "~/Content/site.css",
                "~/Content/Material/bootstrap-material-design.min.css",
                "~/Content/Material/ripples.min.css",
                "~/Content/Plugins/snackbar.min.css",
                "~/Content/bootstrap-datepicker3.css"));
        }
    }
}
