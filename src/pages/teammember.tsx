import React, { useState, useEffect } from 'react';
import Layouts from '@/components/Layouts';
import Teams_Menu_Section from '@/Container/Teams/Teams_Menu_Section';
import Card_Profile_section, { MemberData } from '@/Container/Teams/Card_Profile_section';

export default function TeamMemberPage() {
  // --- State Management ---
  const [members, setMembers] = useState<MemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // --- Fetch Members from API ---
  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/member?limit=100');

      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }

      const result = await response.json();
      const apiMembers = result.data || [];

      // Map API data to MemberData interface
      const mappedMembers: MemberData[] = apiMembers.map((member: any) => ({
        id: member.id,
        name: member.name?.display || `${member.name?.first || ''} ${member.name?.last || ''}`.trim(),
        title: member.title || '',
        department: member.department || '',
        imageSrc: member.photo || '/default-avatar.png',
        instagram: member.socials?.instagram,
        facebook: member.socials?.facebook,
        github: member.socials?.github,
        linkedin: member.socials?.linkedin,
        portfolio: member.socials?.website || member.socials?.portfolio,
      }));

      setMembers(mappedMembers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- Filter Members by Search ---
  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Toggle Selection ---
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  // --- Delete Selected Members ---
  const handleDelete = async () => {
    if (selectedIds.length === 0) return;

    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบพนักงาน ${selectedIds.length} คน?`)) return;

    try {
      // Delete each selected member
      await Promise.all(
        selectedIds.map(id =>
          fetch(`/api/member/${id}`, { method: 'DELETE' })
        )
      );

      // Refresh the member list
      setSelectedIds([]);
      fetchMembers();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการลบข้อมูล');
      console.error('Error deleting members:', err);
    }
  };

  return (
    <Layouts>
       <div className="p-6 md:p-8 w-full">
          {/* ส่วน Menu ด้านบน */}
          <Teams_Menu_Section
            totalCount={members.length}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            viewType={viewType}
            setViewType={setViewType}
            selectedCount={selectedIds.length}
            onDelete={handleDelete}
          />

          {/* Loading State */}
          {loading && (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-20 bg-red-50 rounded-xl border border-red-200">
              <p className="text-red-600 font-semibold">เกิดข้อผิดพลาด: {error}</p>
              <button
                onClick={fetchMembers}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                ลองอีกครั้ง
              </button>
            </div>
          )}

          {/* ส่วนแสดงผล Profile Cards/List */}
          {!loading && !error && (
            <Card_Profile_section
              members={filteredMembers}
              viewType={viewType}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
            />
          )}
       </div>
    </Layouts>
  );
}