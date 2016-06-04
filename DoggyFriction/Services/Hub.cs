using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using DoggyFriction.Services.Repository;

namespace DoggyFriction.Services
{
    public static class Hub
    {
        public static IRepository Repository = new JsonFileRepository();
    }
}