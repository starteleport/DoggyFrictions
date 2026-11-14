using DoggyFrictions.ExternalApi.Models;
using NUnit.Framework;

namespace DoggyFrictions.ExternalApi.Tests.Models;

[TestFixture]
public class SessionTests
{
    private static Session SessionWith(params Participant?[] participants) =>
        new() { Id = "s", Name = "n", Participants = participants! };

    private static Participant P(string id, string? name = "name") => new() { Id = id, Name = name! };

    [Test]
    public void Validate_NewAndStoredParticipants_ShouldPass()
    {
        // Several participants may be new at once: "0" and empty ids are not real ids.
        Assert.That(TestTexts.Errors(SessionWith(P("a"), P("b"), P("0"), P("0"), P(""))), Is.Empty);
    }

    [Test]
    public void Validate_NoParticipantsAtAll_ShouldPass()
    {
        Assert.That(TestTexts.Errors(SessionWith()), Is.Empty);
    }

    [TestCase(null)]
    [TestCase(" ")]
    public void Validate_NoName_ShouldReport(string? name)
    {
        var session = SessionWith(P("a"));
        session.Name = name!;

        Assert.That(TestTexts.Errors(session), Is.EqualTo(new[] { "validation.session.nameRequired" }));
    }

    [TestCase(null)]
    [TestCase("")]
    public void Validate_NamelessParticipant_ShouldReport(string? name)
    {
        Assert.That(TestTexts.Errors(SessionWith(P("a"), P("0", name))),
            Is.EqualTo(new[] { "validation.session.participantNameRequired" }));
    }

    [Test]
    public void Validate_RepeatedStoredParticipant_ShouldReport()
    {
        Assert.That(TestTexts.Errors(SessionWith(P("a"), P("a"))),
            Is.EqualTo(new[] { "validation.session.duplicateParticipants" }));
    }

    [Test]
    public void Validate_NullParticipant_ShouldReportInsteadOfThrowing()
    {
        Assert.That(TestTexts.Errors(SessionWith(P("a"), null)),
            Is.EqualTo(new[] { "validation.session.nullParticipant" }));
    }

    [Test]
    public void Validate_NullParticipants_ShouldReportInsteadOfThrowing()
    {
        Assert.That(TestTexts.Errors(new Session { Id = "s", Name = "n", Participants = null! }),
            Is.EqualTo(new[] { "validation.session.participantsRequired" }));
    }

    [Test]
    public void StoredParticipantIds_ShouldSkipNewOnes()
    {
        Assert.That(SessionWith(P("a"), P("0"), P("")).StoredParticipantIds(), Is.EqualTo(new[] { "a" }));
    }

    [Test]
    public void HasParticipants_ShouldRequireEveryId()
    {
        var session = SessionWith(P("a"), P("b"));

        Assert.Multiple(() =>
        {
            Assert.That(session.HasParticipants(["a", "b"]), Is.True);
            Assert.That(session.HasParticipants([]), Is.True);
            Assert.That(session.HasParticipants(["a", "c"]), Is.False);
        });
    }
}
