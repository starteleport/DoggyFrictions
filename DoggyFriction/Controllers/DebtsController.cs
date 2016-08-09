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
        private readonly IRepository _cachedRepository;

        public DebtsController()
        {
            _cachedRepository = Hub.CachedRepository;
        }

        // GET api/debts
        public async Task<IEnumerable<Debt>> Get(string id)
        {
            var actionsProvider = new SessionActionsProvider();
            var sessionModel = await _cachedRepository.GetSession(id);
            var actionModels = await _cachedRepository.GetActions(id);
            var actions = actionsProvider.GetSessionActions(sessionModel, actionModels);
            return Hub.DebtService.GetDebts(actions)
                .Select(d => new Debt {
                    Debtor = d.Debtor,
                    Creditor = d.Creditor,
                    Transactions = d.Transactions.OrderByDescending(t => t.Date).ToList()
                })
                .OrderBy(d => d.Debtor)
                .ThenBy(d => d.Creditor);
        }
    }
}
