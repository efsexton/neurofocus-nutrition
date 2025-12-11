import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function TrendsChart({ data, dataKey, color }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
        <XAxis dataKey="date" stroke="#78716c" fontSize={12} />
        <YAxis stroke="#78716c" fontSize={12} domain={[0, 10]} />
        <Tooltip
            contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #d6d3d1',
                borderRadius: '0.5rem',
            }}
        />
        <Legend wrapperStyle={{fontSize: "14px"}}/>
        <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            strokeWidth={2} 
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}