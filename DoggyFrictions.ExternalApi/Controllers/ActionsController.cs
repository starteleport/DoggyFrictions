using System.Net;
using DoggyFrictions.ExternalApi.Models;
using DoggyFrictions.ExternalApi.Services.Repository;
using Microsoft.AspNetCore.Mvc;
using Action = DoggyFrictions.ExternalApi.Models.Action;

namespace DoggyFrictions.ExternalApi.Controllers;

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
    [Route("api/Actions/{sessionId}")]
    public async Task<PagedCollection<Action>> Get(string sessionId, [FromQuery] ActionsFilter? filter = null)
    {
        var actions = await _repository.GetSessionActions(sessionId);
        var page = filter?.Page ?? 1;
        var pageSize = filter?.PageSize ?? 10;

        return new PagedCollection<Action>
        {
            TotalPages = (actions.Count() / pageSize) + 1,
            Page = page,
            Rows = actions.OrderByDescending(a => a.Date).Skip((page - 1) * pageSize).Take(pageSize)
        };
    }

    // GET: api/Actions/5/5
    [Route("api/Actions/{sessionId}/{id}")]
    public async Task<Action> Get(string sessionId, string id)
    {
        return await _repository.GetAction(sessionId, id);
    }

    // POST: api/Actions/5
    [Route("api/Actions/{sessionId}")]
    public async Task<IActionResult> Post(string sessionId, [FromBody] Action action)
    {
        if (action.Id != "0")
        {
            return BadRequest();
        }

        return Ok(await _repository.UpdateAction(sessionId, action));
    }

    // PUT: api/Actions/5/5
    [Route("api/Actions/{sessionId}/{id}")]
    public async Task<IActionResult> Put(string sessionId, string id, [FromBody] Action action)
    {
        if (action.Id == "0")
        {
            return BadRequest();
        }

        return Ok(await _repository.UpdateAction(sessionId, action));
    }

    [Route("api/Actions/{sessionId}/MoveMoney")]
    public async Task<IActionResult> Post(string sessionId, [FromBody] MoveMoneyTransaction moveMoneyTransaction)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest();
        }

        var sessionModel = await _repository.GetSession(sessionId);
        var actionModel = _moneyMover.CreateMoveMoneyTransaction(sessionModel, moveMoneyTransaction);

        return Ok(await _repository.UpdateAction(sessionId, actionModel));
    }

    // DELETE: api/Actions/5/5
    [Route("api/Actions/{sessionId}/{id}")]
    public async Task<Action> Delete(string sessionId, string id)
    {
        return await _repository.DeleteAction(sessionId, id);
    }
}
