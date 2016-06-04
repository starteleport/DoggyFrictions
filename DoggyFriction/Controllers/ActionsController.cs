using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using DoggyFriction.Models;
using DoggyFriction.Services;

namespace DoggyFriction.Controllers
{
    public class ActionsController : ApiController
    {
        private ActionModel actionModel = new ActionModel {
            Id = 1,
            Date = DateTime.Now,
            Description = "В магаз набижали",
            Payers = new[] {
                new PayerModel {
                    ParticipantId = 0,
                    Amount = 400m
                },
                new PayerModel {
                    ParticipantId = 1,
                    Amount = 100m
                }
            },
            Consumptions = new ConsumptionModel[] {
                new ConsumptionModel {
                    Consumers = new[] {
                        new ConsumerModel {
                            ParticipantId = 2,
                            Amount = 400m
                        },
                        new ConsumerModel {
                            ParticipantId = 1,
                            Amount = 50m
                        }
                    },
                    Description = "Платим за всю хуйню"

                },
                new ConsumptionModel {
                    Consumers = new[] {
                        new ConsumerModel {
                            ParticipantId = 0,
                            Amount = 50m
                        }
                    },
                    Description = "Жувачка!"

                }
            }
        };

        // GET: api/Actions/5
        [Route("api/Actions/{sessionId:int:min(1)}")]
        public PagedCollection<ActionModel> Get(int sessionId, [FromUri] ActionsFilter filter = null)
        {
            var actions = Hub.Repository.GetActions(sessionId);
            var page = filter?.Page ?? 1;
            var pageSize = 10;
            return new PagedCollection<ActionModel> {
                TotalPages = actions.Count() / pageSize,
                Page = page,
                Rows = actions.Skip(page * pageSize).Take(pageSize)
            };
        }

        // GET: api/Actions/5/5
        [Route("api/Actions/{sessionId:int:min(1)}/{id:int:min(1)}")]
        public ActionModel Get(int sessionId, int id)
        {
            return Hub.Repository.GetAction(sessionId, id);
        }

        // POST: api/Actions/5
        [Route("api/Actions/{sessionId:int:min(1)}")]
        public void Post(int sessionId, [FromBody]ActionModel actionModel)
        {
            if (actionModel.Id != 0) {
                throw new HttpResponseException(new HttpResponseMessage(HttpStatusCode.BadRequest));
            }
            Hub.Repository.UpdateAction(sessionId, actionModel);
        }

        // PUT: api/Actions/5/5
        [Route("api/Actions/{sessionId:int:min(1)}/{id:int:min(1)}")]
        public void Put(int sessionId, int id, [FromBody]ActionModel actionModel)
        {
            if (actionModel.Id <= 0) {
                throw new HttpResponseException(new HttpResponseMessage(HttpStatusCode.BadRequest));
            }
            Hub.Repository.UpdateAction(sessionId, actionModel);
        }

        // DELETE: api/Actions/5
        public void Delete(int sessionId, int id)
        {
            Hub.Repository.DeleteAction(sessionId, id);
        }
    }

    public class ActionsFilter
    {
        public int Page { get; set; }
    }
}
