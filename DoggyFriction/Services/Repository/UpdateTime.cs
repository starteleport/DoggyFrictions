using System;

namespace DoggyFriction.Services.Repository
{
    public class UpdateTime
    {
        public string Id { get; set; }
        public string TableName { get; set; }
        public DateTime UpdatedOn { get; set; }
    }
}