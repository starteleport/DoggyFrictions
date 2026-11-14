using DoggyFrictions.ExternalApi.Domain;
using DoggyFrictions.ExternalApi.Models;
using DoggyFrictions.ExternalApi.Services;
using DoggyFrictions.ExternalApi.Services.Repository;
using Microsoft.AspNetCore.Mvc;

namespace DoggyFrictions.ExternalApi.Controllers;

[Route("[controller]")]
public class DebtsController : Controller
{
    private readonly IRepository _repository;
    private readonly IDebtService _debtService;
    private readonly SessionActionsProvider _actionsProvider;

    public DebtsController(IRepository repository, IDebtService debtService, SessionActionsProvider actionsProvider)
    {
        _repository = repository;
        _debtService = debtService;
        _actionsProvider = actionsProvider;
    }

    // GET api/debts/5
    [HttpGet("{id}")]
    public async Task<ActionResult<IEnumerable<Debt>>> Get(string id)
    {
        var session = await _repository.GetSession(id);
        if (session == null)
        {
            return NotFound();
        }

        var actions = _actionsProvider.GetSessionActions(await _repository.GetSessionActions(id));

        // Legacy data may hold a duplicated participant or an id that is no longer in the session;
        // such an id is shown as is rather than failing the page.
        var names = new Dictionary<string, string>();
        foreach (var participant in session.Participants)
        {
            names.TryAdd(participant.Id, participant.Name);
        }

        var debts = _debtService.GetDebts(actions)
            .Select(settlement => new Debt
            {
                DebtorId = settlement.DebtorId,
                CreditorId = settlement.CreditorId,
                Debtor = names.GetValueOrDefault(settlement.DebtorId, settlement.DebtorId),
                Creditor = names.GetValueOrDefault(settlement.CreditorId, settlement.CreditorId),
                Amount = settlement.Amount
            })
            .OrderBy(d => d.Debtor)
            .ThenBy(d => d.Creditor)
            .ToList();

        return debts;
    }
}
