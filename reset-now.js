const { store } = require('./src/lib/store');

async function run() {
    console.log('Resetting leaderboard now...');
    await store.resetLeaderboard();
    console.log('Leaderboard reset complete.');
    process.exit(0);
}

run();
