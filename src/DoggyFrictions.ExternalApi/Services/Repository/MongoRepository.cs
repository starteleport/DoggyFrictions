using DoggyFrictions.ExternalApi.Models;
using DoggyFrictions.ExternalApi.Services.Repository.Models;
using MongoDB.Bson;
using MongoDB.Driver;

namespace DoggyFrictions.ExternalApi.Services.Repository;

public class MongoRepository : IRepository
{
    private readonly IMongoClient mongoClient;

    public MongoRepository(IMongoClient mongoClient)
    {
        this.mongoClient = mongoClient;
    }

    private IMongoDatabase GetDatabase() => mongoClient.GetDatabase("doggyfrictions");

    private static IMongoCollection<SessionModel> GetSessions(IMongoDatabase db)
        => db.GetCollection<SessionModel>("Session");

    private static IMongoCollection<ActionModel> GetActions(IMongoDatabase db)
        => db.GetCollection<ActionModel>("Action");

    private static IMongoCollection<UpdateTime> GetUpdateTimes(IMongoDatabase db)
        => db.GetCollection<UpdateTime>("UpdateTime");

    public async Task<IEnumerable<Session>> GetSessions()
    {
        var db = GetDatabase();
        var sessions = await GetSessions(db)
            .AsQueryable()
            .ToListAsync();
        return sessions.Select(session => session.FromModel());
    }

    public async Task<Session> GetSession(string id)
    {
        var db = GetDatabase();
        var session = await GetSessions(db)
            .Find(new ExpressionFilterDefinition<SessionModel>(s => s.Id == id))
            .SingleOrDefaultAsync();
        return session.FromModel();
    }

    public async Task<Session> UpdateSession(Session model)
    {
        var db = GetDatabase();
        SessionModel session;
        if (model.Id.IsNullOrEmpty() || model.Id == "0")
        {
            session = model.ToModel();
            await GetSessions(db).InsertOneAsync(session);
        }
        else
        {
            session = await GetSessions(db)
                .FindOneAndReplaceAsync(new ExpressionFilterDefinition<SessionModel>(s => s.Id == model.Id),
                    model.ToModel());
        }
        await LogUpdateTime(db, "Session");
        return session.FromModel();
    }

    public async Task<Session> DeleteSession(string id)
    {
        var db = GetDatabase();
        var session = await GetSessions(db)
            .FindOneAndDeleteAsync(new ExpressionFilterDefinition<SessionModel>(s => s.Id == id));
        await GetActions(db)
            .DeleteManyAsync(new ExpressionFilterDefinition<ActionModel>(a => a.SessionId == id));
        await LogUpdateTime(db, "Session");
        return session.FromModel();
    }

    public async Task<DateTime> GetLastSessionsUpdateTime()
    {
        var db = GetDatabase();
        return (await GetUpdateTimes(db)
            .Find(new ExpressionFilterDefinition<UpdateTime>(t => t.TableName == "Session"))
            .FirstOrDefaultAsync())?.UpdatedOn ?? DateTime.Now.AddDays(-1);
    }

    public async Task<IEnumerable<ActionObject>> GetActions()
    {
        var db = GetDatabase();
        var actions = await GetActions(db).AsQueryable().ToListAsync();
        return actions.Select(action => action.FromModel());
    }

    public async Task<IEnumerable<ActionObject>> GetSessionActions(string sessionId)
    {
        var db = GetDatabase();
        var actions = await GetActions(db)
            .Find(new ExpressionFilterDefinition<ActionModel>(a => a.SessionId == sessionId))
            .ToListAsync();
        return actions.Select(action => action.FromModel());
    }

    public async Task<ActionObject> GetAction(string sessionId, string id)
    {
        var db = GetDatabase();
        var action = await GetActions(db)
            .Find(new ExpressionFilterDefinition<ActionModel>(a => a.Id == id))
            .SingleOrDefaultAsync();
        return action.FromModel();
    }

    public async Task<ActionObject> UpdateAction(string sessionId, ActionObject model)
    {
        var db = GetDatabase();
        ActionModel action;
        if (model.Id.IsNullOrEmpty() || model.Id == "0")
        {
            var actionsCollection = GetActions(db);
            await CreateIndex(actionsCollection, nameof(ActionModel.SessionId));
            action = model.ToModel();
            await actionsCollection.InsertOneAsync(action);
        }
        else
        {
            action = await GetActions(db)
                .FindOneAndReplaceAsync(new ExpressionFilterDefinition<ActionModel>(s => s.Id == model.Id),
                    model.ToModel());
        }
        await LogUpdateTime(db, "Action");
        return action.FromModel();
    }

    public async Task<ActionObject> DeleteAction(string sessionId, string id)
    {
        var db = GetDatabase();
        var action = await GetActions(db)
            .FindOneAndDeleteAsync(new ExpressionFilterDefinition<ActionModel>(a => a.Id == id));
        await LogUpdateTime(db, "Action");
        return action.FromModel();
    }

    public async Task<DateTime> GetLastActionsUpdateTime()
    {
        var db = GetDatabase();
        return (await GetUpdateTimes(db)
            .Find(new ExpressionFilterDefinition<UpdateTime>(t => t.Id == "Action"))
            .FirstOrDefaultAsync())?.UpdatedOn ?? DateTime.Now.AddDays(-1);
    }

    private async Task LogUpdateTime(IMongoDatabase db, string tableName)
    {
        await GetUpdateTimes(db).FindOneAndReplaceAsync(
            new ExpressionFilterDefinition<UpdateTime>(t => t.Id == tableName),
            new UpdateTime { Id = tableName, TableName = tableName, UpdatedOn = DateTime.UtcNow },
            new FindOneAndReplaceOptions<UpdateTime, UpdateTime> { IsUpsert = true });
    }

    private async Task CreateIndex<T>(IMongoCollection<T> collection, string fieldName)
    {
        var indexes = await collection.Indexes.ListAsync();
        var sessionIdIndexExists = false;
        while (await indexes.MoveNextAsync())
        {
            var index = indexes.Current;
            if (index.Any(d => d.Names.Contains(fieldName)))
            {
                sessionIdIndexExists = true;
                break;
            }
        }
        if (!sessionIdIndexExists)
        {
            var index = new BsonDocument { new BsonElement(fieldName, -1) };
            await
                collection.Indexes.CreateOneAsync(new BsonDocumentIndexKeysDefinition<T>(index),
                    new CreateIndexOptions
                    {
                        Unique = false,
                        Sparse = false,
                        Background = false,
                    });
        }
    }
}