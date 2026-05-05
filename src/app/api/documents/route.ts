import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  const docs = await prisma.document.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(docs);
}

export async function POST(req: Request) {
  const body = await req.json();

  const title = body.title?.trim() || "Untitled Document";

  const doc = await prisma.document.create({
    data: {
      title,
      content: {},
      ownerId: "user_1",
    },
  });

  return Response.json(doc);
}
