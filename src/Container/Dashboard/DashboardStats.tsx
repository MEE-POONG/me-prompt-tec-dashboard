import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Briefcase, GraduationCap, Building2, ArrowUpRight, TrendingUp, Eye } from 'lucide-react';

export default function DashboardStats() {
  const [counts, setCounts] = useState({
    projects: 0, members: 0, interns: 0, partners: 0
  });
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    growth: '0',
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const [resProject, resMember, resIntern, resPartner, resAnalytics] = await Promise.all([
        fetch('/api/project', { headers }),
        fetch('/api/member', { headers }),
        fetch('/api/intern', { headers }),
        fetch('/api/partners', { headers }),
        fetch('/api/analytics/stats?period=30', { headers }).catch(() => null) // Don't fail if analytics API fails
      ]);

      const getCount = (data: any) => {
        if (!data) return 0;
        if (Array.isArray(data)) return data.length;
        if (data.data && Array.isArray(data.data)) return data.data.length;
        return 0;
      };

      const dataProject = resProject.ok ? await resProject.json() : [];
      const dataMember = resMember.ok ? await resMember.json() : [];
      const dataIntern = resIntern.ok ? await resIntern.json() : [];
      const dataPartner = resPartner.ok ? await resPartner.json() : [];

      // Handle analytics data safely
      let dataAnalytics = { totalViews: 0, growth: '0' };
      if (resAnalytics && resAnalytics.ok) {
        try {
          const text = await resAnalytics.text();
          dataAnalytics = text ? JSON.parse(text) : { totalViews: 0, growth: '0' };
        } catch (e) {
          console.log('Analytics API not ready yet');
        }
      }

      setCounts({
        projects: getCount(dataProject),
        members: getCount(dataMember),
        interns: getCount(dataIntern),
        partners: getCount(dataPartner),
      });

      setAnalytics({
        totalViews: dataAnalytics.totalViews || 0,
        growth: dataAnalytics.growth || '0',
      });

    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  // Config การ์ดแต่ละใบ (ลบ ringColor ออกแล้ว)
  const stats = [
    {
      label: "Website Traffic",
      sub: "สถิติเว็บไซต์ (Traffic)",
      value: analytics.totalViews,
      unit: "views",
      growth: analytics.growth,
      icon: <Eye size={28} />,
      link: "#",
      textGradient: "from-emerald-600 to-teal-500",
      iconBg: "bg-emerald-100 text-emerald-600",
      glowColor: "group-hover:shadow-emerald-500/20",
      showGrowth: true,
    },
    {
      label: "Portfolio",
      sub: "จัดการโปรเจกต์",
      value: counts.projects, unit: "งาน",
      icon: <Briefcase size={28} />,
      link: "/project",
      textGradient: "from-purple-600 to-indigo-500",
      iconBg: "bg-purple-100 text-purple-600",
      glowColor: "group-hover:shadow-purple-500/20",
    },
    {
      label: "Employees",
      sub: "พนักงานประจำ",
      value: counts.members, unit: "คน",
      icon: <Users size={28} />,
      link: "/teammember",
      textGradient: "from-blue-600 to-cyan-500",
      iconBg: "bg-blue-100 text-blue-600",
      glowColor: "group-hover:shadow-blue-500/20",
    },
    {
      label: "Internships",
      sub: "นักศึกษาฝึกงาน",
      value: counts.interns, unit: "คน",
      icon: <GraduationCap size={28} />,
      link: "/intern",
      textGradient: "from-orange-500 to-amber-500",
      iconBg: "bg-orange-100 text-orange-600",
      glowColor: "group-hover:shadow-orange-500/20",
    },
    {
      label: "Partners",
      sub: "สถาบันพันธมิตร",
      value: counts.partners, unit: "แห่ง",
      icon: <Building2 size={28} />,
      link: "/manage_partners",
      textGradient: "from-pink-600 to-rose-500",
      iconBg: "bg-pink-100 text-pink-600",
      glowColor: "group-hover:shadow-pink-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      {stats.map((stat, index) => (
        <Link key={index} href={stat.link}>
          {/* ลบ hover:ring-2 และ ${stat.ringColor} ออกจาก className */}
          <div className={`
             relative p-6 rounded-4xl bg-white/70 backdrop-blur-xl border border-white/80
             transition-all duration-500 ease-out cursor-pointer group
             hover:-translate-y-2 hover:scale-[1.02]
             shadow-[0_8px_30px_rgb(0,0,0,0.04)]
             ${stat.glowColor} hover:shadow-2xl
          `}>

            {/* Header: Icon & Arrow */}
            <div className="flex justify-between items-start mb-6">
              <div className={`
                  p-3.5 rounded-2xl ${stat.iconBg} shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3
               `}>
                {stat.icon}
              </div>
              <div className="p-2 rounded-full bg-white text-gray-300 shadow-sm opacity-50 group-hover:opacity-100 group-hover:text-gray-600 transition-all">
                <ArrowUpRight size={20} />
              </div>
            </div>

            {/* Content: Numbers (Gradient) */}
            <div className="space-y-1">
              <div className="h-12 flex items-baseline gap-2">
                {isLoading ? (
                  <div className="h-8 w-20 bg-gray-200/50 rounded-lg animate-pulse"></div>
                ) : (
                  <>
                    <h3 className={`text-5xl font-black tracking-tight bg-linear-to-r ${stat.textGradient} bg-clip-text text-transparent`}>
                      {stat.value}
                    </h3>
                    <span className="text-sm font-bold text-gray-400 mb-1">{stat.unit}</span>
                  </>
                )}
              </div>

              <h4 className="text-lg font-bold text-gray-700">{stat.label}</h4>
              <p className="text-xs text-gray-400 font-medium">{stat.sub}</p>
            </div>

            {/* Decorative Glow (แสงฟุ้งด้านหลังการ์ดเวลา Hover) */}
            <div className={`
                absolute inset-0 rounded-4xl opacity-0 group-hover:opacity-20 transition-opacity duration-500
                bg-linear-to-br ${stat.textGradient} blur-2xl -z-10
            `}></div>

          </div>
        </Link>
      ))}
    </div>
  );
}