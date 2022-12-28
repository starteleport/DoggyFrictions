using DoggyFrictions.ExternalApi.Domain;
using DoggyFrictions.ExternalApi.Models;

namespace DoggyFrictions.ExternalApi.Services;

public class DebtService : IDebtService
{
    public IEnumerable<Debt> GetDebts(IEnumerable<DebptAction> actions)
    {
        if (actions?.Any() != true)
        {
            return Enumerable.Empty<Debt>();
        }

        var debtAggregator = new DebtAggregator();
        foreach (var action in actions.OrderBy(a => a.Date))
        {
            var totalAmountPaid = action.Sponsors.Sum(s => s.Amount);
            var payersDict = action.Goods
                .SelectMany(good => good.Consumers)
                .ToLookup(consumer => consumer.Participant)
                .ToDictionary(p => p.Key, p => p.Sum(consumer => consumer.Amount));

            foreach (var sponsor in action.Sponsors)
            {
                var sponsorRate = sponsor.Amount / totalAmountPaid;

                foreach (var pair in payersDict.Where(pair => pair.Key != sponsor.Participant))
                {
                    var consumer = pair.Key;
                    var amount = pair.Value;
                    var debtAmount = Math.Round(amount * sponsorRate, 2);
                    var debtTransaction = new DebtTransaction(debtAmount, action.Description, action.Date);
                    debtAggregator.AddTransaction(sponsor.Participant, consumer, debtTransaction);
                }
            }
        }
        return debtAggregator.GetDebts().Where(totalDebt => totalDebt.Amount != 0);
    }
}