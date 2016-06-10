using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using DoggyFriction.Models;
using DoggyFriction.Services;

namespace DoggyFriction.Controllers
{
    public class SessionsController : ApiController
    {
        // GET: api/Sessions
        public IEnumerable<SessionModel> Get()
        {
            return Hub.Repository.GetSessions();
        }

        // GET: api/Sessions/5
        public SessionModel Get(int id)
        {
            return Hub.Repository.GetSession(id);
        }

        // POST: api/Sessions
        public SessionModel Post([FromBody]SessionModel sessionModel)
        {
            if (sessionModel.Id != 0) {
                throw new HttpResponseException(new HttpResponseMessage(HttpStatusCode.BadRequest));
            }
            return Hub.Repository.UpdateSession(sessionModel);
        }

        // PUT: api/Sessions/5
        public SessionModel Put(int id, [FromBody]SessionModel sessionModel)
        {
            if (sessionModel.Id <= 0) {
                throw new HttpResponseException(new HttpResponseMessage(HttpStatusCode.BadRequest));
            }
            return Hub.Repository.UpdateSession(sessionModel);
        }

        // DELETE: api/Sessions/5
        public void Delete(int id)
        {
        }
    }
}
