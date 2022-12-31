namespace DoggyFrictions.ExternalApi.Models;

public class ActionObject
{
    public string Id { get; set; }
    public DateTime Date { get; set; }
    public string Description { get; set; }
    public IEnumerable<Payer> Payers { get; set; }
    public IEnumerable<Consumption> Consumptions { get; set; }
    public string SessionId { get; set; }
}