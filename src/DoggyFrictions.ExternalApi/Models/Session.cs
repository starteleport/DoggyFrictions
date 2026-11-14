using System.ComponentModel.DataAnnotations;
using DoggyFrictions.ExternalApi.Localization;

namespace DoggyFrictions.ExternalApi.Models;

public class Session : IValidatableObject
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public IEnumerable<Participant> Participants { get; set; } = null!;

    /// <summary>Ids of the participants that are already stored.</summary>
    public IEnumerable<string> StoredParticipantIds() =>
        Participants.Select(participant => participant.Id).Where(id => !EntityId.IsNew(id));

    public bool HasParticipants(IEnumerable<string> ids)
    {
        var known = Participants.Select(participant => participant.Id).ToHashSet();
        return ids.All(known.Contains);
    }

    // All rules live here rather than in attributes so that every message goes through ITexts.
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var texts = validationContext.Texts();

        if (string.IsNullOrWhiteSpace(Name))
        {
            yield return new ValidationResult(texts["validation.session.nameRequired"], [nameof(Name)]);
        }

        if (Participants is null)
        {
            yield return new ValidationResult(texts["validation.session.participantsRequired"], [nameof(Participants)]);
            yield break;
        }

        // JSON can carry an explicit null inside the list.
        if (Participants.Contains(null!))
        {
            yield return new ValidationResult(texts["validation.session.nullParticipant"], [nameof(Participants)]);
            yield break;
        }

        if (Participants.Any(participant => string.IsNullOrWhiteSpace(participant.Name)))
        {
            yield return new ValidationResult(texts["validation.session.participantNameRequired"], [nameof(Participants)]);
        }

        var storedIds = StoredParticipantIds().ToList();
        if (storedIds.Count != storedIds.Distinct().Count())
        {
            yield return new ValidationResult(texts["validation.session.duplicateParticipants"], [nameof(Participants)]);
        }
    }
}
