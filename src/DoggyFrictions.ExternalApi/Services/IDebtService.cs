using DoggyFrictions.ExternalApi.Models;

namespace DoggyFrictions.ExternalApi.Services;

public interface IDebtService
{
    IEnumerable<Debt> GetDebts(IEnumerable<Domain.DebtAction> actions);
}
