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
            Payers = new PayerModel[] {
                new PayerModel {
                    Participant = new ParticipantModel {
                        Id = 0,
                        Name = "Эмметт Браун"
                    },
                    Amount = 400m
                },
                new PayerModel {
                    Participant = new ParticipantModel {
                        Id = 1,
                        Name = "Марти"
                    },
                    Amount = 100m
                }
            },
            Consumers = new ConsumerModel[] {
                new ConsumerModel {
                    Participant = new ParticipantModel {
                        Id = 2,
                        Name = "Бифф"
                    },
                    Amount = 500m,
                    Description = "Платит за всю хуйню"
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
