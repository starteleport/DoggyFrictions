using System;
using System.Linq;
using DoggyFriction.Models;
using Action = DoggyFriction.Models.Action;

namespace DoggyFriction.Controllers
{
    public class MoneyMoverService : IMoneyMoverService
    {
        public Action CreateMoveMoneyTransaction(Session session, MoveMoneyTransaction moveMoneyTransaction)
        {
            var fromParticipant = session.Participants.FirstOrDefault(p => p.Name == moveMoneyTransaction.From);
            var toParticipant = session.Participants.FirstOrDefault(p => p.Name == moveMoneyTransaction.To);
            if (fromParticipant == null || toParticipant == null)
                throw new ArgumentException("Either fromParticipant or toParticipant not exist", nameof(session));

            var description = moveMoneyTransaction.Reason ?? $"{fromParticipant.Name} -> {toParticipant.Name}";

            var actionModel = BuildActionModel(session.Id, moveMoneyTransaction, description, fromParticipant, toParticipant);
            return actionModel;
        }

        private static Action BuildActionModel(string sessionId, MoveMoneyTransaction moveMoneyTransaction,
            string description, Participant fromParticipant, Participant toParticipant)
            => new Action
            {
                SessionId = sessionId,
                Date = moveMoneyTransaction.Date ?? DateTime.Now,
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
                        Description = description,
                        Quantity = 1,
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