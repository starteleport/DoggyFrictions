using DoggyFrictions.ExternalApi.Models;
using DoggyFrictions.ExternalApi.Services.Repository;

namespace DoggyFrictions.ExternalApi.Services.Cache
{
    public class ActionsCache : CacheBase<ActionObject>
    {
        private DateTime cacheUpdateTime = DateTime.MinValue;
        private readonly IRepository _repository;

        public ActionsCache(IRepository repository)
        {
            _repository = repository;
        }

        protected override string GetKey(ActionObject item) => item.Id;

        protected override IEnumerable<ActionObject> Fetch()
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