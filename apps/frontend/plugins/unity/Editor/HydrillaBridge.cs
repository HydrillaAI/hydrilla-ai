#if UNITY_EDITOR
using System;
using System.Collections.Concurrent;
using System.IO;
using System.Net;
using System.Text;
using System.Threading;
using UnityEditor;
using UnityEngine;

namespace Hydrilla
{
    /// <summary>
    /// A small local server so Hydrilla Studio and the Hydrilla MCP server can send a mesh
    /// into this project. It carries no account data and accepts no credentials.
    ///
    /// It listens on 127.0.0.1 only. Requests from a web page are accepted only from
    /// Hydrilla's own sites, because any page open in a browser can reach localhost.
    /// </summary>
    [InitializeOnLoad]
    static class HydrillaBridge
    {
        const string SessionKey = "Hydrilla.BridgeOn";
        const string ServiceName = "hydrilla-bridge";
        const string App = "unity";
        const int ProtocolVersion = 2;
        const long MaxMeshBytes = 200L * 1024 * 1024;
        // Base64 adds a third; leave room for the JSON around it.
        const long MaxBodyBytes = MaxMeshBytes / 10 * 14 + 64 * 1024;
        const int MaxQueued = 25;

        static readonly string[] AllowedOrigins =
        {
            "https://hydrilla.ai",
            "https://www.hydrilla.ai",
            "https://hydrilla.co",
            "https://www.hydrilla.co",
        };

        [Serializable]
        class ImportPayload
        {
            public string file_base64;
            public string mesh_url;
            public string url;
            public string name;
            public string job_id;
        }

        class Incoming
        {
            public byte[] bytes;
            public string meshUrl;
            public string name;
        }

        static readonly ConcurrentQueue<Incoming> Queue = new ConcurrentQueue<Incoming>();
        static HttpListener listener;
        static Thread thread;

        /// <summary>Last thing that happened, shown in the Hydrilla window.</summary>
        public static string Message = "";

        public static bool IsRunning
        {
            get { return listener != null && listener.IsListening; }
        }

        static HydrillaBridge()
        {
            // Unity reloads scripts often; the socket must be released first and reopened after.
            AssemblyReloadEvents.beforeAssemblyReload += StopListener;
            EditorApplication.quitting += StopListener;
            EditorApplication.update += Drain;
            if (SessionState.GetBool(SessionKey, false))
            {
                Start();
            }
        }

        public static bool Start()
        {
            if (IsRunning)
            {
                return true;
            }
            var created = new HttpListener();
            created.Prefixes.Add("http://" + HydrillaSettings.BridgeHost + ":" + HydrillaSettings.BridgePort + "/");
            created.Prefixes.Add("http://localhost:" + HydrillaSettings.BridgePort + "/");
            try
            {
                created.Start();
            }
            catch (Exception error)
            {
                Message = "Bridge could not start. Port " + HydrillaSettings.BridgePort
                    + " is in use, possibly by another Unity window (" + error.Message + ").";
                SessionState.SetBool(SessionKey, false);
                return false;
            }
            listener = created;
            thread = new Thread(() => Listen(created)) { IsBackground = true, Name = "HydrillaBridge" };
            thread.Start();
            SessionState.SetBool(SessionKey, true);
            Message = "Ready to receive models (port " + HydrillaSettings.BridgePort + ").";
            return true;
        }

        public static void Stop()
        {
            SessionState.SetBool(SessionKey, false);
            StopListener();
            Message = "";
        }

        static void StopListener()
        {
            var current = listener;
            listener = null;
            thread = null;
            if (current == null)
            {
                return;
            }
            try
            {
                current.Close();
            }
            catch (Exception)
            {
                // The socket is being torn down either way.
            }
        }

        static void Listen(HttpListener active)
        {
            while (active.IsListening)
            {
                HttpListenerContext context;
                try
                {
                    context = active.GetContext();
                }
                catch (Exception)
                {
                    // Closing the listener ends the wait; that is the normal way out.
                    return;
                }
                ThreadPool.QueueUserWorkItem(_ => Handle(context));
            }
        }

        static bool IsLoopbackName(string host)
        {
            return host == "localhost" || host == "127.0.0.1" || host == "::1" || host == "[::1]";
        }

        /// <summary>No Origin header means a local program, not a web page, which is allowed.</summary>
        static bool IsOriginAllowed(string origin)
        {
            if (string.IsNullOrEmpty(origin))
            {
                return true;
            }
            var cleaned = origin.Trim().TrimEnd('/');
            foreach (var allowed in AllowedOrigins)
            {
                if (cleaned == allowed)
                {
                    return true;
                }
            }
            // A site served from this machine (local development) may also send.
            Uri uri;
            return Uri.TryCreate(cleaned, UriKind.Absolute, out uri)
                && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps)
                && IsLoopbackName(uri.Host.ToLowerInvariant());
        }

        /// <summary>Reject names that merely resolve to this machine (DNS rebinding).</summary>
        static bool IsHostAllowed(string hostHeader)
        {
            var host = (hostHeader ?? "").Trim().ToLowerInvariant();
            if (host.Length == 0)
            {
                return false;
            }
            if (host.StartsWith("["))
            {
                var end = host.IndexOf(']');
                return end > 0 && IsLoopbackName(host.Substring(1, end - 1));
            }
            var colon = host.LastIndexOf(':');
            return IsLoopbackName(colon > 0 ? host.Substring(0, colon) : host);
        }

        static void Reply(HttpListenerContext context, int status, string json)
        {
            try
            {
                var response = context.Response;
                var origin = context.Request.Headers["Origin"];
                if (!string.IsNullOrEmpty(origin) && IsOriginAllowed(origin))
                {
                    response.AddHeader("Access-Control-Allow-Origin", origin);
                    response.AddHeader("Vary", "Origin");
                    response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                    response.AddHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
                    // Browsers ask before letting a public site reach a local address.
                    response.AddHeader("Access-Control-Allow-Private-Network", "true");
                    response.AddHeader("Access-Control-Max-Age", "600");
                }
                var bytes = Encoding.UTF8.GetBytes(json ?? "");
                response.StatusCode = status;
                response.ContentType = "application/json";
                response.ContentLength64 = bytes.Length;
                if (bytes.Length > 0)
                {
                    response.OutputStream.Write(bytes, 0, bytes.Length);
                }
                response.Close();
            }
            catch (Exception)
            {
                // The sender went away before the reply; nothing to report to.
            }
        }

        static string ErrorJson(string error)
        {
            return "{\"ok\":false,\"status\":\"error\",\"error\":\"" + error + "\"}";
        }

        static void Handle(HttpListenerContext context)
        {
            try
            {
                var request = context.Request;
                if (!IsHostAllowed(request.Headers["Host"]))
                {
                    Reply(context, 403, ErrorJson("host_not_allowed"));
                    return;
                }
                if (!IsOriginAllowed(request.Headers["Origin"]))
                {
                    Reply(context, 403, ErrorJson("origin_not_allowed"));
                    return;
                }
                if (request.HttpMethod == "OPTIONS")
                {
                    Reply(context, 204, "");
                    return;
                }

                var path = request.Url.AbsolutePath;
                if (request.HttpMethod == "GET" && (path == "/health" || path == "/status" || path == "/ping"))
                {
                    Reply(context, 200,
                        "{\"ok\":true,\"status\":\"ok\",\"service\":\"" + ServiceName + "\",\"protocol\":" + ProtocolVersion
                        + ",\"version\":\"" + HydrillaSettings.Version + "\",\"app\":\"" + App + "\",\"pending\":" + Queue.Count + "}");
                    return;
                }
                if (request.HttpMethod == "POST" && (path == "/import" || path == "/import-file"))
                {
                    Receive(context);
                    return;
                }
                Reply(context, 404, ErrorJson("not_found"));
            }
            catch (Exception error)
            {
                Debug.LogWarning("[Hydrilla] Bridge request failed: " + error.Message);
                Reply(context, 500, ErrorJson("internal_error"));
            }
        }

        static void Receive(HttpListenerContext context)
        {
            var request = context.Request;
            if (request.ContentLength64 > MaxBodyBytes)
            {
                Reply(context, 413, ErrorJson("request too large"));
                return;
            }
            if (Queue.Count >= MaxQueued)
            {
                Reply(context, 429, ErrorJson("too many meshes waiting to be imported"));
                return;
            }

            string body;
            using (var reader = new StreamReader(request.InputStream, Encoding.UTF8))
            {
                body = reader.ReadToEnd();
            }
            ImportPayload payload;
            try
            {
                payload = JsonUtility.FromJson<ImportPayload>(body);
            }
            catch (Exception)
            {
                payload = null;
            }
            if (payload == null)
            {
                Reply(context, 400, ErrorJson("body must be a JSON object"));
                return;
            }

            var name = HydrillaApi.SafeName(!string.IsNullOrEmpty(payload.name) ? payload.name : payload.job_id);
            if (!string.IsNullOrEmpty(payload.file_base64))
            {
                byte[] bytes;
                try
                {
                    bytes = Convert.FromBase64String(payload.file_base64);
                }
                catch (FormatException)
                {
                    Reply(context, 400, ErrorJson("file_base64 is not valid base64"));
                    return;
                }
                if (bytes.LongLength > MaxMeshBytes)
                {
                    Reply(context, 413, ErrorJson("mesh file too large"));
                    return;
                }
                if (!HydrillaApi.IsGlb(bytes))
                {
                    Reply(context, 415, ErrorJson("only GLB meshes are accepted"));
                    return;
                }
                Queue.Enqueue(new Incoming { bytes = bytes, name = name });
            }
            else
            {
                var meshUrl = !string.IsNullOrEmpty(payload.mesh_url) ? payload.mesh_url : payload.url;
                if (string.IsNullOrEmpty(meshUrl))
                {
                    Reply(context, 400, ErrorJson("mesh_url or file_base64 is required"));
                    return;
                }
                if (!HydrillaApi.IsMeshUrlAllowed(meshUrl))
                {
                    Reply(context, 400, ErrorJson("mesh_url must be an https address"));
                    return;
                }
                Queue.Enqueue(new Incoming { meshUrl = meshUrl, name = name });
            }
            Reply(context, 200, "{\"ok\":true,\"status\":\"ok\",\"app\":\"" + App + "\"}");
        }

        /// <summary>Editor main thread: bring received meshes into the project.</summary>
        static void Drain()
        {
            Incoming item;
            while (Queue.TryDequeue(out item))
            {
                if (item.bytes != null)
                {
                    try
                    {
                        Message = HydrillaApi.SaveMesh(item.bytes, item.name);
                    }
                    catch (Exception error)
                    {
                        Message = "Could not import the model sent to Unity: " + error.Message;
                    }
                }
                else
                {
                    HydrillaCoroutine.Start(HydrillaApi.DownloadMesh(
                        item.meshUrl, item.name, saved => Message = saved, failed => Message = failed));
                }
            }
        }
    }
}
#endif
