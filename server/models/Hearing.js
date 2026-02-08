const mongoose = require('mongoose');

const hearingSchema = new mongoose.Schema({
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    court: { type: String },
    result: { type: String },
    nextHearingDate: { type: Date },
    lawFirmId: { type: mongoose.Schema.Types.ObjectId, ref: 'LawFirm', required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Hearing', hearingSchema);
