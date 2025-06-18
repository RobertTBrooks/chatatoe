import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { RedirectToSignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import React from 'react'

export type paramsType = Promise<{ serverId: string }>;

const ServerIdPage = async (props: { params: paramsType }) => {
  const profile = await currentProfile();

  if (!profile) {
    return <RedirectToSignIn />
  }

  const { serverId } = await props.params;

  const server = await db.server.findUnique({
    where: {
      id: serverId,
      members: {
        some: {
          profileId: profile.id,
        }
      }
    },
    include: {
      channels: {
        where: {
          name: "general"
        },
        orderBy: {
          createdAt: "asc"
        }
      }
    }
  });

  const initialChannel = server?.channels[0];

  if (initialChannel?.name !== "general") {
    return null;
  }

  return redirect(`/servers/${serverId}/channels/${initialChannel?.id}`)
}

export default ServerIdPage