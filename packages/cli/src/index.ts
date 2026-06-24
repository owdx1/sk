import { Command } from "commander";

const program = new Command();


type TelegramResponse = {
    ok: boolean;
    result?: {
        message_id?: number;
    };
    description?: string;
}

program
    .name("sendkit")
    .description("sendkitter")
    .command("telegram")
    .argument("<chatId>", 'telegram chat ID')
    .argument("<message>", 'message to be sent')
    .action(async (chatId: string, message: string) => {

        const token = process.env.TELEGRAM_BOT_TOKEN;


        if (!token) {
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

        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message
            })
        });

        const data = (await response.json()) as TelegramResponse;

        if (!response.ok || !data.ok) {
            const detail = data.description ?? response.statusText;
            console.error(`Telegram API request failed: ${detail}`);
            process.exit(1);
        }

        const messageId = data.result?.message_id;

        console.log(`Sent Telegram message to chat: ${chatId}. ${messageId && `ID: ${messageId}`}`); 

    })

program.parseAsync(process.argv);