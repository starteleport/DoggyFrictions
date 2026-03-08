using System.Collections.Concurrent;

namespace DoggyFrictions.ExternalApi.Services.Cache;

public abstract class CacheBase<T> : ICacheService<T> where T : class
{
    private readonly SemaphoreSlim _semaphore = new(1, 1);
    private ConcurrentDictionary<string, T>? _items;

    public async Task<T?> GetItem(string id)
    {
        await UpdateCache();
        return _items is not null && _items.TryGetValue(id, out var item) ? item : default;
    }

    public async Task<IEnumerable<T>> GetItems()
    {
        await UpdateCache();
        return _items?.Values.ToList() ?? [];
    }

    private async Task UpdateCache()
    {
        if (_items != null && await IsActual())
            return;

        await _semaphore.WaitAsync();
        try
        {
            if (_items != null && await IsActual())
                return;

            var fetched = await FetchAsync();
            _items = new ConcurrentDictionary<string, T>(
                fetched.Select(i => new KeyValuePair<string, T>(GetKey(i), i)));
        }
        finally
        {
            _semaphore.Release();
        }
    }

    protected abstract string GetKey(T item);
    protected abstract Task<IEnumerable<T>> FetchAsync();
    protected abstract Task<bool> IsActual();
}
