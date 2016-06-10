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
        // GET: api/Actions/5
        [Route("api/Actions/{sessionId:int:min(1)}")]
        public PagedCollection<ActionModel> Get(int sessionId, [FromUri] ActionsFilter filter = null)
        {
            var actions = Hub.Repository.GetActions(sessionId);
            var page = filter?.Page ?? 1;
            var pageSize = 10;
            return new PagedCollection<ActionModel> {
                TotalPages = (int)(actions.Count() / pageSize) + 1,
                Page = page,
                Rows = actions.Skip((page - 1) * pageSize).Take(pageSize)
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
        public ActionModel Post(int sessionId, [FromBody]ActionModel actionModel)
        {
            if (actionModel.Id != 0) {
                throw new HttpResponseException(new HttpResponseMessage(HttpStatusCode.BadRequest));
            }
            return Hub.Repository.UpdateAction(sessionId, actionModel);
        }

        // PUT: api/Actions/5/5
        [Route("api/Actions/{sessionId:int:min(1)}/{id:int:min(1)}")]
        public ActionModel Put(int sessionId, int id, [FromBody]ActionModel actionModel)
        {
            if (actionModel.Id <= 0) {
                throw new HttpResponseException(new HttpResponseMessage(HttpStatusCode.BadRequest));
            }
            return Hub.Repository.UpdateAction(sessionId, actionModel);
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
