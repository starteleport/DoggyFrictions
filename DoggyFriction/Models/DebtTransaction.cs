using System;

namespace DoggyFriction.Services
{
    public class DebtTransaction
    {
        public decimal Amount { get; }
        public string Action { get; }
        public DateTime Date { get; }

        public DebtTransaction Reverse() => new DebtTransaction(-Amount, Action, Date);

        public DebtTransaction(decimal amount, string action, DateTime date)
        {
            Amount = amount;
            Action = action;
            Date = date;
        }
    }
}