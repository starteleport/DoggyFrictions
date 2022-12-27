namespace DoggyFrictions.ExternalApi.Services.Repository.Models
{
    public class ActionModel
    {
        public string Id { get; set; }
        public DateTime Date { get; set; }
        public string Description { get; set; }
        public string SessionId { get; set; }
        public IEnumerable<PayerModel> Payers { get; set; }
        public IEnumerable<ConsumptionModel> Consumptions { get; set; }
    }

    public class ConsumptionModel
    {
        public string Description { get; set; }
        public IEnumerable<ConsumerModel> Consumers { get; set; }
        public decimal Amount { get; set; }
        public double Quantity { get; set; }
        public bool SplittedEqually { get; set; }
    }

    public class ConsumerModel
    {
        public string ParticipantId { get; set; }
        public decimal Amount { get; set; }
    }

    public class PayerModel
    {
        public string ParticipantId { get; set; }
        public decimal Amount { get; set; }
    }
}