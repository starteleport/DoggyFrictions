namespace DoggyFrictions.ExternalApi.Domain
{
    public class Good
    {
        public string Description { get; set; }
        public IEnumerable<Participation> Consumers { get; set; }
        public decimal PricePerUnit { get; set; }
        public double Quantity { get; set; }
        public bool SplittedEqually { get; set; }
    }
}