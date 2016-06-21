using System.Collections.Generic;
using System.Linq;
using Microsoft.Ajax.Utilities;
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
                action.Sponsors.ForEach(sponsor => {
                    var sponsorRate = sponsor.Amount / totalAmountPaid;
                    action.Goods.ForEach(good => {
                        good.Consumers.Where(c => c.Participant != sponsor.Participant).ForEach(consumer => {
                            var debtAmount = consumer.Amount * sponsorRate;
                            var debtTransaction = new DebtTransaction(debtAmount, action.Description, good.Description, action.Date);
                            debtAggregator.AddTransaction(sponsor.Participant, consumer.Participant, debtTransaction);
                        });
                    });
                });
            });
            return debtAggregator.GetDebts().Where(totalDebt => totalDebt.Amount != 0);
        }
    }
}