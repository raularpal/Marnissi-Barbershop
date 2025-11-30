const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail', // Or use 'SMTP' host/port from env
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App Password for Gmail
    },
});

const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Marnissi Barbershop" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        // Don't throw, just log. We don't want to fail the booking if email fails (optional choice)
        // But user requirement says "Envío automático", so maybe we should alert.
        // For now, we log.
    }
};

module.exports = sendEmail;
