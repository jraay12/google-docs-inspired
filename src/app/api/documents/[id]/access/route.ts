import { prisma } from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const access = await prisma.documentAccess.findMany({
    where: { documentId: id },
  });

  return NextResponse.json(access);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json(); // [{ userId, role }]

  await prisma.$transaction([
    prisma.documentAccess.deleteMany({
      where: { documentId: id },
    }),
    prisma.documentAccess.createMany({
      data: body.map((entry: { userId: string; role: string }) => ({
        documentId: id,
        userId: entry.userId,
        role: entry.role,
      })),
    }),
  ]);

  return NextResponse.json({ ok: true });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { userId, role } = body;

  if (!userId || !role) {
    return NextResponse.json(
      { error: "Missing userId or role" },
      { status: 400 }
    );
  }

  const access = await prisma.documentAccess.create({
    data: { documentId: id, userId, role },
  });

  return NextResponse.json(access);
}