namespace DoggyFrictions.ExternalApi.Models;

public class PagedCollection<T>
{
    public const int DefaultPageSize = 10;
    public const int MaxPageSize = 100;

    public int Page { get; set; }
    public int TotalPages { get; set; }
    public IEnumerable<T> Rows { get; set; } = [];

    /// <summary>Cuts one page out of <paramref name="items"/>; out-of-range paging values fall back to sane ones.</summary>
    public static PagedCollection<T> Create(IReadOnlyCollection<T> items, int page, int pageSize)
    {
        pageSize = pageSize <= 0 ? DefaultPageSize : Math.Min(pageSize, MaxPageSize);
        page = Math.Max(page, 1);

        return new PagedCollection<T>
        {
            Page = page,
            TotalPages = Math.Max(1, (items.Count + pageSize - 1) / pageSize),
            Rows = items.Skip((page - 1) * pageSize).Take(pageSize).ToList()
        };
    }
}
