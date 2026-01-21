'use client'

import { useEffect, useState } from 'react'

interface VersionInfo {
    version: string
    buildId: string
    buildTime: string
    nodeEnv: string
    commit: string
}

/**
 * Version Badge Component
 * 
 * แสดง version badge ที่มุมล่างขวาของหน้าจอ
 * ช่วยให้ตรวจสอบได้ว่า production อัพเดตแล้วหรือยัง
 */
export default function VersionBadge() {
    const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Fetch version info
        fetch('/api/version')
            .then(res => res.json())
            .then(data => {
                setVersionInfo(data)
                console.log('🚀 App Version:', data.version)
                console.log('📅 Build Time:', data.buildTime)
                console.log('🔨 Build ID:', data.buildId)
                console.log('💻 Environment:', data.nodeEnv)
                console.log('📝 Commit:', data.commit)
            })
            .catch(err => console.error('Failed to fetch version:', err))
    }, [])

    if (!versionInfo) return null

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {/* Toggle Button */}
            <button
                onClick={() => setIsVisible(!isVisible)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-full text-xs font-mono shadow-lg transition-all duration-200 hover:scale-105"
                title="Click to show version details"
            >
                v{versionInfo.version}
            </button>

            {/* Version Details Popup */}
            {isVisible && (
                <div className="absolute bottom-10 right-0 bg-gray-900 text-white p-4 rounded-lg shadow-2xl min-w-[300px] text-xs font-mono">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-sm">Version Info</h3>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="text-gray-400 hover:text-white"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Version:</span>
                            <span className="text-purple-400">{versionInfo.version}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Build ID:</span>
                            <span className="text-green-400">{versionInfo.buildId}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Environment:</span>
                            <span className={versionInfo.nodeEnv === 'production' ? 'text-red-400' : 'text-yellow-400'}>
                                {versionInfo.nodeEnv}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Commit:</span>
                            <span className="text-blue-400">{versionInfo.commit.substring(0, 7)}</span>
                        </div>
                        <div className="flex flex-col mt-2 pt-2 border-t border-gray-700">
                            <span className="text-gray-400">Build Time:</span>
                            <span className="text-gray-300 text-[10px]">
                                {new Date(versionInfo.buildTime).toLocaleString('th-TH')}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
