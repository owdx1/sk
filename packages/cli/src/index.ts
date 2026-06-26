#!/usr/bin/env node
import { Command } from "commander";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { sendTelegramMessage } from "@owdx-dev/sendkit-core";
import { z } from "zod";

const configPath = join(homedir(), ".config", "sendkit", "config.json");

const cliConfigSchema = z.object({
  telegramBotToken: z.string().min(1).optional(),
});

const writeTelegramBotToken = (token: string) => {
  mkdirSync(dirname(configPath), { recursive: true });
  writeFileSync(configPath, `${JSON.stringify({ telegramBotToken: token }, null, 2)}\n`, {
    mode: 0o600,
  });
};

const getTelegramBotToken = (): string => {
  if (!existsSync(configPath)) {
    throw new Error("Telegram bot token is required. Run `sendkit init`");
  }
  const { telegramBotToken } = cliConfigSchema.parse(JSON.parse(readFileSync(configPath, "utf-8")));
  if (!telegramBotToken) {
    throw new Error("Telegram bot token is required. Run `sendkit init`");
  }
  return telegramBotToken;
};

const program = new Command();
program.name("sendkit").description("sendkitter");

program
  .command("init")
  .requiredOption("--telegram-bot-token <botToken>", "telegram bot token")
  .action(async (options: { telegramBotToken: string }) => {
    writeTelegramBotToken(options.telegramBotToken);
    console.log(`Saved CLI config into ${configPath}`);
  });

program
  .command("telegram")
  .argument("<chatId>", "telegram chat ID")
  .argument("<message>", "message to be sent")
  .action(async (chatId: string, message: string) => {
    const result = await sendTelegramMessage({
      botToken: getTelegramBotToken(),
      chatId,
      message,
    });
    console.log(JSON.stringify(result));
  });

await program.parseAsync(process.argv).catch((e) => {
  console.error(e instanceof Error ? e.message : String(e));
});
