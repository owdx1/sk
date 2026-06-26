---
name: sendkit
description: Use sendkit to send Telegram messages from agents and CLI. Trigger whenever the user asks to send a Telegram message, mentions sendkit, needs to interact with the sendkit toolset, wants to verify sendkit is working (manually test the MCP or CLI), or needs to choose between the sendkit MCP tool and CLI workflows. Also trigger when the user asks about configuring notifications, sending alerts, or integrating Telegram messaging into their workflow — even if they don't explicitly say "sendkit."
---

## Overview

Sendkit is a minimal toolkit for sending messages, currently supporting Telegram via the Bot API. It provides two ways to send messages:

1. **MCP tool** — for agents (OpenCode, Cline, Claude Desktop, etc.)
2. **CLI** — for manual use in terminals, scripts, or when MCP is unavailable

Both paths call the same core `sendTelegramMessage` function which POSTs to `https://api.telegram.org/bot<token>/sendMessage`.

## MCP Workflow (Primary)

When running in an agent environment with the sendkit MCP server configured, use the `telegram` tool directly:

**Tool name:** `telegram`

**Parameters:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `chatId` | string | yes | Telegram chat ID to send the message to |
| `message` | string | yes | The message text to send |

**Example call:**
```
chatId: "123456789"
message: "Hello from sendkit!"
```

**Configuration** (already set up in this project via `opencode.json`):
- The MCP server runs via `npx -y @owdx-dev/sendkit-mcp`
- The `TELEGRAM_BOT_TOKEN` environment variable is set in the MCP config
- The tool is enabled and ready to use

**For users of other MCP clients** (Claude Desktop, Cline, etc.), add to `.mcp.json`:
```json
{
  "mcpServers": {
    "sendkit": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@owdx/sendkit-mcp"],
      "env": {
        "TELEGRAM_BOT_TOKEN": "<your-token>"
      }
    }
  }
}
```

## CLI Workflow (Fallback / Manual)

Use the CLI when MCP is not available, for manual testing, or in scripts.

### Setup (one-time)

```bash
sendkit init --telegram-bot-token "<token>"
```

This saves the token to `~/.config/sendkit/config.json` with restricted permissions.

### Send a message

```bash
sendkit telegram <chatId> <message>
```

**Example:**
```bash
sendkit telegram "123456789" "Hello from CLI!"
```

The bot token is read from `~/.config/sendkit/config.json` automatically.

## Verifying sendkit Works

### Verify MCP tool

Ask the agent to call the `telegram` tool with a test message to a known chat ID.

### Verify CLI

```bash
sendkit telegram "<your-chat-id>" "sendkit test: hello from CLI"
```

### Verify token directly (curl)

```bash
curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe"
```

## Troubleshooting

- **MCP tool not found**: Ensure `@owdx-dev/sendkit-mcp` is installed and the environment variable `TELEGRAM_BOT_TOKEN` is set in the MCP config
- **CLI not found**: Install with `npm install -g @owdx-dev/sendkit` or use `npx @owdx-dev/sendkit`
- **"chat not found"**: Verify the chat ID is correct. For user chats, the ID is numeric (can include a negative sign for groups/channels)
- **"bot token invalid"**: Check that the `TELEGRAM_BOT_TOKEN` is correct and not expired
- **Token in `.mcp.json` vs `opencode.json`**: The npm package name differs between config files — `@owdx/sendkit-mcp` (`.mcp.json`) vs `@owdx-dev/sendkit-mcp` (`opencode.json`). Both work; `@owdx-dev/sendkit-mcp` is the published name
