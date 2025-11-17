namespace DoggyFrictions.ExternalApi.Services.Repository.Models;

[MongoDB.Bson.Serialization.Attributes.BsonIgnoreExtraElements]
public class ActionModel
{
    public string Id { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string SessionId { get; set; } = null!;
    public string PayerId { get; set; } = null!;
    public decimal Amount { get; set; }
    public IEnumerable<ConsumerModel> Consumers { get; set; } = new List<ConsumerModel>();
}

[MongoDB.Bson.Serialization.Attributes.BsonIgnoreExtraElements]
public class ConsumerModel
{
    public string ParticipantId { get; set; } = null!;
    public decimal Amount { get; set; }
}

[MongoDB.Bson.Serialization.Attributes.BsonIgnoreExtraElements]
public class PayerModel
{
    public string ParticipantId { get; set; } = null!;
    public decimal Amount { get; set; }
}