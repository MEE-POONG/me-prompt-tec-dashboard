import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ListTodo,
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon, // Icon for header
} from "lucide-react";
import { getBoard } from "@/lib/api/workspace";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'; // ต้อง install recharts

// ถ้ายังไม่มี recharts ให้รัน: npm install recharts

export default function ProjectDashboard({
  boardId,
  tasks = [],
  members = [],
}: {
  boardId?: string;
  tasks?: any[];
  members?: any[];
}) {
  const [localTasks, setLocalTasks] = useState<any[]>(tasks || []);
  const [localColumns, setLocalColumns] = useState<any[]>([]);

  useEffect(() => {
    if (!boardId) {
      setLocalTasks(tasks || []);
      setLocalColumns([]);
      return;
    }

    let cancelled = false;
    const fetch = async () => {
      try {
        const board = await getBoard(String(boardId));
        const cols = board.columns || [];
        const tasksFromCols = cols.flatMap((c: any) =>
          (c.tasks || []).map((t: any) => ({ ...t, columnTitle: c.title }))
        );
        if (!cancelled) {
          setLocalColumns(cols);
          setLocalTasks(tasksFromCols);
        }
      } catch (e) {
        console.error("Failed to fetch board tasks for dashboard", e);
      }
    };

    fetch();

    const url = `/api/realtime/stream?channel=${encodeURIComponent(
      String(boardId)
    )}`;

    let es: EventSource | null = null;

    try {
      es = new EventSource(url);

      es.onmessage = (ev) => {
        try {
          // Check if data is valid JSON before parsing
          if (!ev.data || ev.data.trim().startsWith('<')) {
            console.warn("Received HTML instead of JSON, closing SSE connection");
            es?.close();
            return;
          }

          const data = JSON.parse(ev.data);
          const { type } = data;
          if (!type) return;
          if (type.startsWith("task:")) {
            fetch();
          }
        } catch (e) {
          console.error("Invalid SSE payload", e);
          // Close connection on parse error to prevent continuous errors
          es?.close();
        }
      };

      es.onerror = (error) => {
        console.warn("SSE connection error, closing connection", error);
        es?.close();
      };
    } catch (error) {
      console.error("Failed to create EventSource", error);
    }

    return () => {
      cancelled = true;
      es?.close();
    };
  }, [boardId]);

  // Calculate stats
  const totalTasks =
    localColumns.length > 0
      ? localColumns.reduce(
        (acc, c) => acc + ((c.tasks && c.tasks.length) || 0),
        0
      )
      : localTasks.length;

  const normalizeStatus = (t: any) => {
    const s = (t.status || t.column || t.columnTitle || "")
      .toString()
      .toLowerCase();
    if (s.includes("done") || s.includes("completed")) return "Completed";
    if (
      s.includes("progress") ||
      s.includes("in progress") ||
      s === "inprogress"
    )
      return "In Progress";
    if (s.includes("todo") || s.includes("to do")) return "To Do";
    return "Other"; // Catch-all for other statuses
  };

  const countTasksInColumnsWithStatus = (statusKey: string) => {
    const normalizedKey = statusKey.toLowerCase().replace(/\s/g, '');
    if (localColumns.length === 0)
      return localTasks.filter((t: any) => normalizeStatus(t).toLowerCase().replace(/\s/g, '') === normalizedKey)
        .length;
    return localColumns.reduce((acc: number, col: any) => {
      if (normalizeStatus({ status: col.title }).toLowerCase().replace(/\s/g, '') === normalizedKey)
        return acc + ((col.tasks && col.tasks.length) || 0);
      return acc;
    }, 0);
  };

  const completedTasks = countTasksInColumnsWithStatus("Completed");
  const inProgressTasks = countTasksInColumnsWithStatus("In Progress");
  const toDoTasks = countTasksInColumnsWithStatus("To Do"); // Count To Do for chart

  const now = new Date();
  const overdueTasks = localTasks.filter(
    (t) =>
      t.rawDueDate &&
      new Date(t.rawDueDate) < now &&
      normalizeStatus(t) !== "Completed"
  ).length;

  const stats = [
    {
      label: "Total Tasks",
      value: totalTasks,
      change: "+0%",
      trend: "up",
      icon: <ListTodo className="w-8 h-8 text-white" />,
      bg: "bg-blue-500",
      gradient: "from-blue-500 to-blue-600",
      lightBg: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "In Progress",
      value: inProgressTasks,
      change: "+0%",
      trend: "up",
      icon: <Clock className="w-8 h-8 text-white" />,
      bg: "bg-orange-500",
      gradient: "from-orange-500 to-orange-600",
      lightBg: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      label: "Completed",
      value: completedTasks,
      change: "+0%",
      trend: "up",
      icon: <CheckCircle2 className="w-8 h-8 text-white" />,
      bg: "bg-emerald-500",
      gradient: "from-emerald-500 to-emerald-600",
      lightBg: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      label: "Overdue",
      value: overdueTasks,
      change: "+0%",
      trend: "down",
      icon: <AlertCircle className="w-8 h-8 text-white" />,
      bg: "bg-red-500",
      gradient: "from-red-500 to-red-600",
      lightBg: "bg-red-50",
      textColor: "text-red-600",
    },
  ];

  // Data for Pie Chart
  const pieData = [
    { name: 'To Do', value: toDoTasks, color: '#94a3b8' }, // Slate-400
    { name: 'In Progress', value: inProgressTasks, color: '#f97316' }, // Orange-500
    { name: 'Completed', value: completedTasks, color: '#10b981' }, // Emerald-500
  ].filter(item => item.value > 0); // Only show statuses with tasks

  // Recent Tasks (Last 5)
  const recentTasks = [...localTasks]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="p-8 bg-slate-50/50 h-full overflow-y-auto custom-scrollbar flex flex-col justify-start gap-8">
      {/* 1. Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col relative group h-48"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.lightBg} rounded-full -mr-10 -mt-10 opacity-50 group-hover:scale-110 transition-transform duration-500`}></div>

            <div className="p-6 flex flex-col h-full justify-between relative z-10">
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-2xl shadow-md bg-linear-to-br ${stat.gradient}`}>
                  {stat.icon}
                </div>

                <div className={`flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${stat.lightBg} ${stat.textColor}`}>
                  {stat.trend === "up" ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                  {stat.change}
                </div>
              </div>

              <div>
                <h3 className="text-4xl font-black text-slate-800 tracking-tight mt-2">
                  {stat.value}
                </h3>
                <p className="text-sm font-medium text-slate-500 mt-1">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Charts & Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-[400px]">
        {/* Pie Chart: Task Distribution */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <PieChartIcon size={20} className="text-purple-500" /> Task Distribution
              </h3>
              <p className="text-xs text-slate-400 mt-1">Status breakdown</p>
            </div>
          </div>

          <div className="flex-1 w-full min-h-[300px] relative">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <PieChartIcon size={48} className="mb-2 opacity-20" />
                <p className="text-sm">No tasks data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Tasks List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <ListTodo size={20} className="text-blue-500" /> Recent Tasks
              </h3>
              <p className="text-xs text-slate-400 mt-1">Latest updates on your board</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {recentTasks.length > 0 ? (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-transparent hover:border-slate-200 group">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${normalizeStatus(task) === 'Completed' ? 'bg-emerald-100 text-emerald-600' :
                        normalizeStatus(task) === 'In Progress' ? 'bg-orange-100 text-orange-600' :
                          'bg-slate-200 text-slate-500'
                        }`}>
                        {normalizeStatus(task) === 'Completed' ? <CheckCircle2 size={18} /> :
                          normalizeStatus(task) === 'In Progress' ? <Clock size={18} /> :
                            <ListTodo size={18} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{task.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          in <span className="font-semibold">{task.columnTitle || task.status || 'List'}</span>
                          {task.rawDueDate && (
                            <>
                              <span className="w-1 h-1 bg-slate-300 rounded-full mx-1"></span>
                              <span>Due {new Date(task.rawDueDate).toLocaleDateString()}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${task.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' :
                        task.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                        {task.priority || 'Normal'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <ListTodo size={48} className="mb-2 opacity-20" />
                <p className="text-sm">No tasks found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}