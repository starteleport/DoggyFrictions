using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http.Dependencies;
using StructureMap;

namespace DoggyFriction
{
    public class StructureMapResolver : IDependencyResolver, System.Web.Mvc.IDependencyResolver
    {
        private readonly IContainer _container;

        public StructureMapResolver(IContainer container)
        {
            _container = container;
        }

        public object GetService(Type serviceType)
        {
            try
            {
                return _container.GetInstance(serviceType);
            }
            catch (StructureMapException)
            {
                return null;
            }
        }

        public IEnumerable<object> GetServices(Type serviceType)
        {
            try
            {
                return _container.GetAllInstances(serviceType).Cast<object>();
            }
            catch (StructureMapException)
            {
                return Enumerable.Empty<object>();
            }
        }

        public IDependencyScope BeginScope() => new StructureMapResolver(_container.GetNestedContainer());

        public void Dispose()
        {
            _container.Dispose();
        }
    }
}