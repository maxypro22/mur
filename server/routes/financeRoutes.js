const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const { auth, checkRole } = require('../middleware/auth');

router.get('/invoices', auth, financeController.getInvoices);
router.post('/invoices', auth, checkRole(['Admin']), financeController.createInvoice);
router.put('/invoices/:id', auth, checkRole(['Admin']), financeController.updateInvoice);
router.delete('/invoices/:id', auth, checkRole(['Admin']), financeController.deleteInvoice);

module.exports = router;
