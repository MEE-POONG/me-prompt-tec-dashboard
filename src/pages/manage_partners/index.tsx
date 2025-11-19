import React, { useState } from 'react';
import Layouts from '@/components/Layouts';
import Partners_Menu_Section from '@/Container/Partners/Partners_Menu_Section';
import Card_Partner_Section, { PartnerData } from '@/Container/Partners/Card_Partner_Section';

// ✅ Mock Data (เพิ่มข้อมูล projects เข้าไปแล้วครับ)
const mockPartners: PartnerData[] = [
  {
    id: '1',
    name: 'Computer Science RMUTI',
    type: 'สถาบันการศึกษา',
    logoSrc: 'https://placehold.co/400x400/png?text=CS', 
    website: 'https://cs.rmuti.ac.th',
    projects: [
      { name: 'AI Workshop 2024' },
      { name: 'Internship Program' }
    ]
  },
  {
    id: '2',
    name: 'สาขาระบบสารสนเทศ คณะบริหารธุรกิจ',
    type: 'สถาบันการศึกษา',
    logoSrc: 'https://placehold.co/400x400/png?text=IS', 
    website: 'https://is.rmuti.ac.th',
    projects: [
      { name: 'Database Design' },
      { name: 'System Analysis Co-op' }
    ]
  },
  {
    id: '3',
    name: 'Multimedia Technology RMUTI',
    type: 'สถาบันการศึกษา',
    logoSrc: 'https://placehold.co/400x400/png?text=MT', 
    website: 'https://mt.rmuti.ac.th',
    projects: [] // ไม่มีโปรเจกต์
  },
  {
    id: '4',
    name: 'บริษัท ตัวอย่าง จำกัด',
    type: 'บริษัทเอกชน',
    logoSrc: 'https://placehold.co/400x400/png?text=Company',
    website: '',
    projects: [
       { name: 'MOU Signing 2024' },
       { name: 'Smart City Project' }
    ]
  }
];

export default function ManagePartnersPage() {
  // --- State ---
  const [partnersList, setPartnersList] = useState<PartnerData[]>(mockPartners);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // --- Logic Filter ---
  const filteredPartners = partnersList.filter((partner) => 
    partner.name.toLowerCase().includes(searchTerm.toLowerCase())
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
    if (confirm(`คุณต้องการลบพันธมิตรจำนวน ${selectedIds.length} รายการใช่หรือไม่?`)) {
      const newList = partnersList.filter(item => !selectedIds.includes(item.id));
      setPartnersList(newList);
      setSelectedIds([]); 
      alert('ลบข้อมูลเรียบร้อย');
    }
  };

  return (
    <Layouts>
       <div className="p-6 md:p-8 w-full bg-gray-50 min-h-screen">
          {/* ส่วน Menu */}
          <Partners_Menu_Section 
             totalCount={partnersList.length}
             searchTerm={searchTerm}
             setSearchTerm={setSearchTerm}
             viewType={viewType}
             setViewType={setViewType}
             selectedCount={selectedIds.length}
             onDelete={handleDelete}
          />

          {/* ส่วนแสดงผล */}
          <Card_Partner_Section 
             partners={filteredPartners}
             viewType={viewType}
             selectedIds={selectedIds}
             onToggleSelect={toggleSelect}
          />
       </div>
    </Layouts>
  );
}