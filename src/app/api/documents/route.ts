import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const docs = await prisma.document.findMany({
    where: {
      OR: [
        { ownerId: userId },
        {
          sharedWith: {
            some: {
              userId,
            },
          },
        },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(docs);
}

export async function POST(req: Request) {
  const body = await req.json();
  const ownerId = body.ownerId;
  const title = body.title?.trim() || "Untitled Document";

  const doc = await prisma.document.create({
    data: {
      title,
      content: {},
      ownerId,
    },
  });

  return Response.json(doc);
}
