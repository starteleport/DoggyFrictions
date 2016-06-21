using System.Collections.Generic;
using System.Linq;
using DoggyFriction.Services;
using NUnit.Framework;
using Ploeh.AutoFixture;

namespace DoggyFriction.Tests.Services
{
    [TestFixture]
    public class DebtTests
    {
        private Fixture fixture;

        [SetUp]
        public void SetUp()
        {
            fixture = new Fixture();
        }

        [Test]
        public void Reverse_Always_ShouldReverseTransactionsAndNegateAmount()
        {
            var transaction = fixture.Create<DebtTransaction>();
            var debt = fixture.Build<Debt>().With(d => d.Transactions, new[] {transaction}.ToList()).Create();

            var actual = debt.Reverse();

            Assert.That(actual.Amount, Is.EqualTo(-debt.Amount));
            Assert.That(actual.Transactions.Single().Amount, Is.EqualTo(-transaction.Amount));
        }
    }
}