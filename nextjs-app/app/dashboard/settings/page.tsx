'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Lock, User, Monitor, Save, Loader2 } from 'lucide-react';

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        profile: {
            fullName: '',
            email: '',
        },
        notifications: {
            email: true,
            push: false,
            marketing: false,
        },
        appearance: {
            theme: 'Dark',
            compactMode: false,
        },
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            setSettings(data);
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
            // Show success toast (mock)
            alert('Settings saved successfully!');
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="text-center py-12 text-gray-400">Loading settings...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                    <p className="text-gray-400">Manage your account preferences and application settings</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Save Changes
                </button>
            </div>

            <div className="grid gap-6">
                {/* Profile Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
                            <User size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white">Profile Information</h2>
                            <p className="text-sm text-gray-400">Update your personal details</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Full Name</label>
                            <input
                                type="text"
                                value={settings.profile.fullName}
                                onChange={(e) => setSettings({ ...settings, profile: { ...settings.profile, fullName: e.target.value } })}
                                className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Email Address</label>
                            <input
                                type="email"
                                value={settings.profile.email}
                                onChange={(e) => setSettings({ ...settings, profile: { ...settings.profile, email: e.target.value } })}
                                className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Notifications Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
                            <Bell size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white">Notifications</h2>
                            <p className="text-sm text-gray-400">Configure how you receive alerts</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-black/20">
                            <div>
                                <p className="font-medium text-white">Email Notifications</p>
                                <p className="text-sm text-gray-400">Receive updates about your cases via email</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.email}
                                    onChange={(e) => setSettings({ ...settings, notifications: { ...settings.notifications, email: e.target.checked } })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                            </label>
                        </div>
                    </div>
                </motion.div>

                {/* Appearance Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 rounded-lg bg-pink-500/10 text-pink-400">
                            <Monitor size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white">Appearance</h2>
                            <p className="text-sm text-gray-400">Customize the interface</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {['Dark', 'Light', 'System'].map((theme) => (
                            <button
                                key={theme}
                                onClick={() => setSettings({ ...settings, appearance: { ...settings.appearance, theme } })}
                                className={`p-4 rounded-lg border ${settings.appearance.theme === theme
                                        ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
                                        : 'bg-black/20 border-white/10 text-gray-400 hover:bg-white/5'
                                    } transition-all`}
                            >
                                {theme}
                            </button>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
