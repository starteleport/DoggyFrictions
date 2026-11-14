using DoggyFrictions.ExternalApi.Models;
using DoggyFrictions.ExternalApi.Services.Repository.Models;
using MongoDB.Driver;

namespace DoggyFrictions.ExternalApi.Services.Repository;

public class MongoRepository : IRepository
{
    private readonly IMongoCollection<SessionModel> _sessions;
    private readonly IMongoCollection<ActionModel> _actions;
    private bool _indexesCreated;

    public MongoRepository(IMongoClient mongoClient)
    {
        var db = mongoClient.GetDatabase("doggyfrictions");
        _sessions = db.GetCollection<SessionModel>("Session");
        _actions = db.GetCollection<ActionModel>("Action");
    }

    public async Task<IEnumerable<Session>> GetSessions()
    {
        var sessions = await _sessions.Find(FilterDefinition<SessionModel>.Empty).ToListAsync();
        return sessions.Select(session => session.FromModel());
    }

    public async Task<Session?> GetSession(string id)
    {
        var session = await _sessions.Find(s => s.Id == id).SingleOrDefaultAsync();
        return session?.FromModel();
    }

    public async Task<Session?> UpdateSession(Session model)
    {
        var session = model.ToModel();
        if (EntityId.IsNew(model.Id))
        {
            await _sessions.InsertOneAsync(session);
            return session.FromModel();
        }

        var replaced = await _sessions.FindOneAndReplaceAsync<SessionModel>(
            s => s.Id == model.Id, session, ReturnReplaced<SessionModel>());
        return replaced?.FromModel();
    }

    public async Task<Session?> DeleteSession(string id)
    {
        var session = await _sessions.FindOneAndDeleteAsync<SessionModel>(s => s.Id == id);
        if (session == null)
        {
            return null;
        }

        await _actions.DeleteManyAsync(a => a.SessionId == id);
        return session.FromModel();
    }

    public async Task<IEnumerable<ActionObject>> GetSessionActions(string sessionId)
    {
        var actions = await _actions.Find(a => a.SessionId == sessionId).ToListAsync();
        return actions.Select(action => action.FromModel());
    }

    public async Task<ActionObject?> GetAction(string sessionId, string id)
    {
        var action = await _actions.Find(a => a.Id == id && a.SessionId == sessionId).SingleOrDefaultAsync();
        return action?.FromModel();
    }

    public async Task<ActionObject?> UpdateAction(string sessionId, ActionObject model)
    {
        var action = model.ToModel();
        action.SessionId = sessionId;
        if (EntityId.IsNew(model.Id))
        {
            await EnsureIndexes();
            await _actions.InsertOneAsync(action);
            return action.FromModel();
        }

        var replaced = await _actions.FindOneAndReplaceAsync<ActionModel>(
            a => a.Id == model.Id && a.SessionId == sessionId, action, ReturnReplaced<ActionModel>());
        return replaced?.FromModel();
    }

    public async Task<ActionObject?> DeleteAction(string sessionId, string id)
    {
        var action = await _actions.FindOneAndDeleteAsync<ActionModel>(a => a.Id == id && a.SessionId == sessionId);
        return action?.FromModel();
    }

    private static FindOneAndReplaceOptions<T> ReturnReplaced<T>() => new() { ReturnDocument = ReturnDocument.After };

    // Creating an index that already exists is a no-op, so once per process is enough.
    private async Task EnsureIndexes()
    {
        if (_indexesCreated)
        {
            return;
        }

        await _actions.Indexes.CreateOneAsync(
            new CreateIndexModel<ActionModel>(Builders<ActionModel>.IndexKeys.Descending(a => a.SessionId)));
        _indexesCreated = true;
    }
}
