using DoggyFrictions.ExternalApi.Models;
using DoggyFrictions.ExternalApi.Services.Repository;
using Microsoft.AspNetCore.Mvc;

namespace DoggyFrictions.ExternalApi.Controllers;

[Route("[controller]")]
[ApiController]
public class SessionsController : Controller
{
    private readonly IRepository _repository;

    public SessionsController(IRepository repository)
    {
        _repository = repository;
    }

    // GET: api/Sessions/5
    [HttpGet("{id}")]
    public async Task<Session> Get(string id) => await _repository.GetSession(id);

    // POST: api/Sessions
    [HttpPost("")]
    public async Task<IActionResult> Post([FromForm] Session session)
    {
        if (session.Id != "0")
        {
            return BadRequest();
        }

        return Ok(await _repository.UpdateSession(session));
    }

    // PUT: api/Sessions/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(string id, [FromForm] Session session)
    {
        if (session.Id == "0")
        {
            return BadRequest();
        }

        return Ok(await _repository.UpdateSession(session));
    }

    // DELETE: api/Sessions/5
    [HttpDelete("{id}")]
    public async Task<Session> Delete(string id)
    {
        return await _repository.DeleteSession(id);
    }
}
