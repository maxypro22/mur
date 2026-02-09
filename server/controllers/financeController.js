const Invoice = require('../models/Invoice');

exports.getInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find({ lawFirmId: req.user.lawFirmId }).populate('caseId').sort({ createdAt: -1 });
        res.send(invoices);
    } catch (error) {
        res.status(500).send({ error: 'فشل جلب الفواتير', details: error.message });
    }
};

exports.createInvoice = async (req, res) => {
    try {
        console.log('💰 Creating invoice:', req.body);
        const invoice = new Invoice({ ...req.body, lawFirmId: req.user.lawFirmId });
        await invoice.save();
        res.status(201).send(invoice);
    } catch (error) {
        res.status(400).send({ error: 'فشل إنشاء الفاتورة', details: error.message });
    }
};

exports.updateInvoice = async (req, res) => {
    try {
        const updateData = { ...req.body };
        delete updateData.lawFirmId;

        const invoice = await Invoice.findOneAndUpdate(
            { _id: req.params.id, lawFirmId: req.user.lawFirmId },
            updateData,
            { new: true, runValidators: true }
        );
        if (!invoice) return res.status(404).send({ error: 'الفاتورة غير موجودة' });
        res.send(invoice);
    } catch (error) {
        res.status(400).send({ error: 'فشل تحديث الفاتورة', details: error.message });
    }
};

exports.deleteInvoice = async (req, res) => {
    try {
        const result = await Invoice.findOneAndDelete({ _id: req.params.id, lawFirmId: req.user.lawFirmId });
        if (!result) return res.status(404).send({ error: 'الفاتورة غير موجودة للحذف' });
        res.send({ message: 'تم حذف الفاتورة بنجاح' });
    } catch (error) {
        res.status(500).send({ error: 'فشل حذف الفاتورة', details: error.message });
    }
};
