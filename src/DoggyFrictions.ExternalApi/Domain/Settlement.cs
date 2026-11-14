namespace DoggyFrictions.ExternalApi.Domain;

/// <summary>What one participant has to pay another to settle a session; participants are given by id.</summary>
public record Settlement(string DebtorId, string CreditorId, decimal Amount);
