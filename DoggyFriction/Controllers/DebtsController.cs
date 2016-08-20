using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using DoggyFriction.Domain;
using DoggyFriction.Services;
using DoggyFriction.Services.Repository;

namespace DoggyFriction.Controllers
{
    public class DebtsController : ApiController
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
                    Transactions = d.Transactions.OrderByDescending(t => t.Date).ToList()
                })
                .OrderBy(d => d.Debtor)
                .ThenBy(d => d.Creditor);
        }
    }
}
