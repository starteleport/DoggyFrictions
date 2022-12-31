namespace DoggyFrictions.ExternalApi.Models;

public class Debt
{
    public string Debtor { get; set; }
    public string Creditor { get; set; }
    public IList<DebtTransaction> Transactions { get; set; } = new List<DebtTransaction>();
    public decimal Amount => Math.Round(Transactions.Sum(t => t.Amount), 2);

    public Debt Reverse()
    {
        return new Debt
        {
            Creditor = Debtor,
            Debtor = Creditor,
            Transactions = Transactions.Select(t => t.Reverse()).ToList()
        };
    }
}