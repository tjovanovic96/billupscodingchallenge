namespace BillupsCodingChallenge.Application.Models;

public class Choice
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;

    public static Choice FromChoiceType(ChoiceType type) => new()
    {
        Id = (int)type,
        Name = type.ToString()
    };

    public static IReadOnlyList<Choice> All =>
        Enum.GetValues<ChoiceType>()
            .Select(FromChoiceType)
            .ToList();
}
