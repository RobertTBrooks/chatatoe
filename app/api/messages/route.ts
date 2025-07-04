import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { Message } from "@/lib/generated/prisma/client";
import { NextResponse } from "next/server";

const MESSAGES_BATCH = 15;


export async function GET(req: Request): Promise<NextResponse> {
    try {
        const profile = await currentProfile();
        const { searchParams } = new URL(req.url);

        const cursor = searchParams.get("cursor");
        const channelId = searchParams.get("channelId");

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!channelId) {
            return new NextResponse("Channel ID missing or not found", { status: 400 });
        }

        let messages: Message[] = [];

        if (cursor) {
            messages = await db.message.findMany({
                take: MESSAGES_BATCH,
                skip: 1,
                cursor: {
                    id: cursor,
                },
                where: {
                    channelId,
                },
                include: {
                    member: {
                        include: {
                            profile: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
        } else {
            messages = await db.message.findMany({
                take: MESSAGES_BATCH,
                where: {
                    channelId,
                },
                include: {
                    member: {
                        include: {
                            profile: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
        }

        let nextCursor = null;

        if (messages.length === MESSAGES_BATCH) {
            nextCursor = messages[MESSAGES_BATCH - 1].id;
        }

        return NextResponse.json({
            items: messages,
            nextCursor,
        });
    } catch (error) {
        console.log("[MESSAGES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request): Promise<NextResponse> {
    try {
        const profile = await currentProfile();
        const { content } = await req.json();
        const { searchParams } = new URL(req.url);

        const channelId = searchParams.get("channelId");
        const serverId = searchParams.get("serverId");

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!channelId) {
            return new NextResponse("Channel ID missing", { status: 400 });
        }

        if (!serverId) {
            return new NextResponse("Server ID missing", { status: 400 });
        }

        if (!content) {
            return new NextResponse("Content missing", { status: 400 });
        }

        const server = await db.server.findFirst({
            where: {
                id: serverId,
                members: {
                    some: {
                        profileId: profile.id
                    }
                }
            },
            include: {
                members: true
            }
        });

        if (!server) {
            return new NextResponse("Server not found", { status: 404 });
        }

        const member = server.members.find((member) => member.profileId === profile.id);

        if (!member) {
            return new NextResponse("Member not found", { status: 404 });
        }

        const message = await db.message.create({
            data: {
                content,
                channelId,
                memberId: member.id,
            },
            include: {
                member: {
                    include: {
                        profile: true
                    }
                }
            }
        });

        return NextResponse.json(message);
    } catch (error) {
        console.log("[MESSAGES_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
