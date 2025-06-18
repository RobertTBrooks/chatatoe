import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export type paramsType = Promise<{ serverId: string }>;

export async function PATCH(
    req: Request,
    { params }: { params: paramsType }
) {
    try {
        const profile = await currentProfile();
        const { searchParams } = new URL(req.url);

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        
        const { serverId } = await params;

        if (!serverId) {
            return new NextResponse("Server ID missing or not found", {status: 400});
        }

        const server = await db.server.update({
            where: {
                id: serverId,
                profileId: {
                    not: profile.id
                },
                members: {
                    some: {
                        profileId: profile.id
                    }
                }
            },
            data: {
                members: {
                    deleteMany: {
                        profileId: profile.id,
                    }
                }
            }
        });

        return NextResponse.json(server);
        
    } catch (error) {
        console.log("[SERVER_ID_LEAVE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

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