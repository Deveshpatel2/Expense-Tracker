const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// SQLite database
const sqliteDb = new sqlite3.Database('expense_tracker.db');

// PostgreSQL connection
const pgPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'expense_tracker',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
});

async function migrateTable(tableName, transformFn = null) {
    return new Promise((resolve, reject) => {
        console.log(`\n📦 Migrating ${tableName}...`);
        
        sqliteDb.all(`SELECT * FROM ${tableName}`, [], async (err, rows) => {
            if (err) {
                console.error(`Error reading ${tableName}:`, err);
                return reject(err);
            }

            if (rows.length === 0) {
                console.log(`   ✓ No data to migrate for ${tableName}`);
                return resolve();
            }

            console.log(`   Found ${rows.length} rows`);

            try {
                for (const row of rows) {
                    const data = transformFn ? transformFn(row) : row;
                    const columns = Object.keys(data);
                    const values = Object.values(data);
                    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
                    const columnNames = columns.map(col => `"${col}"`).join(', ');
                    
                    const query = `INSERT INTO ${tableName} (${columnNames}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
                    
                    await pgPool.query(query, values);
                }
                console.log(`   ✓ Migrated ${rows.length} rows to ${tableName}`);
                resolve();
            } catch (error) {
                console.error(`   ✗ Error migrating ${tableName}:`, error.message);
                reject(error);
            }
        });
    });
}

async function migrate() {
    try {
        console.log('🚀 Starting migration from SQLite to PostgreSQL...\n');

        // Read and execute PostgreSQL schema
        const schemaPath = path.join(__dirname, 'create_tables.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await pgPool.query(schema);
        console.log('✓ PostgreSQL schema created\n');

        // Migrate users
        await migrateTable('users', (row) => ({
            id: row.id,
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
            password: row.password,
            profilePicture: row.profilePicture,
            isGoogleUser: row.isGoogleUser === 1 || row.isGoogleUser === true,
            isGuest: row.isGuest === 1 || row.isGuest === true,
            isEmailVerified: row.isEmailVerified === 1 || row.isEmailVerified === true,
            emailVerificationToken: row.emailVerificationToken,
            emailVerificationExpires: row.emailVerificationExpires || null,
            failedLoginAttempts: row.failedLoginAttempts || 0,
            accountLockedUntil: row.accountLockedUntil || null,
            timezone: row.timezone || 'UTC',
            createdAt: row.createdAt,
            updatedAt: row.updatedAt
        }));

        // Migrate expenses
        await migrateTable('expenses');

        // Migrate budgets
        await migrateTable('budgets', (row) => ({
            ...row,
            isTemplate: row.isTemplate === 1 || row.isTemplate === true
        }));

        // Migrate recurring_expenses
        await migrateTable('recurring_expenses', (row) => ({
            ...row,
            isActive: row.isActive === 1 || row.isActive === true
        }));

        // Migrate categories
        await migrateTable('categories', (row) => ({
            ...row,
            isDefault: row.isDefault === 1 || row.isDefault === true,
            isActive: row.isActive === 1 || row.isActive === true
        }));

        // Migrate user_settings
        await migrateTable('user_settings');

        console.log('\n✅ Migration completed successfully!');
        console.log('\n📊 Summary:');
        
        // Count rows in PostgreSQL
        const tables = ['users', 'expenses', 'budgets', 'categories', 'recurring_expenses', 'user_settings'];
        for (const table of tables) {
            const result = await pgPool.query(`SELECT COUNT(*) FROM ${table}`);
            console.log(`   ${table}: ${result.rows[0].count} rows`);
        }

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    } finally {
        sqliteDb.close();
        await pgPool.end();
    }
}

migrate();



