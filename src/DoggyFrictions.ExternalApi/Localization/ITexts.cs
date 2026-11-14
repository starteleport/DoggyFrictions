using System.ComponentModel.DataAnnotations;

namespace DoggyFrictions.ExternalApi.Localization;

/// <summary>The interface texts in the language of the current request.</summary>
public interface ITexts
{
    string Language { get; }

    /// <summary>The real language behind <see cref="Language"/>: "ru" or "en".</summary>
    string Culture { get; }

    /// <summary>All texts by key, for handing over to the client scripts.</summary>
    IReadOnlyDictionary<string, string> All { get; }

    /// <summary>The text for <paramref name="key"/>; the key itself when there is none.</summary>
    string this[string key] { get; }

    /// <summary>The text for <paramref name="key"/> with its <c>{0}</c>, <c>{1}</c>… placeholders filled in.</summary>
    string Format(string key, params object?[] args);
}

public static class ValidationContextExtensions
{
    /// <summary>Texts for validation messages; MVC passes the request services into the context.</summary>
    public static ITexts Texts(this ValidationContext context) =>
        (ITexts?)context.GetService(typeof(ITexts))
        ?? throw new InvalidOperationException($"{nameof(ITexts)} is not available to validation.");
}
