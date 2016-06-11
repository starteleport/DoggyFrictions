using System.Collections.Generic;
using System.Linq;
using DoggyFriction.Models;
using Microsoft.Ajax.Utilities;
using Action = DoggyFriction.Domain.Action;

namespace DoggyFriction.Services
{
    public class DebtService : IDebtService
    {
        public IEnumerable<Debt> GetDebts(IEnumerable<Action> actions)
        {
            var debtContainers = new Dictionary<DebtContainerKey, DebtContainer>();
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
                                var key = new DebtContainerKey(sponsor.Participant, consumer.Participant);
                                if (!debtContainers.ContainsKey(key)) {
                                    debtContainers.Add(key, new DebtContainer(key));
                                }
                                var debtUnit = new DebtHustoryUnit(debtAmount, action, good);
                                debtContainers[key].AddUnit(key, debtUnit);
                            }
                        }
                    }
                }
            }
            return debtContainers.Values
                .Select(debtContainer => debtContainer.Total)
                .Where(totalDebt => totalDebt.Amount != 0);
        }
    }
}