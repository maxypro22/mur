const Case = require('../models/Case');
const Hearing = require('../models/Hearing');

exports.createCase = async (req, res) => {
    try {
        console.log('📝 Creating new case:', req.body);

        if (!req.user || !req.user.lawFirmId) {
            console.error('❌ Error: User or LawFirmId missing from request');
            return res.status(400).send({ error: 'بيانات المكتب غير متوفرة' });
        }

        const newCase = new Case({
            ...req.body,
            lawFirmId: req.user.lawFirmId,
            createdBy: req.user._id
        });
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
        if (!req.user || !req.user.lawFirmId) {
            console.error('❌ Error: User or LawFirmId missing during fetch');
            return res.status(401).send({ error: 'جلسة العمل انتهت، يرجى تسجيل الدخول مجدداً' });
        }

        console.log(`🔍 Fetching cases for Firm: ${req.user.lawFirmId} (Role: ${req.user.role})`);

        let query = { lawFirmId: req.user.lawFirmId };

        // RBAC: Lawyers only see their own cases
        if (req.user.role === 'Lawyer') {
            query.createdBy = req.user._id;
        }

        const cases = await Case.find(query)
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });
        res.send(cases);
    } catch (error) {
        console.error('🔥 Get Cases Error:', error);
        res.status(500).send({ error: 'فشل استرجاع القضايا', details: error.message });
    }
};

exports.getCase = async (req, res) => {
    try {
        console.log(`📖 Getting Case: ${req.params.id}`);
        let query = { _id: req.params.id, lawFirmId: req.user.lawFirmId };

        // RBAC: Lawyers can only get their own cases
        if (req.user.role === 'Lawyer') {
            query.createdBy = req.user._id;
        }

        const caseItem = await Case.findOne(query)
            .populate('createdBy', 'name');
        if (!caseItem) return res.status(404).send({ error: 'القضية غير موجودة أو ليس لديك صلاحية الوصول إليها' });

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
        delete updateData.createdBy; // Protect ownership

        let query = { _id: req.params.id, lawFirmId: req.user.lawFirmId };

        // RBAC: Lawyers can only update their own cases
        if (req.user.role === 'Lawyer') {
            query.createdBy = req.user._id;
        }

        const caseItem = await Case.findOneAndUpdate(
            query,
            updateData,
            { new: true, runValidators: true }
        );
        if (!caseItem) return res.status(404).send({ error: 'القضية غير موجودة أو ليس لديك صلاحية لتعديلها' });

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
        let query = { _id: req.params.id, lawFirmId: req.user.lawFirmId };

        // RBAC: Lawyers can only delete their own cases
        if (req.user.role === 'Lawyer') {
            query.createdBy = req.user._id;
        }

        const caseItem = await Case.findOneAndDelete(query);
        if (caseItem) {
            await Hearing.deleteMany({ caseId: req.params.id });
            console.log('✅ Case and related hearings deleted');
        } else {
            return res.status(404).send({ error: 'القضية غير موجودة أو ليس لديك صلاحية لحذفها' });
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
        const hearing = new Hearing({
            ...req.body,
            lawFirmId: req.user.lawFirmId,
            createdBy: req.user._id,
            showInAgenda: true
        });
        await hearing.save();
        res.status(201).send(hearing);
    } catch (error) {
        console.error('🔥 Add Hearing Error:', error);
        res.status(400).send({ error: 'فشل إضافة الجلسة', details: error.message });
    }
};

exports.getHearings = async (req, res) => {
    try {
        if (!req.user || !req.user.lawFirmId) {
            return res.status(401).send({ error: 'جلسة العمل انتهت' });
        }

        let query = { lawFirmId: req.user.lawFirmId, showInAgenda: true };

        // RBAC: Lawyers only see their own hearings in agenda
        if (req.user.role === 'Lawyer') {
            query.createdBy = req.user._id;
        }

        const hearings = await Hearing.find(query)
            .populate('caseId')
            .populate('createdBy', 'name')
            .sort({ date: 1 });
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
        // Soft delete: Just hide from agenda, don't remove from DB
        const hearing = await Hearing.findOneAndUpdate(
            { _id: req.params.id, lawFirmId: req.user.lawFirmId },
            { showInAgenda: false },
            { new: true }
        );
        if (!hearing) return res.status(404).send({ error: 'الجلسة غير موجودة' });
        res.send({ message: 'تمت إزالة الجلسة من الأجندة بنجاح' });
    } catch (error) {
        res.status(500).send({ error: 'فشل إزالة الجلسة', details: error.message });
    }
};
