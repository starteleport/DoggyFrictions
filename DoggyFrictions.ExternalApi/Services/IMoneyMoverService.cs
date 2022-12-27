using DoggyFrictions.ExternalApi.Models;
using Action = DoggyFrictions.ExternalApi.Models.Action;

namespace DoggyFrictions.ExternalApi.Services;

public interface IMoneyMoverService
{
    Action CreateMoveMoneyTransaction(Session session, MoveMoneyTransaction moveMoneyTransaction);
}