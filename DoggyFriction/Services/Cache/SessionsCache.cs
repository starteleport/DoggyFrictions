using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Session = DoggyFriction.Models.Session;

namespace DoggyFriction.Services.Cache
{
    public class SessionsCache : CacheBase<Session>
    {
        private DateTime cacheUpdateTime = DateTime.MinValue;

        protected override string GetKey(Session item) => item.Id;

        protected override IEnumerable<Session> Fetch()
        {
            cacheUpdateTime = DateTime.UtcNow;
            return Hub.Repository.GetSessions().Result;
        }

        protected override async Task<bool> IsActual()
        {
            var repoUpdateTime = await Hub.Repository.GetLastSessionsUpdateTime();
            return repoUpdateTime < cacheUpdateTime && cacheUpdateTime > DateTime.UtcNow.AddMinutes(-30);
        }
    }
}