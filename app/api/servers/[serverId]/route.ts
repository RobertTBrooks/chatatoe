import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export type paramsType = Promise<{ serverId: string }>;

export async function PATCH(
  req: Request,
  { params }: { params: paramsType }
) {
  try {
    const { serverId } = await params;

    const { name, imageUrl } = await req.json();
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const server = await db.server.update({
      where: {
        id: serverId,
        profileId: profile.id,
      },
      data: {
        name,
        imageUrl,
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log("SERVER_UPDATE_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}