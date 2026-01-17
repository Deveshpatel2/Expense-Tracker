const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('expense_tracker.db', sqlite3.OPEN_READONLY);

db.serialize(() => {
    db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
        console.log("Users count:", row ? row.count : 0);
    });
    db.get("SELECT COUNT(*) as count FROM expenses", (err, row) => {
        console.log("Expenses count:", row ? row.count : 0);
    });
    // Check for the user's specific email if known, or list emails
    db.all("SELECT email, firstName FROM users", (err, rows) => {
        console.log("User emails:", rows.map(r => r.email));
    });
});
db.close();
