'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';

interface RiskChartProps {
    data: {
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
}

const COLORS = {
    critical: '#ef4444', // red-500
    high: '#f97316',     // orange-500
    medium: '#eab308',   // yellow-500
    low: '#22c55e'       // green-500
};

export function RiskChart({ data }: RiskChartProps) {
    const chartData = [
        { name: 'Critical', value: data.critical, color: COLORS.critical },
        { name: 'High', value: data.high, color: COLORS.high },
        { name: 'Medium', value: data.medium, color: COLORS.medium },
        { name: 'Low', value: data.low, color: COLORS.low },
    ].filter(d => d.value > 0);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-64 w-full bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 shadow-xl"
        >
            <h3 className="text-lg font-semibold text-white mb-4">Risk Distribution</h3>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
            </ResponsiveContainer>
        </motion.div>
    );
}
