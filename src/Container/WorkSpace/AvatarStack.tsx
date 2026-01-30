import React from "react";

interface AvatarStackProps {
    members: any[];
}

export const AvatarStack: React.FC<AvatarStackProps> = ({ members }) => {
    const limit = 3;
    const displayMembers = (members || []).slice(0, limit);
    const remaining = (members || []).length - limit;

    return (
        <div className="flex -space-x-2 overflow-hidden">
            {displayMembers.map((member, i) => (
                <div
                    key={i}
                    className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-blue-50 relative"
                    title={member.name}
                >
                    {member.avatar ? (
                        <img
                            src={member.avatar}
                            alt={member.name}
                            className="h-full w-full rounded-full object-cover"
                        />
                    ) : (
                        <div className="h-full w-full rounded-full flex items-center justify-center text-[10px] font-bold text-blue-600">
                            {(member.name || "M").charAt(0)}
                        </div>
                    )}
                </div>
            ))}
            {remaining > 0 && (
                <div className="flex items-center justify-center h-7 w-7 rounded-full ring-2 ring-white bg-gray-100 text-[10px] font-bold text-gray-600">
                    +{remaining}
                </div>
            )}
        </div>
    );
};
