using DoggyFrictions.ExternalApi.Services.Repository;
using Session = DoggyFrictions.ExternalApi.Models.Session;

namespace DoggyFrictions.ExternalApi.Services.Cache;

public class SessionsCache : CacheBase<Session>
{
    private DateTime cacheUpdateTime = DateTime.MinValue;
    private readonly IRepository _repository;

    public SessionsCache(IRepository repository)
    {
        _repository = repository;
    }

    protected override string GetKey(Session item) => item.Id;

    protected override IEnumerable<Session> Fetch()
    {
        cacheUpdateTime = DateTime.UtcNow;
        return _repository.GetSessions().Result;
    }

    protected override async Task<bool> IsActual()
    {
        var repoUpdateTime = await _repository.GetLastSessionsUpdateTime();
        return repoUpdateTime < cacheUpdateTime;
    }
}