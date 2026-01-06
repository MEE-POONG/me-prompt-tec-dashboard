import React, { useState } from "react";
import {
  FileText,
  TrendingUp,
  ChevronDown,
  CheckCircle2,
  User,
  ListTodo,
  Filter,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Types
type ReportType = "Planning" | "Progress";

export default function ProjectReport({
  tasks: allTasks = [],
  members = [],
}: {
  tasks?: any[];
  members?: any[];
}) {
  // States
  const [reportType, setReportType] = useState<ReportType>("Planning");

  // Dropdown UI States
  const [isTypeOpen, setIsTypeOpen] = useState(false);

  // --- Calculate Stats ---
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t) =>
    (t.status || "").toLowerCase().includes("done") || (t.status || "").toLowerCase().includes("completed")
  ).length;
  const inProgressTasks = allTasks.filter((t) =>
    (t.status || "").toLowerCase().includes("progress")
  ).length;
  const totalMembers = members.length;

  const stats = {
    totalTasks,
    totalMembers,
    completedTasks,
    inProgressTasks
  };

  // --- Mock Data for Chart (Progress Report) ---
  const chartData = [
    { name: "To Do", count: totalTasks - completedTasks - inProgressTasks },
    { name: "In Progress", count: inProgressTasks },
    { name: "Completed", count: completedTasks },
  ];
  const COLORS = ["#94a3b8", "#f97316", "#10b981"]; // Slate, Orange, Emerald

  // --- Display Data Table ---
  const tasks = allTasks.map((t) => {
    const member = typeof t.members?.[0] === "object" ? t.members[0] : null;
    return {
      id: t.id,
      name: t.title,
      assignee: member ? member.name : t.members?.[0] || "-",
      assigneeAvatar: member ? member.userAvatar || member.avatar : null,
      start: t.date || "No date",
      status: t.status || "To Do",
      priority: t.priority || "Normal",
    };
  });

  return (
    <div className="flex flex-col h-full bg-slate-50/50 relative overflow-hidden font-sans text-slate-800">
      
      {/* --- Toolbar --- */}
      <div className="px-8 py-5 bg-white border-b border-gray-200 flex flex-wrap items-center justify-between gap-4 shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
             <FileText size={24} />
          </div>
          <div>
             <h2 className="text-xl font-black text-slate-800 tracking-tight">Project Report</h2>
             <p className="text-xs text-slate-500 font-medium">Generate insights and track progress</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Report Type Selector Only */}
          <div className="relative">
            <button
              onClick={() => setIsTypeOpen(!isTypeOpen)}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all bg-white shadow-sm"
            >
              {reportType === "Planning" ? (
                <ListTodo size={16} className="text-blue-500" />
              ) : (
                <TrendingUp size={16} className="text-green-500" />
              )}
              {reportType} View
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {isTypeOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsTypeOpen(false)} />
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 animate-in fade-in zoom-in-95 z-20 overflow-hidden">
                  <button
                    onClick={() => { setReportType("Planning"); setIsTypeOpen(false); }}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <ListTodo size={16} className="text-blue-500" /> Planning View
                  </button>
                  <button
                    onClick={() => { setReportType("Progress"); setIsTypeOpen(false); }}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <TrendingUp size={16} className="text-green-500" /> Progress View
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* --- Content Area --- */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
        
        {/* 1. Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <ListTodo size={18} />
                    <span className="text-xs font-bold uppercase tracking-wider">Total Tasks</span>
                </div>
                <span className="text-4xl font-black text-slate-800">{stats.totalTasks}</span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <CheckCircle2 size={18} className="text-green-600"/>
                    <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
                </div>
                <span className="text-4xl font-black text-green-600">{stats.completedTasks}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <User size={18} className="text-purple-600"/>
                    <span className="text-xs font-bold uppercase tracking-wider">Team Members</span>
                </div>
                <span className="text-4xl font-black text-slate-800">{stats.totalMembers}</span>
            </div>
          </div>
        </div>

        {/* 2. Chart Section (Progress View Only) */}
        {reportType === "Progress" && (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
               <TrendingUp size={20} className="text-blue-500" /> Task Status Overview
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" barSize={32} radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 3. Tasks Table (Planning View) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 delay-75">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <div>
                <h3 className="font-bold text-slate-800 text-lg">Task Breakdown</h3>
                <p className="text-xs text-slate-400 mt-0.5">Detailed list of all activities</p>
            </div>
            <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"><Filter size={16}/></button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-bold">Task Name</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Assignee</th>
                  <th className="px-6 py-4 font-bold text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tasks.length > 0 ? (
                    tasks.map((task) => (
                    <tr
                        key={task.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                    >
                        <td className="px-6 py-4">
                            <span className="font-bold text-slate-700 block mb-0.5">{task.name}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                task.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 
                                task.priority === 'Low' ? 'bg-green-50 text-green-600 border-green-100' :
                                'bg-slate-50 text-slate-500 border-slate-200'
                            }`}>
                                {task.priority}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                                task.status.includes('Done') || task.status.includes('Complete') ? 'bg-green-100 text-green-700' :
                                task.status.includes('Progress') ? 'bg-orange-100 text-orange-700' :
                                'bg-slate-100 text-slate-600'
                            }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                    task.status.includes('Done') || task.status.includes('Complete') ? 'bg-green-500' :
                                    task.status.includes('Progress') ? 'bg-orange-500' :
                                    'bg-slate-400'
                                }`}></div>
                                {task.status}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold overflow-hidden text-slate-500">
                            {task.assigneeAvatar ? (
                                <img
                                src={task.assigneeAvatar}
                                alt={task.assignee}
                                className="w-full h-full object-cover"
                                />
                            ) : (
                                (task.assignee || "?").slice(0,1).toUpperCase()
                            )}
                            </div>
                            <span className="text-slate-600 font-medium">{task.assignee}</span>
                        </div>
                        </td>
                        <td className="px-6 py-4 text-right text-slate-500 font-medium">
                        {task.start}
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                            No tasks found for this period.
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}