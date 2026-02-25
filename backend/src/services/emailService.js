const nodemailer = require('nodemailer');
const { EMAIL_USER, EMAIL_PASS } = require('../config/constants');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER || 'your-email@gmail.com',
        pass: EMAIL_PASS || 'your-app-password'
    }
});

const templates = {
    verification: (name, token) => ({
        subject: 'Verify Your Email - Spendora',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #4F46E5;">Welcome to Spendora!</h2>
                <p>Hi ${name},</p>
                <p>Please verify your email address to start tracking your expenses:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="http://localhost:3000/verify-email?token=${token}" 
                       style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                        Verify Email Address
                    </a>
                </div>
                <p style="font-size: 12px; color: #666;">This link expires in 24 hours.</p>
            </div>
        `
    }),
    passwordReset: (name, token) => ({
        subject: 'Reset Your Password - Spendora',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #4F46E5;">Password Reset</h2>
                <p>Hi ${name},</p>
                <p>Click below to reset your password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="http://localhost:3000/reset-password?token=${token}" 
                       style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                        Reset Password
                    </a>
                </div>
                <p style="font-size: 12px; color: #666;">This link expires in 1 hour.</p>
            </div>
        `
    })
};

const sendEmail = async (to, templateName, data) => {
    const template = templates[templateName](data.name, data.token);
    try {
        await transporter.sendMail({
            from: EMAIL_USER,
            to,
            subject: template.subject,
            html: template.html
        });
        return true;
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        return false;
    }
};

module.exports = { sendEmail };
