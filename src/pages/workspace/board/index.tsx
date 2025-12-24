import { useEffect, useState } from "react";
import { Lock, Globe } from "lucide-react";
import Link from "next/link";

type Workspace = {
  id: string;
  name: string;
  description: string;
  color: string;
  visibility: "PUBLIC" | "PRIVATE";
};

export default function WorkspacePage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkspaces = async () => {
    const res = await fetch("/api/workspace/board");
    const data = await res.json();

    console.log("🔥 FRONTEND DATA:", data);

    setWorkspaces(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  if (loading) {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <div className="p-10 space-y-4">
      <h1 className="text-2xl font-bold">Workspace</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {workspaces.map((project) => (
          <div
            key={project.id}
            className="p-5 border rounded-xl bg-white shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg truncate">
                {project.name}
              </h3>

              {/* ✅ ใช้ visibility จาก DB ตรง ๆ */}
              {project.visibility === "PUBLIC" ? (
                <div className="flex items-center gap-1 text-blue-600 text-xs font-bold">
                  <Globe size={14} />
                  Public
                </div>
              ) : (
                <div className="flex items-center gap-1 text-gray-500 text-xs font-bold">
                  <Lock size={14} />
                  Private
                </div>
              )}
            </div>

            <p className="text-sm text-gray-500 mt-2 line-clamp-2">
              {project.description}
            </p>
          </div>
        ))}
      </div>

      <Link
        href="/workspace/add"
        className="inline-block mt-6 px-5 py-2 bg-blue-600 text-white rounded-lg"
      >
        + สร้าง Workspace
      </Link>
    </div>
  );
}
