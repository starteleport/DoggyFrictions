using DoggyFrictions.ExternalApi.Models;
using Action = DoggyFrictions.ExternalApi.Models.Action;

namespace DoggyFrictions.ExternalApi.Controllers;

public interface IMoneyMoverService
{
    Action CreateMoveMoneyTransaction(Session session, MoveMoneyTransaction moveMoneyTransaction);
}