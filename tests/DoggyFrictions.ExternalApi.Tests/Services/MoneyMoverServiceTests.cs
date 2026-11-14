using DoggyFrictions.ExternalApi.Models;
using DoggyFrictions.ExternalApi.Services;
using NUnit.Framework;

namespace DoggyFrictions.ExternalApi.Tests.Services;

[TestFixture]
public class MoneyMoverServiceTests
{
    private static readonly Participant Ann = new() { Id = "1", Name = "Ann" };
    private static readonly Participant Bob = new() { Id = "2", Name = "Bob" };
    private static readonly Session Session = new() { Id = "session", Name = "s", Participants = [Ann, Bob] };

    private readonly MoneyMoverService sut = new();

    [Test]
    public void Create_ShouldRecordTransferFromSenderToRecipient()
    {
        var action = sut.CreateMoveMoneyTransaction(Session, Bob, Ann, new MoveMoneyTransaction { Amount = 5 });

        Assert.Multiple(() =>
        {
            Assert.That(action.SessionId, Is.EqualTo("session"));
            Assert.That(action.Description, Is.EqualTo("Bob -> Ann"));
            Assert.That(action.Payers.Single().ParticipantId, Is.EqualTo("2"));
            Assert.That(action.Payers.Single().Amount, Is.EqualTo(5));
            Assert.That(action.Consumptions.Single().Consumers.Single().ParticipantId, Is.EqualTo("1"));
            // The generated action must itself be a valid one.
            Assert.That(TestTexts.Errors(action), Is.Empty);
        });
    }

    [Test]
    public void Create_WithReason_ShouldUseItAsDescription()
    {
        var action = sut.CreateMoveMoneyTransaction(
            Session, Bob, Ann, new MoveMoneyTransaction { Amount = 5, Reason = "за пиццу" });

        Assert.That(action.Description, Is.EqualTo("за пиццу"));
    }

    // An action without a description could not be saved again from the edit form.
    [TestCase(null)]
    [TestCase("")]
    [TestCase("   ")]
    public void Create_WithBlankReason_ShouldFallBackToDefaultDescription(string? reason)
    {
        var action = sut.CreateMoveMoneyTransaction(
            Session, Bob, Ann, new MoveMoneyTransaction { Amount = 5, Reason = reason });

        Assert.That(action.Description, Is.EqualTo("Bob -> Ann"));
    }

    [Test]
    public void Create_WithDate_ShouldUseIt()
    {
        var date = new DateTime(2026, 1, 15);

        var action = sut.CreateMoveMoneyTransaction(Session, Bob, Ann, new MoveMoneyTransaction { Amount = 5, Date = date });

        Assert.That(action.Date, Is.EqualTo(date));
    }
}
