import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@/lib/generated/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();
    const { name, type } = await req.json();
    const { searchParams } = new URL(req.url);

    const serverId = searchParams.get("serverId");

    if (!profile) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    if (!serverId) {
      return new NextResponse(JSON.stringify({ error: "Server ID missing or not found" }), { status: 400 });
    }

    if (name.toLowerCase() === "general") {
      return new NextResponse(JSON.stringify({ error: "Name cannot be 'general'" }), { status: 400 });
    }

    // Check for existing channel with the same name (case-insensitive)
    const existingChannel = await db.channel.findFirst({
      where: {
        name: {
          equals: name.toLowerCase(),          
        },
        serverId: serverId
      }
    });

    if (existingChannel) {
      return new NextResponse(JSON.stringify({ error: "A channel with this name already exists" }), { status: 400 });
    }

    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR]
            }
          }
        }
      },
      data: {
        channels: {
          create: {
            profileId: profile.id,
            name,
            type,
          },
        },
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log("CHANNELS_POST", error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}