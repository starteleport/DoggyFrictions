namespace DoggyFrictions.ExternalApi.Domain;

public class Good
{
    public IEnumerable<Participation> Consumers { get; set; }
    public decimal Amount { get; set; }
    public bool SplittedEqually { get; set; }
}