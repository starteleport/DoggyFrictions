namespace DoggyFrictions.ExternalApi.Models;

public class DebtTransaction
{
    public decimal Amount { get; }

    public DebtTransaction Reverse() => new DebtTransaction(-Amount);

    public DebtTransaction(decimal amount)
    {
        Amount = amount;
    }
}