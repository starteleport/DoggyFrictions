using DoggyFrictions.ExternalApi.Domain;

namespace DoggyFrictions.ExternalApi.Services;

public interface IDebtService
{
    /// <summary>
    /// Settles the actions into debts. Participants are identified by <see cref="Participation.Participant"/>.
    /// </summary>
    IEnumerable<Settlement> GetDebts(IEnumerable<DebtAction> actions);
}
