namespace BillupsCodingChallenge.Application.Models;

public enum GameOutcome
{
    Win,
    Lose,
    Tie
}

public class PlayResult
{
    public required string Username { get; init; }
    public required GameOutcome Results { get; init; }
    public required int Player { get; init; }
    public required int Computer { get; init; }
}
