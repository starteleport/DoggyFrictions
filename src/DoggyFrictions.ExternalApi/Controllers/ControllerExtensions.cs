using Microsoft.AspNetCore.Mvc;

namespace DoggyFrictions.ExternalApi.Controllers;

internal static class ControllerExtensions
{
    /// <summary>200 with the entity, or 404 when the repository found nothing.</summary>
    public static IActionResult OkOrNotFound(this ControllerBase controller, object? entity) =>
        entity == null ? controller.NotFound() : controller.Ok(entity);

    /// <summary>400 carrying one validation message for <paramref name="field"/>.</summary>
    public static IActionResult Invalid(this ControllerBase controller, string field, string message)
    {
        controller.ModelState.AddModelError(field, message);
        return controller.ValidationProblem(controller.ModelState);
    }
}
