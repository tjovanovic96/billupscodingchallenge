using BillupsCodingChallenge.Application.Interfaces;
using BillupsCodingChallenge.Application.Models;
using BillupsCodingChallenge.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BillupsCodingChallenge.Application.Services;

public class ScoreboardService(AppDbContext db) : IScoreboardService
{
    public async Task AddAsync(ScoreboardEntry entry)
    {
        db.ScoreboardEntries.Add(entry);
        await db.SaveChangesAsync();
    }

    public async Task<IReadOnlyList<ScoreboardEntry>> GetRecentAsync(int count = 10) =>
        await db.ScoreboardEntries
            .OrderByDescending(e => e.PlayedAtUtc)
            .Take(count)
            .ToListAsync();

    public async Task ClearAsync()
    {
        await db.ScoreboardEntries.ExecuteDeleteAsync();
    }
}
