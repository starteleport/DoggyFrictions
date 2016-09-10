using System.Collections.Generic;
using System.Linq;
using DoggyFriction.Models;

namespace DoggyFriction.Domain
{
    public class SessionActionsProvider
    {
        public IEnumerable<Action> GetSessionActions(Session session, IEnumerable<Models.Action> actions)
        {
            var participantIdNames = session.Participants.ToDictionary(p => p.Id, p => p.Name);
            return actions.Select(
                a =>
                    new Action
                    {
                        Date = a.Date,
                        Description = a.Description,
                        Goods = a.Consumptions.Select(c => MapConsumption(c, participantIdNames)),
                        Sponsors = a.Payers.Select(p => MapPayer(p, participantIdNames))
                    });
        }

        private Participation MapConsumer(Consumer consumer, Dictionary<string, string> participants)
            => new Participation {Amount = consumer.Amount, Participant = participants[consumer.ParticipantId]};

        private Participation MapPayer(Payer payer, Dictionary<string, string> participants)
            => new Participation {Amount = payer.Amount, Participant = participants[payer.ParticipantId]};

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
}