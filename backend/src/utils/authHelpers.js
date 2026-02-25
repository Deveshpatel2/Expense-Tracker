const { db } = require('../config/database');

const checkAccountLockout = (user) => {
    if (user.accountLockedUntil && new Date(user.accountLockedUntil) > new Date()) {
        return {
            isLocked: true,
            lockoutTime: user.accountLockedUntil
        };
    }
    return { isLocked: false };
};

const incrementFailedAttempts = (userId) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT failedLoginAttempts FROM users WHERE id = ?', [userId], (err, user) => {
            if (err) return reject(err);

            const failedAttempts = (user.failedLoginAttempts || 0) + 1;
            let lockoutUntil = null;
            if (failedAttempts >= 5) {
                lockoutUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
            }

            db.run(
                'UPDATE users SET failedLoginAttempts = ?, accountLockedUntil = ? WHERE id = ?',
                [failedAttempts, lockoutUntil, userId],
                (err) => {
                    if (err) reject(err);
                    else resolve({ failedAttempts, isLocked: !!lockoutUntil });
                }
            );
        });
    });
};

const resetFailedAttempts = (userId) => {
    return new Promise((resolve, reject) => {
        db.run(
            'UPDATE users SET failedLoginAttempts = 0, accountLockedUntil = NULL WHERE id = ?',
            [userId],
            (err) => {
                if (err) reject(err);
                else resolve();
            }
        );
    });
};

module.exports = {
    checkAccountLockout,
    incrementFailedAttempts,
    resetFailedAttempts
};
