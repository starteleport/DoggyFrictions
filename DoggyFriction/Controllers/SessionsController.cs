using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using DoggyFriction.Models;
using DoggyFriction.Services;

namespace DoggyFriction.Controllers
{
    public class SessionsController : ApiController
    {
        // GET: api/Sessions
        public async Task<IEnumerable<Session>> Get()
        {
            return (await Hub.Repository.GetSessions()).OrderBy(s => s.Name);
        }

        // GET: api/Sessions/5
        public async Task<Session> Get(string id)
        {
            return await Hub.Repository.GetSession(id);
        }

        // POST: api/Sessions
        public async Task<Session> Post([FromBody]Session session)
        {
            if (session.Id != "0") {
                throw new HttpResponseException(new HttpResponseMessage(HttpStatusCode.BadRequest));
            }
            return await Hub.Repository.UpdateSession(session);
        }

        // PUT: api/Sessions/5
        public async Task<Session> Put(string id, [FromBody]Session session)
        {
            if (session.Id == "0") {
                throw new HttpResponseException(new HttpResponseMessage(HttpStatusCode.BadRequest));
            }
            return await Hub.Repository.UpdateSession(session);
        }

        // DELETE: api/Sessions/5
        public async Task<Session> Delete(string id)
        {
            return await Hub.Repository.DeleteSession(id);
        }
    }
}
