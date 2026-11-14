using System.Text.Json;

namespace DoggyFrictions.ExternalApi.Localization;

/// <param name="Culture">The real language behind it, for <c>&lt;html lang&gt;</c> and date pickers.</param>
public record Language(string Code, string Name, string Culture);

/// <summary>
/// The interface texts in every language, loaded once from <c>Localization/&lt;code&gt;.json</c>.
/// </summary>
public sealed class TextCatalog
{
    /// <summary>The original, playful wording ("тёрки", "постановы", "собаки").</summary>
    public const string Dog = "dog";
    public const string Russian = "ru";
    public const string English = "en";

    /// <summary>Languages in the order the settings menu lists them, each under its own name.</summary>
    public static readonly IReadOnlyList<Language> Languages =
    [
        new(Russian, "Русский", "ru"),
        new(English, "English", "en"),
        new(Dog, "Собачий", "ru"),
    ];

    private readonly Dictionary<string, IReadOnlyDictionary<string, string>> _texts;

    private TextCatalog(Dictionary<string, IReadOnlyDictionary<string, string>> texts) => _texts = texts;

    public static TextCatalog Load(string directory)
    {
        var texts = new Dictionary<string, IReadOnlyDictionary<string, string>>();
        foreach (var language in Languages)
        {
            var path = Path.Combine(directory, language.Code + ".json");
            texts[language.Code] = JsonSerializer.Deserialize<Dictionary<string, string>>(File.ReadAllText(path))
                                   ?? throw new InvalidDataException($"{path} is empty.");
        }

        return new TextCatalog(texts);
    }

    public static bool IsSupported(string? language) => Languages.Any(l => l.Code == language);

    public IReadOnlyDictionary<string, string> For(string language) => _texts[language];
}
