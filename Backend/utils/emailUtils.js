const nodemailer = require('nodemailer');

// Create transporter object
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send email function
const sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html
        };

        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Email sending error:', error);
        return { success: false, error: error.message };
    }
};

// Template for ride request notification
const createRideRequestEmail = (rideDetails, requesterDetails) => {
    return `
        <h2>New Ride Request</h2>
        <p>Hello,</p>
        <p>You have received a new ride request for your journey.</p>
        <h3>Ride Details:</h3>
        <ul>
            <li>From: ${rideDetails.source}</li>
            <li>To: ${rideDetails.destination}</li>
            <li>Date: ${new Date(rideDetails.date).toLocaleDateString()}</li>
            <li>Time: ${rideDetails.time}</li>
        </ul>
        <h3>Requester Details:</h3>
        <ul>
            <li>Name: ${requesterDetails.name}</li>
            <li>Email: ${requesterDetails.email}</li>
            <li>Phone: ${requesterDetails.phone || 'Not provided'}</li>
        </ul>
        <p>Please login to your account to accept or decline this request.</p>
        <p>Best regards,<br>Carpool Team</p>
    `;
};

module.exports = {
    sendEmail,
    createRideRequestEmail
};