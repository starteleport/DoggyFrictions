using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using DoggyFriction.Models;
using DoggyFriction.Services;
using DoggyFriction.Services.Repository;

namespace DoggyFriction.Controllers
{
    public class SessionsController : ApiController
    {
        private readonly IRepository _cachedRepository;
        private readonly IRepository _repository;

        public SessionsController()
        {
            _cachedRepository = Hub.CachedRepository;
            _repository = Hub.Repository;
        }

        // GET: api/Sessions
        public async Task<IEnumerable<Session>> Get()
        {
            return (await _cachedRepository.GetSessions()).OrderBy(s => s.Name);
        }

        // GET: api/Sessions/5
        public async Task<Session> Get(string id)
        {
            return await _cachedRepository.GetSession(id);
        }

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
