using System.Collections.Generic;

namespace DoggyFriction.Services
{
    public class Debt
    {
        public string Debtor { get; set; }
        public string Creditor { get; set; }
        public decimal Amount { get; set; }
        public IEnumerable<DebtTransaction> Transactions { get; set; }
    }
}