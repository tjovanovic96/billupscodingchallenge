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

    /// <summary>Returns all available choices (Rock, Paper, Scissors, Lizard, Spock).</summary>
    [HttpGet("/choices")]
    public ActionResult<IReadOnlyList<Choice>> GetChoices() =>
        Ok(Choice.All);

    /// <summary>Returns a randomly selected computer choice using the external random number API, with local random fallback.</summary>
    [HttpGet("/choice")]
    public async Task<ActionResult<Choice>> GetRandomChoice()
    {
        var choice = await _randomApiService.GetComputerChoiceAsync();
        return Ok(choice);
    }

    /// <summary>Plays a round of Rock Paper Scissors Lizard Spock and records the result to the scoreboard.</summary>
    [HttpPost("/play")]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PlayResult>> Play([FromBody] PlayRequestDto request) =>
        Ok(await _playService.PlayAsync(request.Player, request.Username));

    /// <summary>Returns the 10 most recent scoreboard entries.</summary>
    [HttpGet("/scoreboard")]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IReadOnlyList<ScoreboardEntry>>> GetScoreboard() =>
        Ok(await _scoreboardService.GetRecentAsync());

    /// <summary>Clears all scoreboard entries.</summary>
    [HttpDelete("/scoreboard")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ClearScoreboard()
    {
        await _scoreboardService.ClearAsync();
        return NoContent();
    }
}
