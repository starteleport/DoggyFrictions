using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using DoggyFriction.Models;

namespace DoggyFriction.Controllers
{
    public class ActionsController : ApiController
    {
        private ActionModel actionModel = new ActionModel {
            Id = 1,
            Date = DateTime.Now,
            Description = "В магаз набижали",
            Amount = 500m,
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
            return new PagedCollection<ActionModel> {
                TotalPages = 25,
                Page = filter?.Page ?? 1,
                Rows = new[] {
                    actionModel,
                    actionModel
                }
            };
        }

        // GET: api/Actions/5/5
        [Route("api/Actions/{sessionId:int:min(1)}/{id:int:min(1)}")]
        public ActionModel Get(int sessionId, int id)
        {
            return actionModel;
        }

        // POST: api/Actions
        public void Post([FromBody]string value)
        {
        }

        // PUT: api/Actions/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE: api/Actions/5
        public void Delete(int id)
        {
        }
    }

    public class ActionsFilter
    {
        public int Page { get; set; }
    }
}
