/**
 * PostgreSQL Database Adapter
 * Provides SQLite-like API for easier migration
 */
const { pool, query } = require('./database');

class PostgreSQLAdapter {
    constructor() {
        this.connected = true;
    }

    // Mimic SQLite's serialize method (no-op for PostgreSQL)
    serialize(callback) {
        callback();
    }

    // Mimic SQLite's run method
    run(sql, params = [], callback) {
        // Convert SQLite syntax to PostgreSQL
        const { pgSql, paramArray } = this.convertSQLiteToPostgreSQL(sql, params);
        
        query(pgSql, paramArray)
            .then(result => {
                if (callback) {
                    callback(null, {
                        lastID: result.rows[0]?.id || null,
                        changes: result.rowCount || 0
                    });
                }
            })
            .catch(err => {
                if (callback) {
                    callback(err);
                } else {
                    console.error('Database error:', err);
                }
            });
    }

    // Mimic SQLite's get method (returns single row)
    get(sql, params = [], callback) {
        const { pgSql, paramArray } = this.convertSQLiteToPostgreSQL(sql, params);
        
        query(pgSql, paramArray)
            .then(result => {
                if (callback) {
                    callback(null, result.rows[0] || null);
                }
            })
            .catch(err => {
                if (callback) {
                    callback(err, null);
                } else {
                    console.error('Database error:', err);
                }
            });
    }

    // Mimic SQLite's all method (returns all rows)
    all(sql, params = [], callback) {
        const { pgSql, paramArray } = this.convertSQLiteToPostgreSQL(sql, params);
        
        query(pgSql, paramArray)
            .then(result => {
                if (callback) {
                    callback(null, result.rows || []);
                }
            })
            .catch(err => {
                if (callback) {
                    callback(err, []);
                } else {
                    console.error('Database error:', err);
                }
            });
    }

    // Convert SQLite syntax to PostgreSQL
    convertSQLiteToPostgreSQL(sql, params = []) {
        let pgSql = sql;
        const paramArray = [...params];

        // Handle INSERT OR IGNORE -> INSERT ... ON CONFLICT DO NOTHING
        if (pgSql.includes('INSERT OR IGNORE')) {
            // Try to detect primary key column (usually 'id')
            const tableMatch = pgSql.match(/INSERT OR IGNORE INTO\s+(\w+)/i);
            if (tableMatch) {
                const tableName = tableMatch[1];
                // Add ON CONFLICT clause - assuming primary key is 'id'
                pgSql = pgSql.replace(/INSERT OR IGNORE/i, 'INSERT');
                // Find the VALUES clause and add ON CONFLICT
                pgSql = pgSql.replace(/\)\s*;?$/, ') ON CONFLICT (id) DO NOTHING');
            }
        }

        // Convert ? placeholders to $1, $2, etc.
        let paramIndex = 1;
        pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);

        // Quote column names that might be reserved words or camelCase
        const columnNames = ['id', 'firstName', 'lastName', 'profilePicture', 'isGoogleUser', 
                           'isGuest', 'isEmailVerified', 'emailVerificationToken', 
                           'emailVerificationExpires', 'failedLoginAttempts', 'accountLockedUntil',
                           'createdAt', 'updatedAt', 'expenseDate', 'userId', 'budgetMonth',
                           'alertThreshold', 'isTemplate', 'templateName', 'startDate', 'endDate',
                           'isActive', 'isDefault', 'settingKey', 'settingValue', 'settingType'];
        
        columnNames.forEach(col => {
            // Only replace if it's a column name, not part of a string
            const regex = new RegExp(`\\b${col}\\b`, 'gi');
            pgSql = pgSql.replace(regex, `"${col}"`);
        });

        return { pgSql, paramArray };
    }

    // Close connection (for compatibility)
    close(callback) {
        pool.end()
            .then(() => {
                if (callback) callback(null);
            })
            .catch(err => {
                if (callback) callback(err);
            });
    }
}

module.exports = PostgreSQLAdapter;

