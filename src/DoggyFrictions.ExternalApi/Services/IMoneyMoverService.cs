using DoggyFrictions.ExternalApi.Models;

namespace DoggyFrictions.ExternalApi.Services;

public interface IMoneyMoverService
{
    /// <summary>Builds the action recording a transfer of money between two participants of a session.</summary>
    ActionObject CreateMoveMoneyTransaction(
        Session session, Participant from, Participant to, MoveMoneyTransaction moveMoneyTransaction);
}
