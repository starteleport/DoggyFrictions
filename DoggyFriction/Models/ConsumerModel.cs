namespace DoggyFriction.Models
{
    public class ConsumerModel
    {
        public int Id { get; set; }
        public int ParticipantId { get; set; }
        public decimal Amount { get; set; }
        public int SessionId { get; set; }
        public int ConsumptionId { get; set; }
    }
}