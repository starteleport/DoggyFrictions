using System.Collections.Generic;

namespace DoggyFriction.Models
{
    public class SessionModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public IEnumerable<ParticipantModel> Participants { get; set; }
    }
}