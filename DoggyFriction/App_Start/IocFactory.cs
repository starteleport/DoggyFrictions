using DoggyFriction.Services;
using DoggyFriction.Services.Repository;
using StructureMap;

namespace DoggyFriction
{
    public class IocFactory
    {
        private static volatile Container _container;
        private static readonly object Lock = new object();

        public static Container GetContainer()
        {
            if (_container != null)
                return _container;

            lock (Lock)
                if (_container == null)
                    _container = InitContainer();

            return _container;
        }

        private static Container InitContainer() => new Container(cfg =>
        {
            cfg.Scan(scan =>
            {
                scan.AssembliesAndExecutablesFromApplicationBaseDirectory();
                scan.RegisterConcreteTypesAgainstTheFirstInterface();
            });

            cfg.ForSingletonOf<IRepository>().Use<CachedRepository>();
        });
    }
}