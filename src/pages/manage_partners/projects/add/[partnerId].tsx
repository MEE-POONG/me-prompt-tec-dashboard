import React, { useState } from 'react';
import Layouts from "@/components/Layouts";
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Upload, Save, Building2 } from 'lucide-react';

export default function AddGlobalProjectPage() {
  const router = useRouter();
  
  // Mock รายชื่อพาร์ทเนอร์สำหรับ Dropdown
  const partners = [
    { id: '1', name: 'Computer Science RMUTI' },
    { id: '2', name: 'Me Prompt TEC' },
    { id: '3', name: 'Multimedia Technology' },
    { id: '4', name: 'Other Company Co., Ltd.' },
  ];

  const [formData, setFormData] = useState({
    title: '',
    partnerId: '',
    description: '',
    status: 'Published'
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic บันทึกข้อมูลเข้า Backend
    console.log("Saving project:", formData);
    alert("บันทึกข้อมูลเรียบร้อย (Mock)");
    router.push('/projects');
  };

  return (
    <Layouts>
      <div className="min-h-screen bg-gray-50 flex justify-center py-10 px-4">
        <div className="w-full max-w-4xl">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">เพิ่มโปรเจกต์ใหม่</h1>
            <Link 
              href="/projects" 
              className="text-gray-500 hover:text-amber-600 flex items-center gap-1 text-sm font-medium transition-colors"
            >
              <ArrowLeft size={18} /> กลับไปหน้าโปรเจกต์รวม
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8 space-y-6">

              {/* 1. เลือกพาร์ทเนอร์ (สำคัญสำหรับหน้ารวม) */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 items-center gap-2">
                  <Building2 size={16} className="text-amber-500" /> 
                  เจ้าของโปรเจกต์ (Partner) <span className="text-red-500">*</span>
                </label>
                <select 
                  required
                  className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                  value={formData.partnerId}
                  onChange={(e) => setFormData({...formData, partnerId: e.target.value})}
                >
                  <option value="">-- กรุณาเลือกพาร์ทเนอร์ --</option>
                  {partners.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">โปรเจกต์นี้จะถูกแสดงภายใต้พาร์ทเนอร์ที่เลือก</p>
              </div>

              <div className="border-t border-gray-100 my-4"></div>

              {/* 2. ชื่อและรายละเอียด */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">ชื่อโปรเจกต์</label>
                  <input 
                    type="text" 
                    required
                    placeholder="เช่น AI Workshop 2024"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">รายละเอียด</label>
                  <textarea 
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none"
                    placeholder="อธิบายรายละเอียดของกิจกรรม..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>

              {/* 3. รูปภาพปก */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">รูปภาพหน้าปก</label>
                <div className="flex items-start gap-4">
                  <div className={`w-40 h-40 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50 overflow-hidden relative
                    ${!imagePreview ? 'hover:bg-gray-100' : ''}
                  `}>
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-gray-400">
                        <Upload size={24} className="mx-auto mb-1" />
                        <span className="text-xs">Upload Image</span>
                      </div>
                    )}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} accept="image/*" />
                  </div>
                  <div className="text-sm text-gray-500 pt-2">
                    <p>แนะนำขนาด: 1200 x 630 px</p>
                    <p>ไฟล์ที่รองรับ: JPG, PNG, WEBP</p>
                  </div>
                </div>
              </div>

               {/* 4. สถานะ */}
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">สถานะ</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="status" 
                        value="Published" 
                        checked={formData.status === 'Published'} 
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span>เผยแพร่ทันที</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="status" 
                        value="Draft" 
                        checked={formData.status === 'Draft'} 
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span>ร่าง (Draft)</span>
                    </label>
                  </div>
               </div>

            </div>

            {/* Footer Action */}
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-end gap-3">
              <Link href="/projects">
                <button type="button" className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors">
                  ยกเลิก
                </button>
              </Link>
              <button 
                type="submit" 
                className="px-6 py-2.5 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 shadow-md shadow-amber-200 transition-transform active:scale-95 flex items-center gap-2"
              >
                <Save size={18} /> บันทึกโปรเจกต์
              </button>
            </div>
          </form>

        </div>
      </div>
    </Layouts>
  );
}