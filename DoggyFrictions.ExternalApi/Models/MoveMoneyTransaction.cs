using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace DoggyFrictions.ExternalApi.Models
{
    public class MoveMoneyTransaction
    {
        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }

        [Required]
        public string From { get; set; }

        [Required]
        public string To { get; set; }

        public string Reason { get; set; }
        public DateTime? Date { get; set; }
    }
}