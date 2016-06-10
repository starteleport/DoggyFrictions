using System.Collections.Generic;
using DoggyFriction.Domain;
using DoggyFriction.Models;

namespace DoggyFriction.Services
{
    public interface IDebtService
    {
        IEnumerable<Debt> GetDebts(IEnumerable<Action> actions);
    }
}
