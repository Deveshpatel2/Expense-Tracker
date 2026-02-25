const app = require('./src/app');
const { PORT } = require('./src/config/constants');

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Spendora Backend running on http://0.0.0.0:${PORT}`);
});

process.on('SIGINT', () => {
    console.log('Shutting down server...');
    process.exit(0);
});
