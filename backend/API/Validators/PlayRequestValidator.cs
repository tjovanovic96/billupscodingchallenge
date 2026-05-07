using BillupsCodingChallenge.API.DTOs;
using FluentValidation;

namespace BillupsCodingChallenge.API.Validators;

public class PlayRequestValidator : AbstractValidator<PlayRequestDto>
{
    public PlayRequestValidator()
    {
        RuleFor(x => x.Player)
            .InclusiveBetween(1, 5)
            .WithMessage("Player choice must be between 1 (Rock) and 5 (Spock).");

        When(x => x.Username is not null, () =>
        {
            RuleFor(x => x.Username)
                .NotEmpty()
                .WithMessage("Username must not be empty.")
                .MaximumLength(50)
                .WithMessage("Username must not exceed 50 characters.");
        });
    }
}
