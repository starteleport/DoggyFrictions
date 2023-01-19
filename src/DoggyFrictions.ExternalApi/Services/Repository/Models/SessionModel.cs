namespace DoggyFrictions.ExternalApi.Services.Repository.Models;

public class SessionModel
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public IEnumerable<ParticipantModel> Participants { get; set; } = null!;
}

public class ParticipantModel
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
}