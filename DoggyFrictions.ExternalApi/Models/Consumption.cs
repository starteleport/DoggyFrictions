namespace DoggyFrictions.ExternalApi.Models
{
    public class Consumption
    {
        public string Description { get; set; }
        public IEnumerable<Consumer> Consumers { get; set; }
        public decimal Amount { get; set; }
        public double Quantity { get; set; }
        public bool SplittedEqually { get; set; }
    }
}