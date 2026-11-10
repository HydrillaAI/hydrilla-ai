#if UNITY_EDITOR
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEditor;
using UnityEngine;

namespace Hydrilla
{
    /// <summary>
    /// Runs coroutines in the editor, where MonoBehaviour coroutines are not available.
    /// Supports nested coroutines and waits for web requests and other async operations.
    /// </summary>
    static class HydrillaCoroutine
    {
        public static void Start(IEnumerator routine)
        {
            var stack = new Stack<IEnumerator>();
            stack.Push(routine);

            EditorApplication.CallbackFunction step = null;
            step = () =>
            {
                try
                {
                    while (stack.Count > 0)
                    {
                        var top = stack.Peek();
                        var pending = top.Current as AsyncOperation;
                        if (pending != null && !pending.isDone)
                        {
                            return;
                        }
                        if (!top.MoveNext())
                        {
                            stack.Pop();
                            continue;
                        }
                        var nested = top.Current as IEnumerator;
                        if (nested != null)
                        {
                            stack.Push(nested);
                            continue;
                        }
                        // Yielded null or an async operation: continue on a later editor frame.
                        return;
                    }
                }
                catch (Exception error)
                {
                    Debug.LogException(error);
                    // Disposing runs each coroutine's finally block, so callers can reset their state.
                    while (stack.Count > 0)
                    {
                        var disposable = stack.Pop() as IDisposable;
                        if (disposable != null)
                        {
                            disposable.Dispose();
                        }
                    }
                }
                EditorApplication.update -= step;
            };
            EditorApplication.update += step;
        }

        public static IEnumerator Wait(double seconds)
        {
            var resumeAt = EditorApplication.timeSinceStartup + seconds;
            while (EditorApplication.timeSinceStartup < resumeAt)
            {
                yield return null;
            }
        }
    }
}
#endif
