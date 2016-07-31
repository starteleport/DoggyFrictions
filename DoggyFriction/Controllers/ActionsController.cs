using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using DoggyFriction.Models;
using DoggyFriction.Services;
using Action = DoggyFriction.Models.Action;

namespace DoggyFriction.Controllers
{
    public class ActionsController : ApiController
    {
        // GET: api/Actions/5
        [Route("api/Actions/{sessionId}")]
        public async Task<PagedCollection<Action>> Get(string sessionId, [FromUri] ActionsFilter filter = null)
        {
            var actions = await Hub.Repository.GetActions(sessionId);
            var page = filter?.Page ?? 1;
            var pageSize = filter?.PageSize ?? 10;
            return new PagedCollection<Action> {
                TotalPages = (actions.Count() / pageSize) + 1,
                Page = page,
                Rows = actions.OrderByDescending(a => a.Date).Skip((page - 1) * pageSize).Take(pageSize)
            };
        }

        // GET: api/Actions/5/5
        [Route("api/Actions/{sessionId}/{id}")]
        public async Task<Action> Get(string sessionId, string id)
        {
            return await Hub.Repository.GetAction(sessionId, id);
        }

        // POST: api/Actions/5
        [Route("api/Actions/{sessionId}")]
        public async Task<Action> Post(string sessionId, [FromBody]Action action)
        {
            if (action.Id != "0") {
                throw new HttpResponseException(new HttpResponseMessage(HttpStatusCode.BadRequest));
            }
            return await Hub.Repository.UpdateAction(sessionId, action);
        }

        // PUT: api/Actions/5/5
        [Route("api/Actions/{sessionId}/{id}")]
        public async Task<Action> Put(string sessionId, string id, [FromBody]Action action)
        {
            if (action.Id == "0") {
                throw new HttpResponseException(new HttpResponseMessage(HttpStatusCode.BadRequest));
            }
            return await Hub.Repository.UpdateAction(sessionId, action);
        }
        
        [Route("api/Actions/{sessionId}/MoveMoney")]
        public async Task<Action> Post(string sessionId, [FromBody]MoveMoneyTransaction moveMoneyTransaction)
        {
            if (!ModelState.IsValid) {
                throw new HttpResponseException(HttpStatusCode.BadRequest);
            }
            var sessionModel = await Hub.Repository.GetSession(sessionId);
            var fromParticipant = sessionModel.Participants.FirstOrDefault(p => p.Name == moveMoneyTransaction.From);
            var toParticipant = sessionModel.Participants.FirstOrDefault(p => p.Name == moveMoneyTransaction.To);
            if (fromParticipant == null || toParticipant == null) {
                throw new HttpResponseException(HttpStatusCode.RequestedRangeNotSatisfiable);
            }
            var description = moveMoneyTransaction.Reason ?? $"{fromParticipant.Name} -> {toParticipant.Name}";

            var actionModel = new Action {
                SessionId = sessionId,
                Date = moveMoneyTransaction.Date ?? DateTime.Now,
                Description = description,
                Payers = new[] {
                    new Payer {
                        Amount = moveMoneyTransaction.Amount,
                        ParticipantId = fromParticipant.Id
                    }
                },
                Consumptions = new[] {
                    new Consumption {
                        Amount = moveMoneyTransaction.Amount,
                        Description = description,
                        Quantity = 1,
                        SplittedEqually = false,
                        Consumers = new[] {
                            new Consumer {
                                Amount = moveMoneyTransaction.Amount,
                                ParticipantId = toParticipant.Id
                            }
                        }
                    }
                }
            };
            return await Hub.Repository.UpdateAction(sessionId, actionModel);
        }

        // DELETE: api/Actions/5/5
        [Route("api/Actions/{sessionId}/{id}")]
        public async Task<Action> Delete(string sessionId, string id)
        {
            return await Hub.Repository.DeleteAction(sessionId, id);
        }
    }

    public class ActionsFilter
    {
        public int Page { get; set; }
        public int PageSize { get; set; }
    }
}
