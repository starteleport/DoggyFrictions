using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Action = DoggyFriction.Models.Action;

namespace DoggyFriction.Services.Cache
{
    public class ActionsCache : CacheBase<Action>
    {
        private DateTime cacheUpdateTime = DateTime.MinValue;

        protected override string GetKey(Action item) => item.Id;

        protected override IEnumerable<Action> Fetch()
        {
            cacheUpdateTime = DateTime.UtcNow;
            return Hub.Repository.GetActions().Result;
        }

        protected override async Task<bool> IsActual()
        {
            var repoUpdateTime = await Hub.Repository.GetLastActionsUpdateTime();
            return repoUpdateTime < cacheUpdateTime && cacheUpdateTime > DateTime.UtcNow.AddMinutes(-30);
        }
    }
}