const User = require('../models/User');

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({ lawFirmId: req.user.lawFirmId });
        res.send(users);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.createUser = async (req, res) => {
    try {
        // Check if email already exists
        const existing = await User.findOne({ email: req.body.email });
        if (existing) return res.status(400).send({ error: 'البريد الإلكتروني مستخدم بالفعل' });

        const user = new User({ ...req.body, lawFirmId: req.user.lawFirmId });
        await user.save();
        res.status(201).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
};

exports.updateUser = async (req, res) => {
    try {
        const updateData = { ...req.body };
        // Don't allow changing lawFirmId via this route
        delete updateData.lawFirmId;

        const user = await User.findOneAndUpdate(
            { _id: req.params.id, lawFirmId: req.user.lawFirmId },
            updateData,
            { new: true }
        );
        res.send(user);
    } catch (error) {
        res.status(400).send(error);
    }
};

exports.deleteUser = async (req, res) => {
    try {
        // Don't allow deleting the current admin user (self-deletion)
        if (req.params.id === req.user.id.toString()) {
            return res.status(400).send({ error: 'لا يمكنك حذف حسابك الحالي' });
        }

        await User.findOneAndDelete({ _id: req.params.id, lawFirmId: req.user.lawFirmId });
        res.send({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).send(error);
    }
};
