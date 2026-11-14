using System.ComponentModel.DataAnnotations;
using DoggyFrictions.ExternalApi.Localization;

namespace DoggyFrictions.ExternalApi.Models;

public class ActionObject : IValidatableObject
{
    // Clients round shares to kopecks and send JavaScript floats, so totals may differ by a kopeck.
    private const decimal Tolerance = 0.01m;

    public string Id { get; set; } = null!;
    public DateTime Date { get; set; }
    public string? Description { get; set; }
    public IEnumerable<Payer> Payers { get; set; } = [];
    public IEnumerable<Consumption> Consumptions { get; set; } = [];
    public string SessionId { get; set; } = null!;

    /// <summary>Ids of everyone who paid or consumed in this action.</summary>
    public IEnumerable<string> ParticipantIds() =>
        Payers.Select(payer => payer.ParticipantId)
            .Concat(Consumptions.SelectMany(consumption => consumption.Consumers).Select(consumer => consumer.ParticipantId))
            .Distinct();

    // All rules live here rather than in attributes so that every message goes through ITexts.
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var texts = validationContext.Texts();

        if (string.IsNullOrWhiteSpace(Description))
        {
            yield return new ValidationResult(texts["validation.action.descriptionRequired"], [nameof(Description)]);
        }

        if (string.IsNullOrEmpty(SessionId))
        {
            yield return new ValidationResult(texts["validation.action.sessionRequired"], [nameof(SessionId)]);
        }

        // JSON can carry explicit nulls where the model expects collections and items.
        if (Payers is null || Payers.Contains(null!) ||
            Consumptions is null || Consumptions.Any(consumption => consumption?.Consumers is null || consumption.Consumers.Contains(null!)))
        {
            yield return new ValidationResult(texts["validation.action.nulls"], [nameof(Payers), nameof(Consumptions)]);
            yield break;
        }

        if (ParticipantIds().Any(string.IsNullOrEmpty))
        {
            yield return new ValidationResult(texts["validation.action.participantRequired"], [nameof(Payers), nameof(Consumptions)]);
        }

        if (!Payers.Any())
        {
            yield return new ValidationResult(texts["validation.action.payersRequired"], [nameof(Payers)]);
        }

        var maxAmount = Limits.Display(Limits.MaxAmount);
        var amountsInRange = true;
        if (Payers.Any(payer => !InRange(payer.Amount)))
        {
            amountsInRange = false;
            yield return new ValidationResult(texts.Format("validation.action.payerAmounts", maxAmount), [nameof(Payers)]);
        }

        foreach (var consumption in Consumptions)
        {
            var quantityInRange = consumption.Quantity > 0 && consumption.Quantity <= Limits.MaxQuantity;
            if (!InRange(consumption.Amount) || !quantityInRange || consumption.Consumers.Any(consumer => !InRange(consumer.Amount)))
            {
                amountsInRange = false;
                yield return new ValidationResult(
                    texts.Format("validation.action.itemRange", consumption.Description, maxAmount,
                        Limits.Display(Limits.MaxQuantity)),
                    [nameof(Consumptions)]);
            }
            else if (!Same(consumption.Consumers.Sum(consumer => consumer.Amount), consumption.Total()))
            {
                yield return new ValidationResult(
                    texts.Format("validation.action.itemShares", consumption.Description), [nameof(Consumptions)]);
            }
        }

        if (amountsInRange && !Same(Consumptions.Sum(consumption => consumption.Total()), Payers.Sum(payer => payer.Amount)))
        {
            yield return new ValidationResult(texts["validation.action.totals"], [nameof(Consumptions), nameof(Payers)]);
        }
    }

    private static bool InRange(decimal amount) => amount is >= 0 and <= Limits.MaxAmount;

    private static bool Same(decimal left, decimal right) => Math.Abs(left - right) <= Tolerance;
}
