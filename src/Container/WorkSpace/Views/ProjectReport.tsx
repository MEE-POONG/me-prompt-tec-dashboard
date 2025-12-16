import React, { useState } from "react";
import { 
  FileText, TrendingUp, ChevronDown, Download, 
  Calendar, Clock, User, CheckCircle2 
} from "lucide-react";

// Types
type ReportType = "Planning" | "Progress";

export default function ProjectReport() {
  const [reportType, setReportType] = useState<ReportType>("Planning");
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  // Mock Data
  const stats = {
    totalTasks: 3,
    totalTime: "0 mins",
    totalMembers: 4
  };

  const tasks = [
    { id: 1, name: "กฟหกฟหก", assignee: "-", start: "16 - 16 Dec 2025", time: "0 mins", status: "In Progress" },
    { id: 2, name: "ฟหกฟหกฟหก", assignee: "-", start: "16 - 16 Dec 2025", time: "0 mins", status: "To Do" },
    { id: 3, name: "กหฟกฟหก", assignee: "-", start: "16 - 16 Dec 2025", time: "0 mins", status: "Done" },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      
      {/* --- Toolbar --- */}
      <div className="px-6 py-4 bg-white border-b border-gray-200 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800">{reportType} Report</h2>
            
            {/* Report Type Selector */}
            <div className="relative">
                <button 
                    onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
                >
                    {reportType === "Planning" ? <FileText size={16}/> : <TrendingUp size={16}/>}
                    {reportType} Report
                    <ChevronDown size={14} className="text-gray-400"/>
                </button>

                {isTypeDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20 animate-in fade-in zoom-in-95">
                        <button 
                            onClick={() => { setReportType("Planning"); setIsTypeDropdownOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                            <FileText size={16} className="text-blue-500"/> Planning Report
                        </button>
                        <button 
                            onClick={() => { setReportType("Progress"); setIsTypeDropdownOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                            <TrendingUp size={16} className="text-green-500"/> Progress Report
                        </button>
                    </div>
                )}
            </div>
        </div>

        <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold border border-blue-100 hover:bg-blue-100 transition-all">
                This Week (14 - 20 Dec 2025) <ChevronDown size={14}/>
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-white transition-all">
                Estimate Time <ChevronDown size={14}/>
            </button>
            <button className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-95">
                <Download size={16}/> Export PDF
            </button>
        </div>
      </div>

      {/* --- Content (Scrollable) --- */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                  <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Total Tasks</h3>
                  <span className="text-4xl font-black text-gray-800">{stats.totalTasks}</span>
                  <span className="text-xs text-gray-400 mt-1 font-medium">Tasks</span>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                  <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Total Estimate Time</h3>
                  <span className="text-4xl font-black text-blue-600">{stats.totalTime}</span>
                  <span className="text-xs text-gray-400 mt-1 font-medium">Minutes</span>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                  <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Total Members</h3>
                  <span className="text-4xl font-black text-gray-800">{stats.totalMembers}</span>
                  <span className="text-xs text-gray-400 mt-1 font-medium">Active Members</span>
              </div>
          </div>

          {/* Chart Section (Only for Progress Report) */}
          {reportType === "Progress" && (
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-800 mb-6">Complete Tasks</h3>
                  <div className="h-64 w-full relative flex items-end px-4 pb-6">
                      {/* Grid Lines */}
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none px-4 pb-6 pt-4">
                          {[1, 0.75, 0.5, 0.25, 0].map((v, i) => (
                              <div key={i} className="w-full h-px bg-gray-100"></div>
                          ))}
                      </div>
                      
                      {/* SVG Line Chart (Mock) */}
                      <svg className="w-full h-full absolute inset-0 px-4 pb-6 pt-4 overflow-visible" preserveAspectRatio="none">
                          <defs>
                              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
                                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                              </linearGradient>
                          </defs>
                          <path 
                            d="M0,200 L150,200 L300,50 L450,200 L600,200 L750,200 L900,200" 
                            fill="none" 
                            stroke="#3B82F6" 
                            strokeWidth="3" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            className="drop-shadow-sm"
                          />
                          <path 
                            d="M0,200 L150,200 L300,50 L450,200 L600,200 L750,200 L900,200 L900,250 L0,250 Z" 
                            fill="url(#gradient)" 
                            stroke="none"
                          />
                          {/* Points */}
                          <circle cx="300" cy="50" r="5" className="fill-white stroke-blue-600 stroke-2" />
                      </svg>

                      {/* X-Axis Labels */}
                      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs font-bold text-gray-400 px-4">
                          <span>13-12-2025</span>
                          <span>15-12-2025</span>
                          <span>17-12-2025</span>
                          <span>19-12-2025</span>
                          <span>20-12-2025</span>
                      </div>
                  </div>
              </div>
          )}

          {/* Tasks Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="font-bold text-gray-800">All Tasks <span className="text-xs font-normal text-gray-500 ml-2">(14 - 20 Dec 2025)</span></h3>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-400 uppercase bg-white border-b border-gray-100">
                          <tr>
                              <th className="px-6 py-3 font-bold">Task Name</th>
                              <th className="px-6 py-3 font-bold">Assignee</th>
                              <th className="px-6 py-3 font-bold">Start/End Date</th>
                              <th className="px-6 py-3 font-bold text-right">Estimate Time</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                          {tasks.map((task) => (
                              <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-6 py-4 font-bold text-gray-800 flex items-center gap-2">
                                      {task.status === "Done" ? <CheckCircle2 size={16} className="text-green-500"/> : <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>}
                                      {task.name}
                                  </td>
                                  <td className="px-6 py-4">
                                      <div className="flex items-center gap-2 text-gray-500">
                                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs">
                                              <User size={12}/>
                                          </div>
                                          {task.assignee}
                                      </div>
                                  </td>
                                  <td className="px-6 py-4 text-gray-600 font-medium">
                                      {task.start}
                                  </td>
                                  <td className="px-6 py-4 text-right font-bold text-gray-800">
                                      {task.time}
                                  </td>
                              </tr>
                          ))}
                          {/* Empty Row for spacing look */}
                          <tr className="h-24">
                              <td colSpan={4} className="text-center text-gray-300 text-xs italic">End of report</td>
                          </tr>
                      </tbody>
                  </table>
              </div>
          </div>

      </div>
    </div>
  );
}