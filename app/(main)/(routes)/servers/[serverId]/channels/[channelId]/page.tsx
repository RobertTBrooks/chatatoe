import { ChatHeader } from '@/components/chat/chat-header';
import { ChatInput } from '@/components/chat/chat-input';
import { ChatMessages } from '@/components/chat/chat-messages';
import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { RedirectToSignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import React from 'react'

export type paramsType = Promise<{ serverId: string; channelId: string }>;

const ChannelIdPage = async (props: { params: paramsType }) => {
  const profile = await currentProfile();

  if (!profile) {
    return <RedirectToSignIn />
  }

  const { channelId, serverId } = await props.params;

  const channel = await db.channel.findUnique({
    where: {
      id: channelId,
    },
  });

  const member = await db.member.findFirst({
    where: {
      serverId: serverId,
      profileId: profile.id,
    }
  });

  if (!channel || !member) {
    redirect("/");
  }

  return (
    <div
    className='bg-[#313338] flex flex-col h-full'>
      <ChatHeader
        serverId={channel.serverId}
        name={channel.name}
        type="channel"
      />
      <ChatMessages
        member={member}
        name={channel.name}
        chatId={channel.id}
        apiUrl="/api/messages"
        socketUrl="/api/socket/messages"
        type="channel"
        socketQuery={{
          channelId: channel.id,
          serverId: channel.serverId,
        }}
        paramKey="channelId"
        paramValue={channel.id}
      />
      <ChatInput
        apiUrl="/api/messages"
        query={{ channelId: channel.id, serverId: channel.serverId }}
        name={channel.name}
        type="channel"
      />
    </div>
  )
}

export default ChannelIdPage