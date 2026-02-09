const Case = require('../models/Case');
const Hearing = require('../models/Hearing');

exports.createCase = async (req, res) => {
    try {
        console.log('📝 Creating new case:', req.body);

        if (!req.user || !req.user.lawFirmId) {
            console.error('❌ Error: User or LawFirmId missing from request');
            return res.status(400).send({ error: 'بيانات المكتب غير متوفرة' });
        }

        const newCase = new Case({ ...req.body, lawFirmId: req.user.lawFirmId });
        await newCase.save();

        console.log('✅ Case created successfully');
        res.status(201).send(newCase);
    } catch (error) {
        console.error('🔥 Create Case Error:', error);
        res.status(400).send({
            error: 'فشل حفظ القضية',
            details: error.message
        });
    }
};

exports.getCases = async (req, res) => {
    try {
        console.log(`🔍 Fetching cases for Firm: ${req.user.lawFirmId}`);
        const cases = await Case.find({ lawFirmId: req.user.lawFirmId }).sort({ createdAt: -1 });
        res.send(cases);
    } catch (error) {
        console.error('🔥 Get Cases Error:', error);
        res.status(500).send({ error: 'فشل استرجاع القضايا', details: error.message });
    }
};

exports.getCase = async (req, res) => {
    try {
        console.log(`📖 Getting Case: ${req.params.id}`);
        const caseItem = await Case.findOne({ _id: req.params.id, lawFirmId: req.user.lawFirmId });
        if (!caseItem) return res.status(404).send({ error: 'القضية غير موجودة' });

        const hearings = await Hearing.find({ caseId: req.params.id });
        res.send({ caseItem, hearings });
    } catch (error) {
        console.error('🔥 Get Case Error:', error);
        res.status(404).send({ error: 'حدث خطأ أثناء جلب القضية', details: error.message });
    }
};

exports.updateCase = async (req, res) => {
    try {
        console.log(`📝 Updating Case: ${req.params.id}`);
        const updateData = { ...req.body };
        delete updateData.lawFirmId; // Protect lawFirmId from being overwritten

        const caseItem = await Case.findOneAndUpdate(
            { _id: req.params.id, lawFirmId: req.user.lawFirmId },
            updateData,
            { new: true, runValidators: true }
        );
        if (!caseItem) return res.status(404).send({ error: 'القضية غير موجودة للتعديل' });

        console.log('✅ Case updated successfully');
        res.send(caseItem);
    } catch (error) {
        console.error('🔥 Update Case Error:', error);
        res.status(400).send({ error: 'فشل تحديث بيانات القضية', details: error.message });
    }
};

exports.deleteCase = async (req, res) => {
    try {
        console.log(`🗑️ Deleting Case: ${req.params.id}`);
        const caseItem = await Case.findOneAndDelete({ _id: req.params.id, lawFirmId: req.user.lawFirmId });
        if (caseItem) {
            await Hearing.deleteMany({ caseId: req.params.id });
            console.log('✅ Case and related hearings deleted');
        }
        res.send({ message: 'تم حذف القضية بنجاح' });
    } catch (error) {
        console.error('🔥 Delete Case Error:', error);
        res.status(500).send({ error: 'فشل حذف القضية', details: error.message });
    }
};

exports.addHearing = async (req, res) => {
    try {
        console.log('📅 Adding new hearing:', req.body);
        const hearing = new Hearing({ ...req.body, lawFirmId: req.user.lawFirmId });
        await hearing.save();
        res.status(201).send(hearing);
    } catch (error) {
        console.error('🔥 Add Hearing Error:', error);
        res.status(400).send({ error: 'فشل إضافة الجلسة', details: error.message });
    }
};

exports.getHearings = async (req, res) => {
    try {
        const hearings = await Hearing.find({ lawFirmId: req.user.lawFirmId }).populate('caseId').sort({ date: 1 });
        res.send(hearings);
    } catch (error) {
        res.status(500).send({ error: 'فشل جلب الجلسات', details: error.message });
    }
};

exports.updateHearing = async (req, res) => {
    try {
        const hearing = await Hearing.findOneAndUpdate(
            { _id: req.params.id, lawFirmId: req.user.lawFirmId },
            req.body,
            { new: true }
        );
        res.send(hearing);
    } catch (error) {
        res.status(400).send({ error: 'فشل تحديث الجلسة', details: error.message });
    }
};

exports.deleteHearing = async (req, res) => {
    try {
        await Hearing.findOneAndDelete({ _id: req.params.id, lawFirmId: req.user.lawFirmId });
        res.send({ message: 'تم حذف الجلسة بنجاح' });
    } catch (error) {
        res.status(500).send({ error: 'فشل حذف الجلسة', details: error.message });
    }
};
