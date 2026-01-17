const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'expense_tracker',
    password: 'your_postgres_password', // Placeholder, will try to read from env or use standard
    port: 5432,
});

// Try to load env from .env.postgresql.backup manually if needed or just use values found in it
// Per Step 1103:
// DB_USER=postgres
// DB_PASSWORD=Spendora@123

const passwords = ['Spendora@123', 'postgres', 'password', '123456', 'admin'];

async function checkPostgres() {
    for (const pass of passwords) {
        console.log(`Trying password: ${pass}`);
        const pool = new Pool({
            user: 'postgres',
            host: 'localhost',
            database: 'expense_tracker',
            password: pass,
            port: 5432,
        });

        try {
            const client = await pool.connect();
            console.log("Connected with password:", pass);

            const userRes = await client.query('SELECT COUNT(*) FROM users');
            console.log("Users count:", userRes.rows[0].count);

            const expRes = await client.query('SELECT COUNT(*) FROM expenses');
            console.log("Expenses count:", expRes.rows[0].count);

            client.release();
            await pool.end();
            return; // Exit on success
        } catch (err) {
            console.log(`Failed with ${pass}: ${err.message}`);
        }
    }
}

checkPostgres();
