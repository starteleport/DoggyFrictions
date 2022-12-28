namespace DoggyFrictions.ExternalApi.Domain;

public class Action
{
    public DateTime Date { get; set; }
    public string Description { get; set; }
    public IEnumerable<Participation> Sponsors { get; set; }
    public IEnumerable<Good> Goods { get; set; }
}