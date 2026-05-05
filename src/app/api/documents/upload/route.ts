import { prisma } from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();

  const file = formData.get("file") as File | null;
  const ownerId = formData.get("ownerId") as string | null;

  if (!file || !ownerId) {
    return NextResponse.json(
      { error: "Missing file or ownerId" },
      { status: 400 }
    );
  }

  const text = await file.text();

  const doc = await prisma.document.create({
    data: {
      title: file.name.replace(/\.[^/.]+$/, ""),
      content: text, 
      ownerId,
    },
  });

  return NextResponse.json(doc);
}