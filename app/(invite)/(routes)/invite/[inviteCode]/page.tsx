import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import React from "react";

export type paramsType = Promise<{ inviteCode: string }>;

const InviteCodePage = async (props: { params: paramsType }) => {
  const { inviteCode } = await props.params;
  console.log("InviteCodePage - Starting, inviteCode:", inviteCode);

  const { userId } = await auth();

  console.log("InviteCodePage - userId from auth:", userId);

  if (!userId) {
    console.log("InviteCodePage - No userId, redirecting to sign in");
    return redirect("/sign-in");
  }

  const profile = await currentProfile();

  console.log("InviteCodePage - Profile:", profile);

  if ( profile === null ) {
    console.log("InviteCodePage - No profile found, redirecting to create-profile");
    return redirect("/");
  }

  if (!inviteCode) {
    console.log("InviteCodePage - No inviteCode, redirecting to home");
    return redirect("/");
  }

  const existingServer = await db.server.findFirst({
    where: {
      inviteCode: inviteCode,
      members: {
        some: {
          profileId: profile.id
        }
      }
    }
  });

  if (existingServer) {
    console.log("InviteCodePage - User already a member, redirecting to server");
    return redirect(`/servers/${existingServer.id}`);
  }

  const server = await db.server.update({
    where: {
      inviteCode: inviteCode,
    },
    data: {
      members: {
        create: [
          {
            profileId: profile.id,
          }
        ]
      }
    }
  });

  if (server) {
    console.log("InviteCodePage - Server joined, redirecting to server");
    return redirect(`/servers/${server.id}`);
  }

  console.log("InviteCodePage - Failed to join server, redirecting to home");
  return redirect("/");
};

export default InviteCodePage;