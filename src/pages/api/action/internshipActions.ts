'use server'

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

// 1. ดึงข้อมูล
export async function getPositions() {
  try {
    return await prisma.internshipPosition.findMany({
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    return [];
  }
}

// 2. เพิ่มข้อมูล
export async function createPosition(title: string, description: string) {
  try {
    await prisma.internshipPosition.create({
      data: { title, description, isOpen: true }
    });
    revalidatePath('/'); 
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to create' };
  }
}

// 3. แก้ไขข้อมูล (เพิ่มตัวนี้)
export async function updatePosition(id: string, title: string, description: string) {
  try {
    await prisma.internshipPosition.update({
      where: { id },
      data: { title, description }
    });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update' };
  }
}

// 4. ลบข้อมูล
export async function deletePosition(id: string) {
  try {
    await prisma.internshipPosition.delete({
      where: { id }
    });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete' };
  }
}