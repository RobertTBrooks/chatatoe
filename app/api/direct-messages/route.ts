import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { DirectMessage } from "@/lib/generated/prisma/client";
import { NextResponse } from "next/server";

const MESSAGES_BATCH = 15;

export async function GET(req: Request): Promise<NextResponse> {
    try {
        const profile = await currentProfile();
        const { searchParams } = new URL(req.url);

        const cursor = searchParams.get("cursor");
        const conversationId = searchParams.get("conversationId");

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!conversationId) {
            return new NextResponse("Conversation ID missing", { status: 400 });
        }

        // Get all members associated with the current profile
        const members = await db.member.findMany({
            where: { profileId: profile.id },
        });

        if (members.length === 0) {
            return new NextResponse("No members found for this profile", { status: 404 });
        }

        // Check if the conversation exists and if the current profile is part of it
        const conversation = await db.conversation.findFirst({
            where: {
                id: conversationId,
                OR: [
                    { memberOneId: { in: members.map(m => m.id) } },
                    { memberTwoId: { in: members.map(m => m.id) } }
                ]
            },
            include: {
                memberOne: true,
                memberTwo: true
            }
        });

        if (!conversation) {
            return new NextResponse("Conversation not found or unauthorized", { status: 404 });
        }

        // Fetch messages
        let messages: DirectMessage[] = [];

        if (cursor) {
            messages = await db.directMessage.findMany({
                take: MESSAGES_BATCH,
                skip: 1,
                cursor: {
                    id: cursor,
                },
                where: {
                    conversationId,
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
            messages = await db.directMessage.findMany({
                take: MESSAGES_BATCH,
                where: {
                    conversationId,
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
        console.log("[DIRECT_MESSAGES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request): Promise<NextResponse> {
    try {
        const profile = await currentProfile();
        const { content } = await req.json();
        const { searchParams } = new URL(req.url);

        const conversationId = searchParams.get("conversationId");

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!conversationId) {
            return new NextResponse("Conversation ID missing", { status: 400 });
        }

        if (!content) {
            return new NextResponse("Content missing", { status: 400 });
        }

        // Get all members associated with the current profile
        const members = await db.member.findMany({
            where: { profileId: profile.id },
        });

        if (members.length === 0) {
            return new NextResponse("No members found for this profile", { status: 404 });
        }

        // Check if the conversation exists and if the current profile is part of it
        const conversation = await db.conversation.findFirst({
            where: {
                id: conversationId,
                OR: [
                    { memberOneId: { in: members.map(m => m.id) } },
                    { memberTwoId: { in: members.map(m => m.id) } }
                ]
            },
            include: {
                memberOne: true,
                memberTwo: true
            }
        });

        if (!conversation) {
            return new NextResponse("Conversation not found or unauthorized", { status: 404 });
        }

        // Find the correct member for this conversation
        const member = members.find(m => 
            m.id === conversation.memberOneId || m.id === conversation.memberTwoId
        );

        if (!member) {
            return new NextResponse("Member not found for this conversation", { status: 404 });
        }

        const message = await db.directMessage.create({
            data: {
                content,
                conversationId,
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
        console.log("[DIRECT_MESSAGES_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}