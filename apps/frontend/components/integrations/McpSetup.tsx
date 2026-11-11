"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createDeveloperApiKey, fetchDeveloperApiKeys } from "@/lib/api";
import {
  BLENDER_AGENTS,
  BLENDER_GENERATE_PROMPT,
  GENERATE_PROMPT,
  KEY_PLACEHOLDER,
  OTHER_CLIENTS,
  PRIMARY_CLIENTS,
  agentSetupPrompt,
  blenderConnectLine,
  blenderSetupPrompt,
  clientById,
  cliInstallCommand,
  detectMcpOs,
  manualConfig,
  openPromptUrl,
  cursorInstallUrl,
  codexConnectCommand,
  stdioCommand,
  terminalHint,
  verifyPrompt,
  type BlenderAgent,
  type McpClient,
  type McpClientId,
  type McpOs,
} from "@/lib/mcp-setup";

type KeyState =
  | { status: "signed-out" }
  | { status: "loading" }
  | { status: "empty" }
  | { status: "has-key" };

const SIGN_IN_HREF = "/sign-in?redirect_url=%2Fintegrations%2Fmcp";

const TROUBLESHOOTING = [
  {
    q: "The Open button does nothing",
    a: "Your agent needs to be installed and opened once on this computer so it can handle links. Claude Code registers its link handler after you send your first prompt. If it still does nothing, use Copy prompt and paste it into your agent.",
  },
  {
    q: "Why isn’t my key in the agent prompt?",
    a: "Anything typed into an agent chat is sent to the model provider and saved in the agent’s session history. Your key goes into the agent’s MCP config through a command you run yourself, and the prompt only checks the connection.",
  },
  {
    q: "My client does not list the hydrilla tools. What now?",
    a: "Cursor and VS Code need a manual toggle after install — see the check step for your client above. On Claude Code and Gemini CLI, run /mcp to list connected servers. If the tools still do not appear, check that the config is valid JSON with no trailing commas, and that HYDRILLA_API_KEY sits inside an env block rather than in args.",
  },
  {
    q: "How do I list connected MCP servers?",
    a: "On Claude Code and Gemini CLI, run /mcp after install to see connected servers. On most other clients, ask “List the hydrilla tools available.” If Hydrilla is missing, re-check the install snippet and that HYDRILLA_API_KEY is set.",
  },
  {
    q: "Does it work on Windows?",
    a: "Yes. Switch the system toggle above to Windows: the commands run npx through cmd /c, which Windows needs to start it. Node.js 20 or newer must be installed.",
  },
  {
    q: "I have several 3D MCP servers installed. How does the agent pick Hydrilla?",
    a: "Name the server hydrilla — every config on this page does — and say so in the prompt: “use Hydrilla to…”. Agents route by tool descriptions, and naming the product is the most reliable disambiguation.",
  },
];

async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the textarea fallback.
  }

  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    area.style.top = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

function CommandBlock({
  label,
  code,
  copyId,
  copiedId,
  onCopy,
}: {
  label: string;
  code: string;
  copyId: string;
  copiedId: string | null;
  onCopy: (id: string, code: string) => void;
}) {
  return (
    <div className="mcp-code">
      <div className="mcp-code-bar">
        <span>{label}</span>
        <button type="button" onClick={() => onCopy(copyId, code)}>
          {copiedId === copyId ? "Copied" : "Copy"}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function OsSwitch({ os, onChange }: { os: McpOs; onChange: (os: McpOs) => void }) {
  return (
    <div className="mcp-os" role="radiogroup" aria-label="Your system">
      <span className="mcp-os-label">Your system</span>
      <button type="button" role="radio" aria-checked={os === "unix"} data-on={os === "unix"} onClick={() => onChange("unix")}>
        macOS / Linux
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={os === "windows"}
        data-on={os === "windows"}
        onClick={() => onChange("windows")}
      >
        Windows
      </button>
    </div>
  );
}

export function McpSetup() {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const loadedFor = useRef<string | null>(null);
  const [keyState, setKeyState] = useState<KeyState>({ status: "loading" });
  const [keyError, setKeyError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [os, setOs] = useState<McpOs>("unix");
  const [clientId, setClientId] = useState<McpClientId>("claude-code");
  const [otherOpen, setOtherOpen] = useState(false);
  const [blenderOn, setBlenderOn] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setOs(detectMcpOs(navigator.userAgent));
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    const session = isSignedIn ? "in" : "out";
    if (loadedFor.current === session) {
      return;
    }
    loadedFor.current = session;
    if (!isSignedIn) {
      setKeyState({ status: "signed-out" });
      return;
    }

    const load = async () => {
      setKeyState({ status: "loading" });
      setKeyError(null);
      try {
        const keys = await fetchDeveloperApiKeys(() => getToken());
        const active = keys.find((key) => key.status === "active");
        if (!active) {
          setKeyState({ status: "empty" });
          return;
        }
        setKeyState({ status: "has-key" });
      } catch (error) {
        setKeyError(error instanceof Error ? error.message : "Could not load API keys");
        setKeyState({ status: "empty" });
      }
    };
    void load();
  }, [getToken, isLoaded, isSignedIn]);

  const client = clientById(clientId);
  const checkPrompt = verifyPrompt(client.restartLine);
  const openCheckUrl = openPromptUrl(client.id, checkPrompt);

  async function onCopy(id: string, code: string) {
    const ok = await writeClipboard(code);
    if (!ok) {
      setKeyError("Couldn’t copy. Select the text and copy it by hand.");
      return;
    }
    setCopiedId(id);
    window.setTimeout(() => {
      setCopiedId((current) => {
        if (current === id) {
          return null;
        }
        return current;
      });
    }, 2000);
  }

  async function onCreateKey() {
    setCreating(true);
    setKeyError(null);
    try {
      await createDeveloperApiKey("MCP", () => getToken());
      loadedFor.current = "in";
      setKeyState({ status: "has-key" });
    } catch (error) {
      setKeyError(error instanceof Error ? error.message : "Could not create an API key");
    } finally {
      setCreating(false);
    }
  }

  function selectClient(id: McpClientId) {
    setBlenderOn(false);
    setClientId(id);
    const next = clientById(id);
    if (next.group === "primary") {
      setOtherOpen(false);
    }
  }

  function openOther() {
    setBlenderOn(false);
    setOtherOpen(true);
    const current = clientById(clientId);
    if (current.group !== "other") {
      setClientId("vscode");
    }
  }

  return (
    <div className="mcp-setup">
      <AgentSetup copiedId={copiedId} onCopy={onCopy} />

      <h2 className="mcp-divider">Or set it up step by step</h2>

      <ol className="mcp-steps">
        <li className="mcp-step">
          <span className="mcp-step-index" aria-hidden>
            1
          </span>
          <div className="mcp-step-body">
            <h2>Sign in to create an API key</h2>
            <KeyStep keyState={keyState} keyError={keyError} creating={creating} onCreate={onCreateKey} />
          </div>
        </li>

        <li className="mcp-step">
          <span className="mcp-step-index" aria-hidden>
            2
          </span>
          <div className="mcp-step-body">
            <h2>{blenderOn ? "Install Hydrilla for Blender" : "Connect your agent"}</h2>
            <p className="mcp-lead">
              {blenderOn
                ? "Lets Claude Code, Codex, or Cursor build in your Blender scene with Hydrilla."
                : "Pick where you’ll use Hydrilla. Your key goes into the agent’s config, not the chat."}
            </p>
            <div className="mcp-tabs" role="tablist" aria-label="MCP client">
              {PRIMARY_CLIENTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={!blenderOn && clientId === item.id}
                  data-on={!blenderOn && clientId === item.id}
                  onClick={() => selectClient(item.id)}
                >
                  {item.name}
                </button>
              ))}
              <button
                type="button"
                role="tab"
                aria-selected={blenderOn}
                data-on={blenderOn}
                onClick={() => {
                  setBlenderOn(true);
                  setOtherOpen(false);
                }}
              >
                Blender
                <span className="mcp-popular">Popular</span>
              </button>
              <button type="button" role="tab" aria-selected={otherOpen} data-on={otherOpen} onClick={openOther}>
                Other agents ({OTHER_CLIENTS.length})
              </button>
            </div>
            {otherOpen ? (
              <div className="mcp-tabs mcp-tabs-sub" role="tablist" aria-label="Other MCP clients">
                {OTHER_CLIENTS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={clientId === item.id}
                    data-on={clientId === item.id}
                    onClick={() => selectClient(item.id)}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            ) : null}
            {blenderOn ? (
              <BlenderSetup copiedId={copiedId} onCopy={onCopy} />
            ) : (
              <ConnectPanel
                client={client}
                os={os}
                onOs={setOs}
                checkPrompt={checkPrompt}
                openCheckUrl={openCheckUrl}
                copiedId={copiedId}
                onCopy={onCopy}
              />
            )}
          </div>
        </li>

        {blenderOn ? (
          <li className="mcp-step">
            <span className="mcp-step-index" aria-hidden>
              3
            </span>
            <div className="mcp-step-body">
              <h2>Add your key in Blender</h2>
              <p className="mcp-lead">
                After restarting Blender, press N and open the Hydrilla tab. Paste your key there, then click Run
                Bridge so your agent can place models in the scene. This page does not show the secret.
              </p>
              <div className="mcp-npanel" aria-hidden>
                <span>N panel</span>
                <strong>Hydrilla</strong>
                <span>API Key</span>
                <span>Run Bridge</span>
              </div>
              <p className="mcp-lead">
                Blender remembers the key and shares it with your agent on this computer, so it never goes into the
                chat. Tick Start Bridge with Blender to skip the Run Bridge click next time.
              </p>
            </div>
          </li>
        ) : null}

        <li className="mcp-step">
          <span className="mcp-step-index" aria-hidden>
            {blenderOn ? "4" : "3"}
          </span>
          <div className="mcp-step-body">
            <h2>{blenderOn ? "Generate in Blender" : "Generate a model"}</h2>
            <p className="mcp-lead">
              {blenderOn
                ? "Ask your agent for a model. It lands in your open scene."
                : "Paste this prompt into your client once you see your balance."}
            </p>
            <CommandBlock
              label="prompt"
              code={blenderOn ? BLENDER_GENERATE_PROMPT : GENERATE_PROMPT}
              copyId="generate"
              copiedId={copiedId}
              onCopy={onCopy}
            />
          </div>
        </li>
      </ol>

      <section className="mcp-trouble">
        <div className="mcp-trouble-links">
          <h2>Troubleshooting</h2>
          <div>
            <Link href="/docs">Docs</Link>
            <Link href="/app/api-keys">API keys</Link>
            <Link href="/pricing">Plans</Link>
          </div>
        </div>
        {TROUBLESHOOTING.map((item) => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </section>
    </div>
  );
}

/** One short prompt any agent can follow to install the server itself. */
function AgentSetup({
  copiedId,
  onCopy,
}: {
  copiedId: string | null;
  onCopy: (id: string, code: string) => void;
}) {
  return (
    <section className="mcp-agent">
      <h2>Let your agent set it up</h2>
      <p className="mcp-lead">
        Copy the prompt and paste it into any AI agent. It connects Hydrilla for you, and your API key never goes
        into the chat.
      </p>
      <div className="mcp-prompt-actions">
        <button
          type="button"
          className="pickle-pill-solid mcp-pill"
          onClick={() => onCopy("agent-setup", agentSetupPrompt())}
        >
          {copiedId === "agent-setup" ? "Copied" : "Copy prompt"}
        </button>
      </div>
    </section>
  );
}

function BlenderSetup({
  copiedId,
  onCopy,
}: {
  copiedId: string | null;
  onCopy: (id: string, code: string) => void;
}) {
  const [agent, setAgent] = useState<BlenderAgent>("claude-code");
  const prompt = blenderSetupPrompt(agent);
  const openUrl = openPromptUrl(agent, prompt);
  const agentName = clientById(agent).name;
  const directInstall = agent === "cursor" || agent === "codex";

  return (
    <div className="mcp-panel">
      <div className="mcp-panel-head">
        <strong>Hydrilla for Blender</strong>
        <span>Blender add-on</span>
      </div>
      <div className="mcp-tabs mcp-tabs-sub" role="tablist" aria-label="Agent that drives Blender">
        {BLENDER_AGENTS.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={agent === id}
            data-on={agent === id}
            onClick={() => setAgent(id)}
          >
            {clientById(id).name}
          </button>
        ))}
      </div>
      {agent === "cursor" ? (
        <>
          <p className="mcp-lead">
            Opens Cursor&apos;s Install MCP server window with Hydrilla filled in. Click Install. No key is needed
            here: Cursor uses the key you add in Blender in the next step.
          </p>
          <div className="mcp-prompt-actions">
            <a className="pickle-pill-solid mcp-pill" href={cursorInstallUrl()}>
              Add to Cursor
            </a>
          </div>
        </>
      ) : null}
      {agent === "codex" ? (
        <>
          <p className="mcp-lead">
            Run this in your terminal to add Hydrilla to Codex. No key is needed here: Codex uses the key you add in
            Blender in the next step.
          </p>
          <CommandBlock
            label="Your terminal"
            code={codexConnectCommand()}
            copyId="blender-codex-install"
            copiedId={copiedId}
            onCopy={onCopy}
          />
        </>
      ) : null}
      <p className="mcp-lead">
        {directInstall
          ? `Then install the Blender add-on: open ${agentName} with the setup prompt below, or follow it yourself.`
          : `Opens ${agentName} with the setup prompt typed in. Nothing runs until you press Enter. Your key isn’t in this prompt; you add it in Blender in the next step.`}
      </p>
      <div className="mcp-prompt-actions">
        {openUrl ? (
          <a className={directInstall ? "pickle-pill-ghost mcp-pill" : "pickle-pill-solid mcp-pill"} href={openUrl}>
            Open in {agentName}
          </a>
        ) : null}
        <button type="button" className="pickle-pill-ghost mcp-pill" onClick={() => onCopy("blender-prompt", prompt)}>
          {copiedId === "blender-prompt" ? "Copied" : "Copy prompt"}
        </button>
      </div>
      <CommandBlock label="prompt" code={prompt} copyId="blender-prompt-block" copiedId={copiedId} onCopy={onCopy} />
      <details className="mcp-manual">
        <summary>Set it up yourself instead</summary>
        <p>
          Download{" "}
          <a href="/plugins/hydrilla-blender.zip">hydrilla-blender.zip</a>, install it from Edit › Preferences ›
          Add-ons, then connect the agent with the command below. It needs Node.js 20 or newer.
        </p>
        <CommandBlock
          label={agentName}
          code={blenderConnectLine(agent)}
          copyId="blender-manual"
          copiedId={copiedId}
          onCopy={onCopy}
        />
      </details>
      <p className="mcp-note">
        This is Hydrilla’s Blender add-on. The API key stays on your computer, not in the agent chat. There is no
        browser sign-in. Generation needs Pro.{" "}
        <Link href="/integrations/blender">Blender add-on</Link>
      </p>
    </div>
  );
}

function KeyStep({
  keyState,
  keyError,
  creating,
  onCreate,
}: {
  keyState: KeyState;
  keyError: string | null;
  creating: boolean;
  onCreate: () => void;
}) {
  return (
    <>
      {keyState.status === "loading" ? <p className="mcp-lead">Checking your API keys…</p> : null}
      {keyState.status === "signed-out" ? (
        <>
          <p className="mcp-lead">API keys require a Hydrilla account.</p>
          <Link href={SIGN_IN_HREF} className="pickle-pill-solid mcp-pill">
            Sign in
          </Link>
        </>
      ) : null}
      {keyState.status === "empty" ? (
        <>
          <p className="mcp-lead">
            Create a key, then copy it from API keys and replace {KEY_PLACEHOLDER} in the command below. This page
            never shows the secret.
          </p>
          <button type="button" className="pickle-pill-solid mcp-pill" onClick={onCreate} disabled={creating}>
            {creating ? "Creating…" : "Create an API key"}
          </button>
        </>
      ) : null}
      {keyState.status === "has-key" ? (
        <>
          <p className="mcp-lead">
            You already have an API key. Copy it from API keys and replace {KEY_PLACEHOLDER} in the command below.
            This page does not show the secret.
          </p>
          <Link href="/app/api-keys" className="pickle-pill-solid mcp-pill">
            Open API keys
          </Link>
        </>
      ) : null}
      {keyError ? <p className="mcp-error">{keyError}</p> : null}
      <p className="mcp-note">
        The MCP server needs REST API access, included with Pro. <Link href="/pricing">Plans</Link>
      </p>
    </>
  );
}

function ConnectPanel({
  client,
  os,
  onOs,
  checkPrompt,
  openCheckUrl,
  copiedId,
  onCopy,
}: {
  client: McpClient;
  os: McpOs;
  onOs: (os: McpOs) => void;
  checkPrompt: string;
  openCheckUrl: string | null;
  copiedId: string | null;
  onCopy: (id: string, code: string) => void;
}) {
  const manual = manualConfig(client, KEY_PLACEHOLDER);
  return (
    <div className="mcp-panel">
      <div className="mcp-panel-head">
        <strong>{client.name}</strong>
        <span>Hydrilla MCP server</span>
      </div>

      {client.mode === "cli" ? (
        <section className="mcp-substep">
          <h3>
            <span>1</span>
            Save your key in your terminal before opening {client.name}
          </h3>
          <p>{terminalHint(client, os)}</p>
          <OsSwitch os={os} onChange={onOs} />
          <CommandBlock
            label="Your terminal, not inside the agent"
            code={cliInstallCommand(client.id, os, KEY_PLACEHOLDER)}
            copyId={`${client.id}-install`}
            copiedId={copiedId}
            onCopy={onCopy}
          />
        </section>
      ) : null}

      {client.mode === "cursor" ? (
        <section className="mcp-substep">
          <h3>
            <span>1</span>
            Add Hydrilla to Cursor
          </h3>
          <p>
            Opens Cursor&apos;s Install MCP server window with Hydrilla filled in. Click Install, then replace{" "}
            {KEY_PLACEHOLDER} with your key in Cursor Settings → MCP &amp; Integrations → hydrilla.
          </p>
          <div className="mcp-prompt-actions">
            <a className="pickle-pill-solid mcp-pill" href={cursorInstallUrl(KEY_PLACEHOLDER)}>
              Add to Cursor
            </a>
          </div>
          <details className="mcp-manual">
            <summary>Edit ~/.cursor/mcp.json instead</summary>
            <p>Paste this into ~/.cursor/mcp.json, then turn hydrilla on in Settings → MCP &amp; Integrations.</p>
            <CommandBlock
              label="~/.cursor/mcp.json"
              code={manual}
              copyId="cursor-json"
              copiedId={copiedId}
              onCopy={onCopy}
            />
          </details>
        </section>
      ) : null}

      {client.mode === "json" ? (
        <section className="mcp-substep">
          <h3>
            <span>1</span>
            Save your key to {client.name}
          </h3>
          <p>{client.manualHint}</p>
          <CommandBlock
            label={client.configFile}
            code={manual}
            copyId={`${client.id}-json`}
            copiedId={copiedId}
            onCopy={onCopy}
          />
        </section>
      ) : null}

      {client.mode === "stdio" ? (
        <section className="mcp-substep">
          <h3>
            <span>1</span>
            Run the server from any MCP client
          </h3>
          <p>
            Set <code>HYDRILLA_API_KEY</code> in the client’s env block. The key never goes in the chat.
          </p>
          <OsSwitch os={os} onChange={onOs} />
          <CommandBlock
            label="Command"
            code={stdioCommand()}
            copyId="stdio-command"
            copiedId={copiedId}
            onCopy={onCopy}
          />
          <CommandBlock
            label={client.configFile}
            code={manual}
            copyId="stdio-json"
            copiedId={copiedId}
            onCopy={onCopy}
          />
        </section>
      ) : null}

      <section className="mcp-substep">
        <h3>
          <span>2</span>
          Ask {client.name} to check it works
        </h3>
        <p>Paste this short prompt into {client.name}. Your key isn’t in it.</p>
        <div className="mcp-prompt-actions">
          <button type="button" className="pickle-pill-ghost mcp-pill" onClick={() => onCopy(`${client.id}-prompt`, checkPrompt)}>
            {copiedId === `${client.id}-prompt` ? "Copied" : "Copy prompt"}
          </button>
          {openCheckUrl ? (
            <a className="pickle-pill-solid mcp-pill" href={openCheckUrl}>
              Open in {client.name}
            </a>
          ) : null}
        </div>
        <CommandBlock
          label="prompt"
          code={checkPrompt}
          copyId={`${client.id}-prompt-block`}
          copiedId={copiedId}
          onCopy={onCopy}
        />
        {client.mode === "cli" ? (
          <details className="mcp-manual">
            <summary>Edit the config file instead</summary>
            <p>{client.manualHint}</p>
            <OsSwitch os={os} onChange={onOs} />
            <CommandBlock
              label={client.configFile}
              code={manual}
              copyId={`${client.id}-manual`}
              copiedId={copiedId}
              onCopy={onCopy}
            />
          </details>
        ) : null}
      </section>
    </div>
  );
}
