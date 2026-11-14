using DoggyFrictions.ExternalApi.Models;

namespace DoggyFrictions.ExternalApi.Domain;

public class SessionActionsProvider
{
    /// <summary>
    /// Maps stored actions to the debt domain. Participants are identified by id, not by name:
    /// names are not unique within a session.
    /// </summary>
    public IEnumerable<DebtAction> GetSessionActions(IEnumerable<ActionObject> actions)
    {
        return actions.Select(
            a =>
                new DebtAction
                {
                    Date = a.Date,
                    Description = a.Description ?? string.Empty,
                    Goods = a.Consumptions.Select(MapConsumption).ToList(),
                    Sponsors = a.Payers.Select(p => MapParticipation(p.ParticipantId, p.Amount)).ToList()
                });
    }

    private static Participation MapParticipation(string participantId, decimal amount)
    {
        return new Participation
        {
            Amount = amount,
            Participant = participantId
        };
    }

    private static Good MapConsumption(Consumption consumption)
    {
        return new Good
        {
            Description = consumption.Description,
            PricePerUnit = consumption.Amount,
            Quantity = consumption.Quantity,
            SplittedEqually = consumption.SplittedEqually,
            Consumers = consumption.Consumers.Select(c => MapParticipation(c.ParticipantId, c.Amount)).ToList()
        };
    }
}
