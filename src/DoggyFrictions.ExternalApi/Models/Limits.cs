using System.Globalization;

namespace DoggyFrictions.ExternalApi.Models;

/// <summary>Sanity bounds for money and quantities; they also keep decimal arithmetic far from overflow.</summary>
public static class Limits
{
    public const decimal MaxAmount = 1_000_000_000m;
    public const double MaxQuantity = 1_000_000;

    /// <summary>A bound as shown in validation messages, e.g. "1,000,000,000".</summary>
    public static string Display(decimal bound) => bound.ToString("N0", CultureInfo.InvariantCulture);

    /// <inheritdoc cref="Display(decimal)"/>
    public static string Display(double bound) => bound.ToString("N0", CultureInfo.InvariantCulture);
}
