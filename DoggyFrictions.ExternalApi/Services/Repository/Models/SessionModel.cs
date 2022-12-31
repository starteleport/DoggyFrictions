namespace DoggyFrictions.ExternalApi.Services.Repository.Models;

public class SessionModel
{
    public string Id { get; set; }
    public string Name { get; set; }
    public IEnumerable<ParticipantModel> Participants { get; set; }
}

public class ParticipantModel
{
    public string Id { get; set; }
    public string Name { get; set; }
}