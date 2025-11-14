namespace DoggyFrictions.ExternalApi.Models;

public class Debt
{
    public string Debtor { get; set; } = null!;
    public string Creditor { get; set; } = null!;
    public decimal Amount { get; set; } = 0;
}