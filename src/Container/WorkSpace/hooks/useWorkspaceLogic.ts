import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import {
    getBoard,
    createColumn,
    updateColumn,
    deleteColumn,
    createTask,
    updateTask,
    deleteTask,
    createActivity,
} from "@/lib/api/workspace";
import { NotificationItem } from "../WorkspaceHeader";
import { getCurrentUserName, mapApiTaskToWorkspaceTask } from "../utils";

export const useWorkspaceLogic = (
    workspaceId: string,
    board: any,
    socket: any
) => {
    const router = useRouter();

    // Data States
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [workspaceInfo, setWorkspaceInfo] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [labels, setLabels] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isReadOnly, setIsReadOnly] = useState(false);

    // Notification State
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const lastActivityIdRef = useRef<string | null>(null);

    // --- Fetch Data ---
    const fetchBoard = useCallback(async () => {
        if (!workspaceId) return;
        setError(null);

        try {
            const data = await getBoard(workspaceId);
            const currentLabels = data.boardLabels || [];
            setLabels(currentLabels);

            const transformedColumns =
                data.columns?.map((col: any) => ({
                    id: col.id,
                    title: col.title,
                    color: col.color || "bg-gray-500",
                    tasks: (col.tasks || []).map((t: any) =>
                        mapApiTaskToWorkspaceTask(
                            t,
                            currentLabels,
                            col.title,
                            data.members || []
                        )
                    ),
                })) || [];

            board.setColumns(transformedColumns);
            setWorkspaceInfo({
                name: data.name,
                description: data.description,
                progress: data.progress || 0,
                dueDate: data.dueDate || "",
                members: data.members || [],
                activities: data.activities || [],
                visibility: data.visibility,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
            });
            setMembers(data.members || []);
            setActivities(data.activities || []);
        } catch (err: any) {
            console.error("Failed to fetch board data:", err);
            setError(err?.message || "Failed to fetch board data");
        } finally {
            setLoading(false);
        }
    }, [workspaceId, board.setColumns]);

    // Initial Load & User Check
    useEffect(() => {
        if (workspaceId) {
            setLoading(true);
            fetchBoard();
        }
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("user");
            if (stored) {
                try {
                    setCurrentUser(JSON.parse(stored));
                } catch (e) {
                    console.error("Failed to parse user", e);
                }
            }
        }
    }, [workspaceId, fetchBoard]);

    // Permission Check
    useEffect(() => {
        if (!workspaceInfo || !currentUser) return;

        const foundMember = (workspaceInfo.members || []).find((m: any) => {
            const memberName = (m.name || "").toLowerCase();
            const userName = (currentUser.name || "").toLowerCase();
            const memberEmail = (m.email || "").toLowerCase();
            const userEmail = (currentUser.email || "").toLowerCase();

            return (
                memberName === userName ||
                memberName === userEmail ||
                (memberEmail && memberEmail === userEmail)
            );
        });

        if (!foundMember) {
            if (workspaceInfo.visibility === "PRIVATE") {
                setError("ACCESS_DENIED"); // Handle UI in component
                return;
            }
            setIsReadOnly(true);
        } else {
            if (foundMember.role === "Viewer") {
                setIsReadOnly(true);
            } else {
                setIsReadOnly(false);
            }
        }
    }, [workspaceInfo, currentUser]);

    // Polling
    useEffect(() => {
        if (!workspaceId) return;

        const checkUpdates = async () => {
            try {
                const token =
                    typeof window !== "undefined" ? localStorage.getItem("token") : null;
                const res = await fetch(
                    `/api/workspace/activity?boardId=${workspaceId}&limit=1`,
                    {
                        headers: {
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                    }
                );
                if (res.ok) {
                    const data = await res.json();
                    const latestActivity = data[0];

                    if (
                        latestActivity &&
                        latestActivity.id !== lastActivityIdRef.current
                    ) {
                        if (lastActivityIdRef.current !== null) {
                            fetchBoard();

                            let actionText = "อัปเดต";
                            let notifType: NotificationItem["type"] = "update";
                            const act = (latestActivity.action || "").toLowerCase();

                            if (act.includes("created task")) {
                                actionText = "สร้างงานใหม่";
                                notifType = "create";
                            } else if (act.includes("created list")) {
                                actionText = "สร้างลิสต์ใหม่";
                                notifType = "create";
                            } else if (act.includes("comment")) {
                                actionText = "คอมเมนต์ใน";
                                notifType = "comment";
                            } else if (act.includes("moved")) {
                                actionText = "ย้ายงาน";
                                notifType = "update";
                            } else if (act.includes("deleted")) {
                                actionText = "ลบ";
                                notifType = "delete";
                            } else if (act.includes("renamed")) {
                                actionText = "เปลี่ยนชื่อ";
                                notifType = "update";
                            }

                            const newNotif: NotificationItem = {
                                id: Date.now().toString(),
                                user: latestActivity.user || "System",
                                action: actionText,
                                target: latestActivity.target || "งาน",
                                timestamp: new Date(),
                                type: notifType,
                                isRead: false,
                            };

                            setNotifications((prev) => [newNotif, ...prev]);
                        }
                        lastActivityIdRef.current = latestActivity.id;
                    } else if (lastActivityIdRef.current === null && latestActivity) {
                        lastActivityIdRef.current = latestActivity.id;
                    }
                }
            } catch (e) {
                console.error("Polling error", e);
            }
        };

        const intervalId = setInterval(checkUpdates, 2000);
        return () => clearInterval(intervalId);
    }, [workspaceId, fetchBoard]);

    // Socket
    useEffect(() => {
        if (!socket || !workspaceId) return;

        const handleBoardUpdate = (id: string) => {
            if (String(id) === String(workspaceId)) {
                fetchBoard();
            }
        };

        socket.on("board-updated", handleBoardUpdate);
        return () => {
            socket.off("board-updated", handleBoardUpdate);
        };
    }, [socket, workspaceId, fetchBoard]);

    // Notifications Storage
    useEffect(() => {
        if (typeof window !== "undefined" && workspaceId) {
            const saved = localStorage.getItem(`notifications_${workspaceId}`);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    const withDate = parsed.map((n: any) => ({
                        ...n,
                        timestamp: new Date(n.timestamp),
                    }));
                    setNotifications(withDate);
                } catch (e) {
                    console.error("Error loading notifications", e);
                }
            }
            setIsLoaded(true);
        }
    }, [workspaceId]);

    useEffect(() => {
        if (!isLoaded) return;
        if (typeof window !== "undefined" && workspaceId) {
            localStorage.setItem(
                `notifications_${workspaceId}`,
                JSON.stringify(notifications)
            );
        }
    }, [notifications, workspaceId, isLoaded]);

    // --- API Handlers ---

    const handleAddTaskApi = async (columnId: string | number) => {
        if (!board.newTaskTitle?.trim()) return;
        const title = board.newTaskTitle;
        const tempId = `temp-${Date.now()}`;
        const tempTask = {
            id: tempId,
            title,
            tag: "General",
            tagColor: "bg-gray-100 text-gray-600",
            priority: "Medium" as "Medium",
            members: [],
            comments: 0,
            attachments: 0,
            date: "Today",
            status: board.columns.find((c: any) => c.id === columnId)?.title || "To Do",
        };

        board.setColumns((prev: any) =>
            prev.map((c: any) =>
                c.id === columnId ? { ...c, tasks: [...(c.tasks || []), tempTask] } : c
            )
        );
        board.setNewTaskTitle("");
        board.setIsAddingTask(null);

        try {
            const created = await createTask({
                columnId: String(columnId),
                title,
                order: board.columns.find((c: any) => c.id === columnId)?.tasks?.length ?? 0,
                user: getCurrentUserName(currentUser),
            });
            await createActivity({
                boardId: String(workspaceId),
                user: getCurrentUserName(currentUser),
                action: "created task",
                target: created.title,
                projectId: String(workspaceId),
                taskId: created.id,
            });

            const colTitle =
                board.columns.find((c: any) => c.id === columnId)?.title || "To Do";
            const mapped = mapApiTaskToWorkspaceTask(
                created,
                labels,
                colTitle,
                members
            );
            board.setColumns((prev: any) =>
                prev.map((c: any) =>
                    c.id === columnId
                        ? {
                            ...c,
                            tasks: (c.tasks || []).map((t: any) =>
                                t.id === tempId ? mapped : t
                            ),
                        }
                        : c
                )
            );
        } catch (err: any) {
            board.setColumns((prev: any) =>
                prev.map((c: any) =>
                    c.id === columnId
                        ? { ...c, tasks: (c.tasks || []).filter((t: any) => t.id !== tempId) }
                        : c
                )
            );
            throw err;
        }
    };

    const handleAddColumnApi = async () => {
        if (!board.newColumnTitle?.trim()) return;
        const title = board.newColumnTitle;
        board.setNewColumnTitle("");
        board.setIsAddingColumn(false);
        const tempId = `temp-col-${Date.now()}`;
        const tempCol = { id: tempId, title, tasks: [], color: "bg-gray-400" };
        board.setColumns((prev: any) => [...prev, tempCol]);

        try {
            const created = await createColumn({
                boardId: String(workspaceId),
                title,
                order: board.columns.length,
                user: getCurrentUserName(currentUser),
            });
            const mappedCol = {
                id: created.id,
                title: created.title,
                tasks: (created.tasks || []).map((t: any) =>
                    mapApiTaskToWorkspaceTask(t, labels, created.title, members)
                ),
                color: created.color,
            };
            board.setColumns((prev: any) => {
                const found = prev.some((c: any) => c.id === tempId);
                if (found) return prev.map((c: any) => (c.id === tempId ? mappedCol : c));
                return [...prev, mappedCol];
            });
            await createActivity({
                boardId: String(workspaceId),
                user: getCurrentUserName(currentUser),
                action: "created list",
                target: created.title,
                projectId: String(workspaceId),
            });

            if (socket) {
                socket.emit("send-notification", {
                    workspaceId,
                    user: "Someone",
                    avatarColor: "bg-purple-500",
                    action: "added list",
                    target: created.title,
                    time: "Just now",
                    isRead: false,
                    type: "update",
                });
                socket.emit("board-updated", workspaceId);
            }
        } catch (err) {
            board.setColumns((prev: any) => prev.filter((c: any) => c.id !== tempId));
            throw err;
        }
    };

    const handleDeleteTaskApi = async (
        columnId: string | number,
        taskId: string | number
    ) => {
        const taskTitle =
            board.columns
                .find((c: any) => c.id === columnId)
                ?.tasks?.find((t: any) => t.id === taskId)?.title || "task";

        const prev = board.columns;
        board.setColumns(
            board.columns.map((c: any) =>
                c.id === columnId
                    ? { ...c, tasks: (c.tasks || []).filter((t: any) => t.id !== taskId) }
                    : c
            )
        );
        try {
            await deleteTask(String(taskId));
            await createActivity({
                boardId: String(workspaceId),
                user: getCurrentUserName(currentUser),
                action: "deleted task",
                target: taskTitle,
                projectId: String(workspaceId),
            });
        } catch (err: any) {
            board.setColumns(prev); // Revert UI
            throw err;
        }
    };

    const handleMoveTaskApi = async (draggableId: string, destination: any) => {
        try {
            const isTemp =
                String(draggableId).startsWith("temp-") ||
                !/^[a-fA-F0-9]{24}$/.test(String(draggableId));
            if (isTemp) return;

            await updateTask(String(draggableId), {
                columnId: String(destination.droppableId),
                order: destination.index,
                user: getCurrentUserName(currentUser),
            });
            await createActivity({
                boardId: String(workspaceId),
                user: getCurrentUserName(currentUser),
                action: "moved task",
                target: "task",
                projectId: String(workspaceId),
                taskId: String(draggableId),
            });

            if (socket) {
                socket.emit("board-updated", workspaceId);
            }
        } catch (err: any) {
            fetchBoard(); // Revert
            throw err;
        }
    };

    const handleRenameColumnSaveApi = async (colId: string | number) => {
        const title = board.tempColumnTitle;
        board.setEditingColumnId(null);
        if (!title?.trim()) return;
        const prev = board.columns;
        board.setColumns(
            board.columns.map((c: any) => (c.id === colId ? { ...c, title } : c))
        );
        try {
            await updateColumn(String(colId), {
                title,
                user: getCurrentUserName(currentUser),
            });
            await createActivity({
                boardId: String(workspaceId),
                user: getCurrentUserName(currentUser),
                action: "renamed list",
                target: title,
                projectId: String(workspaceId),
            });
            if (socket) socket.emit("board-updated", workspaceId);
        } catch (err) {
            board.setColumns(prev);
            throw err;
        }
    };

    const handleDeleteColumnApi = async (colId: string | number) => {
        const colTitle = board.columns.find((c: any) => c.id === colId)?.title || "list";
        const prev = board.columns;
        board.setColumns(board.columns.filter((c: any) => c.id !== colId));
        try {
            await deleteColumn(String(colId));
            await createActivity({
                boardId: String(workspaceId),
                user: getCurrentUserName(currentUser),
                action: "deleted list",
                target: colTitle,
                projectId: String(workspaceId),
            });
        } catch (err) {
            board.setColumns(prev);
            throw err;
        }
    };

    const handleClearColumnApi = async (colId: string | number) => {
        const colTitle = board.columns.find((c: any) => c.id === colId)?.title || "list";
        const prev = board.columns;
        const column = board.columns.find((c: any) => c.id === colId);
        board.setColumns(
            board.columns.map((c: any) => (c.id === colId ? { ...c, tasks: [] } : c))
        );
        try {
            await Promise.all(
                (column?.tasks || []).map((t: any) => deleteTask(String(t.id)))
            );
            await createActivity({
                boardId: String(workspaceId),
                user: getCurrentUserName(currentUser),
                action: "cleared list",
                target: colTitle,
                projectId: String(workspaceId),
            });
        } catch (err) {
            board.setColumns(prev);
            throw err;
        }
    };

    const handleCreateTaskFromTimeline = async ({
        title,
        startDate,
        duration,
        status,
    }: {
        title: string;
        startDate: string;
        duration: number;
        status: string;
    }) => {
        if (!title?.trim()) return;
        const targetCol =
            board.columns.find((c: any) => c.title === "To Do") || board.columns[0];
        if (!targetCol) return;
        const columnId = targetCol.id;
        try {
            const created = await createTask({
                columnId: String(columnId),
                title,
                dueDate: startDate,
                startDate,
                endDate: new Date(
                    new Date(startDate).getTime() + duration * 24 * 60 * 60 * 1000
                ).toISOString(),
                order: board.columns.find((c: any) => c.id === columnId)?.tasks?.length ?? 0,
                user: getCurrentUserName(currentUser),
            });
            await createActivity({
                boardId: String(workspaceId),
                user: getCurrentUserName(currentUser),
                action: "created task",
                target: created.title,
                projectId: String(workspaceId),
                taskId: created.id,
            });
            await fetchBoard();
            return created;
        } catch (err) {
            console.error("Failed to create task from timeline", err);
            throw err;
        }
    };


    return {
        loading,
        error,
        workspaceInfo,
        members,
        activities,
        labels,
        currentUser,
        isReadOnly,
        notifications,
        setNotifications,
        fetchBoard,
        handleAddTaskApi,
        handleAddColumnApi,
        handleDeleteTaskApi,
        handleMoveTaskApi,
        handleRenameColumnSaveApi,
        handleDeleteColumnApi,
        handleClearColumnApi,
        handleCreateTaskFromTimeline
    };
};
