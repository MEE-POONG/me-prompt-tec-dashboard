import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/mailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      name,
      email,
      phone,
      subject,
      message,
      source,
      status,
      resumeUrl,
      portfolioUrl,
      handledById
    } = req.body;

    const newMessage = await prisma.contactMessage.create({
      data: {
        name: name ?? "ไม่ระบุ",
        email: email ?? "",
        phone: phone ?? "",
        subject: subject ?? "ใบสมัครงาน",
        message: message ?? "",
        source: source ?? "website",
        status: status ?? "new",
        date: new Date(),
        resumeUrl: resumeUrl ?? undefined,
        portfolioUrl: portfolioUrl ?? undefined,
        handledById: handledById ?? undefined,
        isStarred: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Send email notification to Admin
    try {
      const emailSubject = `New Contact Request: ${subject}`;
      const emailBody = `
        <h3>Me-Prompt-Tec: New Contact Message</h3>
        <p><strong>Name:</strong> ${name || "ไม่ระบุ"}</p>
        <p><strong>Email:</strong> ${email || "-"}</p>
        <p><strong>Phone:</strong> ${phone || "-"}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong><br/>${message}</p>
        <p><strong>Source:</strong> ${source}</p>
        <hr/>
        <p>Date: ${new Date().toLocaleString()}</p>
      `;

      await sendEmail({
        to: process.env.MAIL_USER || "", // Send to Admin
        subject: emailSubject,
        html: emailBody,
      });
      console.log("Email notification sent to admin");
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
      // Create succeeded, so we don't return error
    }

    return res.status(201).json(newMessage);
  } catch (error) {
    console.error("Create Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}