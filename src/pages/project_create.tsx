"use client";
import Layouts from "@/components/Layouts";
import { Project, projects } from "@/Data/Project_data";
import React, { useState } from "react";


export default function ProjectCreate() {
  const [name, setName] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [imageSrc, setImageSrc] = useState("");
  const [description, setDescription] = useState("");
  const [projectLink, setProjectLink] = useState("");

  const addTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = () => {
    const newProject: Project = {
      id: projects.length + 1,
      name,
      description,
      imageSrc,
      projectLink,
      tags,
    };
    projects.push(newProject);
    alert("เพิ่มโปรเจกต์เรียบร้อย!");
    // clear
    setName("");
    setTags([]);
    setImageSrc("");
    setDescription("");
    setProjectLink("");
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
            <div
              className="w-full h-64 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center text-gray-400 cursor-pointer hover:border-blue-400 transition-all"
              onClick={() => {
                const url = prompt("วาง URL รูปภาพ");
                if (url) setImageSrc(url);
              }}
            >
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt="Project"
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <span>คลิกหรือวางรูปภาพที่นี่</span>
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
              <a
                onClick={handleSubmit}
                href="/project"
                className="px-5 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-all"
              >
                เพิ่มโปรเจค
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layouts>
  );
}
