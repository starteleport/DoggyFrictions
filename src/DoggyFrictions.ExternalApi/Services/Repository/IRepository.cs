using DoggyFrictions.ExternalApi.Models;

namespace DoggyFrictions.ExternalApi.Services.Repository;

/// <summary>Methods returning a nullable result yield <c>null</c> when the entity does not exist.</summary>
public interface IRepository
{
    Task<IEnumerable<Session>> GetSessions();
    Task<Session?> GetSession(string id);
    /// <summary>Creates the session when its id is empty or "0", otherwise replaces the existing one.</summary>
    Task<Session?> UpdateSession(Session model);
    Task<Session?> DeleteSession(string id);

    Task<IEnumerable<ActionObject>> GetSessionActions(string sessionId);
    Task<ActionObject?> GetAction(string sessionId, string id);
    /// <summary>Creates the action when its id is empty or "0", otherwise replaces the existing one.</summary>
    Task<ActionObject?> UpdateAction(string sessionId, ActionObject model);
    Task<ActionObject?> DeleteAction(string sessionId, string id);
}
