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

    // GET api/debts
    [HttpGet("{id}")]
    public async Task<IEnumerable<Debt>> Get(string id)
    {
        var sessionModel = await _repository.GetSession(id);
        var actionModels = await _repository.GetSessionActions(id);
        var actions = _actionsProvider.GetSessionActions(sessionModel, actionModels);

        return _debtService.GetDebts(actions).Select(d =>
            new Debt
            {
                Debtor = d.Debtor,
                Creditor = d.Creditor,
                Transactions = d.Transactions
            })
            .OrderBy(d => d.Debtor)
            .ThenBy(d => d.Creditor);
    }
}
