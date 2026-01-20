import React, { useState, useEffect, useRef } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, Users, Mail, ArrowUp, ChevronDown } from 'lucide-react';

export default function ProjectStatus() {
  const [activeTab, setActiveTab] = useState<'traffic' | 'newsletter'>('traffic');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const yearDropdownRef = useRef<HTMLDivElement>(null);

  // State ข้อมูล Traffic (Real Data)
  const [trafficData, setTrafficData] = useState<any[]>([]);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [growthPercent, setGrowthPercent] = useState('0');
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  // State ข้อมูล Newsletter
  const [newsletterGraphData, setNewsletterGraphData] = useState<any[]>([]);
  const [totalSubscribers, setTotalSubscribers] = useState(0);

  // Fetch Analytics Data (Traffic)
  const fetchAnalyticsData = async (year: number = selectedYear) => {
    try {
      const res = await fetch(`/api/analytics/stats?period=365&year=${year}`);
      const data = await res.json();

      if (data) {
        setTotalVisitors(data.totalViews || 0);
        setGrowthPercent(data.growth || '0');

        // Process data for chart - group by month
        const viewsByDay = data.viewsByDay || [];
        const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
        const monthData: Record<string, number> = {};

        // Initialize all months with 0
        months.forEach(month => monthData[month] = 0);

        viewsByDay.forEach((item: any) => {
          const date = new Date(item.date);
          const itemYear = date.getFullYear();
          const monthIndex = date.getMonth();
          const monthName = months[monthIndex];

          // Only count data for selected year
          if (itemYear === year) {
            monthData[monthName] += item.count;
          }
        });

        // Generate available years (2025-2035)
        const yearRange = Array.from({ length: 11 }, (_, i) => 2025 + i);
        setAvailableYears(yearRange);

        // Convert to array for chart - ALL 12 months
        const chartData = months.map(month => ({
          name: month,
          visitors: monthData[month] || 0,
        }));

        setTrafficData(chartData);
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      // Fallback to all 12 months with 0 data
      const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
      setTrafficData(months.map(month => ({ name: month, visitors: 0 })));

      // Still generate year range even on error (2025-2035)
      const yearRange = Array.from({ length: 11 }, (_, i) => 2025 + i);
      setAvailableYears(yearRange);
    }
  };

  // Fetch Newsletter Data
  const fetchNewsletterData = async (year: number = selectedYear) => {
    try {
      const res = await fetch('/api/newsletter');
      const json = await res.json();
      const subscribers = json.data || [];

      // Filter by selected year and count total
      const yearFilteredSubs = subscribers.filter((sub: any) => {
        const date = new Date(sub.createdAt);
        return date.getFullYear() === year;
      });

      setTotalSubscribers(yearFilteredSubs.length);

      const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
      const groupMap: Record<string, number> = {};
      months.forEach(m => groupMap[m] = 0);

      yearFilteredSubs.forEach((sub: any) => {
        const date = new Date(sub.createdAt);
        const monthIndex = date.getMonth();
        const monthName = months[monthIndex];
        if (groupMap[monthName] !== undefined) {
          groupMap[monthName] += 1;
        }
      });

      const graphArray = months.map(m => ({
        name: m,
        subscribers: groupMap[m]
      }));

      setNewsletterGraphData(graphArray);

    } catch (error) {
      console.error("Error fetching newsletter data:", error);
    }
  };

  useEffect(() => {
    fetchAnalyticsData(selectedYear);
    fetchNewsletterData(selectedYear);

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAnalyticsData(selectedYear);
      fetchNewsletterData(selectedYear);
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedYear]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target as Node)) {
        setIsYearDropdownOpen(false);
      }
    };

    if (isYearDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isYearDropdownOpen]);

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
              <span className="font-bold text-gray-800">{entry.value} คน</span>
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
              <><TrendingUp className="text-blue-600" /> สถิติเว็บไซต์ (Traffic)</>
            ) : (
              <><Mail className="text-purple-500" /> สถิติรับข่าวสาร (Newsletter)</>
            )}
          </h3>
          <p className="text-sm text-gray-400 mt-1 font-medium">
            ภาพรวมข้อมูลเชิงลึกและการเติบโต
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Year Dropdown Selector */}
          {availableYears.length > 0 && (
            <div className="relative" ref={yearDropdownRef}>
              <button
                onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-gray-100/50 border border-white/50 text-gray-700 hover:bg-white hover:shadow-sm transition-all duration-300"
              >
                <span>{selectedYear}</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isYearDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isYearDropdownOpen && (
                <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-xl border border-gray-200 py-2 min-w-[100px] z-50 animate-in fade-in zoom-in duration-200">
                  {availableYears.map(year => (
                    <button
                      key={year}
                      onClick={() => {
                        setSelectedYear(year);
                        setIsYearDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-sm font-semibold text-left transition-colors ${selectedYear === year
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab Switcher */}
          <div className="flex bg-gray-100/50 p-1.5 rounded-xl backdrop-blur-sm border border-white/50">
            <button onClick={() => setActiveTab('traffic')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${activeTab === 'traffic' ? 'bg-white text-blue-600 shadow-sm scale-105' : 'text-gray-500 hover:text-gray-700'}`}>Traffic</button>
            <button onClick={() => setActiveTab('newsletter')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${activeTab === 'newsletter' ? 'bg-white text-purple-600 shadow-sm scale-105' : 'text-gray-500 hover:text-gray-700'}`}>Newsletter</button>
          </div>
        </div>
      </div>

      {/* --- ส่วนการ์ดตัวเลข (Cards) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">

        {/* Card 1: Visitors (Real Data) */}
        <div className="relative p-5 rounded-2xl bg-blue-50/40 hover:shadow-[0_10px_40px_-10px_rgba(59,130,246,0.5)] transition-all duration-300 flex items-center gap-5 group">
          <div className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm text-blue-500 bg-blue-100 group-hover:scale-110 transition-transform">
            <Users size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">TOTAL VISITORS</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black bg-linear-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                {totalVisitors.toLocaleString()}
              </h3>
              {parseFloat(growthPercent) !== 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 ${parseFloat(growthPercent) >= 0
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
                  }`}>
                  <ArrowUp size={10} className={parseFloat(growthPercent) < 0 ? 'rotate-180' : ''} />
                  {growthPercent}%
                </span>
              )}
            </div>
            <p className="text-gray-500 text-xs truncate mt-0.5">ยอดเข้าชมเว็บไซต์</p>
          </div>
        </div>

        {/* Card 2: Subscribers (Real Data) */}
        {/* ✅ เปลี่ยนเป็นสีม่วง (Purple/Fuchsia) ให้เข้ากับ Newsletter */}
        <div className="relative p-5 rounded-2xl bg-purple-50/40 hover:shadow-[0_10px_40px_-10px_rgba(168,85,247,0.5)] transition-all duration-300 flex items-center gap-5 group">
          <div className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm text-purple-500 bg-purple-100 group-hover:scale-110 transition-transform">
            <Mail size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">TOTAL SUBSCRIBERS</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black bg-linear-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent animate-in fade-in">
                {totalSubscribers}
              </h3>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-green-100 text-green-700 flex items-center gap-0.5"><ArrowUp size={10} /> Active</span>
            </div>
            <p className="text-gray-500 text-xs truncate mt-0.5">ผู้ติดตามข่าวสารทั้งหมด</p>
          </div>
        </div>
      </div>

      {/* --- ส่วนกราฟ (Graphs) --- */}
      <div className="w-full min-h-[300px]">
        {activeTab === 'traffic' && (
          <div className="h-[300px] animate-in fade-in zoom-in duration-500">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 500 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6', radius: 8 }} />
                <Bar dataKey="visitors" name="ผู้เข้าชม" fill="#3b82f6" radius={[8, 8, 8, 8]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ✅ กราฟ Newsletter (Bar Chart สีม่วง) */}
        {activeTab === 'newsletter' && (
          <div className="h-[300px] animate-in fade-in zoom-in duration-500">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={newsletterGraphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 500 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6', radius: 8 }} />
                <Legend verticalAlign="top" align="right" height={30} iconType="circle" wrapperStyle={{ top: -10, right: 0, fontSize: '12px', fontWeight: 600 }} />
                <Bar dataKey="subscribers" name="ผู้ติดตามใหม่" fill="#a855f7" radius={[8, 8, 8, 8]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}