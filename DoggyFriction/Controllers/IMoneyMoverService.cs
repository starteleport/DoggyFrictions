using DoggyFriction.Models;

namespace DoggyFriction.Controllers
{
    public interface IMoneyMoverService
    {
        Action CreateMoveMoneyTransaction(Session session, MoveMoneyTransaction moveMoneyTransaction);
    }
}