import { prisma } from "@/src/lib/prisma";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const doc = await prisma.document.findUnique({
    where: { id },
  });

  return Response.json(doc);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const updated = await prisma.document.update({
    where: { id },
    data: {
      title: body.title ?? undefined,
      content:
        typeof body.content === "string"
          ? body.content
          : body.content ?? "",
    },
  });

  return Response.json(updated);
}