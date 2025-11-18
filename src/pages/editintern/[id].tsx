import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router"; 
import Layouts from "@/components/Layouts";
import { Upload } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Import ข้อมูลจำลอง
import { Intern } from "@/Data/dataintern";

export default function EditInternPage() {
  const router = useRouter();
  const { id } = router.query; 

  // --- State สำหรับเก็บข้อมูล ---
  const [name, setName] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [github, setGithub] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [position, setPosition] = useState("");

  // 1. แก้ Type State รูปภาพ: บอกว่ามันเก็บ File หรือ null ได้
  const [imageFile, setImageFile] = useState<File | null>(null); 
  const [imageUrl, setImageUrl] = useState(""); 
  
  // 2. แก้ Type useRef: บอกว่าเป็น HTMLInputElement
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- useEffect ---
  useEffect(() => {
    if (id) {
      // 3. แก้ Type id: แปลง id เป็น string ก่อนส่งเข้า parseInt
      const internId = parseInt(id as string);

      // 4. แก้ Type foundIntern: ใส่ :any เพื่อบอก TypeScript ว่า "ไม่ต้องเช็คละเอียดนะ" 
      // (จะแก้ปัญหาที่มันหา .facebook ไม่เจอ)
      const foundIntern: any = Intern.find((item) => item.id === internId);

      if (foundIntern) {
        setName(foundIntern.name);
        setFacebook(foundIntern.facebook || ""); 
        setInstagram(foundIntern.instagram || "");
        setGithub(foundIntern.github || "");
        setPortfolio(foundIntern.portfolio || "");
        setPosition(foundIntern.title || "intern"); 
        
        setImageUrl(foundIntern.imageSrc);
      }
    }
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // เช็คว่า e.target.files มีค่าไหม
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = {
      id: id, 
      name,
      facebook,
      instagram,
      github,
      portfolio,
      position,
      image: imageFile ? imageFile : "ใช้รูปเดิม",
    };

    console.log("บันทึกการแก้ไข:", formData);
    
    alert("แก้ไขข้อมูลเรียบร้อย (ดู Console)");
    router.push("/intern"); 
  };

  return (
    <Layouts>
      <div className="p-6 md:p-8 text-black w-full max-w-6xl mx-auto">
        
        <h1 className="text-2xl lg:text-3xl font-bold mb-8 text-blue-700">
          แก้ไขข้อมูล (ID: {id})
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

            {/* --- ฝั่งซ้าย (รูป) --- */}
            <div className="space-y-6">
              <div>
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                  accept="image/*"
                />
                <div 
                  className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300
                             flex flex-col items-center justify-center 
                             text-gray-500 cursor-pointer hover:bg-gray-200 transition-colors
                             relative overflow-hidden"
                  // ใส่ ? เพื่อกัน Error กรณี ref ยังไม่โหลด
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imageUrl ? (
                    <Image src={imageUrl} alt="Preview" layout="fill" objectFit="cover" />
                  ) : (
                    <>
                      <Upload size={40} className="mb-2" />
                      <span className="font-semibold">คลิกเปลี่ยนรูปภาพ</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-400 text-center mt-2">คลิกที่รูปเพื่อเปลี่ยนรูปใหม่</p>
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-800 mb-2">Portfolio</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                />
              </div>
            </div>

            {/* --- ฝั่งขวา (ข้อมูล) --- */}
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-2">Name:</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-2">Facebook</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-2">Instagram</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-2">Github</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-2">ตำแหน่ง</label>
                <select 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 appearance-none"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  required
                >
                  <option value="">-- กรุณาเลือกตำแหน่ง --</option>
                  <option value="intern">นักศึกษาฝึกงาน</option>
                  <option value="Developer">Developer</option>
                  <option value="Tester">Tester</option>
                </select>
              </div>
            </div>
          </div>

          {/* === ปุ่มกด === */}
          <div className="flex justify-end pt-8 mt-8 border-t border-gray-200 gap-4">
            
            {/* ปุ่มยกเลิก กลับไปหน้า intern */}
            <Link 
              href="/intern" 
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded-lg transition-colors flex items-center"
            >
              ยกเลิก
            </Link>

            <button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              บันทึกการแก้ไข
            </button>
          </div>

        </form>
      </div>
    </Layouts>
  );
}