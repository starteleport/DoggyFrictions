using System.ComponentModel.DataAnnotations;

namespace DoggyFrictions.ExternalApi.Models;

public class ActionObject : IValidatableObject
{
    public string Id { get; set; } = null!;
    public DateTime Date { get; set; }
    public string Description { get; set; } = null!;
    [Required]
    public IEnumerable<Payer> Payers { get; set; } = null!;
    public IEnumerable<Consumption> Consumptions { get; set; } = null!;
    public string SessionId { get; set; } = null!;
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var totalSpent = Consumptions.Sum(consumption => consumption.Amount);
        var totalPayed = Payers.Sum(payer => payer.Amount);

        if (totalSpent != totalPayed)
        {
            yield return new ValidationResult(
                "The amount paid does not match the price of the order.",
                new[] { nameof(Consumptions), nameof(Payers) });
        }
    }
}