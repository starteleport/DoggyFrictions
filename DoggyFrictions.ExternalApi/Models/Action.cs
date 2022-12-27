using System;
using System.Collections.Generic;
using DoggyFrictions.ExternalApi.Models;

namespace DoggyFrictions.ExternalApi.Models;

public class Action
{
    public string Id { get; set; }
    public DateTime Date { get; set; }
    public string Description { get; set; }
    public IEnumerable<Payer> Payers { get; set; }
    public IEnumerable<Consumption> Consumptions { get; set; }
    public string SessionId { get; set; }
}