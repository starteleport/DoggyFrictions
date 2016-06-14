using System;

namespace DoggyFriction.Services
{
    public class DebtTransaction
    {
        public decimal Amount { get; }
        public string Action { get; }
        public string Good { get; }
        public DateTime Date { get; }

        public DebtTransaction Inverse() => new DebtTransaction(-Amount, Action, Good, Date);

        public DebtTransaction(decimal amount, string action, string good, DateTime date)
        {
            Amount = amount;
            Action = action;
            Good = good;
            Date = date;
        }
    }
}