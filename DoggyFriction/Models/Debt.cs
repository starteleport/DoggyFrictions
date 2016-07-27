using System.Collections.Generic;
using System.Linq;

namespace DoggyFriction.Services
{
    public class Debt
    {
        public string Debtor { get; set; }
        public string Creditor { get; set; }
        public IList<DebtTransaction> Transactions { get; set; } = new List<DebtTransaction>();
        public decimal Amount => Transactions.Sum(t => t.Amount);

        public Debt Reverse()
        {
            return new Debt
            {
                Creditor = Debtor,
                Debtor = Creditor,
                Transactions = Transactions.Select(t => t.Reverse()).ToList()
            };
        }
    }
}