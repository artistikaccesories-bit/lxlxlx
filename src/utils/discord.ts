const DISCORD_WEBHOOK_URL = import.meta.env.VITE_DISCORD_WEBHOOK_URL;

export const sendDiscordMessage = async (message: string) => {
    if (!DISCORD_WEBHOOK_URL) {
        console.warn('Discord Webhook URL is not configured.');
        return;
    }

    try {
        await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // keepalive true to ensure message sends even if page is closing
            keepalive: true,
            body: JSON.stringify({
                content: message,
            }),
        });
    } catch (error) {
        console.error('Error sending Discord message:', error);
    }
};
