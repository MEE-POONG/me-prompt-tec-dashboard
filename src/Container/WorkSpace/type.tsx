export interface Project {
    id: string;
    name: string;
    description: string;
    color: string;
    createdAt: string;
    updatedAt?: string;
    visibility?: "PRIVATE" | "PUBLIC";
    members?: any[]; // Ideally refine this 'any' with a Member interface if possible
    columns?: {
        tasks: { isDone: boolean }[];
    }[];
}

export interface WorkListProps {
    viewType?: "grid" | "list";
    searchItem?: string;
}
