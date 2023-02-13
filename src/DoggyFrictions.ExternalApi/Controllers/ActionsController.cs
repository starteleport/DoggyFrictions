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

    public ActionsController(IRepository repository, IMoneyMoverService moneyMover)
    {
        _repository = repository;
        _moneyMover = moneyMover;
    }

    // GET: api/Actions/5
    [HttpGet("/Actions/{sessionId}")]
    public async Task<PagedCollection<ActionObject>> Get(string sessionId, [FromQuery] ActionsFilter? filter = null)
    {
        var actions = await _repository.GetSessionActions(sessionId);
        var page = filter?.Page ?? 1;
        var pageSize = filter?.PageSize ?? 10;

        return new PagedCollection<ActionObject>
        {
            TotalPages = (actions.Count() / pageSize) + 1,
            Page = page,
            Rows = actions.OrderByDescending(a => a.Date).Skip((page - 1) * pageSize).Take(pageSize)
        };
    }

    // GET: api/Actions/5/5
    [HttpGet("/Actions/{sessionId}/{id}")]
    public async Task<ActionObject> Get(string sessionId, string id)
    {
        return await _repository.GetAction(sessionId, id);
    }

    // POST: api/Actions/5
    [HttpPost("/Actions/{sessionId}")]
    public async Task<IActionResult> Post(string sessionId, [FromForm] ActionObject actionObject)
    {
        if (actionObject.Id != "0")
        {
            return BadRequest();
        }

        return Ok(await _repository.UpdateAction(sessionId, actionObject));
    }

    // PUT: api/Actions/5/5
    [HttpPut("/Actions/{sessionId}/{id}")]
    public async Task<IActionResult> Put(string sessionId, string id, [FromForm] ActionObject actionObject)
    {
        if (actionObject.Id == "0")
        {
            return BadRequest();
        }

        return Ok(await _repository.UpdateAction(sessionId, actionObject));
    }

    [HttpPost("/Actions/{sessionId}/MoveMoney")]
    public async Task<IActionResult> Post(string sessionId, [FromForm] MoveMoneyTransaction moveMoneyTransaction)
    {
        var sessionModel = await _repository.GetSession(sessionId);
        var actionModel = _moneyMover.CreateMoveMoneyTransaction(sessionModel, moveMoneyTransaction);

        return Ok(await _repository.UpdateAction(sessionId, actionModel));
    }

    // DELETE: api/Actions/5/5
    [HttpDelete("/Actions/{sessionId}/{id}")]
    public async Task<ActionObject> Delete(string sessionId, string id)
    {
        return await _repository.DeleteAction(sessionId, id);
    }
}
