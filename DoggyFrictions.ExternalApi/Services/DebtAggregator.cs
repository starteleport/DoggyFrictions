using DoggyFrictions.ExternalApi.Models;

namespace DoggyFrictions.ExternalApi.Services;

public class DebtAggregator
{
    private class DebtAggregatorKey : IEquatable<DebtAggregatorKey>
    {
        public string Creditor { get; }
        public string Debtor { get; }

        public override int GetHashCode()
        {
            return Creditor.GetHashCode() + Debtor.GetHashCode();
        }

        public bool Equals(DebtAggregatorKey? other)
        {
            if (other == null)
            {
                return false;
            }

            return (Creditor == other.Creditor && Debtor == other.Debtor)
                   || (Creditor == other.Debtor && Debtor == other.Creditor);
        }

        public override string ToString()
        {
            return $"{Creditor}, {Debtor}";
        }

        public DebtAggregatorKey(string creditor, string debtor)
        {
            Creditor = creditor;
            Debtor = debtor;
        }

        public override bool Equals(object? obj)
        {
            return Equals(obj as DebtAggregatorKey);
        }
    }

    private readonly Dictionary<DebtAggregatorKey, Debt> debts = new();

    public IEnumerable<Debt> GetDebts() => debts.Values;

    public void AddTransaction(string creditor, string debtor, DebtTransaction transaction)
    {
        if (transaction.Amount < 0m)
        {
            throw new ArgumentException($"Cannot add transaction: amount must be > 0 but was {transaction?.Amount}.");
        }
        if (string.IsNullOrWhiteSpace(creditor) || string.IsNullOrWhiteSpace(debtor))
        {
            throw new ArgumentException($"Cannot add transaction: creditor = [{creditor}], debtor = [{debtor}].");
        }
        if (transaction.Amount == 0m)
        {
            return;
        }

        var key = new DebtAggregatorKey(creditor, debtor);
        if (!debts.ContainsKey(key))
        {
            debts.Add(key, new Debt { Creditor = creditor, Debtor = debtor });
        }

        var debt = debts[key];
        if (key.Creditor == debt.Creditor)
        {
            debt.Transactions.Add(transaction);
        }
        else
        {
            debt.Transactions.Add(transaction.Reverse());
            if (debt.Amount < 0)
            {
                debts[key] = debt.Reverse();
            }
            else if (debt.Amount == 0)
            {
                debts.Remove(key);
            }
        }
    }
}