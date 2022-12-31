using System.Collections.Concurrent;

namespace DoggyFrictions.ExternalApi.Services.Cache;

public abstract class CacheBase<T> : ICacheService<T> where T : class
{
    private readonly object lockObject = new object();
    private Task reloadTask;
    private ConcurrentDictionary<string, T> items;

    public async Task<T> GetItem(string id)
    {
        await UpdateCache();
        T value = null;
        items?.TryGetValue(id, out value);
        return value;
    }

    public async Task<IEnumerable<T>> GetItems()
    {
        await UpdateCache();
        return items?.Values.ToList() ?? new List<T>();
    }

    private async Task UpdateCache()
    {
        if (reloadTask != null)
        {
            await reloadTask;
            return;
        }
        if (items == null || !await IsActual())
        {
            lock (lockObject)
            {
                if (reloadTask == null)
                {
                    reloadTask =
                        Task.Run(
                                () =>
                                {
                                    items =
                                        new ConcurrentDictionary<string, T>(
                                            Fetch().Select(i => new KeyValuePair<string, T>(GetKey(i), i)));
                                })
                            .ContinueWith(t => reloadTask = null);
                }
            }
        }
        if (reloadTask != null)
            await reloadTask;
    }

    protected abstract string GetKey(T item);
    protected abstract IEnumerable<T> Fetch();
    protected abstract Task<bool> IsActual();
}