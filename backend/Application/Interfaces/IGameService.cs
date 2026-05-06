using BillupsCodingChallenge.Application.Models;

namespace BillupsCodingChallenge.Application.Interfaces;

public interface IGameService
{
    GameOutcome DetermineOutcome(ChoiceType playerChoice, ChoiceType computerChoice);
}
