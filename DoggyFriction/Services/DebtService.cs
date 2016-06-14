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
            foreach (var action in actions) {
                var sponsors = action.Sponsors;
                var amountPaid = sponsors.Sum(s => s.Amount);
                foreach (var sponsor in sponsors) {
                    var fraction = sponsor.Amount / amountPaid;
                    foreach (var good in action.Goods) {
                        var consumers = good.Consumers;
                        foreach (var consumer in consumers.Where(c => c.Participant != sponsor.Participant)) {
                            var debtAmount = consumer.Amount * fraction;
                            if (debtAmount > 0) {
                                var debtTransaction = new DebtTransaction(debtAmount, action.Description, good.Description, action.Date);
                                debtAggregator.AddTransaction(sponsor.Participant, consumer.Participant, debtTransaction);
                            }
                        }
                    }
                }
            }
            return debtAggregator.GetDebts().Where(totalDebt => totalDebt.Amount != 0);
        }
    }
}