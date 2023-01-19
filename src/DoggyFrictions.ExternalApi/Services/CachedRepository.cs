using DoggyFrictions.ExternalApi.Models;
using DoggyFrictions.ExternalApi.Services.Cache;
using DoggyFrictions.ExternalApi.Services.Repository;

namespace DoggyFrictions.ExternalApi.Services;

public class CachedRepository : IRepository
{
    private readonly SessionsCache sessionsCache;
    private readonly ActionsCache actionsCache;
    private readonly IRepository _repository;

    public CachedRepository(MongoRepository repository)
    {
        _repository = repository;
        sessionsCache = new SessionsCache(repository);
        actionsCache = new ActionsCache(repository);
    }

    // Cached methods
    public async Task<IEnumerable<Session>> GetSessions()
    {
        return await sessionsCache.GetItems();
    }

    public async Task<Session> GetSession(string id)
    {
        return await sessionsCache.GetItem(id);
    }

    public async Task<IEnumerable<ActionObject>> GetActions()
    {
        return await actionsCache.GetItems();
    }

    public async Task<IEnumerable<ActionObject>> GetSessionActions(string sessionId)
    {
        return (await actionsCache.GetItems()).Where(a => a.SessionId == sessionId).ToList();
    }

    public async Task<ActionObject> GetAction(string sessionId, string id)
    {
        return await actionsCache.GetItem(id);
    }

    // Non-cached methods
    public async Task<Session> UpdateSession(Session model)
    {
        return await _repository.UpdateSession(model);
    }

    public async Task<Session> DeleteSession(string id)
    {
        return await _repository.DeleteSession(id);
    }

    public async Task<DateTime> GetLastSessionsUpdateTime()
    {
        return await _repository.GetLastSessionsUpdateTime();
    }

    public async Task<ActionObject> UpdateAction(string sessionId, ActionObject model)
    {
        return await _repository.UpdateAction(sessionId, model);
    }

    public async Task<ActionObject> DeleteAction(string sessionId, string id)
    {
        return await _repository.DeleteAction(sessionId, id);
    }

    public async Task<DateTime> GetLastActionsUpdateTime()
    {
        return await _repository.GetLastActionsUpdateTime();
    }
}