using System.Web;
using System.Web.Mvc;
using DoggyFriction.Services.Repository;

namespace DoggyFriction.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }
        
        public FileResult Backup()
        {
            var backupFileName = new JsonFileRepository().CreateBackup();
            return File(backupFileName, MimeMapping.GetMimeMapping(backupFileName));
        }
    }
}
