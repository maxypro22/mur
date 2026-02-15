const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const upgradeUserToSuperAdmin = async (email) => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const user = await User.findOneAndUpdate(
            { email: email },
            { role: 'Super Admin' },
            { new: true }
        );

        if (user) {
            console.log(`🚀 User ${email} upgraded to Super Admin successfully!`);
        } else {
            console.log(`❌ User with email ${email} not found.`);
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('🔥 Error:', error.message);
    }
};

// Check for email argument
const email = process.argv[2];
if (!email) {
    console.log('Please provide a user email: node upgrade_user.js email@example.com');
} else {
    upgradeUserToSuperAdmin(email);
}
