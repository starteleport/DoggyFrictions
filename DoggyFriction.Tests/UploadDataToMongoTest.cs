using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Helpers;
using DoggyFriction.Models;
using DoggyFriction.Services.Repository;
using DoggyFriction.Services.Repository.Models;
using NUnit.Framework;
using Action = DoggyFriction.Models.Action;

namespace DoggyFriction.Tests
{
    [TestFixture]
    class UploadDataToMongoTest
    {
        [Test, Explicit]
        public void Run()
        {
            var mongoRepo = new MongoRepository();
            var fileRepository = new FileRepository();
            var sessions = fileRepository.GetSessions();
            sessions.ForEach(session => mongoRepo.UpdateSession(new Session {
                Id = session.Id,
                Name = session.Name,
                Participants = session.Participants.Select(participant => new Participant {
                    Id = participant.Id,
                    Name = participant.Name
                })
            }).Wait());
            foreach (var session in sessions) {
                var actions = fileRepository.GetActions(session.Id);
                actions.ForEach(action => mongoRepo.UpdateAction(action.SessionId, new Action {
                    Id = action.Id,
                    SessionId = action.SessionId,
                    Date = action.Date,
                    Description = action.Description,
                    Payers = action.Payers.Select(p => new Payer {
                        Amount = p.Amount,
                        ParticipantId = p.ParticipantId
                    }),
                    Consumptions = action.Consumptions.Select(co => new Consumption {
                        Amount = co.Amount,
                        Description = co.Description,
                        Quantity = co.Quantity,
                        SplittedEqually = co.SplittedEqually,
                        Consumers = co.Consumers.Select(c => new Consumer {
                            Amount = c.Amount,
                            ParticipantId = c.ParticipantId
                        })
                    })
                }).Wait());
            }
        }
    }

    public class FileRepository
    {
        private string BasePath => @"C:\Users\Сергей\Documents\Visual Studio 2015\Projects\DoggyFriction\DoggyFriction\App_Data\Data";
        private string SessionsFileName => Path.Combine(BasePath, @"Sessions.json");
        private string ActionsFileName => Path.Combine(BasePath, @"Actions.json");
        private string ParticipantsFileName => Path.Combine(BasePath, @"Participants.json");
        private string PayersFileName => Path.Combine(BasePath, @"Payers.json");
        private string ConsumersFileName => Path.Combine(BasePath, @"Consumers.json");

        private IEnumerable<T> LoadEntities<T>(string fileName)
        {
            if (File.Exists(fileName)) {
                var fileContent = File.ReadAllText(fileName, Encoding.Unicode);
                return Json.Decode<List<T>>(fileContent);
            }
            return new T[] {};
        }

        public IEnumerable<SessionModel> GetSessions()
        {
            var sessionModels = LoadEntities<SessionModel>(SessionsFileName)
                .OrderBy(s => s.Name)
                .ToList();
            var participantsLookup = LoadEntities<ParticipantModel>(ParticipantsFileName).ToLookup(s => s.SessionId);
            sessionModels.ForEach(s => s.Participants = participantsLookup[s.Id].ToList());
            return sessionModels;
        }

        public IEnumerable<ActionModel> GetActions(string sessionId)
        {
            var actionModels = LoadEntities<ActionModel>(ActionsFileName)
                .Where(a => a.SessionId == sessionId)
                .OrderByDescending(a => a.Date)
                .ToList();
            var payers = LoadEntities<PayerModel>(PayersFileName)
                .Where(p => p.SessionId == sessionId)
                .OrderBy(p => p.ParticipantId)
                .ToLookup(p => p.ActionId);
            actionModels.ForEach(a => {
                a.Consumptions = a.Consumptions ?? new ConsumptionModel[] {};
                a.Payers = payers[a.Id];
            });
            var consumerLookup = LoadEntities<ConsumerModel>(ConsumersFileName)
                .Where(s => s.SessionId == sessionId)
                .ToLookup(s => s.ConsumptionId);
            actionModels.SelectMany(s => s.Consumptions).ForEach(s => s.Consumers = consumerLookup[s.Id].ToList());
            return actionModels;
        }
    }
    
    public class SessionModel
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public IEnumerable<ParticipantModel> Participants { get; set; } 
    }

    public class ParticipantModel
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string SessionId { get; set; }
    }
    
    public class ActionModel
    {
        public string Id { get; set; }
        public DateTime Date { get; set; }
        public string Description { get; set; }
        public string SessionId { get; set; }
        public IEnumerable<PayerModel> Payers { get; set; }
        public IEnumerable<ConsumptionModel> Consumptions { get; set; }
    }

    public class ConsumerModel
    {
        public string ParticipantId { get; set; }
        public decimal Amount { get; set; }
        public string SessionId { get; set; }
        public string ConsumptionId { get; set; }
    }

    public class PayerModel
    {
        public string ParticipantId { get; set; }
        public decimal Amount { get; set; }
        public string SessionId { get; set; }
        public string ActionId { get; set; }
    }

    public class ConsumptionModel
    {
        public string Id { get; set; }
        public string Description { get; set; }
        public IEnumerable<ConsumerModel> Consumers { get; set; }
        public decimal Amount { get; set; }
        public double Quantity { get; set; }
        public bool SplittedEqually { get; set; }
    }
}
