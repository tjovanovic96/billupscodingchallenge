using BillupsCodingChallenge.Application.Models;
using BillupsCodingChallenge.Application.Services;
using Xunit;

namespace BillupsCodingChallenge.UnitTests;

public class GameServiceTests
{
    private readonly GameService _sut = new();

    [Theory]
    [InlineData(ChoiceType.Rock)]
    [InlineData(ChoiceType.Paper)]
    [InlineData(ChoiceType.Scissors)]
    [InlineData(ChoiceType.Lizard)]
    [InlineData(ChoiceType.Spock)]
    public void DetermineOutcome_SameChoice_ReturnsTie(ChoiceType choice)
    {
        var outcome = _sut.DetermineOutcome(choice, choice);

        Assert.Equal(GameOutcome.Tie, outcome);
    }

    [Theory]
    [InlineData(ChoiceType.Rock,     ChoiceType.Scissors)]
    [InlineData(ChoiceType.Rock,     ChoiceType.Lizard)]
    [InlineData(ChoiceType.Paper,    ChoiceType.Rock)]
    [InlineData(ChoiceType.Paper,    ChoiceType.Spock)]
    [InlineData(ChoiceType.Scissors, ChoiceType.Paper)]
    [InlineData(ChoiceType.Scissors, ChoiceType.Lizard)]
    [InlineData(ChoiceType.Lizard,   ChoiceType.Spock)]
    [InlineData(ChoiceType.Lizard,   ChoiceType.Paper)]
    [InlineData(ChoiceType.Spock,    ChoiceType.Scissors)]
    [InlineData(ChoiceType.Spock,    ChoiceType.Rock)]
    public void DetermineOutcome_PlayerBeatsComputer_ReturnsWin(ChoiceType player, ChoiceType computer)
    {
        var outcome = _sut.DetermineOutcome(player, computer);

        Assert.Equal(GameOutcome.Win, outcome);
    }

    [Theory]
    [InlineData(ChoiceType.Scissors, ChoiceType.Rock)]
    [InlineData(ChoiceType.Lizard,   ChoiceType.Rock)]
    [InlineData(ChoiceType.Rock,     ChoiceType.Paper)]
    [InlineData(ChoiceType.Spock,    ChoiceType.Paper)]
    [InlineData(ChoiceType.Paper,    ChoiceType.Scissors)]
    [InlineData(ChoiceType.Lizard,   ChoiceType.Scissors)]
    [InlineData(ChoiceType.Spock,    ChoiceType.Lizard)]
    [InlineData(ChoiceType.Paper,    ChoiceType.Lizard)]
    [InlineData(ChoiceType.Scissors, ChoiceType.Spock)]
    [InlineData(ChoiceType.Rock,     ChoiceType.Spock)]
    public void DetermineOutcome_ComputerBeatsPlayer_ReturnsLose(ChoiceType player, ChoiceType computer)
    {
        var outcome = _sut.DetermineOutcome(player, computer);

        Assert.Equal(GameOutcome.Lose, outcome);
    }
}
