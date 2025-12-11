import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SymptomFrequencyChart({ data }) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="name" stroke="#78716c" fontSize={12} />
                <YAxis stroke="#78716c" fontSize={12} allowDecimals={false} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #d6d3d1',
                        borderRadius: '0.5rem',
                    }}
                />
                <Bar dataKey="count" fill="#8b5cf6" barSize={40} />
            </BarChart>
        </ResponsiveContainer>
    );
}