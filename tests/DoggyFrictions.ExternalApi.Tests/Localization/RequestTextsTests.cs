using DoggyFrictions.ExternalApi.Localization;
using Microsoft.AspNetCore.Http;
using NUnit.Framework;

namespace DoggyFrictions.ExternalApi.Tests.Localization;

[TestFixture]
public class RequestTextsTests
{
    private static readonly TextCatalog Catalog = TextCatalog.Load(
        Path.Combine(AppContext.BaseDirectory, "Localization"));

    private static RequestTexts TextsFor(string? cookie = null, string? acceptLanguage = null)
    {
        var context = new DefaultHttpContext();
        if (cookie != null) context.Request.Headers.Cookie = "lang=" + cookie;
        if (acceptLanguage != null) context.Request.Headers.AcceptLanguage = acceptLanguage;
        return new RequestTexts(Catalog, new HttpContextAccessor { HttpContext = context });
    }

    [TestCase("ru-RU,ru;q=0.9,en;q=0.8", "ru")]
    [TestCase("en-US,en;q=0.9", "en")]
    [TestCase("de-DE,de;q=0.9,ru;q=0.5,en;q=0.4", "ru")]
    [TestCase("en;q=0.4,ru;q=0.9", "ru")]
    [TestCase("de-DE", "en")]
    [TestCase(null, "en")]
    public void Language_ShouldFollowTheBrowser_WhenNothingWasChosen(string? acceptLanguage, string expected)
    {
        Assert.That(TextsFor(acceptLanguage: acceptLanguage).Language, Is.EqualTo(expected));
    }

    [Test]
    public void Language_ShouldBeTheChosenOne_OverTheBrowser()
    {
        Assert.That(TextsFor(cookie: "dog", acceptLanguage: "en-US").Language, Is.EqualTo("dog"));
    }

    [Test]
    public void Language_ShouldIgnoreUnknownValues()
    {
        Assert.That(TextsFor(cookie: "../etc", acceptLanguage: "ru").Language, Is.EqualTo("ru"));
    }

    // The playful wording is never picked automatically.
    [Test]
    public void Language_ShouldNeverDefaultToDog()
    {
        Assert.That(TextsFor(acceptLanguage: "dog").Language, Is.EqualTo("en"));
    }

    [TestCase("ru", "ru")]
    [TestCase("en", "en")]
    [TestCase("dog", "ru")]
    public void Culture_ShouldBeTheRealLanguageBehindTheChoice(string chosen, string culture)
    {
        Assert.That(TextsFor(cookie: chosen).Culture, Is.EqualTo(culture));
    }

    [Test]
    public void Texts_ShouldComeFromTheLanguage()
    {
        Assert.Multiple(() =>
        {
            Assert.That(TextsFor(cookie: "dog")["sessions.title"], Is.EqualTo("Тёрки"));
            Assert.That(TextsFor(cookie: "ru")["sessions.title"], Is.EqualTo("Группы"));
            Assert.That(TextsFor(cookie: "en")["sessions.title"], Is.EqualTo("Groups"));
        });
    }

    [Test]
    public void Format_ShouldFillPlaceholders_AndUnknownKeysShowAsIs()
    {
        var texts = TextsFor(cookie: "en");

        Assert.Multiple(() =>
        {
            Assert.That(texts.Format("validation.action.itemShares", "Pizza"),
                Is.EqualTo("The shares of item “Pizza” do not add up to its price."));
            Assert.That(texts["no.such.key"], Is.EqualTo("no.such.key"));
        });
    }
}
