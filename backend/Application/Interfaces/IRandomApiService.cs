using BillupsCodingChallenge.Application.Models;

namespace BillupsCodingChallenge.Application.Interfaces;

public interface IRandomApiService
{
    Task<Choice> GetComputerChoiceAsync();
}
