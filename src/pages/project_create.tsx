"use client";
import Layouts from "@/components/Layouts";
import React, { useState } from "react";
import { useRouter } from "next/router";


export default function ProjectCreate() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [imageSrc, setImageSrc] = useState("");
  const [description, setDescription] = useState("");
  const [projectLink, setProjectLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const addTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // แปลงไฟล์เป็น Base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // จัดการการเลือกไฟล์
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      try {
        const base64 = await convertToBase64(file);
        setImageSrc(base64);
      } catch (error) {
        console.error("Error converting file:", error);
        alert("เกิดข้อผิดพลาดในการอ่านไฟล์");
      }
    } else {
      alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
    }
  };

  // จัดการการลากไฟล์
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      try {
        const base64 = await convertToBase64(file);
        setImageSrc(base64);
      } catch (error) {
        console.error("Error converting file:", error);
        alert("เกิดข้อผิดพลาดในการอ่านไฟล์");
      }
    } else {
      alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !description) {
      alert("กรุณากรอกชื่อและรายละเอียดโปรเจกต์");
      return;
    }

    setIsSubmitting(true);

    try {
      // สร้าง slug จากชื่อโปรเจกต์
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const projectData = {
        title: name,
        slug: slug,
        summary: description.substring(0, 200), // ใช้ 200 ตัวอักษรแรกเป็น summary
        description: description,
        cover: imageSrc || null,
        tags: tags,
        techStack: [],
        links: projectLink ? [{ label: "Project Link", url: projectLink }] : [],
        featured: false,
        status: "in_progress",
      };

      const response = await fetch("/api/project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "เกิดข้อผิดพลาดในการสร้างโปรเจกต์");
      }

      alert("เพิ่มโปรเจกต์เรียบร้อย!");
      // clear form
      setName("");
      setTags([]);
      setImageSrc("");
      setDescription("");
      setProjectLink("");

      // redirect to project list page
      router.push("/project");
    } catch (error) {
      console.error("Error creating project:", error);
      alert(error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการสร้างโปรเจกต์");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layouts>
      <section className="max-w-5xl mx-auto p-6 bg-white mt-10 mb-20">
        <h2 className="text-3xl font-bold text-blue-600 mb-15 text-center">
          เพิ่มโปรเจกต์ใหม่
        </h2>

        <div className="flex flex-col md:flex-row gap-8">
          {/* ซ้าย: ชื่อ + Tags */}
          <div className="flex-1 flex flex-col gap-6">
            {/* ชื่อโปรเจกต์ */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-blue-600">
                ชื่อโปรเจกต์
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-black border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="กรอกชื่อโปรเจกต์"
              />
            </div>

            {/* Tags */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-blue-600">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1"
                  >
                    {tag} <button onClick={() => removeTag(tag)}>✕</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="เพิ่ม tag"
                  className="flex-1 border text-black border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-3 py-1 bg-blue-500 text-white rounded-xl hover:bg-yellow-500 transition-all duration-300 hover:scale-110"
                >
                  เพิ่มแท็ก
                </button>
              </div>
            </div>
          </div>

          {/* ขวา: รูปภาพ */}
          <div className="flex-1 flex flex-col gap-2">
            <label className="text-sm font-bold text-blue-600">
              รูปภาพโปรเจกต์
            </label>
            <input
              type="file"
              id="fileInput"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div
              className={`w-full h-64 border-2 border-dashed rounded-2xl flex items-center justify-center text-gray-400 cursor-pointer transition-all ${
                isDragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-blue-400"
              }`}
              onClick={() => document.getElementById("fileInput")?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {imageSrc ? (
                <div className="relative w-full h-full">
                  <img
                    src={imageSrc}
                    alt="Project"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageSrc("");
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-all"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="mb-2">คลิกเพื่อเลือกรูปภาพ</p>
                  <p className="text-sm">หรือลากไฟล์มาวางที่นี่</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* รายละเอียด + ลิงก์ + ปุ่มเพิ่ม */}
        <div className="mt-6 flex flex-col gap-4">
          {/* รายละเอียด */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-blue-600">
              รายละเอียดโปรเจกต์
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="กรอกรายละเอียดโปรเจกต์"
              rows={6} // ขยายพื้นที่กรอก
              className="w-full border text-black border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          {/* ลิงก์โปรเจกต์ */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-blue-600">
              ลิงก์โปรเจกต์
            </label>
            <div className="flex gap-10 flex-row w-full">
              <input
                type="text"
                value={projectLink}
                onChange={(e) => setProjectLink(e.target.value)}
                placeholder="กรอก URL ของโปรเจกต์"
                className="w-200 text-black border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-5 py-2 text-white rounded-md transition-all ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {isSubmitting ? "กำลังเพิ่ม..." : "เพิ่มโปรเจค"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </Layouts>
  );
}
