import React from "react";
import { useRouter } from "next/router";
import Layouts from "@/components/Layouts";
// ตรวจสอบ Path import ให้ตรงกับเครื่องคุณ (บางทีอาจเป็น @/components/Container/...)
import WorkspaceBoard from "@/Container/WorkSpace/WorkspaceBoard";

export default function ProjectDetail() {
  const router = useRouter();
  const { id } = router.query;

  // รอให้ Router พร้อมก่อน เพื่อป้องกัน Error
  if (!router.isReady) return null;

  return (
    <Layouts>
      <div className="h-[calc(100vh-64px)] flex flex-col">
        {/* ✅ เรียกใช้แค่ Board อย่างเดียว 
            (ในนี้มี Header, Sidebar, Tabs ครบหมดแล้ว) 
        */}
        <WorkspaceBoard workspaceId={typeof id === "string" ? id : ""} />
      </div>
    </Layouts>
  );
}