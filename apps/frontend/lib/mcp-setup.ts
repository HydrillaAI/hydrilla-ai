/** Install commands for the Hydrilla MCP server, matching the agent-setup flow. */

export const MCP_SERVER_NAME = "hydrilla";
export const KEY_PLACEHOLDER = "hyd_live_YOUR_API_KEY";
export const GENERATE_PROMPT = "Generate a textured 3D model of a red sports car";

export type McpOs = "unix" | "windows";

export type McpClientId =
  | "claude-code"
  | "codex"
  | "cursor"
  | "vscode"
  | "claude-desktop"
  | "windsurf"
  | "gemini-cli"
  | "warp"
  | "stdio";

export type McpClient = {
  id: McpClientId;
  name: string;
  group: "primary" | "other";
  mode: "cli" | "cursor" | "json" | "stdio";
  /** JSON root key the client expects. Codex uses TOML instead. */
  rootKey: "mcpServers" | "servers";
  configFile: string;
  manualHint: string;
  restartLine: string;
};

export const MCP_CLIENTS: McpClient[] = [
  {
    id: "claude-code",
    name: "Claude Code",
    group: "primary",
    mode: "cli",
    rootKey: "mcpServers",
    configFile: "~/.claude.json",
    manualHint: "Prefer editing config by hand? Add this under mcpServers in ~/.claude.json.",
    restartLine: "tell me to quit and restart Claude Code, then ask again.",
  },
  {
    id: "codex",
    name: "Codex",
    group: "primary",
    mode: "cli",
    rootKey: "mcpServers",
    configFile: "~/.codex/config.toml",
    manualHint: "Prefer editing config by hand? Add this to ~/.codex/config.toml.",
    restartLine: "tell me to restart Codex and start a new thread.",
  },
  {
    id: "cursor",
    name: "Cursor",
    group: "primary",
    mode: "cursor",
    rootKey: "mcpServers",
    configFile: "~/.cursor/mcp.json",
    manualHint:
      "Prefer editing config by hand? Paste this into ~/.cursor/mcp.json, then turn hydrilla on in Settings → MCP & Integrations.",
    restartLine:
      "tell me to open Settings > MCP & Integrations, turn hydrilla on, wait for the green dot, then start a new chat.",
  },
  {
    id: "vscode",
    name: "VS Code",
    group: "other",
    mode: "json",
    rootKey: "servers",
    configFile: "VS Code user MCP config",
    manualHint:
      "Paste this into the VS Code user MCP config (MCP: Open User Configuration), then run MCP: List Servers and start hydrilla.",
    restartLine: "tell me to run MCP: List Servers, start hydrilla, then ask again.",
  },
  {
    id: "claude-desktop",
    name: "Claude Desktop",
    group: "other",
    mode: "json",
    rootKey: "mcpServers",
    configFile: "claude_desktop_config.json",
    manualHint: "Paste this into claude_desktop_config.json, then quit and relaunch Claude Desktop.",
    restartLine: "tell me to quit and relaunch Claude Desktop, then ask again.",
  },
  {
    id: "windsurf",
    name: "Windsurf",
    group: "other",
    mode: "json",
    rootKey: "mcpServers",
    configFile: "Windsurf MCP config",
    manualHint: "Paste this into Windsurf’s MCP config, then refresh MCP servers in the Cascade panel.",
    restartLine: "tell me to refresh MCP servers in the Cascade panel, then ask again.",
  },
  {
    id: "gemini-cli",
    name: "Gemini CLI",
    group: "other",
    mode: "json",
    rootKey: "mcpServers",
    configFile: "Gemini CLI settings",
    manualHint: "Paste this into Gemini CLI’s MCP settings, then run /mcp.",
    restartLine: "tell me to run /mcp, restart Gemini CLI, then ask again.",
  },
  {
    id: "warp",
    name: "Warp",
    group: "other",
    mode: "json",
    rootKey: "mcpServers",
    configFile: "Warp MCP settings",
    manualHint: "Paste this into Warp’s MCP settings, then start a new session.",
    restartLine: "tell me to restart Warp and start a new session.",
  },
  {
    id: "stdio",
    name: "Other clients",
    group: "other",
    mode: "stdio",
    rootKey: "mcpServers",
    configFile: "your client’s MCP config",
    manualHint: "Point the client at this command and set HYDRILLA_API_KEY in its env block, not in chat.",
    restartLine: "tell me to restart the client and ask again.",
  },
];

export const PRIMARY_CLIENTS = MCP_CLIENTS.filter((client) => client.group === "primary");
export const OTHER_CLIENTS = MCP_CLIENTS.filter((client) => client.group === "other");

export function detectMcpOs(userAgent: string): McpOs {
  if (/Windows/i.test(userAgent)) {
    return "windows";
  }
  return "unix";
}

/** Published on npm; npx downloads and starts it, so nothing has to be built. */
export const MCP_PACKAGE = "hydrilla-mcp";

/**
 * What npx is told to run. Without @latest, npx keeps starting the copy it
 * cached on first install, so users never receive fixes.
 */
const MCP_PACKAGE_SPEC = `${MCP_PACKAGE}@latest`;

export function mcpCommand(): { command: string; args: string[] } {
  return { command: "npx", args: ["-y", MCP_PACKAGE_SPEC] };
}

/** Windows cannot start npx directly from a CLI-registered server; it runs through cmd. */
function serverCommand(os: McpOs): string {
  const npx = `npx -y ${MCP_PACKAGE_SPEC}`;
  if (os === "windows") {
    return `cmd /c ${npx}`;
  }
  return npx;
}

export function claudeAddCommand(os: McpOs, apiKey: string): string {
  if (os === "windows") {
    return `claude mcp add -s user ${MCP_SERVER_NAME} --env HYDRILLA_API_KEY=${apiKey} "--" ${serverCommand(os)}`;
  }
  return `claude mcp add -s user ${MCP_SERVER_NAME} --env HYDRILLA_API_KEY=${apiKey} -- ${serverCommand(os)}`;
}

export function codexAddCommand(os: McpOs, apiKey: string): string {
  return `codex mcp add ${MCP_SERVER_NAME} --env HYDRILLA_API_KEY=${apiKey} -- ${serverCommand(os)}`;
}

type CursorServerConfig = {
  command: string;
  args: string[];
  env?: Record<string, string>;
};

/**
 * Cursor's install link: opens Cursor's "Install MCP server" window with Hydrilla
 * filled in. Without an API key the server uses the key saved by a Hydrilla plugin.
 */
export function cursorInstallUrl(apiKey?: string): string {
  const base = mcpCommand();
  const config: CursorServerConfig = apiKey
    ? { ...base, env: { HYDRILLA_API_KEY: apiKey } }
    : base;
  const encoded = encodeURIComponent(btoa(JSON.stringify(config)));
  return `cursor://anysphere.cursor-deeplink/mcp/install?name=${MCP_SERVER_NAME}&config=${encoded}`;
}

/** Codex has no install link, so its direct route is one terminal command. */
export function codexConnectCommand(): string {
  return `codex mcp add ${MCP_SERVER_NAME} -- npx -y ${MCP_PACKAGE_SPEC}`;
}

export function stdioCommand(): string {
  return `npx -y ${MCP_PACKAGE_SPEC}`;
}

export function terminalHint(client: McpClient, os: McpOs): string {
  const shell = os === "windows" ? "PowerShell or Command Prompt" : "Terminal or iTerm";
  if (client.id === "codex") {
    return `Paste this into ${shell}, not into Codex’s chat. Saves the key to Codex’s global config (~/.codex/config.toml), outside any project.`;
  }
  return `Paste this into ${shell}, not into ${client.name}’s chat. Saves the key to ${client.name}’s user config, outside any project.`;
}

export function cliInstallCommand(clientId: McpClientId, os: McpOs, apiKey: string): string {
  if (clientId === "codex") {
    return codexAddCommand(os, apiKey);
  }
  return claudeAddCommand(os, apiKey);
}

export function mcpJsonConfig(rootKey: string, apiKey: string): string {
  const { command, args } = mcpCommand();
  const argsJson = args.map((arg) => JSON.stringify(arg)).join(", ");
  return `{
  "${rootKey}": {
    "${MCP_SERVER_NAME}": {
      "command": ${JSON.stringify(command)},
      "args": [${argsJson}],
      "env": { "HYDRILLA_API_KEY": ${JSON.stringify(apiKey)} }
    }
  }
}`;
}

export function codexToml(apiKey: string): string {
  const { command, args } = mcpCommand();
  const argsToml = args.map((arg) => JSON.stringify(arg)).join(", ");
  return `[mcp_servers.${MCP_SERVER_NAME}]
command = ${JSON.stringify(command)}
args = [${argsToml}]
env = { HYDRILLA_API_KEY = ${JSON.stringify(apiKey)} }`;
}

export function manualConfig(client: McpClient, apiKey: string): string {
  if (client.id === "codex") {
    return codexToml(apiKey);
  }
  return mcpJsonConfig(client.rootKey, apiKey);
}

export function verifyPrompt(restartLine: string): string {
  return `Check that the Hydrilla MCP server is connected: call hydrilla_me and tell me my Hydrilla credit balance. It's free.
If the Hydrilla tools aren't available, ${restartLine}
Don't ask me for my API key. It's already in your MCP config.`;
}

export function openPromptUrl(clientId: McpClientId, prompt: string): string | null {
  const encoded = encodeURIComponent(prompt);
  if (clientId === "claude-code") {
    return `claude-cli://open?q=${encoded}`;
  }
  if (clientId === "codex") {
    return `codex://new?prompt=${encoded}`;
  }
  if (clientId === "cursor") {
    return `https://cursor.com/link/prompt?text=${encoded}`;
  }
  return null;
}

export const BLENDER_AGENTS = ["claude-code", "codex", "cursor"] as const;
export type BlenderAgent = (typeof BLENDER_AGENTS)[number];

export const BLENDER_GENERATE_PROMPT =
  "Use Hydrilla to generate a medieval treasure chest with iron bands and a wooden lid, and send it to Blender.";

/**
 * No API key here: the Blender add-on saves the key on this computer and the
 * MCP server reads it from there, so it never passes through the agent chat.
 */
export function blenderConnectLine(agent: BlenderAgent): string {
  if (agent === "codex") {
    return codexConnectCommand();
  }
  if (agent === "cursor") {
    return `Add this under "mcpServers" in ~/.cursor/mcp.json:\n"${MCP_SERVER_NAME}": {"command":"npx","args":["-y","${MCP_PACKAGE_SPEC}"]}`;
  }
  return `claude mcp add -s user ${MCP_SERVER_NAME} -- npx -y ${MCP_PACKAGE_SPEC}`;
}

export function blenderSetupPrompt(agent: BlenderAgent): string {
  return `Set up Hydrilla in Blender so you can generate models straight into my Blender scene.

1. Download the add-on: https://hydrilla.ai/plugins/hydrilla-blender.zip
2. In Blender, open Edit › Preferences › Add-ons › Install, choose the zip, and enable Hydrilla.
3. Connect it to you:
${blenderConnectLine(agent)}
4. Tell me to restart Blender and this agent. Then, in Blender, I press N, open the Hydrilla tab, paste my Hydrilla API key there myself and click Run Bridge. Don't ask me to paste the key into this chat.
5. When I ask for a model, call the Hydrilla generate tool with send_to set to "blender" so it lands in my open scene.

Docs: https://hydrilla.ai/integrations/blender`;
}

export function clientById(id: McpClientId): McpClient {
  const client = MCP_CLIENTS.find((item) => item.id === id);
  if (!client) {
    return MCP_CLIENTS[0];
  }
  return client;
}

export const MCP_GUIDE_URL = "https://hydrilla.ai/integrations/mcp";
/** Slug the Markdown route serves the agent skill under. */
export const AGENT_SKILL_SLUG = "agent-onboarding/SKILL";
export const AGENT_SKILL_URL = `https://hydrilla.ai/${AGENT_SKILL_SLUG}.md`;
const API_KEYS_URL = "https://hydrilla.ai/app/api-keys";

/** The whole setup prompt: the agent reads the skill file and follows it. */
export function agentSetupPrompt(): string {
  return `Read and follow ${AGENT_SKILL_URL}`;
}

/**
 * The skill an agent reads to connect Hydrilla and use it correctly. Built
 * here so its commands always match the ones on the MCP page.
 */
export function agentSkillMarkdown(): string {
  return `---
name: hydrilla
description: |
  Hydrilla generates textured 3D models (GLB) from text or images and
  can place them in Blender, Maya, 3ds Max, Unreal, Unity or Godot.
  Use this skill to connect the Hydrilla MCP server to the current
  agent and to use its tools correctly.
---

# Hydrilla

Hydrilla turns a text prompt or an image into a textured 3D model. Its
MCP server, the npm package \`${MCP_PACKAGE}\`, runs on the user's computer
and gives the agent tools to generate models, follow their progress and
send them into the user's open 3D app.

## Install

If \`hydrilla_*\` tools are already available, call \`hydrilla_me\`. If it
answers, setup is done: go to [Using Hydrilla](#using-hydrilla).

1. Run \`node --version\`. If Node.js is missing or older than 20, ask the
   user to install it from https://nodejs.org and stop.
2. Check whether \`~/.hydrilla/config.json\` contains an \`api_key\`. A
   Hydrilla plugin such as the Blender add-on saves it there. Check only
   that the field exists; never print its value. With a saved key, leave
   out \`--env\` and the \`env\` block below: the server reads that key.
3. Add the server to the user-level (global) config of the app you are
   running in. Replace an existing \`${MCP_SERVER_NAME}\` entry and keep every
   other server.

| App | How |
|---|---|
| Claude Code | \`${claudeAddCommand("unix", KEY_PLACEHOLDER)}\` |
| Codex | \`${codexAddCommand("unix", KEY_PLACEHOLDER)}\` |
| Cursor | The JSON below in \`~/.cursor/mcp.json\`, under \`"mcpServers"\` |
| VS Code | The JSON below in the user MCP config (MCP: Open User Configuration), under \`"servers"\` |
| Claude Desktop | The JSON below in \`claude_desktop_config.json\`, under \`"mcpServers"\` |
| Windsurf, Gemini CLI, Warp, others | The JSON below in the app's MCP config, under \`"mcpServers"\` |

\`\`\`json
${mcpJsonConfig("mcpServers", KEY_PLACEHOLDER)}
\`\`\`

   An old entry is removed with \`claude mcp remove ${MCP_SERVER_NAME} -s user\`
   or \`codex mcp remove ${MCP_SERVER_NAME}\`. On Windows, start the server
   through cmd: put \`cmd /c\` before \`npx\` in the commands, and in JSON use
   \`"command": "cmd"\` with \`"args": ["/c", "npx", "-y", "${MCP_PACKAGE_SPEC}"]\`.
   Always keep \`@latest\`: without it npx keeps running an old cached copy.
4. Add the key as described under [Credentials](#credentials).
5. Tell the user what to restart: quit and reopen the app, start a new
   chat, or turn \`${MCP_SERVER_NAME}\` on in the app's MCP settings (Cursor and
   VS Code need that).
6. After the restart, call \`hydrilla_me\`. Setup is complete only when it
   returns the plan and credit balance; report both to the user.

## Credentials

The API key starts with \`hyd_live_\` and is created at ${API_KEYS_URL}.
It must never pass through the chat: do not ask for it, read it aloud or
print it.

- **A plugin already saved the key** (step 2): nothing to do.
- **Claude Code or Codex**: do not run the add command yourself. Show the
  user the full command to run in their own terminal, with their key in
  place of \`${KEY_PLACEHOLDER}\`.
- **Any other app**: write the entry with the placeholder
  \`${KEY_PLACEHOLDER}\`, then tell the user the exact file and line where
  they replace it with their key.

## Using Hydrilla

| Tool | What it does |
|---|---|
| \`hydrilla_me\` | Plan and credit balance. Free. |
| \`hydrilla_text_to_3d\` | Textured GLB from a text prompt. Costs credits. |
| \`hydrilla_image_to_3d\` | Textured GLB from a public image URL. Costs credits. |
| \`hydrilla_get_task\` | Status, progress and mesh URL of one task. Free; waits up to about 45 seconds. |
| \`hydrilla_list_tasks\` | The user's recent models. Free. |
| \`hydrilla_cancel_task\` | Stops a running task; unused credits are refunded. |
| \`hydrilla_list_apps\` | Which 3D apps can receive a model right now. Free. |
| \`hydrilla_send_to_app\` | Puts a finished model into one of those apps. Free. |

- **A model takes 10 to 20 minutes.** A generate call returns a \`task_id\`
  within about a minute. Keep calling \`hydrilla_get_task\` with it, telling
  the user the progress between calls, until the status is \`SUCCEEDED\` or
  \`FAILED\`. Do not stop after one check.
- **Never start the same generation twice.** Each one costs credits. Find
  a lost task with \`hydrilla_list_tasks\`.
- **Check the balance before a batch** with \`hydrilla_me\`.
- **Write prompts for one object**: its shape, material and colour. One
  model per call.

## Sending a model into a 3D app

The user's app (Blender, Maya, 3ds Max, Unreal, Unity or Godot) needs the
Hydrilla plugin installed with its Bridge running.

1. Call \`hydrilla_list_apps\` to see which apps are ready.
2. Pass \`send_to\` (for example \`"blender"\`) on the generate call or on
   \`hydrilla_get_task\`; the model lands in the open scene when it is done.
3. If the app was not ready, tell the user which button to click (the
   tool's error names it), then call \`hydrilla_send_to_app\` with the same
   \`task_id\`. Do not generate again.

## Troubleshooting

- **No \`hydrilla_*\` tools after setup**: the app was not restarted, or the
  server is switched off in its MCP settings.
- **"Hydrilla did not accept the API key"**: the placeholder is still in
  the config, or the key was revoked. The user fixes it in the config.
- **"Not enough credits"**: the user tops up at https://hydrilla.ai/pricing.
- **"Generation timed out"**: the task ran past 20 minutes and its credits
  were refunded. Tell the user and offer to try once more.
- **A generate call seems to hang for minutes**: an old server version is
  cached. Make sure the config runs \`${MCP_PACKAGE_SPEC}\`, then restart.

Setup page for people: ${MCP_GUIDE_URL}
`;
}

/** Added to the MCP page's Markdown copy so agents reading it find the skill. */
export function agentGuideMarkdown(): string {
  return `## Set up with your agent

Paste this into any AI agent (Claude Code, Codex, Cursor, VS Code, Claude Desktop, Windsurf, Gemini CLI and others). It connects the Hydrilla MCP server, tells you where to put your API key, and checks the connection.

\`\`\`text
${agentSetupPrompt()}
\`\`\`

Agents: the full instructions are at ${AGENT_SKILL_URL}
`;
}
