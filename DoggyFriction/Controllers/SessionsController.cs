using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using DoggyFriction.Models;
using DoggyFriction.Services.Repository;

namespace DoggyFriction.Controllers
{
    public class SessionsController : ApiController
    {
        private readonly IRepository _repository;

        public SessionsController(IRepository repository)
        {
            _repository = repository;
        }

        // GET: api/Sessions
        public async Task<IEnumerable<Session>> Get()
        {
            return (await _repository.GetSessions()).OrderBy(s => s.Name);
        }

        // GET: api/Sessions/5
        public async Task<Session> Get(string id) => await _repository.GetSession(id);

        // POST: api/Sessions
        public async Task<Session> Post([FromBody]Session session)
        {
            if (session.Id != "0") {
                throw new HttpResponseException(new HttpResponseMessage(HttpStatusCode.BadRequest));
            }
            return await _repository.UpdateSession(session);
        }

        // PUT: api/Sessions/5
        public async Task<Session> Put(string id, [FromBody]Session session)
        {
            if (session.Id == "0") {
                throw new HttpResponseException(new HttpResponseMessage(HttpStatusCode.BadRequest));
            }
            return await _repository.UpdateSession(session);
        }

        // DELETE: api/Sessions/5
        public async Task<Session> Delete(string id)
        {
            return await _repository.DeleteSession(id);
        }
    }
}
