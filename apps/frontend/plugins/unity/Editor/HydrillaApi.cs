#if UNITY_EDITOR
using System;
using System.Collections;
using System.IO;
using System.Text;
using UnityEditor;
using UnityEngine;
using UnityEngine.Networking;

namespace Hydrilla
{
    /// <summary>Hydrilla developer API (/v1), authenticated with an API key.</summary>
    static class HydrillaApi
    {
        public const string NoKeyMessage =
            "Add your Hydrilla API key first. Create one at hydrilla.ai/app/api-keys.";
        const string BadKeyMessage =
            "Hydrilla did not accept this API key. Check it, or create a new one at hydrilla.ai/app/api-keys.";

        const int RequestTimeoutSeconds = 60;
        // Text-to-3D creates its concept image before the request returns.
        const int CreateTimeoutSeconds = 240;
        const int DownloadTimeoutSeconds = 300;
        const double PollSeconds = 2.0;
        const double MaxPollSeconds = 25 * 60;
        const int MaxPollFailures = 5;

        [Serializable]
        class TextRequest
        {
            public string prompt;
        }

        [Serializable]
        class ImageRequest
        {
            public string image_url;
        }

        [Serializable]
        class TaskResult
        {
            public string mesh_url;
        }

        [Serializable]
        class TaskResponse
        {
            public string id;
            public string status;
            public float progress;
            public string status_message;
            public TaskResult result;
        }

        [Serializable]
        class TaskFailure
        {
            public string error;
        }

        [Serializable]
        class ErrorBody
        {
            public string message;
        }

        [Serializable]
        class ErrorEnvelope
        {
            public ErrorBody error;
        }

        [Serializable]
        class Credits
        {
            public int remaining;
        }

        [Serializable]
        class Profile
        {
            public string plan;
            public Credits credits;
        }

        /// <summary>Outcome of one request: the body on success, otherwise a message for the user.</summary>
        public class Reply
        {
            public bool ok;
            public long status;
            public string body;
            public string error;
        }

        static UnityWebRequest NewRequest(string method, string path, int timeoutSeconds)
        {
            var request = new UnityWebRequest(HydrillaSettings.ApiBase + path, method);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.timeout = timeoutSeconds;
            request.SetRequestHeader("Accept", "application/json");
            request.SetRequestHeader("Authorization", "Bearer " + HydrillaSettings.ApiKey);
            return request;
        }

        static string ErrorMessage(UnityWebRequest request)
        {
            var status = request.responseCode;
            if (status == 401)
            {
                return BadKeyMessage;
            }
            var body = request.downloadHandler != null ? request.downloadHandler.text : "";
            if (!string.IsNullOrEmpty(body))
            {
                try
                {
                    var envelope = JsonUtility.FromJson<ErrorEnvelope>(body);
                    if (envelope != null && envelope.error != null && !string.IsNullOrEmpty(envelope.error.message))
                    {
                        return envelope.error.message;
                    }
                }
                catch (Exception)
                {
                    // Not the API's error format; fall back to a generic message below.
                }
            }
            if (status == 402)
            {
                return "Not enough credits. Top up at hydrilla.ai.";
            }
            if (status == 429)
            {
                return "Too many requests. Wait a moment and try again.";
            }
            if (status >= 500)
            {
                return "Hydrilla is having trouble right now (" + status + "). Try again shortly.";
            }
            if (status > 0)
            {
                return "Hydrilla API request failed (" + status + ").";
            }
            return "Could not reach the Hydrilla API: " + request.error;
        }

        static IEnumerator Send(UnityWebRequest request, Reply reply)
        {
            if (HydrillaSettings.ApiKey.Length == 0)
            {
                reply.ok = false;
                reply.error = NoKeyMessage;
                request.Dispose();
                yield break;
            }
            using (request)
            {
                yield return request.SendWebRequest();
                reply.status = request.responseCode;
                reply.ok = request.result == UnityWebRequest.Result.Success;
                if (reply.ok)
                {
                    reply.body = request.downloadHandler.text;
                }
                else
                {
                    reply.error = ErrorMessage(request);
                }
            }
        }

        static IEnumerator PostJson(string path, string json, Reply reply)
        {
            var request = NewRequest(UnityWebRequest.kHttpVerbPOST, path, CreateTimeoutSeconds);
            request.uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(json));
            request.SetRequestHeader("Content-Type", "application/json");
            yield return Send(request, reply);
        }

        /// <summary>Check the key and report the credit balance. Free.</summary>
        public static IEnumerator CheckKey(Action<string> onConnected, Action<string> onError)
        {
            var reply = new Reply();
            yield return Send(NewRequest(UnityWebRequest.kHttpVerbGET, "/v1/user/me", RequestTimeoutSeconds), reply);
            if (!reply.ok)
            {
                onError(reply.error);
                yield break;
            }
            var label = "Connected";
            try
            {
                var profile = JsonUtility.FromJson<Profile>(reply.body);
                if (profile != null && profile.credits != null)
                {
                    label = "Connected · " + profile.credits.remaining + " credits";
                }
            }
            catch (Exception)
            {
                // The key works; the balance is a nicety.
            }
            onConnected(label);
        }

        public static IEnumerator GenerateFromText(
            string prompt, Action<string> onStatus, Func<bool> cancelled, Action<string> onSaved, Action<string> onError)
        {
            var reply = new Reply();
            onStatus("Creating the concept image…");
            yield return PostJson("/v1/3d/text-to-3d", JsonUtility.ToJson(new TextRequest { prompt = prompt }), reply);
            yield return Finish(reply, onStatus, cancelled, onSaved, onError);
        }

        public static IEnumerator GenerateFromImageUrl(
            string imageUrl, Action<string> onStatus, Func<bool> cancelled, Action<string> onSaved, Action<string> onError)
        {
            var reply = new Reply();
            onStatus("Sending the image…");
            yield return PostJson("/v1/3d/image-to-3d", JsonUtility.ToJson(new ImageRequest { image_url = imageUrl }), reply);
            yield return Finish(reply, onStatus, cancelled, onSaved, onError);
        }

        public static IEnumerator GenerateFromImageFile(
            string filePath, Action<string> onStatus, Func<bool> cancelled, Action<string> onSaved, Action<string> onError)
        {
            byte[] bytes;
            try
            {
                bytes = File.ReadAllBytes(filePath);
            }
            catch (Exception error)
            {
                onError("Could not read the image: " + error.Message);
                yield break;
            }
            var form = new WWWForm();
            form.AddBinaryData("image", bytes, Path.GetFileName(filePath));
            var request = UnityWebRequest.Post(HydrillaSettings.ApiBase + "/v1/3d/image-to-3d", form);
            request.timeout = CreateTimeoutSeconds;
            request.SetRequestHeader("Accept", "application/json");
            request.SetRequestHeader("Authorization", "Bearer " + HydrillaSettings.ApiKey);

            var reply = new Reply();
            onStatus("Uploading the image…");
            yield return Send(request, reply);
            yield return Finish(reply, onStatus, cancelled, onSaved, onError);
        }

        static TaskResponse ParseTask(string json)
        {
            try
            {
                return JsonUtility.FromJson<TaskResponse>(json) ?? new TaskResponse();
            }
            catch (Exception)
            {
                return new TaskResponse();
            }
        }

        static string FailureReason(string json)
        {
            try
            {
                var failure = JsonUtility.FromJson<TaskFailure>(json);
                if (failure != null && !string.IsNullOrEmpty(failure.error))
                {
                    return failure.error;
                }
            }
            catch (Exception)
            {
                // No readable reason; use the generic one.
            }
            return "Generation failed";
        }

        /// <summary>Wait for the created task, then download its mesh into the project.</summary>
        static IEnumerator Finish(
            Reply created, Action<string> onStatus, Func<bool> cancelled, Action<string> onSaved, Action<string> onError)
        {
            if (!created.ok)
            {
                onError(created.error);
                yield break;
            }
            var taskId = ParseTask(created.body).id;
            if (string.IsNullOrEmpty(taskId))
            {
                onError("Hydrilla did not return a task id.");
                yield break;
            }

            var path = "/v1/3d/tasks/" + UnityWebRequest.EscapeURL(taskId);
            var startedAt = EditorApplication.timeSinceStartup;
            var failures = 0;
            while (true)
            {
                if (cancelled())
                {
                    // Stop the task on the server so unused credits are refunded.
                    yield return Send(NewRequest(UnityWebRequest.kHttpVerbDELETE, path, RequestTimeoutSeconds), new Reply());
                    onError("Cancelled. Unused credits are refunded.");
                    yield break;
                }

                var reply = new Reply();
                yield return Send(NewRequest(UnityWebRequest.kHttpVerbGET, path, RequestTimeoutSeconds), reply);
                if (!reply.ok)
                {
                    // A brief network or server hiccup should not lose a paid task.
                    var retryable = reply.status == 0 || reply.status >= 500;
                    failures++;
                    if (!retryable || failures > MaxPollFailures)
                    {
                        onError(reply.error);
                        yield break;
                    }
                    yield return HydrillaCoroutine.Wait(PollSeconds * 2);
                    continue;
                }
                failures = 0;

                var task = ParseTask(reply.body);
                if (task.status == "SUCCEEDED")
                {
                    var meshUrl = task.result != null ? task.result.mesh_url : null;
                    if (string.IsNullOrEmpty(meshUrl))
                    {
                        onError("The finished task has no mesh.");
                        yield break;
                    }
                    onStatus("Downloading the mesh…");
                    yield return DownloadMesh(meshUrl, taskId, onSaved, onError);
                    yield break;
                }
                if (task.status == "FAILED" || task.status == "CANCELLED")
                {
                    onError(FailureReason(reply.body));
                    yield break;
                }
                onStatus(task.status == "PENDING"
                    ? "Waiting for a GPU…"
                    : "Generating… " + Mathf.RoundToInt(task.progress) + "%");

                if (EditorApplication.timeSinceStartup - startedAt > MaxPollSeconds)
                {
                    onError("The task is still running. Check it later at hydrilla.ai.");
                    yield break;
                }
                yield return HydrillaCoroutine.Wait(PollSeconds);
            }
        }

        public static bool IsMeshUrlAllowed(string url)
        {
            Uri uri;
            if (!Uri.TryCreate(url, UriKind.Absolute, out uri))
            {
                return false;
            }
            if (uri.Scheme == Uri.UriSchemeHttps)
            {
                return true;
            }
            // Plain http is accepted for a server on this machine only.
            return uri.Scheme == Uri.UriSchemeHttp && uri.IsLoopback;
        }

        public static bool IsGlb(byte[] bytes)
        {
            return bytes != null && bytes.Length > 12
                && bytes[0] == (byte)'g' && bytes[1] == (byte)'l' && bytes[2] == (byte)'T' && bytes[3] == (byte)'F';
        }

        /// <summary>Download a GLB and add it to the project. The API key is never sent to file storage.</summary>
        public static IEnumerator DownloadMesh(string meshUrl, string name, Action<string> onSaved, Action<string> onError)
        {
            if (!IsMeshUrlAllowed(meshUrl))
            {
                onError("Refusing to download from this address: " + meshUrl);
                yield break;
            }
            using (var request = UnityWebRequest.Get(meshUrl))
            {
                request.timeout = DownloadTimeoutSeconds;
                yield return request.SendWebRequest();
                if (request.result != UnityWebRequest.Result.Success)
                {
                    onError("Could not download the mesh: " + request.error);
                    yield break;
                }
                var bytes = request.downloadHandler.data;
                if (!IsGlb(bytes))
                {
                    onError("The downloaded file is not a GLB mesh.");
                    yield break;
                }
                try
                {
                    onSaved(SaveMesh(bytes, name));
                }
                catch (Exception error)
                {
                    onError("Could not save the mesh: " + error.Message);
                }
            }
        }

        /// <summary>Write a GLB into Assets/Hydrilla and import it. Returns a message for the user.</summary>
        public static string SaveMesh(byte[] bytes, string name)
        {
            if (!AssetDatabase.IsValidFolder(HydrillaSettings.AssetFolder))
            {
                AssetDatabase.CreateFolder("Assets", "Hydrilla");
            }
            var assetPath = AssetDatabase.GenerateUniqueAssetPath(
                HydrillaSettings.AssetFolder + "/" + SafeName(name) + ".glb");
            File.WriteAllBytes(assetPath, bytes);
            AssetDatabase.ImportAsset(assetPath);

            var asset = AssetDatabase.LoadMainAssetAtPath(assetPath);
            if (asset != null)
            {
                EditorGUIUtility.PingObject(asset);
            }
            if (asset == null || asset is DefaultAsset)
            {
                return "Saved " + assetPath + ". Install a glTF importer (for example the glTFast package) to use it in scenes.";
            }
            return "Imported " + assetPath;
        }

        public static string SafeName(string value)
        {
            var builder = new StringBuilder();
            foreach (var ch in value ?? "")
            {
                builder.Append(char.IsLetterOrDigit(ch) || ch == '-' || ch == '_' ? ch : '-');
            }
            var cleaned = builder.ToString().Trim('-');
            if (cleaned.Length > 48)
            {
                cleaned = cleaned.Substring(0, 48);
            }
            return cleaned.Length > 0 ? cleaned : "hydrilla-model";
        }
    }
}
#endif
