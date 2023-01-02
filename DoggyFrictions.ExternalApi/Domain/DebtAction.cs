namespace DoggyFrictions.ExternalApi.Domain;

public class DebtAction
{
    public DateTime Date { get; set; }
    public string Description { get; set; } = null!;
    public IEnumerable<Participation> Sponsors { get; set; } = null!;
    public IEnumerable<Good> Goods { get; set; } = null!;
}