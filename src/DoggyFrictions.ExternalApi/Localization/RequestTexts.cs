using System.Globalization;

namespace DoggyFrictions.ExternalApi.Localization;

/// <summary>
/// Picks the language of the current request: the <c>lang</c> cookie set by the settings menu,
/// then the browser's preferred languages, then English.
/// </summary>
public sealed class RequestTexts : ITexts
{
    public const string LanguageCookie = "lang";

    public RequestTexts(TextCatalog catalog, IHttpContextAccessor accessor)
    {
        Language = Resolve(accessor.HttpContext?.Request);
        Culture = TextCatalog.Languages.Single(language => language.Code == Language).Culture;
        All = catalog.For(Language);
    }

    public string Language { get; }

    public string Culture { get; }

    public IReadOnlyDictionary<string, string> All { get; }

    public string this[string key] => All.GetValueOrDefault(key, key);

    public string Format(string key, params object?[] args) =>
        string.Format(CultureInfo.InvariantCulture, this[key], args);

    private static string Resolve(HttpRequest? request)
    {
        if (request == null)
        {
            return TextCatalog.English;
        }

        if (request.Cookies.TryGetValue(LanguageCookie, out var chosen) && TextCatalog.IsSupported(chosen))
        {
            return chosen;
        }

        // The playful wording is opt-in only: a browser never asks for it.
        var preferred = request.GetTypedHeaders().AcceptLanguage
            .OrderByDescending(language => language.Quality ?? 1)
            .Select(language => language.Value.Value?.Split('-')[0].ToLowerInvariant())
            .FirstOrDefault(code => code is TextCatalog.Russian or TextCatalog.English);

        return preferred ?? TextCatalog.English;
    }
}
