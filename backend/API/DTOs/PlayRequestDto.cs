using System.ComponentModel.DataAnnotations;

namespace BillupsCodingChallenge.API.DTOs;

public class PlayRequestDto
{
    [MaxLength(50, ErrorMessage = "Username must not exceed 50 characters.")]
    public string? Username { get; init; }

    [Required]
    [Range(1, 5, ErrorMessage = "Player choice must be between 1 (Rock) and 5 (Spock).")]
    public int Player { get; init; }
}
