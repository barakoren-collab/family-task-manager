import { store } from '../../src/lib/store';

export default async (req: Request) => {
    // Verify it's a scheduled call or has a secret key
    // Netlify adds 'x-netlify-event: scheduled' for cron jobs

    try {
        console.log('Resetting weekly leaderboard...');
        await store.resetLeaderboard();

        // In a real app, you'd also save the winner to 'leaderboard_history' here

        return new Response(JSON.stringify({ message: 'Leaderboard reset successful' }), {
            status: 200,
        });
    } catch (error) {
        console.error('Leaderboard reset failed:', error);
        return new Response(JSON.stringify({ error: 'Failed to reset leaderboard' }), {
            status: 500,
        });
    }
};

// Netlify Scheduled Function Config
export const config = {
    schedule: "0 21 * * 6" // 21:00 on Saturday (Jerusalem Time is usually handled by server TZ or manual offset, but UT-3 is typical for Jersualem in winter)
    // Actually, Cron is usually UTC. Jerusalem is UTC+2 (Standard) or UTC+3 (Daylight).
    // 21:00 Jerusalem = 19:00 UTC (Standard) or 18:00 UTC (Daylight)
    // "0 19 * * 6"
};
