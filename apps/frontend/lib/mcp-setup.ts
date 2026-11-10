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

export function mcpCommand(): { command: string; args: string[] } {
  return { command: "npx", args: ["-y", MCP_PACKAGE] };
}

/** Windows cannot start npx directly from a CLI-registered server; it runs through cmd. */
function serverCommand(os: McpOs): string {
  const npx = `npx -y ${MCP_PACKAGE}`;
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

export function stdioCommand(): string {
  return `npx -y ${MCP_PACKAGE}`;
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
    return `codex mcp add ${MCP_SERVER_NAME} -- npx -y ${MCP_PACKAGE}`;
  }
  if (agent === "cursor") {
    return `Add this under "mcpServers" in ~/.cursor/mcp.json:\n"${MCP_SERVER_NAME}": {"command":"npx","args":["-y","${MCP_PACKAGE}"]}`;
  }
  return `claude mcp add -s user ${MCP_SERVER_NAME} -- npx -y ${MCP_PACKAGE}`;
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
