using System.ComponentModel.DataAnnotations;

namespace DoggyFrictions.ExternalApi.Models;

public class ActionObject
{
    public string Id { get; set; } = null!;
    public DateTime Date { get; set; }
    public string Description { get; set; } = null!;
    [Required]
    public IEnumerable<Payer> Payers { get; set; } = null!;
    public IEnumerable<Consumption> Consumptions { get; set; } = null!;
    public string SessionId { get; set; } = null!;
}