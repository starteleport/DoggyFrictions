using DoggyFrictions.ExternalApi.Models;

namespace DoggyFrictions.ExternalApi.Services;

public interface IMoneyMoverService
{
    ActionObject CreateMoveMoneyTransaction(Session session, MoveMoneyTransaction moveMoneyTransaction);
}