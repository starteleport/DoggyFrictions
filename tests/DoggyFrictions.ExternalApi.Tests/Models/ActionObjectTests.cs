using DoggyFrictions.ExternalApi.Models;
using NUnit.Framework;

namespace DoggyFrictions.ExternalApi.Tests.Models;

[TestFixture]
public class ActionObjectTests
{
    private const string ItemRange = "validation.action.itemRange[item|1,000,000,000|1,000,000]";
    private const string ItemShares = "validation.action.itemShares[item]";

    [Test]
    public void Validate_PaidEqualsSpent_ShouldPass()
    {
        var action = Action(paid: 10, Item(price: 10, quantity: 1, shares: [5, 5]));

        Assert.That(TestTexts.Errors(action), Is.Empty);
    }

    [TestCase(null)]
    [TestCase("")]
    [TestCase("  ")]
    public void Validate_NoDescription_ShouldReport(string? description)
    {
        var action = Action(paid: 10, Item(price: 10, quantity: 1, shares: [10]));
        action.Description = description;

        Assert.That(TestTexts.Errors(action), Is.EqualTo(new[] { "validation.action.descriptionRequired" }));
    }

    [Test]
    public void Validate_NoSession_ShouldReport()
    {
        var action = Action(paid: 10, Item(price: 10, quantity: 1, shares: [10]));
        action.SessionId = null!;

        Assert.That(TestTexts.Errors(action), Is.EqualTo(new[] { "validation.action.sessionRequired" }));
    }

    [Test]
    public void Validate_NoPayers_ShouldReportPayers()
    {
        var action = new ActionObject { SessionId = "s", Description = "d" };

        Assert.That(TestTexts.Errors(action), Is.EqualTo(new[] { "validation.action.payersRequired" }));
    }

    [Test]
    public void Validate_PayerOrConsumerWithoutParticipant_ShouldReport()
    {
        var noPayer = Action(paid: 10, Item(price: 10, quantity: 1, shares: [10]));
        noPayer.Payers = [new Payer { Amount = 10 }];
        var noConsumer = Action(paid: 10, Item(price: 10, quantity: 1, shares: [10]));
        noConsumer.Consumptions.Single().Consumers = [new Consumer { ParticipantId = "", Amount = 10 }];

        Assert.Multiple(() =>
        {
            Assert.That(TestTexts.Errors(noPayer), Is.EqualTo(new[] { "validation.action.participantRequired" }));
            Assert.That(TestTexts.Errors(noConsumer), Is.EqualTo(new[] { "validation.action.participantRequired" }));
        });
    }

    [Test]
    public void Validate_PaidDiffersFromSpent_ShouldReportMismatch()
    {
        var action = Action(paid: 10, Item(price: 7, quantity: 1, shares: [7]));

        Assert.That(TestTexts.Errors(action), Is.EqualTo(new[] { "validation.action.totals" }));
    }

    [Test]
    public void Validate_QuantityAboveOne_ShouldCompareAgainstPriceTimesQuantity()
    {
        var action = Action(paid: 6, Item(price: 3, quantity: 2, shares: [3, 3]));

        Assert.That(TestTexts.Errors(action), Is.Empty);
    }

    [Test]
    public void Validate_SharesDoNotAddUpToItemPrice_ShouldReportItem()
    {
        var action = Action(paid: 10, Item(price: 10, quantity: 1, shares: [1]));

        Assert.That(TestTexts.Errors(action), Is.EqualTo(new[] { ItemShares }));
    }

    [Test]
    public void Validate_SharesRoundedToKopecks_ShouldPass()
    {
        // 10 split three ways: the client sends 3.33 + 3.33 + 3.34; a third of 1 leaves 0.333 * 3.
        var action = Action(paid: 11, Item(price: 10, quantity: 1, shares: [3.33m, 3.33m, 3.34m]),
            Item(price: 1, quantity: 1, shares: [0.333m, 0.333m, 0.333m]));

        Assert.That(TestTexts.Errors(action), Is.Empty);
    }

    // Three people splitting 10 by hand type 3.33 each: a kopeck short, and that is fine.
    [Test]
    public void Validate_SharesOffByOneKopeck_ShouldPass()
    {
        var action = Action(paid: 10, Item(price: 10, quantity: 1, shares: [3.33m, 3.33m, 3.33m]));

        Assert.That(TestTexts.Errors(action), Is.Empty);
    }

    [Test]
    public void Validate_SharesOffByMoreThanOneKopeck_ShouldReportItem()
    {
        var action = Action(paid: 10, Item(price: 10, quantity: 1, shares: [3.33m, 3.33m, 3.32m]));

        Assert.That(TestTexts.Errors(action), Is.EqualTo(new[] { ItemShares }));
    }

    [TestCase(-1, 1, 1)]
    [TestCase(1, 0, 1)]
    [TestCase(1, -2, 1)]
    [TestCase(1, 1e30, 1)]
    [TestCase(1, double.NaN, 1)]
    [TestCase(1e15, 1, 1)]
    public void Validate_PriceOrQuantityOutOfRange_ShouldReportItemWithoutOverflowing(double price, double quantity, double share)
    {
        var action = Action(paid: 0, Item((decimal)price, quantity, shares: [(decimal)share]));

        Assert.That(TestTexts.Errors(action), Is.EqualTo(new[] { ItemRange }));
    }

    [Test]
    public void Validate_NegativeShare_ShouldReportItem()
    {
        var action = Action(paid: 10, Item(price: 10, quantity: 1, shares: [15, -5]));

        Assert.That(TestTexts.Errors(action), Is.EqualTo(new[] { ItemRange }));
    }

    [Test]
    public void Validate_NegativePayment_ShouldReportPayers()
    {
        var action = Action(paid: 15, Item(price: 10, quantity: 1, shares: [10]));
        action.Payers = [new Payer { ParticipantId = "a", Amount = 15 }, new Payer { ParticipantId = "b", Amount = -5 }];

        Assert.That(TestTexts.Errors(action), Is.EqualTo(new[] { "validation.action.payerAmounts[1,000,000,000]" }));
    }

    [Test]
    public void Validate_NullCollectionsOrItems_ShouldReportInsteadOfThrowing()
    {
        var nullPayers = Action(paid: 0);
        nullPayers.Payers = null!;
        var nullItem = Action(paid: 0);
        nullItem.Consumptions = [null!];
        var nullConsumers = Action(paid: 0, new Consumption { Consumers = null! });

        Assert.Multiple(() =>
        {
            Assert.That(TestTexts.Errors(nullPayers), Is.EqualTo(new[] { "validation.action.nulls" }));
            Assert.That(TestTexts.Errors(nullItem), Is.EqualTo(new[] { "validation.action.nulls" }));
            Assert.That(TestTexts.Errors(nullConsumers), Is.EqualTo(new[] { "validation.action.nulls" }));
        });
    }

    [Test]
    public void ParticipantIds_ShouldListPayersAndConsumersOnce()
    {
        var action = new ActionObject
        {
            SessionId = "s",
            Payers = [new Payer { ParticipantId = "a", Amount = 10 }],
            Consumptions =
            [
                new Consumption
                {
                    Consumers = [new Consumer { ParticipantId = "a" }, new Consumer { ParticipantId = "b" }]
                }
            ]
        };

        Assert.That(action.ParticipantIds(), Is.EquivalentTo(new[] { "a", "b" }));
    }

    private static ActionObject Action(decimal paid, params Consumption[] items) => new()
    {
        SessionId = "s",
        Description = "action",
        Payers = [new Payer { ParticipantId = "payer", Amount = paid }],
        Consumptions = items
    };

    private static Consumption Item(decimal price, double quantity, decimal[] shares) => new()
    {
        Description = "item",
        Amount = price,
        Quantity = quantity,
        Consumers = shares.Select((share, i) => new Consumer { ParticipantId = $"c{i}", Amount = share }).ToList()
    };
}
