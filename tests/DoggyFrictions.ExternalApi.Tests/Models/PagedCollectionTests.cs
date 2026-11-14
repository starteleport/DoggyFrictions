using DoggyFrictions.ExternalApi.Models;
using NUnit.Framework;

namespace DoggyFrictions.ExternalApi.Tests.Models;

[TestFixture]
public class PagedCollectionTests
{
    [TestCase(0, 5, 1)]
    [TestCase(1, 5, 1)]
    [TestCase(5, 5, 1)]
    [TestCase(6, 5, 2)]
    [TestCase(10, 5, 2)]
    [TestCase(11, 5, 3)]
    public void Create_ShouldCountPages(int items, int pageSize, int expectedPages)
    {
        var page = PagedCollection<int>.Create(Enumerable.Range(1, items).ToList(), 1, pageSize);

        Assert.That(page.TotalPages, Is.EqualTo(expectedPages));
    }

    [Test]
    public void Create_ShouldReturnRequestedPage()
    {
        var page = PagedCollection<int>.Create(Enumerable.Range(1, 12).ToList(), 3, 5);

        Assert.Multiple(() =>
        {
            Assert.That(page.Page, Is.EqualTo(3));
            Assert.That(page.Rows, Is.EqualTo(new[] { 11, 12 }));
        });
    }

    // A request without paging parameters binds both to 0.
    [TestCase(0, 0)]
    [TestCase(-3, -1)]
    public void Create_MissingOrInvalidPaging_ShouldFallBackToFirstPageOfDefaultSize(int page, int pageSize)
    {
        var result = PagedCollection<int>.Create(Enumerable.Range(1, 25).ToList(), page, pageSize);

        Assert.Multiple(() =>
        {
            Assert.That(result.Page, Is.EqualTo(1));
            Assert.That(result.Rows.Count(), Is.EqualTo(PagedCollection<int>.DefaultPageSize));
            Assert.That(result.TotalPages, Is.EqualTo(3));
        });
    }

    [Test]
    public void Create_OversizedPage_ShouldBeCapped()
    {
        var result = PagedCollection<int>.Create(Enumerable.Range(1, 500).ToList(), 1, 10_000);

        Assert.That(result.Rows.Count(), Is.EqualTo(PagedCollection<int>.MaxPageSize));
    }
}
