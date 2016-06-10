using System.Collections.Generic;

namespace DoggyFriction.Models
{
    public class ConsumptionModel
    {
        public int Id { get; set; }
        public string Description { get; set; }
        public IEnumerable<ConsumerModel> Consumers { get; set; }
        public decimal Amount { get; set; }
        public double Quantity { get; set; }
        public bool SplittedEqually { get; set; }
    }
}