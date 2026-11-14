using Microsoft.AspNetCore.Mvc;

namespace DoggyFrictions.ExternalApi.Controllers;

public class TemplatesController : Controller
{
    // The templates are rendered in the language of the request (cookie or browser), so the same URL
    // has several representations: keep HTTP caches out of it. The service worker keeps its own copy.
    [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Get() => PartialView("Templates");
}