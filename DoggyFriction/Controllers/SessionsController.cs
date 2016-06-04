using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using DoggyFriction.Models;

namespace DoggyFriction.Controllers
{
    public class SessionsController : ApiController
    {
        private SessionModel sessionModel = new SessionModel {
            Id = 1,
            Name = "Назад в будущее",
            Participants = new[] {
                new ParticipantModel {
                    Id = 0,
                    Name = "Эмметт Браун",
                    Balance = 42m
                },
                new ParticipantModel {
                    Id = 1,
                    Name = "Марти",
                    Balance = 1.34m
                },
                new ParticipantModel {
                    Id = 2,
                    Name = "Бифф",
                    Balance = -43.34m
                },
            }
        };

        // GET: api/Sessions
        public IEnumerable<SessionModel> Get()
        {
            return new[] {
                sessionModel,
                sessionModel
            };
        }

        // GET: api/Sessions/5
        public SessionModel Get(int id)
        {
            return sessionModel;
        }

        // POST: api/Sessions
        public void Post([FromBody]string value)
        {
        }

        // PUT: api/Sessions/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE: api/Sessions/5
        public void Delete(int id)
        {
        }
    }
}
