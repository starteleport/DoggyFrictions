using System.Web.Mvc;

namespace DoggyFriction
{
    public class ContainerConfig
    {
        public static void ArrangeMvcDependencyResolver()
        {
            var dependencyResolver = new StructureMapResolver(IocFactory.GetContainer());
            DependencyResolver.SetResolver(dependencyResolver);
        }
    }
}