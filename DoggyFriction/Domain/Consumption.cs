using System.Collections.Generic;

namespace DoggyFriction.Domain
{
    public class Consumption
    {
        public string Description { get; set; }
        public IEnumerable<Participation> Consumers { get; set; }
        public decimal PricePerUnit { get; set; }
        public double Quantity { get; set; }
        public bool SplittedEqually { get; set; }
    }
}