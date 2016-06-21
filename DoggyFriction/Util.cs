using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DoggyFriction
{
    public static class Util
    {
        public static void ForEach<T>(this IEnumerable<T> enumerable, Action<T> action)
        {
            if (enumerable == null) {
                return;
            }
            foreach (var item  in enumerable) {
                action(item);
            }
        }
    }
}