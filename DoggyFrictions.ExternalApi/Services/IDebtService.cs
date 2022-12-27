namespace DoggyFrictions.ExternalApi.Services;

public interface IDebtService
{
    IEnumerable<Debt> GetDebts(IEnumerable<Domain.Action> actions);
}
