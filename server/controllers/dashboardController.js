const User = require('../models/User');
const Case = require('../models/Case');
const Invoice = require('../models/Invoice');

exports.getStats = async (req, res) => {
    try {
        const lawFirmId = req.user.lawFirmId;

        const [lawyerCount, caseCount, paidInvoices, pendingInvoices] = await Promise.all([
            User.countDocuments({ lawFirmId, role: 'Lawyer' }),
            Case.countDocuments({ lawFirmId }),
            // Only fetch invoices if Super Admin or Accountant (though Admin currently has access to dashboard/stats)
            ['Super Admin', 'Accountant'].includes(req.user.role)
                ? Invoice.find({ lawFirmId, status: 'paid' })
                : Promise.resolve([]),
            ['Super Admin', 'Accountant'].includes(req.user.role)
                ? Invoice.find({ lawFirmId, status: 'pending' })
                : Promise.resolve([])
        ]);

        const totalRevenue = paidInvoices.reduce((acc, inv) => acc + inv.amount, 0);
        const totalPending = pendingInvoices.reduce((acc, inv) => acc + inv.amount, 0);

        res.send({
            lawyerCount,
            caseCount,
            totalRevenue: ['Super Admin', 'Accountant'].includes(req.user.role) ? totalRevenue : 0,
            totalPending: ['Super Admin', 'Accountant'].includes(req.user.role) ? totalPending : 0,
            recentActivity: []
        });
    } catch (error) {
        console.error('🔥 Dashboard Stats Error:', error);
        res.status(500).send({ error: 'فشل جلب الإحصائيات', details: error.message });
    }
};
