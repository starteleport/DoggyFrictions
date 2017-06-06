using System;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace DoggyFriction
{
    public static class WarmupWorker
    {
        private static string[] _hosts = { "http://doggyfrictions.apphb.com", "http://doggymirror.apphb.com" };
        private static int _requestTimeout = 5 * 1000;
        private static int _requestDelay = 5 * 60 * 1000;

        public static void Start()
        {
            Action sendingAction = () =>
            {
                while (true)
                {
                    try
                    {
                        PingHosts();
                    }
                    catch (Exception e)
                    {
                    }
                    finally
                    {
                        Task.Delay(_requestDelay).Wait();
                    }
                }
            };
            Task.Run(sendingAction);
        }

        private static void PingHosts()
        {
            var httpClient = new HttpClient();
            foreach (var host in _hosts)
            {
                var request = new HttpRequestMessage
                {
                    RequestUri = new Uri(host + "/api/warmup"),
                    Method = HttpMethod.Get
                };
                using (var cancelationToken = new CancellationTokenSource())
                {
                    var sendingTask = httpClient.SendAsync(request, cancelationToken.Token);
                    sendingTask.Wait(_requestTimeout, cancelationToken.Token);
                    if (!sendingTask.IsCompleted)
                    {
                        cancelationToken.Cancel();
                    }
                }
            }
        }
    }
}