const User = require("../models/User");
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Emergency numbers (You would typically store these in a configuration file or database)
const EMERGENCY_NUMBERS = [
    { name: 'Police', number: '100' },
    { name: 'Ambulance', number: '108' }
];

exports.sendEmergencyAlert = async (req, res) => {
    try {
        const { latitude, longitude, timestamp } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create emergency message
        const emergencyMessage = `
EMERGENCY ALERT!
User: ${user.fullName}
Location: https://www.google.com/maps?q=${latitude},${longitude}
Time: ${new Date(timestamp).toLocaleString()}
Contact: ${user.phoneNumber}

Please respond immediately. This is an emergency alert from the Carpooling App.`;

        // Send SMS to emergency contacts using Twilio
        const messagePromises = EMERGENCY_NUMBERS.map(contact =>
            client.messages.create({
                body: emergencyMessage,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: contact.number
            })
        );

        await Promise.all(messagePromises);

        // Log the emergency
        console.log('Emergency alert sent:', {
            userId: user._id,
            userName: user.fullName,
            location: { latitude, longitude },
            timestamp: timestamp
        });

        res.status(200).json({
            message: 'Emergency alert sent successfully',
            emergencyContacts: EMERGENCY_NUMBERS
        });
    } catch (error) {
        console.error('Emergency alert error:', error);
        res.status(500).json({
            message: 'Failed to send emergency alert',
            error: error.message
        });
    }
};
