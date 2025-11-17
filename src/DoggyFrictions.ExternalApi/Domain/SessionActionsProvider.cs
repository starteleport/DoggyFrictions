using DoggyFrictions.ExternalApi.Models;

namespace DoggyFrictions.ExternalApi.Domain;

public class SessionActionsProvider
{
    public IEnumerable<DebtAction> GetSessionActions(
        Session session,
        IEnumerable<ActionObject> actions)
    {
        var participantIdNames = session.Participants.ToDictionary(p => p.Id, p => p.Name);
        return actions.Select(
            a =>
                new DebtAction
                {
                    Date = a.Date,
                    Description = a.Description,
                    Goods = new List<Good> {
                        new Good{
                            Amount = a.Amount,
                            Consumers = a.Consumers.Select(c => MapConsumer(c, participantIdNames))
                        }
                    },
                    Sponsors = new List<Participation>{MapPayer(new Payer() {
                        Amount = a.Amount,
                        ParticipantId = a.PayerId,
                    }, participantIdNames)}
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
}