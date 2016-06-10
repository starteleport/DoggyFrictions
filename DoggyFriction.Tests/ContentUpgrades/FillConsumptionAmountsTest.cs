using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DoggyFriction.Services;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace DoggyFriction.Tests.ContentUpgrades
{
    [TestClass]
    public class FillConsumptionAmountsTest
    {
        [TestMethod]
        public void Run()
        {
            AppDomain.CurrentDomain.SetData("DataDirectory", @"C:\Users\Сергей\Documents\Visual Studio 2015\Projects\DoggyFriction\DoggyFriction\App_Data");
            var repo = Hub.Repository;
            var sessions = repo.GetSessions();
            var actions = sessions.SelectMany(s => repo.GetActions(s.Id)).ToList();
            var consumptions = actions.SelectMany(a => a.Consumptions);
            foreach (var consumption in consumptions) {
                var totalAmount = consumption.Consumers.Sum(c => c.Amount);
                var consumerCount = consumption.Consumers.Count();
                var part = consumerCount > 0 ? totalAmount / consumerCount : totalAmount;
                consumption.Amount = totalAmount;
                consumption.Quantity = Math.Abs(consumption.Quantity) >= 0.01 ? consumption.Quantity : 1d;
                consumption.SplittedEqually = consumption.Consumers.All(c => Math.Abs(c.Amount - part) <= 0.5m);
            }
            foreach (var action in actions) {
                repo.UpdateAction(action.SessionId, action);
            }
            Assert.IsTrue(true);
        }
    }
}
