const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
    try {
        // Create transporter
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false // <-- Add this line to bypass SSL certificate verification
            }
        });

        // Send mail with defined transport object
        await transporter.sendMail({
            from: '"Dev Test Vantage Margin" <emmanuelihuomascholarship@gmail.com>',
            to,
            subject,
            text
        });

        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = sendEmail;
