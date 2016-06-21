using System.Web.Mvc;

namespace DoggyFriction.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }
    }
}
