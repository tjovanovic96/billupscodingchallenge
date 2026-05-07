using BillupsCodingChallenge.Application.Interfaces;
using BillupsCodingChallenge.Application.Models;

namespace BillupsCodingChallenge.Application.Services;

public class PlayService : IPlayService
{
    private readonly IGameService _gameService;
    private readonly IRandomApiService _randomApiService;
    private readonly IScoreboardService _scoreboardService;

    public PlayService(IGameService gameService, IRandomApiService randomApiService, IScoreboardService scoreboardService)
    {
        _gameService = gameService;
        _randomApiService = randomApiService;
        _scoreboardService = scoreboardService;
    }

    public async Task<PlayResult> PlayAsync(int playerChoiceId, string? username)
    {
        var playerChoice = Choice.FromChoiceType((ChoiceType)playerChoiceId);
        var computerChoice = await _randomApiService.GetComputerChoiceAsync();
        var outcome = _gameService.DetermineOutcome((ChoiceType)playerChoice.Id, (ChoiceType)computerChoice.Id);
        var resolvedUsername = username ?? "Guest";

        var result = new PlayResult
        {
            Username = resolvedUsername,
            Results = outcome,
            Player = playerChoice.Id,
            Computer = computerChoice.Id
        };

        await _scoreboardService.AddAsync(new ScoreboardEntry
        {
            Username = resolvedUsername,
            PlayerChoiceId = playerChoiceId,
            ComputerChoiceId = computerChoice.Id,
            Result = outcome.ToString(),
            PlayedAtUtc = DateTime.UtcNow
        });

        return result;
    }
}
