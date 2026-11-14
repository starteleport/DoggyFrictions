using System.ComponentModel.DataAnnotations;
using DoggyFrictions.ExternalApi.Localization;

namespace DoggyFrictions.ExternalApi.Tests;

/// <summary>
/// Texts for tests: a message is its key, followed by its arguments in brackets, so assertions
/// do not depend on the wording in any language.
/// </summary>
public sealed class TestTexts : ITexts, IServiceProvider
{
    public string Language => "test";

    public string Culture => "en";

    public IReadOnlyDictionary<string, string> All { get; } = new Dictionary<string, string>();

    public string this[string key] => key;

    public string Format(string key, params object?[] args) => $"{key}[{string.Join("|", args)}]";

    public object? GetService(Type serviceType) => serviceType == typeof(ITexts) ? this : null;

    /// <summary>Validation messages of <paramref name="model"/>, as MVC would collect them.</summary>
    public static List<string?> Errors(IValidatableObject model) =>
        model.Validate(new ValidationContext(model, new TestTexts(), null)).Select(result => result.ErrorMessage).ToList();
}
