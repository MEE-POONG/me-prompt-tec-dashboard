import React from 'react';
import { Activity, CheckCircle2, FileEdit, UploadCloud } from 'lucide-react';

export default function ProjectStatus() {
  
  // Mock Projects Data
  const recentProjects = [
    { id: 1, name: "AI Chatbot", department: "AI / NLP", status: "In Progress", progress: 75 },
    { id: 2, name: "E-commerce Platform", department: "Web Dev", status: "Completed", progress: 100 },
    { id: 3, name: "Social Media App", department: "Mobile / Flutter", status: "Pending", progress: 30 },
  ];

  // Mock Stats
  const projectStats = { completed: 8, inProgress: 3, delayed: 1 };

  // Mock Activities (ข้อมูลจำลอง Timeline)
  const activities = [
    { id: 1, text: "อัปเดต Progress โปรเจกต์ AI Chatbot เป็น 75%", time: "10 นาทีที่แล้ว", icon: <Activity size={14} />, color: "bg-blue-100 text-blue-600" },
    { id: 2, text: "ส่งมอบงาน E-commerce Platform เรียบร้อย", time: "2 ชั่วโมงที่แล้ว", icon: <CheckCircle2 size={14} />, color: "bg-green-100 text-green-600" },
    { id: 3, text: "แก้ไขรายละเอียด Social Media App", time: "เมื่อวาน", icon: <FileEdit size={14} />, color: "bg-orange-100 text-orange-600" },
    { id: 4, text: "อัปโหลดไฟล์ Project Proposal ใหม่", time: "2 วันที่แล้ว", icon: <UploadCloud size={14} />, color: "bg-purple-100 text-purple-600" },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
      
      {/* === ส่วนหัว === */}
      <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Activity size={20} className="text-blue-600"/> สถานะการดำเนินงาน (Project Status)
      </h3>

      {/* === Progress Bars === */}
      <div className="space-y-6 mb-8">
        {recentProjects.map((project) => (
          <div key={project.id}>
            <div className="flex justify-between items-end mb-2">
              <div>
                <h4 className="font-bold text-gray-800">{project.name}</h4>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{project.department}</span>
              </div>
              <div className="text-right">
                <span className={`text-xs font-bold px-2 py-1 rounded-full 
                  ${project.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                    project.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                  {project.status}
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div 
                className={`h-2.5 rounded-full ${
                  project.status === 'Completed' ? 'bg-green-500' : 
                  project.status === 'In Progress' ? 'bg-blue-500' : 'bg-gray-400'
                }`} 
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
            <p className="text-right text-xs text-gray-400 mt-1">{project.progress}% Completed</p>
          </div>
        ))}
      </div>

      {/* === สรุปตัวเลข (Stats) === */}
      <div className="grid grid-cols-3 text-center py-6 border-t border-b border-gray-100 bg-gray-50/50 rounded-xl mb-6">
         <div>
            <p className="text-gray-500 text-xs mb-1">เสร็จสิ้น</p>
            <p className="text-green-600 font-bold text-2xl">{projectStats.completed}</p>
         </div>
         <div className="border-l border-r border-gray-200">
            <p className="text-gray-500 text-xs mb-1">กำลังทำ</p>
            <p className="text-blue-600 font-bold text-2xl">{projectStats.inProgress}</p>
         </div>
         <div>
            <p className="text-gray-500 text-xs mb-1">ล่าช้า</p>
            <p className="text-red-500 font-bold text-2xl">{projectStats.delayed}</p>
         </div>
      </div>

      {/* === (ส่วนที่เพิ่มใหม่) Timeline Activity === */}
      <div className="mt-auto">
         <h4 className="text-sm font-bold text-gray-700 mb-4">ความเคลื่อนไหวล่าสุด</h4>
         <div className="space-y-0">
            {activities.map((item, index) => (
               <div key={item.id} className="flex gap-3 relative pb-6 last:pb-0">
                  {/* เส้นเชื่อมแนวตั้ง */}
                  {index !== activities.length - 1 && (
                    <div className="absolute left-3.5 top-8 bottom-0 w-0.5 bg-gray-100"></div>
                  )}
                  
                  {/* ไอคอนวงกลม */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${item.color} z-10`}>
                     {item.icon}
                  </div>

                  {/* ข้อความ */}
                  <div>
                     <p className="text-sm text-gray-600 leading-tight">{item.text}</p>
                     <p className="text-[11px] text-gray-400 mt-1">{item.time}</p>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}