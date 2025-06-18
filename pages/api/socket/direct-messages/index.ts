import { NextApiRequest } from "next";
import { NextApiResponseServerIo } from "@/types";
import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const profile = await currentProfilePages(req);
    const { content } = req.body;
    const { conversationId } = req.query;

    if (!profile) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!content) {
      return res.status(400).json({ error: "Content missing" });
    }

    if (!conversationId) {
      return res.status(400).json({ error: "Conversation ID missing" });
    }

    console.log("Searching for conversation:", conversationId);

    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId as string,
        OR: [
          { memberOneId: profile.id },
          { memberTwoId: profile.id }
        ]
      },
      include: {
        memberOne: true,
        memberTwo: true
      }
    });

    if (!conversation) {
      console.log("Conversation not found");
      return res.status(404).json({ error: "Conversation not found" });
    }

    console.log("Conversation found:", conversation);

    const member = conversation.memberOne.profileId === profile.id
      ? conversation.memberOne
      : conversation.memberTwo;

    const message = await db.directMessage.create({
      data: {
        content,
        conversationId: conversationId as string,
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

    const channelKey = `chat:${conversationId}:messages`;

    res?.socket?.server?.io?.emit(channelKey, message);

    return res.status(200).json(message);
  } catch (error) {
    console.log("[DIRECT_MESSAGES_POST]", error);
    return res.status(500).json({ error: "Internal Error" });
  }
}