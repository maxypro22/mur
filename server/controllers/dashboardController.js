const User = require('../models/User');
const Case = require('../models/Case');
const Invoice = require('../models/Invoice');

exports.getStats = async (req, res) => {
    try {
        const lawFirmId = req.user.lawFirmId;

        const [lawyerCount, caseCount, paidInvoices, pendingInvoices] = await Promise.all([
            User.countDocuments({ lawFirmId, role: 'Lawyer' }),
            Case.countDocuments({ lawFirmId }),
            Invoice.find({ lawFirmId, status: 'paid' }),
            Invoice.find({ lawFirmId, status: 'pending' })
        ]);

        const totalRevenue = paidInvoices.reduce((acc, inv) => acc + inv.amount, 0);
        const totalPending = pendingInvoices.reduce((acc, inv) => acc + inv.amount, 0);

        res.send({
            lawyerCount,
            caseCount,
            totalRevenue,
            totalPending,
            recentActivity: [] // Placeholder for logs
        });
    } catch (error) {
        res.status(500).send(error);
    }
};
