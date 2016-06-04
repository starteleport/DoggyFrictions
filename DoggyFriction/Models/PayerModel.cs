namespace DoggyFriction.Models
{
    public class PayerModel
    {
        public int Id { get; set; }
        public int ParticipantId { get; set; }
        public decimal Amount { get; set; }
        public int SessionId { get; set; }
        public int ActionId { get; set; }
    }
}