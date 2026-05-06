using BillupsCodingChallenge.Application.Interfaces;
using BillupsCodingChallenge.Application.Models;

namespace BillupsCodingChallenge.Application.Services;

public class GameService : IGameService
{
    // Rock crushes Lizard/Scissors
    // Paper covers Rock/Spock
    // Scissors cuts Paper/Lizard
    // Lizard poisons Spock/Paper
    // Spock smashes Scissors/Rock
    private static readonly Dictionary<ChoiceType, HashSet<ChoiceType>> WinConditions = new()
    {
        [ChoiceType.Rock]     = [ChoiceType.Lizard, ChoiceType.Scissors],
        [ChoiceType.Paper]    = [ChoiceType.Rock, ChoiceType.Spock],
        [ChoiceType.Scissors] = [ChoiceType.Paper, ChoiceType.Lizard],
        [ChoiceType.Lizard]   = [ChoiceType.Spock, ChoiceType.Paper],
        [ChoiceType.Spock]    = [ChoiceType.Scissors, ChoiceType.Rock],
    };

    public GameOutcome DetermineOutcome(ChoiceType playerChoice, ChoiceType computerChoice)
    {
        if (playerChoice == computerChoice)
            return GameOutcome.Tie;

        return WinConditions[playerChoice].Contains(computerChoice)
            ? GameOutcome.Win
            : GameOutcome.Lose;
    }
}
