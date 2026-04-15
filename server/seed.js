const mongoose = require('mongoose');
const LawFirm = require('./models/LawFirm');
const User = require('./models/User');
require('dotenv').config();

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI);

    // Clear existing if needed
    await LawFirm.deleteMany({ ownerEmail: 'admin@almurqab.com' });
    await User.deleteMany({ email: 'admin@almurqab.com' });

    const firm = new LawFirm({
        name: 'المرقاب للمحاماة',
        ownerEmail: 'admin@almurqab.com',
        subscriptionStatus: 'active'
    });
    await firm.save();

    const user = new User({
        name: 'المدير العام',
        email: 'admin@almurqab.com',
        password: 'admin123',
        role: 'Admin',
        lawFirmId: firm._id
    });
    await user.save();

    console.log('✅ Seed successful! User: admin@almurqab.com / admin123');
    process.exit();
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
