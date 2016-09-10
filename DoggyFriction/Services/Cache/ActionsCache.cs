using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DoggyFriction.Services.Repository;
using Action = DoggyFriction.Models.Action;

namespace DoggyFriction.Services.Cache
{
    public class ActionsCache : CacheBase<Action>
    {
        private DateTime cacheUpdateTime = DateTime.MinValue;
        private readonly IRepository _repository;

        public ActionsCache(IRepository repository)
        {
            _repository = repository;
        }

        protected override string GetKey(Action item) => item.Id;

        protected override IEnumerable<Action> Fetch()
        {
            cacheUpdateTime = DateTime.UtcNow;
            return _repository.GetActions().Result;
        }

        protected override async Task<bool> IsActual()
        {
            var repoUpdateTime = await _repository.GetLastActionsUpdateTime();
            return repoUpdateTime < cacheUpdateTime;
        }
    }
}