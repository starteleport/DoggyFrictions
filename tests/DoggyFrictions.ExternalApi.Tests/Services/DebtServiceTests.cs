using AutoFixture;
using DoggyFrictions.ExternalApi.Domain;
using DoggyFrictions.ExternalApi.Models;
using DoggyFrictions.ExternalApi.Services;
using NUnit.Framework;

namespace DoggyFrictions.ExternalApis.Tests.Services;

[TestFixture]
public class DebtServiceTests
{
    private DebtService sut = null!;
    private Fixture fixture = null!;

    [SetUp]
    public void SetUp()
    {
        fixture = new Fixture();
        sut = fixture.Create<DebtService>();
    }

    [Test]
    public void GetDebts_OneBoughtAndOneConsumed_ShouldAccountToConsumer()
    {
        var total = fixture.Create<decimal>();
        var sponsor = fixture.Build<Participation>().With(p => p.Amount, total).Create();
        var consumer = fixture.Build<Participation>().With(p => p.Amount, total).Create();
        var good = GoodWithConsumers(new[] {consumer}, total);
        var action = fixture.Build<DebtAction>()
            .With(a => a.Goods, new[] {good})
            .With(a => a.Sponsors, new[] {sponsor})
            .Create();

        var actual = sut.GetDebts(new[] {action});

        Assert.That(actual.Count(), Is.EqualTo(1));
        Assert.That(actual.Single().Creditor, Is.EqualTo(sponsor.Participant));
        Assert.That(actual.Single().Debtor, Is.EqualTo(consumer.Participant));
        Assert.That(actual.Single().Amount, Is.EqualTo(total));
    }

    [Test]
    public void GetDebts_SponsorBoughtAndGaveSomeToFriend_ShouldAccountSomePartToFriend()
    {
        var total = fixture.Create<decimal>();
        var sponsorBought = fixture.Build<Participation>().With(p => p.Amount, total).Create();
        var friendAmount = total / 2;
        var friendConsumed = fixture.Build<Participation>().With(p => p.Amount, friendAmount).Create();
        var sponsorConsumed = fixture.Build<Participation>()
            .With(p => p.Amount, total - friendAmount)
            .With(s => s.Participant, sponsorBought.Participant)
            .Create();

        var good = GoodWithConsumers(new[] {friendConsumed, sponsorConsumed}, total);
        var action = fixture.Build<DebtAction>()
            .With(a => a.Goods, new[] {good})
            .With(a => a.Sponsors, new[] {sponsorBought})
            .Create();

        var actual = sut.GetDebts(new[] {action});

        Assert.That(actual.Count(), Is.EqualTo(1));
        Assert.That(actual.Single().Creditor, Is.EqualTo(sponsorBought.Participant));
        Assert.That(actual.Single().Debtor, Is.EqualTo(friendConsumed.Participant));
        Assert.That(actual.Single().Amount, Is.EqualTo(friendAmount));
    }

    [Test]
    public void GetDebts_TwoSponsorsAndOneConsumer_ShouldMakeDebtForEachConsumer()
    {
        var total = fixture.Create<decimal>();
        var sponsor1Amount = total / 2;
        var sponsor1 = fixture.Build<Participation>().With(p => p.Amount, sponsor1Amount).Create();
        var sponsor2 = fixture.Build<Participation>().With(p => p.Amount, total - sponsor1Amount).Create();
        var consumer = fixture.Build<Participation>().With(p => p.Amount, total).Create();
        var good = GoodWithConsumers(new[] {consumer}, total);
        var action = fixture.Build<DebtAction>()
            .With(a => a.Goods, new[] {good})
            .With(a => a.Sponsors, new[] {sponsor1, sponsor2})
            .Create();

        var actual = sut.GetDebts(new[] {action});

        Assert.That(actual.Count(), Is.EqualTo(2));
        Assert.That(actual,
            Has.Some.Matches<Debt>(
                d =>
                    d.Amount == sponsor1Amount && d.Creditor == sponsor1.Participant &&
                    d.Debtor == consumer.Participant));
        Assert.That(actual,
            Has.Some.Matches<Debt>(
                d =>
                    d.Amount == total - sponsor1Amount && d.Creditor == sponsor2.Participant &&
                    d.Debtor == consumer.Participant));
    }

    [Test]
    public void GetDebts_OneBoughtAndOneConsumedTwoGoods_ShouldAccountToConsumer()
    {
        var total = fixture.Create<decimal>();
        var sponsor = fixture.Build<Participation>().With(p => p.Amount, total).Create();
        var consumer = fixture.Build<Participation>().With(p => p.Amount, total / 2).Create();
        var good1 = GoodWithConsumers(new[] {consumer}, total / 2);
        var good2 = GoodWithConsumers(new[] {consumer}, total / 2);
        var action =
            fixture.Build<DebtAction>().With(a => a.Goods, new[] {good1, good2}).With(a => a.Sponsors, new[] {sponsor}).Create();

        var actual = sut.GetDebts(new[] {action});

        Assert.That(actual.Count(), Is.EqualTo(1));
        Assert.That(actual.Single().Creditor, Is.EqualTo(sponsor.Participant));
        Assert.That(actual.Single().Debtor, Is.EqualTo(consumer.Participant));
        Assert.That(actual.Single().Amount, Is.EqualTo(total));
    }

    [Test]
    public void GetDebts_OneDudeBoughtToAnotherAndControversial_ShouldMutuallyDisposeDebts()
    {
        var total = fixture.Create<decimal>();
        var dudeA = fixture.Build<Participation>().With(p => p.Amount, total).Create();
        var dudeB = fixture.Build<Participation>().With(p => p.Amount, total).Create();
        var good1 = GoodWithConsumers(new[] {dudeB}, total);
        var good2 = GoodWithConsumers(new[] {dudeA}, total);
        var action1 = fixture.Build<DebtAction>().With(a => a.Goods, new[] {good1}).With(a => a.Sponsors, new[] {dudeA}).Create();
        var action2 = fixture.Build<DebtAction>().With(a => a.Goods, new[] {good2}).With(a => a.Sponsors, new[] {dudeB}).Create();

        var actual = sut.GetDebts(new[] {action1, action2});

        Assert.That(actual.Count(), Is.EqualTo(0));
    }

    private Good GoodWithConsumers(Participation[] consumers, decimal total)
    {
        return fixture.Build<Good>()
            .With(g => g.Consumers, consumers)
            .With(g => g.PricePerUnit, total)
            .With(g => g.Quantity, 1)
            .Create();
    }
}