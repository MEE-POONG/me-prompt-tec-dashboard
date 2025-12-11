import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  const { projectId } = req.query; // Or body, depending on request type

  if (!projectId && method === "GET") {
    return res.status(400).json({ error: "Project ID is required" });
  }

  switch (method) {
    case "GET":
      try {
        const columns = await prisma.taskColumn.findMany({
          where: { projectId: projectId as string },
          include: {
            tasks: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        });
        res.status(200).json(columns);
      } catch (error) {
        console.error("Error fetching board:", error);
        res.status(500).json({ error: "Failed to fetch board data" });
      }
      break;

    case "POST":
      try {
        const { title, projectId: pid, color } = req.body;
        // Logic to create a new column
        const count = await prisma.taskColumn.count({
          where: { projectId: pid },
        });
        const newColumn = await prisma.taskColumn.create({
          data: {
            title,
            projectId: pid,
            order: count,
            color: color || "bg-gray-100",
          },
          include: { tasks: true }, // Return empty tasks array for consistency
        });
        res.status(201).json(newColumn);
      } catch (error) {
        console.error("Error creating column:", error);
        res.status(500).json({ error: "Failed to create column" });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
