import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

type Point = { name: string; progress: number };

interface ProgressChartProps {
  data?: Point[];
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function emptyWeek(): Point[] {
  const today = new Date();
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return { name: DAY_NAMES[d.getDay()], progress: 0 };
  });
}

export default function ProgressChart({ data }: ProgressChartProps) {
  const chartData = data && data.length > 0 ? data : emptyWeek();
  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
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
