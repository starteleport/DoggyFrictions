using DoggyFrictions.ExternalApi.Models;

namespace DoggyFrictions.ExternalApi.Services;

public class MoneyMoverService : IMoneyMoverService
{
    public ActionObject CreateMoveMoneyTransaction(Session session, MoveMoneyTransaction moveMoneyTransaction)
    {
        var fromParticipant = session.Participants.FirstOrDefault(p => p.Name == moveMoneyTransaction.From);
        var toParticipant = session.Participants.FirstOrDefault(p => p.Name == moveMoneyTransaction.To);

        if (fromParticipant == null || toParticipant == null)
        {
            throw new ArgumentException("Either fromParticipant or toParticipant not exist", nameof(session));
        }

        var description = moveMoneyTransaction.Reason ?? $"{fromParticipant.Name} -> {toParticipant.Name}";

        var actionModel = BuildActionModel(
            session.Id,
            moveMoneyTransaction,
            description,
            fromParticipant,
            toParticipant);

        return actionModel;
    }

    private static ActionObject BuildActionModel(
        string sessionId,
        MoveMoneyTransaction moveMoneyTransaction,
        string description,
        Participant fromParticipant,
        Participant toParticipant)
    {
        return new ActionObject
        {
            SessionId = sessionId,
            Date = moveMoneyTransaction.Date ?? DateTime.UtcNow,
            Description = description,
            Payers = new[]
            {
                new Payer
                {
                    Amount = moveMoneyTransaction.Amount,
                    ParticipantId = fromParticipant.Id
                }
            },
            Consumptions = new[]
            {
                new Consumption
                {
                    Amount = moveMoneyTransaction.Amount,
                    SplittedEqually = false,
                    Consumers = new[]
                    {
                        new Consumer
                        {
                            Amount = moveMoneyTransaction.Amount,
                            ParticipantId = toParticipant.Id
                        }
                    }
                }
            }
        };
    }
}