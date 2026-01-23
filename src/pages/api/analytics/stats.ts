import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { period = "30" } = req.query;
        const days = parseInt(period as string);

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get total views in period
        const totalViews = await prisma.pageviews.count({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });

        // Get unique visitors (unique sessionIds)
        const uniqueVisitors = await prisma.pageviews.groupBy({
            by: ["sessionId"],
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });

        // Get views by day
        const viewsByDay = await prisma.pageviews.groupBy({
            by: ["createdAt"],
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            _count: {
                id: true,
            },
        });

        // Process daily data
        const dailyStats = viewsByDay.reduce((acc: Record<string, number>, item: any) => {
            const date = new Date(item.createdAt).toISOString().split("T")[0];
            if (!acc[date]) {
                acc[date] = 0;
            }
            acc[date] += item._count.id;
            return acc;
        }, {});

        // Get top pages
        const topPages = await prisma.pageviews.groupBy({
            by: ["page"],
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            _count: {
                id: true,
            },
            orderBy: {
                _count: {
                    id: "desc",
                },
            },
            take: 10,
        });

        // Calculate growth (compare with previous period)
        const previousStartDate = new Date(startDate);
        previousStartDate.setDate(previousStartDate.getDate() - days);

        const previousViews = await prisma.pageviews.count({
            where: {
                createdAt: {
                    gte: previousStartDate,
                    lt: startDate,
                },
            },
        });

        const growth =
            previousViews > 0
                ? ((totalViews - previousViews) / previousViews) * 100
                : 0;

        return res.status(200).json({
            totalViews,
            uniqueVisitors: uniqueVisitors.length,
            viewsByDay: Object.entries(dailyStats).map(([date, count]) => ({
                date,
                count,
            })),
            topPages: topPages.map((p: any) => ({
                page: p.page,
                views: p._count.id,
            })),
            growth: growth.toFixed(1),
            period: days,
        });
    } catch (error) {
        console.error("Analytics stats error:", error);
        // Return empty data instead of error to prevent UI crash
        return res.status(200).json({
            totalViews: 0,
            uniqueVisitors: 0,
            viewsByDay: [],
            topPages: [],
            growth: '0',
            period: parseInt(req.query.period as string || "30"),
        });
    }
}
