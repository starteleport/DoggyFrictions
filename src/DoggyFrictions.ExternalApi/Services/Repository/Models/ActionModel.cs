namespace DoggyFrictions.ExternalApi.Services.Repository.Models;

public class ActionModel
{
    public string Id { get; set; } = null!;
    public DateTime Date { get; set; }
    public string Description { get; set; } = null!;
    public string SessionId { get; set; } = null!;
    public IEnumerable<PayerModel> Payers { get; set; } = null!;
    public IEnumerable<ConsumptionModel> Consumptions { get; set; } = null!;
}

public class ConsumptionModel
{
    public string Description { get; set; } = null!;
    public IEnumerable<ConsumerModel> Consumers { get; set; } = null!;
    public decimal Amount { get; set; }
    public double Quantity { get; set; }
    public bool SplittedEqually { get; set; }
}

public class ConsumerModel
{
    public string ParticipantId { get; set; } = null!;
    public decimal Amount { get; set; }
}

public class PayerModel
{
    public string ParticipantId { get; set; } = null!;
    public decimal Amount { get; set; }
}