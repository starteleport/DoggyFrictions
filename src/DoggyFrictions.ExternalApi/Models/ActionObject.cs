using System.ComponentModel.DataAnnotations;

namespace DoggyFrictions.ExternalApi.Models;

public class ActionObject : IValidatableObject
{
    public string Id { get; set; } = null!;
    public DateTime Date { get; set; }
    public string Description { get; set; } = null!;
    public string PayerId { get; set; } = null!;
    public IEnumerable<Consumer> Consumers { get; set; } = null!;
    public decimal Amount { get; set; }
    public string SessionId { get; set; } = null!;
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var totalConsumed = Consumers.Sum(consumer => consumer.Amount);

        if (totalConsumed != Amount)
        {
            yield return new ValidationResult($"The consumed {totalConsumed} does not match the total amount {Amount}.");
        }
    }
}