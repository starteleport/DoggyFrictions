using System.Collections.Generic;
using System.Threading.Tasks;

namespace DoggyFriction.Services
{
    public interface ICacheService<T>
    {
        Task<T> GetItem(string id);
        Task<IEnumerable<T>> GetItems();
    }
}