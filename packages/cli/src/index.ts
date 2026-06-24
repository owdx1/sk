import { Command } from "commander";
import { sendTelegramMessage } from "sendkit-core";

const program = new Command();
program
    .name("sendkit")
    .description("sendkitter")
    .command("telegram")
    .argument("<chatId>", 'telegram chat ID')
    .argument("<message>", 'message to be sent')
    .action(async (chatId: string, message: string) => {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
            console.error("TELEGRAM_BOT_TOKEN environment variable is not set.");
            process.exit(1);
        }

        if (!chatId) {
            console.error("Missing telegram chat ID.");
            process.exit(1);
        }

        if (!message) {
            console.error("Missing message.");
            process.exit(1);
        }

        try {
            const result = await sendTelegramMessage({
                botToken,
                chatId,
                message
            })

            console.log(result.chatId, result.messageId);
        } catch (error) {
            const detail = error instanceof Error ? error.message: String(error);
            console.error(`Telegram API request failed: ${detail}`)
            process.exit(1);
        }
    })

program.parseAsync(process.argv);