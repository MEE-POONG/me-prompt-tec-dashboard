import React from "react";

interface ProjectSkeletonProps {
    viewType: "grid" | "list";
}

export const ProjectSkeleton: React.FC<ProjectSkeletonProps> = ({ viewType }) => {
    return (
        <div
            className={`bg-white p-5 rounded-2xl border border-gray-100 shadow-sm animate-pulse ${viewType === "grid"
                    ? "flex flex-col h-[220px]"
                    : "flex flex-row items-center gap-6 h-[100px]"
                }`}
        >
            {viewType === "grid" ? (
                <>
                    <div className="flex justify-between items-start mb-4">
                        <div className="h-6 bg-gray-200 rounded-md w-3/4"></div>
                        <div className="h-5 bg-gray-100 rounded-full w-16"></div>
                    </div>
                    <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-100 rounded w-2/3 mb-6"></div>
                    <div className="h-10 w-10 bg-gray-100 rounded-xl mb-4"></div>
                    <div className="h-1.5 bg-gray-100 rounded-full w-full mt-auto"></div>
                </>
            ) : (
                <>
                    <div className="h-12 w-12 bg-gray-100 rounded-xl shrink-0"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full w-24 ml-auto"></div>
                </>
            )}
        </div>
    );
};
