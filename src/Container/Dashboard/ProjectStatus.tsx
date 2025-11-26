import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { TrendingUp, Users, Briefcase, MousePointerClick, ArrowUpRight, ArrowUp, ArrowDown } from 'lucide-react';

// --- Mock Data: Traffic ---
const trafficData = [
  { name: 'ม.ค.', visitors: 2000, pageViews: 4000 },
  { name: 'ก.พ.', visitors: 3000, pageViews: 5500 },
  { name: 'มี.ค.', visitors: 2500, pageViews: 4800 },
  { name: 'เม.ย.', visitors: 4500, pageViews: 8000 },
  { name: 'พ.ค.', visitors: 3800, pageViews: 7200 },
  { name: 'มิ.ย.', visitors: 5800, pageViews: 9500 },
];

export default function ProjectStatus() {
  const [activeTab, setActiveTab] = useState<'traffic' | 'intern'>('traffic');
  
  // State ข้อมูล
  const [internGraphData, setInternGraphData] = useState<any[]>([]);
  const [totalApplicants, setTotalApplicants] = useState(0); // ✅ เก็บยอดผู้สมัครรวม
  const [latestGenCount, setLatestGenCount] = useState(0);

  const fetchGraphData = async () => {
    try {
      const res = await fetch('/api/intern');
      const rawData = res.ok ? await res.json() : [];
      const interns = Array.isArray(rawData) ? rawData : (rawData.data || []);

      // 1. เก็บยอดรวมผู้สมัครทั้งหมด (Real Data)
      setTotalApplicants(interns.length);

      // 2. Logic จัดกลุ่มกราฟ (เหมือนเดิม)
      const groupMap: Record<string, { applied: number, accepted: number }> = {};
      interns.forEach((intern: any) => {
        const genName = intern.gen ? `Gen ${intern.gen}` : 'Unknown';
        if (!groupMap[genName]) groupMap[genName] = { applied: 0, accepted: 0 };
        groupMap[genName].applied += 1;
        if (intern.status === 'approved' || intern.status === 'completed' || intern.status === 'active') {
          groupMap[genName].accepted += 1;
        }
      });

      const graphArray = Object.keys(groupMap).map(key => ({
        name: key, applied: groupMap[key].applied, accepted: groupMap[key].accepted
      }));

      graphArray.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
      setInternGraphData(graphArray);

      if (graphArray.length > 0) {
        setLatestGenCount(graphArray[graphArray.length - 1].applied);
      }
    } catch (error) { console.error("Error fetching graph data:", error); }
  };

  useEffect(() => { fetchGraphData(); }, []);

  // Tooltip สวยๆ
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-xl border border-white/50 text-xs">
          <p className="font-bold text-gray-700 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span className="text-gray-500 capitalize">{entry.name}:</span>
              <span className="font-bold text-gray-800">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`
      relative p-8 rounded-4xl bg-white/60 backdrop-blur-xl border border-white/80
      shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full flex flex-col transition-all duration-300
      hover:shadow-2xl
    `}>
      
      {/* --- ส่วนหัว (Header) --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
            {activeTab === 'traffic' ? (
                 <><TrendingUp className="text-blue-600"/> สถิติเว็บไซต์ (Traffic)</>
            ) : (
                 <><Briefcase className="text-orange-500"/> สถิติรับสมัคร (Interns)</>
            )}
          </h3>
          <p className="text-sm text-gray-400 mt-1 font-medium">
             ภาพรวมข้อมูลเชิงลึกและการเติบโต
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100/50 p-1.5 rounded-xl backdrop-blur-sm border border-white/50">
          <button onClick={() => setActiveTab('traffic')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${activeTab === 'traffic' ? 'bg-white text-blue-600 shadow-sm scale-105' : 'text-gray-500 hover:text-gray-700'}`}>Traffic</button>
          <button onClick={() => setActiveTab('intern')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${activeTab === 'intern' ? 'bg-white text-orange-600 shadow-sm scale-105' : 'text-gray-500 hover:text-gray-700'}`}>Recruitment</button>
        </div>
      </div>

      {/* --- ✅✅ ส่วนการ์ดตัวเลข (ย้ายจากข้างบนมาใส่ตรงนี้) ✅✅ --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          
          {/* Card 1: Visitors (Mock) */}
          <div className="relative p-5 rounded-2xl bg-blue-50/40 hover:shadow-[0_10px_40px_-10px_rgba(59,130,246,0.5)] transition-all duration-300 flex items-center gap-5 group">
             <div className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm text-blue-500 bg-blue-100 group-hover:scale-110 transition-transform">
                <Users size={24} />
             </div>
             <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">TOTAL VISITORS</p>
                <div className="flex items-baseline gap-2">
                   <h3 className="text-3xl font-black bg-linear-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">12,340</h3>
                   <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-green-100 text-green-700 flex items-center gap-0.5"><ArrowUp size={10}/> +12.5%</span>
                </div>
                <p className="text-gray-500 text-xs truncate mt-0.5">ยอดเข้าชมเว็บไซต์</p>
             </div>
          </div>

          {/* Card 2: Applicants (Real Data) */}
          <div className="relative p-5 rounded-2xl bg-fuchsia-50/40 hover:shadow-[0_10px_40px_-10px_rgba(217,70,239,0.5)] transition-all duration-300 flex items-center gap-5 group">
             <div className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm text-fuchsia-500 bg-fuchsia-100 group-hover:scale-110 transition-transform">
                <TrendingUp size={24} />
             </div>
             <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">TOTAL APPLICANTS</p>
                <div className="flex items-baseline gap-2">
                   <h3 className="text-3xl font-black bg-linear-to-r from-fuchsia-600 to-pink-500 bg-clip-text text-transparent animate-in fade-in">
                      {totalApplicants}
                   </h3>
                   <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-green-100 text-green-700 flex items-center gap-0.5"><ArrowUp size={10}/> +New</span>
                </div>
                <p className="text-gray-500 text-xs truncate mt-0.5">ใบสมัครทั้งหมด</p>
             </div>
          </div>
      </div>

      {/* --- ส่วนกราฟ (Graphs) --- */}
      <div className="flex-1 w-full min-h-[300px]">
        {activeTab === 'traffic' && (
          <div className="h-full animate-in fade-in zoom-in duration-500">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={0.5} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af', fontWeight: 500}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af', fontWeight: 500}} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="visitors" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVis)" name="Visitors"/>
                    <Area type="monotone" dataKey="pageViews" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorPv)" name="Page Views"/>
                </AreaChart>
             </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'intern' && (
          <div className="h-full animate-in fade-in zoom-in duration-500">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={internGraphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={30}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={0.5}/>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af', fontWeight: 500}} dy={10}/>
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af', fontWeight: 500}}/>
                    <Tooltip content={<CustomTooltip />} cursor={{fill: '#f3f4f6', radius: 8}} />
                    <Legend verticalAlign="top" align="right" height={30} iconType="circle" wrapperStyle={{ top: -10, right: 0, fontSize: '12px', fontWeight: 600 }} />
                    <Bar dataKey="applied" name="ผู้สมัคร" fill="#fdba74" radius={[6, 6, 6, 6]} />
                    <Bar dataKey="accepted" name="รับจริง" fill="#f97316" radius={[6, 6, 6, 6]} />
                </BarChart>
             </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}