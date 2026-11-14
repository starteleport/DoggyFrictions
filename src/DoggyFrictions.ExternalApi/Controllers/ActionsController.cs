using DoggyFrictions.ExternalApi.Localization;
using DoggyFrictions.ExternalApi.Models;
using DoggyFrictions.ExternalApi.Services;
using DoggyFrictions.ExternalApi.Services.Repository;
using Microsoft.AspNetCore.Mvc;

namespace DoggyFrictions.ExternalApi.Controllers;

[Route("[controller]")]
[ApiController]
public class ActionsController : Controller
{
    private readonly IRepository _repository;
    private readonly IMoneyMoverService _moneyMover;
    private readonly ITexts _texts;

    public ActionsController(IRepository repository, IMoneyMoverService moneyMover, ITexts texts)
    {
        _repository = repository;
        _moneyMover = moneyMover;
        _texts = texts;
    }

    // GET: api/Actions/5
    [HttpGet("/Actions/{sessionId}")]
    public async Task<IActionResult> Get(string sessionId, [FromQuery] ActionsFilter filter)
    {
        if (await _repository.GetSession(sessionId) == null)
        {
            return NotFound();
        }

        var actions = (await _repository.GetSessionActions(sessionId)).OrderByDescending(a => a.Date).ToList();
        return Ok(PagedCollection<ActionObject>.Create(actions, filter.Page, filter.PageSize));
    }

    // GET: api/Actions/5/5
    [HttpGet("/Actions/{sessionId}/{id}")]
    public async Task<IActionResult> Get(string sessionId, string id)
    {
        return this.OkOrNotFound(await _repository.GetAction(sessionId, id));
    }

    // POST: api/Actions/5
    [HttpPost("/Actions/{sessionId}")]
    public async Task<IActionResult> Post(string sessionId, [FromBody] ActionObject actionObject)
    {
        if (actionObject.Id != "0" || actionObject.SessionId != sessionId)
        {
            return BadRequest();
        }

        return await Save(sessionId, actionObject);
    }

    // PUT: api/Actions/5/5
    [HttpPut("/Actions/{sessionId}/{id}")]
    public async Task<IActionResult> Put(string sessionId, string id, [FromBody] ActionObject actionObject)
    {
        if (actionObject.Id != id || EntityId.IsNew(id) || actionObject.SessionId != sessionId)
        {
            return BadRequest();
        }

        return await Save(sessionId, actionObject);
    }

    [HttpPost("/Actions/{sessionId}/MoveMoney")]
    public async Task<IActionResult> Post(string sessionId, [FromBody] MoveMoneyTransaction moveMoneyTransaction)
    {
        var session = await _repository.GetSession(sessionId);
        if (session == null)
        {
            return NotFound();
        }

        var from = session.Participants.FirstOrDefault(p => p.Id == moveMoneyTransaction.FromId);
        var to = session.Participants.FirstOrDefault(p => p.Id == moveMoneyTransaction.ToId);
        if (from == null || to == null || from.Id == to.Id)
        {
            return this.Invalid(nameof(MoveMoneyTransaction), _texts["validation.transfer.sides"]);
        }

        var action = _moneyMover.CreateMoveMoneyTransaction(session, from, to, moveMoneyTransaction);
        return Ok(await _repository.UpdateAction(sessionId, action));
    }

    // DELETE: api/Actions/5/5
    [HttpDelete("/Actions/{sessionId}/{id}")]
    public async Task<IActionResult> Delete(string sessionId, string id)
    {
        return this.OkOrNotFound(await _repository.DeleteAction(sessionId, id));
    }

    private async Task<IActionResult> Save(string sessionId, ActionObject actionObject)
    {
        var session = await _repository.GetSession(sessionId);
        if (session == null)
        {
            return NotFound();
        }

        if (!session.HasParticipants(actionObject.ParticipantIds()))
        {
            return this.Invalid(nameof(ActionObject.Payers), _texts["validation.action.notParticipants"]);
        }

        return this.OkOrNotFound(await _repository.UpdateAction(sessionId, actionObject));
    }
}
