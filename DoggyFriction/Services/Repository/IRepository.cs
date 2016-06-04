using System.Collections.Generic;
using System.Web;
using DoggyFriction.Models;

namespace DoggyFriction.Services.Repository
{
    public interface IRepository
    {
        IEnumerable<SessionModel> GetSessions();
        SessionModel GetSession(int id);
        SessionModel UpdateSession(SessionModel model);
        SessionModel DeleteSession(int id);

        IEnumerable<ParticipantModel> GetParticipants(int sessionId);
        ParticipantModel GetParticipant(int sessionId, int id);
        ParticipantModel UpdateParticipant(int sessionId, ParticipantModel model);
        ParticipantModel DeleteParticipant(int sessionId, int id);
        
        IEnumerable<ActionModel> GetActions(int sessionId);
        ActionModel GetAction(int sessionId, int id);
        ActionModel UpdateAction(int sessionId, ActionModel model);
        ActionModel DeleteAction(int sessionId, int id);
        
        IEnumerable<PayerModel> GetPayers(int sessionId);
        IEnumerable<ConsumerModel> GetConsumers(int sessionId);
    }
}