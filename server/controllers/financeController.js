const Invoice = require('../models/Invoice');

exports.getInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find({ lawFirmId: req.user.lawFirmId }).populate('caseId');
        res.send(invoices);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.createInvoice = async (req, res) => {
    try {
        const invoice = new Invoice({ ...req.body, lawFirmId: req.user.lawFirmId });
        await invoice.save();
        res.status(201).send(invoice);
    } catch (error) {
        res.status(400).send(error);
    }
};

exports.updateInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findOneAndUpdate(
            { _id: req.params.id, lawFirmId: req.user.lawFirmId },
            req.body,
            { new: true }
        );
        res.send(invoice);
    } catch (error) {
        res.status(400).send(error);
    }
};

exports.deleteInvoice = async (req, res) => {
    try {
        await Invoice.findOneAndDelete({ _id: req.params.id, lawFirmId: req.user.lawFirmId });
        res.send({ message: 'Invoice deleted successfully' });
    } catch (error) {
        res.status(500).send(error);
    }
};
