namespace DoggyFrictions.ExternalApi.Models;

public class Debt
{
    public string DebtorId { get; set; } = null!;
    public string CreditorId { get; set; } = null!;
    /// <summary>Display name of the debtor.</summary>
    public string Debtor { get; set; } = null!;
    /// <summary>Display name of the creditor.</summary>
    public string Creditor { get; set; } = null!;
    public decimal Amount { get; set; } = 0;
}
