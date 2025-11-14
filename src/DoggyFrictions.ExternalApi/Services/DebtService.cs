using DoggyFrictions.ExternalApi.Domain;
using DoggyFrictions.ExternalApi.Models;

namespace DoggyFrictions.ExternalApi.Services;

public class DebtService : IDebtService
{
    public IEnumerable<Debt> GetDebts(IEnumerable<DebtAction> actions)
    {
        if (actions?.Any() != true)
        {
            return Enumerable.Empty<Debt>();
        }

        var balancePerPerson = new Dictionary<string, decimal>();

        foreach (var action in actions)
        {
            foreach(var credit in action.Sponsors)
            {
                var creditorId = credit.Participant;
                if (!balancePerPerson.ContainsKey(creditorId))
                {
                    balancePerPerson[creditorId] = credit.Amount;
                }
                else
                {
                    balancePerPerson[creditorId] += credit.Amount;
                }
            }
            
            foreach(var debit in action.Goods.SelectMany(g => g.Consumers))
            {
                var debitorId = debit.Participant;
                if (!balancePerPerson.ContainsKey(debitorId))
                {
                    balancePerPerson[debitorId] = -debit.Amount;
                }
                else
                {
                    balancePerPerson[debitorId] -= debit.Amount;
                }
            }
        }

        // Now we try to resolve the debt in minimal number of transactions. One simple way to do it is for small debtors to pay to the highest creditors first.
        var aggregatedDebts = new List<Debt>();
        var creditors = balancePerPerson.Where(b => b.Value > 0).Select(c => new PersonAndBalance { ParticipantId = c.Key, Balance = c.Value }).OrderByDescending(c => c.Balance).ToList();
        var debitors = balancePerPerson.Where(b => b.Value < 0).Select(c => new PersonAndBalance { ParticipantId = c.Key, Balance = -c.Value }).OrderBy(c => c.Balance).ToList();
        var date = actions.Max(a => a.Date); // This algorithm loses details about individual action dates
        var description = "Aggregated debt pay"; // This algorithm loses details about individual action names
        foreach (var debitor in debitors)
        {
            foreach(var creditor in creditors)
            {
                if(debitor.Balance == 0)
                {
                    break;
                }
                if(creditor.Balance == 0)
                {
                    continue;
                }

                var appliedAmount = Math.Min(debitor.Balance, creditor.Balance);
                aggregatedDebts.Add(new Debt {
                    Creditor = creditor.ParticipantId,
                    Debtor = debitor.ParticipantId,
                    Transactions = new List<DebtTransaction>()
                    {
                        new DebtTransaction(Math.Min(debitor.Balance, creditor.Balance), description, date)
                    }
                });

                creditor.Balance -= appliedAmount;
                debitor.Balance -= appliedAmount;
            }
        }
        return aggregatedDebts;
    }

    private class PersonAndBalance
    {
        internal string ParticipantId { get; set; }
        internal decimal Balance { get; set; }
    }
}