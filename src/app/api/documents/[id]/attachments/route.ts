import { prisma } from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const attachment = await prisma.attachment.create({
    data: {
      documentId: id,
      fileName: file.name,
      fileType: file.type,
      content: buffer,
    },
  });

  return NextResponse.json(attachment);
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const attachments = await prisma.attachment.findMany({
    where: { documentId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(attachments);
}