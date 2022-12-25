using Microsoft.AspNetCore.Mvc;

namespace DoggyFrictions.ExternalApi.Controllers;

public class TemplatesController : Controller
{
    public IActionResult Get() => PartialView("Templates");
}