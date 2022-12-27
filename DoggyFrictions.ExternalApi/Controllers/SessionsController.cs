using DoggyFrictions.ExternalApi.Models;
using DoggyFrictions.ExternalApi.Services.Repository;
using Microsoft.AspNetCore.Mvc;

namespace DoggyFrictions.ExternalApi.Controllers;

public class SessionsController : Controller
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
    public async Task<IActionResult> Post([FromBody] Session session)
    {
        if (session.Id != "0")
        {
            return BadRequest();
        }

        return Ok(await _repository.UpdateSession(session));
    }

    // PUT: api/Sessions/5
    public async Task<IActionResult> Put(string id, [FromBody] Session session)
    {
        if (session.Id == "0")
        {
            return BadRequest();
        }

        return Ok(await _repository.UpdateSession(session));
    }

    // DELETE: api/Sessions/5
    public async Task<Session> Delete(string id)
    {
        return await _repository.DeleteSession(id);
    }
}
