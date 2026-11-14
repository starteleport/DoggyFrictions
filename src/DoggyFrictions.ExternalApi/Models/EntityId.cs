namespace DoggyFrictions.ExternalApi.Models;

public static class EntityId
{
    /// <summary>Clients mark an entity that is not stored yet with an empty id or "0".</summary>
    public static bool IsNew(string? id) => string.IsNullOrEmpty(id) || id == "0";
}
