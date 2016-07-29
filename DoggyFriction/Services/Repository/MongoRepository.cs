using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DoggyFriction.Models;
using DoggyFriction.Services.Repository.Models;
using MongoDB.Bson;
using MongoDB.Driver;
using Action = DoggyFriction.Models.Action;

namespace DoggyFriction.Services.Repository
{
    public class MongoRepository : IRepository
    {
        private IMongoDatabase GetDatabase() => new MongoClient(MongoUrl.Create("mongodb://svsokrat:qwedsa@ds027165.mlab.com:27165/doggyfrictions"))
            .GetDatabase("doggyfrictions");
        private static IMongoCollection<SessionModel> GetSessions(IMongoDatabase db) => db.GetCollection<SessionModel>("Session");
        private static IMongoCollection<ActionModel> GetActions(IMongoDatabase db) => db.GetCollection<ActionModel>("Action");

        public async Task<IEnumerable<Session>> GetSessions()
        {
            var db = GetDatabase();
            var sessions = await GetSessions(db)
                .AsQueryable()
                .ToListAsync();
            return sessions.Select(session => session.Convert());
        }

        public async Task<Session> GetSession(string id)
        {
            var db = GetDatabase();
            var session = await GetSessions(db)
                .Find(new ExpressionFilterDefinition<SessionModel>(s => s.Id == id))
                .SingleOrDefaultAsync();
            return session.Convert();
        }

        public async Task<Session> UpdateSession(Session model)
        {
            var db = GetDatabase();
            SessionModel session;
            if (model.Id.IsNullOrEmpty() || model.Id == "0") {
                session = model.Convert();
                await GetSessions(db).InsertOneAsync(session);
            }
            else {
                session = await GetSessions(db)
                    .FindOneAndReplaceAsync(new ExpressionFilterDefinition<SessionModel>(s => s.Id == model.Id), model.Convert());
            }
            return session.Convert();
        }

        public async Task<Session> DeleteSession(string id)
        {
            var db = GetDatabase();
            var session = await GetSessions(db)
                .FindOneAndDeleteAsync(new ExpressionFilterDefinition<SessionModel>(s => s.Id == id));
            await GetActions(db)
                .DeleteManyAsync(new ExpressionFilterDefinition<ActionModel>(a => a.SessionId == id));
            return session.Convert();
        }

        public async Task<IEnumerable<Action>> GetActions(string sessionId)
        {
            var db = GetDatabase();
            var actions = await GetActions(db)
                .Find(new ExpressionFilterDefinition<ActionModel>(a => a.SessionId == sessionId))
                .ToListAsync();
            return actions.Select(action => action.Convert());
        }

        public async Task<Action> GetAction(string sessionId, string id)
        {
            var db = GetDatabase();
            var action = await GetActions(db)
                .Find(new ExpressionFilterDefinition<ActionModel>(a => a.Id == id))
                .SingleOrDefaultAsync();
            return action.Convert();
        }

        public async Task<Action> UpdateAction(string sessionId, Action model)
        {
            var db = GetDatabase();
            ActionModel action;
            if (model.Id.IsNullOrEmpty() || model.Id == "0") {
                var actionsCollection = GetActions(db);
                await CreateIndex(actionsCollection, nameof(ActionModel.SessionId));
                action = model.Convert();
                await actionsCollection.InsertOneAsync(action);
            }
            else {
                action = await GetActions(db)
                    .FindOneAndReplaceAsync(new ExpressionFilterDefinition<ActionModel>(s => s.Id == model.Id), model.Convert());
            }
            return action.Convert();
        }

        public async Task<Action> DeleteAction(string sessionId, string id)
        {
            var db = GetDatabase();
            var action = await GetActions(db)
                .FindOneAndDeleteAsync(new ExpressionFilterDefinition<ActionModel>(a => a.Id == id));
            return action.Convert();
        }

        private async Task CreateIndex<T>(IMongoCollection<T> collection, string fieldName)
        {
            var indexes = await collection.Indexes.ListAsync();
            var sessionIdIndexExists = false;
            while (await indexes.MoveNextAsync()) {
                var index = indexes.Current;
                if (index.Any(d => d.Names.Contains(fieldName))) {
                    sessionIdIndexExists = true;
                    break;
                }
            }
            if (!sessionIdIndexExists) {
                var index = new BsonDocument();
                index.Add(new BsonElement(fieldName, -1));
                await collection.Indexes.CreateOneAsync(new BsonDocumentIndexKeysDefinition<T>(index), new CreateIndexOptions {
                    Unique = false,
                    Sparse = false,
                    Background = false,
                });
            }
        }
    }
}