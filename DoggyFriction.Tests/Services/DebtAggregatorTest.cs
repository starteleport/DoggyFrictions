using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DoggyFriction.Services;
using NUnit.Framework;
using Ploeh.AutoFixture;

namespace DoggyFriction.Tests.Services
{
    [TestFixture]
    public class DebtAggregatorTest
    {
        private DebtAggregator sut;
        private Fixture fixture;
        
        [SetUp]
        public void SetUp()
        {
            fixture = new Fixture();
            fixture.Customize<decimal>(c => c.FromFactory<int>(i => Math.Round(Math.Abs(i) * 1.33m, 2)));
            sut = fixture.Create<DebtAggregator>();
        }

        [Test]
        public void AddTransaction_AddTenPositiveTransactions_ShouldCalculateSum()
        {
            var debtor = fixture.Create<string>();
            var creditor = fixture.Create<string>();
            var transactions = Enumerable.Range(0, 10).Select(i => fixture.Create<DebtTransaction>()).ToList();
            transactions.ForEach(transaction => sut.AddTransaction(creditor, debtor, transaction));
            var debts = sut.GetDebts();
            Assert.That(debts, Is.Not.Null);
            Assert.That(debts.Count(), Is.EqualTo(1));
            Assert.That(debts.Single().Debtor, Is.EqualTo(debtor));
            Assert.That(debts.Single().Creditor, Is.EqualTo(creditor));
            Assert.That(debts.Single().Amount, Is.EqualTo(transactions.Sum(t => t.Amount)));
        }

        [Test]
        public void AddTransaction_AddTenPositiveAndTenNegativeTransactions_ShouldBeAdjusted()
        {
            var debtor = fixture.Create<string>();
            var creditor = fixture.Create<string>();
            var transactions = Enumerable.Range(0, 10).Select(i => fixture.Create<DebtTransaction>()).ToList();
            transactions.ForEach(transaction => sut.AddTransaction(creditor, debtor, transaction));
            transactions.ForEach(transaction => sut.AddTransaction(debtor, creditor, transaction));
            var debts = sut.GetDebts();
            Assert.That(debts, Is.Not.Null);
            Assert.That(debts.Count(), Is.EqualTo(0));
        }
        
        [Test]
        public void AddTransaction_AddNinePositiveAndTenNegativeTransactions_DebtShouldBeReversed()
        {
            var debtor = fixture.Create<string>();
            var creditor = fixture.Create<string>();
            var transactions = Enumerable.Range(0, 10).Select(i => fixture.Create<DebtTransaction>()).ToList();
            var selectedTransactions = transactions.Skip(3).Take(3).ToList();
            transactions.Except(selectedTransactions).ForEach(transaction => sut.AddTransaction(creditor, debtor, transaction));
            transactions.ForEach(transaction => sut.AddTransaction(debtor, creditor, transaction));
            var debts = sut.GetDebts();
            Assert.That(debts, Is.Not.Null);
            Assert.That(debts.Count(), Is.EqualTo(1));
            Assert.That(debts.Single().Debtor, Is.EqualTo(creditor));
            Assert.That(debts.Single().Creditor, Is.EqualTo(debtor));
            Assert.That(debts.Single().Amount, Is.EqualTo(selectedTransactions.Sum(t => t.Amount)));
        }
    }
}
