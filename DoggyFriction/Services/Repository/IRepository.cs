using System.Collections.Generic;
using DoggyFriction.Models;

namespace DoggyFriction.Services.Repository
{
    public interface IRepository
    {
        IEnumerable<SessionModel> GetSessions();
        SessionModel GetSession(int id);
        SessionModel UpdateSession(SessionModel model);
        SessionModel DeleteSession(int id);

        IEnumerable<ActionModel> GetActions(int sessionId);
        ActionModel GetAction(int sessionId, int id);
        ActionModel UpdateAction(int sessionId, ActionModel model);
        ActionModel DeleteAction(int sessionId, int id);
    }
}