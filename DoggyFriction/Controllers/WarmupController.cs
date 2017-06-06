using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using DoggyFriction.Services.Repository;

namespace DoggyFriction.Controllers
{
    public class WarmupController : ApiController
    {
        private readonly IRepository _repository;

        public WarmupController(IRepository repository)
        {
            _repository = repository;
        }

        // GET: api/warmup
        public async Task<int> Get()
        {
            return (await _repository.GetSessions()).Count();
        }
    }
}