using System;
using System.Collections.Generic;
using System.Linq;
using Action = DoggyFriction.Domain.Action;

namespace DoggyFriction.Services
{
    public class DebtService : IDebtService
    {
        public IEnumerable<Debt> GetDebts(IEnumerable<Action> actions)
        {
            if (actions?.Any() != true) {
                return Enumerable.Empty<Debt>();
            }

            var debtAggregator = new DebtAggregator();
            actions.OrderBy(a => a.Date).ForEach(action => {
                var totalAmountPaid = action.Sponsors.Sum(s => s.Amount);
                var payersDict = action.Goods
                    .SelectMany(good => good.Consumers)
                    .ToLookup(consumer => consumer.Participant)
                    .ToDictionary(p => p.Key, p => p.Sum(consumer => consumer.Amount));
                action.Sponsors.ForEach(sponsor => {
                    var sponsorRate = sponsor.Amount / totalAmountPaid;
                    payersDict
                        .Where(pair => pair.Key != sponsor.Participant)
                        .ForEach(pair => {
                            var consumer = pair.Key;
                            var amount = pair.Value;
                            var debtAmount = Math.Round(amount * sponsorRate, 2);
                            var debtTransaction = new DebtTransaction(debtAmount, action.Description, action.Date);
                            debtAggregator.AddTransaction(sponsor.Participant, consumer, debtTransaction);
                        });
                });
            });
            return debtAggregator.GetDebts().Where(totalDebt => totalDebt.Amount != 0);
        }
    }
}