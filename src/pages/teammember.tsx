import React, { useState } from 'react';
import Layouts from '@/components/Layouts';
import Teams_Menu_Section from '@/Container/Teams/Teams_Menu_Section';
import Card_Profile_section, { MemberData } from '@/Container/Teams/Card_Profile_section';

// ข้อมูลจำลอง (Mock Data) - ในอนาคตคุณอาจจะดึงจาก API หรือ Database
const mockMembers: MemberData[] = [
  {
    id: '1',
    name: 'สมชาย ใจดี',
    title: 'Senior Developer',
    department: 'Development',
    imageSrc: '/img/pic1.jpg', // ใส่ path รูปที่มีอยู่จริงนะ
    facebook: 'https://facebook.com',
    github: 'https://github.com'
  },
  {
    id: '2',
    name: 'สมหญิง จริงใจ',
    title: 'UX/UI Designer',
    department: 'Design',
    imageSrc: '/img/pic2.jpg',
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com'
  },
  {
    id: '3',
    name: 'จอห์น นอนดึก',
    title: 'Project Manager',
    department: 'Management',
    imageSrc: '/img/pic3.jpg',
    facebook: 'https://facebook.com'
  }
];

export default function TeamMemberPage() {
  // --- State ---
  const [memberList, setMemberList] = useState<MemberData[]>(mockMembers);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // --- Logic Filter ---
  const filteredMembers = memberList.filter((member) => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Functions ---
  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`คุณต้องการลบพนักงานจำนวน ${selectedIds.length} คนใช่หรือไม่?`)) {
      // ลบข้อมูลจาก State
      const newList = memberList.filter(item => !selectedIds.includes(item.id));
      setMemberList(newList);
      setSelectedIds([]); // เคลียร์การเลือก
      alert('ลบข้อมูลเรียบร้อย');
    }
  };

  return (
    <Layouts>
       <div className="p-6 md:p-8 w-full">
          {/* ส่วน Menu ด้านบน */}
          <Teams_Menu_Section 
             totalCount={memberList.length}
             searchTerm={searchTerm}
             setSearchTerm={setSearchTerm}
             viewType={viewType}
             setViewType={setViewType}
             selectedCount={selectedIds.length}
             onDelete={handleDelete}
          />

          {/* ส่วนแสดงผล Profile Cards/List */}
          <Card_Profile_section 
             members={filteredMembers}
             viewType={viewType}
             selectedIds={selectedIds}
             onToggleSelect={toggleSelect}
          />
       </div>
    </Layouts>
  );
}