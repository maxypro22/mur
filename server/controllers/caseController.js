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
        const cases = await Case.find({ lawFirmId: req.user.lawFirmId });
        res.send(cases);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getCase = async (req, res) => {
    try {
        const caseItem = await Case.findOne({ _id: req.params.id, lawFirmId: req.user.lawFirmId });
        const hearings = await Hearing.find({ caseId: req.params.id });
        res.send({ caseItem, hearings });
    } catch (error) {
        res.status(404).send(error);
    }
};

exports.updateCase = async (req, res) => {
    try {
        const caseItem = await Case.findOneAndUpdate(
            { _id: req.params.id, lawFirmId: req.user.lawFirmId },
            req.body,
            { new: true }
        );
        res.send(caseItem);
    } catch (error) {
        res.status(400).send(error);
    }
};

exports.deleteCase = async (req, res) => {
    try {
        const caseItem = await Case.findOneAndDelete({ _id: req.params.id, lawFirmId: req.user.lawFirmId });
        // Also delete related hearings
        if (caseItem) {
            await Hearing.deleteMany({ caseId: req.params.id });
        }
        res.send({ message: 'Case deleted successfully' });
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.addHearing = async (req, res) => {
    try {
        const hearing = new Hearing({ ...req.body, lawFirmId: req.user.lawFirmId });
        await hearing.save();
        res.status(201).send(hearing);
    } catch (error) {
        res.status(400).send(error);
    }
};

exports.getHearings = async (req, res) => {
    try {
        const hearings = await Hearing.find({ lawFirmId: req.user.lawFirmId }).populate('caseId').sort({ date: 1 });
        res.send(hearings);
    } catch (error) {
        res.status(500).send(error);
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
        res.status(400).send(error);
    }
};

exports.deleteHearing = async (req, res) => {
    try {
        await Hearing.findOneAndDelete({ _id: req.params.id, lawFirmId: req.user.lawFirmId });
        res.send({ message: 'Hearing deleted successfully' });
    } catch (error) {
        res.status(500).send(error);
    }
};
