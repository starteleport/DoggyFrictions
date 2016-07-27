using System;
using System.Linq;
using DoggyFriction.Models;
using DoggyFriction.Services.Repository.Models;
using Action = DoggyFriction.Models.Action;

namespace DoggyFriction.Services.Repository
{
    internal static class ConvertUtil
    {
        public static string GetOrCreateId(string id) => id.IsNullOrEmpty() || id == "0" ? Guid.NewGuid().ToString() : id;

        public static Session Convert(this SessionModel model)
        {
            return new Session {
                Id = model.Id,
                Name = model.Name,
                Participants = model.Participants.Select(Convert)
            };
        }

        public static SessionModel Convert(this Session model)
        {
            return new SessionModel {
                Id = GetOrCreateId(model.Id),
                Name = model.Name,
                Participants = model.Participants.Select(Convert)
            };
        }

        public static Participant Convert(this ParticipantModel model)
        {
            return new Participant {
                Id = model.Id,
                Name = model.Name
            };
        }

        public static ParticipantModel Convert(this Participant model)
        {
            return new ParticipantModel {
                Id = GetOrCreateId(model.Id),
                Name = model.Name
            };
        }

        public static Action Convert(this ActionModel model)
        {
            return new Action {
                Id = model.Id,
                SessionId = model.SessionId,
                Description = model.Description,
                Date = model.Date,
                Payers = model.Payers.Select(Convert),
                Consumptions = model.Consumptions.Select(Convert)
            };
        }
        
        public static ActionModel Convert(this Action model)
        {
            return new ActionModel {
                Id = GetOrCreateId(model.Id),
                SessionId = model.SessionId,
                Description = model.Description,
                Date = model.Date,
                Payers = model.Payers.Select(Convert),
                Consumptions = model.Consumptions.Select(Convert)
            };
        }

        public static Payer Convert(this PayerModel model)
        {
            return new Payer {
                Amount = model.Amount,
                ParticipantId = model.ParticipantId
            };
        }
        
        public static PayerModel Convert(this Payer model)
        {
            return new PayerModel {
                Amount = model.Amount,
                ParticipantId = model.ParticipantId
            };
        }

        public static ConsumptionModel Convert(this Consumption model)
        {
            return new ConsumptionModel {
                Amount = model.Amount,
                Description = model.Description,
                Quantity = model.Quantity,
                SplittedEqually = model.SplittedEqually,
                Consumers = model.Consumers.Select(Convert)
            };
        }
        
        public static Consumption Convert(this ConsumptionModel model)
        {
            return new Consumption {
                Amount = model.Amount,
                Description = model.Description,
                Quantity = model.Quantity,
                SplittedEqually = model.SplittedEqually,
                Consumers = model.Consumers.Select(Convert)
            };
        }

        public static Consumer Convert(this ConsumerModel model)
        {
            return new Consumer {
                Amount = model.Amount,
                ParticipantId = model.ParticipantId
            };
        }
        
        public static ConsumerModel Convert(this Consumer model)
        {
            return new ConsumerModel {
                Amount = model.Amount,
                ParticipantId = model.ParticipantId
            };
        }
    }
}