using System;
using System.Collections.Generic;
using System.Linq;
using WebGrease.Css.Extensions;

namespace DoggyFriction.Services
{
    public class DebtContainer
    {
        public DebtContainerKey Key { get; }
        private List<DebtTransaction> _history = new List<DebtTransaction>();

        public Debt Total
        {
            get
            {
                var totalAmount = Math.Round(_history.Sum(u => u.Amount), 2);
                return new Debt {
                    Creditor = totalAmount > 0 ? Key.FirstGuy : Key.SecondGuy,
                    Debtor = totalAmount > 0 ? Key.SecondGuy : Key.FirstGuy,
                    Amount = Math.Abs(totalAmount),
                    Transactions = totalAmount > 0 ? _history.ToList() : _history.Select(t => t.Inverse()).ToList()
                };
            }
        }

        public void AddUnit(DebtContainerKey unitKey, DebtTransaction unit)
        {
            if (!Key.Equals(unitKey)) {
                throw new InvalidOperationException($"Can't add key [{unitKey}] into container with key [{Key}]");
            }
            _history.Add(unitKey.HasSameDirectionAs(Key) ? unit : unit.Inverse());
        }

        public DebtContainer(DebtContainerKey key)
        {
            Key = key;
        }
    }
}