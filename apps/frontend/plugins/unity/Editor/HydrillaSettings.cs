#if UNITY_EDITOR
using System;
using System.IO;
using UnityEditor;
using UnityEngine;

namespace Hydrilla
{
    /// <summary>API key and addresses. One API key authenticates everything; there is no sign-in.</summary>
    static class HydrillaSettings
    {
        public const string Version = "2.0.0";
        public const string DefaultApiBase = "https://hydrilla-ai-g1bm.vercel.app";
        public const string ApiKeysUrl = "https://hydrilla.ai/app/api-keys";
        public const string BridgeHost = "127.0.0.1";
        public const int BridgePort = 7349;
        public const string AssetFolder = "Assets/Hydrilla";

        const string PrefApiKey = "Hydrilla.ApiKey";
        const string PrefApiBase = "Hydrilla.ApiBase";
        const string KeyPrefix = "hyd_";

        // Hosts that do not serve the developer API (old backend, GPU gateway).
        static readonly string[] RetiredApiHosts = { "hydrilla-backend.vercel.app", "api.hydrilla.co", "api.hydrilla.ai" };

        [Serializable]
        class SharedConfig
        {
            public string api_key;
            public string api_base;
        }

        /// <summary>The key saved in this editor, if any.</summary>
        public static string SavedApiKey
        {
            get { return CleanKey(EditorPrefs.GetString(PrefApiKey, "")); }
        }

        /// <summary>Key to use: this editor's, else the environment, else the one shared by other Hydrilla plugins.</summary>
        public static string ApiKey
        {
            get
            {
                var saved = SavedApiKey;
                if (saved.Length > 0)
                {
                    return saved;
                }
                var fromEnvironment = CleanKey(Environment.GetEnvironmentVariable("HYDRILLA_API_KEY"));
                if (fromEnvironment.Length > 0)
                {
                    return fromEnvironment;
                }
                return CleanKey(ReadSharedConfig().api_key);
            }
        }

        public static void SaveApiKey(string key)
        {
            var cleaned = CleanKey(key);
            if (cleaned.Length == 0)
            {
                EditorPrefs.DeleteKey(PrefApiKey);
                return;
            }
            EditorPrefs.SetString(PrefApiKey, cleaned);
        }

        public static string ApiBase
        {
            get
            {
                var saved = EditorPrefs.GetString(PrefApiBase, "");
                if (string.IsNullOrWhiteSpace(saved))
                {
                    saved = Environment.GetEnvironmentVariable("HYDRILLA_API_BASE");
                }
                if (string.IsNullOrWhiteSpace(saved))
                {
                    saved = ReadSharedConfig().api_base;
                }
                return NormalizeApiBase(saved);
            }
        }

        public static void SaveApiBase(string value)
        {
            var normalized = NormalizeApiBase(value);
            if (normalized == DefaultApiBase)
            {
                EditorPrefs.DeleteKey(PrefApiBase);
                return;
            }
            EditorPrefs.SetString(PrefApiBase, normalized);
        }

        public static string NormalizeApiBase(string value)
        {
            var text = (value ?? "").Trim().TrimEnd('/');
            Uri uri;
            if (text.Length == 0 || !Uri.TryCreate(text, UriKind.Absolute, out uri))
            {
                return DefaultApiBase;
            }
            if (uri.Scheme != Uri.UriSchemeHttps && uri.Scheme != Uri.UriSchemeHttp)
            {
                return DefaultApiBase;
            }
            foreach (var retired in RetiredApiHosts)
            {
                if (string.Equals(uri.Host, retired, StringComparison.OrdinalIgnoreCase))
                {
                    return DefaultApiBase;
                }
            }
            return text;
        }

        /// <summary>Strip whitespace, quotes and a pasted "Bearer " prefix.</summary>
        public static string CleanKey(string value)
        {
            var text = (value ?? "").Trim().Trim('"', '\'').Trim();
            if (text.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                text = text.Substring(7).Trim();
            }
            return text;
        }

        public static bool LooksLikeApiKey(string value)
        {
            var text = CleanKey(value);
            if (!text.StartsWith(KeyPrefix, StringComparison.Ordinal) || text.Length < 16)
            {
                return false;
            }
            foreach (var ch in text)
            {
                if (!char.IsLetterOrDigit(ch) && ch != '_' && ch != '-')
                {
                    return false;
                }
            }
            return true;
        }

        static SharedConfig ReadSharedConfig()
        {
            try
            {
                var folder = Environment.GetEnvironmentVariable("HYDRILLA_CONFIG_DIR");
                if (string.IsNullOrWhiteSpace(folder))
                {
                    folder = Path.Combine(
                        Environment.GetFolderPath(Environment.SpecialFolder.UserProfile),
                        ".hydrilla");
                }
                var path = Path.Combine(folder, "config.json");
                if (File.Exists(path))
                {
                    var parsed = JsonUtility.FromJson<SharedConfig>(File.ReadAllText(path));
                    if (parsed != null)
                    {
                        return parsed;
                    }
                }
            }
            catch (Exception)
            {
                // A missing or unreadable shared file just means no shared key.
            }
            return new SharedConfig();
        }
    }
}
#endif
