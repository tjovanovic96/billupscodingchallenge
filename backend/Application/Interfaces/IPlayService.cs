using BillupsCodingChallenge.Application.Models;

namespace BillupsCodingChallenge.Application.Interfaces;

public interface IPlayService
{
    Task<PlayResult> PlayAsync(int playerChoiceId, string? username);
}
