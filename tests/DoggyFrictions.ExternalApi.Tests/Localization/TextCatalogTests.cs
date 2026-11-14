using System.Text.RegularExpressions;
using DoggyFrictions.ExternalApi.Localization;
using NUnit.Framework;

namespace DoggyFrictions.ExternalApi.Tests.Localization;

[TestFixture]
public class TextCatalogTests
{
    private const string Key = @"([a-z]+(?:\.[A-Za-z]+)+)";

    // How the sources refer to a text: T["a.b"], texts["a.b"], _texts["a.b"] and Format("a.b", …) on the server,
    // t('a.b') in the front end.
    private static readonly Regex KeyUsage = new(
        @"(?:(?:\bT|[tT]exts)\[""|\bt\('|Format\(\s*"")" + Key, RegexOptions.Compiled);

    private static readonly Regex Placeholder = new(@"\{\d+\}", RegexOptions.Compiled);

    private static readonly string SourceRoot = FindSourceRoot();
    private static readonly TextCatalog Catalog = TextCatalog.Load(Path.Combine(SourceRoot, "Localization"));

    private static IEnumerable<string> LanguageCodes => TextCatalog.Languages.Select(language => language.Code);

    [TestCaseSource(nameof(LanguageCodes))]
    public void EveryLanguage_ShouldHaveTheSameKeys(string language)
    {
        Assert.That(Catalog.For(language).Keys, Is.EquivalentTo(Catalog.For(TextCatalog.Russian).Keys));
    }

    [TestCaseSource(nameof(LanguageCodes))]
    public void EveryText_ShouldBeFilledIn(string language)
    {
        Assert.That(Catalog.For(language).Where(text => string.IsNullOrWhiteSpace(text.Value)).Select(text => text.Key), Is.Empty);
    }

    [TestCaseSource(nameof(LanguageCodes))]
    public void EveryText_ShouldUseTheSamePlaceholdersAsTheOtherLanguages(string language)
    {
        var mismatched = Catalog.For(language)
            .Where(text => !Placeholders(text.Value).SetEquals(Placeholders(Catalog.For(TextCatalog.Russian)[text.Key])))
            .Select(text => text.Key);

        Assert.That(mismatched, Is.Empty);
    }

    // A typo in a key would silently show the key instead of a text.
    [Test]
    public void EveryKeyUsedInTheSources_ShouldExist()
    {
        var used = UsedKeys();

        Assert.Multiple(() =>
        {
            Assert.That(used, Is.Not.Empty);
            Assert.That(used.Except(Catalog.For(TextCatalog.Russian).Keys), Is.Empty, "keys used but missing from the catalog");
        });
    }

    [Test]
    public void EveryKeyInTheCatalog_ShouldBeUsed()
    {
        Assert.That(Catalog.For(TextCatalog.Russian).Keys.Except(UsedKeys()), Is.Empty, "texts nobody refers to");
    }

    [Test]
    public void TheDogLanguage_ShouldKeepTheOriginalWording()
    {
        var dog = Catalog.For(TextCatalog.Dog);

        Assert.Multiple(() =>
        {
            Assert.That(dog["sessions.title"], Is.EqualTo("Тёрки"));
            Assert.That(dog["action.title"], Is.EqualTo("Постанова"));
            // Spelled this way on purpose, as it always was in the breadcrumb.
            Assert.That(dog["action.breadcrumb"], Is.EqualTo("Пастанова"));
            Assert.That(dog["sessions.deleteMessage"], Does.Contain("ходите удалить"));
            Assert.That(dog["action.deleteMessage"], Does.Contain("ходите удалить"));
            Assert.That(dog["session.participantsTitle"], Is.EqualTo("Собаки"));
        });
    }

    private static HashSet<string> UsedKeys()
    {
        var clientApp = Path.Combine(SourceRoot, "ClientApp");
        var files = Directory.EnumerateFiles(Path.Combine(SourceRoot, "Views"), "*.cshtml", SearchOption.AllDirectories)
            .Concat(Directory.EnumerateFiles(SourceRoot, "*.cs", SearchOption.AllDirectories))
            .Concat(Directory.EnumerateFiles(clientApp, "*.ts", SearchOption.AllDirectories))
            .Concat(Directory.EnumerateFiles(clientApp, "*.vue", SearchOption.AllDirectories))
            .Where(file => !file.EndsWith(".test.ts"));

        return files
            .SelectMany(file => KeyUsage.Matches(File.ReadAllText(file)).Select(match => match.Groups[1].Value))
            .ToHashSet();
    }

    private static HashSet<string> Placeholders(string text) =>
        Placeholder.Matches(text).Select(match => match.Value).ToHashSet();

    private static string FindSourceRoot()
    {
        for (var directory = new DirectoryInfo(AppContext.BaseDirectory); directory != null; directory = directory.Parent)
        {
            var candidate = Path.Combine(directory.FullName, "src", "DoggyFrictions.ExternalApi");
            if (Directory.Exists(Path.Combine(candidate, "Localization")))
            {
                return candidate;
            }
        }

        throw new DirectoryNotFoundException("src/DoggyFrictions.ExternalApi was not found above the test output.");
    }
}
