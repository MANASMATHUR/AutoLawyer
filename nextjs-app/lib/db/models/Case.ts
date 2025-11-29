import mongoose from 'mongoose';

const CaseSchema = new mongoose.Schema({
    case_id: {
        type: String,
        required: true,
        unique: true,
    },
    title: {
        type: String,
        default: 'Untitled Case',
    },
    status: {
        type: String,
        default: 'processing',
    },
    date: {
        type: Date,
        default: Date.now,
    },
    type: {
        type: String,
        default: 'Contract',
    },
    instructions: String,
    clauses: [mongoose.Schema.Types.Mixed],
    risks: [mongoose.Schema.Types.Mixed],
    redlines: mongoose.Schema.Types.Mixed,
    reports: mongoose.Schema.Types.Mixed,
    summary: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

export default mongoose.models.Case || mongoose.model('Case', CaseSchema);
