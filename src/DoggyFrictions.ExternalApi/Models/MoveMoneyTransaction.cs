using System.ComponentModel.DataAnnotations;
using DoggyFrictions.ExternalApi.Localization;

namespace DoggyFrictions.ExternalApi.Models;

/// <summary>A transfer of money from one participant of a session to another.</summary>
public class MoveMoneyTransaction : IValidatableObject
{
    private const decimal MinAmount = 0.01m;

    public decimal Amount { get; set; }
    public string? FromId { get; set; }
    public string? ToId { get; set; }
    public string? Reason { get; set; }
    public DateTime? Date { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Amount is < MinAmount or > Limits.MaxAmount)
        {
            yield return new ValidationResult(
                validationContext.Texts().Format("validation.transfer.amount", Limits.Display(Limits.MaxAmount)),
                [nameof(Amount)]);
        }
    }
}
