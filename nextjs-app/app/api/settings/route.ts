import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Settings from '@/lib/db/models/Settings';

export async function GET(request: NextRequest) {
    try {
        try {
            await dbConnect();
        } catch (dbError: any) {
            console.warn('MongoDB connection failed, returning default settings:', dbError.message);
            // Return default settings if DB is unavailable
            return NextResponse.json({
                userId: 'demo-user',
                profile: {
                    fullName: 'Demo User',
                    email: 'demo@autolawyer.com',
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
        }
        let settings = await Settings.findOne({ userId: 'demo-user' });

        if (!settings) {
            // Create default settings
            settings = await Settings.create({
                userId: 'demo-user',
                profile: {
                    fullName: 'Demo User',
                    email: 'demo@autolawyer.com',
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
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Settings fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        try {
            await dbConnect();
        } catch (dbError: any) {
            console.warn('MongoDB connection failed:', dbError.message);
            return NextResponse.json(
                { error: 'Database connection unavailable. Settings cannot be saved.' },
                { status: 503 }
            );
        }
        const body = await request.json();

        const settings = await Settings.findOneAndUpdate(
            { userId: 'demo-user' },
            { $set: body },
            { new: true, upsert: true }
        );

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Settings update error:', error);
        return NextResponse.json(
            { error: 'Failed to update settings' },
            { status: 500 }
        );
    }
}
