using BillupsCodingChallenge.Application.Interfaces;
using BillupsCodingChallenge.Infrastructure.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Moq;

namespace BillupsCodingChallenge.IntegrationTests;

public class GameApiFactory : WebApplicationFactory<Program>
{
    // Kept open for the lifetime of the factory so the in-memory SQLite database persists.
    private readonly SqliteConnection _connection = new("DataSource=:memory:");

    public readonly Mock<IRandomApiService> RandomApiMock = new();

    public GameApiFactory() => _connection.Open();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<AppDbContext>>();
            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlite(_connection));

            services.RemoveAll<IRandomApiService>();
            services.AddSingleton<IRandomApiService>(RandomApiMock.Object);
        });
    }

    public async Task ResetDatabaseAsync()
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.EnsureCreatedAsync();
        db.ScoreboardEntries.RemoveRange(db.ScoreboardEntries);
        await db.SaveChangesAsync();
    }

    public async Task SeedAsync(Action<AppDbContext> seed)
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        seed(db);
        await db.SaveChangesAsync();
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
            _connection.Dispose();
        base.Dispose(disposing);
    }
}
