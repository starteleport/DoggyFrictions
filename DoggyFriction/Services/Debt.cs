using System.Collections.Generic;
using System.Linq;

namespace DoggyFriction.Services
{
    public class Debt
    {
        public string Debtor { get; set; }
        public string Creditor { get; set; }
        public decimal Amount { get; set; }
        public IList<DebtTransaction> Transactions { get; set; } = new List<DebtTransaction>();

        public Debt Reverse()
        {
            return new Debt
            {
                Amount = -Amount,
                Creditor = Debtor,
                Debtor = Creditor,
                Transactions = Transactions.Select(t => t.Reverse()).ToList()
            };
        }
    }
}