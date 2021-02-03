using System;
using System.Linq;
using System.Threading.Tasks;
using DoggyFriction.Models;
using DoggyFriction.Services;
using MongoDB.Driver;
using NUnit.Framework;
using Ploeh.AutoFixture;

namespace DoggyFriction.Tests.Services.Repository
{
    [TestFixture]
    public class MongoDbTest
    {
        MongoClient client;
        private Fixture fixture;
        
        [SetUp]
        public void SetUp()
        {
            fixture = new Fixture();
            fixture.Customize<decimal>(c => c.FromFactory<int>(i => Math.Round(Math.Abs(i) * 1.33m, 2)));
            var connectionString = "mongodb+srv://mngAppUser:MSrtO5mnxAXcyWjP@appharbor-8175tg8z.6mc0f.mongodb.net/appharbor-8175tg8z?retryWrites=true&w=majority";
            client = new MongoClient(connectionString);
        }

        [Test, Explicit]
        public async Task CRUD_Test()
        {
            var db = client.GetDatabase("doggyfrictions-test");

            await db.DropCollectionAsync("Session");

            var sessions = await db.GetCollection<Session>("Session")
                .Find(new ExpressionFilterDefinition<Session>(s => s.Id == 67.ToString()))
                .ToListAsync();
            Assert.That(sessions, Is.Empty);

            await db.GetCollection<Session>("Session")
                .InsertManyAsync(new[] {
                    new Session {
                        Id = 100.ToString(),
                        Name = "Васечка",
                    },
                    new Session {
                        Id = 67.ToString(),
                        Name = "Педро!",
                        Participants = new Participant[] {
                            new Participant {
                                Id = 7.ToString(),
                                Name = "Шусилий"
                            }
                        }
                    }
                });

            sessions = await db.GetCollection<Session>("Session")
                .Find(new ExpressionFilterDefinition<Session>(s => s.Id == 67.ToString()))
                .ToListAsync();
            Assert.That(sessions, Is.Not.Empty);
            Assert.That(sessions.Count, Is.EqualTo(1));
            Assert.That(sessions.Single().Name, Is.EqualTo("Педро!"));
            Assert.That(sessions.Single().Participants.Count(), Is.EqualTo(1));
            Assert.That(sessions.Single().Participants.Single().Name, Is.EqualTo("Шусилий"));

            await db.GetCollection<Session>("Session")
                .DeleteManyAsync(new ExpressionFilterDefinition<Session>(s => s.Id == 100.ToString() || s.Id == 67.ToString()));
            
            sessions = await db.GetCollection<Session>("Session")
                .Find(new ExpressionFilterDefinition<Session>(s => s.Id == 67.ToString()))
                .ToListAsync();
            Assert.That(sessions, Is.Empty);
        }
    }
}
