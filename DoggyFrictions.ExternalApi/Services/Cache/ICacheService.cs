namespace DoggyFrictions.ExternalApi.Services.Cache;

public interface ICacheService<T>
{
    Task<T> GetItem(string id);
    Task<IEnumerable<T>> GetItems();
}