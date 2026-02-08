const User = require('../models/User');
const LawFirm = require('../models/LawFirm');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { firmName, ownerName, email, password } = req.body;
        console.log(`📝 Registration attempt for: ${email} (${firmName})`);

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('❌ Registration failed: Email already exists');
            return res.status(400).send({ error: 'البريد الإلكتروني مسجل مسبقاً' });
        }

        // Create Firm
        const firm = new LawFirm({ name: firmName, ownerEmail: email });
        await firm.save();

        // Create Admin User
        const user = new User({
            name: ownerName,
            email,
            password, // In production, hash this!
            role: 'Admin',
            lawFirmId: firm._id
        });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        console.log('✅ Registration successful');
        res.status(201).send({ user, token });
    } catch (error) {
        console.error('🔥 Registration Error:', error);
        res.status(400).send(error);
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`🔑 Login attempt for: ${email}`);
        const user = await User.findOne({ email });

        if (!user) {
            console.log('❌ User not found');
            return res.status(401).send({ error: 'Invalid login credentials' });
        }

        if (user.password !== password) {
            console.log('❌ Password mismatch');
            return res.status(401).send({ error: 'Invalid login credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        console.log('✅ Login successful');
        res.send({ user, token });
    } catch (error) {
        console.error('🔥 Login Error:', error);
        res.status(400).send(error);
    }
};

exports.changePassword = async (req, res) => {
    try {
        let { oldPassword, newPassword } = req.body;
        // Trim inputs to avoid space issues
        oldPassword = (oldPassword || '').trim();
        newPassword = (newPassword || '').trim();

        console.log(`🔐 Change password request for User ID: ${req.user._id}`);

        const user = await User.findById(req.user._id);

        if (!user) {
            console.log('❌ User not found in database during change password');
            return res.status(404).send({ error: 'المستخدم غير موجود' });
        }

        const storedPassword = (user.password || '').trim();
        console.log(`🔍 Comparing: Incoming: "${oldPassword}" vs DB: "${storedPassword}"`);

        if (storedPassword !== oldPassword) {
            console.log('❌ Password mismatch (after trim)');
            return res.status(400).send({ error: 'كلمة المرور القديمة غير صحيحة' });
        }

        user.password = newPassword;
        await user.save();

        console.log(`🔐 Password changed successfully for user: ${user.email}`);
        res.send({ message: 'تم تغيير كلمة المرور بنجاح' });
    } catch (error) {
        console.error('🔥 Change Password Error:', error);
        res.status(500).send(error);
    }
};
