import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'W1', score: 20 },
  { name: 'W2', score: 45 },
  { name: 'W3', score: 38 },
  { name: 'W4', score: 65 },
  { name: 'W5', score: 72 },
  { name: 'W6', score: 88 },
];

export default function ProgressChart() {
  return (
    <div className="h-64 w-full bg-black/20 rounded p-4 border border-border">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#555" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            fontFamily="var(--font-mono)"
          />
          <YAxis 
            stroke="#555" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            fontFamily="var(--font-mono)"
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#121212', border: '1px solid #222', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '10px' }}
            itemStyle={{ color: '#00DF5D' }}
          />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#00DF5D" 
            strokeWidth={2} 
            dot={{ fill: '#00DF5D', r: 3 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
