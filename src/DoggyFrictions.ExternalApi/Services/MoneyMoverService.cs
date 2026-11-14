using DoggyFrictions.ExternalApi.Models;

namespace DoggyFrictions.ExternalApi.Services;

public class MoneyMoverService : IMoneyMoverService
{
    public ActionObject CreateMoveMoneyTransaction(
        Session session, Participant from, Participant to, MoveMoneyTransaction moveMoneyTransaction)
    {
        // An action must have a description, so a blank reason falls back to the default one.
        var description = string.IsNullOrWhiteSpace(moveMoneyTransaction.Reason)
            ? $"{from.Name} -> {to.Name}"
            : moveMoneyTransaction.Reason;

        return new ActionObject
        {
            Id = "0",
            SessionId = session.Id,
            Date = moveMoneyTransaction.Date ?? DateTime.UtcNow,
            Description = description,
            Payers = new[]
            {
                new Payer
                {
                    Amount = moveMoneyTransaction.Amount,
                    ParticipantId = from.Id
                }
            },
            Consumptions = new[]
            {
                new Consumption
                {
                    Amount = moveMoneyTransaction.Amount,
                    Description = description,
                    Quantity = 1,
                    SplittedEqually = false,
                    Consumers = new[]
                    {
                        new Consumer
                        {
                            Amount = moveMoneyTransaction.Amount,
                            ParticipantId = to.Id
                        }
                    }
                }
            }
        };
    }
}
