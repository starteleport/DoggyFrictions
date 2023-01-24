using AutoFixture;
using DoggyFrictions.ExternalApi.Models;
using NUnit.Framework;

namespace DoggyFrictions.ExternalApi.Tests.Services;

[TestFixture]
public class DebtTests
{
    private Fixture fixture = null!;

    [SetUp]
    public void SetUp()
    {
        fixture = new Fixture();
    }

    [Test]
    public void Reverse_Always_ShouldReverseTransactionsAndNegateAmount()
    {
        var transaction = fixture.Create<DebtTransaction>();
        var debt = fixture.Build<Debt>().With(d => d.Transactions, new[] { transaction }.ToList()).Create();

        var actual = debt.Reverse();

        Assert.That(actual.Amount, Is.EqualTo(-debt.Amount));
        Assert.That(actual.Transactions.Single().Amount, Is.EqualTo(-transaction.Amount));
    }

    [Test]
    public void AlwaysFail()
    {
        Assert.Fail();
    }
}