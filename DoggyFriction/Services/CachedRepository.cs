using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DoggyFriction.Models;
using DoggyFriction.Services.Cache;
using DoggyFriction.Services.Repository;
using Action = DoggyFriction.Models.Action;

namespace DoggyFriction.Services
{
    public class CachedRepository : IRepository
    {
        readonly SessionsCache sessionsCache;
        readonly ActionsCache actionsCache;
        private readonly IRepository _repository;

        public CachedRepository(MongoRepository repository)
        {
            _repository = repository;
            sessionsCache = new SessionsCache(repository);
            actionsCache = new ActionsCache(repository);
        }

        // Cached methods
        public async Task<IEnumerable<Session>> GetSessions() => await sessionsCache.GetItems();
        public async Task<Session> GetSession(string id) => await sessionsCache.GetItem(id);
        public async Task<IEnumerable<Action>> GetActions() => await actionsCache.GetItems();
        public async Task<IEnumerable<Action>> GetSessionActions(string sessionId) => 
            (await actionsCache.GetItems()).Where(a => a.SessionId == sessionId).ToList();
        public async Task<Action> GetAction(string sessionId, string id) => await actionsCache.GetItem(id);

        // Non-cached methods
        public async Task<Session> UpdateSession(Session model) => await _repository.UpdateSession(model);
        public async Task<Session> DeleteSession(string id) => await _repository.DeleteSession(id);
        public async Task<DateTime> GetLastSessionsUpdateTime() => await _repository.GetLastSessionsUpdateTime();
        public async Task<Action> UpdateAction(string sessionId, Action model) => await _repository.UpdateAction(sessionId, model);
        public async Task<Action> DeleteAction(string sessionId, string id) => await _repository.DeleteAction(sessionId, id);
        public async Task<DateTime> GetLastActionsUpdateTime() => await _repository.GetLastActionsUpdateTime();
    }
}