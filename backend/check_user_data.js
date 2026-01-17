const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('expense_tracker.db', sqlite3.OPEN_READONLY);

const email = 'deveshpatel6870@gmail.com';

db.get("SELECT id FROM users WHERE email = ?", [email], (err, user) => {
    if (!user) {
        console.log("User not found:", email);
        return;
    }
    console.log("Found User ID:", user.id);
    db.all("SELECT * FROM expenses WHERE userId = ?", [user.id], (err, rows) => {
        console.log(`Expenses for ${email}:`, rows.length);
        if (rows.length > 0) {
            console.log("Sample expense:", rows[0]);
        }
    });
});
db.close();
