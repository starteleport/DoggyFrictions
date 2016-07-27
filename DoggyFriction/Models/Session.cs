using System.Collections.Generic;

namespace DoggyFriction.Models
{
    public class Session
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public IEnumerable<Participant> Participants { get; set; }
    }
}