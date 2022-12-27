using System.Collections.Generic;

namespace DoggyFrictions.ExternalApi.Models
{
    public class PagedCollection<T>
    {
        public int Page { get; set; }
        public int TotalPages { get; set; }
        public IEnumerable<T> Rows { get; set; }
    }
}