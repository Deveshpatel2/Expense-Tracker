const app = require('./src/app');
const { PORT } = require('./src/config/constants');

app.locals.dbReady
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Spendora API running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Failed to initialize database:', err);
        process.exit(1);
    });
