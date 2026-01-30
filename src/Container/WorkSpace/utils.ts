export const getLabelColors = (
    tag: string,
    tagColor?: string,
    currentLabels: any[] = []
) => {
    const labelData = currentLabels.find((l) => l.name === tag);
    if (labelData) {
        const baseColor = labelData.color || "slate";
        return `${labelData.bgColor} ${labelData.textColor} border-${baseColor}-200/50`;
    }
    const color = tagColor || "slate";
    const mapping: Record<string, string> = {
        red: "bg-red-50 text-red-600 border-red-100",
        orange: "bg-orange-50 text-orange-600 border-orange-100",
        yellow: "bg-amber-50 text-amber-600 border-amber-100",
        green: "bg-emerald-50 text-emerald-600 border-emerald-100",
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        purple: "bg-purple-50 text-purple-600 border-purple-100",
        slate: "bg-slate-50 text-slate-600 border-slate-100",
        gray: "bg-gray-50 text-gray-600 border-gray-100",
    };
    return mapping[color] || mapping.slate;
};

export const mapApiTaskToWorkspaceTask = (
    task: any,
    currentLabels: any[] = [],
    columnTitle: string | undefined,
    members: any[] = []
) => {
    let dateLabel = "No date";
    try {
        const start = task.startDate
            ? new Date(task.startDate)
            : task.dueDate
                ? new Date(task.dueDate)
                : null;
        const end = task.endDate ? new Date(task.endDate) : null;
        if (start && end) {
            const s = start.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });
            const e = end.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });
            dateLabel = `${s} - ${e}`;
        } else if (start) {
            dateLabel = start.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });
        }
    } catch (e) {
        dateLabel = task.dueDate || "No date";
    }

    return {
        id: task.id,
        title: task.title,
        tag: task.tag || "General",
        tagColor: getLabelColors(task.tag, task.tagColor, currentLabels),
        priority: task.priority || "Medium",
        status: columnTitle || task.column?.title || "To Do",
        rawDueDate: task.dueDate,
        assignees: task.assignees,
        memberIds: task.assignees?.map((a: any) => a.userId || a.user?.id),
        members:
            task.assignees?.map((a: any) => {
                const userId = a.userId || a.user?.id;
                // Try to find full member info from the board's member list
                const found = members.find((m: any) => m.userId === userId);
                if (found) {
                    return {
                        id: found.id,
                        name: found.name,
                        avatar: found.avatar,
                        userAvatar: found.userAvatar, // Add user's profile picture URL
                        role: found.role,
                        color: found.color,
                    };
                }
                // Fallback if not found in board list (e.g. valid user but not in board?)
                return {
                    id: userId,
                    name: a?.user?.name || "Unknown",
                    avatar: a?.user?.avatar,
                    userAvatar: a?.user?.avatar, // Fallback to user avatar
                    color: "bg-slate-100",
                };
            }) || [],
        comments: task.comments || 0,
        attachments: task.attachments || 0,
        date: dateLabel,
    };
};

export const getCurrentUserName = (currentUser: any) => {
    if (currentUser?.name) return currentUser.name;
    if (typeof window !== "undefined") {
        const u = localStorage.getItem("user");
        if (u) {
            try {
                return JSON.parse(u).name;
            } catch (e) { }
        }
    }
    return "Someone";
};
