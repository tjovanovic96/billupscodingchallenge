using BillupsCodingChallenge.API.DTOs;
using BillupsCodingChallenge.Application.Interfaces;
using BillupsCodingChallenge.Application.Models;
using Microsoft.AspNetCore.Mvc;

namespace BillupsCodingChallenge.API.Controllers;

[ApiController]
public class GameController : ControllerBase
{
    private readonly IPlayService _playService;
    private readonly IRandomApiService _randomApiService;
    private readonly IScoreboardService _scoreboardService;

    public GameController(IPlayService playService, IRandomApiService randomApiService, IScoreboardService scoreboardService)
    {
        _playService = playService;
        _randomApiService = randomApiService;
        _scoreboardService = scoreboardService;
    }

    [HttpGet("/choices")]
    public ActionResult<IReadOnlyList<Choice>> GetChoices() =>
        Ok(Choice.All);

    [HttpGet("/choice")]
    [ProducesResponseType(StatusCodes.Status502BadGateway)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<ActionResult<Choice>> GetRandomChoice()
    {
        var choice = await _randomApiService.GetComputerChoiceAsync();
        return Ok(choice);
    }

    [HttpPost("/play")]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status502BadGateway)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<ActionResult<PlayResult>> Play([FromBody] PlayRequestDto request) =>
        Ok(await _playService.PlayAsync(request.Player, request.Username));

    [HttpGet("/scoreboard")]
    public async Task<ActionResult<IReadOnlyList<ScoreboardEntry>>> GetScoreboard() =>
        Ok(await _scoreboardService.GetRecentAsync());

    [HttpDelete("/scoreboard")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> ClearScoreboard()
    {
        await _scoreboardService.ClearAsync();
        return NoContent();
    }
}
