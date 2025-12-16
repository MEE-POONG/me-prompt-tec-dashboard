import React from "react";
import { useRouter } from "next/router";
import Layouts from "@/components/Layouts";
import WorkspaceBoard from "@/Container/WorkSpace/WorkspaceBoard";

export default function ProjectDetail() {
  const router = useRouter();
  const { id } = router.query;

  // รอให้ router พร้อมก่อน (กัน error กรณี id ยังไม่มา)
  if (!router.isReady) return null;

  return (
    <Layouts>
      <div className="h-[calc(100vh-64px)] flex flex-col">
        {/* เรียกใช้งาน Board และส่ง ID ไป (Header ใหม่รวมอยู่ในนี้แล้ว) */}
        <WorkspaceBoard workspaceId={typeof id === "string" ? id : ""} />
      </div>
    </Layouts>
  );
}