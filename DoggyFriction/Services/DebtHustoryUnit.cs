using DoggyFriction.Domain;

namespace DoggyFriction.Services
{
    public class DebtHustoryUnit
    {
        public decimal Amount { get; }
        public Action Action { get; }
        public Good Good { get; }

        public DebtHustoryUnit Inverse() => new DebtHustoryUnit(-Amount, Action, Good);

        public DebtHustoryUnit(decimal amount, Action action, Good good)
        {
            Amount = amount;
            Action = action;
            Good = good;
        }
    }
}