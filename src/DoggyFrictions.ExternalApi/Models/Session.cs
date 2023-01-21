using System.ComponentModel.DataAnnotations;

namespace DoggyFrictions.ExternalApi.Models;

public class Session
{
    public string Id { get; set; }
    [Required(ErrorMessage = "Please specify session name")]
    public string Name { get; set; }
    [Required(ErrorMessage = "Please specify at least one participant")]
    public IEnumerable<Participant> Participants { get; set; }
}