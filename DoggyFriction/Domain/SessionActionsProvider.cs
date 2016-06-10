using System.Collections.Generic;
using System.Linq;
using DoggyFriction.Models;

namespace DoggyFriction.Domain
{
    public class SessionActionsProvider
    {
        public IEnumerable<Action> GetSessionActions(SessionModel session, IEnumerable<ActionModel> actions)
        {
            var participants = session.Participants.ToDictionary(p => p.Id, p => p.Name);
            return actions.Select(
                a =>
                    new Action
                    {
                        Date = a.Date,
                        Description = a.Description,
                        Consumptions = a.Consumptions.Select(c => MapConsumption(c, participants)),
                        Sponsors = a.Payers.Select(p => MapPayer(p, participants))
                    });
        }

        private Participation MapConsumer(ConsumerModel consumer, Dictionary<int, string> participants)
            => new Participation {Amount = consumer.Amount, Participant = participants[consumer.ParticipantId]};

        private Participation MapPayer(PayerModel payer, Dictionary<int, string> participants)
            => new Participation {Amount = payer.Amount, Participant = participants[payer.ParticipantId]};

        private Consumption MapConsumption(ConsumptionModel consumption, Dictionary<int, string> participants)
        {
            return new Consumption
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