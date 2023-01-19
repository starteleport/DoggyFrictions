using DoggyFrictions.ExternalApi.Models;

namespace DoggyFrictions.ExternalApi.Services.Repository;

public interface IRepository
{
    Task<IEnumerable<Session>> GetSessions();
    Task<Session> GetSession(string id);
    Task<Session> UpdateSession(Session model);
    Task<Session> DeleteSession(string id);
    Task<DateTime> GetLastSessionsUpdateTime();

    Task<IEnumerable<ActionObject>> GetActions();
    Task<IEnumerable<ActionObject>> GetSessionActions(string sessionId);
    Task<ActionObject> GetAction(string sessionId, string id);
    Task<ActionObject> UpdateAction(string sessionId, ActionObject model);
    Task<ActionObject> DeleteAction(string sessionId, string id);
    Task<DateTime> GetLastActionsUpdateTime();
}