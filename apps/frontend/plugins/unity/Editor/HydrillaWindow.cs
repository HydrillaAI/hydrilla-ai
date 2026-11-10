#if UNITY_EDITOR
using System;
using System.Collections;
using System.IO;
using UnityEditor;
using UnityEngine;

namespace Hydrilla
{
    /// <summary>Window > Hydrilla: paste an API key, generate models, receive them from Studio or an AI agent.</summary>
    public class HydrillaWindow : EditorWindow
    {
        string keyInput = "";
        string account = "";
        string prompt = "";
        string imageSource = "";
        string status = "Ready";
        bool busy;
        bool cancelRequested;
        bool showAdvanced;
        string apiBaseInput = "";
        Vector2 scroll;

        [MenuItem("Window/Hydrilla")]
        public static void Open()
        {
            GetWindow<HydrillaWindow>("Hydrilla");
        }

        void OnEnable()
        {
            keyInput = HydrillaSettings.SavedApiKey;
            apiBaseInput = HydrillaSettings.ApiBase;
            minSize = new Vector2(320, 420);
            if (HydrillaSettings.ApiKey.Length > 0)
            {
                CheckKey();
            }
            else
            {
                account = "Add your API key to start";
            }
        }

        void OnInspectorUpdate()
        {
            // Keeps progress and Bridge messages current while the window is open.
            Repaint();
        }

        void OnGUI()
        {
            scroll = EditorGUILayout.BeginScrollView(scroll);
            DrawAccount();
            EditorGUILayout.Space();
            DrawGenerate();
            EditorGUILayout.Space();
            DrawBridge();
            EditorGUILayout.Space();
            DrawAdvanced();
            EditorGUILayout.EndScrollView();
        }

        void DrawAccount()
        {
            EditorGUILayout.LabelField("Account", EditorStyles.boldLabel);
            EditorGUILayout.LabelField(account, EditorStyles.wordWrappedLabel);
            keyInput = EditorGUILayout.PasswordField("API key", keyInput);
            if (HydrillaSettings.SavedApiKey.Length == 0 && HydrillaSettings.ApiKey.Length > 0)
            {
                EditorGUILayout.LabelField("Using the key already saved on this computer.", EditorStyles.miniLabel);
            }
            using (new EditorGUILayout.HorizontalScope())
            {
                if (GUILayout.Button("Get API key"))
                {
                    Application.OpenURL(HydrillaSettings.ApiKeysUrl);
                }
                if (GUILayout.Button("Save and check"))
                {
                    SaveKey();
                }
                using (new EditorGUI.DisabledScope(HydrillaSettings.SavedApiKey.Length == 0))
                {
                    if (GUILayout.Button("Remove"))
                    {
                        keyInput = "";
                        HydrillaSettings.SaveApiKey("");
                        account = "API key removed from this editor.";
                        GUI.FocusControl(null);
                    }
                }
            }
        }

        void DrawGenerate()
        {
            EditorGUILayout.LabelField("Generate", EditorStyles.boldLabel);
            prompt = EditorGUILayout.TextField("Prompt", prompt);
            using (new EditorGUI.DisabledScope(busy || string.IsNullOrWhiteSpace(prompt)))
            {
                if (GUILayout.Button("Generate from text"))
                {
                    var text = prompt.Trim();
                    Run(HydrillaApi.GenerateFromText(text, SetStatus, IsCancelled, OnSaved, OnFailed));
                }
            }

            using (new EditorGUILayout.HorizontalScope())
            {
                imageSource = EditorGUILayout.TextField("Image", imageSource);
                if (GUILayout.Button("Browse…", GUILayout.Width(72)))
                {
                    var picked = EditorUtility.OpenFilePanel("Choose image", "", "png,jpg,jpeg,webp");
                    if (!string.IsNullOrEmpty(picked))
                    {
                        imageSource = picked;
                        GUI.FocusControl(null);
                    }
                }
            }
            using (new EditorGUI.DisabledScope(busy || string.IsNullOrWhiteSpace(imageSource)))
            {
                if (GUILayout.Button("Generate from image"))
                {
                    GenerateFromImage(imageSource.Trim());
                }
            }

            EditorGUILayout.HelpBox(status, MessageType.None);
            if (busy)
            {
                using (new EditorGUI.DisabledScope(cancelRequested))
                {
                    if (GUILayout.Button("Cancel"))
                    {
                        cancelRequested = true;
                        status = "Cancelling…";
                    }
                }
            }
        }

        void DrawBridge()
        {
            EditorGUILayout.LabelField("Bridge", EditorStyles.boldLabel);
            if (HydrillaBridge.IsRunning)
            {
                if (GUILayout.Button("Bridge ON (click to stop)"))
                {
                    HydrillaBridge.Stop();
                }
            }
            else if (GUILayout.Button("Run Bridge"))
            {
                HydrillaBridge.Start();
            }
            var message = HydrillaBridge.Message;
            EditorGUILayout.LabelField(
                string.IsNullOrEmpty(message)
                    ? "Lets Hydrilla Studio and your AI agent send models into this project."
                    : message,
                EditorStyles.wordWrappedLabel);
        }

        void DrawAdvanced()
        {
            showAdvanced = EditorGUILayout.Foldout(showAdvanced, "Developer");
            if (!showAdvanced)
            {
                return;
            }
            apiBaseInput = EditorGUILayout.TextField("API address", apiBaseInput);
            using (new EditorGUILayout.HorizontalScope())
            {
                if (GUILayout.Button("Save"))
                {
                    HydrillaSettings.SaveApiBase(apiBaseInput);
                    apiBaseInput = HydrillaSettings.ApiBase;
                    GUI.FocusControl(null);
                }
                if (GUILayout.Button("Use production"))
                {
                    HydrillaSettings.SaveApiBase(HydrillaSettings.DefaultApiBase);
                    apiBaseInput = HydrillaSettings.ApiBase;
                    GUI.FocusControl(null);
                }
            }
        }

        void SaveKey()
        {
            var cleaned = HydrillaSettings.CleanKey(keyInput);
            keyInput = cleaned;
            GUI.FocusControl(null);
            if (cleaned.Length > 0 && !HydrillaSettings.LooksLikeApiKey(cleaned))
            {
                account = "That does not look like a Hydrilla key (hyd_live_…).";
                return;
            }
            HydrillaSettings.SaveApiKey(cleaned);
            if (HydrillaSettings.ApiKey.Length == 0)
            {
                account = "Add your API key to start";
                return;
            }
            CheckKey();
        }

        void CheckKey()
        {
            account = "Checking your key…";
            HydrillaCoroutine.Start(HydrillaApi.CheckKey(label => account = label, error => account = error));
        }

        void GenerateFromImage(string source)
        {
            if (source.StartsWith("https://", StringComparison.OrdinalIgnoreCase)
                || source.StartsWith("http://", StringComparison.OrdinalIgnoreCase))
            {
                Run(HydrillaApi.GenerateFromImageUrl(source, SetStatus, IsCancelled, OnSaved, OnFailed));
                return;
            }
            if (File.Exists(source))
            {
                Run(HydrillaApi.GenerateFromImageFile(source, SetStatus, IsCancelled, OnSaved, OnFailed));
                return;
            }
            status = "Choose an image file, or paste an https:// image link.";
        }

        void Run(IEnumerator work)
        {
            if (busy)
            {
                return;
            }
            if (HydrillaSettings.ApiKey.Length == 0)
            {
                status = HydrillaApi.NoKeyMessage;
                return;
            }
            busy = true;
            cancelRequested = false;
            HydrillaCoroutine.Start(Guarded(work));
        }

        IEnumerator Guarded(IEnumerator work)
        {
            try
            {
                yield return work;
            }
            finally
            {
                // Runs on success, failure and unexpected errors, so the buttons never stay disabled.
                busy = false;
                cancelRequested = false;
            }
        }

        bool IsCancelled()
        {
            return cancelRequested;
        }

        void SetStatus(string message)
        {
            if (!cancelRequested)
            {
                status = message;
            }
        }

        void OnSaved(string message)
        {
            status = message;
            CheckKey();
        }

        void OnFailed(string message)
        {
            status = message;
        }
    }
}
#endif
