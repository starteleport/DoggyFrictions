using System.Collections.Generic;

namespace DoggyFriction.Models
{
    public class PagedCollection<T>
    {
        public int Page { get; set; }
        public int TotalPages { get; set; }
        public IEnumerable<T> Rows { get; set; } 
    }
}