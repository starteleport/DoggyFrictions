using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using DoggyFriction.Domain;
using DoggyFriction.Services;

namespace DoggyFriction.Controllers
{
    public class DebtsController : ApiController
    {
        // GET api/debts
        public async Task<IEnumerable<Debt>> Get(string id)
        {
            var actionsProvider = new SessionActionsProvider();
            var sessionModel = await Hub.Repository.GetSession(id);
            var actionModels = await Hub.Repository.GetActions(id);
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
