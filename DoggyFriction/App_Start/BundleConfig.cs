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
                "~/Scripts/bootstrap-datetimepicker.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/scripts").Include(
                "~/Scripts/knockout-3.4.0.js",
                "~/Scripts/sammy-0.7.5.min.js",
                "~/Scripts/underscore.min.js",
                "~/Scripts/PagedGridModel.js",
                "~/Scripts/Models.js",
                "~/Scripts/Start.js"));

            bundles.Add(new StyleBundle("~/Content/css").Include(
                "~/Content/bootstrap.min.css",
                "~/Content/site.css",
                "~/Content/Material/bootstrap-material-design.min.css",
                "~/Content/Material/ripples.min.css",
                "~/Content/bootstrap-datetimepicker.min.css"));
        }
    }
}
