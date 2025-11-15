namespace DoggyFrictions.ExternalApi.Models;

public class Consumption
{
    public IEnumerable<Consumer> Consumers { get; set; }
    public decimal Amount { get; set; }
    public bool SplittedEqually { get; set; }
}