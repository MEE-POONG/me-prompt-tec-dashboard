import React from "react";
import { useRouter } from "next/router";
import Layouts from "@/components/Layouts";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Building2, Users, Layers, Trophy, ExternalLink, Calendar } from "lucide-react";

// --- Mock Data (ข้อมูลจำลอง: ความสัมพันธ์ระหว่าง พันธมิตร -> โปรเจกต์ -> เด็กฝึกงาน) ---
const partnerDetail = {
  id: '1',
  name: 'Computer Science RMUTI',
  type: 'สถาบันการศึกษา',
  logoSrc: 'https://placehold.co/400x400/png?text=CS+RMUTI',
  website: 'https://cs.rmuti.ac.th',
  description: 'ความร่วมมือในการพัฒนาบุคลากรด้าน AI และ Software Development',
  stats: {
    totalInterns: 12,
    activeProjects: 3,
    completedProjects: 5
  },
  // ✅ รายชื่อโปรเจกต์ที่ทำร่วมกัน (ผลงาน)
  projects: [
    {
      id: 101,
      title: "AI Chatbot Assistant",
      status: "Completed",
      cover: "https://placehold.co/600x400/png?text=AI+Project",
      techStack: ["Python", "TensorFlow", "Next.js"],
      // ✅ ทีมงานเด็กฝึกงานที่ทำโปรเจกต์นี้
      team: [
        { name: "สมชาย", avatar: "https://placehold.co/100x100/png?text=S" },
        { name: "สมหญิง", avatar: "https://placehold.co/100x100/png?text=M" },
        { name: "วิชัย", avatar: "https://placehold.co/100x100/png?text=W" }
      ]
    },
    {
      id: 102,
      title: "Internal HR System",
      status: "In Progress",
      cover: "https://placehold.co/600x400/png?text=HR+System",
      techStack: ["React", "Node.js", "MongoDB"],
      team: [
        { name: "กานดา", avatar: "https://placehold.co/100x100/png?text=K" },
        { name: "มานะ", avatar: "https://placehold.co/100x100/png?text=M" }
      ]
    }
  ],
  // ✅ รายชื่อเด็กฝึกงานทั้งหมดจากที่นี่
  interns: [
    { id: 1, name: "สมชาย ใจดี", major: "วิทยาการคอมพิวเตอร์", year: "2567" },
    { id: 2, name: "สมหญิง จริงใจ", major: "วิทยาการคอมพิวเตอร์", year: "2567" },
    { id: 3, name: "กานดา มีทรัพย์", major: "เทคโนโลยีสารสนเทศ", year: "2568" },
  ]
};

export default function PartnerViewPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <Layouts>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* Back Button */}
          <Link href="/manage_partners" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors">
             <ArrowLeft size={18} className="mr-1"/> กลับไปหน้ารายชื่อ
          </Link>

          {/* === Header Section: ข้อมูลพันธมิตร === */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50"></div>
             
             <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
                {/* Logo */}
                <div className="w-32 h-32 bg-white rounded-2xl shadow-md border border-gray-100 p-2 shrink-0">
                   <div className="relative w-full h-full rounded-xl overflow-hidden">
                      <Image src={partnerDetail.logoSrc} alt={partnerDetail.name} fill className="object-contain" />
                   </div>
                </div>

                {/* Text Info */}
                <div className="flex-1 text-center md:text-left">
                   <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full mb-2">
                      {partnerDetail.type}
                   </div>
                   <h1 className="text-3xl font-bold text-gray-900 mb-2">{partnerDetail.name}</h1>
                   <p className="text-gray-500 mb-4 max-w-2xl">{partnerDetail.description}</p>
                   
                   <a href={partnerDetail.website} target="_blank" className="inline-flex items-center text-blue-600 hover:underline text-sm font-medium">
                      {partnerDetail.website} <ExternalLink size={14} className="ml-1"/>
                   </a>
                </div>

                {/* Stats Box (สรุปผลงาน) */}
                <div className="flex gap-4 md:gap-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
                   <div className="text-center">
                      <p className="text-gray-400 text-xs mb-1">นักศึกษา</p>
                      <p className="text-2xl font-bold text-gray-800">{partnerDetail.stats.totalInterns}</p>
                   </div>
                   <div className="w-px bg-gray-200"></div>
                   <div className="text-center">
                      <p className="text-gray-400 text-xs mb-1">โปรเจกต์</p>
                      <p className="text-2xl font-bold text-blue-600">{partnerDetail.stats.activeProjects + partnerDetail.stats.completedProjects}</p>
                   </div>
                </div>
             </div>
          </div>

          {/* === Project Showcase Section (ไฮไลท์สำคัญ ✨) === */}
          <div className="mb-10">
             <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Trophy className="text-yellow-500" size={24} /> ผลงานและความร่วมมือ (Collaboration Projects)
             </h2>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {partnerDetail.projects.map((project) => (
                   <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all group">
                      {/* Project Cover */}
                      <div className="h-40 w-full relative bg-gray-100">
                         <Image src={project.cover} alt={project.title} fill className="object-cover" />
                         <div className="absolute top-3 right-3">
                            <span className={`px-2 py-1 text-xs font-bold rounded-lg shadow-sm
                               ${project.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}
                            `}>
                               {project.status}
                            </span>
                         </div>
                      </div>

                      {/* Project Info */}
                      <div className="p-5">
                         <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{project.title}</h3>
                         
                         {/* Tech Stack Tags */}
                         <div className="flex flex-wrap gap-2 mb-4">
                            {project.techStack.map((tech, i) => (
                               <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">{tech}</span>
                            ))}
                         </div>

                         <div className="border-t border-gray-100 pt-4 mt-auto flex items-center justify-between">
                            <div className="flex items-center">
                               {/* Team Avatars (โชว์หน้าเด็กฝึกงานที่ทำโปรเจกต์นี้) */}
                               <div className="flex -space-x-2">
                                  {project.team.map((member, idx) => (
                                     <div key={idx} className="w-8 h-8 rounded-full border-2 border-white relative overflow-hidden bg-gray-200" title={member.name}>
                                        <Image src={member.avatar} alt={member.name} fill className="object-cover"/>
                                     </div>
                                  ))}
                               </div>
                               <span className="text-xs text-gray-400 ml-3">{project.team.length} คนร่วมพัฒนา</span>
                            </div>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>

          {/* === Intern List Section (รายชื่อเด็กที่ส่งมา) === */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
             <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Users className="text-blue-500" size={24} /> ทำเนียบนักศึกษาฝึกงาน ({partnerDetail.interns.length})
             </h2>

             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                      <tr>
                         <th className="p-4 rounded-tl-lg">ชื่อ-นามสกุล</th>
                         <th className="p-4">สาขาวิชา</th>
                         <th className="p-4">ปีการศึกษา</th>
                         <th className="p-4 rounded-tr-lg text-right">สถานะ</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100 text-sm">
                      {partnerDetail.interns.map((intern) => (
                         <tr key={intern.id} className="hover:bg-gray-50">
                            <td className="p-4 font-medium text-gray-800">{intern.name}</td>
                            <td className="p-4 text-gray-600">{intern.major}</td>
                            <td className="p-4 text-gray-600 flex items-center gap-1">
                               <Calendar size={14} /> {intern.year}
                            </td>
                            <td className="p-4 text-right">
                               <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold">ผ่านการประเมิน</span>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>

        </div>
      </div>
    </Layouts>
  );
}