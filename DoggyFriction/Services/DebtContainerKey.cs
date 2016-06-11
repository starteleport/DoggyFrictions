using System;

namespace DoggyFriction.Services
{
    public class DebtContainerKey : IEquatable<DebtContainerKey>
    {
        public string FirstGuy { get; }
        public string SecondGuy { get; }

        public bool HasSameDirectionAs(DebtContainerKey other)
        {
            if (!this.Equals(other)) {
                throw new InvalidOperationException($"Can't compare directions of key [{this}], and [{other}].");
            }
            return FirstGuy == other.FirstGuy;
        }

        public override int GetHashCode()
        {
            return FirstGuy.GetHashCode() + SecondGuy.GetHashCode();
        }

        public bool Equals(DebtContainerKey other)
        {
            return FirstGuy == other.FirstGuy && SecondGuy == other.SecondGuy
                   || FirstGuy == other.SecondGuy && SecondGuy == other.FirstGuy;
        }

        public override string ToString()
        {
            return $"{FirstGuy}, {SecondGuy}}}";
        }

        public DebtContainerKey(string firstGuy, string secondGuy)
        {
            FirstGuy = firstGuy;
            SecondGuy = secondGuy;
        }
    }
}