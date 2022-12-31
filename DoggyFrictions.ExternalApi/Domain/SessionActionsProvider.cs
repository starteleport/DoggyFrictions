using DoggyFrictions.ExternalApi.Models;

namespace DoggyFrictions.ExternalApi.Domain;

public class SessionActionsProvider
{
    public IEnumerable<DebptAction> GetSessionActions(
        Session session,
        IEnumerable<Models.ActionObject> actions)
    {
        var participantIdNames = session.Participants.ToDictionary(p => p.Id, p => p.Name);
        return actions.Select(
            a =>
                new DebptAction
                {
                    Date = a.Date,
                    Description = a.Description,
                    Goods = a.Consumptions.Select(c => MapConsumption(c, participantIdNames)),
                    Sponsors = a.Payers.Select(p => MapPayer(p, participantIdNames))
                });
    }

    private static Participation MapConsumer(Consumer consumer, Dictionary<string, string> participants)
    {
        return new Participation
        {
            Amount = consumer.Amount,
            Participant = participants[consumer.ParticipantId]
        };
    }

    private static Participation MapPayer(Payer payer, Dictionary<string, string> participants)
    {
        return new Participation
        {
            Amount = payer.Amount,
            Participant = participants[payer.ParticipantId]
        };
    }

    private Good MapConsumption(Consumption consumption, Dictionary<string, string> participants)
    {
        return new Good
        {
            Description = consumption.Description,
            PricePerUnit = consumption.Amount,
            Quantity = consumption.Quantity,
            SplittedEqually = consumption.SplittedEqually,
            Consumers = consumption.Consumers.Select(c => MapConsumer(c, participants))
        };
    }
}