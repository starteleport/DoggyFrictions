using System.Collections.Generic;
using DoggyFriction.Domain;

namespace DoggyFriction.Services
{
    public interface IDebtService
    {
        IEnumerable<Debt> GetDebts(IEnumerable<Action> actions);
    }
}
