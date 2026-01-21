import { NextApiRequest, NextApiResponse } from 'next'

/**
 * Version API Endpoint
 * 
 * Returns current deployment version information
 * 
 * Usage:
 * - Localhost: http://localhost:3000/api/version
 * - Production: http://49.231.43.177:7077/api/version
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const versionInfo = {
        version: '2.5.0',
        buildId: process.env.BUILD_ID || process.env.NEXT_PUBLIC_BUILD_ID || 'local',
        buildTime: process.env.BUILD_TIME || process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString(),
        nodeEnv: process.env.NODE_ENV || 'development',
        commit: process.env.COMMIT_SHA || process.env.NEXT_PUBLIC_COMMIT_SHA || 'unknown',
        deployedAt: process.env.DEPLOY_TIME || 'unknown',
    }

    // Add CORS headers for external access
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET')
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')

    res.status(200).json(versionInfo)
}
