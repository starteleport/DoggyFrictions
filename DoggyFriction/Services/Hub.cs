using DoggyFriction.Services.Repository;

namespace DoggyFriction.Services
{
    public static class Hub
    {
        public static IRepository Repository = new MongoRepository();
        public static IRepository CachedRepository = Repository;
        public static IDebtService DebtService = new DebtService();
    }
}