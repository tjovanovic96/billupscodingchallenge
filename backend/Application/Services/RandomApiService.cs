using System.Text.Json.Serialization;
using BillupsCodingChallenge.Application.Interfaces;
using BillupsCodingChallenge.Application.Models;

namespace BillupsCodingChallenge.Application.Services;

public class RandomApiService : IRandomApiService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<RandomApiService> _logger;

    public RandomApiService(HttpClient httpClient, ILogger<RandomApiService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<Choice> GetComputerChoiceAsync()
    {
        try
        {
            var response = await _httpClient.GetFromJsonAsync<RandomResponse>("random")
                ?? throw new InvalidOperationException("No response from random number API.");

            _logger.LogDebug("Random API returned {RandomNumber}", response.RandomNumber);

            // Map 1-100 to 1-5: 1-20→1, 21-40→2, 41-60→3, 61-80→4, 81-100→5
            var choiceId = (response.RandomNumber - 1) / 20 + 1;
            var choice = Choice.FromChoiceType((ChoiceType)choiceId);

            _logger.LogDebug("Mapped {RandomNumber} to {Choice}", response.RandomNumber, choice.Name);

            return choice;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Random API failed. Falling back to local random.");
            return Choice.FromChoiceType((ChoiceType)Random.Shared.Next(1, 6));
        }
    }

    private record RandomResponse([property: JsonPropertyName("random_number")] int RandomNumber);
}
