import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        default: 'demo-user', // For MVP
    },
    profile: {
        fullName: String,
        email: String,
    },
    notifications: {
        email: Boolean,
        push: Boolean,
        marketing: Boolean,
    },
    appearance: {
        theme: String,
        compactMode: Boolean,
    },
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
