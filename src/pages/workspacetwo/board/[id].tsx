import React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import Layouts from '@/components/Layouts';

const WorkspaceBoard = dynamic(
    () => import('@/Container/WorkSpace/WorkspaceBoard'),
    { ssr: false }
);

export default function BoardPage() {
    const router = useRouter();
    const { id } = router.query;

    return (
        <Layouts>
            <div className="h-[calc(100vh-64px)]">
                {id && <WorkspaceBoard workspaceId={id as string} />}
            </div>
        </Layouts>
    );
}
