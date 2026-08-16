const { db } = require('../config/database');
const { LOCKOUT_THRESHOLD, LOCKOUT_MINUTES } = require('../config/constants');

const checkAccountLockout = (user) => {
    if (user.accountLockedUntil && new Date(user.accountLockedUntil) > new Date()) {
        return { isLocked: true, lockoutTime: user.accountLockedUntil };
    }
    return { isLocked: false };
};

const incrementFailedAttempts = (userId) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT failedLoginAttempts FROM users WHERE id = ?', [userId], (err, user) => {
            if (err) return reject(err);

            const failedAttempts = (user.failedLoginAttempts || 0) + 1;
            const lockoutUntil = failedAttempts >= LOCKOUT_THRESHOLD
                ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000).toISOString()
                : null;

            db.run(
                'UPDATE users SET failedLoginAttempts = ?, accountLockedUntil = ? WHERE id = ?',
                [failedAttempts, lockoutUntil, userId],
                (updateErr) => {
                    if (updateErr) reject(updateErr);
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
            (err) => (err ? reject(err) : resolve())
        );
    });
};

module.exports = {
    checkAccountLockout,
    incrementFailedAttempts,
    resetFailedAttempts
};
