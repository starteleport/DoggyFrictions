using DoggyFrictions.ExternalApi.Models;
using DoggyFrictions.ExternalApi.Services.Repository;

namespace DoggyFrictions.ExternalApi.Services.Cache;

public class ActionsCache : CacheBase<ActionObject>
{
    private DateTime _cacheUpdateTime = DateTime.MinValue;
    private readonly IRepository _repository;

    public ActionsCache(IRepository repository)
    {
        _repository = repository;
    }

    protected override string GetKey(ActionObject item) => item.Id;

    protected override async Task<IEnumerable<ActionObject>> FetchAsync()
    {
        _cacheUpdateTime = DateTime.UtcNow;
        return await _repository.GetActions();
    }

    protected override async Task<bool> IsActual()
    {
        var repoUpdateTime = await _repository.GetLastActionsUpdateTime();
        return repoUpdateTime < _cacheUpdateTime;
    }
}
