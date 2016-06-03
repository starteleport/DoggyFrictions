using System;
using System.Collections.Generic;

namespace DoggyFriction.Models
{
    public class ActionModel
    {
        public int Id { get; set; }
        public int SessionId { get; set; }
        public DateTime Date { get; set; }
        public string Description { get; set; }
        public decimal Amount { get; set; }
        public IEnumerable<PayerModel> Payers { get; set; }
        public IEnumerable<ConsumerModel> Consumers { get; set; }
    }
}