import React from "react";
import {
  CheckCircle2, Clock, AlertCircle, Calendar,
  TrendingUp, TrendingDown, MoreHorizontal, User
} from "lucide-react";

export default function ProjectDashboard({
  tasks = [],
  members = []
}: {
  tasks?: any[],
  members?: any[]
}) {
  // Calculate real stats
  const totalTasks = tasks.length;

  // Normalize status values so various sources (columns, strings) map to the same canonical states
  const normalizeStatus = (t: any) => {
    const s = (t.status || t.column || "").toString().toLowerCase();
    if (s.includes("done") || s.includes("completed")) return "completed";
    if (s.includes("progress") || s.includes("in progress") || s === "inprogress") return "inprogress";
    if (s.includes("todo") || s.includes("to do")) return "todo";
    return s || "";
  };

  const completedTasks = tasks.filter(t => normalizeStatus(t) === "completed").length;
  const inProgressTasks = tasks.filter(t => normalizeStatus(t) === "inprogress").length;

  const now = new Date();
  const overdueTasks = tasks.filter(t => t.rawDueDate && new Date(t.rawDueDate) < now && normalizeStatus(t) !== "completed").length;

  const stats = [
    { label: "Total Tasks", value: totalTasks, change: "+0%", trend: "up", icon: <CheckCircle2 className="text-blue-600" />, color: "bg-blue-50 text-blue-600" },
    { label: "In Progress", value: inProgressTasks, change: "+0%", trend: "up", icon: <Clock className="text-orange-600" />, color: "bg-orange-50 text-orange-600" },
    { label: "Completed", value: completedTasks, change: "+0%", trend: "up", icon: <CheckCircle2 className="text-green-600" />, color: "bg-green-50 text-green-600" },
    { label: "Overdue", value: overdueTasks, change: "+0%", trend: "down", icon: <AlertCircle className="text-red-600" />, color: "bg-red-50 text-red-600" },
  ];

  // Calculate workload per member
  const workload = members.map(m => {
    const memberTasks = tasks.filter(t => t.assignees?.some((a: any) => a.id === m.id) || t.memberIds?.includes(m.id));
    const done = memberTasks.filter(t => normalizeStatus(t) === "completed").length;
    return {
      name: m.name,
      role: m.position || "Member",
      tasks: memberTasks.length,
      done: done,
      avatar: m.color || "bg-blue-100 text-blue-600"
    };
  }).filter(m => m.tasks > 0).slice(0, 4);

  // CSS Chart Data (จำลองกราฟแท่ง)
  const chartData = [40, 70, 35, 90, 60, 80, 55];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="p-8 bg-slate-50/50 h-full overflow-y-auto custom-scrollbar">

      {/* 1. Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                {stat.icon}
              </div>
              {stat.trend === "up" ? (
                <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <TrendingUp size={14} className="mr-1" /> {stat.change}
                </span>
              ) : (
                <span className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                  <TrendingDown size={14} className="mr-1" /> {stat.change}
                </span>
              )}
            </div>
            <h3 className="text-3xl font-bold text-slate-800 mb-1">{stat.value}</h3>
            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* 2. Main Chart (Weekly Productivity) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Weekly Productivity</h3>
              <p className="text-sm text-slate-400">Tasks completed over the last 7 days</p>
            </div>
            <button className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-lg">
              <MoreHorizontal size={20} />
            </button>
          </div>

          {/* CSS Bar Chart Container */}
          <div className="h-64 flex items-end justify-between gap-4 px-2">
            {chartData.map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group cursor-pointer">
                <div className="relative w-full bg-slate-100 rounded-xl h-full flex items-end overflow-hidden">
                  <div
                    className="w-full bg-blue-500 rounded-t-xl transition-all duration-500 group-hover:bg-blue-600 relative"
                    style={{ height: `${height}%` }}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {height} Tasks
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-400 group-hover:text-blue-600 transition-colors">{days[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Team Workload */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Team Workload</h3>
          <div className="space-y-5">
            {workload.map((member, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${member.avatar}`}>
                  {member.name.substring(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <h4 className="text-sm font-bold text-slate-700">{member.name}</h4>
                    <span className="text-xs font-bold text-slate-500">{member.done}/{member.tasks}</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${member.done / member.tasks > 0.7 ? "bg-green-500" : "bg-blue-500"}`}
                      style={{ width: `${(member.done / member.tasks) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-8 py-2.5 border border-dashed border-slate-300 text-slate-500 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-400 transition-all">
            Manage Team
          </button>
        </div>

      </div>
    </div>
  );
}