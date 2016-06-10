using System;
using System.Collections.Generic;

namespace DoggyFriction.Domain
{
    public class Action
    {
        public DateTime Date { get; set; }
        public string Description { get; set; }
        public IEnumerable<Participation> Sponsors { get; set; }
        public IEnumerable<Consumption> Consumptions { get; set; }
    }
}