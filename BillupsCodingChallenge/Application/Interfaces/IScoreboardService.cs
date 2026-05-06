using BillupsCodingChallenge.Application.Models;

namespace BillupsCodingChallenge.Application.Interfaces;

public interface IScoreboardService
{
    Task AddAsync(ScoreboardEntry entry);
    Task<IReadOnlyList<ScoreboardEntry>> GetRecentAsync(int count = 10);
    Task ClearAsync();
}
