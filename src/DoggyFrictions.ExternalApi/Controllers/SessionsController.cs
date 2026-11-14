using DoggyFrictions.ExternalApi.Localization;
using DoggyFrictions.ExternalApi.Models;
using DoggyFrictions.ExternalApi.Services.Repository;
using Microsoft.AspNetCore.Mvc;

namespace DoggyFrictions.ExternalApi.Controllers;

[Route("[controller]")]
[ApiController]
public class SessionsController : Controller
{
    private readonly IRepository _repository;
    private readonly ITexts _texts;

    public SessionsController(IRepository repository, ITexts texts)
    {
        _repository = repository;
        _texts = texts;
    }

    // GET: api/Sessions
    [HttpGet]
    public async Task<IEnumerable<Session>> Index()
    {
        return (await _repository.GetSessions()).OrderBy(s => s.Name);
    }

    // GET: api/Sessions/5
    [HttpGet("{id}")]
    public async Task<IActionResult> Get(string id) => this.OkOrNotFound(await _repository.GetSession(id));

    // POST: api/Sessions
    [HttpPost("")]
    public async Task<IActionResult> Post([FromBody] Session session)
    {
        if (session.Id != "0")
        {
            return BadRequest();
        }

        // Participant ids are assigned by the server.
        if (session.StoredParticipantIds().Any())
        {
            return this.Invalid(nameof(Session.Participants), _texts["validation.session.newHasStored"]);
        }

        return Ok(await _repository.UpdateSession(session));
    }

    // PUT: api/Sessions/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(string id, [FromBody] Session session)
    {
        if (session.Id != id || EntityId.IsNew(id))
        {
            return BadRequest();
        }

        var stored = await _repository.GetSession(id);
        if (stored == null)
        {
            return NotFound();
        }

        if (!stored.HasParticipants(session.StoredParticipantIds()))
        {
            return this.Invalid(nameof(Session.Participants), _texts["validation.session.unknownParticipant"]);
        }

        // Actions refer to participants by id, so a participant with actions has to stay.
        var inUse = (await _repository.GetSessionActions(id)).SelectMany(action => action.ParticipantIds());
        if (!session.HasParticipants(inUse))
        {
            return this.Invalid(nameof(Session.Participants), _texts["validation.session.participantInUse"]);
        }

        return this.OkOrNotFound(await _repository.UpdateSession(session));
    }

    // DELETE: api/Sessions/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id) => this.OkOrNotFound(await _repository.DeleteSession(id));
}
