using BillupsCodingChallenge.Application.Models;
using Microsoft.EntityFrameworkCore;

namespace BillupsCodingChallenge.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<ScoreboardEntry> ScoreboardEntries => Set<ScoreboardEntry>();
}
