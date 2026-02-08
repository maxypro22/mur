const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
    caseNumber: { type: String, required: true },
    clientName: { type: String, required: true },
    clientPhone: { type: String },
    type: { type: String, required: true },
    court: { type: String },
    status: { type: String, enum: ['new', 'adjourned', 'closed'], default: 'new' },
    memo: { type: String },
    assignedLawyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lawFirmId: { type: mongoose.Schema.Types.ObjectId, ref: 'LawFirm', required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Case', caseSchema);
