namespace DoggyFrictions.ExternalApi.Models;

public class Consumption
{
    /// <summary>Optional: an item may be left unnamed.</summary>
    public string? Description { get; set; }
    public IEnumerable<Consumer> Consumers { get; set; } = [];
    /// <summary>Price per unit.</summary>
    public decimal Amount { get; set; }
    public double Quantity { get; set; }
    public bool SplittedEqually { get; set; }

    /// <summary>
    /// Price of the whole item. A method, not a property: MVC validation and JSON serialization read
    /// every property, and this one overflows for quantities that have not been range-checked yet.
    /// </summary>
    public decimal Total() => Amount * (decimal)Quantity;
}
