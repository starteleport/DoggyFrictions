using DoggyFrictions.ExternalApi.Models;
using DoggyFrictions.ExternalApi.Services.Repository.Models;

namespace DoggyFrictions.ExternalApi.Services.Repository;

internal static class MongoContractMapping
{
    public static string GetOrCreateId(string? id) => EntityId.IsNew(id) ? Guid.NewGuid().ToString() : id!;

    public static Session FromModel(this SessionModel model)
    {
        return new Session
        {
            Id = model.Id,
            Name = model.Name,
            Participants = model.Participants.Select(FromModel).ToList()
        };
    }

    // Collections are materialised: a lazy Select would generate new ids on every enumeration.
    public static SessionModel ToModel(this Session model)
    {
        return new SessionModel
        {
            Id = GetOrCreateId(model.Id),
            Name = model.Name,
            Participants = model.Participants.Select(ToModel).ToList()
        };
    }

    public static Participant FromModel(this ParticipantModel model)
    {
        return new Participant
        {
            Id = model.Id,
            Name = model.Name
        };
    }

    public static ParticipantModel ToModel(this Participant model)
    {
        return new ParticipantModel
        {
            Id = GetOrCreateId(model.Id),
            Name = model.Name
        };
    }

    public static ActionObject FromModel(this ActionModel model)
    {
        return new ActionObject
        {
            Id = model.Id,
            SessionId = model.SessionId,
            Description = model.Description,
            Date = model.Date,
            Payers = model.Payers.Select(FromModel).ToList(),
            Consumptions = model.Consumptions.Select(FromModel).ToList()
        };
    }

    public static ActionModel ToModel(this ActionObject model)
    {
        return new ActionModel
        {
            Id = GetOrCreateId(model.Id),
            SessionId = model.SessionId,
            Description = model.Description,
            Date = model.Date,
            Payers = model.Payers.Select(ToModel).ToList(),
            Consumptions = model.Consumptions.Select(ToModel).ToList()
        };
    }

    public static Payer FromModel(this PayerModel model)
    {
        return new Payer
        {
            Amount = model.Amount,
            ParticipantId = model.ParticipantId
        };
    }

    public static PayerModel ToModel(this Payer model)
    {
        return new PayerModel
        {
            Amount = model.Amount,
            ParticipantId = model.ParticipantId
        };
    }

    public static ConsumptionModel ToModel(this Consumption model)
    {
        return new ConsumptionModel
        {
            Amount = model.Amount,
            Description = model.Description,
            Quantity = model.Quantity,
            SplittedEqually = model.SplittedEqually,
            Consumers = model.Consumers.Select(ToModel).ToList()
        };
    }

    public static Consumption FromModel(this ConsumptionModel model)
    {
        return new Consumption
        {
            Amount = model.Amount,
            Description = model.Description,
            Quantity = model.Quantity,
            SplittedEqually = model.SplittedEqually,
            Consumers = model.Consumers.Select(FromModel).ToList()
        };
    }

    public static Consumer FromModel(this ConsumerModel model)
    {
        return new Consumer
        {
            Amount = model.Amount,
            ParticipantId = model.ParticipantId
        };
    }

    public static ConsumerModel ToModel(this Consumer model)
    {
        return new ConsumerModel
        {
            Amount = model.Amount,
            ParticipantId = model.ParticipantId
        };
    }
}