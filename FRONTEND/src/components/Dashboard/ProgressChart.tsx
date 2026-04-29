import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const data = [
  { name: 'Mon', progress: 40 },
  { name: 'Tue', progress: 45 },
  { name: 'Wed', progress: 38 },
  { name: 'Thu', progress: 52 },
  { name: 'Fri', progress: 61 },
  { name: 'Sat', progress: 58 },
  { name: 'Sun', progress: 70 },
];

export default function ProgressChart() {
  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00B851" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#00B851" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1A1A1A" />
          <XAxis 
            dataKey="name" 
            stroke="#444" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: '#888' }}
          />
          <YAxis 
            stroke="#444" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: '#888' }}
            domain={[0, 100]}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#050505', border: '1px solid #1A1A1A', borderRadius: '4px' }}
            itemStyle={{ color: '#00B851', fontSize: '12px' }}
          />
          <Area 
            type="monotone" 
            dataKey="progress" 
            stroke="#00B851" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorProgress)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
