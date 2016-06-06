using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web.Helpers;
using DoggyFriction.Models;
using Microsoft.Ajax.Utilities;
using WebGrease.Css.Extensions;

namespace DoggyFriction.Services.Repository
{
    public class JsonFileRepository : IRepository
    {
        private string BasePath => AppDomain.CurrentDomain.GetData("DataDirectory").ToString();
        private string SessionsFileName => Path.Combine(BasePath, @"Data/Sessions.json");
        private string ActionsFileName => Path.Combine(BasePath, @"Data/Actions.json");
        private string ParticipantsFileName => Path.Combine(BasePath, @"Data/Participants.json");
        private string PayersFileName => Path.Combine(BasePath, @"Data/Payers.json");
        private string ConsumersFileName => Path.Combine(BasePath, @"Data/Consumers.json");
        private Random Randomizer = new Random();

        private IEnumerable<T> LoadEntities<T>(string fileName)
        {
            if (File.Exists(fileName)) {
                var fileContent = File.ReadAllText(fileName, Encoding.Unicode);
                return Json.Decode<List<T>>(fileContent);
            }
            return new T[] {};
        }

        private void SaveEntities<T>(string fileName, IEnumerable<T> entities)
        {
            var directoryName = Path.GetDirectoryName(fileName);
            if (directoryName.IsNullOrWhiteSpace()) {
                throw new DirectoryNotFoundException(fileName);
            }
            if (!Directory.Exists(directoryName)) {
                Directory.CreateDirectory(directoryName);
            }
            var content = Json.Encode(entities);
            File.WriteAllText(fileName, content, Encoding.Unicode);
        }

        private int GenerateId()
        {
            return Randomizer.Next(1, Int32.MaxValue);
        }

        public IEnumerable<SessionModel> GetSessions()
        {
            var sessionModels = LoadEntities<SessionModel>(SessionsFileName).ToList();
            var participantsLookup = LoadEntities<ParticipantModel>(ParticipantsFileName).ToLookup(s => s.SessionId);
            sessionModels.ForEach(s => s.Participants = participantsLookup[s.Id].ToList());
            return sessionModels;
        }

        public SessionModel GetSession(int id)
        {
            var sessionModel = LoadEntities<SessionModel>(SessionsFileName).Single(s => s.Id == id);
            var participant = LoadEntities<ParticipantModel>(ParticipantsFileName).Where(s => s.SessionId == id);
            sessionModel.Participants = participant;
            return sessionModel;
        }

        public SessionModel UpdateSession(SessionModel model)
        {
            var sessionModels = LoadEntities<SessionModel>(SessionsFileName).ToList();
            var participantModels = LoadEntities<ParticipantModel>(ParticipantsFileName).ToList();
            
            var sessionId = model.Id > 0 ? model.Id : GenerateId();

            var newParticipants = model.Participants?.Select(participant => {
                participant.Id = participant.Id > 0 ? participant.Id : GenerateId();
                participant.SessionId = sessionId;
                return participant;
            });
            participantModels.RemoveAll(p => p.SessionId == sessionId);
            if (newParticipants != null) {
                participantModels.AddRange(newParticipants);
            }
            model.Participants = null;

            model.Id = sessionId;
            sessionModels.RemoveAll(s => s.Id == sessionId);
            sessionModels.Add(model);

            SaveEntities(SessionsFileName, sessionModels);
            SaveEntities(ParticipantsFileName, participantModels);
            return model;
        }

        public SessionModel DeleteSession(int id)
        {
            throw new NotImplementedException();
        }

        public IEnumerable<ParticipantModel> GetParticipants(int sessionId)
        {
            throw new NotImplementedException();
        }

        public ParticipantModel GetParticipant(int sessionId, int id)
        {
            throw new NotImplementedException();
        }

        public ParticipantModel UpdateParticipant(int sessionId, ParticipantModel model)
        {
            throw new NotImplementedException();
        }

        public ParticipantModel DeleteParticipant(int sessionId, int id)
        {
            throw new NotImplementedException();
        }

        public IEnumerable<ActionModel> GetActions(int sessionId)
        {
            var actionModels = LoadEntities<ActionModel>(ActionsFileName)
                .Where(a => a.SessionId == sessionId)
                .ToList();
            var payers = LoadEntities<PayerModel>(PayersFileName)
                .Where(p => p.SessionId == sessionId)
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

        public ActionModel GetAction(int sessionId, int id)
        {
            var actionModel = LoadEntities<ActionModel>(ActionsFileName).Single(a => a.Id == id && a.SessionId == sessionId);
            var payers = LoadEntities<PayerModel>(PayersFileName)
                .Where(p => p.SessionId == sessionId && p.ActionId == id)
                .ToList();
            actionModel.Consumptions = actionModel.Consumptions ?? new ConsumptionModel[] {};
            actionModel.Payers = payers;
            var consumerLookup = LoadEntities<ConsumerModel>(ConsumersFileName)
                .Where(s => s.SessionId == sessionId)
                .ToLookup(s => s.ConsumptionId);
            actionModel.Consumptions.ForEach(s => s.Consumers = consumerLookup[s.Id].ToList());
            return actionModel;
        }

        public ActionModel UpdateAction(int sessionId, ActionModel model)
        {
            var actionModels = LoadEntities<ActionModel>(ActionsFileName).ToList();
            var payerModels = LoadEntities<PayerModel>(PayersFileName).ToList();
            var consumerModels = LoadEntities<ConsumerModel>(ConsumersFileName).ToList();

            var actionId = model.Id > 0 ? model.Id : GenerateId();
            var newPayers = model.Payers?.Select(payer => {
                payer.Id = payer.Id > 0 ? payer.Id : GenerateId();
                payer.ActionId = actionId;
                payer.SessionId = sessionId;
                return payer;
            });
            payerModels.RemoveAll(p => p.ActionId == actionId && p.SessionId == sessionId);
            if (newPayers != null) {
                payerModels.AddRange(newPayers);
            }
            model.Payers = null;

            var consumptions = model.Consumptions ?? new List<ConsumptionModel>();
            consumptions.ForEach(consumption => {
                consumption.Id = consumption.Id > 0 ? consumption.Id : GenerateId();
                var newConsumers = consumption.Consumers?.Select(consumer => {
                    consumer.Id = consumer.Id > 0 ? consumer.Id : GenerateId();
                    consumer.ConsumptionId = consumption.Id;
                    consumer.SessionId = sessionId;
                    return consumer;
                });
                consumerModels.RemoveAll(p => p.ConsumptionId == consumption.Id && p.SessionId == sessionId);
                if (newConsumers != null) {
                    consumerModels.AddRange(newConsumers);
                }
                consumption.Consumers = null;
            });

            model.SessionId = sessionId;
            model.Id = actionId;
            actionModels.RemoveAll(a => a.Id == model.Id);
            actionModels.Add(model);

            SaveEntities(ActionsFileName, actionModels);
            SaveEntities(ConsumersFileName, consumerModels);
            SaveEntities(PayersFileName, payerModels);
            return model;
        }

        public ActionModel DeleteAction(int sessionId, int id)
        {
            var actionModels = LoadEntities<ActionModel>(ActionsFileName).ToList();
            var payerModels = LoadEntities<PayerModel>(PayersFileName).ToList();
            var consumerModels = LoadEntities<ConsumerModel>(ConsumersFileName).ToList();

            var model = actionModels.Single(a => a.SessionId == sessionId && a.Id == id);
            var payers = payerModels.Where(p => p.SessionId == sessionId && p.ActionId == id).ToList();
            var consumers = model.Consumptions.SelectMany(c => consumerModels.Where(cs => cs.SessionId == sessionId && cs.ConsumptionId == c.Id)).ToList();

            actionModels.Remove(model);
            payers.ForEach(p => payerModels.Remove(p));
            consumers.ForEach(c => consumerModels.Remove(c));

            SaveEntities(ActionsFileName, actionModels);
            SaveEntities(ConsumersFileName, consumerModels);
            SaveEntities(PayersFileName, payerModels);
            return model;
        }

        public IEnumerable<PayerModel> GetPayers(int sessionId)
        {
            throw new NotImplementedException();
        }

        public IEnumerable<ConsumerModel> GetConsumers(int sessionId)
        {
            throw new NotImplementedException();
        }
    }
}