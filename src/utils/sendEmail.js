const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

const sendEmail = async (to, subject, text) => {
    try {
        // Create transporter
        const transporter = nodemailer.createTransport({
            host: 'mail.vantage-margin.net',
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

        // Combine subject and text into one object to pass to the EJS template
        const emailBody = {
            subject, // shorthand for subject: subject
            text,    // shorthand for text: text
        };

        // Render EJS template with dynamic data
        const htmlContent = await ejs.renderFile(
            path.join(__dirname, `../emails/vantage.ejs`),
            emailBody  // Pass the combined data object
        );

        // Send mail with defined transport object
        await transporter.sendMail({
            from: '"Vantage Margin" <support@vantage-margin.net>',
            to,
            subject: emailBody.subject, // set email subject
            html: htmlContent,          // set email content
        });

        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = sendEmail;
