using System.ComponentModel.DataAnnotations;

namespace BillupsCodingChallenge.Application.Models;

public class ScoreboardEntry
{
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public required string Username { get; set; }

    public required int PlayerChoiceId { get; set; }
    public required int ComputerChoiceId { get; set; }

    [Required]
    [MaxLength(10)]
    public required string Result { get; set; }

    public required DateTime PlayedAtUtc { get; set; }
}
