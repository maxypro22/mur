const User = require('../models/User');

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({ lawFirmId: req.user.lawFirmId }).sort({ createdAt: -1 });
        res.send(users);
    } catch (error) {
        res.status(500).send({ error: 'فشل جلب قائمة المستخدمين', details: error.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        console.log('👤 Creating new user:', req.body.email);
        const existing = await User.findOne({ email: req.body.email });
        if (existing) return res.status(400).send({ error: 'البريد الإلكتروني مستخدم بالفعل' });

        const user = new User({ ...req.body, lawFirmId: req.user.lawFirmId });
        await user.save();
        res.status(201).send(user);
    } catch (error) {
        res.status(400).send({ error: 'فشل إنشاء المستخدم', details: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        console.log(`📝 Updating User: ${req.params.id}`);
        const updateData = { ...req.body };
        delete updateData.lawFirmId; // Protect lawFirmId

        const user = await User.findOneAndUpdate(
            { _id: req.params.id, lawFirmId: req.user.lawFirmId },
            updateData,
            { new: true, runValidators: true }
        );
        if (!user) return res.status(404).send({ error: 'المستخدم غير موجود' });
        res.send(user);
    } catch (error) {
        res.status(400).send({ error: 'فشل تحديث بيانات المستخدم', details: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        console.log(`🗑️ Deleting User: ${req.params.id}`);
        if (req.params.id === req.user.id.toString()) {
            return res.status(400).send({ error: 'لا يمكنك حذف حسابك الحالي' });
        }

        const user = await User.findOneAndDelete({ _id: req.params.id, lawFirmId: req.user.lawFirmId });
        if (!user) return res.status(404).send({ error: 'المستخدم غير موجود للحذف' });
        res.send({ message: 'تم حذف المستخدم بنجاح' });
    } catch (error) {
        res.status(500).send({ error: 'فشل حذف المستخدم', details: error.message });
    }
};
