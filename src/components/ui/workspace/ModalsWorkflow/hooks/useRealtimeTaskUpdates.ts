import { useEffect } from "react";
import { ContentBlock, Comment, ActivityLog } from "../types";

interface UseRealtimeTaskUpdatesProps {
  isOpen: boolean;
  taskId: string | null;
  setIsCompleted: React.Dispatch<React.SetStateAction<boolean>>;
  setBlocks: React.Dispatch<React.SetStateAction<ContentBlock[]>>;
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  setActivities: React.Dispatch<React.SetStateAction<ActivityLog[]>>;
}

export function useRealtimeTaskUpdates({
  isOpen,
  taskId,
  setIsCompleted,
  setBlocks,
  setComments,
  setActivities,
}: UseRealtimeTaskUpdatesProps) {
  useEffect(() => {
    if (!isOpen || !taskId) return;
    const channel = `task:${taskId}`;
    const es = new EventSource(
      `/api/realtime/stream?channel=${encodeURIComponent(channel)}`
    );

    es.onmessage = (ev) => {
      try {
        if (!ev.data || ev.data.trim().startsWith("<")) {
          // console.warn("Received HTML instead of JSON from SSE, ignoring");
          return;
        }

        const data = JSON.parse(ev.data);
        const { type, payload } = data;
        if (!type || !payload) return;

        if (type === "task:updated") {
          if (payload.id === taskId) {
            if (payload.status === "Done" || payload.status === "Completed") {
              setIsCompleted(true);
            } else if (
              payload.status === "In Progress" ||
              payload.status === "To Do"
            ) {
              setIsCompleted(false);
            }
          }
        }

        if (type === "checklist:created") {
          const item = payload;
          setBlocks((prev) => {
            const defaultBlockId = item.blockId || "default-checklist";
            const defaultTitle = item.blockTitle || "Checklist";
            
            const idx = prev.findIndex((b) => b.id === defaultBlockId || (b.id === "default-checklist" && !item.blockId));
            
            if (idx === -1) {
              return [
                {
                  id: defaultBlockId,
                  type: "checklist",
                  title: defaultTitle,
                  items: [
                    { id: item.id, text: item.text, isChecked: item.isChecked },
                  ],
                },
                ...prev,
              ];
            }
            const currentBlock = prev[idx];
            const incomingText = item.text ? item.text.trim() : "";
            const exists = currentBlock.items?.some(
              (i) =>
                i.id === item.id ||
                (i.id.startsWith("temp-") && i.text.trim() === incomingText)
            );
            if (exists) return prev;
            return prev.map((b) =>
              b.id === currentBlock.id
                ? {
                    ...b,
                    items: [
                      ...(b.items || []),
                      {
                        id: item.id,
                        text: item.text,
                        isChecked: item.isChecked,
                      },
                    ],
                  }
                : b
            );
          });
        }
        if (type === "checklist:updated") {
          const item = payload;
          setBlocks((prev) =>
            prev.map((b) =>
              b.type === "checklist"
                ? {
                    ...b,
                    items: b.items?.map((i) =>
                      i.id === item.id
                        ? {
                            id: item.id,
                            text: item.text,
                            isChecked: item.isChecked,
                          }
                        : i
                    ),
                  }
                : b
            )
          );
        }
        if (type === "checklist:deleted") {
          const { id } = payload;
          setBlocks((prev) =>
            prev.map((b) =>
              b.type === "checklist"
                ? { ...b, items: b.items?.filter((i) => i.id !== id) }
                : b
            )
          );
        }
        if (type === "comment:created") {
          const c = payload;
          setComments((prev) => [
            {
              id: c.id,
              user: c.author || "Unknown",
              text: c.content,
              time: new Date(c.createdAt).toLocaleString(),
              color: "bg-slate-400",
            },
            ...prev,
          ]);
        }
        if (type === "comment:updated") {
          const c = payload;
          setComments((prev) =>
            prev.map((cm) =>
              cm.id === c.id
                ? {
                    id: c.id,
                    user: c.author || "Unknown",
                    text: c.content,
                    time: new Date(c.updatedAt || c.createdAt).toLocaleString(),
                    color: "bg-slate-400",
                    isEdited: true,
                  }
                : cm
            )
          );
        }
        if (type === "comment:deleted") {
          const { id } = payload;
          setComments((prev) => prev.filter((cm) => cm.id !== id));
        }
        if (type === "activity:created") {
          const a = payload;
          setActivities((prev) => [
            {
              id: a.id,
              user: a.user,
              action: `${a.action} ${a.target || ""}`.trim(),
              time: new Date(a.createdAt).toLocaleString(),
            },
            ...prev,
          ]);
        }
      } catch (e) {
        console.error("Invalid SSE payload", e);
      }
    };
    es.onerror = (e) => {
      es.close();
    };
    return () => es.close();
  }, [isOpen, taskId, setIsCompleted, setBlocks, setComments, setActivities]);
}
