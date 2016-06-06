using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DoggyFriction.Models
{
    public class SessionModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public IEnumerable<ParticipantModel> Participants { get; set; }
        public IEnumerable<TagModel> Tags { get; set; }
    }

    public class TagModel
    {
        public int Id { get; set; }
        public int SessionId { get; set; }
        public string Name { get; set; }
        public string Color { get; set; }
    }
}