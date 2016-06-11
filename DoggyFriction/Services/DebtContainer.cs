using System;
using System.Collections.Generic;
using System.Linq;

namespace DoggyFriction.Services
{
    public class DebtContainer
    {
        public DebtContainerKey Key { get; }
        private List<DebtHustoryUnit> _history = new List<DebtHustoryUnit>();
        public IEnumerable<DebtHustoryUnit> History => _history.AsReadOnly();

        public Debt Total
        {
            get
            {
                var totalAmount = History.Sum(u => u.Amount);
                return new Debt {
                    Creditor = totalAmount > 0 ? Key.FirstGuy : Key.SecondGuy,
                    Debtor = totalAmount > 0 ? Key.SecondGuy : Key.FirstGuy,
                    Amount = totalAmount
                };
            }
        }

        public void AddUnit(DebtContainerKey unitKey, DebtHustoryUnit unit)
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