using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using DoggyFriction.Models;
using DoggyFriction.Services.Cache;
using DoggyFriction.Services.Repository;
using Action = DoggyFriction.Models.Action;

namespace DoggyFriction.Services
{
    public class CachedRepository : IRepository
    {
        readonly SessionsCache sessionsCache = new SessionsCache();
        readonly ActionsCache actionsCache = new ActionsCache();

        // Cached methods
        public async Task<IEnumerable<Session>> GetSessions() => await sessionsCache.GetItems();
        public async Task<Session> GetSession(string id) => await sessionsCache.GetItem(id);
        public async Task<IEnumerable<Action>> GetActions() => await actionsCache.GetItems();
        public async Task<IEnumerable<Action>> GetActions(string sessionId) => 
            (await actionsCache.GetItems()).Where(a => a.SessionId == sessionId).ToList();
        public async Task<Action> GetAction(string sessionId, string id) => await actionsCache.GetItem(id);

        // Non-cached methods
        public async Task<Session> UpdateSession(Session model) => await Hub.Repository.UpdateSession(model);
        public async Task<Session> DeleteSession(string id) => await Hub.Repository.DeleteSession(id);
        public async Task<DateTime> GetLastSessionsUpdateTime() => await Hub.Repository.GetLastSessionsUpdateTime();
        public async Task<Action> UpdateAction(string sessionId, Action model) => await Hub.Repository.UpdateAction(sessionId, model);
        public async Task<Action> DeleteAction(string sessionId, string id) => await Hub.Repository.DeleteAction(sessionId, id);
        public async Task<DateTime> GetLastActionsUpdateTime() => await Hub.Repository.GetLastActionsUpdateTime();
    }
}