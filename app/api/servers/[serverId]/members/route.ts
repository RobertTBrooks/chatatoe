import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export type paramsType = Promise<{ serverId: string }>;

export async function GET(
  req: Request,
  { params }: { params: paramsType }
) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { serverId } = await params;

    const members = await db.member.findMany({
      where: {
        serverId: serverId,
      },
      include: {
        profile: true,
      },
      orderBy: {
        role: 'asc',
      },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("MEMBERS_GET_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}