using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using DoggyFriction.Domain;
using DoggyFriction.Services;

namespace DoggyFriction.Controllers
{
    public class DebtsController : ApiController
    {
        // GET api/debts
        public IEnumerable<Debt> Get(int id)
        {
            var actionsProvider = new SessionActionsProvider();
            var sessionModel = Hub.Repository.GetSession(id);
            var actionModels = Hub.Repository.GetActions(id);
            var actions = actionsProvider.GetSessionActions(sessionModel, actionModels);
            return Hub.DebtService.GetDebts(actions)
                .OrderBy(d => d.Debtor)
                .ThenBy(d => d.Creditor);
        }
    }
}
