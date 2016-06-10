using System.Collections.Generic;
using System.Linq;
using DoggyFriction.Models;
using Action = DoggyFriction.Domain.Action;

namespace DoggyFriction.Services
{
    public class DebtService : IDebtService
    {
        public IEnumerable<Debt> GetDebts(IEnumerable<Action> actions)
        {
            var sponsors = actions
                .SelectMany(a => a.Sponsors)
                .GroupBy(g => g.Participant, g => g.Amount)
                .Select(g => new
                {
                    Participant = g.Key,
                    Amount = g.Sum()
                }).ToList();
            var consumers = actions
                .SelectMany(a => a.Goods)
                .SelectMany(g => g.Consumers)
                .GroupBy(g => g.Participant, g => g.Amount)
                .Select(g => new
                {
                    Participant = g.Key,
                    Amount = g.Sum()
                }).ToList();
            var amountPaid = sponsors.Sum(s => s.Amount);
            foreach (var sponsor in sponsors)
            {
                var fraction = sponsor.Amount/amountPaid;
                foreach (var consumer in consumers.Where(c => c.Participant != sponsor.Participant))
                {
                    var debtAmount = consumer.Amount*fraction;
                    if (debtAmount > 0)
                    {
                        yield return new Debt
                        {
                            Amount = debtAmount,
                            Creditor = sponsor.Participant,
                            Debtor = consumer.Participant
                        };
                    }
                }
            }
        }
    }
}