const nodemailer = require('nodemailer');

async function sendEmail(toEmail, messageBody) {
    // Email settings
    const fromEmail = 'vanshkadam11@gmail.com';
    const fromPassword = 'ugtx hzrt hset cmaq'; // Use an App Password for Gmail

    // Create a transporter
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: fromEmail,
            pass: fromPassword,
        },
    });

    // Email options
    const mailOptions = {
        from: fromEmail,
        to: toEmail,
        subject: 'Notification',
        text: messageBody,
    };

    try {
        // Send email
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${toEmail}`);
    } catch (error) {
        console.error(`Error sending email to ${toEmail}:`, error);
    }
}

// Example usage
(async () => {
    const messageBody = 'you have been asked to supply Astitva HumanCare Foundation with the following : 10kg wheat';
    const emailList = [
        'vanshkadam11@gmail.com',
        'qazisami76@gmail.com',
        'tejasalvi47@gmail.com',
    ];

    for (const email of emailList) {
        await sendEmail(email, messageBody);
    }
})();
