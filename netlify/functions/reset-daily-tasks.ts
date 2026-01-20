import { store } from '../../src/lib/store';

export default async (req: Request) => {
    try {
        console.log('Resetting daily recurring tasks...');
        await store.resetDailyTasks();

        return new Response(JSON.stringify({ message: 'Daily tasks reset successful' }), {
            status: 200,
        });
    } catch (error) {
        console.error('Daily task reset failed:', error);
        return new Response(JSON.stringify({ error: 'Failed to reset daily tasks' }), {
            status: 500,
        });
    }
};

export const config = {
    schedule: "0 22 * * *" // 10 PM UTC (Midnight Jerusalem time approx)
};
